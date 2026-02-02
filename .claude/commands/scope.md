# Scope Project

Tu vas m'aider à définir le scope du projet et générer le fichier FEATURES.md.

## Instructions

1. **Pose-moi des questions** pour comprendre le projet :
   - C'est quoi le projet en une phrase ?
   - Qui sont les utilisateurs cibles ?
   - Quelles sont les 3-5 fonctionnalités principales ?
   - Y a-t-il des contraintes techniques particulières ?
   - Quel est le niveau de complexité attendu (MVP simple, MVP complet, etc.) ?

2. **Une fois que tu as compris**, génère un fichier `FEATURES.md` avec :
   - Une description claire du projet
   - Les features organisées par priorité (F001, F002, etc.)
   - Des acceptance criteria précis et testables pour chaque feature
   - Des notes techniques si pertinent

3. **Format du FEATURES.md** :

```markdown
# Features - {nom-du-projet}

## Description
{description du projet}

## Core Features

### F001: {nom de la feature}
**Description:** {ce que ça fait}

**Acceptance Criteria:**
- [ ] {critère 1 - précis et testable}
- [ ] {critère 2}
- [ ] {critère 3}

**Technical Notes:**
- {note si pertinent}

**Status:** TODO

### F002: ...

## EXIT CONDITIONS
- [ ] Toutes les features F00X sont DONE
- [ ] `pnpm build` passe sans erreur
- [ ] L'application est fonctionnelle
```

4. **Écris le fichier** `FEATURES.md` à la racine du projet

## Important

- Sois précis dans les acceptance criteria (pas de "l'UI est belle", mais "il y a un bouton X qui fait Y")
- Chaque feature doit être indépendante et implémentable séparément
- Commence par les features core, puis les nice-to-have
- Ne dépasse pas 5-7 features pour un MVP

Commence par me poser les questions !
