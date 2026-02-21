# Skill: When and How to Use Server Components

## When to Use

Use this skill when creating components that render on the server. Server Components are the **default** in Next.js App Router -- you do NOT need to add any directive. This skill explains when to keep a component as a Server Component and how to leverage server rendering effectively.

## The Default

Every `.tsx` file in the App Router is a Server Component unless it has `"use client"` at the top. This means:

- Pages (`page.tsx`) are Server Components by default
- Layout files (`layout.tsx`) are Server Components by default
- Any component file without `"use client"` is a Server Component

## When to Use Server Components

### 1. Data Fetching

Server Components can be `async` and directly await data.

```tsx
// app/(application)/projects/page.tsx
import { db } from "@/db";
import { projects } from "@/db/schema/projects";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

import { ProjectList } from "./_components/project-list";

export default async function ProjectsPage() {
  const session = await auth();
  const userProjects = await db.query.projects.findMany({
    where: eq(projects.userId, session.user.id),
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-heading-md text-text-strong-950">Projects</h1>
      <ProjectList projects={userProjects} />
    </div>
  );
}
```

### 2. Static Rendering / Display Components

Components that only render data from props without interactivity.

```tsx
// app/(application)/projects/_components/project-stats.tsx
import * as Badge from "@/components/ui/badge";

interface ProjectStatsProps {
  totalCount: number;
  activeCount: number;
  archivedCount: number;
}

export function ProjectStats({ totalCount, activeCount, archivedCount }: ProjectStatsProps) {
  return (
    <div className="flex items-center gap-3">
      <Badge.Root variant="light" color="blue">
        {totalCount} total
      </Badge.Root>
      <Badge.Root variant="light" color="green">
        {activeCount} active
      </Badge.Root>
      <Badge.Root variant="lighter" color="gray">
        {archivedCount} archived
      </Badge.Root>
    </div>
  );
}
```

### 3. Layout and Structural Components

Wrappers that compose other components without needing interactivity.

```tsx
// app/(application)/projects/_components/project-page-layout.tsx
interface ProjectPageLayoutProps {
  header: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}

export function ProjectPageLayout({ header, sidebar, children }: ProjectPageLayoutProps) {
  return (
    <div className="flex h-full">
      {sidebar && (
        <aside className="w-[272px] border-r border-stroke-soft-200 bg-bg-white-0">
          {sidebar}
        </aside>
      )}
      <main className="flex flex-1 flex-col">
        <div className="border-b border-stroke-soft-200 px-6 py-4">
          {header}
        </div>
        <div className="flex-1 p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
```

### 4. Components That Access Server-Only Resources

Anything that reads from the filesystem, environment variables (server-only), or directly calls the database.

```tsx
// app/(application)/settings/_components/app-version.tsx
import { readFileSync } from "fs";
import path from "path";

export function AppVersion() {
  const packageJson = JSON.parse(
    readFileSync(path.join(process.cwd(), "package.json"), "utf-8")
  );

  return (
    <span className="text-paragraph-xs text-text-soft-400">
      v{packageJson.version}
    </span>
  );
}
```

## What Server Components CANNOT Do

Server Components do NOT support:

| Feature | Alternative |
|---------|-------------|
| `useState`, `useReducer` | Pass state to Client Component children |
| `useEffect`, `useLayoutEffect` | Use Client Component for side effects |
| `useRef` (for DOM) | Use Client Component with forwardRef |
| Event handlers (`onClick`, `onChange`) | Wrap in a Client Component |
| Browser APIs (`window`, `localStorage`) | Use Client Component |
| `useContext` | Use Client Component with context provider |
| `useForm` (React Hook Form) | Use Client Component for forms |
| `useQuery` (TanStack Query) | Use Client Component for client-side data |

## Patterns

### Pattern 1: Server Component Page with Client Component Islands

The page fetches data on the server and passes it to interactive Client Components.

```tsx
// app/(application)/dashboard/page.tsx (Server Component)
import { db } from "@/db";

import { DashboardStats } from "./_components/dashboard-stats";
import { RecentActivity } from "./_components/recent-activity";
import { QuickActions } from "./_components/quick-actions"; // Client Component

export default async function DashboardPage() {
  const stats = await db.query.stats.findFirst();
  const activities = await db.query.activities.findMany({ limit: 10 });

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Server Component -- static display */}
      <DashboardStats stats={stats} />

      {/* Client Component -- has interactive filters */}
      <QuickActions />

      {/* Server Component -- static list */}
      <RecentActivity activities={activities} />
    </div>
  );
}
```

### Pattern 2: Passing Serializable Data to Client Components

When a Server Component passes data to a Client Component, the data must be serializable (JSON-safe). This means no functions, no class instances, no `Date` objects without conversion.

```tsx
// Server Component
export default async function Page() {
  const projects = await db.query.projects.findMany();

  // Convert Date objects to strings before passing to Client Component
  const serializedProjects = projects.map(p => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return <ProjectList projects={serializedProjects} />;
}
```

### Pattern 3: Server Component Composing Client Components with Children

Use the children pattern to keep Server Component content inside a Client Component layout.

```tsx
// Client Component -- interactive wrapper
// _components/collapsible-section.tsx
"use client";

import { useState } from "react";
import { RiArrowDownSLine } from "@remixicon/react";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
}

export function CollapsibleSection({ title, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2">
        <RiArrowDownSLine className={`size-5 transition ${isOpen ? "" : "-rotate-90"}`} />
        <span className="text-label-md text-text-strong-950">{title}</span>
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
}
```

```tsx
// Server Component -- page
// page.tsx
import { CollapsibleSection } from "./_components/collapsible-section";
import { ProjectStats } from "./_components/project-stats";

export default async function Page() {
  const stats = await getStats(); // Server-side data fetch

  return (
    <CollapsibleSection title="Statistics">
      {/* This Server Component content is rendered on the server */}
      {/* even though its parent is a Client Component */}
      <ProjectStats stats={stats} />
    </CollapsibleSection>
  );
}
```

### Pattern 4: Server Actions for Mutations

Instead of creating API endpoints, use Server Actions for mutations triggered from Client Components.

```tsx
// app/(application)/projects/_actions/create-project.ts
"use server";

import { db } from "@/db";
import { projects } from "@/db/schema/projects";
import { auth } from "@/lib/auth";
import { createProjectSchema } from "@/validators/project";

export async function createProject(formData: FormData) {
  const session = await auth();
  const parsed = createProjectSchema.parse({
    name: formData.get("name"),
  });

  await db.insert(projects).values({
    name: parsed.name,
    userId: session.user.id,
  });
}
```

## Performance Benefits

1. **Zero client JavaScript** -- Server Components send only HTML, no JS bundle cost
2. **Direct data access** -- No waterfall of API calls; query the database directly
3. **Streaming** -- Server Components can stream their output progressively
4. **Caching** -- Next.js can cache Server Component output at the edge
5. **Smaller bundles** -- Heavy dependencies (date libraries, markdown parsers) stay on the server

## Checklist

- [ ] No `"use client"` directive in the file (Server Component is the default)
- [ ] No React hooks used (`useState`, `useEffect`, `useRef`, etc.)
- [ ] No event handlers in the JSX (`onClick`, `onChange`, etc.)
- [ ] No browser API access (`window`, `document`, `localStorage`)
- [ ] Data passed to Client Component children is serializable (no functions, Dates converted to strings)
- [ ] Async data fetching uses `await` directly in the component body
- [ ] Interactive parts are extracted to Client Component children
