# Skill: Create a New Component

## When to Use

Use this skill whenever you need to create a new React component in the codebase. This covers feature-specific components, shared components, and custom reusable components.

## Decision: Where to Place the Component

### Feature Component (most common)

Place in the feature's `_components/` directory when the component is used only within that feature.

```
app/(application)/projects/_components/project-card.tsx
app/(application)/projects/_components/project-list.tsx
app/(application)/settings/_components/settings-form.tsx
```

### Shared Component

Place in `/components/` (root level) when the component is used across multiple features or in the app shell (header, sidebar, layout).

```
components/logo.tsx
components/header.tsx
components/logout-button.tsx
```

### Custom Reusable Component

Place in `/components/custom/` when building a higher-level component that wraps external libraries or combines multiple AlignUI primitives into a reusable abstraction.

```
components/custom/rich-text-editor.tsx
components/custom/floating-toolbar/
```

### Form Wrapper Component

Place in `/components/form/` when creating a form field component that wraps AlignUI inputs with React Hook Form's `Controller`. Always re-export from `/components/form/index.ts`.

```
components/form/form-input.tsx
components/form/form-select.tsx
```

## NEVER Place Components Here

- `/components/ui/` -- This is the AlignUI design system. NEVER modify or add files here.

## Step-by-Step: Create a Feature Component

### 1. Create the file with kebab-case naming

```
app/(application)/projects/_components/project-card.tsx
```

### 2. Determine if client or server component

- **Server component** (default): No directive needed. Use for components that only render data, have no interactivity.
- **Client component**: Add `"use client";` at the very top. Required when using event handlers, hooks, state, browser APIs.

### 3. Write the component

**Server component example:**

```tsx
// app/(application)/projects/_components/project-card.tsx
import * as Avatar from "@/components/ui/avatar";
import * as Badge from "@/components/ui/badge";

interface ProjectCardProps {
  name: string;
  status: "active" | "archived";
  description?: string;
}

export function ProjectCard({ name, status, description }: ProjectCardProps) {
  return (
    <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-label-md text-text-strong-950">{name}</h3>
        <Badge.Root variant={status === "active" ? "light" : "lighter"}>
          {status}
        </Badge.Root>
      </div>
      {description && (
        <p className="mt-1 text-paragraph-sm text-text-sub-600">{description}</p>
      )}
    </div>
  );
}
```

**Client component example:**

```tsx
// app/(application)/projects/_components/project-actions.tsx
"use client";

import { RiDeleteBinLine, RiEditLine } from "@remixicon/react";
import { useState } from "react";

import * as Button from "@/components/ui/button";

interface ProjectActionsProps {
  projectId: string;
  onDelete: (id: string) => void;
}

export function ProjectActions({ projectId, onDelete }: ProjectActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    await onDelete(projectId);
    setIsDeleting(false);
  }

  return (
    <div className="flex items-center gap-2">
      <Button.Root variant="neutral" mode="ghost" size="xsmall">
        <Button.Icon as={RiEditLine} />
      </Button.Root>
      <Button.Root
        variant="error"
        mode="ghost"
        size="xsmall"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Button.Icon as={RiDeleteBinLine} />
      </Button.Root>
    </div>
  );
}
```

### 4. Export pattern

Use **named exports** for all components. Do NOT use default exports (except for Next.js pages).

```tsx
// CORRECT
export function ProjectCard({ ... }: ProjectCardProps) { ... }

// WRONG
export default function ProjectCard({ ... }: ProjectCardProps) { ... }
```

### 5. Props typing

Always define an explicit interface for props when the component has more than zero props.

```tsx
interface ProjectCardProps {
  name: string;
  status: "active" | "archived";
  description?: string;
  className?: string;
}
```

For components wrapping HTML elements, extend `React.ComponentProps`:

```tsx
import type React from "react";

interface ProjectCardProps extends React.ComponentProps<"div"> {
  name: string;
  status: "active" | "archived";
}
```

## Step-by-Step: Create a Shared Component

### 1. Create the file

```
components/sidebar-nav.tsx
```

### 2. Follow the same patterns as feature components

The only difference is the file location. Same rules apply for client vs server, naming, exports, and props.

### 3. Import using the `@/components/` alias

```tsx
import { SidebarNav } from "@/components/sidebar-nav";
```

## Checklist

- [ ] File uses kebab-case naming (e.g., `project-card.tsx`)
- [ ] Component uses PascalCase export name (e.g., `ProjectCard`)
- [ ] Named export, NOT default export
- [ ] `"use client"` added if component uses hooks, state, event handlers, or browser APIs
- [ ] Props are typed with an explicit interface
- [ ] AlignUI components used for all UI primitives (buttons, inputs, badges, etc.)
- [ ] No components created in `/components/ui/`
- [ ] `cn()` imported from `@/lib/utils/cn` for conditional class merging
