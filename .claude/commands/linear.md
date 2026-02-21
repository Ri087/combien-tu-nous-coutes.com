# Linear Mode — From Linear issues to implementation

Tu vas synchroniser les issues Linear avec le projet et preparer le developpement autonome.

## Pre-requis

- MCP Linear configure (voir `.cursor/mcp.json` ou `claude mcp add linear`)
- Projet Linear existant avec des issues

## Process

### Phase 1 — Connexion Linear

1. **Liste les projets** disponibles via MCP Linear
2. **Demande** a l'utilisateur quel projet utiliser (ou utilise l'argument: `$ARGUMENTS`)
3. **Recupere les issues** du projet (status != Done)

### Phase 2 — Analyse des issues

Pour chaque issue Linear:
1. Lis le titre, la description, les labels, la priorite
2. Identifie si c'est un feature, bugfix, ou improvement
3. Mappe vers un template Impulse si pertinent

### Phase 3 — Generer FEATURES.md depuis Linear

Cree `FEATURES.md` en mappant chaque issue Linear:

```markdown
# Features — {nom-du-projet}

## Source: Linear Project {project-name}

## Core Features

### F001: {titre de l'issue Linear}
**Linear ID:** {LIN-XXX}
**Priority:** {priority}
**Labels:** {labels}

**Description:** {description de l'issue}

**Acceptance Criteria:**
- [ ] {criteres depuis la description Linear}
- [ ] {criteres supplementaires deduits}

**Backend:**
- {estimation des besoins backend}

**Frontend:**
- {estimation des besoins frontend}

**Status:** TODO
```

### Phase 4 — Initialiser la memoire

Cree `claude-progress.md` avec les references Linear:

```markdown
# Claude Progress

> Memoire partagee — Mode Linear

## Source
Linear Project: {project-name}
Issues a traiter: {N}

## Last Updated
{date} — Initialization

## Completed Issues
None yet

## Current Issue
None — ready to start

## Remaining Issues
{liste des issues avec Linear IDs}

## Linear Status Mapping
- TODO → "Todo" on Linear
- IN_PROGRESS → "In Progress" on Linear
- DONE → "Done" on Linear (updated via MCP)

## Decisions & Notes
None yet

## Known Issues
None
```

### Phase 5 — Instructions de lancement

```
FEATURES.md cree avec {N} issues Linear.
claude-progress.md initialise.

Pour lancer le developpement autonome:

  Mode Linear (recommande):
  pnpm ralph --linear

  Mode Linear avec max iterations:
  pnpm ralph --linear --max 30

Le Ralph Loop va:
1. Lire les issues depuis Linear
2. Implementer chaque issue
3. Mettre a jour le statut sur Linear (Done)
4. Ajouter un commentaire avec le resume
5. Commiter avec la reference Linear
```

## Regles

- **Respecter les priorites** Linear (P0 > P1 > P2)
- **Mapper les labels** aux templates Impulse
- **Conserver les IDs Linear** dans les commits et FEATURES.md
- **Mettre a jour Linear** apres chaque issue implementee
- **Ne pas creer d'issues** — seulement lire et mettre a jour

Commence par lister les projets Linear !
