# Register a Router in _app.ts

## When to use

After creating a new oRPC router file in `/server/routers/`, you must register it in the central app router so it becomes available through the API and the client.

## Steps

### 1. Open the app router

The app router is located at `/server/routers/_app.ts`. It currently looks like this:

```typescript
import { base } from "@/server/context";

export const appRouter = base.router({
  // Add your routers here
});
```

### 2. Import and register the new router

Add your router import and register it as a key in the `base.router({})` object:

```typescript
import { base } from "@/server/context";
import { projectsRouter } from "./projects";
import { tasksRouter } from "./tasks";

export const appRouter = base.router({
  projects: projectsRouter,
  tasks: tasksRouter,
});
```

### 3. Verify the types propagate

After registration, the router type is automatically inferred throughout the application:

- **Client-side**: The `orpcClient` in `/orpc/client.ts` uses `RouterClient<typeof appRouter>`, so new procedures are immediately available as `orpcClient.projects.list()`.
- **TanStack Query**: The `orpc` utils in `/orpc/client.ts` automatically gain query keys for the new router, e.g., `orpc.projects.list.queryOptions()`.
- **Server-side**: The `api` client in `/orpc/server.ts` also picks up the new router for server-side calls, e.g., `api.projects.list()`.

### 4. Verify the build

```bash
pnpm build
```

## How the router connects to the API

The registration chain works as follows:

1. `/server/routers/_app.ts` -- defines `appRouter` with all routers
2. `/app/api/rpc/[[...rest]]/route.ts` -- creates `RPCHandler(appRouter, ...)` which handles all HTTP requests
3. `/orpc/client.ts` -- client-side `createORPCClient` uses the `appRouter` type for type safety
4. `/orpc/server.ts` -- server-side `createRouterClient(appRouter, ...)` for server components and actions

## Example: Adding multiple routers

```typescript
import { base } from "@/server/context";
import { projectsRouter } from "./projects";
import { tasksRouter } from "./tasks";
import { commentsRouter } from "./comments";
import { notificationsRouter } from "./notifications";

export const appRouter = base.router({
  projects: projectsRouter,
  tasks: tasksRouter,
  comments: commentsRouter,
  notifications: notificationsRouter,
});
```

## Rules

- ALWAYS use `base.router({})` to wrap routers -- `base` comes from `/server/context.ts`
- The key name in the router object becomes the URL prefix: `projects: projectsRouter` creates routes under `/api/rpc/projects/`
- NEVER modify the `base` definition in `/server/context.ts`
- NEVER modify the API route handler in `/app/api/rpc/[[...rest]]/route.ts`
- ALWAYS run `pnpm build` after registration to verify types
- Router keys should be lowercase, plural nouns matching the feature name (e.g., `projects`, `tasks`, `comments`)

## Related skills

- See `create-router.md` for how to create a router file
- See `split-router.md` for organizing large routers
