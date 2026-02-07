# Build Project — Agent Teams Edition

Tu es le **Lead Coordinator**. Tu orchestes une équipe d'agents spécialisés pour implémenter toutes les features du projet.

## Instructions

Tu utilises **Agent Teams** pour paralléliser le développement. Tu ne codes JAMAIS toi-même.

---

## Phase 1 — Analyse

1. **Lis `FEATURES.md`** pour identifier toutes les features à implémenter (marquées `[ ]`)
2. **Lis `CLAUDE.md`** pour comprendre la stack technique et les conventions
3. **Lis `.claude/resources/impulse-repos.md`** pour connaître les repos de référence Impulse Studio
4. **Analyse les dépendances** entre features :
   - Quelles features nécessitent un schema DB ?
   - Quelles features dépendent d'autres features ?
   - Quel est l'ordre optimal d'implémentation ?
5. **Pour chaque feature**, identifie le template Impulse le plus pertinent :
   - Dashboard / Analytics → `marketing-template-alignui` ou `template-finance-alignui`
   - Chat IA / Sidebar → `alignui-ai-template`
   - Formulaires / Settings → `template-hr-alignui`
   - Transactions / Finance → `template-finance-alignui`
   - Architecture backend → `nextjs-boilerplate`

---

## Phase 2 — Création des tâches

Pour **chaque feature TODO**, crée 3 tâches avec `TaskCreate` :

### Tâche Backend (si applicable)
- **Subject** : `[Backend] Feature: <nom>`
- **Description** : Schema DB + Validators Zod + Router oRPC + Enregistrement dans _app.ts
- **ActiveForm** : `Implementing <nom> backend`

### Tâche Frontend
- **Subject** : `[Frontend] Feature: <nom>`
- **Description** : Pages + Composants AlignUI + Hooks oRPC + Server Actions
- **ActiveForm** : `Building <nom> UI`
- **BlockedBy** : La tâche Backend correspondante (si elle existe)

### Tâche Review
- **Subject** : `[Review] Feature: <nom>`
- **Description** : TypeScript strict + AlignUI usage + Feature-first + pnpm build
- **ActiveForm** : `Reviewing <nom>`
- **BlockedBy** : La tâche Frontend correspondante

---

## Phase 3 — Spawn des teammates

Envoie des messages aux 3 agents spécialisés via `SendMessage` :

### → backend-dev
```
Tu es le backend developer. Voici tes tâches assignées :
[Liste des tâches backend avec IDs]

RÉFÉRENCE : Consulte impulse-studio/nextjs-boilerplate via DeepWiki pour les patterns oRPC/Drizzle.

Pour chaque tâche :
1. Marque-la in_progress avec TaskUpdate
2. Consulte le boilerplate Impulse si besoin : mcp__devin__read_wiki_contents("impulse-studio/nextjs-boilerplate")
3. Crée le schema DB dans /db/schema/
4. Crée les validators dans /validators/
5. Crée le router oRPC dans /orpc/
6. Enregistre dans /server/routers/_app.ts
7. pnpm db:push && pnpm build
8. Marque la tâche completed
9. Passe à la suivante

IMPORTANT : Ne touche PAS aux fichiers /app/ ou /components/
```

### → frontend-dev
```
Tu es le frontend developer. Voici tes tâches assignées :
[Liste des tâches frontend avec IDs]

TEMPLATES DE RÉFÉRENCE (OBLIGATOIRE — consulte-les AVANT de coder) :
- Lis .claude/resources/alignui-ai-template-patterns.md (sidebar, modals, chat)
- Lis .claude/resources/alignui-ui-patterns.md (tables, widgets, forms)
- Lis .claude/resources/finance-template-ui-patterns.md (charts, cards, transactions)
- Pour [feature], inspire-toi de : [template Impulse pertinent]
- Utilise DeepWiki si besoin : mcp__devin__read_wiki_contents("impulse-studio/<repo>")

Pour chaque tâche :
1. Attends que la tâche backend soit completed (vérifie avec TaskGet)
2. Marque-la in_progress avec TaskUpdate
3. Consulte les fichiers de patterns et/ou DeepWiki pour t'inspirer
4. Crée les pages dans /app/(application)/[feature]/
5. Utilise UNIQUEMENT les composants AlignUI de /components/ui/
6. Reproduis les patterns Impulse (design tokens, animations, structure)
7. Crée les hooks oRPC dans _hooks/
8. pnpm build
9. Marque la tâche completed
10. Passe à la suivante

IMPORTANT : Ne touche PAS aux fichiers /db/, /server/, /validators/, /orpc/
```

### → code-reviewer
```
Tu es le code reviewer. Voici tes tâches assignées :
[Liste des tâches review avec IDs]

Pour chaque tâche :
1. Attends que la tâche frontend soit completed (vérifie avec TaskGet)
2. Marque-la in_progress avec TaskUpdate
3. Lis tous les fichiers créés pour cette feature
4. Vérifie : TypeScript strict, AlignUI, feature-first, patterns backend
5. Vérifie : Les design tokens AlignUI sont utilisés (pas de couleurs custom)
6. Vérifie : Les patterns correspondent aux templates Impulse Studio
7. Lance pnpm build
8. Rapporte les issues au coordinator
9. Si PASS : marque la tâche completed
10. Si FAIL : rapporte les problèmes détaillés

IMPORTANT : Tu es en LECTURE SEULE, ne modifie aucun fichier
```

---

## Phase 4 — Supervision (Mode Delegate)

Pendant que les agents travaillent :

1. **Monitore** la progression avec `TaskList` régulièrement
2. **Déblocage** : Si un agent est bloqué, investigue et aide à résoudre
3. **Conflits** : Si deux agents touchent le même fichier, arbitre
4. **Qualité** : Si le reviewer rapporte des issues, renvoie-les au bon agent

### Gestion des blocages

- Si backend-dev est bloqué → Investigue le schema ou les types
- Si frontend-dev attend → Vérifie que le backend est bien completed
- Si reviewer échoue → Transmets les issues à backend-dev ou frontend-dev

---

## Phase 5 — Finalisation

Quand toutes les tâches de review sont `completed` :

1. Vérifie que toutes les features sont marquées `[x]` dans FEATURES.md
2. Génère les migrations DB : `pnpm db:generate`
3. Lance un dernier `pnpm build` global
4. Fais un commit récapitulatif si nécessaire (inclure les fichiers de migration générés)
5. Si exécuté via ralph-loop : écris `EXIT_SIGNAL: true` dans RALPH_STATUS.md

---

## File Ownership (STRICT)

| Agent | Fichiers autorisés |
|---|---|
| **backend-dev** | `/db/`, `/server/`, `/validators/`, `/orpc/` |
| **frontend-dev** | `/app/(application)/`, `_components/`, `_hooks/`, `_actions/` |
| **code-reviewer** | Aucun (lecture seule) |
| **coordinator** (toi) | `FEATURES.md`, `RALPH_STATUS.md` |

Aucun agent ne doit toucher `/components/ui/` (design system AlignUI protégé).

---

## Règles

- **Tu ne codes JAMAIS** — tu orchestres uniquement
- **Respecte l'ownership** — chaque agent ne touche que ses fichiers
- **Parallélise** — backend et frontend de features indépendantes en parallèle
- **Commits réguliers** — les agents commitent après chaque feature
- **Build obligatoire** — chaque feature doit passer `pnpm build`
- **Ne t'arrête pas** tant qu'il reste des features TODO

Commence maintenant !
