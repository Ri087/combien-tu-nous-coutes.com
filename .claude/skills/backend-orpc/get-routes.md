# Create GET Routes (Read Operations)

## When to use

When creating oRPC procedures that read data without modifying it. This includes: listing records, fetching a single record by ID, searching, filtering, and any data retrieval.

## Critical requirement

This codebase uses `StrictGetMethodPlugin` in the API route handler (`/app/api/rpc/[[...rest]]/route.ts`). This plugin enforces that GET requests MUST have `.route({ method: 'GET' })` declared on the procedure. Without it, GET requests will return a **405 Method Not Allowed** error.

The client also uses `DedupeRequestsPlugin` which deduplicates concurrent GET requests. This means multiple components fetching the same data simultaneously will only trigger one network request.

## Steps

### 1. Basic GET route (no input)

```typescript
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { eq } from "drizzle-orm";
import { projects } from "@/db/schema";

export const projectsRouter = {
  list: protectedProcedure
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      const { db, session } = context;
      return db.query.projects.findMany({
        where: eq(projects.userId, session.user.id),
      });
    }),
};
```

### 2. GET route with input parameters

Input on GET routes is serialized as query parameters automatically by the client.

```typescript
import { z } from "zod";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { eq } from "drizzle-orm";
import { projects } from "@/db/schema";

export const projectsRouter = {
  getById: protectedProcedure
    .route({ method: "GET" })
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      const { db } = context;
      return db.query.projects.findFirst({
        where: eq(projects.id, input.id),
      });
    }),
};
```

### 3. GET route with pagination

```typescript
import { z } from "zod";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { eq, desc } from "drizzle-orm";
import { projects } from "@/db/schema";

export const projectsRouter = {
  list: protectedProcedure
    .route({ method: "GET" })
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(20),
        offset: z.number().min(0).optional().default(0),
      })
    )
    .handler(async ({ context, input }) => {
      const { db, session } = context;
      const items = await db.query.projects.findMany({
        where: eq(projects.userId, session.user.id),
        limit: input.limit,
        offset: input.offset,
        orderBy: [desc(projects.createdAt)],
      });

      return { items, limit: input.limit, offset: input.offset };
    }),
};
```

### 4. GET route with search/filter

```typescript
import { z } from "zod";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { eq, and, ilike } from "drizzle-orm";
import { projects } from "@/db/schema";

export const projectsRouter = {
  search: protectedProcedure
    .route({ method: "GET" })
    .input(
      z.object({
        query: z.string().optional(),
        status: z.enum(["active", "archived", "draft"]).optional(),
      })
    )
    .handler(async ({ context, input }) => {
      const { db, session } = context;
      const conditions = [eq(projects.userId, session.user.id)];

      if (input.query) {
        conditions.push(ilike(projects.name, `%${input.query}%`));
      }
      if (input.status) {
        conditions.push(eq(projects.status, input.status));
      }

      return db.query.projects.findMany({
        where: and(...conditions),
      });
    }),
};
```

### 5. GET route with relations

```typescript
export const projectsRouter = {
  getWithTasks: protectedProcedure
    .route({ method: "GET" })
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      const { db } = context;
      return db.query.projects.findFirst({
        where: eq(projects.id, input.id),
        with: {
          tasks: true,
          members: {
            with: { user: true },
          },
        },
      });
    }),
};
```

## How the client calls GET routes

On the client side, GET routes integrate with TanStack Query:

```typescript
// Using the orpc TanStack Query utils (from /orpc/client.ts)
const { data } = useQuery(orpc.projects.list.queryOptions());
const { data } = useQuery(orpc.projects.getById.queryOptions({ input: { id: "123" } }));

// Using the raw client
const projects = await orpcClient.projects.list();
const project = await orpcClient.projects.getById({ id: "123" });
```

## Rules

- ALWAYS add `.route({ method: 'GET' })` to read procedures -- without it, `StrictGetMethodPlugin` returns 405
- The `.route()` call can be placed before or after `.input()`, but MUST be before `.handler()`
- GET route inputs are serialized as query parameters -- keep them simple (strings, numbers, booleans, enums)
- Do NOT use complex nested objects or arrays as GET inputs -- they serialize poorly as query params
- Procedure names for reads should be: `list`, `getById`, `get`, `find`, `search`, `count`
- ALWAYS filter by `session.user.id` when returning user-specific data to prevent data leaks
- Use `.handler()` -- NOT `.query()` (does not exist in oRPC)

## Related skills

- See `mutation-routes.md` for write operations (POST)
- See `http-methods.md` for HTTP method selection guide
- See `route-context.md` for accessing session and db in handlers
- See `input-validation.md` for Zod schema patterns
- See `database-in-routes.md` for Drizzle query patterns
