#!/bin/bash

# =============================================================================
# SELF-HEAL CHECK — Claude Code Stop Hook
# Ensures code compiles before allowing Claude to finish
# Only enforces full build during ralph loop sessions
# =============================================================================

# Quick check: if no RALPH_STATUS.md, only do lightweight check
RALPH_MODE=false
if [ -f "RALPH_STATUS.md" ] && ! grep -q "EXIT_SIGNAL: true" "RALPH_STATUS.md" 2>/dev/null; then
    RALPH_MODE=true
fi

# --- TypeScript check (always, lightweight) ---
# Only run if there are .ts/.tsx files that changed recently
CHANGED_TS=$(git diff --name-only HEAD 2>/dev/null | grep -E '\.(ts|tsx)$' | head -1)

if [ -n "$CHANGED_TS" ]; then
    TSC_OUTPUT=$(pnpm exec tsc --noEmit 2>&1)
    TSC_EXIT=$?

    if [ $TSC_EXIT -ne 0 ]; then
        ERRORS=$(echo "$TSC_OUTPUT" | grep "error TS" | head -15 | while read -r line; do echo "  $line"; done)
        # Use printf to create proper JSON
        REASON="TypeScript errors found. Fix these before finishing:\n${ERRORS}"
        REASON_ESCAPED=$(echo "$REASON" | sed 's/"/\\"/g' | tr '\n' ' ')
        printf '{"decision": "block", "reason": "%s"}\n' "$REASON_ESCAPED"
        exit 0
    fi
fi

# --- Full build check (ralph loop only) ---
if [ "$RALPH_MODE" = true ]; then
    BUILD_OUTPUT=$(pnpm build 2>&1)
    BUILD_EXIT=$?

    if [ $BUILD_EXIT -ne 0 ]; then
        ERRORS=$(echo "$BUILD_OUTPUT" | grep -E "error|Error|ERROR" | tail -15 | while read -r line; do echo "  $line"; done)
        REASON="Build failed during ralph loop. Fix these errors:\n${ERRORS}"
        REASON_ESCAPED=$(echo "$REASON" | sed 's/"/\\"/g' | tr '\n' ' ')
        printf '{"decision": "block", "reason": "%s"}\n' "$REASON_ESCAPED"
        exit 0
    fi

    # Lint check
    LINT_OUTPUT=$(pnpm exec biome check . 2>&1)
    LINT_EXIT=$?

    if [ $LINT_EXIT -ne 0 ]; then
        ERRORS=$(echo "$LINT_OUTPUT" | grep -E "error|diagnostics" | tail -10 | while read -r line; do echo "  $line"; done)
        REASON="Lint errors found. Run 'pnpm checks' to fix:\n${ERRORS}"
        REASON_ESCAPED=$(echo "$REASON" | sed 's/"/\\"/g' | tr '\n' ' ')
        printf '{"decision": "block", "reason": "%s"}\n' "$REASON_ESCAPED"
        exit 0
    fi
fi

# All checks passed
exit 0
