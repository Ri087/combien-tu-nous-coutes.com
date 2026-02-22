# Update Data with Drizzle

## When to Use

Use this skill when you need to modify existing records in the database. This covers single-row updates, bulk updates, conditional updates, and returning updated data.

## Prerequisites

- Database instance imported from `/db/index.ts`
- Schema table imported from `/db/schema/`
- Operators imported from `drizzle-orm`

## Import

```typescript
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { project } from "@/db/schema/projects/schema";
```

## Step-by-Step Instructions

### Update a Single Record by ID

```typescript
const [updated] = await db
  .update(project)
  .set({
    name: "New Name",
    updatedAt: new Date(),
  })
  .where(eq(project.id, projectId))
  .returning();
```

### Update with Ownership Check

Always verify that the current user owns the record:

```typescript
const [updated] = await db
  .update(project)
  .set({
    name: input.name,
    description: input.description,
    updatedAt: new Date(),
  })
  .where(
    and(
      eq(project.id, input.id),
      eq(project.userId, context.session.user.id),
    ),
  )
  .returning();

if (!updated) {
  throw new Error("Project not found or access denied");
}
```

### Return Specific Columns

```typescript
const [result] = await db
  .update(project)
  .set({ name: "Updated" })
  .where(eq(project.id, projectId))
  .returning({
    id: project.id,
    name: project.name,
    updatedAt: project.updatedAt,
  });
```

### Bulk Update (Update Multiple Records)

Update all records matching a condition:

```typescript
const updatedProjects = await db
  .update(project)
  .set({
    isArchived: true,
    updatedAt: new Date(),
  })
  .where(eq(project.userId, userId))
  .returning();
```

### Conditional Update with Multiple Where Clauses

```typescript
const [updated] = await db
  .update(project)
  .set({
    status: "published",
    updatedAt: new Date(),
  })
  .where(
    and(
      eq(project.id, projectId),
      eq(project.userId, context.session.user.id),
      eq(project.status, "draft"), // Only update if currently draft
    ),
  )
  .returning();
```

### Increment a Numeric Value

Use `sql` for expressions:

```typescript
import { sql } from "drizzle-orm";

const [updated] = await db
  .update(project)
  .set({
    viewCount: sql`${project.viewCount} + 1`,
    updatedAt: new Date(),
  })
  .where(eq(project.id, projectId))
  .returning();
```

### Toggle a Boolean

```typescript
import { sql, not } from "drizzle-orm";

const [updated] = await db
  .update(project)
  .set({
    isArchived: not(project.isArchived),
    updatedAt: new Date(),
  })
  .where(eq(project.id, projectId))
  .returning();
```

### Partial Update (Only Changed Fields)

When the input contains optional fields, spread only the defined values:

```typescript
const updateData: Partial<typeof project.$inferInsert> = {};

if (input.name !== undefined) updateData.name = input.name;
if (input.description !== undefined) updateData.description = input.description;

const [updated] = await db
  .update(project)
  .set({
    ...updateData,
    updatedAt: new Date(),
  })
  .where(
    and(
      eq(project.id, input.id),
      eq(project.userId, context.session.user.id),
    ),
  )
  .returning();
```

## Usage in oRPC Procedures

```typescript
// orpc/projects.ts
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { project } from "@/db/schema/projects/schema";
import { updateProjectSchema } from "@/validators/project";

export const projectsRouter = {
  update: protectedProcedure
    .input(updateProjectSchema)
    .handler(async ({ context, input }) => {
      const [updated] = await db
        .update(project)
        .set({
          name: input.name,
          description: input.description,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(project.id, input.id),
            eq(project.userId, context.session.user.id),
          ),
        )
        .returning();

      if (!updated) {
        throw new Error("Project not found");
      }

      return updated;
    }),
};
```

## Update in a Transaction

When you need to update multiple tables atomically:

```typescript
const result = await db.transaction(async (tx) => {
  const [updatedProject] = await tx
    .update(project)
    .set({ name: input.name, updatedAt: new Date() })
    .where(eq(project.id, input.id))
    .returning();

  await tx
    .update(projectMember)
    .set({ role: "admin", updatedAt: new Date() })
    .where(
      and(
        eq(projectMember.projectId, input.id),
        eq(projectMember.userId, context.session.user.id),
      ),
    );

  return updatedProject;
});
```

## Rules

- ALWAYS include `updatedAt: new Date()` in the `.set()` call to track when the record was modified.
- ALWAYS include an ownership check (`eq(table.userId, context.session.user.id)`) in protected procedures.
- ALWAYS use `.returning()` to get the updated record back.
- ALWAYS check if the returned value is `undefined` to handle the "not found" case.
- ALWAYS use `db.transaction()` when updating multiple tables atomically.
- NEVER update without a `.where()` clause -- this would update ALL rows.
- NEVER trust client input for `userId` -- always use `context.session.user.id`.

## Related Skills

- `query-data.md` -- Reading data before or after updates
- `insert-data.md` -- Creating new records
- `delete-data.md` -- Deleting records
- `complex-queries.md` -- Using SQL expressions in updates
