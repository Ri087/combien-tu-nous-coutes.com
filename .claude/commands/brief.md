# Brief to User Stories

Tu vas transformer n'importe quel input projet en user stories structurées et un FEATURES.md prêt pour le développement.

**Tu travailles comme un humain** : tu recherches, tu lis, tu sauvegardes ce qui est utile, et tu construis ta compréhension progressivement avant de produire quoi que ce soit.

## Inputs acceptés

Tu peux recevoir :
- Une idée vague ("je veux une app pour...")
- Un transcript de réunion
- Des notes en vrac
- Un email client
- Une description courte
- Un cahier des charges
- Ou même juste un concept

**Ton job : structurer et clarifier, quel que soit le niveau de détail initial.**

## Process

### 0. Initialiser le dossier de recherche

Avant toute chose, crée le dossier de recherche pour ce projet :

```
docs/research/
  README.md          → Index des ressources collectées
  references/        → Liens et articles de référence
  technical/         → Ressources techniques (libs, APIs, patterns)
```

Crée le `docs/research/README.md` avec cette structure :

```markdown
# Recherche - [Nom du Projet]

> Ressources collectées pendant la phase de brief.
> Générées automatiquement par Claude pendant la recherche.

## Références

| # | Titre | URL | Catégorie | Résumé |
|---|-------|-----|-----------|--------|
| | | | | |

## Ressources techniques

| Technologie | URL | Pertinence | Notes |
|-------------|-----|------------|-------|
| | | | |

## Décisions clés

| # | Question | Décision | Justification |
|---|----------|----------|---------------|
| | | | |
```

### 1. Comprendre et Clarifier

Lis ce que l'utilisateur te donne et identifie ce qui manque. Pose des questions pour clarifier :

**Questions essentielles :**
- C'est quoi le problème que ça résout ?
- C'est pour qui ? (types d'utilisateurs)
- Quelles sont les 3-5 actions principales qu'un utilisateur doit pouvoir faire ?
- Y a-t-il des contraintes ? (délai, budget, technique)
- Quel niveau de MVP ? (ultra minimal vs complet)

**Adapte tes questions au contexte :**
- Si c'est vague → pose plus de questions
- Si c'est détaillé → confirme ta compréhension
- Si c'est un transcript → extrais les points clés et valide

### 2. Rechercher et Collecter (NOUVEAU)

**Avant de produire quoi que ce soit, fais tes recherches.** Comme un humain qui ouvre 20 onglets avant de commencer.

#### Ce que tu dois rechercher

- **Patterns UX** : Comment les meilleurs produits résolvent ce problème d'un point de vue UX ?
- **Ressources techniques** : Quelles libs, APIs, services existent pour résoudre les sous-problèmes ?
- **Articles / Best practices** : Y a-t-il des articles de référence sur ce type de produit ?

#### Comment sauvegarder les ressources

**À chaque fois que tu trouves une ressource utile**, sauvegarde-la immédiatement :

1. **Lien + résumé court** → Ajoute une entrée dans `docs/research/README.md` (dans le bon tableau)

2. **Ressource technique importante** → Crée un fichier dans `docs/research/technical/` :
   ```
   docs/research/technical/[sujet].md
   ```
   Avec : la technologie, pourquoi c'est pertinent, exemples de code ou d'utilisation, liens vers la doc.

3. **Article de référence ou insight clé** → Crée un fichier dans `docs/research/references/` :
   ```
   docs/research/references/[titre-court].md
   ```
   Avec : le lien source, un résumé, les points clés à retenir pour notre projet.

#### Règles de collecte

- **Sauvegarde au fur et à mesure**, pas à la fin. Chaque découverte utile = un ajout immédiat.
- **Mets à jour le README.md** à chaque ajout pour garder l'index à jour.
- **Qualité > Quantité** : ne sauvegarde que ce qui est réellement utile pour le projet.
- **Cite toujours la source** : URL obligatoire pour chaque ressource.
- **Résume en 1-2 phrases** pourquoi c'est pertinent pour nous.

### 3. Proposer les Personas

Identifie 2-4 types d'utilisateurs max :

```markdown
## Personas

### [Nom du persona]
**Qui :** [Description courte]
**Objectif :** [Ce qu'il veut accomplir]
**Frustration actuelle :** [Le problème qu'il a aujourd'hui]
```

### 4. Générer les User Stories

Format strict :

