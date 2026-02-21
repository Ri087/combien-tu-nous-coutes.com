# Linear Mode — Fetch issues, implement, PR

Tu vas fetcher les issues Linear, demander a l'utilisateur lesquelles implementer, puis les implementer avec des sub-agents. Chaque commit reference l'issue Linear qu'il resout.

**Pas de fichier intermediaire.** Tu travailles directement depuis Linear.

## Pre-requis

- MCP Linear configure
- Projet Linear existant avec des issues

## Process

### Phase 1 — Fetch & Selection

1. **Fetch les issues** via MCP Linear (project: `$ARGUMENTS` ou demande)
   - Filtre: status != Done, status != Cancelled
   - Trie par priorite (Urgent > High > Medium > Low > None)

2. **Affiche les issues** a l'utilisateur avec un resume clair:
   ```
   Issues a implementer:

   [1] LIN-42  (Urgent)  Systeme d'auth email/password
   [2] LIN-43  (High)    Dashboard principal
   [3] LIN-44  (High)    CRUD Projets
   [4] LIN-45  (Medium)  Page Settings
   [5] LIN-46  (Low)     Export CSV
   ```

3. **Demande a l'utilisateur** lesquelles implementer:
   - "Toutes" → tout
   - "1,2,3" → selection
   - "Urgent+High" → par priorite

### Phase 2 — Preparation

1. **Lis `CLAUDE.md`** pour les conventions du repo
2. **Lis `.claude/resources/impulse-repos.md`** pour les templates Impulse
3. **Cree une branche** si pas deja dessus: `feat/linear-batch-{date}`
4. **Pour chaque issue selectionnee**, analyse:
   - Type: feature / bugfix / improvement
   - Besoins backend: schema DB ? router ? validators ?
   - Besoins frontend: pages ? composants ?
   - Template Impulse pertinent

### Phase 3 — Implementation (par issue)

Pour CHAQUE issue selectionnee, dans l'ordre de priorite:

#### 3.1 — Delegue aux agents

1. **Mets l'issue "In Progress"** sur Linear via MCP
2. **Cree les taches** avec TaskCreate:
   - `[Backend] LIN-XX: {titre}` (si backend necessaire)
   - `[Frontend] LIN-XX: {titre}`
   - `[Review] LIN-XX: {titre}`

3. **Spawn les agents** via SendMessage:

   → **backend-dev** (si applicable):
   ```
   Implemente le backend pour l'issue Linear "{titre}":
   Description: {description de l'issue}

   A faire:
   - Schema DB si necessaire
   - Validators Zod
   - Router oRPC (.route({ method: 'GET' }) pour lectures)
   - Enregistrer dans _app.ts
   - pnpm db:push && pnpm build
   ```

   → **frontend-dev**:
   ```
   Implemente le frontend pour l'issue Linear "{titre}":
   Description: {description de l'issue}

   Consulte les templates Impulse: {template pertinent}
   Utilise UNIQUEMENT les composants AlignUI.
   ```

   → **code-reviewer**:
   ```
   Review l'implementation de LIN-XX: "{titre}"
   Verifie: TypeScript strict, AlignUI, build, patterns.
   Donne des instructions de correction precises si problemes.
   ```

#### 3.2 — Self-healing

Si le code-reviewer rapporte CHANGES_REQUESTED:
1. Envoie **qa-fixer** avec les instructions de correction
2. Re-review par code-reviewer
3. Repete max 3 fois

#### 3.3 — Commit & Update Linear

Quand l'issue est validee (APPROVED par code-reviewer):

1. **Commit** tous les fichiers de cette issue:
   ```
   git add <fichiers>
   git commit -m "feat(LIN-XX): {titre de l'issue}

   {resume de ce qui a ete implemente}

   Resolves: LIN-XX"
   ```

2. **Mets l'issue "Done"** sur Linear via MCP

3. **Ajoute un commentaire** sur l'issue Linear:
   ```
   Implemented by Claude Code:
   - Backend: {resume}
   - Frontend: {resume}
   - Commit: {hash}
   ```

4. **Passe a l'issue suivante**

### Phase 4 — Finalisation

Quand toutes les issues selectionnees sont implementees:

1. **Build final**: `pnpm build`
2. **Checks final**: `pnpm checks`
3. **Resume** pour l'utilisateur:
   ```
   Implementation terminee:

   [DONE] LIN-42  Systeme d'auth         → 3 commits
   [DONE] LIN-43  Dashboard              → 2 commits
   [DONE] LIN-44  CRUD Projets           → 4 commits
   [DONE] LIN-45  Page Settings          → 1 commit
   [SKIP] LIN-46  Export CSV             → non selectionne

   Total: 10 commits, 4 issues resolues
   Build: PASS
   Branche: feat/linear-batch-20260221
   ```

3. **Propose de creer une PR** avec tous les commits:
   ```
   PR Title: feat: implement LIN-42, LIN-43, LIN-44, LIN-45
   PR Body:
   ## Issues resolues
   - [x] LIN-42: Systeme d'auth email/password
   - [x] LIN-43: Dashboard principal
   - [x] LIN-44: CRUD Projets
   - [x] LIN-45: Page Settings

   ## Resume des changements
   {resume global}
   ```

4. Si en ralph-loop: ecris `EXIT_SIGNAL: true` dans RALPH_STATUS.md

## File Ownership (STRICT)

| Agent | Fichiers autorises |
|---|---|
| **backend-dev** | `/db/`, `/server/`, `/validators/`, `/orpc/` |
| **frontend-dev** | `/app/(application)/`, `_components/`, `_hooks/`, `_actions/` |
| **code-reviewer** | Aucun (lecture seule) |
| **qa-fixer** | Tous sauf `/components/ui/` |
| **coordinator** (toi) | `RALPH_STATUS.md`, `claude-progress.md` |

## Regles

- **Pas de fichier intermediaire** — travaille directement depuis Linear
- **1 commit = 1 issue** (ou plus si complexe, mais toujours reference Linear)
- **Toujours mettre a jour Linear** (status + commentaire)
- **Respecter les priorites** Linear
- **Self-healing** — reviewer → qa-fixer → re-review
- **Build obligatoire** — chaque issue doit passer pnpm build
- **Ne t'arrete pas** tant que toutes les issues selectionnees ne sont pas done

Commence par fetcher les issues Linear !
