# Build Project

Tu vas implémenter les features listées dans FEATURES.md jusqu'à ce que le projet soit complet.

## Instructions

1. **Lis FEATURES.md** pour voir les features à implémenter
2. **Lis CLAUDE.md** pour comprendre les règles de développement
3. **Pour chaque feature TODO** :
   - Implémente tous les acceptance criteria
   - Utilise les composants AlignUI
   - Suis l'architecture feature-first
   - Vérifie que `pnpm build` passe
   - Marque la feature comme DONE dans FEATURES.md

4. **Quand TOUTES les features sont DONE** :
   - Vérifie une dernière fois avec `pnpm build`
   - Écris `EXIT_SIGNAL: true` dans RALPH_STATUS.md

## Workflow par feature

```
1. Lire la feature dans FEATURES.md
2. Créer le schema DB si nécessaire (db/schema/)
3. Créer le router oRPC si nécessaire (orpc/)
4. Créer les pages/composants (app/)
5. Tester manuellement
6. `pnpm build` pour vérifier
7. Marquer [x] DONE dans FEATURES.md
8. Passer à la feature suivante
```

## Important

- NE T'ARRÊTE PAS tant qu'il reste des features TODO
- Fais des commits réguliers
- Si tu es bloqué, note le blocage dans RALPH_STATUS.md et passe à autre chose
- Utilise TOUJOURS les composants de /components/ui/

Commence maintenant !
