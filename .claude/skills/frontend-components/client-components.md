# Skill: When and How to Use Client Components

## When to Use

Use this skill to decide whether a component needs the `"use client"` directive and how to structure client components properly.

## The Rule

In Next.js App Router, **all components are Server Components by default**. You must explicitly opt into Client Components by adding `"use client"` at the very top of the file.

## When You MUST Use "use client"

Add `"use client"` when the component uses ANY of the following:

### 1. React Hooks

```tsx
"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
```

Any hook (`useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, `useContext`, `useReducer`, `useId`, custom hooks) requires "use client".

### 2. Event Handlers

```tsx
"use client";

export function SearchInput() {
  return (
    <input onChange={(e) => console.log(e.target.value)} />
    // onClick, onSubmit, onChange, onKeyDown, etc. all need "use client"
  );
}
```

### 3. Browser APIs

```tsx
"use client";

// window, document, localStorage, navigator, etc.
const theme = localStorage.getItem("theme");
```

### 4. Third-Party Libraries That Use Hooks/Browser APIs

```tsx
"use client";

import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
```

### 5. Context Providers and Consumers

```tsx
"use client";

import { createContext, useContext } from "react";
```

## When You Do NOT Need "use client"

Do NOT add "use client" for components that only:

- Render JSX with props
- Import and compose other components (even Client Components)
- Use `async/await` for data fetching
- Access server-only resources (database, file system)
- Render static content

```tsx
// NO "use client" needed -- this is a Server Component
import * as Badge from "@/components/ui/badge";

interface StatusDisplayProps {
  status: "active" | "archived";
}

export function StatusDisplay({ status }: StatusDisplayProps) {
  return (
    <Badge.Root variant={status === "active" ? "light" : "lighter"}>
      {status}
    </Badge.Root>
  );
}
```

## How to Structure Client Components

### Rule: Keep the Client Boundary as Small as Possible

The `"use client"` directive creates a boundary. Everything imported into a Client Component file also becomes part of the client bundle. Minimize what crosses this boundary.

**BAD -- entire page is a Client Component:**

```tsx
// app/(application)/projects/page.tsx
"use client"; // BAD: Makes the entire page a client component

import { useState } from "react";

export default function ProjectsPage() {
  const [filter, setFilter] = useState("all");

  // 200 lines of mixed server/client logic...
  return (
    <div>
      {/* Everything is now client-rendered */}
    </div>
  );
}
```

**GOOD -- page is Server Component, only interactive parts are Client Components:**

```tsx
// app/(application)/projects/page.tsx (Server Component)
import { ProjectList } from "./_components/project-list";

export default async function ProjectsPage() {
  return <ProjectList />;
}
```

```tsx
// app/(application)/projects/_components/project-list.tsx (Client Component)
"use client";

import { useState } from "react";

import { ProjectCard } from "./project-card"; // This becomes client too

export function ProjectList() {
  const [filter, setFilter] = useState("all");
  // Only the interactive parts are client-rendered
  return <div>{/* ... */}</div>;
}
```

### Pattern: Pass Server Data to Client Children

```tsx
// Server Component (page.tsx)
import { db } from "@/db";
import { ProjectFilters } from "./_components/project-filters";

export default async function ProjectsPage() {
  const projects = await db.query.projects.findMany();

  return (
    <div>
      <h1 className="text-heading-md text-text-strong-950">Projects</h1>
      {/* Server data passed as props to Client Component */}
      <ProjectFilters projects={projects} />
    </div>
  );
}
```

```tsx
// Client Component (_components/project-filters.tsx)
"use client";

import { useState } from "react";

interface Project {
  id: string;
  name: string;
  status: string;
}

interface ProjectFiltersProps {
  projects: Project[];
}

export function ProjectFilters({ projects }: ProjectFiltersProps) {
  const [filter, setFilter] = useState("all");

  const filtered = projects.filter(p => filter === "all" || p.status === filter);

  return (
    <div>
      {/* Interactive filtering UI */}
    </div>
  );
}
```

### Pattern: Wrap Third-Party Client Components

When a third-party component needs client rendering but you want to use it in a Server Component tree, create a thin wrapper.

```tsx
// components/header.tsx
"use client";

import dynamic from "next/dynamic";

const ThemeSwitchWrapper = () => {
  const DynamicThemeSwitch = dynamic(() => import("./theme-switch"), {
    ssr: false,
  });
  return <DynamicThemeSwitch />;
};

export default function Header() {
  return (
    <header>
      <ThemeSwitchWrapper />
    </header>
  );
}
```

### Pattern: Client Component with oRPC and TanStack Query

```tsx
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RiAddLine } from "@remixicon/react";

import * as Button from "@/components/ui/button";
import { orpc } from "@/lib/orpc/react";

export function ProjectList() {
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery(
    orpc.projects.list.queryOptions({ input: {} })
  );

  const createMutation = useMutation(
    orpc.projects.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.projects.list.key() });
      },
    })
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Button.Root
        variant="primary"
        mode="filled"
        onClick={() => createMutation.mutate({ name: "New Project" })}
        disabled={createMutation.isPending}
      >
        <Button.Icon as={RiAddLine} />
        Create Project
      </Button.Root>
      {/* Render projects... */}
    </div>
  );
}
```

## The "use client" Directive Placement

The directive MUST be at the very first line of the file, before any imports.

```tsx
// CORRECT
"use client";

import { useState } from "react";

// WRONG -- directive not at the top
import { useState } from "react";
"use client";

// WRONG -- comment before directive
// This is a client component
"use client";
```

## Common Mistakes

### Mistake 1: Making everything "use client"

Do not add "use client" just to be safe. It increases the client bundle and prevents server-side optimizations.

### Mistake 2: Importing server-only code in client components

Client Components cannot use `async/await` at the component level, cannot directly query the database, and cannot use server-only APIs.

```tsx
// WRONG
"use client";

import { db } from "@/db"; // Server-only! This will break.

export function ProjectList() {
  const projects = await db.query.projects.findMany(); // Cannot await in client component
}
```

### Mistake 3: Forgetting "use client" for event handlers

Even a simple `onClick` requires the component to be a Client Component.

```tsx
// WRONG -- will error at runtime
export function DeleteButton({ onDelete }: { onDelete: () => void }) {
  return <button onClick={onDelete}>Delete</button>;
}
```

## Checklist

- [ ] `"use client"` is at the very first line (before all imports)
- [ ] The component actually needs to be a Client Component (hooks, events, browser APIs)
- [ ] The client boundary is as small as possible
- [ ] No server-only imports (db, fs, server actions defined inline) in the client component
- [ ] Props passed from Server Components are serializable (no functions, classes, or Dates without conversion)
- [ ] AlignUI components imported via namespace pattern (`import * as Button from "@/components/ui/button"`)
