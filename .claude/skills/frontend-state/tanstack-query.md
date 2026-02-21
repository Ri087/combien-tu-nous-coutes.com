# Skill: TanStack Query with oRPC

## Purpose

Complete guide to using TanStack Query v5 with oRPC for data fetching in this codebase. Covers client-side queries, suspense queries, server-side prefetching, and hydration.

## Prerequisites

- An oRPC router with the desired procedure already exists in `/server/routers/`
- The procedure is registered in `/server/routers/_app.ts`
- For GET queries, the procedure MUST have `.route({ method: 'GET' })` (enforced by `StrictGetMethodPlugin`)

## Architecture Overview

| Piece | File | Role |
|-------|------|------|
| oRPC client | `/orpc/client.ts` | Creates `orpcClient` (raw calls) and `orpc` (TanStack Query utils) |
| QueryClient factory | `/orpc/query/client.ts` | Creates QueryClient with staleTime: 60s, MutationCache, serialization |
| Hydration helpers | `/orpc/query/hydration.tsx` | `getQueryClient()` (cached per request) and `HydrateClient` wrapper |
| Client provider | `/providers/query-client.provider.tsx` | `ORPCQueryClientProvider` wraps the app with QueryClientProvider |
| App providers | `/app/providers.tsx` | Composes all providers including ORPCQueryClientProvider |

## Key Imports

```tsx
// Client-side queries
import { useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";

// Server-side prefetching
import { getQueryClient, HydrateClient } from "@/orpc/query/hydration";
import { orpc } from "@/orpc/client";
```

## Pattern 1: Basic Client Query (useQuery)

Use `useQuery` when you want loading/error states and non-blocking rendering.

```tsx
// /app/(application)/projects/_components/project-list.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";

export function ProjectList() {
  const { data: projects, isLoading, error } = useQuery(
    orpc.projects.list.queryOptions({ input: {} })
  );

  if (isLoading) {
    return <ProjectListSkeleton />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!projects || projects.length === 0) {
    return <ProjectEmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

## Pattern 2: Suspense Query (useSuspenseQuery)

Use `useSuspenseQuery` when combined with server-side prefetching for instant load.

```tsx
// /app/(application)/projects/_components/project-list.tsx
"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";

export function ProjectList() {
  // data is guaranteed to exist (no loading/error states needed)
  const { data: projects } = useSuspenseQuery(
    orpc.projects.list.queryOptions({ input: {} })
  );

  if (projects.length === 0) {
    return <ProjectEmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

## Pattern 3: Server-Side Prefetching with Hydration

Prefetch data on the server so the client has it instantly. Combine with `useSuspenseQuery` in the client component.

```tsx
// /app/(application)/projects/page.tsx (Server Component - NO "use client")
import type { Metadata } from "next";

import { getQueryClient, HydrateClient } from "@/orpc/query/hydration";
import { orpc } from "@/orpc/client";
import { ProjectList } from "./_components/project-list";

export const metadata: Metadata = {
  title: "Projects",
};

export default async function ProjectsPage() {
  const queryClient = getQueryClient();

  // Prefetch the query on the server
  await queryClient.prefetchQuery(
    orpc.projects.list.queryOptions({ input: {} })
  );

  return (
    <HydrateClient client={queryClient}>
      <div className="flex flex-col gap-6 p-6">
        <ProjectList />
      </div>
    </HydrateClient>
  );
}
```

**How it works:**
1. `getQueryClient()` is cached per request via `React.cache` -- calling it multiple times in the same request returns the same instance.
2. `prefetchQuery` fetches data and stores it in the server-side QueryClient.
3. `HydrateClient` serializes the QueryClient state and sends it to the browser via `HydrationBoundary`.
4. On the client, `useSuspenseQuery` picks up the prefetched data instantly (no loading flash).

## Pattern 4: Query with Input Parameters

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";

export function ProjectDetail({ projectId }: { projectId: string }) {
  const { data: project, isLoading } = useQuery(
    orpc.projects.get.queryOptions({
      input: { id: projectId },
    })
  );

  if (isLoading) return <ProjectDetailSkeleton />;
  if (!project) return <div>Project not found</div>;

  return <div>{project.name}</div>;
}
```

## Pattern 5: Dependent Queries

Use `enabled` to conditionally run a query based on another query's result.

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";

export function ProjectTasks({ projectId }: { projectId: string }) {
  const { data: project } = useQuery(
    orpc.projects.get.queryOptions({ input: { id: projectId } })
  );

  const { data: tasks } = useQuery({
    ...orpc.tasks.list.queryOptions({
      input: { projectId: project?.id ?? "" },
    }),
    enabled: !!project?.id,
  });

  return <div>{tasks?.map((t) => <TaskCard key={t.id} task={t} />)}</div>;
}
```

## Pattern 6: Multiple Prefetches

Prefetch multiple queries in parallel on the server.

```tsx
// /app/(application)/dashboard/page.tsx
import { getQueryClient, HydrateClient } from "@/orpc/query/hydration";
import { orpc } from "@/orpc/client";

export default async function DashboardPage() {
  const queryClient = getQueryClient();

  // Prefetch in parallel
  await Promise.all([
    queryClient.prefetchQuery(orpc.projects.list.queryOptions({ input: {} })),
    queryClient.prefetchQuery(orpc.tasks.recent.queryOptions({ input: {} })),
    queryClient.prefetchQuery(orpc.analytics.summary.queryOptions({ input: {} })),
  ]);

  return (
    <HydrateClient client={queryClient}>
      <DashboardContent />
    </HydrateClient>
  );
}
```

## queryOptions API

The `orpc` utils object generates TanStack Query options automatically from oRPC procedures:

```tsx
// For GET procedures (with .route({ method: 'GET' }))
orpc.projects.list.queryOptions({ input: { limit: 10 } })
// Returns: { queryKey: [...], queryFn: () => ... }

// Access just the queryKey (useful for invalidation)
orpc.projects.list.queryOptions({ input: {} }).queryKey
```

## Configuration Details

The QueryClient is configured with:
- **staleTime: 60s** -- queries are considered fresh for 60 seconds, preventing refetching on mount
- **Custom serialization** via `StandardRPCJsonSerializer` for proper Date/BigInt handling across server/client boundary
- **Dehydration** includes pending queries, allowing streaming SSR
- **MutationCache** with automatic invalidation via `meta.invalidateQueries` (see `query-invalidation.md`)

## Rules

- ALWAYS use `orpc.routerName.procedureName.queryOptions(...)` to generate query options
- ALWAYS pass `{ input: {...} }` even if the procedure takes no input (pass `{ input: {} }`)
- ALWAYS use `useSuspenseQuery` when prefetching on the server with `HydrateClient`
- ALWAYS use `useQuery` when NOT prefetching (handles loading state in client)
- NEVER call `orpcClient` directly for reads -- use `queryOptions` with `useQuery`/`useSuspenseQuery`
- NEVER add `"use client"` to page.tsx files -- keep them as Server Components
- NEVER create a new QueryClient in components -- use `useQueryClient()` hook or `getQueryClient()` on server
