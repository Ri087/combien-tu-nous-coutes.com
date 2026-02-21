# How to Split Component Files

## When to Extract a Component

| Signal | Action |
|--------|--------|
| Component file > 250 lines | Extract sub-components |
| A section of JSX is used 2+ times | Extract into its own component |
| A section of JSX has its own state | Extract into its own component |
| A modal/dialog is defined inline | Extract into its own file |
| A form is embedded in a list/page component | Extract the form into its own file |
| A component has 3+ useState hooks that manage different concerns | Extract hooks or sub-components |

## Extraction Patterns

### Pattern 1: List + Item Extraction

The most common pattern. A list component renders items; extract the item.

```
_components/
  project-list.tsx        # Handles data fetching, renders list
  project-card.tsx        # Renders a single project card
```

```tsx
// _components/project-list.tsx
"use client";

import { useProjects } from "../_hooks/use-projects";
import { ProjectCard } from "./project-card";

export function ProjectList() {
  const { data: projects, isLoading } = useProjects();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {projects?.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

```tsx
// _components/project-card.tsx
import type { Project } from "@/db/schema";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="rounded-lg border border-stroke-soft-200 p-4">
      <h3 className="text-text-strong-950">{project.name}</h3>
      <p className="text-text-sub-600">{project.description}</p>
    </div>
  );
}
```

### Pattern 2: Page Section Extraction

A page component is composed of multiple logical sections.

```
_components/
  dashboard-overview.tsx     # Main dashboard view
  stats-widget.tsx           # Stats cards section
  recent-activity.tsx        # Activity feed section
  quick-actions.tsx          # Action buttons section
```

```tsx
// _components/dashboard-overview.tsx
"use client";

import { QuickActions } from "./quick-actions";
import { RecentActivity } from "./recent-activity";
import { StatsWidget } from "./stats-widget";

export function DashboardOverview() {
  return (
    <div className="flex flex-col gap-6">
      <StatsWidget />
      <div className="grid grid-cols-2 gap-6">
        <RecentActivity />
        <QuickActions />
      </div>
    </div>
  );
}
```

### Pattern 3: Modal/Dialog Extraction

Every modal or dialog gets its own file. The parent component manages open/close state.

```
_components/
  project-list.tsx                # Parent: manages modal state
  create-project-modal.tsx        # Modal component
  delete-project-dialog.tsx       # Confirmation dialog
```

```tsx
// _components/project-list.tsx
"use client";

import { useState } from "react";

import { CreateProjectModal } from "./create-project-modal";

export function ProjectList() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <div>
        <button onClick={() => setIsCreateOpen(true)}>Create</button>
        {/* list rendering */}
      </div>
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </>
  );
}
```

```tsx
// _components/create-project-modal.tsx
"use client";

import * as Dialog from "@/components/ui/dialog";

type CreateProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content>
        {/* Form content */}
      </Dialog.Content>
    </Dialog.Root>
  );
}
```

### Pattern 4: Form Extraction

Forms are complex and almost always warrant their own file.

```
_components/
  project-settings.tsx           # Page section that shows form
  project-settings-form.tsx      # The actual form component
```

```tsx
// _components/project-settings-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormInput } from "@/components/form";
import { updateProjectSchema, type UpdateProjectInput } from "@/validators/projects";

type ProjectSettingsFormProps = {
  project: Project;
  onSubmit: (data: UpdateProjectInput) => void;
};

export function ProjectSettingsForm({ project, onSubmit }: ProjectSettingsFormProps) {
  const form = useForm<UpdateProjectInput>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description ?? "",
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormInput
        control={form.control}
        name="name"
        label="Project Name"
      />
      {/* ... */}
    </form>
  );
}
```

### Pattern 5: Table Row/Cell Extraction

Tables with complex row rendering should extract the row component.

```
_components/
  project-table.tsx          # Table structure, headers, pagination
  project-table-row.tsx      # Single row rendering
  project-table-actions.tsx  # Row action buttons/dropdown
```

### Pattern 6: Header/Toolbar Extraction

Complex headers or toolbars with filters, search, and actions.

```
_components/
  project-list.tsx           # Main list
  project-list-toolbar.tsx   # Search, filters, sort, create button
  project-list-filters.tsx   # Filter dropdowns (if complex)
