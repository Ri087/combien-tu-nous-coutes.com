# MVP Factory - Claude Code Instructions

> Ce fichier guide Claude Code pour développer sur cette boilerplate.
> Il est automatiquement lu par Claude au démarrage.

## Stack Technique

| Composant | Technologie | Docs |
|-----------|-------------|------|
| Framework | Next.js 15 (App Router, Turbopack) | [nextjs.org/docs](https://nextjs.org/docs) |
| Database | Neon (Serverless Postgres) + Drizzle ORM | [orm.drizzle.team](https://orm.drizzle.team) |
| Auth | Better Auth (email/password + OTP) | [better-auth.com](https://www.better-auth.com) |
| UI | AlignUI (Tailwind-based design system) | Voir `/components/ui/` |
| API | oRPC (type-safe RPC) | [orpc.gg](https://orpc.gg) |
| Forms | React Hook Form + Zod | [react-hook-form.com](https://react-hook-form.com) |
| Email | React Email + Resend | [react.email](https://react.email) |
| State | TanStack Query | [tanstack.com/query](https://tanstack.com/query) |

## Structure du Projet

```
/app                    → Pages et routes (App Router)
  /(auth)/              → Pages d'authentification (sign-in, sign-up, etc.)
  /(application)/       → Pages authentifiées (dashboard, etc.)
  /api/                 → API routes
/components
  /ui/                  → Composants AlignUI (NE PAS MODIFIER)
  /[feature]/           → Composants spécifiques aux features
/db
  /schema/              → Schemas Drizzle
/emails                 → Templates d'emails (React Email)
/lib                    → Utilitaires et configs
/orpc                   → Définitions oRPC (API type-safe)
/server                 → Logique serveur (middleware, procedures)
/validators             → Schemas Zod partagés
```

## Commandes Essentielles

```bash
pnpm dev          # Dev server (Next.js + Drizzle Studio)
pnpm build        # Build production
pnpm db:push      # Push schema vers Neon
pnpm db:generate  # Générer les migrations
pnpm db:studio    # Ouvrir Drizzle Studio
pnpm checks       # Lint + TypeScript check
```

## Règles de Développement

### Architecture Feature-First

Organise le code par **feature**, pas par type de fichier :

```
# ✅ BON - Feature-first
/app/(application)/projects/
  page.tsx                    → Page principale
  _components/
    project-list.tsx          → Composants de la feature
    project-card.tsx
  _hooks/
    use-projects.ts           → Hooks de la feature
  _actions/
    create-project.ts         → Server actions

# ❌ MAUVAIS - Tout mélangé
/components/project-list.tsx
/hooks/use-projects.ts
```

### Composants UI

**TOUJOURS utiliser les composants AlignUI** dans `/components/ui/` :

```tsx
// ✅ BON
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ❌ MAUVAIS - Ne pas créer de composants custom pour des éléments basiques
<button className="...">Click</button>
```

Pour découvrir les composants disponibles :
```bash
ls -la components/ui/
```

### Base de Données

**Schema** : Définir dans `/db/schema/`

```typescript
// db/schema/project/schema.ts
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from '../auth/schema';

export const project = pgTable('project', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Après modification du schema** :
```bash
pnpm db:push  # Push direct (dev)
# ou
pnpm db:generate && pnpm db:migrate  # Migrations (prod)
```

### API (oRPC)

Créer les procedures dans `/server/routers/` et les enregistrer dans `_app.ts` :

```typescript
// server/routers/projects.ts
import { protectedProcedure } from '@/server/procedure/protected.procedure';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { project } from '@/db/schema';

export const projectsRouter = {
  // ✅ Lecture → TOUJOURS ajouter .route({ method: 'GET' })
  list: protectedProcedure
    .route({ method: 'GET' })
    .input(z.object({ limit: z.number().optional() }))
    .handler(async ({ context, input }) => {
      return context.db.query.project.findMany({
        where: eq(project.userId, context.session.user.id),
        limit: input.limit ?? 10,
      });
    }),

  // ✅ Écriture → PAS de .route() (POST par défaut)
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .handler(async ({ context, input }) => {
      return context.db.insert(project).values({
        name: input.name,
        userId: context.session.user.id,
      }).returning();
    }),
};
```

**Règles oRPC importantes :**
- **TOUJOURS** utiliser `.route({ method: 'GET' })` pour les procedures de lecture (get, list, find, search)
- **NE PAS** mettre `.route()` pour les mutations (create, update, delete) → POST par défaut
- Utiliser `.handler()` (pas `.query()` ou `.mutation()` — ça n'existe pas dans oRPC)
- Le serveur utilise `StrictGetMethodPlugin` : un GET sans `.route({ method: 'GET' })` = **405 error**

### Validation

**TOUJOURS utiliser Zod** pour la validation :

```typescript
// validators/project.ts
import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
```

### TypeScript

- **Strict mode** activé
- **NO `any`** - utiliser `unknown` si type inconnu
- **Inférence de types** préférée aux types explicites quand possible

```typescript
// ✅ BON
const projects = await getProjects(); // Type inféré

// ❌ MAUVAIS
const projects: any = await getProjects();
```

## Workflow de Développement

### Pour une nouvelle feature

1. **Créer le schema** dans `/db/schema/[feature].ts`
2. **Push le schema** : `pnpm db:push`
3. **Créer le router oRPC** dans `/server/routers/[feature].ts`
4. **Créer les pages** dans `/app/(application)/[feature]/`
5. **Utiliser les composants AlignUI** pour l'UI
6. **Tester** : `pnpm build` doit passer

### Checklist avant de considérer une feature "done"

- [ ] Le code compile (`pnpm build` passe)
- [ ] Le schema est pushé (`pnpm db:push`)
- [ ] Les types sont stricts (pas de `any`)
- [ ] Les composants AlignUI sont utilisés
- [ ] Le code suit la structure feature-first

## Skills (14 auto-discovered skills with 124 reference guides)

Skills are **auto-discovered** by Claude Code via proper `SKILL.md` format with YAML frontmatter. Claude automatically loads the relevant skill when the task matches its description. Each skill directory contains a `SKILL.md` entry point and detailed reference files.

### Available Skills

| Skill | Refs | Description |
|-------|------|-------------|
| `backend-orpc` | 12 | oRPC API: create routers, GET/POST routes, procedures, validation, error handling |
| `backend-database` | 14 | Drizzle ORM: schemas, relations, queries, migrations, types, indexes |
| `backend-auth` | 9 | Better Auth: sessions, page/API protection, sign-up/in, OTP, password reset |
| `backend-email` | 3 | React Email + Resend: templates, sending, shared components |
| `backend-middleware` | 2 | oRPC middleware: auth, roles, custom middleware creation |
| `frontend-pages` | 12 | Next.js pages: create, layout, header, sidebar, loading, error, URL state |
| `frontend-components` | 8 | Components: create, split, client/server, naming, imports, props, forwardRef |
| `frontend-ui` | 22 | AlignUI: buttons, inputs, modals, tables, badges, icons, design tokens, etc. |
| `frontend-forms` | 8 | React Hook Form: create, validate, submit, errors, reset, file upload |
| `frontend-state` | 6 | State: TanStack Query, mutations, invalidation, URL state, Context |
| `validation-skills` | 5 | Zod: create validators, organize, Drizzle-Zod, refinements, shared schemas |
| `architecture-skills` | 9 | Architecture: feature-first, naming, folders, code splitting, imports |
| `workflow-skills` | 9 | **KEY**: add-feature, fix-bug, checks, consistency, pre-commit, code review |
| `integrations-skills` | 5 | Optional: Vercel Blob, AI SDK, Tiptap, PostHog, Redis |

### How skills work

Skills are loaded **automatically** when Claude detects a matching task. No manual reading needed.

For manual reference:
```bash
ls .claude/skills/workflow-skills/        # List reference files in a skill
cat .claude/skills/workflow-skills/add-feature.md  # Read a specific guide
```

### Key workflow (read first for any new task)

- **`workflow-skills/add-feature.md`** → Complete end-to-end feature implementation
- **`workflow-skills/fix-bug.md`** → Bug investigation and fix workflow
- **`workflow-skills/consistency-guide.md`** → How to keep UI/code consistent
- **`workflow-skills/pre-commit-checklist.md`** → What to verify before committing

## Important

1. **NE JAMAIS modifier `/components/ui/`** - C'est le design system AlignUI
2. **TOUJOURS vérifier avec `pnpm build`** avant de considérer une tâche terminée
3. **TOUJOURS consulter les skills pertinents** avant d'implémenter
4. **Utiliser les composants existants** avant d'en créer de nouveaux
5. **Feature-first** - Garder le code organisé par fonctionnalité
6. **Consistency** - Copier les patterns des pages existantes (header, layout, sidebar)
7. **No questions** - Les skills contiennent toutes les réponses, pas besoin de demander à l'utilisateur
