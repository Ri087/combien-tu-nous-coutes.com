# Use Public Procedures

## When to use

For oRPC endpoints that do NOT require authentication. Examples include: health checks, public data listings, feature flags, landing page data, and any endpoint accessible to anonymous users.

Public procedures are rare in most applications. Default to `protectedProcedure` unless you have a specific reason to expose an endpoint publicly.

## How public procedures work

The public procedure is simply an alias for the `base` oRPC instance, with no middleware applied:

`/server/procedure/public.procedure.ts`:
```typescript
import { base } from "../context";

export const publicProcedure = base;
```

This means the handler only receives the base context (`headers` and `db`), with no `session`.

## Using public procedures

### Basic usage

```typescript
import { publicProcedure } from "@/server/procedure/public.procedure";

export const publicRouter = {
  healthCheck: publicProcedure
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      // context.headers: Headers
      // context.db: Database
      // NO context.session -- this is a public route
      return { status: "ok", timestamp: new Date().toISOString() };
    }),
};
```

### Public data listing

```typescript
import { z } from "zod";
import { publicProcedure } from "@/server/procedure/public.procedure";
import { eq } from "drizzle-orm";
import { posts } from "@/db/schema";

export const publicRouter = {
  listPublishedPosts: publicProcedure
    .route({ method: "GET" })
    .input(
      z.object({
        limit: z.number().min(1).max(50).optional().default(10),
        offset: z.number().min(0).optional().default(0),
      })
    )
    .handler(async ({ context, input }) => {
      const { db } = context;
      return db.query.posts.findMany({
        where: eq(posts.status, "published"),
        limit: input.limit,
        offset: input.offset,
      });
    }),
};
```

### Public route with optional authentication

Sometimes you want a route that works for both authenticated and anonymous users, returning different data. Use `publicProcedure` and manually check for a session:

```typescript
import { publicProcedure } from "@/server/procedure/public.procedure";
import { getServerSession } from "@/lib/auth/utils";

export const publicRouter = {
  getFeatureFlags: publicProcedure
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      const session = await getServerSession();

      const baseFlags = {
        newDashboard: true,
        betaFeatures: false,
      };

      if (session) {
        // Authenticated users get additional flags
        return {
          ...baseFlags,
          betaFeatures: true,
          userTier: "premium",
        };
      }

      return baseFlags;
    }),
};
```

## Context available in public procedures

```typescript
.handler(async ({ context }) => {
  context.headers;  // Headers -- the HTTP request headers
  context.db;       // Database -- the Drizzle database instance

  // context.session does NOT exist -- TypeScript will error if you try to access it
})
```

## Registering a public router

Public routers are registered the same way as protected routers in `/server/routers/_app.ts`:

```typescript
import { base } from "@/server/context";
import { projectsRouter } from "./projects";
import { publicRouter } from "./public";

export const appRouter = base.router({
  projects: projectsRouter,     // protected routes
  public: publicRouter,          // public routes
});
```

## Common use cases for public procedures

| Use case | Example |
|----------|---------|
| Health check | `GET /api/rpc/public/healthCheck` |
| Public content | `GET /api/rpc/public/listPublishedPosts` |
| Feature flags | `GET /api/rpc/public/getFeatureFlags` |
| App configuration | `GET /api/rpc/public/getConfig` |
| Waitlist signup | `POST /api/rpc/public/joinWaitlist` |
| Contact form | `POST /api/rpc/public/submitContact` |

## Rules

- ALWAYS import from `@/server/procedure/public.procedure`
- ALWAYS use `publicProcedure` ONLY when the endpoint genuinely needs to be unauthenticated
- NEVER access `context.session` in public procedures -- it does not exist and TypeScript will error
- NEVER expose user-specific data through public procedures without explicit authentication checks
- NEVER use public procedures for any operation that modifies user data
- ALWAYS add `.route({ method: 'GET' })` for read operations, even on public procedures (StrictGetMethodPlugin still applies)
- Default to `protectedProcedure` -- only use `publicProcedure` when you have a clear reason
- If you need optional authentication, use `publicProcedure` and manually call `getServerSession()`
- Public mutations should be rate-limited and validated carefully to prevent abuse

## Related skills

- See `protected-procedures.md` for authenticated endpoints (the default)
- See `route-context.md` for context details
- See `get-routes.md` for GET route requirements
- See `create-router.md` for the full router pattern
