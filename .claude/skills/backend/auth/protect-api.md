# Protect API Routes / oRPC Procedures with Auth Middleware

## When to Use

Use this skill when you need to:
- Create a new oRPC procedure that requires authentication
- Understand how the auth middleware works in oRPC
- Access the authenticated user's session inside a procedure handler
- Create public (unauthenticated) procedures

## Architecture

The oRPC auth system follows this chain:

```
base (os.$context)
  -> publicProcedure (= base, no middleware)
  -> protectedProcedure (= publicProcedure + authMiddleware)
```

### Context Type

Defined in `/server/context.ts`:

```typescript
import { os } from "@orpc/server";
import type { Database } from "@/db";

export const base = os.$context<{
  headers: Headers;
  db: Database;
}>();
```

The base context provides `headers` and `db` to all procedures.

### Public Procedure

Defined in `/server/procedure/public.procedure.ts`:

```typescript
import { base } from "../context";

export const publicProcedure = base;
```

No middleware -- anyone can call public procedures.

### Auth Middleware

Defined in `/server/middleware/auth.middleware.ts`:

```typescript
import { ORPCError } from "@orpc/server";
import { getServerSession } from "@/lib/auth/utils";
import { base } from "../context";

export const authMiddleware = base.middleware(async (opts) => {
  const { next } = opts;

  const session = await getServerSession();

  if (!session) {
    throw new ORPCError("UNAUTHORIZED");
  }

  return next({ context: { session } });
});
```

**How it works**:
1. Calls `getServerSession()` to check if the request has a valid session cookie
2. If no session, throws `ORPCError("UNAUTHORIZED")` (returns HTTP 401)
3. If session exists, adds `session` to the context and continues to the handler

### Protected Procedure

Defined in `/server/procedure/protected.procedure.ts`:

```typescript
import { authMiddleware } from "../middleware/auth.middleware";
import { publicProcedure } from "./public.procedure";

export const protectedProcedure = publicProcedure.use(authMiddleware);
```

Any procedure built from `protectedProcedure` automatically requires authentication and has access to `ctx.session`.

## Creating a Protected Procedure

### Step 1: Create the Router File

Create a new file in `/orpc/[feature].ts`:

```typescript
// /orpc/projects.ts
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { z } from "zod";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { projects } from "@/db/schema";

export const projectsRouter = {
  // READ procedure: MUST use .route({ method: 'GET' })
  list: protectedProcedure
    .route({ method: "GET" })
    .input(z.object({ limit: z.number().optional() }))
    .handler(async ({ ctx, input }) => {
      // ctx.session is typed and guaranteed non-null
      return db.query.projects.findMany({
        where: eq(projects.userId, ctx.session.user.id),
        limit: input.limit ?? 10,
      });
    }),

  // READ procedure: single item
  getById: protectedProcedure
    .route({ method: "GET" })
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ ctx, input }) => {
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, input.id),
      });

      if (!project || project.userId !== ctx.session.user.id) {
        throw new ORPCError("NOT_FOUND");
      }

      return project;
    }),

  // WRITE procedure: NO .route() -- defaults to POST
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .handler(async ({ ctx, input }) => {
      const [project] = await db
        .insert(projects)
        .values({
          name: input.name,
          userId: ctx.session.user.id,
        })
        .returning();
      return project;
    }),

  // WRITE procedure: update
  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(1),
    }))
    .handler(async ({ ctx, input }) => {
      const [updated] = await db
        .update(projects)
        .set({ name: input.name })
        .where(eq(projects.id, input.id))
        .returning();
      return updated;
    }),

  // WRITE procedure: delete
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ ctx, input }) => {
      await db.delete(projects).where(eq(projects.id, input.id));
      return { success: true };
    }),
};
```

### Step 2: Register the Router

Add it to `/server/routers/_app.ts`:

