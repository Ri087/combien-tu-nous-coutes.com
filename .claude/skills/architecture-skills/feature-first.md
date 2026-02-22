# Feature-First Architecture

## What It Means

Feature-first architecture organizes code by **business feature** rather than by technical layer. All files related to a feature (page, components, hooks, actions, types) live together in the same directory tree. This makes features self-contained, easy to find, and easy to delete.

## Core Principle

> If you delete a feature folder, the feature is gone. No orphaned files scattered across the codebase.

## Directory Structure for a Feature

Every feature lives under `/app/(application)/[feature-name]/` and follows this exact structure:

```
/app/(application)/projects/
  page.tsx                      # Page entry point (Server Component by default)
  layout.tsx                    # Optional layout for the feature
  search-params.ts              # Optional nuqs search params definition
  _components/
    project-list.tsx            # Feature-specific UI components
    project-card.tsx
    create-project-modal.tsx
  _hooks/
    use-projects.ts             # React Query + oRPC hooks
    use-create-project.ts
  _actions/
    create-project.ts           # Server Actions ("use server")
    delete-project.ts
```

### Sub-pages (nested routes)

```
/app/(application)/projects/
  page.tsx                      # /projects
  [id]/
    page.tsx                    # /projects/:id
    _components/
      project-detail.tsx
    _hooks/
      use-project.ts
  new/
    page.tsx                    # /projects/new
    _components/
      create-project-form.tsx
```

## What Goes WHERE

### Inside the feature folder (`/app/(application)/[feature]/`)

| Subfolder | Contents | Naming |
|-----------|----------|--------|
| `page.tsx` | Page entry point, Server Component | Always `page.tsx` |
| `layout.tsx` | Feature-specific layout | Always `layout.tsx` |
| `search-params.ts` | nuqs search params cache definition | Always `search-params.ts` |
| `_components/` | All UI components for this feature | `kebab-case.tsx` |
| `_hooks/` | React Query hooks, custom hooks | `use-[name].ts` |
| `_actions/` | Server Actions with `"use server"` | `[verb]-[noun].ts` |

### Outside the feature folder (shared code)

| Location | Contents | When to use |
|----------|----------|-------------|
| `/components/` | Shared components (header, logo, etc.) | Used by 2+ features |
| `/components/ui/` | AlignUI design system | NEVER modify |
| `/components/form/` | Form wrapper components | Shared form controls |
| `/components/custom/` | Custom shared widgets | Rich text editor, etc. |
| `/server/routers/` | oRPC router definitions | Backend API for the feature |
| `/db/schema/[feature]/` | Drizzle schema | Database tables for the feature |
| `/validators/[feature].ts` | Zod schemas | Shared validation schemas |
| `/constants/` | Application constants | Shared constant values |

## Step-by-Step: Adding a New Feature

### Example: Adding a "Projects" feature

**Step 1: Database schema** (if the feature needs persistence)

```
/db/schema/projects/
  schema.ts       # pgTable definitions
  relations.ts    # Drizzle relations
  types.ts        # Inferred types (typeof table.$inferSelect)
  index.ts        # Barrel export: export * from "./schema"; export * from "./relations"; export * from "./types";
```

Then add to `/db/schema/index.ts`:
```typescript
export * from "./auth";
export * from "./projects";   // Add this line
```

**Step 2: Validators**

```
/validators/projects.ts
```

```typescript
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
```

**Step 3: oRPC Router**

```
/server/routers/projects.ts
```

```typescript
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { createProjectSchema } from "@/validators/projects";

export const projectsRouter = {
  list: protectedProcedure
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      // ...
    }),

  create: protectedProcedure
    .input(createProjectSchema)
    .handler(async ({ context, input }) => {
      // ...
    }),
};
```

Register in `/server/routers/_app.ts`:
```typescript
import { base } from "@/server/context";
import { projectsRouter } from "./projects";

export const appRouter = base.router({
  projects: projectsRouter,
});
```

**Step 4: Feature pages and components**

```
/app/(application)/projects/
  page.tsx
  _components/
    project-list.tsx
    project-card.tsx
  _hooks/
    use-projects.ts
```

**Step 5: Constants** (if needed)

Add feature pages to `/constants/pages.ts`:
```typescript
export const APPLICATION_PAGES = {
  DASHBOARD: "/dashboard",
  PROJECTS: "/projects",      // Add this
};
```

## Page Component Pattern

```tsx
// /app/(application)/projects/page.tsx
import type { Metadata } from "next";

import { ProjectList } from "./_components/project-list";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return <ProjectList />;
}
```

- Pages are **Server Components** by default (no `"use client"`)
- Pages delegate rendering to `_components/` components
- Pages can accept `searchParams` if using nuqs

## Anti-Patterns to AVOID

### 1. Scattering feature files across the codebase

```
# BAD - Files for "projects" scattered everywhere
/components/project-list.tsx
/components/project-card.tsx
/hooks/use-projects.ts
/actions/create-project.ts
/app/(application)/projects/page.tsx
```

```
# GOOD - Everything together
/app/(application)/projects/
  page.tsx
  _components/project-list.tsx
  _components/project-card.tsx
  _hooks/use-projects.ts
  _actions/create-project.ts
```

### 2. Putting shared code in a feature folder

```
# BAD - This component is used by multiple features
/app/(application)/projects/_components/user-avatar.tsx

# GOOD - Move to shared components
/components/user-avatar.tsx
```

### 3. Creating a "shared" or "common" feature folder

```
# BAD
/app/(application)/shared/_components/

# GOOD - Use /components/ for truly shared components
/components/
```

### 4. Deeply nesting _components

```
# BAD - Too much nesting
/app/(application)/projects/_components/list/_components/card/_components/badge.tsx

# GOOD - Flat _components with descriptive names
/app/(application)/projects/_components/project-list.tsx
/app/(application)/projects/_components/project-card.tsx
/app/(application)/projects/_components/project-badge.tsx
```

### 5. Importing from another feature's private folders

```
# BAD - Reaching into another feature's internals
import { TaskCard } from "@/app/(application)/tasks/_components/task-card";

# GOOD - If shared, move to /components/
import { TaskCard } from "@/components/task-card";
```

### 6. Putting business logic in page.tsx

```tsx
// BAD - Page doing too much
export default function ProjectsPage() {
  // No data fetching logic here
  // No complex conditionals
  // No direct database calls
}

// GOOD - Page delegates to components
export default function ProjectsPage() {
  return <ProjectList />;
}
```

## The _ Prefix Convention

Folders prefixed with `_` are **private to that route segment**. Next.js does NOT treat them as route segments.

- `_components/` -- UI components private to this feature
- `_hooks/` -- Hooks private to this feature
- `_actions/` -- Server Actions private to this feature
- `_lib/` -- Utility functions private to this feature (used in auth)

This is a Next.js convention: folders starting with `_` are excluded from the routing system.

## When to Extract to Shared

Move code out of a feature folder when:

1. **Two or more features** import the same component/hook/utility
2. The code is **genuinely generic** (not feature-specific logic)
3. The code is a **layout element** (header, sidebar, footer)

Keep code in the feature folder when:

1. Only **one feature** uses it
2. It contains **feature-specific** business logic
3. Removing the feature should remove this code too
