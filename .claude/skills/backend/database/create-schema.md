# Create a New Drizzle Schema

## When to Use

Use this skill when you need to create a new database table for a feature. Every new feature that persists data requires a Drizzle schema with four files: `schema.ts`, `relations.ts`, `types.ts`, and `index.ts`.

## Prerequisites

- The feature name is known (e.g., `projects`, `invoices`, `tasks`)
- The columns and their types are defined
- You know which tables this feature relates to (if any)

## Step-by-Step Instructions

### Step 1: Create the feature directory

Create a directory at `/db/schema/[feature]/` with four files:

```
db/schema/[feature]/
  schema.ts       # Table definitions
  relations.ts    # Drizzle relations
  types.ts        # Inferred TypeScript types
  index.ts        # Barrel export
```

### Step 2: Define the table in `schema.ts`

```typescript
// db/schema/projects/schema.ts
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "../auth/schema";

export const project = pgTable("project", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  isArchived: boolean("is_archived").notNull().default(false),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

**Naming conventions:**
- Table variable: singular camelCase (`project`, `invoice`, `task`)
- Table name in DB: singular snake_case (`"project"`, `"invoice"`, `"task"`)
- Column variables: camelCase (`userId`, `createdAt`)
- Column names in DB: snake_case (`"user_id"`, `"created_at"`)

### Step 3: Define relations in `relations.ts`

```typescript
// db/schema/projects/relations.ts
import { relations } from "drizzle-orm";

import { user } from "../auth/schema";
import { project } from "./schema";

export const projectRelations = relations(project, ({ one }) => ({
  user: one(user, {
    fields: [project.userId],
    references: [user.id],
  }),
}));
```

If the feature has no relations yet, create the file with an empty export or a comment:

```typescript
// db/schema/projects/relations.ts
// Relations will be added when related tables are created.
```

### Step 4: Export types in `types.ts`

```typescript
// db/schema/projects/types.ts
import type { project } from "./schema";

export type Project = typeof project.$inferSelect;
export type NewProject = typeof project.$inferInsert;
```

Add `Pick` types if you need to expose a subset of fields (e.g., for API responses):

```typescript
export type ProjectSummary = Pick<Project, "id" | "name" | "createdAt">;
```

### Step 5: Create the barrel export in `index.ts`

```typescript
// db/schema/projects/index.ts
export * from "./relations";
export * from "./schema";
export * from "./types";
```

### Step 6: Register in the root barrel export

Add the new feature to `/db/schema/index.ts`:

```typescript
// db/schema/index.ts
export * from "./auth";
export * from "./projects"; // Add this line
```

### Step 7: Push the schema to the database

```bash
pnpm db:push
```

### Step 8: Verify

Run `pnpm build` to ensure no TypeScript errors were introduced.

## Rules

- ALWAYS include `createdAt` and `updatedAt` timestamp columns on every table.
- ALWAYS use `onDelete: "cascade"` on foreign keys referencing the `user` table.
- ALWAYS use snake_case for database column names and camelCase for TypeScript property names.
- ALWAYS register the new schema in `/db/schema/index.ts` -- Drizzle only sees tables that are exported from this barrel.
- ALWAYS run `pnpm db:push` after creating or modifying a schema.
- NEVER modify `/db/schema/auth/` -- those files are managed by Better Auth.
- Use `uuid("id").primaryKey().defaultRandom()` for auto-generated UUIDs or `text("id").primaryKey()` with a custom ID generator (see `ulid-ids.md`).
- Table variables should be singular (`project`, not `projects`). The router or query layer uses plural naming.

## Related Skills

- `column-types.md` -- Reference for all available column types
- `relations.md` -- Detailed guide on defining relations
- `type-exports.md` -- Patterns for exporting types from schemas
- `push-schema.md` -- How to push schema changes
- `ulid-ids.md` -- Alternative ID strategies
