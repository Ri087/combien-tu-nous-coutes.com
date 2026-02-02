#!/bin/bash

# =============================================================================
# RALPH LOOP - Fait tourner Claude Code jusqu'à complétion du projet
# =============================================================================

# Configuration
MAX_ITERATIONS=50          # Sécurité : max 50 boucles
SLEEP_BETWEEN=5            # Pause entre les itérations (secondes)
PROJECT_DIR="${1:-.}"      # Dossier du projet (défaut: dossier courant)

# Couleurs pour le terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fichier de statut que Claude va mettre à jour
STATUS_FILE="$PROJECT_DIR/RALPH_STATUS.md"

# Compteurs pour le circuit breaker
ITERATION=0
NO_CHANGE_COUNT=0
LAST_FILE_HASH=""

echo -e "${GREEN}🏭 RALPH LOOP - MVP Factory${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 Projet: $PROJECT_DIR"
echo "🔄 Max iterations: $MAX_ITERATIONS"
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

    echo ""
    echo -e "${YELLOW}━━━ Iteration $ITERATION/$MAX_ITERATIONS ━━━${NC}"
    echo "$(date '+%H:%M:%S') - Lancement de Claude Code..."

    # Log l'itération
    echo "- [$ITERATION] $(date '+%Y-%m-%d %H:%M:%S')" >> "$STATUS_FILE"

    # Lance Claude Code
    cd "$PROJECT_DIR"
    claude --dangerously-skip-permissions -p "$PROMPT"

    # Vérifie le signal de sortie
    if grep -q "EXIT_SIGNAL: true" "$STATUS_FILE" 2>/dev/null; then
        echo ""
        echo -e "${GREEN}✅ PROJET TERMINÉ !${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Iterations: $ITERATION"
        echo "Statut: $STATUS_FILE"
        exit 0
    fi

    # Circuit breaker : vérifie si des fichiers ont changé
    CURRENT_HASH=$(find "$PROJECT_DIR" -type f -name "*.ts" -o -name "*.tsx" -o -name "*.md" 2>/dev/null | xargs md5sum 2>/dev/null | md5sum)

    if [ "$CURRENT_HASH" = "$LAST_FILE_HASH" ]; then
        NO_CHANGE_COUNT=$((NO_CHANGE_COUNT + 1))
        echo -e "${RED}⚠️  Pas de changement détecté ($NO_CHANGE_COUNT/3)${NC}"

        if [ $NO_CHANGE_COUNT -ge 3 ]; then
            echo ""
            echo -e "${RED}🛑 CIRCUIT BREAKER: 3 itérations sans changement${NC}"
            echo "Le projet semble bloqué. Vérifiez RALPH_STATUS.md"
            exit 1
        fi
    else
        NO_CHANGE_COUNT=0
    fi

    LAST_FILE_HASH="$CURRENT_HASH"

    # Pause avant la prochaine itération
    echo "Pause de ${SLEEP_BETWEEN}s avant la prochaine itération..."
    sleep $SLEEP_BETWEEN

done

echo ""
echo -e "${RED}🛑 MAX ITERATIONS ATTEINT ($MAX_ITERATIONS)${NC}"
echo "Le projet n'est pas terminé. Vérifiez RALPH_STATUS.md"
exit 1
