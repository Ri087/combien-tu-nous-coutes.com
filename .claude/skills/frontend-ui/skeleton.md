# Skeleton Loading States

## When to use

- Display placeholder UI while data is loading
- Replace content sections during initial page load or data fetching
- Server Components with `Suspense` fallbacks
- Client-side loading states with React Query / TanStack Query

## Import

```tsx
import { Skeleton } from '@/components/ui/skeleton';
```

## Basic Usage

```tsx
<Skeleton className="h-4 w-32" />
```

The Skeleton component renders a `<div>` with:
- `animate-pulse` animation
- `rounded-md` border radius
- `bg-neutral-400/10` background

You control the size entirely through `className`.

## Props

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | Width, height, border-radius, and any other Tailwind classes |

All standard `div` HTML attributes are also supported.

## Size Patterns

### Text lines

```tsx
{/* Single line of text */}
<Skeleton className="h-4 w-48" />

{/* Shorter line */}
<Skeleton className="h-4 w-32" />

{/* Full width line */}
<Skeleton className="h-4 w-full" />

{/* Multiple lines (paragraph) */}
<div className="flex flex-col gap-2">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-3/4" />
</div>
```

### Headings

```tsx
{/* Title h5 */}
<Skeleton className="h-6 w-48" />

{/* Title h6 */}
<Skeleton className="h-5 w-36" />
```

### Avatar

```tsx
{/* Circular avatar */}
<Skeleton className="size-10 rounded-full" />

{/* Large avatar */}
<Skeleton className="size-16 rounded-full" />

{/* Square avatar */}
<Skeleton className="size-10 rounded-lg" />
```

### Button

```tsx
<Skeleton className="h-9 w-24 rounded-lg" />
```

### Input

```tsx
<Skeleton className="h-10 w-full rounded-10" />
```

### Badge

```tsx
<Skeleton className="h-5 w-16 rounded-full" />
```

### Image/thumbnail

```tsx
<Skeleton className="h-40 w-full rounded-20" />
```

## Common Loading Patterns

### Card skeleton

```tsx
function CardSkeleton() {
  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}
```

### List item skeleton

```tsx
function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex flex-1 flex-col gap-1.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
  );
}
```

### Table skeleton

```tsx
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-stroke-soft-200 px-4 py-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-stroke-soft-200 px-4 py-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
```

### Stats/metrics skeleton

```tsx
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-20 border border-stroke-soft-200 p-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Page skeleton

```tsx
function PageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Form skeleton

```tsx
function FormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-10" />
        </div>
      ))}
      <Skeleton className="mt-2 h-9 w-24 rounded-lg" />
    </div>
  );
}
```

## Integration with Suspense

```tsx
// page.tsx (Server Component)
import { Suspense } from 'react';
import { ProjectList } from './_components/project-list';

function ProjectListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-6">
      <Suspense fallback={<ProjectListSkeleton />}>
        <ProjectList />
      </Suspense>
    </div>
  );
}
```

## Integration with React Query

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

function ProjectList() {
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-10 border border-stroke-soft-200 p-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <div>{/* Render actual data */}</div>;
}
```

## Rules

- ALWAYS match the skeleton dimensions to the actual content it replaces
- Use `rounded-full` for circular elements (avatars), `rounded-lg` for buttons, `rounded-10` for inputs, `rounded-20` for cards
- Keep the skeleton structure visually similar to the loaded state
- Use consistent gap/padding with the real component
- Use `Array.from({ length: N })` to generate repeated skeleton items
- Skeleton works as a Server Component (no `'use client'` needed)
- Wrap real borders and layout around skeletons so the loading state matches the loaded state structurally

## Related Skills

- `spacing-layout.md` -- Layout patterns to match in skeletons
- `design-tokens.md` -- Border tokens used in skeleton containers
