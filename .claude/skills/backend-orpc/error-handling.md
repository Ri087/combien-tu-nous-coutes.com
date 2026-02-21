# Handle Errors in oRPC Routes

## When to use

When you need to handle and return meaningful errors from oRPC procedures. This includes not-found errors, authorization failures, validation errors, conflict errors, and unexpected server errors.

## The ORPCError class

oRPC provides `ORPCError` from `@orpc/server` for structured error responses. It maps to standard HTTP status codes.

```typescript
import { ORPCError } from "@orpc/server";

throw new ORPCError("NOT_FOUND", {
  message: "Project not found",
});
```

## Available error codes

| Code | HTTP Status | When to use |
|------|------------|-------------|
| `BAD_REQUEST` | 400 | Invalid input that Zod did not catch, business logic violations |
| `UNAUTHORIZED` | 401 | User is not authenticated (handled by auth middleware) |
| `FORBIDDEN` | 403 | User is authenticated but lacks permission |
| `NOT_FOUND` | 404 | Requested resource does not exist |
| `CONFLICT` | 409 | Duplicate resource, unique constraint violation |
| `UNPROCESSABLE_CONTENT` | 422 | Validation error (automatically thrown by Zod `.input()`) |
| `TOO_MANY_REQUESTS` | 429 | Rate limiting |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

## Error handling patterns

### 1. Not found error

```typescript
import { ORPCError } from "@orpc/server";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { projects } from "@/db/schema";

export const projectsRouter = {
  getById: protectedProcedure
    .route({ method: "GET" })
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      const { db } = context;

      const project = await db.query.projects.findFirst({
        where: eq(projects.id, input.id),
      });

      if (!project) {
        throw new ORPCError("NOT_FOUND", {
          message: "Project not found",
        });
      }

      return project;
    }),
};
```

### 2. Forbidden error (authorization)

```typescript
export const projectsRouter = {
  update: protectedProcedure
    .input(z.object({ id: z.string().uuid(), name: z.string().min(1) }))
    .handler(async ({ context, input }) => {
      const { db, session } = context;

      const project = await db.query.projects.findFirst({
        where: eq(projects.id, input.id),
      });

      if (!project) {
        throw new ORPCError("NOT_FOUND", {
          message: "Project not found",
        });
      }

      if (project.userId !== session.user.id) {
        throw new ORPCError("FORBIDDEN", {
          message: "You do not have permission to update this project",
        });
      }

      const [updated] = await db
        .update(projects)
        .set({ name: input.name, updatedAt: new Date() })
        .where(eq(projects.id, input.id))
        .returning();

      return updated;
    }),
};
```

### 3. Conflict error (duplicate)

```typescript
export const projectsRouter = {
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), slug: z.string().min(1) }))
    .handler(async ({ context, input }) => {
      const { db, session } = context;

      // Check for existing slug
      const existing = await db.query.projects.findFirst({
        where: eq(projects.slug, input.slug),
      });

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "A project with this slug already exists",
        });
      }

      const [project] = await db
        .insert(projects)
        .values({ ...input, userId: session.user.id })
        .returning();

      return project;
    }),
};
```

### 4. Bad request error (business logic)

```typescript
export const projectsRouter = {
  archive: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      const { db, session } = context;

      const project = await db.query.projects.findFirst({
        where: eq(projects.id, input.id),
        with: { tasks: true },
      });

      if (!project) {
        throw new ORPCError("NOT_FOUND", {
          message: "Project not found",
        });
      }

      const hasActiveTasks = project.tasks.some(
        (task) => task.status !== "completed"
      );

      if (hasActiveTasks) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Cannot archive a project with active tasks. Complete or remove all tasks first.",
        });
      }

      const [archived] = await db
        .update(projects)
        .set({ status: "archived", updatedAt: new Date() })
        .where(eq(projects.id, input.id))
        .returning();

      return archived;
    }),
};
```

### 5. Wrapping database errors

```typescript
import { ORPCError } from "@orpc/server";

export const projectsRouter = {
  create: protectedProcedure
    .input(createProjectSchema)
    .handler(async ({ context, input }) => {
      const { db, session } = context;

      try {
        const [project] = await db
          .insert(projects)
          .values({ ...input, userId: session.user.id })
          .returning();
        return project;
      } catch (error) {
        // Handle unique constraint violations from Postgres
        if (
          error instanceof Error &&
          error.message.includes("unique constraint")
        ) {
          throw new ORPCError("CONFLICT", {
            message: "A project with this name already exists",
          });
        }
        // Re-throw unexpected errors (will become 500)
        throw error;
      }
    }),
};
```

### 6. Multiple validation checks

```typescript
export const projectsRouter = {
  transferOwnership: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        newOwnerId: z.string(),
      })
    )
    .handler(async ({ context, input }) => {
      const { db, session } = context;

      const project = await db.query.projects.findFirst({
        where: eq(projects.id, input.projectId),
      });

      if (!project) {
        throw new ORPCError("NOT_FOUND", {
          message: "Project not found",
        });
      }

      if (project.userId !== session.user.id) {
        throw new ORPCError("FORBIDDEN", {
          message: "Only the project owner can transfer ownership",
        });
      }

      if (input.newOwnerId === session.user.id) {
        throw new ORPCError("BAD_REQUEST", {
          message: "You are already the owner of this project",
        });
      }

      const newOwner = await db.query.user.findFirst({
        where: eq(user.id, input.newOwnerId),
      });

      if (!newOwner) {
        throw new ORPCError("NOT_FOUND", {
          message: "Target user not found",
        });
      }

      const [updated] = await db
        .update(projects)
        .set({ userId: input.newOwnerId, updatedAt: new Date() })
        .where(eq(projects.id, input.projectId))
        .returning();

      return updated;
    }),
};
```

## How errors appear on the client

oRPC errors are caught as standard errors on the client side:

```typescript
try {
  await orpcClient.projects.getById({ id: "non-existent" });
} catch (error) {
  if (error instanceof ORPCError) {
    console.log(error.code);    // "NOT_FOUND"
    console.log(error.message); // "Project not found"
    console.log(error.status);  // 404
  }
}
```

With TanStack Query:

```typescript
const mutation = useMutation(
  orpc.projects.create.mutationOptions({
    onError: (error) => {
      // error.message contains the error message
      toast.error(error.message);
    },
  })
);
```

## Rules

- ALWAYS import `ORPCError` from `@orpc/server`
- ALWAYS provide a human-readable `message` in the error options
- ALWAYS check resource existence before operations (throw `NOT_FOUND`)
- ALWAYS check ownership/permissions before mutations (throw `FORBIDDEN`)
- NEVER expose internal error details (database errors, stack traces) to the client
- NEVER catch and swallow errors silently -- either handle them or let them propagate
- Use `NOT_FOUND` for missing resources, NOT `BAD_REQUEST`
- Use `FORBIDDEN` for permission issues, NOT `UNAUTHORIZED` (which is for missing authentication)
- Zod validation errors are handled automatically -- do NOT catch and re-throw them
- Unhandled errors automatically become `INTERNAL_SERVER_ERROR` (500)

## Related skills

- See `route-context.md` for accessing session and checking permissions
- See `input-validation.md` for Zod validation (automatic 422 errors)
- See `mutation-routes.md` for mutation patterns with error handling
- See `protected-procedures.md` for authentication error handling
