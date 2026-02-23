# Skill: When to Use Server vs Client Components

## Purpose

Guide to choosing between Server Components and Client Components in the Next.js 16 App Router. Covers when to use each, data fetching patterns, form components, and composition strategies.

## The Default: Server Components

In Next.js App Router, **all components are Server Components by default**. You must explicitly opt into Client Components with the `"use client"` directive.

## Decision Matrix

| Need | Component Type | Why |
|------|---------------|-----|
| Display static content | Server | No JS sent to client |
| Fetch data from DB/API | Server | Direct server access, no waterfalls |
| Access environment variables | Server | Secrets stay on server |
| Read cookies/headers | Server | `cookies()`, `headers()` from `next/headers` |
| SEO metadata | Server | `export const metadata` or `generateMetadata` |
| Redirect users | Server | `redirect()` from `next/navigation` |
| Handle form input | **Client** | Needs `useState`, `onChange` |
| Use React hooks | **Client** | `useState`, `useEffect`, `useRef`, etc. |
| Use browser APIs | **Client** | `window`, `localStorage`, etc. |
| Use event handlers | **Client** | `onClick`, `onSubmit`, `onChange` |
| Use React Query / oRPC | **Client** | `useQuery`, `useMutation` |
| Use URL state (nuqs) | **Client** | `useQueryStates` |
| Use animations | **Client** | `motion/react`, transitions |
| Use `usePathname` | **Client** | Navigation hooks |

## Codebase Patterns

### Pattern 1: Server Page + Client Component (Most Common)

The page file is a Server Component. It delegates interactive UI to client components in `_components/`.

```tsx
// /app/(application)/projects/page.tsx (SERVER COMPONENT)
// No "use client" directive
import type { Metadata } from "next";
import { ProjectList } from "./_components/project-list";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-title-h5 text-text-strong-950">Projects</h1>
      </div>
      <ProjectList />
    </div>
  );
}
```

```tsx
// /app/(application)/projects/_components/project-list.tsx (CLIENT COMPONENT)
"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc/react";

export function ProjectList() {
  const { data: projects, isLoading } = useQuery(
    orpc.projects.list.queryOptions({ input: {} })
  );

  // ... interactive rendering
}
```

### Pattern 2: Auth Page with Search Params

The page is a server component that parses search params and passes them to a client form component.

```tsx
// page.tsx (SERVER)
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { SignInForm } from "./_components/sign-in-form";
import { searchParamsCache } from "./search-params";

export const metadata: Metadata = {
  title: "Sign In",
};

type SignInPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function PageLogin({ searchParams }: SignInPageProps) {
  await searchParamsCache.parse(searchParams);
  return <SignInForm />;
}
```

```tsx
// _components/sign-in-form.tsx (CLIENT)
"use client";

import { useForm } from "react-hook-form";
import { useQueryStates } from "nuqs";
import { messageParsers } from "../search-params";

export function SignInForm() {
  const [{ message, error }] = useQueryStates(messageParsers);
  const { register, handleSubmit } = useForm({ ... });
  // ... form rendering
}
```

### Pattern 3: Server Component with Data Fetching

```tsx
// /app/(application)/projects/page.tsx (SERVER)
import { db } from "@/db";
import { projects } from "@/db/schema/projects";
import { getServerSession } from "@/lib/auth/utils";
import { eq } from "drizzle-orm";
import { ProjectList } from "./_components/project-list";

export default async function ProjectsPage() {
  const session = await getServerSession();

  // Direct database access in Server Component
  const userProjects = await db.query.projects.findMany({
    where: eq(projects.userId, session!.user.id),
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Pass data as props to client component */}
      <ProjectList initialProjects={userProjects} />
    </div>
  );
}
```

### Pattern 4: Composition (Server + Client Together)

You can nest Server Components inside Client Components using the `children` pattern:

```tsx
// ServerDataDisplay.tsx (SERVER)
import { db } from "@/db";

export async function ServerDataDisplay() {
  const stats = await db.query.stats.findFirst();
  return (
    <div className="text-label-md text-text-strong-950">
      {stats?.totalProjects} projects
    </div>
  );
}
```

