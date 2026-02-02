# Features - {PROJECT_NAME}

> Ce fichier liste toutes les features à implémenter.
> Claude Code le lit et coche les features au fur et à mesure.

## Légende

- `[ ]` TODO - À implémenter
- `[~]` IN PROGRESS - En cours
- `[x]` DONE - Terminé
- `[!]` BLOCKED - Bloqué (noter la raison)

---

## Description du Projet

{DESCRIPTION}

---

## Core Features

### F001: {FEATURE_1_NAME}

**Description:** {FEATURE_1_DESCRIPTION}

**Acceptance Criteria:**
- [ ] {CRITERIA_1}
- [ ] {CRITERIA_2}
- [ ] {CRITERIA_3}

**Technical Notes:**
- {NOTE_1}

**Status:** TODO

---

### F002: {FEATURE_2_NAME}

**Description:** {FEATURE_2_DESCRIPTION}

**Acceptance Criteria:**
- [ ] {CRITERIA_1}
- [ ] {CRITERIA_2}

**Status:** TODO

---

### F003: {FEATURE_3_NAME}

**Description:** {FEATURE_3_DESCRIPTION}

**Acceptance Criteria:**
- [ ] {CRITERIA_1}
- [ ] {CRITERIA_2}

**Status:** TODO

---

## Infrastructure (Pré-configuré)

### I001: Authentication
- [x] Sign up with email/password
- [x] Email verification (OTP)
- [x] Sign in
- [x] Password reset
- [x] Session management

**Status:** DONE (provided by boilerplate)

---

## Notes de Développement

### Décisions Techniques
- {DECISION_1}

### Questions Ouvertes
- {QUESTION_1}

---

## Progress Log

| Date | Feature | Status | Notes |
|------|---------|--------|-------|
| {DATE} | Project initialized | ✅ | Boilerplate cloned |

---

## EXIT CONDITIONS

Pour considérer ce projet TERMINÉ, TOUTES ces conditions doivent être remplies :

- [ ] Toutes les features F00X sont marquées DONE
- [ ] `pnpm build` passe sans erreur
- [ ] L'application est fonctionnelle en local
- [ ] Le schema DB est pushé sur Neon

Quand ces conditions sont remplies, écrire `EXIT_SIGNAL: true` dans `RALPH_STATUS.md`.
