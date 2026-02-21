# Skill: Split Large Components into Smaller Ones

## When to Use

Use this skill when a component file exceeds ~150 lines, handles multiple concerns, or becomes hard to read and maintain. Splitting improves readability, reusability, and testability.

## When to Split

Split a component when any of these are true:

1. **File exceeds 150-200 lines** of JSX/logic
2. **Multiple responsibilities**: The component handles data fetching, state management, AND rendering
3. **Repeated patterns**: The same JSX block appears more than once
4. **Nested conditionals**: Deep ternary trees or multiple `if` blocks in the render
5. **Mixed client/server concerns**: Part of the component needs interactivity while part is static
6. **Reuse potential**: A section of the component could be used elsewhere

## Do NOT Split When

- The component is under 100 lines and reads clearly
- Splitting would create components with only 10-15 lines that add no clarity
- The "sub-components" would always be used together and share all the same props

## Splitting Patterns

### Pattern 1: Extract Presentational Sub-Components

Move pure display sections into their own components within the same `_components/` directory.

**Before:**

```tsx
// app/(application)/projects/_components/project-list.tsx
"use client";

import { useState } from "react";
import * as Avatar from "@/components/ui/avatar";
import * as Badge from "@/components/ui/badge";
import * as Button from "@/components/ui/button";

export function ProjectList({ projects }: ProjectListProps) {
  const [filter, setFilter] = useState("all");

  const filtered = projects.filter(p => filter === "all" || p.status === filter);

  return (
    <div>
      {/* 30 lines of filter UI */}
      <div className="flex gap-2">
        <Button.Root onClick={() => setFilter("all")} variant={filter === "all" ? "primary" : "neutral"}>All</Button.Root>
        <Button.Root onClick={() => setFilter("active")} variant={filter === "active" ? "primary" : "neutral"}>Active</Button.Root>
        <Button.Root onClick={() => setFilter("archived")} variant={filter === "archived" ? "primary" : "neutral"}>Archived</Button.Root>
      </div>

      {/* 50 lines of project card repeated inline */}
      {filtered.map(project => (
        <div key={project.id} className="rounded-xl border border-stroke-soft-200 p-4">
          <div className="flex items-center gap-3">
            <Avatar.Root size="40">
              <Avatar.Image src={project.avatar} alt={project.name} />
            </Avatar.Root>
            <div>
              <h3 className="text-label-md text-text-strong-950">{project.name}</h3>
              <p className="text-paragraph-sm text-text-sub-600">{project.description}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Badge.Root>{project.status}</Badge.Root>
            <span className="text-paragraph-xs text-text-soft-400">{project.updatedAt}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

**After:**

```tsx
// app/(application)/projects/_components/project-card.tsx
import * as Avatar from "@/components/ui/avatar";
import * as Badge from "@/components/ui/badge";

interface ProjectCardProps {
  name: string;
  description?: string;
  avatar?: string;
  status: string;
  updatedAt: string;
}

