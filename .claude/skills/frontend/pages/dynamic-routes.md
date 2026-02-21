# Skill: How to Create Dynamic Routes

## Purpose

Guide to creating dynamic routes in Next.js 15 App Router. Covers `[id]` params, `[...slug]` catch-all routes, `[[...rest]]` optional catch-all routes, and `generateStaticParams`.

## Dynamic Route Types

| Syntax | Example URL | Params |
|--------|-------------|--------|
| `[id]` | `/projects/abc123` | `{ id: "abc123" }` |
| `[...slug]` | `/docs/getting/started` | `{ slug: ["getting", "started"] }` |
| `[[...slug]]` | `/docs` or `/docs/api/ref` | `{ slug: undefined }` or `{ slug: ["api", "ref"] }` |

## Single Dynamic Segment: `[id]`

### File Structure

```
/app/(application)/projects/
  page.tsx                          # /projects (list page)
  [id]/
    page.tsx                        # /projects/:id (detail page)
    _components/
      project-detail.tsx
```

### Page Implementation

```tsx
// /app/(application)/projects/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectDetail } from "./_components/project-detail";

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
};

// Dynamic metadata based on params
export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  // Optionally fetch data for the title
  // const project = await getProject(id);
  // return { title: project?.name ?? "Project" };

  return {
    title: `Project ${id}`,
  };
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-6 p-6">
      <ProjectDetail projectId={id} />
    </div>
  );
}
```

### Important: `params` is a Promise in Next.js 15

In Next.js 15, `params` is a `Promise` and must be awaited:

```tsx
// CORRECT -- Next.js 15
type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;  // Must await
}

// WRONG -- Next.js 14 style (will cause errors)
type PageProps = {
  params: { id: string };
};

export default function Page({ params }: PageProps) {
  const { id } = params;  // No await -- breaks in Next.js 15
}
```

### Client Component Receiving the ID

```tsx
// /app/(application)/projects/[id]/_components/project-detail.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { RiArrowLeftLine } from "@remixicon/react";
import Link from "next/link";

import * as Button from "@/components/ui/button";
import { PAGES } from "@/constants/pages";
import { orpc } from "@/lib/orpc/react";

interface ProjectDetailProps {
  projectId: string;
}

export function ProjectDetail({ projectId }: ProjectDetailProps) {
  const { data: project, isLoading } = useQuery(
    orpc.projects.get.queryOptions({ input: { id: projectId } })
  );

  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button.Root asChild variant="neutral" mode="ghost" size="small">
          <Link href={PAGES.PROJECTS}>
            <Button.Icon as={RiArrowLeftLine} />
            Back
          </Link>
        </Button.Root>
      </div>
      <h1 className="text-title-h5 text-text-strong-950">{project.name}</h1>
    </div>
  );
}
```

## Multiple Dynamic Segments

```
/app/(application)/projects/[projectId]/tasks/[taskId]/page.tsx
```

URL: `/projects/proj_123/tasks/task_456`

```tsx
type TaskPageProps = {
  params: Promise<{ projectId: string; taskId: string }>;
};

export default async function TaskPage({ params }: TaskPageProps) {
  const { projectId, taskId } = await params;

  return <TaskDetail projectId={projectId} taskId={taskId} />;
}
```

## Catch-All Routes: `[...slug]`

Matches one or more segments.

```
/app/(marketing)/docs/[...slug]/page.tsx
```

| URL | `slug` value |
|-----|-------------|
| `/docs/intro` | `["intro"]` |
| `/docs/api/reference` | `["api", "reference"]` |
| `/docs` | 404 (does not match) |

```tsx
type DocsPageProps = {
  params: Promise<{ slug: string[] }>;
};

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug } = await params;

  // slug is an array of path segments
  const fullPath = slug.join("/"); // "api/reference"

  return <DocContent path={fullPath} />;
}
```

## Optional Catch-All Routes: `[[...slug]]`

Matches zero or more segments. Also matches the base route without any segments.

```
/app/(marketing)/docs/[[...slug]]/page.tsx
```

