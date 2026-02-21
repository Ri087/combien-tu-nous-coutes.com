# Create Custom Middleware

## When to use

When you need to add cross-cutting logic to oRPC procedures -- such as authorization checks, rate limiting, logging, feature flags, or context enrichment. Middleware runs before the handler and can extend the context available to downstream middleware and handlers.

## Steps

### 1. Understand the middleware system

The middleware system is built on oRPC's `base.middleware()`. The `base` object is created with `os.$context<T>()` in `/server/context.ts` and defines the base context shape:

```typescript
// /server/context.ts
import { os } from "@orpc/server";
import type { Database } from "@/db";

export const base = os.$context<{
  headers: Headers;
  db: Database;
}>();
```

Every middleware and procedure starts from this `base` and can extend the context by calling `next()` with additional context properties.

### 2. Create a middleware file

Create `/server/middleware/[name].middleware.ts`:

```typescript
// /server/middleware/rate-limit.middleware.ts
import { ORPCError } from "@orpc/server";
import { base } from "../context";

export const rateLimitMiddleware = base.middleware(async (opts) => {
  const { next, context } = opts;

  // Access the base context (headers, db)
  const clientIp = context.headers.get("x-forwarded-for") ?? "unknown";

  // Perform your logic
  const isRateLimited = await checkRateLimit(clientIp);

  if (isRateLimited) {
    throw new ORPCError("TOO_MANY_REQUESTS", {
      message: "You have exceeded the rate limit. Please try again later.",
    });
  }

  // Call next() to continue the chain
  // Optionally extend the context with new properties
  return next({
    context: {
      clientIp,
    },
  });
});
```

### 3. The `opts` parameter

The middleware callback receives an `opts` object with these properties:

| Property | Type | Description |
|---|---|---|
| `next` | `(options?: { context: T }) => Promise` | Calls the next middleware or handler. Pass `context` to extend it. |
| `context` | `BaseContext & PreviousMiddlewareContext` | Current context, including base context and anything added by previous middleware |
| `input` | `unknown` | The procedure input (if `.input()` was defined before this middleware) |
| `path` | `string[]` | The procedure path segments |
| `procedure` | `object` | The procedure definition |

### 4. Context extension pattern

When you call `next({ context: { ... } })`, the new context properties are merged and become available to all downstream middleware and handlers:

```typescript
export const workspaceMiddleware = base.middleware(async (opts) => {
  const { next, context } = opts;

  const workspaceId = context.headers.get("x-workspace-id");

  if (!workspaceId) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Missing workspace ID header",
    });
  }

  const workspace = await context.db.query.workspaces.findFirst({
    where: eq(workspaces.id, workspaceId),
  });

  if (!workspace) {
    throw new ORPCError("NOT_FOUND", {
      message: "Workspace not found",
    });
  }

  // The workspace is now available in context for all downstream handlers
  return next({
    context: {
      workspace,
    },
  });
});
```

### 5. Chain middleware with `.use()`

Attach middleware to procedures using `.use()`. Middleware executes in the order it is chained:

```typescript
// /server/procedure/workspace.procedure.ts
import { authMiddleware } from "../middleware/auth.middleware";
import { workspaceMiddleware } from "../middleware/workspace.middleware";
import { publicProcedure } from "./public.procedure";

// Auth runs first, then workspace
export const workspaceProcedure = publicProcedure
  .use(authMiddleware)
  .use(workspaceMiddleware);
```

The resulting procedure's handler receives a context with: `headers`, `db` (from base), `session` (from auth middleware), and `workspace` (from workspace middleware).

### 6. Create a procedure from the middleware

After creating the middleware, create a procedure that uses it in `/server/procedure/`:

```typescript
// /server/procedure/workspace.procedure.ts
import { workspaceMiddleware } from "../middleware/workspace.middleware";
import { protectedProcedure } from "./protected.procedure";

// protectedProcedure already includes authMiddleware
export const workspaceProcedure = protectedProcedure.use(workspaceMiddleware);
```

### 7. Use the procedure in a router

```typescript
// /server/routers/workspace-settings.ts
import { z } from "zod";
import { workspaceProcedure } from "@/server/procedure/workspace.procedure";

export const workspaceSettingsRouter = {
  get: workspaceProcedure
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      // context.session is available (from authMiddleware)
      // context.workspace is available (from workspaceMiddleware)
      return context.workspace;
    }),
};
```

## Existing middleware chain

The current codebase has this middleware chain:

```
base (context.ts)
  --> publicProcedure (public.procedure.ts)  -- alias for base, no middleware
    --> protectedProcedure (protected.procedure.ts)  -- adds authMiddleware
```

- `publicProcedure` = `base` (no middleware, context has `headers` + `db`)
- `protectedProcedure` = `publicProcedure.use(authMiddleware)` (context adds `session`)

When creating new middleware, decide where in this chain it belongs:
- After auth? Chain from `protectedProcedure`
- Before auth / public? Chain from `publicProcedure`

## Error codes

Use `ORPCError` with standard HTTP-like codes:

| Code | When to use |
|---|---|
| `"UNAUTHORIZED"` | No valid session / credentials |
| `"FORBIDDEN"` | Authenticated but lacks permission |
| `"BAD_REQUEST"` | Invalid or missing input |
| `"NOT_FOUND"` | Resource does not exist |
| `"TOO_MANY_REQUESTS"` | Rate limit exceeded |
| `"INTERNAL_SERVER_ERROR"` | Unexpected server error |

```typescript
throw new ORPCError("FORBIDDEN", {
  message: "You do not have permission to access this resource.",
});
```

## File structure

```
/server/
  context.ts                              # base = os.$context<{ headers, db }>()
  middleware/
    auth.middleware.ts                     # Checks session, adds to context
    [your-middleware].middleware.ts        # Your new middleware
  procedure/
    public.procedure.ts                   # publicProcedure = base
    protected.procedure.ts                # protectedProcedure = publicProcedure.use(authMiddleware)
    [your-procedure].procedure.ts         # Your new procedure using the middleware
```

## Rules

- ALWAYS create middleware files in `/server/middleware/` with the `.middleware.ts` suffix
- ALWAYS import `base` from `../context` (or `@/server/context`) to create middleware
- ALWAYS call `return next(...)` to continue the chain -- forgetting to return `next()` will hang the request
- ALWAYS throw `ORPCError` for error conditions -- do NOT return error objects
- ALWAYS create a corresponding procedure file in `/server/procedure/` if the middleware will be reused across multiple routers
- NEVER modify existing middleware files unless explicitly required -- create new middleware and chain it
- Context properties added via `next({ context: { ... } })` are type-safe and will be available in handler's `context` parameter

## Related skills

- See `auth-middleware.md` for the existing auth middleware reference
- See `backend/orpc/create-router.md` for creating routers that use these procedures
