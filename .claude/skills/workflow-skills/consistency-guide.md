# Consistency Guide - Standards and Patterns

> This skill ensures new code matches existing codebase patterns exactly.
> ALWAYS look at existing code first and replicate its patterns.

## Golden Rule

**Before writing ANY code, read the existing equivalent code first and copy its patterns.**

---

## How to Find Existing Patterns

### 1. Page structure

Read an existing page to understand the layout:
```bash
# Read the dashboard page
cat app/(application)/dashboard/page.tsx

# Read the application layout
cat app/(application)/layout.tsx
```

New pages MUST follow the same structure:
- Default export function
- Same header pattern (title + subtitle + actions)
- Same spacing (`gap-6 p-6` or whatever the existing pages use)
- Same component composition pattern

### 2. Component patterns

Read existing feature components to match patterns:
```bash
# List all components for a feature
ls app/(application)/[existing-feature]/_components/

# Read them to understand the pattern
cat app/(application)/[existing-feature]/_components/[component].tsx
```

### 3. Schema patterns

Read existing schemas to match column naming and types:
```bash
cat db/schema/auth/schema.ts
```

Follow the same conventions:
- Same column naming style (camelCase in TS, snake_case in DB)
- Same timestamp pattern (`defaultNow().notNull()`)
- Same ID pattern (check if `text` or `uuid` is used)

### 4. Router patterns

Read existing routers to match the API style:
```bash
cat server/routers/_app.ts
ls server/routers/
```

---

## Naming Conventions

### Files

| Type | Convention | Example |
|------|-----------|---------|
| Page | `page.tsx` | `app/(application)/projects/page.tsx` |
| Component | `kebab-case.tsx` | `project-card.tsx` |
| Hook | `use-kebab-case.ts` | `use-projects.ts` |
| Action | `kebab-case.ts` | `create-project.ts` |
| Schema | `schema.ts` | `db/schema/projects/schema.ts` |
| Validator | `kebab-case.ts` | `validators/projects.ts` |
| Router | `kebab-case.ts` | `server/routers/projects.ts` |

### Variables and Functions

| Type | Convention | Example |
|------|-----------|---------|
| Component | PascalCase | `ProjectCard`, `CreateProjectDialog` |
| Hook | camelCase with `use` prefix | `useProjects`, `useCreateProject` |
| Function | camelCase | `getProjects`, `formatDate` |
| Constant | SCREAMING_SNAKE_CASE | `APPLICATION_PAGES`, `DASHBOARD` |
| Type | PascalCase | `Project`, `CreateProjectInput` |
| Schema table | camelCase (singular) | `project`, `taskItem` |
| DB column | camelCase (TS) / snake_case (DB) | `userId` / `user_id` |

### Router naming

| Operation | Name | Method |
|-----------|------|--------|
| List all | `list` | GET |
| Get one | `getById` | GET |
| Search | `search` | GET |
| Create | `create` | POST (default) |
| Update | `update` | POST (default) |
| Delete | `delete` | POST (default) |

---

## Design Token Consistency

### Text colors (use consistently across ALL components)

| Token | Usage |
|-------|-------|
| `text-text-strong-950` | Primary headings, important labels |
| `text-text-sub-600` | Subtitles, descriptions, secondary text |
| `text-text-soft-400` | Placeholders, disabled text, hints |

### Background colors

| Token | Usage |
|-------|-------|
| `bg-bg-white-0` | Card backgrounds, content areas |
| `bg-bg-weak-50` | Page backgrounds, empty states |
| `bg-bg-soft-200` | Hover states, subtle backgrounds |
| `bg-bg-strong-950` | Primary buttons, dark elements |

### Border and spacing

| Token | Usage |
|-------|-------|
| `border-stroke-soft-200` | Card borders, dividers |
| `rounded-xl` | Cards, containers |
| `rounded-lg` | Buttons, inputs |
| `gap-4` | Between form fields |
| `gap-6` | Between sections |
| `p-4` | Card padding |
| `p-6` | Page/section padding |

### Typography classes

| Class | Usage |
|-------|-------|
| `text-label-xl` | Page titles |
| `text-label-lg` | Section titles |
| `text-label-md` | Card titles, button text |
| `text-label-sm` | Small labels |
| `text-paragraph-sm` | Body text, descriptions |
| `text-paragraph-xs` | Small text, metadata |

---

## Component Usage Consistency

### Always use AlignUI components

```tsx
// CORRECT
import * as Button from "@/components/ui/button";
import * as Input from "@/components/ui/input";
import * as Modal from "@/components/ui/modal";
import * as Table from "@/components/ui/table";

// WRONG -- never create raw HTML equivalents
<button className="...">Click</button>
<input className="..." />
```

### Form components

Always use the form wrappers from `/components/form/`:

```tsx
import { FormInput } from "@/components/form/form-input";
import { FormTextarea } from "@/components/form/form-textarea";
import { FormSelect } from "@/components/form/form-select";
import { FormCheckbox } from "@/components/form/form-checkbox";
import { FormDateInput } from "@/components/form/form-date-input";
import { FormPassword } from "@/components/form/form-password";
```

These wrappers integrate React Hook Form with AlignUI components and handle errors automatically.

### Button patterns

```tsx
// Primary action
<Button.Root variant="primary" mode="filled">
  <Button.Icon as={RiAddLine} />
  Create
</Button.Root>

// Secondary action
<Button.Root variant="neutral" mode="stroke">
  Cancel
</Button.Root>

// Destructive action
<Button.Root variant="error" mode="filled">
  <Button.Icon as={RiDeleteBinLine} />
  Delete
</Button.Root>
```

### Icons

Always use Remix icons from `@remixicon/react`:

```tsx
import { RiAddLine, RiDeleteBinLine, RiEditLine, RiSearchLine } from "@remixicon/react";
```

Choose icons that match the existing usage in the codebase. Search for existing icon usage before picking a new one.

---

## Page Layout Consistency

### Standard page layout

Every application page should follow this structure:

```tsx
<div className="flex flex-col gap-6 p-6">
  {/* Header */}
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-label-xl text-text-strong-950">Page Title</h1>
      <p className="text-paragraph-sm text-text-sub-600">Page description</p>
    </div>
    <div className="flex items-center gap-2">
      {/* Action buttons */}
    </div>
  </div>

  {/* Content */}
  {/* ... */}
</div>
```

### Empty states

```tsx
<div className="flex flex-col items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 py-16">
  <p className="text-paragraph-sm text-text-soft-400">
    No items yet. Create your first one.
  </p>
</div>
```

### Loading states

Use Skeleton components from AlignUI or a simple loading text:

```tsx
import * as Skeleton from "@/components/ui/skeleton";

// Simple loading
<div className="text-text-soft-400">Loading...</div>
```

---

## Import Order

Follow the Biome auto-formatting order (Biome will fix this automatically):

1. React/Next.js imports
2. Third-party library imports
3. Internal absolute imports (`@/...`)
4. Relative imports (`./...`)

Biome's `--write` flag handles this automatically when you run `pnpm checks`.

---

## Checklist Before Finishing

When writing new code, verify:

- [ ] File naming matches existing patterns (kebab-case)
- [ ] Component naming matches existing patterns (PascalCase)
- [ ] Same design tokens used (text colors, backgrounds, borders)
- [ ] Same spacing and layout patterns used
- [ ] AlignUI components used (no raw HTML for UI elements)
- [ ] Form wrappers from `/components/form/` used for forms
- [ ] Remix icons used consistently
- [ ] Page structure matches existing pages
- [ ] Empty and loading states match existing patterns