```markdown
### US-001: [Titre court et clair]

**En tant que** [persona]
**Je veux** [action concrète]
**Afin de** [bénéfice mesurable]

**Critères d'acceptation :**
- [ ] [Critère 1 - précis et testable]
- [ ] [Critère 2]
- [ ] [Critère 3]

**Priorité :** P0 (must-have) | P1 (should-have) | P2 (nice-to-have)
**Complexité :** S (small) | M (medium) | L (large)
```

### 5. Créer les fichiers

Génère 2 fichiers :

**USER-STORIES.md** - Vision business (pour le client)
```markdown
# [Nom du Projet] - User Stories

## Vue d'ensemble
[Description du projet en 2-3 phrases]

## Personas
[Liste des personas]

## User Stories
[Stories groupées par priorité]

## Hors scope (V1)
[Ce qui n'est PAS inclus dans cette version]
```

**FEATURES.md** - Specs techniques (pour Claude Code)
```markdown
# Features - [nom-projet]

## Description
[Description technique]

## Core Features

### F001: [Feature dérivée des US]
[Acceptance criteria techniques]
Status: TODO
```

### 6. Commit des recherches

Une fois que tu as terminé la phase de recherche ET produit les livrables :

1. Commit les ressources de recherche : `git add docs/research/ && git commit -m "docs: add research resources for [projet]"`
2. Commit les user stories et features : `git add USER-STORIES.md FEATURES.md && git commit -m "docs: add user stories and features for [projet]"`

## Contraintes techniques obligatoires

### Vercel AI Gateway (OBLIGATOIRE pour tout ce qui est AI)

Quand le projet utilise de l'AI (chat, génération, streaming, etc.) :

- **TOUJOURS utiliser le Vercel AI Gateway** — jamais de provider direct
- **NE PAS installer** `@ai-sdk/openai`, `@ai-sdk/anthropic`, etc. — le gateway gère tout
- Utiliser le format `provider/model` (ex: `anthropic/claude-sonnet-4-5`, `openai/gpt-5`)
- Le package `ai` v6 inclut déjà le gateway, pas de dépendance supplémentaire
- Variable d'env : `AI_GATEWAY_API_KEY`
- Voir `.claude/skills/ai-sdk.md` pour les détails d'implémentation

### Déploiement Vercel (OBLIGATOIRE)

Le projet sera déployé sur Vercel. Toutes les solutions techniques doivent être compatibles :

- **Serverless-first** — pas de serveurs persistants, pas de WebSockets natifs (utiliser Vercel AI SDK streaming ou Ably/Pusher si besoin)
- **Edge-compatible quand possible** — préférer les API routes Edge pour la performance
- **Vercel-native services** — préférer Vercel Blob (uploads), Vercel KV (cache), Vercel Postgres (DB) ou services déjà dans la stack (Neon)
- **Pas de process long** — les fonctions serverless ont un timeout (max 60s sur Pro, 10s sur Hobby)
- **Variables d'environnement** via `vercel env` — jamais de `.env` committé

## Règles importantes

1. **Pas de jargon technique dans USER-STORIES.md** - C'est pour le client
2. **Être précis dans les critères** - Pas de "l'UI doit être belle", mais "le bouton X fait Y"
3. **Limiter à 5-7 features pour un MVP** - On peut toujours ajouter après
4. **Identifier ce qui est HORS SCOPE** - Aussi important que ce qui est inclus
5. **Estimer la complexité** - Aide à prioriser
6. **TOUJOURS sauvegarder les ressources trouvées** - Le knowledge est un asset du projet
7. **Rechercher AVANT de produire** - Pas de user stories sans recherche préalable
8. **TOUJOURS utiliser le Vercel AI Gateway** - Pas de provider direct pour l'AI
9. **Vercel-compatible** - Toute solution technique doit tourner sur Vercel

## Exemples d'inputs et comment réagir

**Input vague :**
> "Je veux une app pour gérer mes tâches"

→ Pose des questions : "Solo ou collaboratif ? Mobile ou web ? Quelles fonctionnalités minimum ?"
→ Puis recherche : patterns UX de todo apps, articles sur la productivité, libs pertinentes

**Input détaillé :**
> "On veut un CRM pour notre équipe de 10 commerciaux avec suivi des leads, pipeline, et reporting"

→ Confirme : "Ok, je comprends X, Y, Z. Est-ce que [assumption] est correct ?"
→ Puis recherche : patterns de pipeline, APIs d'enrichissement de données, best practices CRM UX

**Transcript de réunion :**
> [Long texte avec plusieurs speakers]

→ Extrais : "J'ai identifié ces points clés : A, B, C. J'ai des questions sur D et E."
→ Puis recherche sur les sujets identifiés

Commence par me demander de décrire le projet ou colle directement ton input !
