# Skill: How to Implement Error Pages

## Purpose

Guide to implementing error handling pages in Next.js 16. Covers `error.tsx` files, `not-found.tsx` files, error boundaries, and error reset patterns.

## Error Handling Hierarchy

Next.js provides three special files for error handling:

| File | Purpose | Scope |
|------|---------|-------|
| `error.tsx` | Catches runtime errors | Wraps `page.tsx` in an error boundary |
| `not-found.tsx` | 404 page or `notFound()` call | Route segment or global |
| `global-error.tsx` | Catches errors in root layout | Entire application |

## Error Boundary: `error.tsx`

### Basic Error Page

```tsx
// /app/(application)/projects/error.tsx
"use client"; // REQUIRED -- error components must be client components

import { RiErrorWarningLine, RiRefreshLine } from "@remixicon/react";
import * as Button from "@/components/ui/button";

export default function ProjectsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Error icon */}
        <div className="flex size-16 items-center justify-center rounded-full bg-error-lighter">
          <RiErrorWarningLine className="size-8 text-error-base" />
        </div>

        {/* Error message */}
        <div className="flex flex-col gap-1">
          <h2 className="text-title-h5 text-text-strong-950">
            Something went wrong
          </h2>
          <p className="max-w-md text-paragraph-sm text-text-sub-600">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
        </div>

        {/* Reset button */}
        <Button.Root variant="primary" size="medium" onClick={reset}>
          <Button.Icon as={RiRefreshLine} />
          Try again
        </Button.Root>
      </div>
    </div>
  );
}
```

### Key Rules for `error.tsx`

1. **MUST** be a client component (`"use client"`)
2. Receives two props:
   - `error`: The Error object (includes `message` and optional `digest`)
   - `reset`: Function to retry rendering the segment
3. Catches errors from:
   - `page.tsx` rendering
   - Child component rendering
   - Server Component data fetching
4. Does NOT catch errors from:
   - The `layout.tsx` in the same segment (use parent error boundary)
   - The root layout (use `global-error.tsx`)

### Error Page with Logging

```tsx
"use client";

import { useEffect } from "react";
import { RiErrorWarningLine, RiRefreshLine, RiArrowLeftLine } from "@remixicon/react";
import { useRouter } from "next/navigation";
import * as Button from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to an error reporting service
    console.error("Page error:", error);
  }, [error]);

  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-error-lighter">
          <RiErrorWarningLine className="size-8 text-error-base" />
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-title-h5 text-text-strong-950">
            Something went wrong
          </h2>
          <p className="max-w-md text-paragraph-sm text-text-sub-600">
            An unexpected error occurred. Please try again or go back.
          </p>
          {error.digest && (
            <p className="text-paragraph-xs text-text-soft-400">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button.Root
            variant="neutral"
            mode="stroke"
            size="medium"
            onClick={() => router.back()}
          >
            <Button.Icon as={RiArrowLeftLine} />
            Go back
          </Button.Root>
          <Button.Root variant="primary" size="medium" onClick={reset}>
            <Button.Icon as={RiRefreshLine} />
            Try again
          </Button.Root>
        </div>
      </div>
    </div>
  );
}
```

## Not Found: `not-found.tsx`

### Global Not Found Page

```tsx
// /app/not-found.tsx
import { RiSearchLine } from "@remixicon/react";
import Link from "next/link";
import * as Button from "@/components/ui/button";
import { PAGES } from "@/constants/pages";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-bg-weak-50">
          <RiSearchLine className="size-8 text-text-sub-600" />
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-title-h5 text-text-strong-950">Page not found</h2>
          <p className="max-w-md text-paragraph-sm text-text-sub-600">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <Button.Root asChild variant="primary" size="medium">
          <Link href={PAGES.DASHBOARD}>Go to Dashboard</Link>
        </Button.Root>
      </div>
    </div>
  );
}
```

### Segment-Level Not Found

```tsx
// /app/(application)/projects/not-found.tsx
import { RiFolderLine } from "@remixicon/react";
import Link from "next/link";
import * as Button from "@/components/ui/button";
import { PAGES } from "@/constants/pages";

export default function ProjectNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-bg-weak-50">
          <RiFolderLine className="size-8 text-text-sub-600" />
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-title-h5 text-text-strong-950">
            Project not found
          </h2>
          <p className="max-w-md text-paragraph-sm text-text-sub-600">
            This project does not exist or you do not have access to it.
          </p>
        </div>

        <Button.Root asChild variant="primary" size="medium">
          <Link href={PAGES.PROJECTS}>Back to Projects</Link>
        </Button.Root>
      </div>
    </div>
  );
}
```

### Triggering Not Found from a Page

```tsx
// /app/(application)/projects/[id]/page.tsx
import { notFound } from "next/navigation";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch project data
  const project = await getProject(id);

  // Trigger the nearest not-found.tsx
  if (!project) {
    notFound();
  }

  return <ProjectDetail project={project} />;
}
```

## Global Error: `global-error.tsx`

Catches errors that occur in the root layout itself. This is the last resort error boundary.

```tsx
// /app/global-error.tsx
"use client"; // REQUIRED

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    // Must include <html> and <body> since root layout is broken
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Something went wrong
          </h2>
          <p className="max-w-md text-sm text-gray-600">
            A critical error occurred. Please try refreshing the page.
          </p>
          <button
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            onClick={reset}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
```

Note: `global-error.tsx` must define its own `<html>` and `<body>` tags because it replaces the root layout when active. Use plain HTML/CSS instead of AlignUI components here since the Providers may not be available.

## Error Handling in Client Components

For errors in client components (e.g., oRPC/React Query), handle them within the component:

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { RiRefreshLine } from "@remixicon/react";
import * as Button from "@/components/ui/button";

export function ProjectList() {
  const { data, isLoading, error, refetch } = useQuery(
    orpc.projects.list.queryOptions({ input: {} })
  );

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-stroke-soft-200 p-8">
        <p className="text-paragraph-sm text-text-sub-600">
          Failed to load projects.
        </p>
        <Button.Root variant="neutral" mode="stroke" size="small" onClick={() => refetch()}>
          <Button.Icon as={RiRefreshLine} />
          Retry
        </Button.Root>
      </div>
    );
  }

  // ... render data
}
```

## File Placement

```
/app/
  global-error.tsx              # Catches root layout errors
  not-found.tsx                 # Global 404 page
  (application)/
    error.tsx                   # Catches all application page errors
    not-found.tsx               # Application-level 404
    projects/
      error.tsx                 # Catches project page errors specifically
      not-found.tsx             # Project-specific 404
      [id]/
        not-found.tsx           # Project detail 404
```

## Best Practices

- Always include a "Try again" button that calls the `reset` function
- Include a "Go back" option using `router.back()` or a link to a known-good page
- Keep error pages visually consistent with the rest of the app
- Use AlignUI design tokens for styling error pages (except `global-error.tsx`)
- Log errors in `useEffect` for monitoring
- Show the error digest when available for support purposes
- `error.tsx` files should be placed at the most specific route segment level needed
