---
name: frontend-state
description: |
  State management guide for TanStack Query, URL state, and React patterns. Use when fetching data with TanStack Query, invalidating queries, performing mutations, managing URL state with nuqs, using local React state, or implementing React Context patterns.
---

# State Management

This skill covers all state management patterns in the project: server state with TanStack Query, URL state with nuqs, local component state with React hooks, and shared state with React Context. TanStack Query is the primary data-fetching layer, tightly integrated with oRPC for type-safe queries and mutations.

## Reference Files

- **tanstack-query.md** -- How to fetch data with TanStack Query using oRPC-generated query keys and functions
- **query-invalidation.md** -- How to invalidate and refetch queries after mutations for cache consistency
- **mutations.md** -- How to perform mutations with `useMutation`, handle optimistic updates, and error states
- **url-state-management.md** -- How to manage URL-based state with nuqs for type-safe, shareable query parameters
- **local-state.md** -- When and how to use `useState`, `useReducer`, and `useRef` for local component state
- **context-patterns.md** -- How to implement React Context for shared state that does not belong in the URL or server

## Key Rules

1. **Use TanStack Query for all server data.** Never fetch data with raw `useEffect` + `fetch`.
2. **Always invalidate relevant queries after mutations.** Use `queryClient.invalidateQueries()` with the correct query key.
3. **Use nuqs for URL state** when the state should be shareable, bookmarkable, or survive page refreshes.
4. **Keep local state minimal.** Prefer server state (TanStack Query) and URL state (nuqs) over `useState` for application data.
5. **Never use React Context for server data.** Context is only for UI state (theme, sidebar open/closed, etc.).

## Related Skills

- **backend-orpc** -- API endpoints that TanStack Query calls
- **frontend-forms** -- Form mutations that trigger query invalidation
- **frontend-pages** -- Pages that set up query providers and URL state
- **frontend-components** -- Components that consume query data and state
