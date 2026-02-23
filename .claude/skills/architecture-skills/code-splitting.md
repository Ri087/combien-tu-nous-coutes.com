# Code Splitting Guide

## When to Split a File

Split a file when any of these conditions are met:

| Signal | Threshold | Action |
|--------|-----------|--------|
| File length | > 300 lines | Extract logical sections into separate files |
| Multiple responsibilities | 2+ distinct concerns | One file per concern |
| Component count | > 2 exported components in one file | One file per component |
| Hook count | > 1 hook in a file (unless tightly coupled) | One file per hook |
| Utility functions | > 5 unrelated functions | Group by domain into separate files |

## Splitting Patterns

### Pattern 1: Extract Sub-Components

**Before (one large file):**

```tsx
// _components/project-list.tsx (400+ lines)
"use client";

function ProjectCard({ project }: { project: Project }) {
  // 80 lines of card rendering
}

function ProjectEmptyState() {
  // 30 lines
}

function ProjectListHeader({ count }: { count: number }) {
  // 40 lines
}

export function ProjectList() {
  // 100 lines of data fetching + rendering
  return (
    <div>
      <ProjectListHeader count={projects.length} />
      {projects.length === 0 ? (
        <ProjectEmptyState />
      ) : (
        projects.map((p) => <ProjectCard key={p.id} project={p} />)
      )}
    </div>
  );
}
```

**After (split into separate files):**

```
_components/
  project-list.tsx          # Main list (imports others)
  project-card.tsx          # Card component
  project-empty-state.tsx   # Empty state
  project-list-header.tsx   # Header
```

```tsx
// _components/project-list.tsx
"use client";

import { ProjectCard } from "./project-card";
import { ProjectEmptyState } from "./project-empty-state";
import { ProjectListHeader } from "./project-list-header";

export function ProjectList() {
  // ...
}
```

### Pattern 2: Extract Hooks from Components

**Before:**

```tsx
// _components/project-list.tsx
"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";

export function ProjectList() {
  const { data: projects, isLoading } = useQuery(
    orpc.projects.list.queryOptions()
  );

  const createMutation = useMutation(
    orpc.projects.create.mutationOptions({
      onSuccess: () => {
        // invalidation logic
      },
    })
  );

  const deleteMutation = useMutation(
    orpc.projects.delete.mutationOptions({
      onSuccess: () => {
        // invalidation logic
      },
    })
  );

  // 200+ lines of UI rendering
}
```

**After:**

```tsx
// _hooks/use-projects.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";

export function useProjects() {
  return useQuery(orpc.projects.list.queryOptions());
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.projects.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.projects.list.queryOptions({ input: {} }).queryKey });
      },
    })
  );
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.projects.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.projects.list.queryOptions({ input: {} }).queryKey });
      },
    })
  );
}
```

```tsx
// _components/project-list.tsx
"use client";

import { useProjects, useDeleteProject } from "../_hooks/use-projects";
import { ProjectCard } from "./project-card";

export function ProjectList() {
  const { data: projects, isLoading } = useProjects();
  const { mutate: deleteProject } = useDeleteProject();

  // Clean UI rendering only
}
```

### Pattern 3: Extract Types and Constants

**Before:**

```tsx
// _components/project-list.tsx
type ProjectStatus = "active" | "archived" | "draft";
type ProjectFilter = { status: ProjectStatus; search: string };
type SortOption = "name" | "created" | "updated";

const STATUS_COLORS: Record<ProjectStatus, string> = {
  active: "text-green-600",
  archived: "text-gray-400",
  draft: "text-yellow-600",
};

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Name", value: "name" },
  { label: "Created", value: "created" },
  { label: "Updated", value: "updated" },
];

export function ProjectList() {
  // ...
}
```

**After:**

- Types that are shared across files go in `/db/schema/[feature]/types.ts` or at the top of the component that uses them
- Constants that are used by multiple components go in `/constants/[feature].ts`
- Types/constants used by only one component stay in that component file

### Pattern 4: Extract Server Actions

**Before (action defined inline):**

```tsx
// _components/create-project-form.tsx
"use client";

export function CreateProjectForm() {
  async function handleSubmit(data: CreateProjectInput) {
    // Complex server call logic
  }
  // ...
}
```

**After (action in separate file):**

