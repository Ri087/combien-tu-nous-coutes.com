# Dev Debug - Lancer le serveur et débuguer dans le navigateur

Tu vas lancer le serveur de développement, ouvrir le navigateur sur la page demandée, et te mettre en mode debug interactif.

## Étape 1 : Lancer le serveur de dev

Lance le serveur de développement en background :

```bash
pnpm dev
```

**IMPORTANT** : Lance cette commande en background (`run_in_background: true`) pour ne pas bloquer la conversation. Attends quelques secondes que le serveur démarre (vérifie les logs pour voir "Ready" ou "started server").

## Étape 2 : Ouvrir le navigateur

Une fois le serveur prêt :

1. Utilise `mcp__claude-in-chrome__tabs_context_mcp` pour voir les onglets ouverts
2. Crée un nouvel onglet avec `mcp__claude-in-chrome__tabs_create_mcp`
3. Navigue vers `http://localhost:3000/sign-up` avec `mcp__claude-in-chrome__navigate`
4. Prends un screenshot avec `mcp__claude-in-chrome__get_screenshot` pour vérifier que la page s'affiche correctement

## Étape 3 : Mode Debug Interactif

Tu es maintenant en mode **debug interactif**. Tu as accès à :

### Ce que tu peux faire

- **Lire et modifier le code source** : Tu as accès à tout le codebase (composants, API, schemas, etc.)
- **Voir la page dans le navigateur** : Utilise `get_screenshot` pour voir l'état actuel de la page
- **Lire la console du navigateur** : Utilise `mcp__claude-in-chrome__read_console_messages` pour voir les erreurs et logs
- **Lire les requêtes réseau** : Utilise `mcp__claude-in-chrome__read_network_requests` pour voir les appels API
- **Exécuter du JavaScript** : Utilise `mcp__claude-in-chrome__javascript_tool` pour inspecter le DOM, le state, etc.
- **Interagir avec la page** : Utilise `mcp__claude-in-chrome__computer` pour cliquer, taper du texte, naviguer
- **Remplir des formulaires** : Utilise `mcp__claude-in-chrome__form_input` pour remplir les champs
- **Lire le texte de la page** : Utilise `mcp__claude-in-chrome__get_page_text` pour extraire le contenu textuel

### Workflow de debug

Quand tu identifies un problème :

1. **Observer** : Screenshot + console + network requests
2. **Diagnostiquer** : Lis le code source concerné, identifie la cause
3. **Corriger** : Modifie le code source directement
4. **Vérifier** : Rafraîchis la page (navigue à nouveau sur la même URL) et reprends un screenshot
5. **Répéter** jusqu'à ce que le problème soit résolu

### Conseils

- Le serveur tourne sur `http://localhost:3000`
- Le hot-reload est actif (Turbopack) : les changements de code sont reflétés automatiquement
- Pour les erreurs côté serveur, regarde aussi les logs du terminal (output du `pnpm dev`)
- La structure du projet suit l'architecture feature-first (voir CLAUDE.md)
- Les composants UI sont dans `/components/ui/` (AlignUI - ne pas modifier)
- Les routes auth sont dans `/app/(auth)/`

## Commence maintenant !

1. Lance `pnpm dev` en background
2. Attends que le serveur soit prêt
3. Ouvre le navigateur sur `http://localhost:3000/sign-up`
4. Prends un screenshot et décris ce que tu vois
5. Demande-moi ce que je veux débuguer ou tester
