# Skill: Query Invalidation

## Purpose

Complete guide to invalidating TanStack Query caches after mutations. Covers manual invalidation, automatic invalidation via MutationCache meta, and strategies for specific vs broad invalidation.

## Prerequisites

- The query you want to invalidate is already being used via `orpc.routerName.procedureName.queryOptions(...)`
- A mutation exists that modifies the data (see `mutations.md`)

## Architecture

The codebase uses a `MutationCache` configured in `/orpc/query/client.ts` that supports automatic invalidation via `meta.invalidateQueries`:

```tsx
// From /orpc/query/client.ts
mutationCache: new MutationCache({
  onSettled(_data, _error, _variables, _context, mutation) {
    if (mutation.meta?.invalidateQueries) {
      for (const queryKey of mutation.meta.invalidateQueries) {
        queryClient.invalidateQueries({ queryKey });
      }
    }
  },
}),
```

## Key Imports

```tsx
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { orpc, orpcClient } from "@/orpc/client";
```

## Pattern 1: Manual Invalidation in onSuccess

The most common pattern. Invalidate specific queries after a mutation succeeds.

```tsx
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc, orpcClient } from "@/orpc/client";

export function CreateProjectButton() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: { name: string }) => orpcClient.projects.create(input),
    onSuccess: () => {
      // Invalidate the projects list query
      queryClient.invalidateQueries({
        queryKey: orpc.projects.list.queryOptions({ input: {} }).queryKey,
      });
    },
  });

  return (
    <button onClick={() => mutation.mutate({ name: "New Project" })}>
      Create Project
    </button>
  );
}
```

## Pattern 2: Automatic Invalidation via MutationCache Meta

Use `meta.invalidateQueries` to declare which queries to invalidate. The MutationCache handles it automatically on settle (success or error).

```tsx
"use client";

import { useMutation } from "@tanstack/react-query";
import { orpc, orpcClient } from "@/orpc/client";

export function CreateProjectButton() {
  const mutation = useMutation({
    mutationFn: (input: { name: string }) => orpcClient.projects.create(input),
    meta: {
      invalidateQueries: [
        orpc.projects.list.queryOptions({ input: {} }).queryKey,
      ],
    },
  });

  return (
    <button onClick={() => mutation.mutate({ name: "New Project" })}>
      Create Project
    </button>
  );
}
```

**Advantages of meta approach:**
- Cleaner code (no need for `useQueryClient`)
- Runs on `onSettled` (both success and error), ensuring stale data is always refetched
- Declarative -- easy to see which queries are affected

## Pattern 3: Broad Invalidation (All Queries of a Router)

Invalidate ALL queries under a specific router path by using a partial query key.

```tsx
// Invalidate ALL project queries (list, get, search, etc.)
queryClient.invalidateQueries({
  queryKey: ["projects"], // Partial match -- hits all queries starting with "projects"
});
```

**Note:** oRPC query keys follow a hierarchical structure. Passing a partial prefix invalidates all matching queries.

## Pattern 4: Specific Invalidation (Single Query with Input)

Invalidate only a specific query with exact input parameters.

```tsx
// Invalidate only the project list with no input
queryClient.invalidateQueries({
  queryKey: orpc.projects.list.queryOptions({ input: {} }).queryKey,
});

// Invalidate only a specific project detail
queryClient.invalidateQueries({
  queryKey: orpc.projects.get.queryOptions({ input: { id: "abc-123" } }).queryKey,
});
```

## Pattern 5: Multiple Invalidations

After a mutation, you may need to invalidate multiple related queries.

```tsx
const mutation = useMutation({
  mutationFn: (input: { projectId: string; name: string }) =>
    orpcClient.tasks.create(input),
  onSuccess: (_data, variables) => {
    // Invalidate the tasks list for this project
    queryClient.invalidateQueries({
      queryKey: orpc.tasks.list.queryOptions({
        input: { projectId: variables.projectId },
      }).queryKey,
    });

    // Also invalidate the project detail (task count may have changed)
    queryClient.invalidateQueries({
      queryKey: orpc.projects.get.queryOptions({
        input: { id: variables.projectId },
      }).queryKey,
    });
  },
});
```

Or with meta:

```tsx
const mutation = useMutation({
  mutationFn: (input: { projectId: string; name: string }) =>
    orpcClient.tasks.create(input),
  meta: {
    invalidateQueries: [
      orpc.tasks.list.queryOptions({ input: { projectId: "abc-123" } }).queryKey,
      orpc.projects.get.queryOptions({ input: { id: "abc-123" } }).queryKey,
    ],
  },
});
```

## Pattern 6: Invalidation After Delete

```tsx
const deleteMutation = useMutation({
  mutationFn: (input: { id: string }) => orpcClient.projects.delete(input),
  onSuccess: () => {
    // Broad invalidation -- any project query is now stale
    queryClient.invalidateQueries({
      queryKey: ["projects"],
    });
  },
});
```

## Pattern 7: Invalidation After Update

```tsx
const updateMutation = useMutation({
  mutationFn: (input: { id: string; name: string }) =>
    orpcClient.projects.update(input),
  onSuccess: (_data, variables) => {
    // Invalidate the specific project detail
    queryClient.invalidateQueries({
      queryKey: orpc.projects.get.queryOptions({
        input: { id: variables.id },
      }).queryKey,
    });

    // Invalidate the list (name changed, affects display)
    queryClient.invalidateQueries({
      queryKey: orpc.projects.list.queryOptions({ input: {} }).queryKey,
    });
  },
});
```

## Decision Guide: Manual vs Meta Invalidation

| Use Case | Approach |
|----------|----------|
| Static query keys (known at definition time) | `meta.invalidateQueries` |
| Dynamic query keys (depend on mutation variables) | Manual `onSuccess` |
| Need different behavior on success vs error | Manual `onSuccess` / `onError` |
| Simple CRUD operations | `meta.invalidateQueries` |
| Complex multi-query invalidation with logic | Manual `onSuccess` |

## Decision Guide: Specific vs Broad Invalidation

| Scenario | Strategy |
|----------|----------|
| Created a new item | Invalidate the list query |
| Updated a single item | Invalidate that specific detail + the list |
| Deleted an item | Broad invalidation on the entire router |
| Bulk operations | Broad invalidation on the entire router |

## Rules

- ALWAYS invalidate relevant queries after mutations -- stale data causes bugs
- PREFER `meta.invalidateQueries` for static, predictable invalidation patterns
- USE manual `onSuccess` when query keys depend on mutation variables
- USE broad invalidation (partial key) for deletes and bulk operations
- USE specific invalidation (full queryKey) for creates and updates when possible
- NEVER forget to invalidate list queries when creating/deleting items
- REMEMBER that `meta.invalidateQueries` runs on `onSettled` (both success AND error)