```tsx
// _actions/create-project.ts
"use server";

import { db } from "@/db";
import { projects } from "@/db/schema";
import { createProjectSchema } from "@/validators/projects";

export async function createProject(input: unknown) {
  const data = createProjectSchema.parse(input);
  // ...
}
```

```tsx
// _components/create-project-form.tsx
"use client";

import { createProject } from "../_actions/create-project";

export function CreateProjectForm() {
  // Uses the imported action
}
```

### Pattern 5: Extract Modal/Dialog Content

**Before:**

```tsx
// _components/project-list.tsx (500+ lines)
export function ProjectList() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <div>{/* List UI */}</div>

      {/* 100 lines of create modal */}
      <Dialog open={isCreateOpen}>...</Dialog>

      {/* 80 lines of delete confirmation */}
      <Dialog open={isDeleteOpen}>...</Dialog>

      {/* 120 lines of edit modal */}
      <Dialog open={isEditOpen}>...</Dialog>
    </>
  );
}
```

**After:**

```
_components/
  project-list.tsx                # Main list (thin, delegates to modals)
  create-project-modal.tsx        # Create modal
  delete-project-dialog.tsx       # Delete confirmation
  edit-project-modal.tsx          # Edit modal
```

## Barrel Exports

### When to use barrel exports (index.ts)

Use barrel exports (`index.ts`) in these specific directories:

```typescript
// /db/schema/[feature]/index.ts -- ALWAYS
export * from "./schema";
export * from "./relations";
export * from "./types";

// /db/schema/index.ts -- ALWAYS
export * from "./auth";
export * from "./projects";

// /components/form/index.ts -- ALWAYS
export { FormInput } from "./form-input";
export { FormSelect } from "./form-select";
// Use named exports to control the public API

// /lib/utils/index.ts -- ALWAYS for root utils
export * from "./cn";
export * from "./polymorphic";
export * from "./recursive-clone-children";
export * from "./tv";
```

### When NOT to use barrel exports

- **`_components/`** -- Import directly: `import { ProjectCard } from "./project-card"`
- **`_hooks/`** -- Import directly: `import { useProjects } from "../_hooks/use-projects"`
- **`_actions/`** -- Import directly: `import { createProject } from "../_actions/create-project"`
- **Feature page directories** -- Never add index.ts to route directories

### Why no barrel exports in `_components/`?

1. Direct imports make dependencies explicit
2. Tree-shaking works better with direct imports
3. Avoids circular dependency issues
4. Easier to trace import chains when debugging

## Keep Related Code Together

Even when splitting, keep these things in the same file:

1. **A component and its tiny sub-components** (< 20 lines each)
2. **A hook and its closely-related type definition**
3. **A server action and its direct return type** (if not shared)

```tsx
// This is fine -- small helper stays in the same file
function ProjectStatusBadge({ status }: { status: string }) {
  return <Badge>{status}</Badge>;
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div>
      <ProjectStatusBadge status={project.status} />
      {/* ... */}
    </div>
  );
}
```

## Decision Checklist

Before splitting, ask:

1. **Is the file > 300 lines?** -- Consider splitting
2. **Are there 3+ exported components?** -- Split into separate files
3. **Is there data-fetching logic mixed with rendering?** -- Extract hooks
4. **Are there server actions mixed with client code?** -- Extract to `_actions/`
5. **Are there modal/dialog definitions inline?** -- Extract each modal
6. **Is a sub-component used by other components too?** -- Extract and potentially promote to shared
7. **Is the file easy to understand at a glance?** -- If not, split it

## Anti-Patterns

### Do NOT split too aggressively

```
# BAD -- Over-splitting creates navigation overhead
_components/
  project-card-header.tsx       # 15 lines
  project-card-body.tsx         # 20 lines
  project-card-footer.tsx       # 10 lines
  project-card-actions.tsx      # 12 lines
  project-card.tsx              # 30 lines (just assembles the above)

# GOOD -- Keep small related pieces together
_components/
  project-card.tsx              # 87 lines, self-contained
```

### Do NOT create "types.ts" or "constants.ts" grab-bags in feature folders

```
# BAD -- Catch-all files
_components/types.ts            # All types for all components
_components/constants.ts        # All constants for all components

# GOOD -- Types/constants live next to their usage
# Only extract to /db/schema/[feature]/types.ts for DB types
# Only extract to /constants/ for app-wide constants
```
