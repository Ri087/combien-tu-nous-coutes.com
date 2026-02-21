# Protect Pages - Server Layout Pattern with Redirect

## When to Use

Use this skill when you need to:
- Protect authenticated pages so only logged-in users can access them
- Redirect unauthenticated users to the sign-in page
- Redirect already-authenticated users away from auth pages (sign-in, sign-up)
- Create new route groups with auth protection

## The Layout Pattern

This codebase protects pages using **server-side session checks in layout components**. There is no middleware-based auth guard. Instead, each route group has a layout that checks the session and redirects accordingly.

### Two Route Groups

| Route Group | Path | Protection | Redirect |
|-------------|------|-----------|----------|
| `(auth)` | `/sign-in`, `/sign-up`, `/verification`, etc. | Logged-in users are redirected away | `-> PAGES.DASHBOARD` |
| `(application)` | `/dashboard`, and all authenticated pages | Unauthenticated users are redirected away | `-> PAGES.SIGN_IN` |

## Protecting Authenticated Pages

### Existing Pattern: `/app/(application)/layout.tsx`

```typescript
import { redirect } from "next/navigation";

import { PAGES } from "@/constants/pages";
import { getServerSession } from "@/lib/auth/utils";

export default async function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect(PAGES.SIGN_IN);
  }

  return <div>{children}</div>;
}
```

**How it works**: Any page under `/app/(application)/` automatically inherits this layout. If the user has no valid session, they are redirected to `/sign-in` before the page even renders.

### Adding a New Protected Page

To add a new protected page (e.g., `/settings`), simply create it inside the `(application)` route group:

```
/app/(application)/settings/
  page.tsx
  _components/
    settings-form.tsx
```

The page is automatically protected by the `(application)/layout.tsx` -- no additional auth code needed.

### Example Protected Page

```typescript
// /app/(application)/settings/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      {/* This page only renders for authenticated users */}
    </div>
  );
}
```

## Redirecting Authenticated Users from Auth Pages

### Existing Pattern: `/app/(auth)/layout.tsx`

```typescript
import { redirect } from "next/navigation";

import { PAGES } from "@/constants/pages";
import { getServerSession } from "@/lib/auth/utils";

import AuthFooter from "./_components/footer";
import AuthHeader from "./_components/header";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  if (session) {
    redirect(PAGES.DASHBOARD);
  }

  return (
    <div className="items-cente flex min-h-screen flex-col ">
      <AuthHeader />
      <div className="relative isolate flex w-full flex-1 flex-col items-center justify-center">
        <img
          alt=""
          className="-z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none absolute top-1/2 left-1/2 w-full max-w-[1140px] object-contain"
          height="318"
          src="/images/auth-pattern.svg"
          width="824"
        />
        {children}
      </div>
      <AuthFooter />
    </div>
  );
}
```

**How it works**: If a logged-in user navigates to `/sign-in` or `/sign-up`, they are immediately redirected to `/dashboard`.

## Creating a New Protected Route Group

If you need a separate layout for a subset of authenticated pages (e.g., admin pages):

### Step 1: Create the Route Group

```
/app/(admin)/
  layout.tsx
  admin-dashboard/
    page.tsx
```

### Step 2: Add the Protection Layout

```typescript
// /app/(admin)/layout.tsx
import { redirect } from "next/navigation";

import { PAGES } from "@/constants/pages";
import { getServerSession } from "@/lib/auth/utils";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect(PAGES.SIGN_IN);
  }

  // Optional: Add role-based checks here
  // if (session.user.role !== "admin") {
  //   redirect(PAGES.DASHBOARD);
  // }

  return <div>{children}</div>;
}
```

## Accessing Session in Protected Pages

Since the layout already checks the session, pages inside `(application)` know the user is authenticated. However, if a page needs access to the session data itself, it must call `getServerSession()` again:

```typescript
// /app/(application)/profile/page.tsx
import { getServerSession } from "@/lib/auth/utils";

export default async function ProfilePage() {
  // This call is safe because the layout already redirected if no session
  const session = await getServerSession();

  // session is guaranteed non-null here because of the layout guard,
  // but TypeScript doesn't know that, so use the non-null assertion or check
  if (!session) return null;

  return (
    <div>
      <h1>{session.user.name}</h1>
      <p>{session.user.email}</p>
    </div>
  );
}
```

**Note**: Next.js deduplicates `fetch` calls within a single request, and Better Auth uses `headers()` which is also deduplicated. So calling `getServerSession()` in both the layout and the page does NOT result in two database queries.

## Page-Level Redirects (Search Params Guards)

Some auth pages have additional guards based on search params. For example, the verification page redirects to sign-up if no email is provided:

```typescript
// /app/(auth)/verification/page.tsx
import { redirect } from "next/navigation";
import { PAGES } from "@/constants/pages";

export default async function PageVerification({ searchParams }) {
  const { email } = await searchParamsCache.parse(searchParams);

  if (!email) {
    return redirect(PAGES.SIGN_UP);
  }

  return <VerificationForm />;
}
```

Similarly, the reset-password page redirects if no token is provided:

```typescript
// /app/(auth)/reset-password/page.tsx
export default async function PageResetPassword({ searchParams }) {
  const { token, error } = await searchParamsCache.parse(searchParams);

  if (error) {
    redirect(`${PAGES.FORGOT_PASSWORD}?error=This link is invalid or expired`);
  }

  if (!token) {
    redirect(PAGES.SIGN_IN);
  }

  return <ResetPasswordForm />;
}
```

## Rules

- ALWAYS protect authenticated pages via the `(application)` route group layout -- never add individual auth checks in each page
- ALWAYS use `redirect()` from `next/navigation` for server-side redirects (not `NextResponse.redirect`)
- ALWAYS use `PAGES.XXX` constants for redirect targets
- NEVER add auth protection using Next.js middleware -- use the layout pattern instead
- If a page needs session data, call `getServerSession()` in the page even though the layout already checked it
- Route group names in parentheses (e.g., `(application)`) do NOT appear in the URL

## Related Skills

- `session-check.md` - Details on `getServerSession()` and `authClient.useSession()`
- `overview.md` - Full auth architecture overview
- `protect-api.md` - Protecting oRPC API procedures
