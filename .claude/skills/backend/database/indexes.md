# Add Indexes to Tables

## When to Use

Use this skill when you need to improve query performance by adding indexes. Add indexes on columns that are frequently used in WHERE clauses, JOIN conditions, ORDER BY, or unique constraints.

## Prerequisites

- The table already exists in `/db/schema/`
- You have identified columns that need indexing based on query patterns

## Import

```typescript
import {
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
```

## Step-by-Step Instructions

### Single Column Index

Add indexes using the third argument of `pgTable()`:

```typescript
import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { user } from "../auth/schema";

export const project = pgTable(
  "project",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    status: text("status").notNull().default("active"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("project_user_id_idx").on(table.userId),
  ],
);
```

### Multiple Indexes

```typescript
export const project = pgTable(
  "project",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    status: text("status").notNull().default("active"),
    slug: text("slug").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("project_user_id_idx").on(table.userId),
    index("project_status_idx").on(table.status),
    index("project_created_at_idx").on(table.createdAt),
  ],
);
```

### Unique Index

Ensures no two rows have the same value for the indexed column(s):

```typescript
import { pgTable, text, uuid, uniqueIndex } from "drizzle-orm/pg-core";

export const project = pgTable(
  "project",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    userId: text("user_id").notNull(),
    // ...
  },
  (table) => [
    uniqueIndex("project_slug_idx").on(table.slug),
  ],
);
```

Note: For simple unique constraints on a single column, you can also use `.unique()` directly on the column:

```typescript
slug: text("slug").notNull().unique(),
```

Use `uniqueIndex()` when you need a named index or a composite unique constraint.

### Composite Index (Multiple Columns)

Index on multiple columns for queries that filter on both:

```typescript
export const projectMember = pgTable(
  "project_member",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id").notNull(),
    userId: text("user_id").notNull(),
    role: text("role").notNull().default("member"),
  },
  (table) => [
    index("project_member_project_user_idx").on(table.projectId, table.userId),
  ],
);
```

### Composite Unique Index

Ensures a combination of values is unique:

```typescript
export const projectMember = pgTable(
  "project_member",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id").notNull(),
    userId: text("user_id").notNull(),
    role: text("role").notNull(),
  },
  (table) => [
    uniqueIndex("project_member_unique_idx").on(table.projectId, table.userId),
  ],
);
```

### Partial Index (Conditional Index)

Index only a subset of rows using a WHERE condition:

```typescript
import { sql } from "drizzle-orm";

export const project = pgTable(
  "project",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    isArchived: boolean("is_archived").notNull().default(false),
    userId: text("user_id").notNull(),
  },
  (table) => [
    index("project_active_idx")
      .on(table.userId)
      .where(sql`${table.isArchived} = false`),
  ],
);
```

### Index with Ordering

Specify sort order for the index:

```typescript
export const project = pgTable(
  "project",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    userId: text("user_id").notNull(),
  },
  (table) => [
    index("project_user_created_idx")
      .on(table.userId, table.createdAt.desc()),
  ],
);
```

## After Adding Indexes

Push the schema changes to apply the indexes:

```bash
pnpm db:push
```

## Index Naming Convention

Use this pattern for index names:

```
{table_name}_{column_name(s)}_{type}
```

Examples:
- `project_user_id_idx` -- single column index
- `project_slug_idx` -- unique index on slug
- `project_member_project_user_idx` -- composite index
- `project_active_idx` -- partial index

## When to Add Indexes

Add indexes on:
- **Foreign key columns** -- columns with `.references()` (e.g., `userId`)
- **Columns used in WHERE clauses** frequently
- **Columns used in ORDER BY** clauses
- **Columns used in JOIN** conditions
- **Columns that need uniqueness** beyond `.unique()`

Do NOT add indexes on:
- Columns with very low cardinality (e.g., boolean with mostly the same value)
- Tables with very few rows (indexes add overhead)
- Columns rarely used in queries

## Rules

- ALWAYS add indexes on foreign key columns -- PostgreSQL does not auto-index them.
- ALWAYS use descriptive index names following the naming convention.
- ALWAYS run `pnpm db:push` after adding indexes.
- ALWAYS use `uniqueIndex()` for composite unique constraints.
- NEVER add too many indexes on a single table -- each index slows down writes.
- Prefer `.unique()` on the column definition for simple single-column unique constraints.
- The third argument to `pgTable()` must be a function that returns an array.

## Related Skills

- `create-schema.md` -- Full schema creation workflow
- `push-schema.md` -- Pushing index changes to the database
- `complex-queries.md` -- Understanding which queries benefit from indexes
