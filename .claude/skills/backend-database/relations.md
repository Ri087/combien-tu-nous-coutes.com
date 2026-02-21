# Define Relations Between Tables

## When to Use

Use this skill when you need to define relationships between Drizzle tables. Relations are required for Drizzle's relational query API (`db.query.table.findMany({ with: { ... } })`). They do NOT create foreign keys in the database -- foreign keys are defined on the columns themselves with `.references()`.

## Prerequisites

- Both tables involved in the relation already exist in `/db/schema/`
- Foreign key columns are already defined on the schema with `.references()`

## Key Concept

Drizzle has two separate concepts:
1. **Foreign keys** (`.references()` on columns) -- enforced at the database level
2. **Relations** (`relations()` function) -- used by Drizzle's query builder for `with` clauses

You need BOTH. The foreign key ensures data integrity. The relation enables the query API.

## Step-by-Step Instructions

### One-to-Many Relation

A user has many projects. A project belongs to one user.

**Schema (foreign key is on the "many" side):**

```typescript
// db/schema/projects/schema.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "../auth/schema";

export const project = pgTable("project", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

**Relations (define both sides):**

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

You must also update the parent's relations file to include the `many` side:

```typescript
// db/schema/auth/relations.ts
import { relations } from "drizzle-orm";
import { account, user } from "./schema";
import { project } from "../projects/schema";

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  projects: many(project), // Add this
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
```

### One-to-One Relation

A user has one profile. A profile belongs to one user.

**Schema:**

```typescript
// db/schema/profiles/schema.ts
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "../auth/schema";

export const profile = pgTable("profile", {
  id: text("id").primaryKey(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  userId: text("user_id")
    .notNull()
    .unique() // IMPORTANT: unique constraint makes it one-to-one
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

**Relations:**

```typescript
// db/schema/profiles/relations.ts
import { relations } from "drizzle-orm";
import { user } from "../auth/schema";
import { profile } from "./schema";

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(user, {
    fields: [profile.userId],
    references: [user.id],
  }),
}));
```

And on the user side:

```typescript
// In db/schema/auth/relations.ts, add to userRelations:
profile: one(profile),
```

Note: For `one()` on the parent side (user -> profile), you do NOT need `fields` and `references` because the foreign key is on the profile side. Drizzle infers it.

### Many-to-Many Relation

Projects have many tags. Tags belong to many projects. This requires a junction (join) table.

**Schema:**

```typescript
// db/schema/tags/schema.ts
import { pgTable, text, timestamp, uuid, primaryKey } from "drizzle-orm/pg-core";
import { project } from "../projects/schema";

export const tag = pgTable("tag", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectTag = pgTable(
  "project_tag",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.tagId] }),
  ],
);
```

**Relations:**

```typescript
// db/schema/tags/relations.ts
import { relations } from "drizzle-orm";
import { project } from "../projects/schema";
import { projectTag, tag } from "./schema";

export const tagRelations = relations(tag, ({ many }) => ({
  projectTags: many(projectTag),
}));

export const projectTagRelations = relations(projectTag, ({ one }) => ({
  project: one(project, {
    fields: [projectTag.projectId],
    references: [project.id],
  }),
  tag: one(tag, {
    fields: [projectTag.tagId],
    references: [tag.id],
  }),
}));
```

And add to the project relations:

```typescript
// In db/schema/projects/relations.ts, add to projectRelations:
projectTags: many(projectTag),
```

**Querying many-to-many:**

```typescript
const projectsWithTags = await db.query.project.findMany({
  with: {
    projectTags: {
      with: {
        tag: true,
      },
    },
  },
});
```

### Self-Referencing Relation

A category can have a parent category and many child categories.

**Schema:**

```typescript
// db/schema/categories/schema.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const category = pgTable("category", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  parentId: uuid("parent_id").references((): AnyPgColumn => category.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

Note: For self-referencing foreign keys, you must type the callback return as `AnyPgColumn`:

```typescript
import type { AnyPgColumn } from "drizzle-orm/pg-core";

parentId: uuid("parent_id").references((): AnyPgColumn => category.id, {
  onDelete: "set null",
}),
```

**Relations:**

```typescript
// db/schema/categories/relations.ts
import { relations } from "drizzle-orm";
import { category } from "./schema";

export const categoryRelations = relations(category, ({ one, many }) => ({
  parent: one(category, {
    fields: [category.parentId],
    references: [category.id],
    relationName: "parentChild",
  }),
  children: many(category, {
    relationName: "parentChild",
  }),
}));
```

**Important:** When a table references itself, you MUST use `relationName` to disambiguate the two sides of the relation.

## Rules

- ALWAYS define both sides of a relation (the `one` side and the `many` side).
- ALWAYS define foreign keys with `.references()` on the column AND define Drizzle relations with `relations()`. They serve different purposes.
- ALWAYS use `onDelete: "cascade"` for foreign keys referencing the `user` table.
- ALWAYS use `relationName` for self-referencing relations to avoid ambiguity.
- ALWAYS add `.unique()` to the foreign key column for one-to-one relations.
- ALWAYS use a junction table for many-to-many relations with a composite `primaryKey`.
- NEVER define relations without corresponding foreign keys on the schema columns.
- NEVER forget to update the parent table's relations file when adding a new child relation.

## Related Skills

- `create-schema.md` -- Full schema creation workflow
- `query-data.md` -- How to query with `with` clauses using relations
- `column-types.md` -- Column type reference for foreign key columns
