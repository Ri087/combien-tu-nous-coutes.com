# Skill: Create a New Page

## Purpose

Complete guide to creating a new page in the Next.js 15 App Router codebase. Covers file structure, metadata, server vs client components, route constants, and sidebar integration.

## Prerequisites

- Identify which route group the page belongs to: `(auth)`, `(application)`, or `(marketing)`
- Know the page URL slug (e.g., `projects`, `settings`, `billing`)
- Know the page title for metadata

## Step-by-Step Process

### Step 1: Determine the Route Group

| Route Group | Purpose | Auth Behavior |
|-------------|---------|---------------|
| `/(application)/` | Authenticated app pages | Redirects to `/sign-in` if no session |
| `/(auth)/` | Authentication flows | Redirects to `/dashboard` if session exists |
| `/(marketing)/` | Public pages | No auth check |

Most new feature pages go in `/(application)/`.

### Step 2: Create the Directory Structure

For a feature page at `/app/(application)/[feature-name]/`:

```
/app/(application)/[feature-name]/
  page.tsx                          # Main page (Server Component)
  _components/                      # Page-specific components
    [feature]-list.tsx              # List component (Client Component)
    [feature]-card.tsx              # Card component
    [feature]-empty-state.tsx       # Empty state
  _hooks/                           # Page-specific hooks
    use-[feature].ts               # React Query + oRPC hooks
  _actions/                         # Server Actions
    create-[feature].ts            # Server action
```

Naming conventions:
- Folders use **kebab-case**: `my-feature/`
- Files use **kebab-case**: `my-feature-list.tsx`
- Components use **PascalCase**: `MyFeatureList`
- Prefix private folders with `_` to exclude from routing: `_components/`, `_hooks/`, `_actions/`

### Step 3: Create the Page File

**Simple server component page (most common):**

```tsx
// /app/(application)/projects/page.tsx
import type { Metadata } from "next";

import { ProjectList } from "./_components/project-list";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title-h5 text-text-strong-950">Projects</h1>
          <p className="text-paragraph-sm text-text-sub-600">
            Manage your projects and track progress.
          </p>
        </div>
      </div>

      {/* Page content */}
      <ProjectList />
    </div>
  );
}
```

**Page with search params (nuqs pattern):**

```tsx
// /app/(application)/projects/page.tsx
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";

import { ProjectList } from "./_components/project-list";
import { searchParamsCache } from "./search-params";

export const metadata: Metadata = {
  title: "Projects",
};

type ProjectsPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  await searchParamsCache.parse(searchParams);

  return (
    <div className="flex flex-col gap-6 p-6">
      <ProjectList />
    </div>
  );
}
```

**Page with dynamic route:**

```tsx
// /app/(application)/projects/[id]/page.tsx
import type { Metadata } from "next";

import { ProjectDetail } from "./_components/project-detail";

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Project ${id}`,
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-6 p-6">
      <ProjectDetail projectId={id} />
    </div>
  );
}
```

### Step 4: Add Route to Constants

Open `/constants/pages.ts` and add the new route:

```typescript
export const APPLICATION_PAGES = {
  DASHBOARD: "/dashboard",
  PROJECTS: "/projects",           // Add new route
  PROJECT_DETAIL: "/projects/[id]", // Optional: dynamic route reference
};
```

Use the constant throughout the codebase instead of hardcoding paths:

```tsx
import { PAGES } from "@/constants/pages";

// In links
<Link href={PAGES.PROJECTS}>Projects</Link>

// In redirects
redirect(PAGES.PROJECTS);

// In router pushes
router.push(PAGES.PROJECTS);
```

### Step 5: Create the Main Client Component

```tsx
// /app/(application)/projects/_components/project-list.tsx
"use client";

import { RiAddLine } from "@remixicon/react";
import * as Button from "@/components/ui/button";

export function ProjectList() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-label-md text-text-strong-950">All Projects</h2>
        <Button.Root variant="primary" size="small">
          <Button.Icon as={RiAddLine} />
          New Project
        </Button.Root>
      </div>

      {/* Content here */}
    </div>
  );
}
```

### Step 6: Add to Sidebar (if applicable)

If the application has a sidebar, add a navigation entry. See the `sidebar-entry.md` skill for details.

## Complete Example: Creating a "Projects" Page

### File: `/constants/pages.ts`

```typescript
export const APPLICATION_PAGES = {
  DASHBOARD: "/dashboard",
  PROJECTS: "/projects",
};
```

### File: `/app/(application)/projects/page.tsx`

```tsx
import type { Metadata } from "next";

import { ProjectList } from "./_components/project-list";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title-h5 text-text-strong-950">Projects</h1>
          <p className="text-paragraph-sm text-text-sub-600">
            Manage your projects and track progress.
          </p>
        </div>
      </div>
      <ProjectList />
    </div>
  );
}
```

### File: `/app/(application)/projects/_components/project-list.tsx`

```tsx
"use client";

import { RiAddLine, RiFolderLine } from "@remixicon/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as Button from "@/components/ui/button";
import { orpc } from "@/lib/orpc/react";

export function ProjectList() {
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery(
    orpc.projects.list.queryOptions({ input: {} })
  );

  if (isLoading) {
    return <ProjectListSkeleton />;
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

## Rules

- Pages are **Server Components by default** -- do NOT add `"use client"` to page.tsx
- Interactive components go in `_components/` with `"use client"`
- Always export `metadata` (static) or `generateMetadata` (dynamic) for SEO
- Always add new routes to `/constants/pages.ts`
- Use AlignUI design tokens for styling (see patterns below)
- Follow the feature-first folder structure with `_components/`, `_hooks/`, `_actions/`

## Design Token Quick Reference

```
Text:    text-text-strong-950, text-text-sub-600, text-text-soft-400, text-text-disabled-300
BG:      bg-bg-white-0, bg-bg-weak-50, bg-bg-soft-200, bg-bg-strong-950
Border:  border-stroke-soft-200
Shadow:  shadow-regular-xs, shadow-regular-md
Title:   text-title-h5, text-title-h6
Label:   text-label-sm, text-label-md
Body:    text-paragraph-sm, text-paragraph-md
```