export function ProjectCard({ name, description, avatar, status, updatedAt }: ProjectCardProps) {
  return (
    <div className="rounded-xl border border-stroke-soft-200 p-4">
      <div className="flex items-center gap-3">
        <Avatar.Root size="40">
          <Avatar.Image src={avatar} alt={name} />
        </Avatar.Root>
        <div>
          <h3 className="text-label-md text-text-strong-950">{name}</h3>
          {description && (
            <p className="text-paragraph-sm text-text-sub-600">{description}</p>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Badge.Root>{status}</Badge.Root>
        <span className="text-paragraph-xs text-text-soft-400">{updatedAt}</span>
      </div>
    </div>
  );
}
```

```tsx
// app/(application)/projects/_components/project-filter-bar.tsx
"use client";

import * as Button from "@/components/ui/button";

interface ProjectFilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function ProjectFilterBar({ activeFilter, onFilterChange }: ProjectFilterBarProps) {
  const filters = ["all", "active", "archived"] as const;

  return (
    <div className="flex gap-2">
      {filters.map(f => (
        <Button.Root
          key={f}
          onClick={() => onFilterChange(f)}
          variant={activeFilter === f ? "primary" : "neutral"}
          mode={activeFilter === f ? "filled" : "ghost"}
          size="small"
        >
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </Button.Root>
      ))}
    </div>
  );
}
```

```tsx
// app/(application)/projects/_components/project-list.tsx
"use client";

import { useState } from "react";

import { ProjectCard } from "./project-card";
import { ProjectFilterBar } from "./project-filter-bar";

interface ProjectListProps {
  projects: Array<{
    id: string;
    name: string;
    description?: string;
    avatar?: string;
    status: string;
    updatedAt: string;
  }>;
}

export function ProjectList({ projects }: ProjectListProps) {
  const [filter, setFilter] = useState("all");

  const filtered = projects.filter(p => filter === "all" || p.status === filter);

  return (
    <div className="flex flex-col gap-4">
      <ProjectFilterBar activeFilter={filter} onFilterChange={setFilter} />
      <div className="flex flex-col gap-3">
        {filtered.map(project => (
          <ProjectCard
            key={project.id}
            name={project.name}
            description={project.description}
            avatar={project.avatar}
            status={project.status}
            updatedAt={project.updatedAt}
          />
        ))}
      </div>
    </div>
  );
}
```

### Pattern 2: Separate Client/Server Boundaries

Keep the parent as a Server Component for data fetching. Push interactivity into small Client Component children.

```tsx
// app/(application)/projects/_components/project-page-content.tsx (Server Component)
import { ProjectList } from "./project-list";
import { ProjectHeader } from "./project-header";

interface ProjectPageContentProps {
  projects: Array<{ id: string; name: string; status: string }>;
  totalCount: number;
}

export function ProjectPageContent({ projects, totalCount }: ProjectPageContentProps) {
  return (
    <div className="flex flex-col gap-6">
      <ProjectHeader totalCount={totalCount} />
      <ProjectList projects={projects} />
    </div>
  );
}
```

```tsx
// app/(application)/projects/_components/project-header.tsx (Client Component)
"use client";

import { RiAddLine } from "@remixicon/react";
import { useState } from "react";

import * as Button from "@/components/ui/button";

interface ProjectHeaderProps {
  totalCount: number;
}

export function ProjectHeader({ totalCount }: ProjectHeaderProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-heading-md text-text-strong-950">Projects</h1>
        <p className="text-paragraph-sm text-text-sub-600">{totalCount} projects</p>
      </div>
      <Button.Root variant="primary" mode="filled" size="medium" onClick={() => setIsCreateOpen(true)}>
        <Button.Icon as={RiAddLine} />
        New Project
      </Button.Root>
    </div>
  );
}
```

### Pattern 3: Extract Hooks for Logic

When a component has complex state management or data-fetching logic, extract it into a custom hook.

```tsx
// app/(application)/projects/_hooks/use-projects.ts
"use client";

import { useState, useMemo } from "react";

interface Project {
  id: string;
  name: string;
  status: string;
}

export function useProjectFilter(projects: Project[]) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return projects
      .filter(p => filter === "all" || p.status === filter)
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [projects, filter, search]);

  return { filter, setFilter, search, setSearch, filtered };
}
```

```tsx
// app/(application)/projects/_components/project-list.tsx
"use client";

import { useProjectFilter } from "../_hooks/use-projects";
import { ProjectCard } from "./project-card";
import { ProjectFilterBar } from "./project-filter-bar";

export function ProjectList({ projects }: { projects: Project[] }) {
  const { filter, setFilter, search, setSearch, filtered } = useProjectFilter(projects);

  return (
    <div className="flex flex-col gap-4">
      <ProjectFilterBar activeFilter={filter} onFilterChange={setFilter} />
      {filtered.map(project => (
        <ProjectCard key={project.id} {...project} />
      ))}
    </div>
  );
}
```

### Pattern 4: Composition via Children

Use children and composition to avoid prop drilling.

```tsx
// Layout wrapper component
interface PageSectionProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PageSection({ title, description, actions, children }: PageSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-label-lg text-text-strong-950">{title}</h2>
          {description && (
            <p className="text-paragraph-sm text-text-sub-600">{description}</p>
          )}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
```

## File Organization After Splitting

All sub-components live in the same `_components/` directory. Do NOT create nested directories within `_components/`.

```
app/(application)/projects/
  page.tsx
  _components/
    project-list.tsx          <-- Parent/orchestrator
    project-card.tsx          <-- Extracted presentational
    project-filter-bar.tsx    <-- Extracted interactive
    project-header.tsx        <-- Extracted header
    create-project-modal.tsx  <-- Extracted modal
  _hooks/
    use-projects.ts           <-- Extracted logic
```

## Rules

1. **State stays in the parent** -- pass callbacks down, not state setters directly
2. **Favor composition over inheritance** -- use children and render props
3. **Name sub-components clearly** -- prefix with the feature name (e.g., `project-card`, not just `card`)
4. **Keep imports relative within `_components/`** -- use `./project-card` not `@/app/.../project-card`
5. **Each file has ONE exported component** -- no multi-component files
6. **Never create barrel `index.ts` files in `_components/`** -- import directly from each file

## Checklist

- [ ] Parent component is under 150 lines after splitting
- [ ] Each extracted component has a single clear responsibility
- [ ] State and callbacks flow top-down (parent to children)
- [ ] Client boundary is as small as possible (only interactive parts are "use client")
- [ ] All new files use kebab-case naming
- [ ] All new components use named exports
- [ ] No circular imports between split components
