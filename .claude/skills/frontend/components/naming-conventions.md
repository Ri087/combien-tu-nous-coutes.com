# Skill: Component File Naming Conventions

## When to Use

Use this skill whenever you create a new component file, rename an existing one, or organize files within a feature directory. Consistent naming prevents confusion, merge conflicts, and import errors.

## File Naming: Always kebab-case

Every component file uses **kebab-case** (lowercase words separated by hyphens).

```
CORRECT                          WRONG
project-card.tsx                 ProjectCard.tsx
create-project-modal.tsx         createProjectModal.tsx
use-projects.ts                  useProjects.ts
project-filter-bar.tsx           project_filter_bar.tsx
```

## Export Naming: Always PascalCase

The exported component name uses **PascalCase**, regardless of the file name.

```tsx
// File: project-card.tsx
export function ProjectCard() { ... }

// File: create-project-modal.tsx
export function CreateProjectModal() { ... }

// File: use-projects.ts
export function useProjects() { ... }  // Exception: hooks use camelCase with "use" prefix
```

## Mapping Rules

| Entity | File Name | Export Name |
|--------|-----------|-------------|
| Component | `project-card.tsx` | `ProjectCard` |
| Component | `create-project-modal.tsx` | `CreateProjectModal` |
| Hook | `use-projects.ts` | `useProjects` |
| Hook | `use-project-filter.ts` | `useProjectFilter` |
| Server Action | `create-project.ts` | `createProject` |
| Server Action | `delete-project.ts` | `deleteProject` |
| Page | `page.tsx` | `default export` (Next.js convention) |
| Layout | `layout.tsx` | `default export` (Next.js convention) |

## Directory Naming

### Feature Directories

Feature route segments use **kebab-case** and match the URL path.

```
app/(application)/projects/           -> /projects
app/(application)/team-members/       -> /team-members
app/(application)/billing-settings/   -> /billing-settings
```

### Private Directories (Prefixed with `_`)

Directories prefixed with `_` are private to Next.js routing -- they are NOT route segments and do NOT appear in the URL.

```
app/(application)/projects/
  _components/       -> Feature components (private, not a route)
  _hooks/            -> Feature hooks (private, not a route)
  _actions/          -> Feature server actions (private, not a route)
  page.tsx           -> The actual page
```

### Route Groups (Wrapped in `()`)

Route groups organize routes without affecting the URL path.

```
app/(auth)/sign-in/page.tsx           -> /sign-in
app/(auth)/sign-up/page.tsx           -> /sign-up
app/(application)/dashboard/page.tsx  -> /dashboard
```

## File Extensions

| Content | Extension |
|---------|-----------|
| React component (with JSX) | `.tsx` |
| TypeScript module (no JSX) | `.ts` |
| Hook (no JSX) | `.ts` |
| Server action (no JSX) | `.ts` |
| Hook (with JSX, rare) | `.tsx` |

## When to Use `.client.tsx` Suffix

This codebase does NOT use `.client.tsx` suffixes. Instead, add the `"use client"` directive at the top of the file. The `.client.tsx` convention is not used here.

```
CORRECT: project-filter.tsx   (with "use client" directive inside)
WRONG:   project-filter.client.tsx
```

## Barrel Exports (`index.ts`)

### DO Use Barrel Exports For

- `/components/form/index.ts` -- Shared form components that are imported together frequently

```tsx
// components/form/index.ts
export { FormCheckbox } from "./form-checkbox";
export { FormDateInput } from "./form-date-input";
export { FormField } from "./form-field";
export { FormFileUpload } from "./form-file-upload";
export { FormImageUpload } from "./form-image-upload";
export { FormInput } from "./form-input";
export { FormPassword } from "./form-password";
export { FormRichTextEditor } from "./form-rich-text-editor";
export { FormSelect } from "./form-select";
export { FormTextarea } from "./form-textarea";
```

### Do NOT Use Barrel Exports For

- `_components/` directories -- Import directly from each file
- `_hooks/` directories -- Import directly from each file
- `_actions/` directories -- Import directly from each file
- `/components/ui/` -- Each UI component is imported individually via namespace

```tsx
// CORRECT -- direct import from _components/
import { ProjectCard } from "./_components/project-card";
import { ProjectList } from "./_components/project-list";

// WRONG -- barrel export from _components/
import { ProjectCard, ProjectList } from "./_components";
```

## Naming Components Within a Feature

Prefix component names with the feature name to avoid ambiguity when reading imports across the codebase.

```
GOOD                              BAD (too generic)
project-card.tsx                  card.tsx
project-list.tsx                  list.tsx
project-filter-bar.tsx            filter-bar.tsx
project-empty-state.tsx           empty-state.tsx
create-project-modal.tsx          create-modal.tsx
```

Exception: If the component is truly generic and lives in `/components/` (shared), a generic name is fine.

```
components/logo.tsx               -> Logo (shared, generic is fine)
components/header.tsx             -> Header (shared, generic is fine)
```

## Complete Example: Feature File Tree

```
app/(application)/projects/
  page.tsx                          -> default export ProjectsPage
  loading.tsx                       -> default export (Next.js convention)
  _components/
    project-list.tsx                -> export function ProjectList
    project-card.tsx                -> export function ProjectCard
    project-filter-bar.tsx          -> export function ProjectFilterBar
    project-empty-state.tsx         -> export function ProjectEmptyState
    create-project-modal.tsx        -> export function CreateProjectModal
    edit-project-form.tsx           -> export function EditProjectForm
  _hooks/
    use-projects.ts                 -> export function useProjects
    use-project-filter.ts           -> export function useProjectFilter
  _actions/
    create-project.ts               -> export async function createProject
    update-project.ts               -> export async function updateProject
    delete-project.ts               -> export async function deleteProject
```

## Checklist

- [ ] File name is kebab-case (`project-card.tsx`, not `ProjectCard.tsx`)
- [ ] Component export is PascalCase (`ProjectCard`, not `projectCard`)
- [ ] Hook export is camelCase with `use` prefix (`useProjects`)
- [ ] Server action export is camelCase (`createProject`)
- [ ] Feature components are prefixed with feature name (`project-card`, not `card`)
- [ ] Private directories use `_` prefix (`_components/`, `_hooks/`, `_actions/`)
- [ ] No barrel `index.ts` in `_components/`, `_hooks/`, or `_actions/`
- [ ] File extension is `.tsx` for JSX, `.ts` for non-JSX
- [ ] No `.client.tsx` suffix used (use `"use client"` directive instead)
