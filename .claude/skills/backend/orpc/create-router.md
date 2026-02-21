# Create an oRPC Router

## When to use

When adding a new feature that needs API endpoints (CRUD operations, data fetching, etc.). Each feature should have its own router file that groups related procedures together.

## Steps

### 1. Create the router file

Create `/server/routers/[feature].ts`. The router is a plain object where each key is a procedure name.

```typescript
// /server/routers/projects.ts
import { z } from "zod";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { eq } from "drizzle-orm";
import { projects } from "@/db/schema";

export const projectsRouter = {
  // Read operation: MUST have .route({ method: 'GET' })
  list: protectedProcedure
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      const { db, session } = context;
      return db.query.projects.findMany({
        where: eq(projects.userId, session.user.id),
      });
    }),

  // Read by ID: MUST have .route({ method: 'GET' })
  getById: protectedProcedure
    .route({ method: "GET" })
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      const { db, session } = context;
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, input.id),
      });
      return project ?? null;
    }),

  // Write operation: NO .route() needed (POST by default)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
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

  // Update operation: NO .route() needed (POST by default)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
      })
    )
    .handler(async ({ context, input }) => {
      const { db, session } = context;
      const { id, ...data } = input;
      const [updated] = await db
        .update(projects)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(projects.id, id))
        .returning();
      return updated;
    }),

  // Delete operation: NO .route() needed (POST by default)
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      const { db } = context;
      await db.delete(projects).where(eq(projects.id, input.id));
      return { success: true };
    }),
};
```

### 2. Register in the app router

Add to `/server/routers/_app.ts`:

```typescript
import { base } from "@/server/context";
import { projectsRouter } from "./projects";

export const appRouter = base.router({
  projects: projectsRouter,
});
```

### 3. Verify the build

```bash
pnpm build
```

## Router structure pattern

A router is always a plain object. Each key becomes a procedure path on the API:

```typescript
export const myRouter = {
  procedureName: protectedProcedure
    .input(schema)       // optional: Zod validation
    .route({ method: 'GET' })  // required for reads, omit for writes
    .handler(async ({ context, input }) => {
      // implementation
    }),
};
```

The resulting API paths follow the pattern `/api/rpc/[routerKey]/[procedureName]`.
For the example above, the `list` procedure would be accessible at `/api/rpc/projects/list`.

## Rules

- ALWAYS use `protectedProcedure` for authenticated endpoints
- ALWAYS add `.route({ method: 'GET' })` for read operations (list, get, find, search)
- NEVER add `.route()` for mutations (create, update, delete) -- POST is the default
- Use `.handler()` -- NOT `.query()` or `.mutation()` (those do not exist in oRPC)
- Access `context.db` for database operations
- Access `context.session` for the authenticated user (only available with `protectedProcedure`)
- Import validators from `/validators/` when they are shared with the frontend
- A router file should export a single router object for the feature
- The router object keys become the procedure names in the API path

## Related skills

- See `register-router.md` for detailed registration instructions
- See `get-routes.md` for GET route specifics
- See `mutation-routes.md` for mutation specifics
- See `input-validation.md` for Zod validation patterns
- See `route-context.md` for context usage details
- See `error-handling.md` for error handling patterns
- See `database-in-routes.md` for database query patterns
