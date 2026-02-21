# Skill: How to Import and Use Components

## When to Use

Use this skill whenever you need to import components, icons, utilities, or modules in this codebase. Following correct import patterns ensures consistency and avoids build errors.

## Import Patterns by Category

### 1. AlignUI Components: Namespace Imports (`import *`)

AlignUI components in `/components/ui/` export multiple sub-components (Root, Icon, Wrapper, etc.). ALWAYS use namespace imports.

```tsx
import * as Button from "@/components/ui/button";
import * as Input from "@/components/ui/input";
import * as Select from "@/components/ui/select";
import * as Avatar from "@/components/ui/avatar";
import * as Badge from "@/components/ui/badge";
import * as Label from "@/components/ui/label";
import * as Modal from "@/components/ui/modal";
import * as Tooltip from "@/components/ui/tooltip";
import * as Checkbox from "@/components/ui/checkbox";
import * as Radio from "@/components/ui/radio";
import * as Drawer from "@/components/ui/drawer";
import * as Dropdown from "@/components/ui/dropdown";
import * as Table from "@/components/ui/table";
import * as SegmentedControl from "@/components/ui/segmented-control";
import * as TabMenuHorizontal from "@/components/ui/tab-menu-horizontal";
import * as Popover from "@/components/ui/popover";
import * as VerticalStepper from "@/components/ui/vertical-stepper";
import * as HorizontalStepper from "@/components/ui/horizontal-stepper";
```

**Usage with namespace:**

```tsx
<Button.Root variant="primary" mode="filled" size="medium">
  <Button.Icon as={RiAddLine} />
  Create Project
</Button.Root>

<Input.Root size="medium">
  <Input.Wrapper>
    <Input.Icon as={RiSearchLine} />
    <Input.Input placeholder="Search..." value={search} onChange={handleChange} />
  </Input.Wrapper>
</Input.Root>

<Select.Root value={value} onValueChange={setValue}>
  <Select.Trigger>
    <Select.Value placeholder="Select option" />
  </Select.Trigger>
  <Select.Content>
    <Select.Item value="option1">Option 1</Select.Item>
    <Select.Item value="option2">Option 2</Select.Item>
  </Select.Content>
</Select.Root>
```

### 2. AlignUI Single-Export Components: Named Imports

Some AlignUI components have a single export. Use named imports for these.

```tsx
import { Divider } from "@/components/ui/divider";
import { Skeleton } from "@/components/ui/skeleton";
import { FormMessage } from "@/components/ui/form";
```

**How to tell the difference:** If the component has sub-components (Root, Trigger, Content, Item, Icon, Wrapper), use namespace import. If it exports a single component, use named import. When in doubt, read the component file.

### 3. AlignUI Icons

The codebase has custom icons in `/components/ui/icons.tsx`. Import them as named imports.

```tsx
import { InfoCircleFilled, ArrowRightIcon } from "@/components/ui/icons";
```

### 4. Remixicon Icons

For general icons, use `@remixicon/react`. All icons are PascalCase with `Ri` prefix.

```tsx
import {
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiSearchLine,
  RiArrowDownSLine,
  RiLogoutBoxLine,
  RiMoonLine,
  RiSunLine,
  RiSettingsLine,
  RiHomeLine,
} from "@remixicon/react";
```

**Usage:**

```tsx
// As Button icon
<Button.Root>
  <Button.Icon as={RiAddLine} />
  Add
</Button.Root>

// As Input icon
<Input.Root>
  <Input.Wrapper>
    <Input.Icon as={RiSearchLine} />
    <Input.Input placeholder="Search..." />
  </Input.Wrapper>
</Input.Root>

// Standalone
<RiSettingsLine className="size-5 text-text-sub-600" />
```

### 5. Shared Components: Named Imports

Components in `/components/` (root level) use named exports.

```tsx
import { Logo } from "@/components/logo";
import { StaggeredFadeLoader } from "@/components/staggered-fade-loader";
```

Exception: Some shared components use default exports (following Next.js convention for dynamic imports).

```tsx
import Header from "@/components/header";
```

### 6. Form Components: Named Imports from Barrel

Form wrapper components are imported from the barrel export in `/components/form/`.

```tsx
import {
  FormInput,
  FormSelect,
  FormPassword,
  FormTextarea,
  FormCheckbox,
  FormDateInput,
  FormFileUpload,
  FormImageUpload,
  FormField,
  FormRichTextEditor,
} from "@/components/form";
```

