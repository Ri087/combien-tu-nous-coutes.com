# JSON Columns with TypeScript Types

## When to Use

Use this skill when you need to store structured data that does not warrant its own table -- such as settings, metadata, configuration objects, or flexible key-value data. JSON columns let you store and query structured data while maintaining TypeScript type safety.

## Prerequisites

- A Drizzle table where you want to add a JSON column
- A TypeScript interface or type for the JSON structure

## Import

```typescript
import { pgTable, text, uuid, json, jsonb } from "drizzle-orm/pg-core";
```

## json vs jsonb

| Feature | `json()` | `jsonb()` |
|---------|----------|-----------|
| Storage | Stored as text | Stored as binary |
| Query performance | Slower for queries | Faster for queries |
| Indexing | Not indexable | Supports GIN indexes |
| Duplicate keys | Preserves duplicates | Removes duplicates |
| Key order | Preserves order | Does not preserve order |

**Always prefer `jsonb()` over `json()`.** It is more efficient and supports indexing.

## Step-by-Step Instructions

### Step 1: Define the TypeScript type

Create the type for the JSON data structure:

```typescript
// db/schema/projects/types.ts (or a separate types file)

export type ProjectSettings = {
  theme: "light" | "dark";
  notifications: {
    email: boolean;
    push: boolean;
  };
  language: string;
};

export type ProjectMetadata = {
  source?: string;
  tags?: string[];
  customFields?: Record<string, string>;
};
```

### Step 2: Use `.$type<T>()` on the column

```typescript
// db/schema/projects/schema.ts
import { pgTable, text, uuid, jsonb, timestamp } from "drizzle-orm/pg-core";
import { user } from "../auth/schema";
import type { ProjectSettings, ProjectMetadata } from "./types";

export const project = pgTable("project", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  settings: jsonb("settings").$type<ProjectSettings>().notNull().default({
    theme: "light",
    notifications: { email: true, push: false },
    language: "en",
  }),
  metadata: jsonb("metadata").$type<ProjectMetadata>().default({}),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### Step 3: Insert with typed JSON

```typescript
const [newProject] = await db
  .insert(project)
  .values({
    name: "My Project",
    userId: ctx.user.id,
    settings: {
      theme: "dark",
      notifications: { email: true, push: true },
      language: "fr",
    },
    metadata: {
      source: "import",
      tags: ["important", "v2"],
    },
  })
  .returning();
```

TypeScript will enforce the correct shape. An incorrect structure will cause a compile error:

```typescript
// This will NOT compile:
settings: {
  theme: "blue", // Error: "blue" is not assignable to "light" | "dark"
},
```

### Step 4: Query and access typed JSON

```typescript
const result = await db.query.project.findFirst({
  where: eq(project.id, projectId),
});

if (result) {
  // TypeScript knows the shape
  const theme = result.settings.theme; // "light" | "dark"
  const emailEnabled = result.settings.notifications.email; // boolean
  const tags = result.metadata?.tags; // string[] | undefined
}
```

### Step 5: Update JSON columns

#### Replace entire JSON value

```typescript
const [updated] = await db
  .update(project)
  .set({
    settings: {
      theme: "dark",
      notifications: { email: false, push: true },
      language: "en",
    },
    updatedAt: new Date(),
  })
  .where(eq(project.id, projectId))
  .returning();
```

#### Merge with existing value (read-modify-write)

Drizzle does not have built-in JSON merge. Use a read-modify-write pattern:

```typescript
const existing = await db.query.project.findFirst({
  where: eq(project.id, projectId),
  columns: { settings: true },
});

if (!existing) throw new Error("Project not found");

const [updated] = await db
  .update(project)
  .set({
    settings: {
      ...existing.settings,
      theme: "dark", // Override just this field
    },
    updatedAt: new Date(),
  })
  .where(eq(project.id, projectId))
  .returning();
```

#### Update a nested JSON field with raw SQL

For atomic updates without reading first:

```typescript
import { sql } from "drizzle-orm";

await db
  .update(project)
  .set({
    settings: sql`jsonb_set(${project.settings}, '{theme}', '"dark"')`,
    updatedAt: new Date(),
  })
  .where(eq(project.id, projectId));
```

## Common Patterns

### Array JSON column

```typescript
type Tag = {
  id: string;
  name: string;
  color: string;
};

export const project = pgTable("project", {
  // ...
  tags: jsonb("tags").$type<Tag[]>().notNull().default([]),
});
```

### Nullable JSON column

```typescript
export const project = pgTable("project", {
  // ...
  metadata: jsonb("metadata").$type<ProjectMetadata>(), // nullable by default
});
```

### JSON column with default value

```typescript
export const project = pgTable("project", {
  // ...
  settings: jsonb("settings")
    .$type<ProjectSettings>()
    .notNull()
    .default({
      theme: "light",
      notifications: { email: true, push: false },
      language: "en",
    }),
});
```

### Query filtering on JSON fields

Use raw SQL for JSON-based WHERE conditions:

```typescript
import { sql } from "drizzle-orm";

// Filter by a JSON field value
const darkProjects = await db
  .select()
  .from(project)
  .where(sql`${project.settings}->>'theme' = 'dark'`);

// Filter by nested JSON field
const emailEnabledProjects = await db
  .select()
  .from(project)
  .where(sql`${project.settings}->'notifications'->>'email' = 'true'`);

// Check if JSON array contains a value
const taggedProjects = await db
  .select()
  .from(project)
  .where(sql`${project.metadata}->'tags' ? 'important'`);
```

### Zod validation for JSON input

```typescript
// validators/project.ts
import { z } from "zod";

export const projectSettingsSchema = z.object({
  theme: z.enum(["light", "dark"]),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
  }),
  language: z.string().min(2).max(5),
});

export type ProjectSettings = z.infer<typeof projectSettingsSchema>;
```

Then use the same type for both the Zod schema and the Drizzle column:

```typescript
import type { ProjectSettings } from "@/validators/project";

settings: jsonb("settings").$type<ProjectSettings>().notNull().default({...}),
```

## Rules

- ALWAYS use `jsonb()` instead of `json()` -- `jsonb` is more efficient and queryable.
- ALWAYS use `.$type<T>()` to provide TypeScript type safety for JSON columns.
- ALWAYS define the TypeScript type/interface for JSON data in `types.ts` or a validators file.
- ALWAYS provide a `.default()` value for non-nullable JSON columns.
- ALWAYS validate JSON input with Zod before inserting into the database.
- NEVER store data in JSON that you need to query frequently -- use a proper table with columns instead.
- NEVER store relational data in JSON columns -- use foreign keys and relations.
- Use the read-modify-write pattern for partial JSON updates unless you need atomic updates (use `jsonb_set` for those).

## Related Skills

- `column-types.md` -- Overview of all column types including json/jsonb
- `create-schema.md` -- Full schema creation workflow
- `type-exports.md` -- Exporting types from schemas
- `query-data.md` -- Querying data including JSON fields
