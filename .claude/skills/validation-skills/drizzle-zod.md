# Drizzle-Zod Integration

## When to Use

When you need to generate Zod validation schemas directly from Drizzle table definitions. This avoids duplicating column constraints between the database schema and the validation layer. Use it for insert/select validation that must stay in sync with the DB schema.

## Prerequisites

- The `drizzle-zod` package must be installed. If not present, install it:

```bash
pnpm add drizzle-zod
```

- A Drizzle table schema exists in `/db/schema/[feature]/schema.ts`

## How It Works

`drizzle-zod` reads a Drizzle `pgTable` definition and produces a Zod schema that mirrors the column types, nullability, and defaults. This means your validation automatically reflects any schema changes after a rebuild.

## Step-by-Step Instructions

### Step 1: Import the generators

```typescript
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { project } from "@/db/schema";
```

### Step 2: Generate base schemas

```typescript
// Generates a Zod schema matching the columns needed for INSERT
// (omits auto-generated columns like id, createdAt, updatedAt)
export const insertProjectSchema = createInsertSchema(project);

// Generates a Zod schema matching all columns returned by SELECT
export const selectProjectSchema = createSelectSchema(project);
```

### Step 3: Inspect what the generated schema contains

For a table like this:

```typescript
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

`createInsertSchema(project)` produces roughly:

```typescript
z.object({
  id: z.string().uuid().optional(),            // has .defaultRandom()
  name: z.string(),                            // notNull, no default
  description: z.string().nullable().optional(),// nullable
  isArchived: z.boolean().optional(),           // has .default(false)
  userId: z.string(),                          // notNull, no default
  createdAt: z.date().optional(),              // has .defaultNow()
  updatedAt: z.date().optional(),              // has .defaultNow()
})
```

`createSelectSchema(project)` produces roughly:

```typescript
z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  isArchived: z.boolean(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
```

## Extending Generated Schemas

The generated schemas provide type-correct validation but lack user-facing error messages and business constraints. Extend them to add those.

### Override specific fields

Pass a refinement callback or object as the second argument to `createInsertSchema`:

```typescript
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { project } from "@/db/schema";

export const insertProjectSchema = createInsertSchema(project, {
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .trim(),
  description: z
    .string()
    .max(500, "Description is too long")
    .nullable()
    .optional(),
});
```

This keeps all other columns as auto-generated but replaces `name` and `description` with your custom Zod schemas.

### Pick only the fields you need

When building a create form, you often only need a subset of columns (excluding `id`, `userId`, `createdAt`, `updatedAt`):

```typescript
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { project } from "@/db/schema";

// Generate the full insert schema with overrides
const baseInsertSchema = createInsertSchema(project, {
  name: z.string().min(1, "Name is required").max(100).trim(),
  description: z.string().max(500).nullable().optional(),
});

// Pick only fields the user should fill in
export const createProjectSchema = baseInsertSchema.pick({
  name: true,
  description: true,
  isArchived: true,
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
```

### Extend with extra fields not in the DB

```typescript
const baseSchema = createInsertSchema(project, {
  name: z.string().min(1, "Name is required").max(100).trim(),
});

// Add fields that are not columns (e.g., confirmation fields)
export const createProjectFormSchema = baseSchema
  .pick({ name: true, description: true })
  .extend({
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms" }),
    }),
  });
```

## Where to Place Drizzle-Zod Schemas

Place Drizzle-Zod generated schemas alongside the Drizzle schema they derive from, NOT in `/validators/`:

```
/db/schema/projects/
  schema.ts       # Table definition
  relations.ts    # Relations
  types.ts        # $inferSelect / $inferInsert types
  validators.ts   # Drizzle-Zod generated schemas  <-- HERE
  index.ts        # Barrel export (include validators.ts)
```

```typescript
// /db/schema/projects/validators.ts
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { project } from "./schema";

export const insertProjectSchema = createInsertSchema(project, {
  name: z.string().min(1, "Name is required").max(100).trim(),
  description: z.string().max(500).nullable().optional(),
});

export const selectProjectSchema = createSelectSchema(project);

export const createProjectSchema = insertProjectSchema.pick({
  name: true,
  description: true,
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
```

Update the barrel export:

```typescript
// /db/schema/projects/index.ts
export * from "./relations";
export * from "./schema";
export * from "./types";
export * from "./validators";
```

Meanwhile, non-DB validators (form-only schemas, auth schemas, etc.) stay in `/validators/[feature].ts`.

## Using in oRPC

```typescript
// /server/routers/projects.ts
import { createProjectSchema } from "@/db/schema/projects";
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const projectsRouter = {
  create: protectedProcedure
    .input(createProjectSchema)
    .handler(async ({ context, input }) => {
      const { db, session } = context;
      const [project] = await db
        .insert(projects)
        .values({ ...input, userId: session.user.id })
        .returning();
      return project;
    }),
};
```

## Using in React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProjectSchema,
  type CreateProjectInput,
} from "@/db/schema/projects";

const form = useForm<CreateProjectInput>({
  resolver: zodResolver(createProjectSchema),
  defaultValues: { name: "", description: "" },
});
```

## createInsertSchema vs createSelectSchema

| Function | Use case | Columns |
|---|---|---|
| `createInsertSchema` | Validate data before INSERT | Marks columns with defaults/auto-values as `.optional()` |
| `createSelectSchema` | Validate data returned by SELECT | All columns required (reflects what the DB returns) |

- Use `createInsertSchema` as the base for create/update forms and oRPC mutation inputs
- Use `createSelectSchema` when validating API responses or testing query results

## Rules

- ALWAYS install `drizzle-zod` before using: `pnpm add drizzle-zod`
- ALWAYS place Drizzle-Zod schemas in `/db/schema/[feature]/validators.ts`, not in `/validators/`
- ALWAYS override fields with user-facing error messages when the schema is used in forms
- ALWAYS use `.pick()` to expose only the fields the user should provide
- ALWAYS export the barrel from `/db/schema/[feature]/index.ts`
- NEVER use generated schemas directly for forms without adding error messages
- NEVER duplicate column constraints manually when `drizzle-zod` can derive them
- Keep non-DB validators (auth, contact forms, etc.) in `/validators/[feature].ts`

## Related Skills

- See `create-validator.md` for manual Zod schema creation
- See `organization.md` for validator file placement rules
- See `shared-schemas.md` for composing schemas with `.extend()`, `.pick()`, `.omit()`
- See `custom-refinements.md` for `.refine()` and `.superRefine()` on top of generated schemas
