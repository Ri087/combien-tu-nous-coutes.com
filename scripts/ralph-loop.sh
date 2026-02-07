#!/bin/bash

# =============================================================================
# RALPH LOOP - Fait tourner Claude Code jusqu'à complétion du projet
# =============================================================================

# Configuration
MAX_ITERATIONS=50          # Sécurité : max 50 boucles
SLEEP_BETWEEN=5            # Pause entre les itérations (secondes)
ITERATION_TIMEOUT=3600     # Timeout par itération (60 min)
PROJECT_DIR="${1:-.}"      # Dossier du projet (défaut: dossier courant)

# Couleurs pour le terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

# Fichier de statut que Claude va mettre à jour
STATUS_FILE="$PROJECT_DIR/RALPH_STATUS.md"
LOG_DIR="$PROJECT_DIR/.ralph"
mkdir -p "$LOG_DIR"

# Compteurs pour le circuit breaker
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
    local total=$(grep -c '\- \[.\]' "$file" 2>/dev/null || echo 0)
    local done=$(grep -c '\- \[x\]' "$file" 2>/dev/null || echo 0)
    echo "$done/$total"
}

print_progress_bar() {
    local file="$PROJECT_DIR/FEATURES.md"
    if [ ! -f "$file" ]; then return; fi

    local total=$(grep -c '\- \[.\]' "$file" 2>/dev/null || echo 0)
    local done=$(grep -c '\- \[x\]' "$file" 2>/dev/null || echo 0)

    if [ "$total" -eq 0 ]; then return; fi

    local pct=$((done * 100 / total))
    local filled=$((pct / 5))
    local empty=$((20 - filled))

    printf "  ${BLUE}["
    printf "%0.s█" $(seq 1 $filled 2>/dev/null)
    printf "%0.s░" $(seq 1 $empty 2>/dev/null)
    printf "]${NC} %d%% (%d/%d features)\n" "$pct" "$done" "$total"
}

print_iteration_summary() {
    local iter_start=$1
    local log_file=$2
    local duration=$(elapsed_since "$iter_start")

    echo ""
    echo -e "${DIM}┌─────────────────────────────────────────${NC}"
    echo -e "${DIM}│${NC} ${BOLD}Résumé iteration $ITERATION${NC}"
    echo -e "${DIM}│${NC} Durée: $duration"

    # Fichiers modifiés depuis le début de l'itération
    local changed_files=$(git diff --name-only HEAD 2>/dev/null | head -10)
    local changed_count=$(git diff --name-only HEAD 2>/dev/null | wc -l | tr -d ' ')

    if [ "$changed_count" -gt 0 ]; then
        echo -e "${DIM}│${NC} Fichiers modifiés: $changed_count"
        echo "$changed_files" | while read -r f; do
            echo -e "${DIM}│${NC}   ${GREEN}+${NC} $f"
        done
        if [ "$changed_count" -gt 10 ]; then
            echo -e "${DIM}│${NC}   ... et $((changed_count - 10)) autres"
        fi
    else
        echo -e "${DIM}│${NC} ${YELLOW}Aucun fichier modifié${NC}"
    fi

    # Commits depuis le début de l'itération
    local new_commits=$(git log --oneline --since="$(date -v-${ITERATION_TIMEOUT}S '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -d "-${ITERATION_TIMEOUT} seconds" '+%Y-%m-%d %H:%M:%S' 2>/dev/null)" 2>/dev/null | head -5)
    if [ -n "$new_commits" ]; then
        echo -e "${DIM}│${NC} Commits:"
        echo "$new_commits" | while read -r c; do
            echo -e "${DIM}│${NC}   ${BLUE}•${NC} $c"
        done
    fi

    # Progress
    echo -e "${DIM}│${NC}"
    echo -ne "${DIM}│${NC} Progress: "
    echo "$(count_features) features"
    print_progress_bar
    echo -e "${DIM}└─────────────────────────────────────────${NC}"
}

# --- Main ---

echo ""
echo -e "${GREEN}${BOLD}🏭 RALPH LOOP - MVP Factory${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  📁 Projet:       ${BOLD}$PROJECT_DIR${NC}"
echo -e "  🔄 Max iter:     $MAX_ITERATIONS"
echo -e "  ⏱  Timeout/iter: ${ITERATION_TIMEOUT}s"
echo -e "  📋 Features:     $(count_features)"
print_progress_bar
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Crée le fichier de statut initial
cat > "$STATUS_FILE" << 'EOF'
# Ralph Status

## Current State
- Status: IN_PROGRESS
- EXIT_SIGNAL: false

