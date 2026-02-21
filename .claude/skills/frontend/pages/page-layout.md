# Skill: Page Layout Structure and Patterns

## Purpose

Guide to understanding and creating page layouts in the Next.js 15 App Router. Covers route group layouts, nesting, authentication checks, provider configuration, and responsive design.

## Layout Architecture Overview

The app uses a layered layout system:

```
/app/layout.tsx                        # Root: fonts, <html>, <body>, Providers
  /app/(auth)/layout.tsx               # Auth: session check, redirect to dashboard if logged in
  /app/(application)/layout.tsx        # App: session check, redirect to sign-in if not logged in
  /app/(marketing)/layout.tsx          # Marketing: public layout (no auth check)
```

Every page inherits its parent layout(s). A page at `/app/(application)/projects/page.tsx` will be rendered inside:
1. Root layout (`/app/layout.tsx`)
2. Application layout (`/app/(application)/layout.tsx`)

## Existing Layouts

### Root Layout (`/app/layout.tsx`)

This is the top-level layout. It sets up:
- **Fonts**: Inter (sans) + GeistMono (monospace)
- **Providers**: ORPCQueryClientProvider, ThemeProvider, NuqsAdapter, TooltipProvider, NotificationProvider, Toaster
- **Body classes**: `bg-bg-white-0 text-text-strong-950`
- **Structure**: `<div className="flex min-h-screen flex-col"><main className="flex flex-1 flex-col">{children}</main></div>`

```tsx
// /app/layout.tsx (DO NOT MODIFY -- reference only)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={cn(inter.variable, geistMono.variable, "antialiased")} lang="en" suppressHydrationWarning>
      <body className="bg-bg-white-0 text-text-strong-950">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <main className="flex flex-1 flex-col">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
```

### Application Layout (`/app/(application)/layout.tsx`)

Protects all application routes. Redirects unauthenticated users to sign-in.

```tsx
// /app/(application)/layout.tsx
import { redirect } from "next/navigation";
import { PAGES } from "@/constants/pages";
import { getServerSession } from "@/lib/auth/utils";

export default async function ApplicationLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    redirect(PAGES.SIGN_IN);
  }

  return <div>{children}</div>;
}
```

### Auth Layout (`/app/(auth)/layout.tsx`)

Wraps all authentication pages. Redirects logged-in users to the dashboard. Includes auth-specific header/footer and a centered decorative background.

```tsx
// /app/(auth)/layout.tsx
export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (session) {
    redirect(PAGES.DASHBOARD);
  }

  return (
    <div className="items-center flex min-h-screen flex-col">
      <AuthHeader />
      <div className="relative isolate flex w-full flex-1 flex-col items-center justify-center">
        <img alt="" className="..." src="/images/auth-pattern.svg" />
        {children}
      </div>
      <AuthFooter />
    </div>
  );
}
```

## Creating a New Layout

### When to Create a New Layout

Create a new layout when you need:
- A **shared UI wrapper** for multiple pages (sidebar, header, navigation)
- A **new route group** with its own auth logic
- A **sub-layout** within an existing route group (e.g., settings with a sidebar)

### Pattern: Application Layout with Sidebar

When the application grows beyond a simple dashboard, you will likely need a sidebar layout:

```tsx
// /app/(application)/layout.tsx (enhanced with sidebar)
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
      <div className="flex flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
```

### Pattern: Nested Sub-Layout (e.g., Settings)

```tsx
// /app/(application)/settings/layout.tsx
import { SettingsSidebar } from "./_components/settings-sidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-6 p-6">
      <SettingsSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
```

### Pattern: Marketing Layout

```tsx
// /app/(marketing)/layout.tsx
import { MarketingHeader } from "./_components/marketing-header";
import { MarketingFooter } from "./_components/marketing-footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <div className="flex-1">{children}</div>
      <MarketingFooter />
    </div>
  );
}
```

## Layout Rules

### Do

- Layouts are **Server Components** by default -- keep them as server components
- Use `getServerSession()` from `@/lib/auth/utils` for auth checks
- Use `redirect()` from `next/navigation` for redirects (not `router.push`)
- Use `PAGES` constants from `@/constants/pages` for route paths
- Pass `session.user` as a prop to client components that need user data

### Do Not

- Do NOT add `"use client"` to layout files
- Do NOT fetch data in layouts unless it is needed by all child pages
- Do NOT add heavy components to layouts (they re-render on every navigation)
- Do NOT modify the root layout (`/app/layout.tsx`) or existing route group layouts without a good reason

## Responsive Layout Patterns

### Desktop + Mobile Sidebar

```tsx
// Desktop: fixed sidebar with main content area
<div className="flex min-h-screen">
  {/* Sidebar: hidden on mobile, fixed on desktop */}
  <aside className="hidden lg:flex lg:w-[272px] lg:flex-col lg:border-r lg:border-stroke-soft-200">
    {/* Sidebar content */}
  </aside>

  {/* Main content: full width on mobile, flex-1 on desktop */}
  <div className="flex flex-1 flex-col">
    {/* Mobile header with menu button */}
    <div className="flex items-center gap-3 border-b border-stroke-soft-200 p-4 lg:hidden">
      {/* Mobile menu trigger */}
    </div>
    {children}
  </div>
</div>
```

### Content Width Constraints

```tsx
// Full-width with max-width
<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
  {children}
</div>

// Narrow content (forms, settings)
<div className="mx-auto w-full max-w-2xl px-4">
  {children}
</div>
```

## Providers Reference

All providers are configured in `/app/providers.tsx` and wrapped in the root layout. Pages automatically have access to:

| Provider | Purpose |
|----------|---------|
| `ORPCQueryClientProvider` | TanStack Query + oRPC client |
| `ThemeProvider` | Dark/light mode via `next-themes` |
| `NuqsAdapter` | URL search params state management |
| `TooltipProvider` | AlignUI tooltip context |
| `NotificationProvider` | Toast notification system |
| `Toaster` | Sonner toast renderer (position: top-center) |

You do NOT need to add these providers again in sub-layouts.

## Common Layout Structures

### Simple page (no sub-layout needed):
```
/(application)/projects/page.tsx
```

### Page with sub-layout:
```
/(application)/settings/layout.tsx     # Settings sidebar
/(application)/settings/page.tsx       # General settings
/(application)/settings/billing/page.tsx
/(application)/settings/team/page.tsx
```

### Page with nested dynamic routes:
```
/(application)/projects/page.tsx           # List
/(application)/projects/[id]/page.tsx      # Detail
/(application)/projects/[id]/layout.tsx    # Detail sub-layout (optional)
/(application)/projects/[id]/settings/page.tsx
```
