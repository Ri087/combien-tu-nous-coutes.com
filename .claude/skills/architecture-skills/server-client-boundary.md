# Server/Client Boundary Patterns

## The Fundamental Rule

In Next.js App Router, **every component is a Server Component by default**. You must explicitly opt in to client-side interactivity with the `"use client"` directive.

```
Server Component (default)  -->  Can access DB, env vars, server-only code
Client Component ("use client")  -->  Can use hooks, event handlers, browser APIs
```

## When to Use `"use client"`

Add `"use client"` at the top of a file when the component needs ANY of these:

| Need | Reason |
|------|--------|
| `useState`, `useReducer` | Client-side state |
| `useEffect`, `useLayoutEffect` | Side effects |
| `onClick`, `onChange`, `onSubmit` | Event handlers |
| `useRouter`, `usePathname`, `useSearchParams` | Next.js client hooks |
| `useForm` (React Hook Form) | Form management |
| `useQuery`, `useMutation` (TanStack Query) | Data fetching/mutations from client |
| Browser APIs (`window`, `document`, `localStorage`) | Browser-only code |
| Third-party hooks (e.g., `useTheme`) | Client-side libraries |

```tsx
// This file NEEDS "use client" because it uses useState and onClick
"use client";

import { useState } from "react";
import * as Button from "@/components/ui/button";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <Button.Root onClick={() => setCount(count + 1)}>
      Count: {count}
    </Button.Root>
  );
}
```

## When to Use `"use server"`

Add `"use server"` at the top of a file to mark all exported functions as **Server Actions**. Server Actions are functions that run on the server but can be called from client components.

```tsx
// /app/(application)/projects/_actions/create-project.ts
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { projects } from "@/db/schema";

export async function createProject(data: { name: string }) {
  await db.insert(projects).values({
    name: data.name,
    // ...
  });
  revalidatePath("/projects");
}
```

**Server Action rules:**
- The file must have `"use server"` as the first line
- All exported functions become server actions
- They can be imported and called directly from client components
- Arguments and return values must be serializable
- They always run on the server, even when called from the browser

## The Server-Client Boundary in This Codebase

### Architecture Flow

```
page.tsx (Server Component)
  |
  +--> _components/feature-list.tsx ("use client")
  |      |
  |      +--> _hooks/use-feature.ts (client hook using oRPC)
  |      |      |
  |      |      +--> @/orpc/client.ts (browser-side oRPC client)
  |      |             |
  |      |             +--> /api/rpc/ (HTTP request to server)
  |      |                    |
  |      |                    +--> server/routers/ (oRPC handler)
  |      |
  |      +--> _components/feature-card.tsx (no directive = inherits client)
  |
  +--> @/orpc/server.ts (direct server call, no HTTP)
```

### Key Insight: Two Ways to Call oRPC

**From Server Components** -- Direct call, no HTTP:
```tsx
// page.tsx (Server Component)
import { api } from "@/orpc/server";

export default async function ProjectsPage() {
  const projects = await api.projects.list({});
  return <ProjectList initialProjects={projects} />;
}
```

**From Client Components** -- Via HTTP through TanStack Query:
```tsx
// _hooks/use-projects.ts (used in "use client" components)
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";

export function useProjects() {
  return useQuery(orpc.projects.list.queryOptions());
}
```

## What CAN Cross the Boundary

### Props from Server to Client

Only **serializable** values can be passed as props from Server to Client Components:

```tsx
// GOOD -- Serializable props
<ClientComponent
  name="John"                          // string
  count={42}                           // number
  isActive={true}                      // boolean
  items={["a", "b"]}                   // array of primitives
  config={{ key: "value" }}            // plain object
  createdAt={project.createdAt.toISOString()}  // Date as string
/>

// BAD -- Non-serializable props
<ClientComponent
  db={db}                              // Database instance
  onClick={() => console.log("hi")}    // Function (unless Server Action)
  element={<ServerComponent />}        // Server Component as JSX (use children instead)
  classInstance={new MyClass()}         // Class instance
  createdAt={project.createdAt}        // Date object (use .toISOString() instead)
/>
```

### Server Actions as Props

Server Actions **can** be passed as props to client components:

```tsx
// page.tsx (Server Component)
import { createProject } from "./_actions/create-project";

export default function Page() {
  return <CreateForm onSubmit={createProject} />;  // Server Action as prop
}
```

```tsx
// _components/create-form.tsx
"use client";

type CreateFormProps = {
  onSubmit: (data: { name: string }) => Promise<void>;
};

export function CreateForm({ onSubmit }: CreateFormProps) {
  return <form action={onSubmit}>...</form>;
}
```

### Children Pattern (Composition)

Server Components can be passed as `children` to Client Components:

```tsx
// layout.tsx (Server Component)
import { Sidebar } from "./_components/sidebar";  // Client Component
import { Navigation } from "./_components/navigation";  // Server Component

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Sidebar>
      <Navigation />   {/* Server Component rendered as children */}
      {children}        {/* More Server Components */}
    </Sidebar>
  );
}
```

```tsx
// _components/sidebar.tsx
"use client";

export function Sidebar({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className={isOpen ? "w-64" : "w-16"}>
      {children}  {/* Server Components render here */}
    </div>
  );
}
```

## What CANNOT Cross the Boundary

### Server-only imports in Client Components