```tsx
// InteractiveWrapper.tsx (CLIENT)
"use client";
import { useState } from "react";

export function InteractiveWrapper({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <button onClick={() => setIsExpanded(!isExpanded)}>Toggle</button>
      {isExpanded && children}
    </div>
  );
}
```

```tsx
// page.tsx (SERVER)
import { InteractiveWrapper } from "./_components/interactive-wrapper";
import { ServerDataDisplay } from "./_components/server-data-display";

export default function Page() {
  return (
    <InteractiveWrapper>
      {/* Server Component rendered as children of Client Component */}
      <ServerDataDisplay />
    </InteractiveWrapper>
  );
}
```

## Common Mistakes

### Mistake 1: Making Pages Client Components

```tsx
// WRONG -- Do not add "use client" to page.tsx
"use client";
export default function ProjectsPage() { ... }

// CORRECT -- Keep page.tsx as Server Component
export default function ProjectsPage() { ... }
```

### Mistake 2: Fetching Data in Client Components Without React Query

```tsx
// WRONG -- useEffect for data fetching
"use client";
import { useEffect, useState } from "react";

export function ProjectList() {
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(setProjects);
  }, []);
}

// CORRECT -- Use React Query + oRPC
"use client";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc/react";

export function ProjectList() {
  const { data: projects } = useQuery(
    orpc.projects.list.queryOptions({ input: {} })
  );
}
```

### Mistake 3: Importing Server-Only Code in Client Components

```tsx
// WRONG -- Importing DB directly in client component
"use client";
import { db } from "@/db"; // This will fail

// CORRECT -- Use oRPC or pass data as props
"use client";
import { orpc } from "@/lib/orpc/react";
```

### Mistake 4: Using Hooks in Server Components

```tsx
// WRONG -- Cannot use hooks in Server Components
import { useState } from "react"; // Error!

export default function Page() {
  const [count, setCount] = useState(0);
}

// CORRECT -- Move hook usage to a Client Component
import { Counter } from "./_components/counter";

export default function Page() {
  return <Counter />;
}
```

## File Organization Rules

```
/app/(application)/feature/
  page.tsx              → Always Server Component
  layout.tsx            → Always Server Component
  loading.tsx           → Server Component (no interactivity needed)
  error.tsx             → Always Client Component (required by Next.js)
  not-found.tsx         → Server Component (can be, no requirement)
  search-params.ts      → Shared (imported by both server and client)
  _components/
    feature-form.tsx    → Client Component (forms, interactivity)
    feature-list.tsx    → Client Component (React Query, interactivity)
    feature-card.tsx    → Can be either (if pure display: server; if clickable: client)
    feature-header.tsx  → Usually Server Component (static display)
  _hooks/
    use-feature.ts      → Client-only (hooks are client-side)
  _actions/
    create-feature.ts   → Server Actions (server-side, but callable from client)
```

## Server Actions

Server Actions bridge the gap between client and server:

```tsx
// /app/(application)/projects/_actions/create-project.ts
"use server";

import { db } from "@/db";
import { projects } from "@/db/schema/projects";
import { getServerSession } from "@/lib/auth/utils";

export async function createProject(formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const name = formData.get("name") as string;

  await db.insert(projects).values({
    name,
    userId: session.user.id,
  });
}
```

```tsx
// _components/create-project-form.tsx (CLIENT)
"use client";

import { createProject } from "../_actions/create-project";

export function CreateProjectForm() {
  return (
    <form action={createProject}>
      <input name="name" />
      <button type="submit">Create</button>
    </form>
  );
}
```

## Summary

| File | Default Type | Can Change? |
|------|-------------|-------------|
| `page.tsx` | Server | Keep as server |
| `layout.tsx` | Server | Keep as server |
| `loading.tsx` | Server | Keep as server |
| `error.tsx` | Client (required) | No |
| `_components/*.tsx` | Server | Add `"use client"` when needed |
| `_hooks/*.ts` | N/A | Always client-only |
| `_actions/*.ts` | Server Action | Use `"use server"` |

**Rule of thumb**: Start with Server Components. Only add `"use client"` when you need interactivity, hooks, or browser APIs. Push the `"use client"` boundary as far down the component tree as possible.
