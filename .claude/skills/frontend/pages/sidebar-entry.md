# Skill: How to Add Entries to the Sidebar Navigation

## Purpose

Guide to adding navigation entries to the application sidebar. Covers where the sidebar is defined, how navigation items are structured, icon usage, active state handling, and ordering.

## Context

The boilerplate starts with a minimal application layout (`/app/(application)/layout.tsx`) that wraps children in a simple `<div>`. As the app grows, a sidebar navigation is typically added to this layout.

## Step 1: Check if Sidebar Exists

Look for a sidebar component in:
- `/app/(application)/_components/app-sidebar.tsx`
- `/app/(application)/_components/sidebar.tsx`
- `/components/sidebar.tsx`

If no sidebar exists yet, create one following the patterns below.

## Step 2: Creating a Sidebar (If Not Present)

### Define Navigation Items

Create a navigation configuration file:

```tsx
// /app/(application)/_components/sidebar-nav-items.ts
import type { RemixiconComponentType } from "@remixicon/react";
import {
  RiDashboardLine,
  RiFolderLine,
  RiSettings4Line,
  RiTeamLine,
  RiBarChartLine,
} from "@remixicon/react";

import { PAGES } from "@/constants/pages";

export interface NavItem {
  label: string;
  href: string;
  icon: RemixiconComponentType;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export const sidebarNavGroups: NavGroup[] = [
  {
    items: [
      {
        label: "Dashboard",
        href: PAGES.DASHBOARD,
        icon: RiDashboardLine,
      },
    ],
  },
  {
    title: "Workspace",
    items: [
      {
        label: "Projects",
        href: PAGES.PROJECTS,
        icon: RiFolderLine,
      },
      {
        label: "Team",
        href: PAGES.TEAM,
        icon: RiTeamLine,
      },
      {
        label: "Analytics",
        href: PAGES.ANALYTICS,
        icon: RiBarChartLine,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "Settings",
        href: PAGES.SETTINGS,
        icon: RiSettings4Line,
      },
    ],
  },
];
```

### Create the Sidebar Component

```tsx
// /app/(application)/_components/app-sidebar.tsx
"use client";

import { RiMenuLine, RiCloseLine } from "@remixicon/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/logo";
import * as CompactButton from "@/components/ui/compact-button";
import * as Divider from "@/components/ui/divider";
import { cn } from "@/lib/utils/cn";

import { sidebarNavGroups, type NavItem } from "./sidebar-nav-items";

interface AppSidebarProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile menu button */}
      <div className="flex items-center gap-3 border-b border-stroke-soft-200 p-4 lg:hidden">
        <CompactButton.Root
          variant="ghost"
          size="large"
          onClick={() => setMobileOpen(true)}
        >
          <CompactButton.Icon as={RiMenuLine} />
        </CompactButton.Root>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-overlay backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          // Base
          "fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-stroke-soft-200 bg-bg-white-0",
          // Desktop
          "lg:relative lg:z-auto",
          // Mobile animation
          "transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-14 items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="size-7" />
          </Link>
          <CompactButton.Root
            className="lg:hidden"
            variant="ghost"
            size="large"
            onClick={() => setMobileOpen(false)}
          >
            <CompactButton.Icon as={RiCloseLine} />
          </CompactButton.Root>
        </div>

        <Divider.Root />

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {sidebarNavGroups.map((group, groupIndex) => (
            <div key={group.title ?? groupIndex} className="flex flex-col gap-1">
              {group.title && (
                <div className="px-3 py-2 text-label-xs text-text-soft-400 uppercase tracking-wider">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  item={item}
                  active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                />
              ))}
              {groupIndex < sidebarNavGroups.length - 1 && (
                <Divider.Root className="my-2" />
              )}
            </div>
          ))}
        </nav>

        {/* Sidebar footer: user info */}
        <Divider.Root />
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="flex size-8 items-center justify-center rounded-full bg-bg-weak-50 text-label-sm text-text-sub-600">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-label-sm text-text-strong-950">{user.name}</span>
            <span className="truncate text-paragraph-xs text-text-sub-600">{user.email}</span>
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarNavItem({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-label-sm transition-colors duration-200",
        active
          ? "bg-bg-weak-50 text-text-strong-950"
          : "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950"
      )}
    >
      <Icon className="size-5 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}
```

### Integrate into the Application Layout

```tsx
// /app/(application)/layout.tsx
import { redirect } from "next/navigation";

import { PAGES } from "@/constants/pages";
import { getServerSession } from "@/lib/auth/utils";

import { AppSidebar } from "./_components/app-sidebar";

export default async function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect(PAGES.SIGN_IN);
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar user={session.user} />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
```

## Step 3: Adding a New Sidebar Entry

### 1. Add Route to Constants

```typescript
// /constants/pages.ts
export const APPLICATION_PAGES = {
  DASHBOARD: "/dashboard",
  PROJECTS: "/projects",   // Add new route
};
```

### 2. Add Nav Item to Configuration

Open the sidebar navigation items file and add the new entry:

```tsx
// /app/(application)/_components/sidebar-nav-items.ts
import { RiFileListLine } from "@remixicon/react"; // Import icon

// Add to the appropriate group
{
  title: "Workspace",
  items: [
    {
      label: "Projects",
      href: PAGES.PROJECTS,
      icon: RiFolderLine,
    },
    // ADD NEW ENTRY HERE
    {
      label: "Documents",
      href: PAGES.DOCUMENTS,
      icon: RiFileListLine,
    },
  ],
},
```

### 3. Create the Page

Create the page file at `/app/(application)/documents/page.tsx` (see `create-page.md`).

## Active State Logic

The sidebar determines which item is active using pathname matching:

```tsx
// Exact match OR starts with the item's href (for nested pages)
const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
```

This means:
- `/projects` highlights the "Projects" nav item
- `/projects/123` also highlights the "Projects" nav item
- `/projects/123/settings` also highlights the "Projects" nav item

## Icon Selection

Use icons from `@remixicon/react`. Common sidebar icons:

| Feature | Icon |
|---------|------|
| Dashboard | `RiDashboardLine` |
| Projects | `RiFolderLine` |
| Documents | `RiFileListLine` |
| Team/Users | `RiTeamLine` or `RiUserLine` |
| Settings | `RiSettings4Line` |
| Analytics | `RiBarChartLine` |
| Messages | `RiChat1Line` |
| Calendar | `RiCalendarLine` |
| Billing | `RiBankCardLine` |
| Help | `RiQuestionLine` |
| Notifications | `RiNotification3Line` |

Use the **Line** variant (not Fill) for sidebar navigation icons to maintain a clean, consistent look.

## Ordering Convention

Organize sidebar items in this order:
1. **Primary action** (Dashboard) -- always first, no group title
2. **Core features** -- grouped under a section title like "Workspace"
3. **Secondary features** -- grouped under another title
4. **Account/Settings** -- always last

## Responsive Behavior

The sidebar component handles responsive behavior:
- **Desktop (lg+)**: Fixed sidebar, always visible, `w-[272px]`
- **Mobile (<lg)**: Hidden by default, slides in from left with overlay
- **Auto-close**: Mobile sidebar closes automatically on pathname change

## Rules

- Always use `PAGES` constants for `href` values
- Always use Remix Icon **Line** variants for sidebar icons
- Keep the nav items configuration separate from the component for easy maintenance
- Active state must handle both exact and prefix matching for nested routes
- The sidebar is a `"use client"` component (needs `usePathname`, `useState`)
- Pass user data from the server layout to the sidebar as props