```tsx
// BAD -- These will cause build errors in "use client" files
"use client";

import { db } from "@/db";                           // Database
import { headers } from "next/headers";               // Server-only Next.js API
import { auth } from "@/auth";                        // Better Auth (server-only)
import { api } from "@/orpc/server";                  // Server-side oRPC client
import { getServerSession } from "@/lib/auth/utils";  // Server-only helper
import { env } from "@/env";                          // Server env vars (unless NEXT_PUBLIC_)
import "server-only";                                 // Explicit server-only marker
```

### Client-only code in Server Components

```tsx
// BAD -- These will cause errors in Server Components
import { useState, useEffect } from "react";          // React hooks
import { useRouter } from "next/navigation";           // Client-only hook
import { orpc } from "@/orpc/client";                  // Client-side oRPC (uses window)
```

## Common Patterns in This Codebase

### Pattern 1: Auth-Protected Layout (Server Component)

```tsx
// /app/(application)/layout.tsx
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

### Pattern 2: Page Delegates to Client Component

```tsx
// page.tsx (Server Component -- no "use client")
import type { Metadata } from "next";
import { ProjectList } from "./_components/project-list";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return <ProjectList />;
}
```

```tsx
// _components/project-list.tsx (Client Component)
"use client";

import { useProjects } from "../_hooks/use-projects";

export function ProjectList() {
  const { data, isLoading } = useProjects();
  // Interactive UI with hooks
}
```

### Pattern 3: Server Action Called from Client

```tsx
// _actions/sign-out.ts
"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PAGES } from "@/constants/pages";

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  revalidatePath(PAGES.SIGN_IN);
  redirect(PAGES.SIGN_IN);
}
```

```tsx
// /components/logout-button.tsx
"use client";

import { signOut } from "@/server/actions/sign-out";

export function LogoutButton() {
  return <button onClick={() => signOut()}>Logout</button>;
}
```

### Pattern 4: Server Component with Data Fetching + Client Interactivity

```tsx
// page.tsx (Server Component)
import { api } from "@/orpc/server";
import { ProjectDashboard } from "./_components/project-dashboard";

export default async function Page() {
  // Fetch on server -- no HTTP round trip
  const projects = await api.projects.list({});

  // Pass serializable data to client
  return <ProjectDashboard initialProjects={projects} />;
}
```

```tsx
// _components/project-dashboard.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";

type Props = {
  initialProjects: Project[];
};

export function ProjectDashboard({ initialProjects }: Props) {
  // Client-side refetching with initial data from server
  const { data: projects } = useQuery({
    ...orpc.projects.list.queryOptions(),
    initialData: initialProjects,
  });

  // Interactive UI
}
```

### Pattern 5: Providers Wrapping the App

```tsx
// /app/providers.tsx (no "use server", no "use client" -- it's a composition file)
// Actually this file uses client providers, so components inside use "use client"

// /app/layout.tsx (Server Component)
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Decision Tree

```
Do I need useState, useEffect, onClick, or browser APIs?
  |
  YES --> Add "use client" to the file
  |         |
  |         Do I need DB/auth/env access?
  |           |
  |           YES --> Use Server Actions (_actions/) or oRPC hooks (_hooks/)
  |           NO  --> Use client-side state and oRPC client
  |
  NO --> Keep as Server Component (default)
          |
          Do I need to fetch data?
            |
            YES --> Import from @/orpc/server (api) or use db directly
            NO  --> Just render JSX with props
```

## Environment Variables Across the Boundary

```typescript
// Server-only (accessible in Server Components, Server Actions, API routes)
env.DATABASE_URL
env.BETTER_AUTH_SECRET
env.RESEND_API_KEY

// Client-accessible (prefixed with NEXT_PUBLIC_)
env.NEXT_PUBLIC_REACT_QUERY_DEVTOOLS    // Available in both server and client
env.NEXT_PUBLIC_REACT_SCAN_DEVTOOLS     // Available in both server and client
```

**Rule:** Never expose server environment variables to client components. Use `NEXT_PUBLIC_` prefix only for variables that are safe to expose to the browser.

## Common Mistakes

### 1. Adding "use client" unnecessarily

```tsx
// BAD -- This component has no interactivity, no hooks, no events
"use client";

export function ProjectTitle({ title }: { title: string }) {
  return <h1>{title}</h1>;
}

// GOOD -- Keep it as a Server Component
export function ProjectTitle({ title }: { title: string }) {
  return <h1>{title}</h1>;
}
```

### 2. Importing server code in client components

```tsx
// BAD -- Will crash at build time
"use client";
import { db } from "@/db";
import { getServerSession } from "@/lib/auth/utils";
```

### 3. Passing non-serializable props across the boundary

```tsx
// BAD -- Date objects are not serializable
<ClientComponent createdAt={new Date()} />

// GOOD -- Convert to string
<ClientComponent createdAt={new Date().toISOString()} />
```

### 4. Forgetting that child components inherit "use client"

```tsx
// _components/project-list.tsx
"use client";

// This import makes ProjectCard ALSO a client component
// Even if project-card.tsx does not have "use client"
import { ProjectCard } from "./project-card";
```

If `ProjectCard` does not need client features, this is fine -- it just means it will be bundled as a client component. But it cannot use server-only features like `db` or `headers()`.

### 5. Using useRouter for server-side redirects

```tsx
// BAD -- useRouter is for client-side navigation
// In a Server Component or Server Action:
const router = useRouter();
router.push("/dashboard");

// GOOD -- Use redirect from next/navigation in server code
import { redirect } from "next/navigation";
redirect("/dashboard");
```
