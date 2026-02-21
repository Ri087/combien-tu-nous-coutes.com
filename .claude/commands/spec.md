# Spec Mode — From idea to FEATURES.md

Tu vas transformer n'importe quel input en une specification technique structuree, prete pour le Ralph Loop.

**Ce command remplace /scope avec une approche plus complete et interactive.**

## Inputs acceptes

- Une idee vague ("je veux une app pour...")
- Un brief client (texte, email, notes)
- Un cahier des charges
- Un fichier markdown existant
- Argument: `$ARGUMENTS`

## Process

### Phase 1 — Comprendre

1. **Lis l'input** fourni (ou demande-le si absent)
2. **Pose 3-5 questions cibles** pour clarifier:
   - Quel probleme ca resout ?
   - Pour qui ? (types d'utilisateurs)
   - 3-5 actions principales qu'un user doit faire ?
   - Contraintes ? (delai, technique, budget)
   - Niveau MVP ? (ultra minimal vs complet)

### Phase 2 — Rechercher

Avant de produire quoi que ce soit, fais tes recherches:

1. **Patterns UX**: Comment les meilleurs produits resolvent ce probleme ?
2. **Ressources techniques**: Quelles libs/APIs existent ?
3. **Templates Impulse**: Quel template de reference utiliser ?
   - Lis `.claude/resources/impulse-repos.md`
   - Mappe chaque feature au template le plus pertinent

Sauvegarde les ressources utiles dans `docs/research/` si le dossier existe.

### Phase 3 — Generer FEATURES.md

Cree le fichier `FEATURES.md` avec ce format strict:

```markdown
# Features — {nom-du-projet}

## Description
{Description technique du projet en 2-3 phrases}

## Stack
- Framework: Next.js (App Router) + React
- DB: Neon (Serverless Postgres) + Drizzle ORM
- Auth: Better Auth
- UI: AlignUI
- API: oRPC
{+ skills additionnelles si besoin: AI SDK, Tiptap, Vercel Blob, Redis, etc.}

## Core Features

### F001: {nom}
**Description:** {ce que ca fait}
**Template de reference:** {template Impulse pertinent}

**Acceptance Criteria:**
- [ ] {critere 1 — precis et testable}
- [ ] {critere 2}
- [ ] {critere 3}

**Backend:**
- Schema: {tables a creer}
- Router: {endpoints necessaires}
- Validators: {schemas Zod}

**Frontend:**
- Pages: {routes a creer}
- Composants: {composants principaux}

**Status:** TODO

### F002: ...

## Skills a activer
- [ ] ai-sdk — Si le projet utilise de l'IA
- [ ] vercel-blob — Si upload de fichiers
- [ ] tiptap — Si editeur rich text
- [ ] redis — Si cache/rate limiting
- [ ] analytics — Si analytics

## EXIT CONDITIONS
- [ ] Toutes les features F00X sont DONE
- [ ] `pnpm build` passe sans erreur
- [ ] L'application est fonctionnelle
- [ ] Les migrations DB sont generees
```

### Phase 4 — Initialiser la memoire

Cree `claude-progress.md`:

```markdown
# Claude Progress

> Memoire partagee entre les iterations du Ralph Loop.

## Last Updated
{date} — Initialization

## Completed Features
None yet

## Current Feature
None — ready to start

## Remaining Features
{liste des features du FEATURES.md}

## Decisions & Notes
- Template de reference principal: {template}
- Skills activees: {liste}

## Known Issues
None
```

### Phase 5 — Instructions de lancement

Affiche les instructions pour lancer le Ralph Loop:

```
FEATURES.md cree avec {N} features.
claude-progress.md initialise.

Pour lancer le developpement autonome:

  Mode Spec (recommande):
  pnpm ralph --spec

  Mode Spec avec max iterations:
  pnpm ralph --spec --max 50

  Mode interactif (sans ralph loop):
  /build
```

## Regles

- **5-7 features max** pour un MVP
- **Acceptance criteria precis**: pas de "l'UI est belle", mais "bouton X fait Y"
- **Chaque feature est independante** et implementable separement
- **Identifier ce qui est HORS SCOPE** dans la description
- **Mapper chaque feature** a un template Impulse Studio
- **Toujours inclure** les details backend ET frontend pour chaque feature

Commence par lire l'input ou poser des questions !
