#!/bin/bash

# =============================================================================
# RALPH LOOP v2 — Self-Healing Autonomous Development
# Two modes: --spec (FEATURES.md) and --linear (Linear issues)
# =============================================================================

set -euo pipefail

# --- Configuration ---
MODE="spec"
MAX_ITERATIONS=100
SLEEP_BETWEEN=5
ITERATION_TIMEOUT=7200  # 2 hours per iteration
PROJECT_DIR="."

# --- Parse args ---
while [[ $# -gt 0 ]]; do
    case $1 in
        --spec)    MODE="spec"; shift ;;
        --linear)  MODE="linear"; shift ;;
        --max)     MAX_ITERATIONS="$2"; shift 2 ;;
        --timeout) ITERATION_TIMEOUT="$2"; shift 2 ;;
        --sleep)   SLEEP_BETWEEN="$2"; shift 2 ;;
        --dir)     PROJECT_DIR="$2"; shift 2 ;;
        -h|--help)
            echo "Usage: ralph-loop.sh [OPTIONS] [PROJECT_DIR]"
            echo ""
            echo "Modes:"
            echo "  --spec      Use FEATURES.md as source of truth (default)"
            echo "  --linear    Use Linear issues as source of truth"
            echo ""
            echo "Options:"
            echo "  --max N         Max iterations (default: 100)"
            echo "  --timeout N     Seconds per iteration (default: 7200)"
            echo "  --sleep N       Seconds between iterations (default: 5)"
            echo "  --dir PATH      Project directory (default: .)"
            echo ""
            exit 0
            ;;
        *) PROJECT_DIR="$1"; shift ;;
    esac
done

# --- Colors ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

# --- File paths ---
STATUS_FILE="$PROJECT_DIR/RALPH_STATUS.md"
PROGRESS_FILE="$PROJECT_DIR/claude-progress.md"
LOG_DIR="$PROJECT_DIR/.ralph"
mkdir -p "$LOG_DIR"

# --- Counters ---
ITERATION=0
NO_CHANGE_COUNT=0
LAST_FILE_HASH=""
START_TIME=$(date +%s)

# --- Helpers ---

elapsed_since() {
    local start=$1
    local now=$(date +%s)
    local diff=$((now - start))
    printf "%dm%02ds" $((diff / 60)) $((diff % 60))
}

count_features() {
    local file="$PROJECT_DIR/FEATURES.md"
    if [ ! -f "$file" ]; then
        echo "?/?"
        return
    fi
    local total
    total=$(grep -c '\- \[.\]' "$file" 2>/dev/null) || total=0
    local done
    done=$(grep -c '\- \[x\]' "$file" 2>/dev/null) || done=0
    echo "$done/$total"
}

print_progress_bar() {
    local file="$PROJECT_DIR/FEATURES.md"
    if [ ! -f "$file" ]; then return; fi

    local total
    total=$(grep -c '\- \[.\]' "$file" 2>/dev/null) || total=0
    local done
    done=$(grep -c '\- \[x\]' "$file" 2>/dev/null) || done=0
    if [ "$total" -eq 0 ]; then return; fi

    local pct=$((done * 100 / total))
    local filled=$((pct / 5))
    local empty=$((20 - filled))

    printf "  ${BLUE}["
    for i in $(seq 1 $filled 2>/dev/null); do printf "#"; done
    for i in $(seq 1 $empty 2>/dev/null); do printf "."; done
    printf "]${NC} %d%% (%d/%d features)\n" "$pct" "$done" "$total"
}

check_build_between_iterations() {
    echo -e "${DIM}  Running build check...${NC}"
    local build_output
    build_output=$(cd "$PROJECT_DIR" && pnpm build 2>&1)
    local build_exit=$?

    if [ $build_exit -ne 0 ]; then
        echo -e "  ${RED}Build FAILED${NC} — will be fixed in next iteration"
        # Save build errors to a file for next iteration
        echo "$build_output" | tail -30 > "$LOG_DIR/last-build-errors.txt"
        return 1
    else
        echo -e "  ${GREEN}Build OK${NC}"
        rm -f "$LOG_DIR/last-build-errors.txt"
        return 0
    fi
}

