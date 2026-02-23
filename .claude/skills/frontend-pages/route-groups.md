# Skill: How to Use Route Groups

## Purpose

Guide to understanding and creating route groups in Next.js 16 App Router. Covers the existing `(auth)`, `(application)`, and `(marketing)` groups, when to create new ones, and shared layout patterns.

## What Are Route Groups?

Route groups are folders wrapped in parentheses: `(groupName)`. They:
- **Organize** routes without affecting the URL structure
- **Share layouts** among a group of routes
- **Do NOT appear** in the URL path

```
/app/(auth)/sign-in/page.tsx     → URL: /sign-in    (not /auth/sign-in)
/app/(application)/dashboard/page.tsx → URL: /dashboard  (not /application/dashboard)
```

## Existing Route Groups

### `(auth)` -- Authentication Pages

**Path**: `/app/(auth)/`
**URL prefix**: None (pages are at root like `/sign-in`, `/sign-up`)
**Layout**: Checks session, redirects to dashboard if already logged in. Displays auth header/footer with centered content and decorative background.

```
/app/(auth)/
  layout.tsx                    # Auth layout with session redirect
  _components/
    header.tsx                  # Auth-specific header (sign in/up toggle)
    footer.tsx                  # Copyright footer
    password-input.tsx          # Shared password input
  sign-in/
    page.tsx
    search-params.ts
    _components/sign-in-form.tsx
  sign-up/
    page.tsx
    search-params.ts
    _components/sign-up-form.tsx
  forgot-password/
    page.tsx
    _components/forgot-password-form.tsx
  reset-password/
    page.tsx
    search-params.ts
    _components/reset-password-form.tsx
  verification/
    page.tsx
    search-params.ts
    _components/verification-form.tsx
```

**Layout behavior:**
```tsx
// If user has a session, redirect to dashboard
const session = await getServerSession();
if (session) {
  redirect(PAGES.DASHBOARD);
}
```

### `(application)` -- Authenticated App Pages

**Path**: `/app/(application)/`
**URL prefix**: None (pages are at root like `/dashboard`, `/projects`)
**Layout**: Checks session, redirects to sign-in if not authenticated.

```
/app/(application)/
  layout.tsx                    # Auth check, redirect if no session
  dashboard/
    page.tsx
  projects/                     # Example feature
    page.tsx
    _components/
    _hooks/
    _actions/
```

**Layout behavior:**
```tsx
// If user has no session, redirect to sign-in
const session = await getServerSession();
if (!session) {
  redirect(PAGES.SIGN_IN);
}
```

### `(marketing)` -- Public Marketing Pages

**Path**: `/app/(marketing)/` (create when needed)
**URL prefix**: None
**Layout**: No auth check. Public header/footer for marketing site.

```
/app/(marketing)/
  layout.tsx                    # Marketing header + footer
  about/page.tsx               # /about
  pricing/page.tsx             # /pricing
  blog/page.tsx                # /blog
```

## When to Create a New Route Group

### Create a New Group When:

1. **Multiple routes need the same layout** that differs from existing groups
2. **Different auth requirements** than existing groups
3. **Distinct UI sections** of the app (e.g., admin panel, public API docs)

### Examples of Valid New Route Groups

| Group | Purpose |
|-------|---------|
| `(admin)` | Admin panel with admin-only auth check |
| `(onboarding)` | Post-signup onboarding flow with progress bar |
| `(public)` | Public pages that do not need the marketing layout |
| `(embed)` | Embeddable widgets with minimal chrome |

### Do NOT Create a New Group When:

- You just need a sub-page (use nested folders instead)
- The layout is the same as an existing group
- You are creating a one-off page

## Creating a New Route Group

### Step 1: Create the Directory

```
/app/(new-group)/
  layout.tsx
```

### Step 2: Create the Layout

```tsx
// /app/(onboarding)/layout.tsx
import { redirect } from "next/navigation";
import { PAGES } from "@/constants/pages";
import { getServerSession } from "@/lib/auth/utils";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect(PAGES.SIGN_IN);
  }

  // Check if user has already completed onboarding
  if (session.user.onboardingCompleted) {
    redirect(PAGES.DASHBOARD);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {children}
      </div>
    </div>
  );
}
```

### Step 3: Add Pages

```
/app/(onboarding)/
  layout.tsx
  welcome/page.tsx          # /welcome
  setup-profile/page.tsx    # /setup-profile
  invite-team/page.tsx      # /invite-team
```

### Step 4: Update Constants

```typescript
// /constants/pages.ts
export const ONBOARDING_PAGES = {
  WELCOME: "/welcome",
  SETUP_PROFILE: "/setup-profile",
  INVITE_TEAM: "/invite-team",
};

export const PAGES = {
  ...MARKETING_PAGES,
  ...APPLICATION_PAGES,
  ...AUTH_PAGES,
  ...ONBOARDING_PAGES,
};
```

## Route Group Rules and Gotchas

### URL Conflicts

Two route groups CANNOT have pages that resolve to the same URL:

```
/app/(auth)/sign-in/page.tsx          → /sign-in
/app/(marketing)/sign-in/page.tsx     → /sign-in  ← CONFLICT!
```

This will cause a build error. Each URL must map to exactly one page.

### Shared Components Within a Group

Use `_components/` at the group level for components shared across pages in that group:

```
/app/(auth)/
  _components/           # Shared across all auth pages
    header.tsx
    footer.tsx
  sign-in/
    _components/         # Specific to sign-in page
      sign-in-form.tsx
```

### Nested Layouts Within a Group

You can nest layouts within a route group:

```
/app/(application)/
  layout.tsx                    # Auth check for all application pages
  settings/
    layout.tsx                  # Settings sub-layout (e.g., settings sidebar)
    page.tsx                    # /settings
    billing/page.tsx           # /settings/billing
    team/page.tsx              # /settings/team
```

### The Root Page

The root page (`/app/page.tsx`) sits outside all route groups. It is typically the landing page or redirects to the dashboard:

```tsx
// /app/page.tsx -- outside any route group
export default function Home() {
  return <LandingPage />;
}
```

Alternatively, you can move it into a marketing group and have the root redirect:

```tsx
// /app/page.tsx
import { redirect } from "next/navigation";
export default function Home() {
  redirect("/landing");
}
```

## Layout Inheritance

Layouts stack from parent to child:

```
Root Layout (/app/layout.tsx)
  └─ Fonts, Providers, <html>, <body>
    ├─ Auth Layout (/app/(auth)/layout.tsx)
    │   └─ Session check, auth header/footer
    │     └─ Sign In Page
    ├─ Application Layout (/app/(application)/layout.tsx)
    │   └─ Session check, sidebar
    │     ├─ Dashboard Page
    │     └─ Settings Layout (/app/(application)/settings/layout.tsx)
    │         └─ Settings sidebar
    │           ├─ General Settings Page
    │           └─ Billing Page
    └─ Marketing Layout (/app/(marketing)/layout.tsx)
        └─ Public header/footer
          └─ About Page
```

Every page automatically inherits all parent layouts above it. You do not need to re-wrap content with providers or auth checks.

## Summary

| Group | Auth Check | Redirect | UI Wrapper |
|-------|-----------|----------|------------|
| `(auth)` | Has session? | Redirect to dashboard | Auth header/footer, centered content |
| `(application)` | No session? | Redirect to sign-in | App shell (sidebar if present) |
| `(marketing)` | None | None | Marketing header/footer |
