# Skill: How to Implement Loading States

## Purpose

Guide to implementing loading states in Next.js 16 pages. Covers `loading.tsx` files, Suspense boundaries, skeleton components, and the StaggeredFadeLoader component.

## Loading Approaches

There are three main approaches to loading states in this codebase:

1. **`loading.tsx` files** -- Route-level loading (automatic Suspense boundary)
2. **`<Suspense>` boundaries** -- Component-level loading (manual)
3. **Client-side loading** -- React Query `isLoading` states

## Approach 1: Route-Level Loading with `loading.tsx`

Next.js automatically wraps the page in a `<Suspense>` boundary when a `loading.tsx` file exists in the same directory.

### Create a Loading File

```tsx
// /app/(application)/projects/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
```

### When to Use

- Use for **page-level** loading states
- When the page itself is an async Server Component that fetches data
- Best for initial page load transitions

### File Location

Place `loading.tsx` in the same directory as `page.tsx`:

```
/app/(application)/projects/
  page.tsx        # The page
  loading.tsx     # Loading state for this page
  _components/    # Components
```

## Approach 2: Component-Level Suspense Boundaries

For more granular loading control, wrap individual async components in `<Suspense>`:

```tsx
// /app/(application)/dashboard/page.tsx
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RecentProjects } from "./_components/recent-projects";
import { ActivityFeed } from "./_components/activity-feed";
import { StatsCards } from "./_components/stats-cards";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-title-h5 text-text-strong-950">Dashboard</h1>

      {/* Each section loads independently */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
          <RecentProjects />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
          <ActivityFeed />
        </Suspense>
      </div>
    </div>
  );
}

function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}
```

### When to Use

- When a page has **multiple independent data sources**
- When you want **streaming** -- parts of the page load as their data becomes available
- When you want to show the page structure immediately with individual loading states

## Approach 3: Client-Side Loading with React Query

For client components using oRPC + TanStack Query:

```tsx
// /app/(application)/projects/_components/project-list.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc/react";

export function ProjectList() {
  const { data: projects, isLoading, error } = useQuery(
    orpc.projects.list.queryOptions({ input: {} })
  );

  if (isLoading) {
    return <ProjectListSkeleton />;
  }

  if (error) {
    return <div className="text-paragraph-sm text-error-base">Failed to load projects.</div>;
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

function ProjectListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-xl border border-stroke-soft-200 p-4">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
```

## Skeleton Component

The codebase includes an AlignUI `Skeleton` component at `/components/ui/skeleton.tsx`:

```tsx
import { Skeleton } from "@/components/ui/skeleton";

// Basic usage
<Skeleton className="h-6 w-40" />

// Common patterns
<Skeleton className="h-4 w-full" />              // Full-width text line
<Skeleton className="h-4 w-3/4" />               // Partial text line
<Skeleton className="h-10 w-10 rounded-full" />   // Avatar circle
<Skeleton className="h-48 rounded-xl" />           // Card placeholder
<Skeleton className="h-9 w-24 rounded-lg" />       // Button placeholder
```

The Skeleton component renders a `<div>` with `animate-pulse rounded-md bg-neutral-400/10`.

### Common Skeleton Patterns

**Table Skeleton:**

```tsx
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex gap-4 rounded-lg bg-bg-weak-50 px-3 py-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-3 py-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}
```

**Card Grid Skeleton:**

```tsx
function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-xl border border-stroke-soft-200 p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}
```

**Form Skeleton:**

```tsx
function FormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Label + Input */}
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      {/* Label + Input */}
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      {/* Submit button */}
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}
```

## StaggeredFadeLoader

For inline button loading states, use the `StaggeredFadeLoader` component:

```tsx
import { StaggeredFadeLoader } from "@/components/staggered-fade-loader";
import * as FancyButton from "@/components/ui/fancy-button";

// In a form submit button
<FancyButton.Root disabled={isLoading} size="medium" variant="primary">
  {isLoading && <StaggeredFadeLoader variant="muted" />}
  {isLoading ? "Saving..." : "Save"}
</FancyButton.Root>
```

Available variants: `light`, `dark`, `muted`
Available sizes: `small`, `default`, `large`
Available spacing: `default`, `tight`, `loose`

## Best Practices

### Do

- Match skeleton shapes to the actual content layout
- Use consistent skeleton patterns across similar pages
- Combine `loading.tsx` for initial page load with client-side loading for interactive content
- Use Suspense boundaries to enable streaming for independent data sections
- Show skeletons that match the page header structure (title + subtitle + action buttons)

### Do Not

- Do NOT show a blank page while loading -- always show structure
- Do NOT use spinners for page-level loading -- prefer skeletons
- Do NOT create loading states that look nothing like the final content
- Do NOT use `loading.tsx` when the page has no async data fetching

## Decision Guide

| Scenario | Approach |
|----------|----------|
| Page-level data fetch in Server Component | `loading.tsx` |
| Multiple independent data sections | `<Suspense>` boundaries |
| Client component with oRPC/React Query | `isLoading` + skeleton |
| Form submit button | `StaggeredFadeLoader` |
| Simple state transition | `isLoading` boolean + conditional render |
