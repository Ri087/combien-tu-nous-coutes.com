---
name: backend-orpc
description: |
  oRPC API development guide for creating type-safe RPC endpoints. Use when creating new API routes, adding GET/POST/PUT/PATCH/DELETE endpoints, registering routers, splitting routers, validating input, handling errors, or working with oRPC procedures. Covers protected and public procedures, HTTP method selection, database access within routes, and the StrictGetMethodPlugin requirement.
---

# oRPC API Development

This skill covers the complete oRPC workflow in this project: creating routers with type-safe procedures, registering them in the app router, handling input validation, managing errors, and choosing the correct HTTP methods. The server uses `StrictGetMethodPlugin`, which means all read procedures must explicitly declare `.route({ method: 'GET' })` or they will return a 405 error.

## Reference Files

- **create-router.md** -- How to create a new oRPC router from scratch with the standard boilerplate structure
- **register-router.md** -- How to register a new router in `/server/routers/_app.ts` so it becomes available to clients
- **split-router.md** -- How to split a large router into multiple files while keeping a single entry point
- **get-routes.md** -- How to define GET procedures for read operations (list, get, find, search)
- **mutation-routes.md** -- How to define mutation procedures for write operations (create, update, delete)
- **http-methods.md** -- Complete reference for HTTP method selection and the `.route()` API
- **input-validation.md** -- How to validate procedure input using Zod schemas
- **error-handling.md** -- How to throw and handle errors within oRPC procedures
- **route-context.md** -- How to access the route context (`context`) including user session data
- **protected-procedures.md** -- How to use `protectedProcedure` for authenticated-only routes
- **public-procedures.md** -- How to use `publicProcedure` for unauthenticated routes
- **database-in-routes.md** -- How to use Drizzle ORM queries inside oRPC handlers

## Key Rules

1. **Always use `.route({ method: 'GET' })` for read procedures.** The `StrictGetMethodPlugin` enforces this; omitting it on a read route causes a 405 error.
2. **Never add `.route()` for mutations.** Write operations default to POST, which is correct.
3. **Always use `.handler()`.** The methods `.query()` and `.mutation()` do not exist in oRPC.
4. **Always register new routers** in `/server/routers/_app.ts` after creating them.
5. **Use `protectedProcedure` by default.** Only use `publicProcedure` when the route must be accessible without authentication.

## Related Skills

- **backend-database** -- Schema definitions and data access patterns used inside oRPC handlers
- **backend-middleware** -- Creating custom middleware for oRPC procedures
- **backend-auth** -- Authentication context available in protected procedures
- **validation-skills** -- Zod schema patterns for input validation
