# Document Code - Guidelines

> This skill guides the AI on when and how to document code.
> The philosophy: good code is self-documenting. Comments explain WHY, not WHAT.

## When to Add Comments

### DO add comments for:

1. **Non-obvious business logic**
   ```typescript
   // Users get a 30-day grace period after subscription expires
   // before their data is archived
   const graceDeadline = addDays(subscription.expiresAt, 30);
   ```

2. **Workarounds and hacks**
   ```typescript
   // HACK: Better Auth returns null for image on first login
   // so we fall back to a generated avatar
   const avatar = user.image ?? generateAvatar(user.email);
   ```

3. **Complex algorithms or formulas**
   ```typescript
   // Calculate weighted score: recency (40%), engagement (35%), relevance (25%)
   const score = recency * 0.4 + engagement * 0.35 + relevance * 0.25;
   ```

4. **Important constraints or assumptions**
   ```typescript
   // oRPC StrictGetMethodPlugin requires .route({ method: "GET" }) for all read operations
   // Without this, the endpoint returns 405 Method Not Allowed
   ```

5. **TODO items with context**
   ```typescript
   // TODO: Replace with batch insert when Drizzle supports it for Neon
   for (const item of items) {
     await db.insert(table).values(item);
   }
   ```

### DO NOT add comments for:

1. **Obvious code**
   ```typescript
   // BAD: "Get the user name"
   const userName = user.name;

   // BAD: "Check if user is logged in"
   if (session) { ... }

   // BAD: "Import the button component"
   import * as Button from "@/components/ui/button";
   ```

2. **Type definitions that are self-explanatory**
   ```typescript
   // BAD: "The user type"
   type User = typeof user.$inferSelect;
   ```

3. **Standard patterns** (React hooks, form handling, CRUD operations)

---

## JSDoc for Exported Functions

Add JSDoc to exported functions ONLY when the function name alone is not sufficient to understand its behavior.

### When JSDoc is useful:

```typescript
/**
 * Returns the server-side session by reading headers from the current request.
 * Must be called within a Server Component or Server Action context.
 */
export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}
```

```typescript
/**
 * Creates an oRPC client that works on both server and client.
 * On the server, uses the global client created in orpc/server.ts.
 * On the client, creates a new client with fetch-based RPCLink.
 */
export const orpcClient: RouterClient<typeof appRouter> =
  globalThis.$client ?? createORPCClient(link);
```

### When JSDoc is NOT needed:

```typescript
// No JSDoc needed -- the function name and types explain everything
export function formatRelativeDate(date: Date): string { ... }

// No JSDoc needed -- standard CRUD operation
export function createProject(data: CreateProjectInput) { ... }
```

---

## File-Level Comments

### When to add a file-level comment:

Only for files whose purpose is not obvious from their path and name.

```typescript
// /server/context.ts
// This file does NOT need a comment -- its path says it all
```

```typescript
// /lib/utils/table/sorting-state.ts
/**
 * Converts TanStack Table sorting state to Drizzle ORM orderBy clauses.
 * Bridges the gap between client-side table sorting and server-side queries.
 */
```

---

## README Files

### When to create a feature README:

Only if the user explicitly asks for it, or if the feature has:
- Complex setup steps (environment variables, external services)
- Non-obvious architecture decisions
- Multiple interacting subsystems

### README structure (if needed):

```markdown
# Feature Name

Brief description of what this feature does.

## Architecture

How the pieces fit together.

## Setup

Any required environment variables or external services.

## Key Decisions

Why certain approaches were chosen.
```

---

## Inline Documentation Patterns

### Validators
```typescript
// validators/[feature].ts
// No comments needed -- Zod schemas are self-documenting
export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
});
```

### oRPC Routers
```typescript
// server/routers/[feature].ts
// Only comment non-obvious query logic
export const featureRouter = {
  list: protectedProcedure
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      // Filter soft-deleted items and apply user-scoping
      return context.db.query.features.findMany({
        where: and(
          eq(features.userId, context.session.user.id),
          isNull(features.deletedAt),
        ),
      });
    }),
};
```

### React Components
```typescript
// Components rarely need comments
// Exception: complex rendering logic or non-obvious behavior

// Animation uses a two-phase approach:
// 1. Set isOpen=true to mount the component
// 2. After a 10ms delay, set isAnimating=true to trigger the CSS transition
// This ensures the browser has time to paint the initial state before animating
```

---

## Rules

1. **Never add comments that repeat the code** -- the reader can read the code
2. **Never add section separator comments** like `// --- Handlers ---` or `// ===== Utils =====`
3. **Never add change log comments** -- that is what git history is for
4. **Never add author comments** -- that is what git blame is for
5. **Keep comments up to date** -- stale comments are worse than no comments
6. **Use `//` for short comments, `/** */` for JSDoc only**
7. **Write comments in English**
