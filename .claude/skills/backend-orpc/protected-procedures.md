# Use Protected Procedures

## When to use

For any oRPC endpoint that requires the user to be authenticated. This is the default for most application endpoints. Protected procedures automatically verify the user session and provide it in the context.

## How protected procedures work

The chain is:

1. **`base`** (`/server/context.ts`) -- creates the oRPC instance with base context (`headers`, `db`)
2. **`publicProcedure`** (`/server/procedure/public.procedure.ts`) -- alias for `base`, no middleware
3. **`authMiddleware`** (`/server/middleware/auth.middleware.ts`) -- checks session, adds `session` to context
4. **`protectedProcedure`** (`/server/procedure/protected.procedure.ts`) -- `publicProcedure.use(authMiddleware)`

### Source files

`/server/context.ts`:
```typescript
import { os } from "@orpc/server";
import type { Database } from "@/db";

export const base = os.$context<{
  headers: Headers;
  db: Database;
}>();
```

`/server/procedure/public.procedure.ts`:
```typescript
import { base } from "../context";

export const publicProcedure = base;
```

`/server/middleware/auth.middleware.ts`:
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

`/server/procedure/protected.procedure.ts`:
```typescript
import { authMiddleware } from "../middleware/auth.middleware";
import { publicProcedure } from "./public.procedure";

export const protectedProcedure = publicProcedure.use(authMiddleware);
```

## Using protected procedures

### Basic usage

```typescript
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const projectsRouter = {
  list: protectedProcedure
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      const { db, session } = context;
      // session is guaranteed to exist here
      // session.user.id is the authenticated user's ID
      return db.query.projects.findMany({
        where: eq(projects.userId, session.user.id),
      });
    }),
};
```

### With input validation

```typescript
import { z } from "zod";
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const projectsRouter = {
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .handler(async ({ context, input }) => {
      const { db, session } = context;
      const [project] = await db
        .insert(projects)
        .values({
          name: input.name,
          userId: session.user.id,
        })
        .returning();
      return project;
    }),
};
```

### Context available in protected procedures

```typescript
.handler(async ({ context }) => {
  // From base context:
  context.headers;           // Headers object
  context.db;                // Drizzle database instance

  // Added by auth middleware:
  context.session.user.id;           // string
  context.session.user.name;         // string
  context.session.user.email;        // string
  context.session.user.emailVerified; // boolean
  context.session.user.image;        // string | null
  context.session.user.createdAt;    // Date
  context.session.user.updatedAt;    // Date

  context.session.session.id;        // string
  context.session.session.token;     // string
  context.session.session.expiresAt; // Date
  context.session.session.userId;    // string
})
```

## What happens when a user is not authenticated

When a request hits a `protectedProcedure` without a valid session:

1. The `authMiddleware` calls `getServerSession()`
2. `getServerSession()` returns `null` (no valid session cookie)
3. The middleware throws `ORPCError("UNAUTHORIZED")`
4. oRPC returns a **401 Unauthorized** response to the client
5. The handler function is never executed

The client receives an error, which can be handled:

```typescript
// Client-side error handling
try {
  await orpcClient.projects.list();
} catch (error) {
  // error.code === "UNAUTHORIZED"
  // Redirect to sign-in page
}
```

## Creating custom middleware that builds on protected

If you need additional authorization beyond authentication (e.g., role-based access):

```typescript
// /server/middleware/admin.middleware.ts
import { ORPCError } from "@orpc/server";
import { base } from "../context";

export const adminMiddleware = base.middleware(async (opts) => {
  const { next, context } = opts;

  // context.session is available because this runs after authMiddleware
  // Check if user has admin role (assuming you have a role field)
  if (context.session.user.role !== "admin") {
    throw new ORPCError("FORBIDDEN", {
      message: "Admin access required",
    });
  }

  return next({ context: {} });
});

// /server/procedure/admin.procedure.ts
import { protectedProcedure } from "./protected.procedure";
import { adminMiddleware } from "../middleware/admin.middleware";

export const adminProcedure = protectedProcedure.use(adminMiddleware);
```

Usage:

```typescript
import { adminProcedure } from "@/server/procedure/admin.procedure";

export const adminRouter = {
  listAllUsers: adminProcedure
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      return context.db.query.user.findMany();
    }),
};
```

## Rules

- ALWAYS use `protectedProcedure` for endpoints that require authentication (this is the vast majority of endpoints)
- ALWAYS import from `@/server/procedure/protected.procedure`
- ALWAYS scope data queries to `session.user.id` to prevent data leaks between users
- NEVER check for session existence manually inside a protected handler -- the middleware handles this
- NEVER import `authMiddleware` directly in router files -- use `protectedProcedure` instead
- NEVER modify the auth middleware without understanding the full chain
- The session object is read-only -- do not attempt to modify it

## Related skills

- See `public-procedures.md` for unauthenticated endpoints
- See `route-context.md` for full context documentation
- See `error-handling.md` for error handling patterns
- See `create-router.md` for the full router pattern
