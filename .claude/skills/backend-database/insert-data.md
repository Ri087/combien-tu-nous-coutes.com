# Insert Data with Drizzle

## When to Use

Use this skill when you need to create new records in the database. This covers single inserts, bulk inserts, upserts, and returning inserted data.

## Prerequisites

- Database instance imported from `/db/index.ts`
- Schema table imported from `/db/schema/`

## Import

```typescript
import { db } from "@/db";
import { project } from "@/db/schema/projects/schema";
```

## Step-by-Step Instructions

### Single Insert

```typescript
const newProject = await db
  .insert(project)
  .values({
    name: "My Project",
    userId: context.session.user.id,
  })
  .returning();
```

The `.returning()` call returns an array of inserted rows. For a single insert, access the first element:

```typescript
const [newProject] = await db
  .insert(project)
  .values({
    name: "My Project",
    userId: context.session.user.id,
  })
  .returning();
```

### Return specific columns

```typescript
const [result] = await db
  .insert(project)
  .values({
    name: "My Project",
    userId: context.session.user.id,
  })
  .returning({
    id: project.id,
    name: project.name,
  });
```

### Bulk Insert

Insert multiple records at once by passing an array to `.values()`:

```typescript
const newProjects = await db
  .insert(project)
  .values([
    { name: "Project A", userId: context.session.user.id },
    { name: "Project B", userId: context.session.user.id },
    { name: "Project C", userId: context.session.user.id },
  ])
  .returning();
```

### Insert with All Columns Specified

When you want to be explicit about every value:

```typescript
import { ulid } from "ulid";

const [newProject] = await db
  .insert(project)
  .values({
    id: ulid(), // If using text ID with custom generator
    name: input.name,
    description: input.description ?? null,
    isArchived: false,
    userId: context.session.user.id,
    // createdAt and updatedAt use defaultNow() -- no need to set
  })
  .returning();
```

### Upsert (Insert or Update on Conflict)

Insert a record or update it if a conflict occurs on a unique column:

```typescript
const [result] = await db
  .insert(project)
  .values({
    name: "My Project",
    userId: context.session.user.id,
  })
  .onConflictDoUpdate({
    target: project.id,
    set: {
      name: "Updated Name",
      updatedAt: new Date(),
    },
  })
  .returning();
```

### Insert or Ignore on Conflict

Skip the insert if a conflict occurs:

```typescript
await db
  .insert(project)
  .values({
    name: "My Project",
    userId: context.session.user.id,
  })
  .onConflictDoNothing({
    target: project.id,
  });
```

### Conflict on composite key

```typescript
await db
  .insert(projectTag)
  .values({
    projectId: projectId,
    tagId: tagId,
  })
  .onConflictDoNothing({
    target: [projectTag.projectId, projectTag.tagId],
  });
```

## Usage in oRPC Procedures

```typescript
// orpc/projects.ts
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { db } from "@/db";
import { project } from "@/db/schema/projects/schema";
import { createProjectSchema } from "@/validators/project";

export const projectsRouter = {
  create: protectedProcedure
    .input(createProjectSchema)
    .handler(async ({ context, input }) => {
      const [newProject] = await db
        .insert(project)
        .values({
          name: input.name,
          description: input.description,
          userId: context.session.user.id,
        })
        .returning();

      return newProject;
    }),
};
```

## Common Patterns

### Insert with related data (transaction)

When you need to insert into multiple tables atomically:

```typescript
const result = await db.transaction(async (tx) => {
  const [newProject] = await tx
    .insert(project)
    .values({
      name: input.name,
      userId: context.session.user.id,
    })
    .returning();

  await tx.insert(projectMember).values({
    projectId: newProject.id,
    userId: context.session.user.id,
    role: "owner",
  });

  return newProject;
});
```

### Insert from external data

```typescript
const records = externalData.map((item) => ({
  name: item.name,
  userId: context.session.user.id,
}));

const inserted = await db.insert(project).values(records).returning();
```

## Rules

- ALWAYS use `.returning()` to get the inserted record(s) back.
- ALWAYS destructure with `const [record] = await db.insert(...)` for single inserts.
- ALWAYS set `userId` from `context.session.user.id` in protected procedures -- never trust client input for user identity.
- ALWAYS use `db.transaction()` when inserting into multiple tables that must succeed or fail together.
- NEVER set `createdAt` or `updatedAt` manually unless overriding the default -- `.defaultNow()` handles it.
- NEVER pass user-provided IDs unless explicitly required -- use `.defaultRandom()` or `.$defaultFn()`.

## Related Skills

- `query-data.md` -- Querying inserted data
- `update-data.md` -- Updating existing records
- `delete-data.md` -- Deleting records
- `create-schema.md` -- Defining the schema to insert into