| URL | `slug` value |
|-----|-------------|
| `/docs` | `undefined` |
| `/docs/intro` | `["intro"]` |
| `/docs/api/reference` | `["api", "reference"]` |

```tsx
type DocsPageProps = {
  params: Promise<{ slug?: string[] }>;
};

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug } = await params;

  if (!slug) {
    return <DocsIndex />;
  }

  const fullPath = slug.join("/");
  return <DocContent path={fullPath} />;
}
```

## Nested Dynamic Routes with Layouts

```
/app/(application)/projects/
  page.tsx                              # /projects
  [id]/
    layout.tsx                          # Layout for all project detail pages
    page.tsx                            # /projects/:id
    settings/
      page.tsx                          # /projects/:id/settings
    members/
      page.tsx                          # /projects/:id/members
      [memberId]/
        page.tsx                        # /projects/:id/members/:memberId
```

The layout at `[id]/layout.tsx` wraps all nested pages:

```tsx
// /app/(application)/projects/[id]/layout.tsx
import type { ReactNode } from "react";
import { ProjectNav } from "./_components/project-nav";

type ProjectLayoutProps = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-6 p-6">
      <ProjectNav projectId={id} />
      {children}
    </div>
  );
}
```

## `generateStaticParams`

Pre-render dynamic routes at build time for static generation:

```tsx
// /app/(application)/projects/[id]/page.tsx
import { db } from "@/db";
import { projects } from "@/db/schema/projects";

export async function generateStaticParams() {
  const allProjects = await db.select({ id: projects.id }).from(projects);

  return allProjects.map((project) => ({
    id: project.id,
  }));
}

// The page component
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // ...
}
```

For nested dynamic routes:

```tsx
// /app/(application)/projects/[projectId]/members/[memberId]/page.tsx
export async function generateStaticParams() {
  const allProjects = await db.select().from(projects);

  return allProjects.flatMap((project) =>
    project.members.map((member) => ({
      projectId: project.id,
      memberId: member.id,
    }))
  );
}
```

### When to Use `generateStaticParams`

- **Public pages** that should be statically generated for SEO/performance
- **Content-heavy pages** (blog posts, documentation)
- **NOT typically needed** for authenticated application pages (these are dynamically rendered)

## Linking to Dynamic Routes

```tsx
import Link from "next/link";
import { PAGES } from "@/constants/pages";

// Simple dynamic link
<Link href={`/projects/${project.id}`}>
  {project.name}
</Link>

// Using constants (define a helper)
const projectUrl = (id: string) => `/projects/${id}`;

<Link href={projectUrl(project.id)}>
  {project.name}
</Link>
```

## Route Constants for Dynamic Routes

In `/constants/pages.ts`, you can store the pattern for reference, but use template literals for actual URLs:

```typescript
export const APPLICATION_PAGES = {
  DASHBOARD: "/dashboard",
  PROJECTS: "/projects",
  PROJECT_DETAIL: "/projects/[id]",  // Pattern reference only
};

// Helper function for generating URLs
export function projectDetailUrl(id: string) {
  return `/projects/${id}`;
}
```

## Common Patterns

### Detail Page with Not Found

```tsx
export default async function DetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Validate ID format (optional)
  if (!isValidUUID(id)) {
    notFound();
  }

  return <Detail id={id} />;
}
```

### Detail Page with Tabs

```
/app/(application)/projects/[id]/
  layout.tsx           # Project header + tab navigation
  page.tsx             # /projects/:id -> Overview tab (default)
  tasks/page.tsx       # /projects/:id/tasks
  settings/page.tsx    # /projects/:id/settings
```

## Rules

- In Next.js 15, `params` is always a `Promise` -- always `await` it
- `searchParams` is also a `Promise` in Next.js 15
- Dynamic segments are always strings -- parse to numbers/UUIDs as needed
- Use `notFound()` for invalid IDs rather than showing error states
- Pass the ID as a prop to client components rather than using `useParams()` when possible
- Keep the page file as a thin Server Component that delegates to client components