print_iteration_summary() {
    local iter_start=$1
    local log_file=$2
    local duration=$(elapsed_since "$iter_start")

    echo ""
    echo -e "${DIM}+---------------------------------------------${NC}"
    echo -e "${DIM}|${NC} ${BOLD}Iteration $ITERATION summary${NC}"
    echo -e "${DIM}|${NC} Duration: $duration"

    # Files changed since last commit
    local changed_count
    changed_count=$(cd "$PROJECT_DIR" && git diff --name-only HEAD 2>/dev/null | wc -l | tr -d ' ')

    if [ "$changed_count" -gt 0 ]; then
        echo -e "${DIM}|${NC} Files modified: $changed_count"
        cd "$PROJECT_DIR" && git diff --name-only HEAD 2>/dev/null | head -10 | while read -r f; do
            echo -e "${DIM}|${NC}   ${GREEN}+${NC} $f"
        done
        if [ "$changed_count" -gt 10 ]; then
            echo -e "${DIM}|${NC}   ... and $((changed_count - 10)) more"
        fi
    else
        echo -e "${DIM}|${NC} ${YELLOW}No files modified${NC}"
    fi

    # Recent commits
    local new_commits
    new_commits=$(cd "$PROJECT_DIR" && git log --oneline -5 2>/dev/null | head -5)
    if [ -n "$new_commits" ]; then
        echo -e "${DIM}|${NC} Recent commits:"
        echo "$new_commits" | while read -r c; do
            echo -e "${DIM}|${NC}   ${BLUE}*${NC} $c"
        done
    fi

    echo -e "${DIM}|${NC}"
    echo -ne "${DIM}|${NC} Progress: "
    echo "$(count_features) features"
    print_progress_bar
    echo -e "${DIM}+---------------------------------------------${NC}"
}

# --- Build the prompt based on mode ---

