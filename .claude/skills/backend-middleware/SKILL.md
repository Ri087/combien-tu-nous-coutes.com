---
name: backend-middleware
description: |
  oRPC middleware creation guide. Use when creating custom middleware for oRPC procedures, implementing auth middleware, role-based access control, or chaining middleware with procedures.
---

# oRPC Middleware Development

This skill covers creating and composing middleware for oRPC procedures. Middleware runs before the handler and can modify the context, validate permissions, log requests, or short-circuit with errors. The project includes a built-in auth middleware that injects the authenticated user into the procedure context.

## Reference Files

- **create-middleware.md** -- How to create a new oRPC middleware from scratch, including context modification and error handling
- **auth-middleware.md** -- Reference implementation of the auth middleware that powers `protectedProcedure`

## Key Rules

1. **Always chain middleware using the oRPC `.use()` method.** Do not call middleware manually inside handlers.
2. **Always return the modified context** from middleware using the `next()` function with the new context.
3. **Use the existing auth middleware as a reference** when creating new middleware that needs session data.
4. **Keep middleware focused on a single concern.** Compose multiple small middleware instead of one large one.

## Related Skills

- **backend-orpc** -- Procedures that consume middleware
- **backend-auth** -- Auth context provided by the auth middleware
- **backend-database** -- Database access within middleware for permission checks
