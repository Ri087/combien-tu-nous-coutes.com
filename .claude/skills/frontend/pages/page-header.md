# Skill: How to Add Headers to Pages

## Purpose

Guide to creating consistent page headers across the application. Covers the header component pattern with icons, titles, subtitles, breadcrumbs, and action buttons using AlignUI components.

## Header Patterns

### Pattern 1: Simple Page Header

The most basic header with a title and optional subtitle:

```tsx
// Inline in page.tsx (Server Component)
<div className="flex flex-col gap-1">
  <h1 className="text-title-h5 text-text-strong-950">Projects</h1>
  <p className="text-paragraph-sm text-text-sub-600">
    Manage your projects and track progress.
  </p>
</div>
```

### Pattern 2: Header with Action Buttons

```tsx
import { RiAddLine } from "@remixicon/react";
import * as Button from "@/components/ui/button";

// In page.tsx or a _components/ file
<div className="flex items-center justify-between">
  <div className="flex flex-col gap-1">
    <h1 className="text-title-h5 text-text-strong-950">Projects</h1>
    <p className="text-paragraph-sm text-text-sub-600">
      Manage your projects and track progress.
    </p>
  </div>
  <Button.Root variant="primary" size="small">
    <Button.Icon as={RiAddLine} />
    New Project
  </Button.Root>
</div>
```

### Pattern 3: Header with Breadcrumbs

Use the AlignUI `Breadcrumb` component for navigation hierarchy:

```tsx
import { RiArrowRightSLine, RiHome4Line } from "@remixicon/react";
import Link from "next/link";
import * as Breadcrumb from "@/components/ui/breadcrumb";
import { PAGES } from "@/constants/pages";

<div className="flex flex-col gap-4">
  {/* Breadcrumbs */}
  <Breadcrumb.Root>
    <Breadcrumb.Item asChild>
      <Link href={PAGES.DASHBOARD}>
        <Breadcrumb.Icon as={RiHome4Line} />
        Dashboard
      </Link>
    </Breadcrumb.Item>
    <Breadcrumb.ArrowIcon as={RiArrowRightSLine} />
    <Breadcrumb.Item asChild>
      <Link href={PAGES.PROJECTS}>Projects</Link>
    </Breadcrumb.Item>
    <Breadcrumb.ArrowIcon as={RiArrowRightSLine} />
    <Breadcrumb.Item active>Project Details</Breadcrumb.Item>
  </Breadcrumb.Root>

  {/* Title */}
  <div className="flex items-center justify-between">
    <h1 className="text-title-h5 text-text-strong-950">Project Details</h1>
  </div>
</div>
```

### Pattern 4: Header with Icon (Auth-style)

Inspired by the auth pages pattern with a decorative icon circle:

```tsx
import { RiFolderLine } from "@remixicon/react";
import { cn } from "@/lib/utils/cn";

<div className="flex flex-col items-center gap-2">
  {/* Decorative icon */}
  <div
    className={cn(
      "relative flex size-[68px] shrink-0 items-center justify-center rounded-full backdrop-blur-xl lg:size-24",
      "before:absolute before:inset-0 before:rounded-full",
      "before:bg-gradient-to-b before:from-neutral-500 before:to-transparent before:opacity-10"
    )}
  >
    <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset lg:size-16">
      <RiFolderLine className="size-6 text-text-sub-600 lg:size-8" />
    </div>
  </div>

  <div className="space-y-1 text-center">
    <div className="text-title-h6 lg:text-title-h5">Create a Project</div>
    <div className="text-paragraph-sm text-text-sub-600 lg:text-paragraph-md">
      Set up a new project for your team.
    </div>
  </div>
</div>
```

### Pattern 5: Full Page Header Component

For reusable page headers, create a dedicated component:

```tsx
// /app/(application)/_components/page-header.tsx
import type { RemixiconComponentType } from "@remixicon/react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: RemixiconComponentType;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      {breadcrumbs}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex size-10 items-center justify-center rounded-full bg-bg-weak-50 ring-1 ring-stroke-soft-200 ring-inset">
              <Icon className="size-5 text-text-sub-600" />
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <h1 className="text-title-h5 text-text-strong-950">{title}</h1>
            {subtitle && (
              <p className="text-paragraph-sm text-text-sub-600">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
```

Usage:

```tsx
// /app/(application)/projects/page.tsx
import { RiAddLine, RiFolderLine } from "@remixicon/react";
import * as Button from "@/components/ui/button";
import { PageHeader } from "../_components/page-header";

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Projects"
        subtitle="Manage your projects and track progress."
        icon={RiFolderLine}
        actions={
          <Button.Root variant="primary" size="small">
            <Button.Icon as={RiAddLine} />
            New Project
          </Button.Root>
        }
      />
      {/* Page content */}
    </div>
  );
}
```

### Pattern 6: Header with Tabs

```tsx
import * as TabMenu from "@/components/ui/tab-menu-horizontal";

<div className="flex flex-col gap-0">
  {/* Header */}
  <div className="flex items-center justify-between border-b border-stroke-soft-200 px-6 py-4">
    <h1 className="text-title-h5 text-text-strong-950">Settings</h1>
  </div>

  {/* Tab navigation */}
  <TabMenu.Root defaultValue="general">
    <TabMenu.List>
      <TabMenu.Trigger value="general">General</TabMenu.Trigger>
      <TabMenu.Trigger value="billing">Billing</TabMenu.Trigger>
      <TabMenu.Trigger value="team">Team</TabMenu.Trigger>
    </TabMenu.List>
  </TabMenu.Root>
</div>
```

## Header Placement

Headers should be placed at the top of the page content area:

```tsx
// page.tsx
export default function MyPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* HEADER -- always first */}
      <div className="flex items-center justify-between">
        <h1 className="text-title-h5 text-text-strong-950">Page Title</h1>
      </div>

      {/* CONTENT -- below header */}
      <div>
        {/* ... */}
      </div>
    </div>
  );
}
```

If the page is inside a layout with a fixed sidebar, the header is part of the main content area (not the layout).

## Header with Divider

To visually separate the header from content:

```tsx
import * as Divider from "@/components/ui/divider";

<div className="flex flex-col gap-6 p-6">
  <div className="flex items-center justify-between">
    <h1 className="text-title-h5 text-text-strong-950">Page Title</h1>
  </div>
  <Divider.Root />
  {/* Content below divider */}
</div>
```

## Design Token Reference

| Element | Class |
|---------|-------|
| Page title (large) | `text-title-h5 text-text-strong-950` |
| Page title (small) | `text-title-h6 text-text-strong-950` |
| Subtitle | `text-paragraph-sm text-text-sub-600` |
| Breadcrumb text | `text-label-sm text-text-sub-600` (active: `text-text-strong-950`) |
| Icon color | `text-text-sub-600` |
| Icon background | `bg-bg-weak-50` or `bg-bg-white-0` |
| Icon ring | `ring-1 ring-stroke-soft-200 ring-inset` |

## Rules

- Keep headers as **Server Components** when they only display static content
- Use `"use client"` only if the header contains interactive elements (buttons that open modals, etc.)
- Always use AlignUI typography tokens (`text-title-h5`, `text-paragraph-sm`, etc.)
- Use Remix Icon library (`@remixicon/react`) for all icons
- Breadcrumbs should use `Link` from `next/link` and `PAGES` constants for navigation