build_spec_prompt() {
    local build_errors=""
    if [ -f "$LOG_DIR/last-build-errors.txt" ]; then
        build_errors=$(cat "$LOG_DIR/last-build-errors.txt")
    fi

    cat <<PROMPT
Tu es le Lead Coordinator d'une equipe Agent Teams autonome.
Mode: SPEC (FEATURES.md)

## ETAPE 1 — Contexte

1. Lis \`claude-progress.md\` (s'il existe) pour savoir ou en est le projet
2. Lis \`FEATURES.md\` pour voir les features a implementer (marquees [ ])
3. Lis \`CLAUDE.md\` pour comprendre les conventions du repo
4. Lis \`.claude/resources/impulse-repos.md\` pour les repos de reference

$([ -n "$build_errors" ] && echo "## ERREURS DE BUILD A CORRIGER EN PRIORITE
Le build a echoue a la derniere iteration. Corrige ces erreurs AVANT de commencer une nouvelle feature:
\`\`\`
$build_errors
\`\`\`
Envoie le qa-fixer pour corriger ces erreurs en premier.
")

## ETAPE 2 — Workflow par feature

Pour CHAQUE feature TODO dans FEATURES.md:

1. **Cree les taches** avec TaskCreate:
   - [Backend] schema + validators + router
   - [Frontend] pages + composants + hooks
   - [Review] verification + build

2. **Delegue aux agents** via SendMessage:
   - \`backend-dev\`: schema DB, validators Zod, router oRPC
   - \`frontend-dev\`: pages, composants AlignUI, hooks
   - \`code-reviewer\`: review qualite + pnpm build
   - \`qa-fixer\`: correction des erreurs si le reviewer en trouve

3. **Self-healing**: Si le build echoue apres une feature:
   - Envoie \`qa-fixer\` avec les erreurs de build
   - Attends la correction
   - Relance pnpm build
   - Repete jusqu'a ce que le build passe

4. **Marque la feature [x]** dans FEATURES.md quand elle est validee
5. **Commit** les changements

## ETAPE 3 — Memoire

Mets a jour \`claude-progress.md\` apres chaque feature:
- Features completees avec details
- Feature en cours
- Features restantes
- Problemes rencontres et solutions
- Decisions techniques

## ETAPE 4 — Exit

- Quand TOUTES les features sont [x]: ecris \`EXIT_SIGNAL: true\` dans RALPH_STATUS.md
- Si bloque sans solution: ecris \`BLOCKED: <raison>\` dans RALPH_STATUS.md

## Regles

- Tu ne codes JAMAIS — tu orchestres uniquement
- Respecte le file ownership entre agents
- Parallelise les features independantes
- Chaque feature DOIT passer pnpm build
- Genere les migrations DB: pnpm db:generate avant le build final
- Fais des commits reguliers (un par feature minimum)

Commence maintenant!
PROMPT
}

build_linear_prompt() {
    local build_errors=""
    if [ -f "$LOG_DIR/last-build-errors.txt" ]; then
        build_errors=$(cat "$LOG_DIR/last-build-errors.txt")
    fi

    cat <<PROMPT
Tu es le Lead Coordinator d'une equipe Agent Teams autonome.
Mode: LINEAR — Fetch issues, implement, commit avec references Linear.
PAS de fichier intermediaire (pas de FEATURES.md). Tu travailles directement depuis Linear.

## ETAPE 1 — Contexte

1. Lis \`claude-progress.md\` (s'il existe) pour savoir ou en est le projet
2. **Fetch les issues** via MCP Linear (status != Done, status != Cancelled)
3. Lis \`CLAUDE.md\` pour comprendre les conventions du repo
4. Lis \`.claude/resources/impulse-repos.md\` pour les repos de reference

$([ -n "$build_errors" ] && echo "## ERREURS DE BUILD A CORRIGER EN PRIORITE
Le build a echoue a la derniere iteration. Corrige ces erreurs AVANT de commencer une nouvelle issue:
\`\`\`
$build_errors
\`\`\`
Envoie le qa-fixer pour corriger ces erreurs en premier.
")

## ETAPE 2 — Implementation directe (par issue, priorite decroissante)

Pour CHAQUE issue Linear non encore traitee (verifie claude-progress.md):

### 2.1 — Mets l'issue "In Progress" sur Linear via MCP

### 2.2 — Delegue aux agents via SendMessage:
- \`backend-dev\`: schema DB, validators Zod, router oRPC
  Description: {titre + description de l'issue Linear}
- \`frontend-dev\`: pages, composants AlignUI, hooks
  Description: {titre + description de l'issue Linear}
  Template Impulse: {le plus pertinent pour cette issue}
- \`code-reviewer\`: review qualite + pnpm build + pnpm checks
  Donne des instructions de correction PRECISES si problemes

### 2.3 — Self-healing
Si le code-reviewer rapporte CHANGES_REQUESTED:
- Envoie \`qa-fixer\` avec les instructions de correction
- Re-review. Max 3 cycles.

### 2.4 — Commit avec reference Linear
```
git commit -m "feat(LIN-XX): {titre de l'issue}

{resume court de l'implementation}

Resolves: LIN-XX"
```

### 2.5 — Mets a jour Linear via MCP
- Status: Done
- Commentaire: "Implemented by Claude Code: {resume}"

### 2.6 — Passe a l'issue suivante

## ETAPE 3 — Memoire

Mets a jour \`claude-progress.md\` apres chaque issue:
- Issues completees (avec ID Linear + commit hash)
- Issue en cours
- Issues restantes (IDs Linear)
- Problemes et solutions

## ETAPE 4 — Exit

- Quand TOUTES les issues Linear sont Done: ecris \`EXIT_SIGNAL: true\` dans RALPH_STATUS.md
- Si bloque sans solution: ecris \`BLOCKED: <raison>\` dans RALPH_STATUS.md

## Regles

- Tu ne codes JAMAIS — tu orchestres uniquement
- Respecte le file ownership entre agents
- Parallelise les issues independantes
- Chaque issue DOIT passer pnpm build
- Genere les migrations DB si besoin
- Fais des commits reguliers avec references Linear
- Mets a jour le statut Linear pour chaque issue

Commence maintenant!
PROMPT
}

# === MAIN ===

echo ""
echo -e "${GREEN}${BOLD}  RALPH LOOP v2 — Self-Healing Autonomous Dev${NC}"
echo "================================================"
echo -e "  Project:     ${BOLD}$(basename "$(cd "$PROJECT_DIR" && pwd)")${NC}"
echo -e "  Mode:        ${CYAN}${BOLD}$MODE${NC}"
echo -e "  Max iter:    $MAX_ITERATIONS"
echo -e "  Timeout:     ${ITERATION_TIMEOUT}s/iter"
echo -e "  Features:    $(count_features)"
echo -e "  Agent Teams: ${GREEN}ENABLED${NC}"
echo -e "  Self-Heal:   ${GREEN}ENABLED${NC}"
print_progress_bar
echo "================================================"
echo ""

# Initialize status file
cat > "$STATUS_FILE" << 'EOF'
# Ralph Status

## Current State
- Status: IN_PROGRESS
- Mode: SPEC
- EXIT_SIGNAL: false

## Iteration Log
EOF

# Update mode in status file
MODE_UPPER=$(echo "$MODE" | tr '[:lower:]' '[:upper:]')
sed -i "s/Mode: SPEC/Mode: $MODE_UPPER/" "$STATUS_FILE" 2>/dev/null || \
    sed -i '' "s/Mode: SPEC/Mode: $MODE_UPPER/" "$STATUS_FILE" 2>/dev/null || true

# Initialize progress file if it doesn't exist
if [ ! -f "$PROGRESS_FILE" ]; then
    cat > "$PROGRESS_FILE" << 'EOF'
# Claude Progress

> This file is the shared memory between Ralph Loop iterations.
> Claude reads this at the start of each iteration to know where the project stands.
> Claude updates this at the end of each iteration.

## Last Updated
Not started yet

## Completed Features
None yet

## Current Feature
None — starting fresh

## Remaining Features
See FEATURES.md

## Decisions & Notes
None yet

## Known Issues
None
EOF
fi

# === MAIN LOOP ===

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ITERATION=$((ITERATION + 1))
    ITER_START=$(date +%s)
    ITER_LOG="$LOG_DIR/iteration-$ITERATION.log"

    echo ""
    echo -e "${YELLOW}${BOLD}=== Iteration $ITERATION/$MAX_ITERATIONS ===${NC}  ${DIM}[total: $(elapsed_since $START_TIME)]${NC}"
    echo -e "$(date '+%H:%M:%S') — Launching Claude Code ($MODE mode)..."
    echo -e "${DIM}Log: $ITER_LOG${NC}"
    echo ""

    # Log iteration start
    echo "- [$ITERATION] $(date '+%Y-%m-%d %H:%M:%S') — $MODE mode" >> "$STATUS_FILE"

    # Git snapshot before iteration
    GIT_BEFORE=$(cd "$PROJECT_DIR" && git rev-parse HEAD 2>/dev/null)

    # Build the prompt based on mode
    if [ "$MODE" = "linear" ]; then
        PROMPT=$(build_linear_prompt)
    else
        PROMPT=$(build_spec_prompt)
    fi

    # Launch Claude Code
    cd "$PROJECT_DIR"
    CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 claude --dangerously-skip-permissions -p "$PROMPT" 2>&1 | tee "$ITER_LOG" &
    CLAUDE_PID=$!

    # Watchdog timeout
    (
        sleep "$ITERATION_TIMEOUT"
        if kill -0 "$CLAUDE_PID" 2>/dev/null; then
            kill "$CLAUDE_PID" 2>/dev/null
        fi
    ) &
    WATCHDOG_PID=$!

    # Wait for Claude to finish
    wait "$CLAUDE_PID" 2>/dev/null || true
    CLAUDE_EXIT=$?

    # Kill watchdog
    kill "$WATCHDOG_PID" 2>/dev/null
    wait "$WATCHDOG_PID" 2>/dev/null || true

    # Check for timeout
    if [ $CLAUDE_EXIT -eq 137 ] || [ $CLAUDE_EXIT -eq 143 ]; then
        echo ""
        echo -e "${RED}  Timeout reached (${ITERATION_TIMEOUT}s) — moving to next iteration${NC}"
    fi

    # Print iteration summary
    print_iteration_summary "$ITER_START" "$ITER_LOG"

    # --- Self-healing: build check between iterations ---
    echo ""
    echo -e "${CYAN}${BOLD}  Self-Heal Check${NC}"
    if check_build_between_iterations; then
        BUILD_OK=0
    else
        BUILD_OK=1
    fi

    # --- Check exit signal ---
    if grep -q "EXIT_SIGNAL: true" "$STATUS_FILE" 2>/dev/null; then
        # Final build verification
        echo ""
        echo -e "${CYAN}  Final build verification...${NC}"
        cd "$PROJECT_DIR"
        if pnpm build 2>&1 | tail -5; then
            echo ""
            echo -e "${GREEN}${BOLD}================================================${NC}"
            echo -e "${GREEN}${BOLD}  PROJECT COMPLETE!${NC}"
            echo -e "${GREEN}${BOLD}================================================${NC}"
            echo ""
            echo -e "  Iterations:   $ITERATION"
            echo -e "  Total time:   $(elapsed_since $START_TIME)"
            echo -e "  Features:     $(count_features)"
            print_progress_bar
            echo -e "  Logs:         $LOG_DIR/"
            echo ""
            exit 0
        else
            echo -e "${YELLOW}  Final build failed — removing EXIT_SIGNAL for one more iteration${NC}"
            sed -i "s/EXIT_SIGNAL: true/EXIT_SIGNAL: false/" "$STATUS_FILE" 2>/dev/null || \
                sed -i '' "s/EXIT_SIGNAL: true/EXIT_SIGNAL: false/" "$STATUS_FILE" 2>/dev/null || true
        fi
    fi

    # --- Check for BLOCKED signal ---
    if grep -q "BLOCKED:" "$STATUS_FILE" 2>/dev/null; then
        BLOCK_REASON=$(grep "BLOCKED:" "$STATUS_FILE" | tail -1)
        echo ""
        echo -e "${RED}${BOLD}  BLOCKED: $BLOCK_REASON${NC}"
        echo "Check $STATUS_FILE and $LOG_DIR/"
        exit 2
    fi

    # --- Circuit breaker: detect no-change loops ---
    # Use md5sum on Linux, md5 -r on macOS
    if command -v md5sum &>/dev/null; then
        HASH_CMD="md5sum"
    else
        HASH_CMD="md5 -r"
    fi
    CURRENT_HASH=$(cd "$PROJECT_DIR" && find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.md" \) -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/.ralph/*" 2>/dev/null | sort | xargs $HASH_CMD 2>/dev/null | $HASH_CMD)

    if [ "$CURRENT_HASH" = "$LAST_FILE_HASH" ]; then
        NO_CHANGE_COUNT=$((NO_CHANGE_COUNT + 1))
        echo ""
        echo -e "${RED}  No changes detected (${NO_CHANGE_COUNT}/3)${NC}"

        if [ $NO_CHANGE_COUNT -ge 3 ]; then
            echo ""
            echo -e "${RED}${BOLD}  CIRCUIT BREAKER: 3 iterations without changes${NC}"
            echo "  Project seems stuck. Check:"
            echo "    - $STATUS_FILE"
            echo "    - $PROGRESS_FILE"
            echo "    - $LOG_DIR/"
            exit 1
        fi
    else
        NO_CHANGE_COUNT=0
    fi

    LAST_FILE_HASH="$CURRENT_HASH"

    # Pause before next iteration
    echo ""
    echo -e "${DIM}  Pausing ${SLEEP_BETWEEN}s...${NC}"
    sleep $SLEEP_BETWEEN

done

echo ""
echo -e "${RED}${BOLD}  MAX ITERATIONS REACHED ($MAX_ITERATIONS)${NC}"
echo "  Total time: $(elapsed_since $START_TIME)"
echo "  Features:   $(count_features)"
print_progress_bar
echo "  Check: $STATUS_FILE, $PROGRESS_FILE, $LOG_DIR/"
exit 1
