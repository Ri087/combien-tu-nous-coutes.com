# Session Check - Server-Side and Client-Side

## When to Use

Use this skill when you need to:
- Read the current user's session in a Server Component or Server Action
- Read the current user's session in a Client Component
- Access user data (id, name, email) in any context
- Conditionally render UI based on auth state

## Server-Side Session Check

### The `getServerSession()` Helper

Location: `/lib/auth/utils.ts`

```typescript
import { headers } from "next/headers";
import { auth } from "@/auth";

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}
```

This function:
- Reads the session cookie from the incoming request headers
- Returns `null` if the user is not authenticated
- Returns a `Session` object if authenticated

### Using in Server Components

```typescript
import { getServerSession } from "@/lib/auth/utils";

export default async function MyPage() {
  const session = await getServerSession();

  if (!session) {
    // User is not logged in
    return <p>Please sign in.</p>;
  }

  return (
    <div>
      <p>Welcome, {session.user.name}</p>
      <p>Email: {session.user.email}</p>
    </div>
  );
}
```

### Using in Server Actions

```typescript
"use server";

import { getServerSession } from "@/lib/auth/utils";

export async function myServerAction() {
  const session = await getServerSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Use session.user.id to scope queries
  const userId = session.user.id;
  // ...
}
```

### Using in API Route Handlers

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/utils";

export async function GET() {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ user: session.user });
}
```

## Client-Side Session Check

### Using `authClient.useSession()`

The `authClient` from `/lib/auth/client.ts` provides a React hook for client-side session access:

```typescript
"use client";

import { authClient } from "@/lib/auth/client";

export function UserGreeting() {
  const { data: session, isPending, error } = authClient.useSession();

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (!session) {
    return <p>Not logged in</p>;
  }

  return <p>Hello, {session.user.name}</p>;
}
```

### Hook Return Values

| Property | Type | Description |
|----------|------|-------------|
| `data` | `Session \| null` | The session object, or null if not authenticated |
| `isPending` | `boolean` | True while the session is being fetched |
| `error` | `Error \| null` | Error if the session fetch failed |

### Using `authClient.getSession()` (Non-Hook)

For one-off checks in client-side code (not inside React render):

```typescript
"use client";

import { authClient } from "@/lib/auth/client";

async function checkAuth() {
  const { data: session, error } = await authClient.getSession();

  if (error || !session) {
    console.log("Not authenticated");
    return null;
  }

  return session;
}
```

## Session Shape

The `Session` type is defined in `/lib/auth/types.ts`:

```typescript
import type { auth } from "@/auth";

export type Session = typeof auth.$Infer.Session;
```

At runtime, a session object looks like:

```typescript
{
  session: {
    id: "abc123",
    token: "...",
    expiresAt: Date,
    createdAt: Date,
    updatedAt: Date,
    ipAddress: "127.0.0.1",
    userAgent: "Mozilla/5.0...",
    userId: "user_xyz"
  },
  user: {
    id: "user_xyz",
    name: "John Doe",
    email: "john@example.com",
    emailVerified: true,
    image: null,
    createdAt: Date,
    updatedAt: Date
  }
}
```

### Accessing User Data

```typescript
// Server-side
const session = await getServerSession();
const userId = session?.user.id;        // string
const userName = session?.user.name;     // string
const userEmail = session?.user.email;   // string
const isVerified = session?.user.emailVerified; // boolean

// Client-side
const { data: session } = authClient.useSession();
const userId = session?.user.id;
```

## Passing Session to Child Components

If you already have the session from a layout or page, pass it as a prop rather than re-fetching:

```typescript
// layout.tsx (server)
import { getServerSession } from "@/lib/auth/utils";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  // session is available here for layout-level decisions
  return <div>{children}</div>;
}
```

For client components that need session data, prefer `authClient.useSession()` over prop drilling from server components, since the hook provides reactivity and automatic re-fetching.

## Rules

- ALWAYS use `getServerSession()` from `@/lib/auth/utils` on the server -- never call `auth.api.getSession()` directly (the helper handles the `headers()` call)
- ALWAYS use `authClient.useSession()` in client components for reactive session data
- NEVER store session data in local state or localStorage -- Better Auth manages cookies automatically
- The session can be `null` -- always handle the unauthenticated case
- `getServerSession()` is an async function -- always `await` it
- The `user.id` field is a `text` string, not a `uuid`

## Related Skills

- `overview.md` - Full auth architecture and configuration
- `protect-pages.md` - Using session checks to protect pages
- `protect-api.md` - Using session in oRPC middleware
- `auth-client.md` - All authClient methods
