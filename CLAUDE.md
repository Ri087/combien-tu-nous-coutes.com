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
// db/schema/projects.ts
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  userId: uuid('user_id').notNull(),
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

Créer les procedures dans `/orpc/` :

```typescript
// orpc/projects.ts
import { protectedProcedure } from '@/server/procedure/protected.procedure';
import { z } from 'zod';

export const projectsRouter = {
  list: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      // ctx.user est disponible (authenticated)
      return db.query.projects.findMany({
        where: eq(projects.userId, ctx.user.id),
        limit: input.limit ?? 10,
      });
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return db.insert(projects).values({
        name: input.name,
        userId: ctx.user.id,
      }).returning();
    }),
};
```

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
3. **Créer le router oRPC** dans `/orpc/[feature].ts`
4. **Créer les pages** dans `/app/(application)/[feature]/`
5. **Utiliser les composants AlignUI** pour l'UI
6. **Tester** : `pnpm build` doit passer

### Checklist avant de considérer une feature "done"

- [ ] Le code compile (`pnpm build` passe)
- [ ] Le schema est pushé (`pnpm db:push`)
- [ ] Les types sont stricts (pas de `any`)
- [ ] Les composants AlignUI sont utilisés
- [ ] Le code suit la structure feature-first

## Extensions Optionnelles

Des skills sont disponibles dans `.claude/skills/` pour activer des fonctionnalités supplémentaires :

| Skill | Quand l'utiliser |
|-------|------------------|
| `vercel-blob.md` | Upload de fichiers |
| `ai-sdk.md` | Fonctionnalités AI (chat, génération) |
| `tiptap.md` | Éditeur rich text |
| `analytics.md` | Analytics (PostHog) |
| `redis.md` | Cache, rate limiting |

Pour lire un skill :
```
Lis le fichier .claude/skills/vercel-blob.md
```

## Important

1. **NE JAMAIS modifier `/components/ui/`** - C'est le design system AlignUI
2. **TOUJOURS vérifier avec `pnpm build`** avant de considérer une tâche terminée
3. **Utiliser les composants existants** avant d'en créer de nouveaux
4. **Feature-first** - Garder le code organisé par fonctionnalité