**Or individually:**

```tsx
import { FormInput } from "@/components/form/form-input";
```

### 7. Feature Components: Relative Imports

Within a feature directory, use relative imports for sibling components.

```tsx
// In app/(application)/projects/_components/project-list.tsx
import { ProjectCard } from "./project-card";
import { ProjectFilterBar } from "./project-filter-bar";
```

```tsx
// In app/(application)/projects/page.tsx
import { ProjectList } from "./_components/project-list";
```

```tsx
// In app/(application)/projects/_components/some-component.tsx
import { useProjects } from "../_hooks/use-projects";
```

### 8. Utilities

```tsx
import { cn } from "@/lib/utils/cn";
```

### 9. Validators (Zod Schemas)

```tsx
import { createProjectSchema, type CreateProjectInput } from "@/validators/project";
```

### 10. oRPC Client

```tsx
import { orpc } from "@/lib/orpc/react";
```

### 11. TanStack Query

```tsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
```

### 12. React Hook Form

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
```

### 13. React and Next.js

```tsx
import { useState, useEffect, useRef, useMemo, useCallback, useId } from "react";
import type React from "react";
import type { ReactNode } from "react";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
```

### 14. Server Actions

```tsx
import { signOut } from "@/server/actions/sign-out";
import { createProject } from "../_actions/create-project";
```

## Import Ordering

Follow this order, with blank lines between groups:

```tsx
// 1. "use client" directive (if needed)
"use client";

// 2. React / Next.js imports
import { useState } from "react";
import type React from "react";
import Link from "next/link";

// 3. Third-party libraries
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { RiAddLine, RiSearchLine } from "@remixicon/react";

// 4. AlignUI components (namespace imports)
import * as Button from "@/components/ui/button";
import * as Input from "@/components/ui/input";

// 5. Shared components and form components
import { Logo } from "@/components/logo";
import { FormInput, FormSelect } from "@/components/form";

// 6. Feature-local imports (relative)
import { ProjectCard } from "./project-card";
import { useProjects } from "../_hooks/use-projects";

// 7. Utilities, validators, types
import { cn } from "@/lib/utils/cn";
import { createProjectSchema } from "@/validators/project";
import type { Project } from "@/db/schema/projects";
```

## The `@/` Path Alias

The `@/` alias maps to the project root (`/home/user/minimal-boilerplate/`). Use it for ALL non-relative imports.

```tsx
// CORRECT
import * as Button from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

// WRONG
import * as Button from "../../components/ui/button";
import { cn } from "../../../lib/utils/cn";
```

Use relative imports ONLY within the same feature directory structure:

```tsx
// Inside _components/ referencing sibling files
import { ProjectCard } from "./project-card";

// Inside _components/ referencing hooks
import { useProjects } from "../_hooks/use-projects";
```

## Type-Only Imports

When importing only types, use the `type` keyword to ensure they are stripped at build time.

```tsx
import type React from "react";
import type { ReactNode } from "react";
import type { FieldError, FieldPath, FieldValues } from "react-hook-form";
import type { Project } from "@/db/schema/projects";
```

## Available AlignUI Components

For reference, these components are available in `/components/ui/`:

```
accordion, alert, avatar, avatar-group, avatar-group-compact,
badge, banner, breadcrumb, button, button-group, checkbox,
color-picker, command-menu, compact-button, cursor-loader,
datepicker, digit-input, divider, dot-stepper, drawer, dropdown,
fancy-button, file-format-icon, file-upload, form, hint,
horizontal-stepper, icons, input, kbd, label, link-button,
modal, notification, notification-provider, pagination, popover,
progress-bar, progress-circle, radio, segmented-control, select,
skeleton, slider, social-button, social-icons, sonner,
status-badge, switch, tab-menu-horizontal, tab-menu-vertical,
table, tag, textarea, tooltip, vertical-stepper
```

## Checklist

- [ ] AlignUI components use `import * as Name from "@/components/ui/name"`
- [ ] Remixicon icons imported from `@remixicon/react` with `Ri` prefix
- [ ] `@/` alias used for all non-relative imports
- [ ] Relative imports used only within same feature directory
- [ ] Type-only imports use the `type` keyword
- [ ] Import groups are ordered correctly with blank lines between them
- [ ] Form components imported from `@/components/form` (barrel) or individual files