## Progress Log
EOF

# Le prompt qui sera donné à Claude Code à chaque itération
PROMPT="Tu travailles sur ce projet.

INSTRUCTIONS:
1. Lis FEATURES.md pour voir les features à implémenter
2. Implémente la prochaine feature marquée [ ] (TODO)
3. Une fois implémentée, marque-la [x] (DONE) dans FEATURES.md
4. Vérifie que le build passe avec 'pnpm build'
5. Si TOUTES les features sont [x], mets EXIT_SIGNAL: true dans RALPH_STATUS.md

IMPORTANT:
- Ne t'arrête PAS tant qu'il reste des features TODO
- Si tu rencontres un blocage, note-le dans RALPH_STATUS.md et continue sur autre chose
- Fais des commits réguliers

Commence maintenant."

# === BOUCLE PRINCIPALE ===
while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ITERATION=$((ITERATION + 1))
    ITER_START=$(date +%s)
    ITER_LOG="$LOG_DIR/iteration-$ITERATION.log"

    echo ""
    echo -e "${YELLOW}${BOLD}━━━ Iteration $ITERATION/$MAX_ITERATIONS ━━━${NC}  ${DIM}[total: $(elapsed_since $START_TIME)]${NC}"
    echo -e "$(date '+%H:%M:%S') - Lancement de Claude Code..."
    echo -e "${DIM}Log: $ITER_LOG${NC}"
    echo ""

    # Log l'itération
    echo "- [$ITERATION] $(date '+%Y-%m-%d %H:%M:%S')" >> "$STATUS_FILE"

    # Snapshot git pour comparer après
    GIT_BEFORE=$(git rev-parse HEAD 2>/dev/null)

    # Lance Claude Code avec output visible + log
    cd "$PROJECT_DIR"
    timeout "$ITERATION_TIMEOUT" claude --dangerously-skip-permissions -p "$PROMPT" 2>&1 | tee "$ITER_LOG"
    CLAUDE_EXIT=$?

    # Timeout détecté
    if [ $CLAUDE_EXIT -eq 124 ]; then
        echo ""
        echo -e "${RED}⏱  Timeout atteint (${ITERATION_TIMEOUT}s) — passage à l'itération suivante${NC}"
    fi

    # Résumé de l'itération
    print_iteration_summary "$ITER_START" "$ITER_LOG"

    # Vérifie le signal de sortie
    if grep -q "EXIT_SIGNAL: true" "$STATUS_FILE" 2>/dev/null; then
        echo ""
        echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}${BOLD}  ✅ PROJET TERMINÉ !${NC}"
        echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "  Iterations:  $ITERATION"
        echo -e "  Durée totale: $(elapsed_since $START_TIME)"
        echo -e "  Features:    $(count_features)"
        print_progress_bar
        echo -e "  Logs:        $LOG_DIR/"
        echo ""
        exit 0
    fi

    # Circuit breaker : vérifie si des fichiers ont changé
    CURRENT_HASH=$(find "$PROJECT_DIR" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.md" \) -not -path "*/node_modules/*" -not -path "*/.next/*" 2>/dev/null | sort | xargs md5sum 2>/dev/null | md5sum)

    if [ "$CURRENT_HASH" = "$LAST_FILE_HASH" ]; then
        NO_CHANGE_COUNT=$((NO_CHANGE_COUNT + 1))
        echo ""
        echo -e "${RED}⚠️  Pas de changement détecté (${NO_CHANGE_COUNT}/3)${NC}"

        if [ $NO_CHANGE_COUNT -ge 3 ]; then
            echo ""
            echo -e "${RED}${BOLD}🛑 CIRCUIT BREAKER: 3 itérations sans changement${NC}"
            echo "Le projet semble bloqué. Vérifiez:"
            echo "  - $STATUS_FILE"
            echo "  - $LOG_DIR/"
            exit 1
        fi
    else
        NO_CHANGE_COUNT=0
    fi

    LAST_FILE_HASH="$CURRENT_HASH"

    # Pause avant la prochaine itération
    echo ""
    echo -e "${DIM}Pause de ${SLEEP_BETWEEN}s...${NC}"
    sleep $SLEEP_BETWEEN

done

echo ""
echo -e "${RED}${BOLD}🛑 MAX ITERATIONS ATTEINT ($MAX_ITERATIONS)${NC}"
echo "Durée totale: $(elapsed_since $START_TIME)"
echo "Features: $(count_features)"
print_progress_bar
echo "Vérifiez $STATUS_FILE et $LOG_DIR/"
exit 1
