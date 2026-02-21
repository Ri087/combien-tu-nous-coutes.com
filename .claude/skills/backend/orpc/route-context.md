# Use Context in oRPC Routes

## When to use

Every oRPC handler receives a `context` object. This guide explains what is available in the context and how to use it depending on the procedure type (public vs. protected).

## How context works in this codebase

Context is defined in `/server/context.ts`:

```typescript
import { os } from "@orpc/server";
import type { Database } from "@/db";

export const base = os.$context<{
  headers: Headers;
  db: Database;
}>();
```

The base context provides `headers` and `db`. These are injected by the API route handler at `/app/api/rpc/[[...rest]]/route.ts`:

```typescript
const { response } = await handler.handle(request, {
  prefix: "/api/rpc",
  context: {
    headers: request.headers,
    db,
  },
});
```

The auth middleware (`/server/middleware/auth.middleware.ts`) adds `session` to the context when using `protectedProcedure`:

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

## Context by procedure type

### Public procedure context

Available properties:
- `context.headers` -- the HTTP request headers (`Headers` object)
- `context.db` -- the Drizzle database instance (`Database` type)

```typescript
import { publicProcedure } from "@/server/procedure/public.procedure";

export const publicRouter = {
  healthCheck: publicProcedure
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      // context.headers: Headers
      // context.db: Database
      const userAgent = context.headers.get("user-agent");
      return { status: "ok", userAgent };
    }),
};
```

### Protected procedure context

Available properties (everything from public, plus session):
- `context.headers` -- the HTTP request headers
- `context.db` -- the Drizzle database instance
- `context.session` -- the authenticated user session

```typescript
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const projectsRouter = {
  list: protectedProcedure
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      // context.headers: Headers
      // context.db: Database
      // context.session: { user: { id, name, email, ... }, session: { id, token, ... } }

      const userId = context.session.user.id;
      return context.db.query.projects.findMany({
        where: eq(projects.userId, userId),
      });
    }),
};
```

## The session object structure

The `session` object comes from Better Auth's `getServerSession()` and has this shape:

```typescript
{
  user: {
    id: string;          // User ID (text, not UUID -- matches auth schema)
    name: string;        // User's display name
    email: string;       // User's email
    emailVerified: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    id: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
    userId: string;
  };
}
```

## Common context usage patterns

### Get the current user ID

```typescript
.handler(async ({ context }) => {
  const userId = context.session.user.id;
  // Use userId for queries, inserts, authorization checks
})
```

### Destructure context

```typescript
.handler(async ({ context }) => {
  const { db, session } = context;
  // Use db and session directly
})
```

### Access request headers

```typescript
.handler(async ({ context }) => {
  const authorization = context.headers.get("authorization");
  const contentType = context.headers.get("content-type");
  const ip = context.headers.get("x-forwarded-for");
})
```

### Use db with session for scoped queries

```typescript
.handler(async ({ context }) => {
  const { db, session } = context;

  // Always scope queries to the current user
  const userProjects = await db.query.projects.findMany({
    where: eq(projects.userId, session.user.id),
  });

  return userProjects;
})
```

## Rules

- ALWAYS destructure `context` inside `.handler()` -- do not use `ctx` as a shorthand variable name (use `context`)
- ALWAYS use `context.session.user.id` (not `context.session.userId`) to get the current user ID
- `context.session` is ONLY available in `protectedProcedure` -- accessing it in `publicProcedure` will be a type error
- NEVER store sensitive data in context manually -- use middleware for context enrichment
- The `context.db` instance is shared across the request -- do not create new database connections
- The `context.headers` object is read-only -- do not attempt to modify it

## Related skills

- See `protected-procedures.md` for the auth middleware chain
- See `public-procedures.md` for unauthenticated routes
- See `database-in-routes.md` for database usage patterns
- See `error-handling.md` for handling missing session errors
