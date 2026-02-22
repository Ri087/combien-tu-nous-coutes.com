# Export Types from Schemas

## When to Use

Use this skill when you need to export TypeScript types from Drizzle schemas. These types are used throughout the application for type-safe data handling -- in oRPC procedures, validators, frontend components, and utility functions.

## Prerequisites

- A Drizzle table exists in `/db/schema/[feature]/schema.ts`
- The feature has a `types.ts` file in its schema directory

## Type Inference Methods

Drizzle provides two primary type inference utilities on every table:

| Type | Method | Description |
|------|--------|-------------|
| Select type | `typeof table.$inferSelect` | Shape of a row returned from a SELECT query |
| Insert type | `typeof table.$inferInsert` | Shape of data required for an INSERT |

The difference: `$inferSelect` includes all columns (with their actual types), while `$inferInsert` makes columns with defaults optional.

## Step-by-Step Instructions

### Step 1: Create the types file

```typescript
// db/schema/projects/types.ts
import type { project } from "./schema";

// Full row type (all columns as returned by SELECT)
export type Project = typeof project.$inferSelect;

// Insert type (columns with defaults are optional)
export type NewProject = typeof project.$inferInsert;
```

### Step 2: Export from the barrel

Make sure the types are exported from the feature's `index.ts`:

```typescript
// db/schema/projects/index.ts
export * from "./relations";
export * from "./schema";
export * from "./types";
```

### Step 3: Use the types

```typescript
import type { Project, NewProject } from "@/db/schema/projects";
```

## Type Patterns

### Full Select and Insert Types

```typescript
// db/schema/projects/types.ts
import type { project } from "./schema";

export type Project = typeof project.$inferSelect;
export type NewProject = typeof project.$inferInsert;
```

What these look like at the type level:

```typescript
// Project ($inferSelect) -- all fields required, matches DB row
type Project = {
  id: string;
  name: string;
  description: string | null;
  isArchived: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

// NewProject ($inferInsert) -- fields with defaults are optional
type NewProject = {
  id?: string;           // has defaultRandom()
  name: string;
  description?: string | null;
  isArchived?: boolean;  // has default(false)
  userId: string;
  createdAt?: Date;      // has defaultNow()
  updatedAt?: Date;      // has defaultNow()
};
```

### Pick Types (Subset of Fields)

Use `Pick` to create types with only specific fields, commonly used for API responses:

```typescript
// db/schema/projects/types.ts
import type { project } from "./schema";

export type Project = typeof project.$inferSelect;
export type NewProject = typeof project.$inferInsert;

// For API responses -- exclude sensitive or unnecessary fields
export type ProjectSummary = Pick<Project, "id" | "name" | "createdAt">;

// For list views
export type ProjectListItem = Pick<Project, "id" | "name" | "isArchived" | "createdAt">;
```

### Omit Types (Exclude Fields)

Use `Omit` to exclude specific fields:

```typescript
// Exclude internal fields
export type PublicProject = Omit<Project, "userId" | "updatedAt">;
```

### Types with Relations

When you query with `with` clauses, the result includes related data. Define types for these:

```typescript
// db/schema/projects/types.ts
import type { project } from "./schema";
import type { User } from "../auth/types";

export type Project = typeof project.$inferSelect;

// Project with its related user
export type ProjectWithUser = Project & {
  user: User;
};

// Project with all relations loaded
export type ProjectWithRelations = Project & {
  user: User;
  projectTags: Array<{
    tag: { id: string; name: string };
  }>;
};
```

### Enum-Like Types from pgEnum

If you use `pgEnum`, you can derive the union type:

```typescript
// db/schema/projects/schema.ts
import { pgEnum } from "drizzle-orm/pg-core";

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "active",
  "archived",
]);

// db/schema/projects/types.ts
import type { projectStatusEnum } from "./schema";

export type ProjectStatus = (typeof projectStatusEnum.enumValues)[number];
// Result: "draft" | "active" | "archived"
```

### Types for Update Operations

Create a partial type for update payloads:

```typescript
// db/schema/projects/types.ts
import type { project } from "./schema";

export type Project = typeof project.$inferSelect;
export type NewProject = typeof project.$inferInsert;

// For update operations -- all fields optional except ID
export type UpdateProject = Partial<Pick<Project, "name" | "description" | "isArchived">> & {
  id: string;
};
```

## Example: Complete types.ts File

```typescript
// db/schema/projects/types.ts
import type { project } from "./schema";
import type { ExportedUser } from "../auth/types";

// Base types inferred from schema
export type Project = typeof project.$inferSelect;
export type NewProject = typeof project.$inferInsert;

// API response types
export type ProjectSummary = Pick<Project, "id" | "name" | "createdAt">;
export type ProjectListItem = Pick<Project, "id" | "name" | "isArchived" | "createdAt">;

// Types with relations
export type ProjectWithUser = Project & {
  user: ExportedUser;
};
```

## Usage Throughout the Codebase

### In oRPC procedures

```typescript
import type { Project } from "@/db/schema/projects";

export const projectsRouter = {
  get: protectedProcedure
    .route({ method: "GET" })
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }): Promise<Project | undefined> => {
      return db.query.project.findFirst({
        where: and(eq(project.id, input.id), eq(project.userId, context.session.user.id)),
      });
    }),
};
```

### In validators

```typescript
import type { NewProject } from "@/db/schema/projects";

// The validator shape should match NewProject (minus auto-generated fields)
export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
}) satisfies z.ZodType<Pick<NewProject, "name" | "description">>;
```

## Rules

- ALWAYS create a `types.ts` file in every schema feature directory.
- ALWAYS export at least `$inferSelect` and `$inferInsert` types.
- ALWAYS use `Pick` or `Omit` to create focused types for API responses -- never expose all columns.
- ALWAYS use the `type` keyword for imports (`import type { ... }`).
- ALWAYS export types from the feature's `index.ts` barrel file.
- NEVER manually define types that duplicate what `$inferSelect` already provides.
- NEVER include `userId` in exported/public API response types unless specifically needed.

## Related Skills

- `create-schema.md` -- Creating the schema and types.ts file
- `json-columns.md` -- Typing JSON columns with `$type<T>()`
- `column-types.md` -- Understanding what TypeScript types each column produces
