# HTTP Method Selection Guide

## When to use

When deciding whether to add `.route({ method: 'GET' })` to an oRPC procedure or leave it as the default POST. This is critical because the codebase uses `StrictGetMethodPlugin` which enforces method correctness.

## The rule

| Operation type | HTTP Method | oRPC declaration | Example procedures |
|---------------|-------------|-----------------|-------------------|
| Read data | GET | `.route({ method: 'GET' })` | list, getById, get, find, search, count, exists, check |
| Create data | POST (default) | No `.route()` needed | create, add, register, submit, upload |
| Update data | POST (default) | No `.route()` needed | update, edit, rename, move, archive, restore |
| Delete data | POST (default) | No `.route()` needed | delete, remove, bulkDelete, purge |
| Side effects | POST (default) | No `.route()` needed | send, notify, trigger, sync, process |

## Why GET matters

### StrictGetMethodPlugin enforcement

The API route handler at `/app/api/rpc/[[...rest]]/route.ts` uses `StrictGetMethodPlugin()`:

```typescript
const handler = new RPCHandler(appRouter, {
  plugins: [new StrictGetMethodPlugin(), new BatchHandlerPlugin()],
});
```

This means:
- A procedure marked `.route({ method: 'GET' })` will ONLY respond to GET requests
- A procedure WITHOUT `.route()` will ONLY respond to POST requests
- If a client sends GET to a POST-only procedure, it returns **405 Method Not Allowed**
- If a client sends POST to a GET-only procedure, it returns **405 Method Not Allowed**

### Client-side optimizations for GET

The client (`/orpc/client.ts`) applies optimizations specific to GET requests:

```typescript
new DedupeRequestsPlugin({
  filter: ({ request }) => request.method === "GET",
  // ...
})
```

This means:
- **GET requests are deduplicated**: if multiple components request the same data simultaneously, only one network request is made
- **GET requests are cacheable**: browsers and CDNs can cache GET responses
- **GET requests are batchable**: the `BatchLinkPlugin` can batch multiple GET requests into one

If you forget `.route({ method: 'GET' })` on a read procedure, these optimizations will NOT apply.

## Examples

### Correct: Read operations with GET

```typescript
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { z } from "zod";

export const projectsRouter = {
  // List all projects for the user
  list: protectedProcedure
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      // ...
    }),

  // Get a single project by ID
  getById: protectedProcedure
    .route({ method: "GET" })
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      // ...
    }),

  // Search projects
  search: protectedProcedure
    .route({ method: "GET" })
    .input(z.object({ query: z.string() }))
    .handler(async ({ context, input }) => {
      // ...
    }),

  // Count projects
  count: protectedProcedure
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      // ...
    }),

  // Check if a slug is available
  checkSlug: protectedProcedure
    .route({ method: "GET" })
    .input(z.object({ slug: z.string() }))
    .handler(async ({ context, input }) => {
      // ...
    }),
};
```

### Correct: Write operations without `.route()`

```typescript
export const projectsRouter = {
  // Create -- POST by default
  create: protectedProcedure
    .input(createProjectSchema)
    .handler(async ({ context, input }) => {
      // ...
    }),

  // Update -- POST by default
  update: protectedProcedure
    .input(updateProjectSchema)
    .handler(async ({ context, input }) => {
      // ...
    }),

  // Delete -- POST by default
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      // ...
    }),

  // Archive -- POST by default (it modifies data)
  archive: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      // ...
    }),

  // Send notification -- POST by default (side effect)
  sendInvite: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .handler(async ({ context, input }) => {
      // ...
    }),
};
```

### Wrong: Common mistakes

```typescript
// WRONG: Read operation without .route({ method: 'GET' })
// This will cause a 405 error when the client tries to GET
list: protectedProcedure
  .handler(async ({ context }) => {  // Missing .route({ method: 'GET' })
    return context.db.query.projects.findMany();
  }),

// WRONG: Mutation with .route({ method: 'GET' })
// GET requests should not modify data
create: protectedProcedure
  .route({ method: 'GET' })  // Should NOT have .route() for mutations
  .input(z.object({ name: z.string() }))
  .handler(async ({ context, input }) => {
    await context.db.insert(projects).values(input);
  }),
```

## Edge cases

### Procedures that both read and write

If a procedure performs a side effect as part of reading (e.g., logging a page view), it should still be **POST** (no `.route()`):

```typescript
// Tracks a view AND returns data -- use POST because of the side effect
trackAndGet: protectedProcedure
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, input }) => {
    const { db } = context;
    // Side effect: record the view
    await db.insert(pageViews).values({ projectId: input.id, viewedAt: new Date() });
    // Then return the data
    return db.query.projects.findFirst({ where: eq(projects.id, input.id) });
  }),
```

### Toggle operations

Toggle operations (e.g., bookmark, like, pin) modify state, so they are **POST**:

```typescript
// Toggle bookmark -- modifies state, so POST (no .route())
toggleBookmark: protectedProcedure
  .input(z.object({ projectId: z.string().uuid() }))
  .handler(async ({ context, input }) => {
    // ...
  }),
```

## Placement of `.route()` in the chain

The `.route()` call can be placed anywhere before `.handler()`:

```typescript
// All of these are valid:

// Option 1: Before .input()
list: protectedProcedure
  .route({ method: "GET" })
  .input(z.object({ limit: z.number() }))
  .handler(async ({ context, input }) => { /* ... */ }),

// Option 2: After .input()
list: protectedProcedure
  .input(z.object({ limit: z.number() }))
  .route({ method: "GET" })
  .handler(async ({ context, input }) => { /* ... */ }),
```

The recommended convention in this codebase is to place `.route()` immediately after the procedure, before `.input()`.

## Rules

- ALWAYS add `.route({ method: 'GET' })` for procedures that ONLY read data
- NEVER add `.route()` for procedures that create, update, delete, or trigger side effects
- NEVER use `.route({ method: 'PUT' })`, `.route({ method: 'PATCH' })`, or `.route({ method: 'DELETE' })` -- this codebase uses only GET and POST via oRPC
- If in doubt about whether something is a read or write, default to POST (no `.route()`)
- The procedure name is a strong hint: `list`, `get`, `find`, `search`, `count`, `check`, `exists` = GET; everything else = POST

## Related skills

- See `get-routes.md` for detailed GET route patterns
- See `mutation-routes.md` for detailed mutation patterns
- See `create-router.md` for the full router creation workflow
