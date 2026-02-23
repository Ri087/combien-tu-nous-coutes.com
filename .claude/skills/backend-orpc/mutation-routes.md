# Create Mutation Routes (Write Operations)

## When to use

When creating oRPC procedures that modify data: creating, updating, or deleting records. Mutations use POST by default and do NOT need `.route()`.

## Steps

### 1. Create operation

```typescript
import { z } from "zod";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { projects } from "@/db/schema";

export const projectsRouter = {
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(100),
        description: z.string().optional(),
      })
    )
    .handler(async ({ context, input }) => {
      const { db, session } = context;
      const [project] = await db
        .insert(projects)
        .values({
          name: input.name,
          description: input.description,
          userId: session.user.id,
        })
        .returning();
      return project;
    }),
};
```

### 2. Update operation

```typescript
import { z } from "zod";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { eq, and } from "drizzle-orm";
import { projects } from "@/db/schema";

export const projectsRouter = {
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
      })
    )
    .handler(async ({ context, input }) => {
      const { db, session } = context;
      const { id, ...data } = input;

      const [updated] = await db
        .update(projects)
        .set({ ...data, updatedAt: new Date() })
        .where(
          and(eq(projects.id, id), eq(projects.userId, session.user.id))
        )
        .returning();

      if (!updated) {
        throw new ORPCError("NOT_FOUND", {
          message: "Project not found",
        });
      }

      return updated;
    }),
};
```

### 3. Delete operation

```typescript
import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { eq, and } from "drizzle-orm";
import { projects } from "@/db/schema";

export const projectsRouter = {
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      const { db, session } = context;

      const [deleted] = await db
        .delete(projects)
        .where(
          and(eq(projects.id, input.id), eq(projects.userId, session.user.id))
        )
        .returning();

      if (!deleted) {
        throw new ORPCError("NOT_FOUND", {
          message: "Project not found",
        });
      }

      return { success: true };
    }),
};
```

### 4. Bulk operations

```typescript
export const projectsRouter = {
  bulkDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.string().uuid()).min(1).max(50) }))
    .handler(async ({ context, input }) => {
      const { db, session } = context;

      await db
        .delete(projects)
        .where(
          and(
            inArray(projects.id, input.ids),
            eq(projects.userId, session.user.id)
          )
        );

      return { success: true, count: input.ids.length };
    }),
};
```

### 5. Upsert operation

```typescript
export const projectsRouter = {
  upsert: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid().optional(),
        name: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .handler(async ({ context, input }) => {
      const { db, session } = context;

      if (input.id) {
        // Update existing
        const [updated] = await db
          .update(projects)
          .set({
            name: input.name,
            description: input.description,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(projects.id, input.id),
              eq(projects.userId, session.user.id)
            )
          )
          .returning();
        return updated;
      }

      // Create new
      const [created] = await db
        .insert(projects)
        .values({
          name: input.name,
          description: input.description,
          userId: session.user.id,
        })
        .returning();
      return created;
    }),
};
```

## How the client calls mutations

```typescript
// Using the raw client
const project = await orpcClient.projects.create({ name: "My Project" });
await orpcClient.projects.update({ id: "123", name: "Updated Name" });
await orpcClient.projects.delete({ id: "123" });

// Using TanStack Query mutation
const mutation = useMutation(
  orpc.projects.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.projects.list.queryOptions({ input: {} }).queryKey });
    },
  })
);
mutation.mutate({ name: "My Project" });
```

## Rules

- NEVER add `.route()` to mutations -- POST is the default and is correct for write operations
- ALWAYS use `.handler()` -- NOT `.mutation()` (does not exist in oRPC)
- ALWAYS validate input with Zod schemas via `.input()`
- ALWAYS use `.returning()` on insert/update to return the created/updated record
- ALWAYS scope mutations to the current user with `session.user.id` to prevent unauthorized modifications
- ALWAYS handle the case where the record does not exist (throw `ORPCError("NOT_FOUND")`)
- Import `ORPCError` from `@orpc/server` for error handling
- Procedure names for writes should be: `create`, `update`, `delete`, `upsert`, `archive`, `restore`, `bulkDelete`

## Related skills

- See `get-routes.md` for read operations (GET)
- See `http-methods.md` for HTTP method selection guide
- See `error-handling.md` for error handling patterns
- See `input-validation.md` for Zod schema patterns
- See `database-in-routes.md` for Drizzle mutation patterns
