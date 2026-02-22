# Delete Data with Drizzle

## When to Use

Use this skill when you need to remove records from the database. This covers single deletes, bulk deletes, soft deletes, and cascading delete behavior.

## Prerequisites

- Database instance imported from `/db/index.ts`
- Schema table imported from `/db/schema/`
- Operators imported from `drizzle-orm`

## Import

```typescript
import { db } from "@/db";
import { eq, and, lt, inArray } from "drizzle-orm";
import { project } from "@/db/schema/projects/schema";
```

## Step-by-Step Instructions

### Delete a Single Record by ID

```typescript
const [deleted] = await db
  .delete(project)
  .where(eq(project.id, projectId))
  .returning();
```

### Delete with Ownership Check

Always verify that the current user owns the record before deleting:

```typescript
const [deleted] = await db
  .delete(project)
  .where(
    and(
      eq(project.id, projectId),
      eq(project.userId, context.session.user.id),
    ),
  )
  .returning();

if (!deleted) {
  throw new Error("Project not found or access denied");
}
```

### Return Specific Columns After Delete

```typescript
const [deleted] = await db
  .delete(project)
  .where(eq(project.id, projectId))
  .returning({
    id: project.id,
    name: project.name,
  });
```

### Bulk Delete (Multiple Records)

Delete all records matching a condition:

```typescript
const deletedProjects = await db
  .delete(project)
  .where(eq(project.isArchived, true))
  .returning();
```

### Delete Multiple Records by IDs

```typescript
const deletedProjects = await db
  .delete(project)
  .where(
    and(
      inArray(project.id, projectIds),
      eq(project.userId, context.session.user.id),
    ),
  )
  .returning();
```

### Delete Old Records

```typescript
const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

const deleted = await db
  .delete(project)
  .where(lt(project.createdAt, cutoffDate))
  .returning();
```

## Soft Delete Pattern

Instead of removing the record, set a `deletedAt` timestamp. This preserves data for auditing.

### Schema with soft delete column

```typescript
// In schema.ts
export const project = pgTable("project", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  deletedAt: timestamp("deleted_at"), // null = not deleted
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### Soft delete implementation

```typescript
const [softDeleted] = await db
  .update(project)
  .set({
    deletedAt: new Date(),
    updatedAt: new Date(),
  })
  .where(
    and(
      eq(project.id, projectId),
      eq(project.userId, context.session.user.id),
    ),
  )
  .returning();
```

### Query excluding soft-deleted records

```typescript
const activeProjects = await db.query.project.findMany({
  where: and(
    eq(project.userId, context.session.user.id),
    isNull(project.deletedAt),
  ),
});
```

### Restore a soft-deleted record

```typescript
const [restored] = await db
  .update(project)
  .set({
    deletedAt: null,
    updatedAt: new Date(),
  })
  .where(eq(project.id, projectId))
  .returning();
```

## Usage in oRPC Procedures

```typescript
// orpc/projects.ts
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { project } from "@/db/schema/projects/schema";
import { z } from "zod";

export const projectsRouter = {
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      const [deleted] = await db
        .delete(project)
        .where(
          and(
            eq(project.id, input.id),
            eq(project.userId, context.session.user.id),
          ),
        )
        .returning();

      if (!deleted) {
        throw new Error("Project not found");
      }

      return deleted;
    }),
};
```

## Delete in a Transaction

When you need to delete related records atomically:

```typescript
const result = await db.transaction(async (tx) => {
  // Delete child records first (if not using CASCADE)
  await tx
    .delete(projectMember)
    .where(eq(projectMember.projectId, projectId));

  // Then delete the parent record
  const [deleted] = await tx
    .delete(project)
    .where(
      and(
        eq(project.id, projectId),
        eq(project.userId, context.session.user.id),
      ),
    )
    .returning();

  return deleted;
});
```

Note: If you defined `onDelete: "cascade"` on the foreign key, child records are automatically deleted when the parent is deleted. Transactions are only needed when cascade is not configured.

## Cascade Behavior

When a foreign key is defined with `onDelete: "cascade"`:

```typescript
userId: text("user_id")
  .notNull()
  .references(() => user.id, { onDelete: "cascade" }),
```

Deleting the user automatically deletes all related records. No need for a transaction or manual cleanup.

## Rules

- ALWAYS include an ownership check (`eq(table.userId, context.session.user.id)`) in protected procedures.
- ALWAYS use `.returning()` to confirm which records were deleted.
- ALWAYS check if the returned value is `undefined` to handle the "not found" case.
- ALWAYS use `onDelete: "cascade"` on foreign keys to the user table so user deletion cleans up related data.
- NEVER delete without a `.where()` clause -- this would delete ALL rows.
- NEVER trust client input for determining which records to delete without ownership verification.
- Consider using soft delete for records that may need to be recovered or audited.

## Related Skills

- `query-data.md` -- Querying data (including filtering soft-deleted records)
- `insert-data.md` -- Creating records
- `update-data.md` -- Updating records (soft delete uses update)
- `create-schema.md` -- Adding `deletedAt` column for soft delete