```

## State Management During Extraction

### Keep state in the parent when:

- Multiple children need access to the same state
- Parent controls open/close of modals
- Parent manages list selection state

```tsx
// Parent owns the state, passes callbacks to children
export function ProjectList() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      {projects.map((p) => (
        <ProjectCard
          key={p.id}
          project={p}
          isSelected={p.id === selectedId}
          onSelect={() => setSelectedId(p.id)}
          onDelete={() => {
            setSelectedId(p.id);
            setIsDeleteOpen(true);
          }}
        />
      ))}
      <DeleteProjectDialog
        isOpen={isDeleteOpen}
        projectId={selectedId}
        onClose={() => setIsDeleteOpen(false)}
      />
    </>
  );
}
```

### Move state to the child when:

- Only that child uses the state
- The state is UI-only (hover, focus, expanded/collapsed)
- The state is form-internal

```tsx
// Child owns its own UI state
export function ProjectCard({ project }: { project: Project }) {
  const [isExpanded, setIsExpanded] = useState(false);  // Only this card cares

  return (
    <div>
      <h3>{project.name}</h3>
      {isExpanded && <p>{project.description}</p>}
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? "Less" : "More"}
      </button>
    </div>
  );
}
```

## Composition Over Configuration

Prefer composing small components over passing many props to a configurable component.

```tsx
// BAD -- Mega-component with 15 props
<ProjectCard
  project={project}
  showDescription
  showActions
  showBadge
  showAvatar
  variant="compact"
  onEdit={handleEdit}
  onDelete={handleDelete}
  onArchive={handleArchive}
  isSelected={isSelected}
  onSelect={handleSelect}
/>

// GOOD -- Compose smaller pieces
<ProjectCard project={project}>
  <ProjectCard.Badge status={project.status} />
  <ProjectCard.Description text={project.description} />
  <ProjectCard.Actions>
    <EditButton onClick={handleEdit} />
    <DeleteButton onClick={handleDelete} />
  </ProjectCard.Actions>
</ProjectCard>
```

## The `_components/` Folder Rules

1. **Every feature page has its own `_components/` folder**
2. **No barrel exports (index.ts) in `_components/`** -- import directly
3. **Files use kebab-case**: `project-card.tsx`, not `ProjectCard.tsx`
4. **One primary export per file** (small helpers can stay)
5. **Prefix with feature name** for clarity: `project-card.tsx`, not `card.tsx`

## When to Promote to Shared

A component should move from `_components/` to `/components/` when:

1. **Two or more features** import it
2. It is a **layout element** (header, sidebar, footer)
3. It is a **generic widget** with no feature-specific logic

```
# Before: only used by projects
/app/(application)/projects/_components/status-badge.tsx

# After: also used by tasks -- promote to shared
/components/status-badge.tsx
```

When promoting:
1. Move the file to `/components/`
2. Update all imports to use `@/components/status-badge`
3. Remove any feature-specific logic (make it generic via props)

## Anti-Patterns

### 1. One component per line of JSX

```
# BAD -- Over-extraction
_components/
  project-title.tsx         # Just an <h3>
  project-icon.tsx          # Just an <img>

# GOOD -- Keep trivial elements inline
// Inside project-card.tsx
<h3 className="text-text-strong-950">{project.name}</h3>
```

### 2. Prop drilling through many layers

```tsx
// BAD -- Passing props through 3+ levels
<ProjectList onDelete={onDelete}>
  <ProjectSection onDelete={onDelete}>
    <ProjectCard onDelete={onDelete}>
      <ProjectActions onDelete={onDelete} />
    </ProjectCard>
  </ProjectSection>
</ProjectList>

// GOOD -- Use composition or context for deep trees
// Or flatten the hierarchy: ProjectList renders ProjectCard directly
```

### 3. Circular imports between components

```tsx
// BAD -- Component A imports B, B imports A
// _components/project-list.tsx
import { ProjectCard } from "./project-card";

// _components/project-card.tsx
import { ProjectList } from "./project-list";  // Circular!

// GOOD -- One-directional: parent imports children, never the reverse
```

### 4. Mixing `"use client"` and server logic

```tsx
// BAD -- Server-side data fetching in a client component
"use client";

import { db } from "@/db";  // Cannot use db in client component!

// GOOD -- Fetch in a server component, pass data down
// page.tsx (Server Component)
const projects = await db.query.projects.findMany();
return <ProjectList initialProjects={projects} />;

// OR use React Query in the client component
"use client";
import { useProjects } from "../_hooks/use-projects";
```

### 5. Extracting without clear responsibility

```
# BAD -- What does "project-utils-section" mean?
_components/
  project-utils-section.tsx

# GOOD -- Clear, descriptive names
_components/
  project-export-toolbar.tsx
  project-filter-bar.tsx
```
