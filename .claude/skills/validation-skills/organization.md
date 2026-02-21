# Organize Validators

## When to Use

When deciding where to place validation schemas, how to name them, and how to structure the `/validators/` directory as the project grows.

## Directory Structure

All shared Zod validators live in `/validators/`, organized by feature:

```
/validators/
  auth.ts           # Authentication schemas (signUp, resetPassword, etc.)
  project.ts        # Project feature schemas
  task.ts           # Task feature schemas
  invoice.ts        # Invoice feature schemas
  shared.ts         # Cross-feature reusable schemas (pagination, sorting, IDs)
```

## Naming Conventions

### File names

- Use singular feature name in kebab-case or camelCase matching the feature: `project.ts`, `task.ts`, `invoice.ts`
- Match the feature name used in other layers (`/db/schema/[feature]/`, `/server/routers/[feature].ts`)
- Use `shared.ts` for cross-feature reusable schemas (pagination, sorting, ID params)

### Schema variable names

Follow the pattern `[action][Feature]Schema`:

```typescript
// /validators/project.ts

// Create schemas
export const createProjectSchema = z.object({ ... });

// Update schemas
export const updateProjectSchema = z.object({ ... });

// Filter/search schemas
export const filterProjectSchema = z.object({ ... });

// Single-purpose schemas
export const archiveProjectSchema = z.object({ ... });
export const transferProjectSchema = z.object({ ... });
```

### Type names

Follow the pattern `[Action][Feature]Input`:

```typescript
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type FilterProjectInput = z.infer<typeof filterProjectSchema>;
```

## Shared vs Feature-Specific

### Feature-specific validators (`/validators/[feature].ts`)

Schemas tied to a single feature. They validate the business data for that feature.

```typescript
// /validators/project.ts
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  description: z.string().max(500).optional(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
```

### Shared validators (`/validators/shared.ts`)

Schemas reused across multiple features -- pagination, sorting, ID parameters, etc.

```typescript
// /validators/shared.ts
import { z } from "zod";

export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

export const idSchema = z.object({
  id: z.string().uuid(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type IdInput = z.infer<typeof idSchema>;
```

### When to use shared vs feature-specific

| Use shared (`/validators/shared.ts`) | Use feature-specific (`/validators/[feature].ts`) |
|---|---|
| Pagination, sorting, ID params | Create/update schemas for a specific feature |
| Schemas used by 3+ features | Schemas tied to one feature's business rules |
| Generic patterns (date ranges, search) | Feature-specific enums and constraints |

## File Structure Within a Validator File

Follow this order inside each validator file:

```typescript
// /validators/project.ts
import { z } from "zod";

// 1. Shared constants (if any)
const PROJECT_STATUSES = ["draft", "active", "archived"] as const;

// 2. Create schema
export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  description: z.string().max(500).optional(),
  status: z.enum(PROJECT_STATUSES).default("draft"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

// 3. Update schema
export const updateProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// 4. Filter/search schema (if needed)
export const filterProjectSchema = z.object({
  query: z.string().max(200).optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
});

export type FilterProjectInput = z.infer<typeof filterProjectSchema>;

// 5. Other action schemas
export const archiveProjectSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

export type ArchiveProjectInput = z.infer<typeof archiveProjectSchema>;
```

## Importing Validators

### In oRPC routers

```typescript
// /server/routers/projects.ts
import {
  createProjectSchema,
  updateProjectSchema,
  filterProjectSchema,
} from "@/validators/project";
import { paginationSchema } from "@/validators/shared";
```

### In React Hook Form

```typescript
import {
  createProjectSchema,
  type CreateProjectInput,
} from "@/validators/project";
```

## No Barrel Exports

The `/validators/` directory does NOT use a barrel `index.ts` file. Import directly from the feature file to keep imports explicit and tree-shakeable:

```typescript
// Good -- direct import
import { createProjectSchema } from "@/validators/project";

// Bad -- do not create /validators/index.ts barrel
import { createProjectSchema } from "@/validators";
```

## Rules

- ALWAYS place validators in `/validators/[feature].ts`, one file per feature
- ALWAYS match the file name to the feature name used elsewhere in the codebase
- ALWAYS follow the naming pattern: `[action][Feature]Schema` for schemas and `[Action][Feature]Input` for types
- ALWAYS export the inferred type next to its schema
- ALWAYS group all schemas for a feature in the same file
- ALWAYS place cross-feature schemas in `/validators/shared.ts`
- NEVER create a barrel export (`/validators/index.ts`) -- import directly from feature files
- NEVER put Drizzle-generated schemas (from `drizzle-zod`) in `/validators/` -- those belong alongside the DB schema (see `drizzle-zod.md`)
- NEVER scatter schemas for the same feature across multiple files
- Keep the import order consistent: `z` from `zod` first, then any shared schemas

## Related Skills

- See `create-validator.md` for how to define schemas with common Zod patterns
- See `shared-schemas.md` for reusable schema patterns and composition
- See `drizzle-zod.md` for DB-generated schemas
- See `custom-refinements.md` for advanced validation logic
