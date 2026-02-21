# Auth Middleware Patterns

## When to use

When you need to understand how authentication works in oRPC procedures, restrict access to authenticated users, implement role-based access control, or access the current user's session in a handler.

## How auth middleware works

### The auth middleware

The auth middleware is defined in `/server/middleware/auth.middleware.ts`:

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

It does three things:

1. Calls `getServerSession()` to retrieve the current user's session from Better Auth (using cookies via `next/headers`)
2. If no session exists, throws `ORPCError("UNAUTHORIZED")` which returns a 401 to the client
3. If a session exists, adds it to the context via `next({ context: { session } })`, making it available to all downstream handlers

### getServerSession()

The session utility is in `/lib/auth/utils.ts`:

```typescript
import { headers } from "next/headers";
import { auth } from "@/auth";

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}
```

It returns the Better Auth session object, which contains `user` and `session` properties, or `null` if the user is not authenticated.

### The procedure chain

```typescript
// /server/procedure/public.procedure.ts
import { base } from "../context";
export const publicProcedure = base;

// /server/procedure/protected.procedure.ts
import { authMiddleware } from "../middleware/auth.middleware";
import { publicProcedure } from "./public.procedure";
export const protectedProcedure = publicProcedure.use(authMiddleware);
```

- `publicProcedure` -- No auth check. Context has `{ headers, db }`.
- `protectedProcedure` -- Auth required. Context has `{ headers, db, session }`.

## Accessing the session in handlers

When using `protectedProcedure`, the session is available on `context.session`:

```typescript
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const profileRouter = {
  me: protectedProcedure
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      // context.session.user contains the authenticated user
      const userId = context.session.user.id;
      const userName = context.session.user.name;
      const userEmail = context.session.user.email;

      return context.db.query.users.findFirst({
        where: eq(users.id, userId),
      });
    }),
};
```

### Session object shape

The `context.session` object from Better Auth has this shape:

```typescript
{
  session: {
    id: string;           // Session ID
    userId: string;       // User ID
    expiresAt: Date;      // Session expiry
    token: string;        // Session token
    // ... other session fields
  };
  user: {
    id: string;           // User ID (UUID)
    name: string;         // User display name
    email: string;        // User email
    emailVerified: boolean;
    image?: string;       // Profile image URL
    createdAt: Date;
    updatedAt: Date;
    // ... other user fields
  };
}
```

Access user data via `context.session.user` and session metadata via `context.session.session`.

## Role-based access control (RBAC)

### Pattern 1: Inline role check in handler

For simple, one-off checks:

```typescript
import { ORPCError } from "@orpc/server";
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const adminRouter = {
  listAllUsers: protectedProcedure
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      if (context.session.user.role !== "admin") {
        throw new ORPCError("FORBIDDEN", {
          message: "Admin access required.",
        });
      }

      return context.db.query.users.findMany();
    }),
};
```

### Pattern 2: Dedicated role middleware

For reusable role checks, create a middleware that takes a role parameter:

```typescript
// /server/middleware/role.middleware.ts
import { ORPCError } from "@orpc/server";
import { base } from "../context";

export function createRoleMiddleware(requiredRole: string) {
  return base.middleware(async (opts) => {
    const { next, context } = opts;

    // This middleware must run AFTER authMiddleware
    // so context.session is guaranteed to exist
    const session = (context as { session: { user: { role: string } } }).session;

    if (session.user.role !== requiredRole) {
      throw new ORPCError("FORBIDDEN", {
        message: `This action requires the "${requiredRole}" role.`,
      });
    }

    return next({
      context: {
        role: requiredRole,
      },
    });
  });
}
```

Then create specialized procedures:

```typescript
// /server/procedure/admin.procedure.ts
import { createRoleMiddleware } from "../middleware/role.middleware";
import { protectedProcedure } from "./protected.procedure";

export const adminProcedure = protectedProcedure.use(
  createRoleMiddleware("admin")
);
```

Use in routers:

```typescript
import { adminProcedure } from "@/server/procedure/admin.procedure";

export const adminRouter = {
  listAllUsers: adminProcedure
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      // context.session is available (from authMiddleware)
      // context.role is available (from roleMiddleware)
      return context.db.query.users.findMany();
    }),
};
```

### Pattern 3: Resource ownership check

For ensuring a user can only access their own resources:

```typescript
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { projects } from "@/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const projectsRouter = {
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1),
      })
    )
    .handler(async ({ context, input }) => {
      const project = await context.db.query.projects.findFirst({
        where: eq(projects.id, input.id),
      });

      if (!project) {
        throw new ORPCError("NOT_FOUND", {
          message: "Project not found.",
        });
      }

      // Ownership check
      if (project.userId !== context.session.user.id) {
        throw new ORPCError("FORBIDDEN", {
          message: "You do not have permission to update this project.",
        });
      }

      const [updated] = await context.db
        .update(projects)
        .set({ name: input.name, updatedAt: new Date() })
        .where(eq(projects.id, input.id))
        .returning();

      return updated;
    }),
};
```

## When to use publicProcedure vs protectedProcedure

| Procedure | Use when |
|---|---|
| `publicProcedure` | No authentication required: health checks, public data, webhook endpoints |
| `protectedProcedure` | User must be logged in: CRUD operations, user-specific data, settings |

Default to `protectedProcedure` unless you have an explicit reason for a public endpoint.

## Common patterns

### Filtering by current user

Always scope queries to the authenticated user:

```typescript
// List only the current user's projects
list: protectedProcedure
  .route({ method: "GET" })
  .handler(async ({ context }) => {
    return context.db.query.projects.findMany({
      where: eq(projects.userId, context.session.user.id),
    });
  }),
```

### Setting userId on create

Always set the userId from the session, never from client input:

```typescript
create: protectedProcedure
  .input(z.object({ name: z.string().min(1) }))
  .handler(async ({ context, input }) => {
    const [project] = await context.db
      .insert(projects)
      .values({
        name: input.name,
        userId: context.session.user.id,  // From session, NOT from input
      })
      .returning();
    return project;
  }),
```

## Rules

- ALWAYS use `protectedProcedure` for any endpoint that accesses or modifies user data
- ALWAYS access the user ID from `context.session.user.id` -- NEVER trust a userId from client input
- ALWAYS scope database queries to `context.session.user.id` to prevent data leaks across users
- ALWAYS throw `ORPCError("UNAUTHORIZED")` when there is no session (already handled by authMiddleware)
- ALWAYS throw `ORPCError("FORBIDDEN")` when the user is authenticated but lacks permission
- NEVER modify `/server/middleware/auth.middleware.ts` -- create additional middleware for extra checks
- NEVER import `getServerSession` directly in routers -- use `context.session` provided by the middleware chain

## Related skills

- See `create-middleware.md` for creating custom middleware (rate limiting, feature flags, etc.)
- See `backend/orpc/create-router.md` for creating routers that use these procedures