```typescript
import { base } from "@/server/context";
import { projectsRouter } from "@/orpc/projects";

export const appRouter = base.router({
  projects: projectsRouter,
});
```

## Accessing Session in Handlers

Inside any `protectedProcedure` handler, the `ctx` parameter includes the full session:

```typescript
.handler(async ({ ctx, input }) => {
  // User info
  const userId = ctx.session.user.id;          // string
  const userName = ctx.session.user.name;       // string
  const userEmail = ctx.session.user.email;     // string
  const isVerified = ctx.session.user.emailVerified; // boolean

  // Session info
  const sessionId = ctx.session.session.id;
  const sessionToken = ctx.session.session.token;
  const expiresAt = ctx.session.session.expiresAt;
})
```

## Creating a Public Procedure

For endpoints that don't require authentication:

```typescript
import { publicProcedure } from "@/server/procedure/public.procedure";
import { z } from "zod";

export const publicRouter = {
  // Public read endpoint
  getPublicData: publicProcedure
    .route({ method: "GET" })
    .handler(async () => {
      return { status: "ok" };
    }),
};
```

**Note**: In public procedures, `ctx.session` does NOT exist. If you need optional auth (check if user is logged in but don't require it), create a custom middleware.

## Custom Middleware for Optional Auth

If you need a procedure that works for both authenticated and unauthenticated users:

```typescript
import { getServerSession } from "@/lib/auth/utils";
import { base } from "@/server/context";

export const optionalAuthMiddleware = base.middleware(async (opts) => {
  const { next } = opts;
  const session = await getServerSession();
  // Don't throw -- just pass null if no session
  return next({ context: { session } });
});

// Use it:
const optionalAuthProcedure = publicProcedure.use(optionalAuthMiddleware);

export const someRouter = {
  getData: optionalAuthProcedure
    .route({ method: "GET" })
    .handler(async ({ ctx }) => {
      if (ctx.session) {
        // User is authenticated
        return { personalized: true, userId: ctx.session.user.id };
      }
      // User is anonymous
      return { personalized: false };
    }),
};
```

## Error Handling in Protected Procedures

The auth middleware throws `ORPCError("UNAUTHORIZED")` which maps to HTTP 401. You can throw other oRPC errors in your handlers:

```typescript
import { ORPCError } from "@orpc/server";

.handler(async ({ ctx, input }) => {
  const item = await db.query.items.findFirst({
    where: eq(items.id, input.id),
  });

  if (!item) {
    throw new ORPCError("NOT_FOUND");           // 404
  }

  if (item.userId !== ctx.session.user.id) {
    throw new ORPCError("FORBIDDEN");            // 403
  }

  return item;
})
```

Common ORPCError codes:
- `"UNAUTHORIZED"` - 401, not authenticated
- `"FORBIDDEN"` - 403, authenticated but not allowed
- `"NOT_FOUND"` - 404, resource doesn't exist
- `"BAD_REQUEST"` - 400, invalid input
- `"INTERNAL_SERVER_ERROR"` - 500, unexpected error

## Rules

- ALWAYS use `protectedProcedure` for any endpoint that accesses user data
- ALWAYS use `.route({ method: "GET" })` for read procedures (list, get, find, search)
- NEVER add `.route()` for write procedures (create, update, delete) -- POST is the default
- ALWAYS use `.handler()` -- never `.query()` or `.mutation()` (they don't exist in oRPC)
- ALWAYS scope database queries by `ctx.session.user.id` to prevent unauthorized data access
- ALWAYS register new routers in `/server/routers/_app.ts`
- NEVER import `auth` directly in procedure files -- use `ctx.session` from the middleware
- The server uses `StrictGetMethodPlugin`: a GET request to a procedure without `.route({ method: "GET" })` returns 405

## Related Skills

- `session-check.md` - How `getServerSession()` works
- `overview.md` - Auth architecture and middleware chain
- `protect-pages.md` - Page-level protection with layouts
