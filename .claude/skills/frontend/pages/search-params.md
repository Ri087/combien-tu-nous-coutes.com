# Skill: How to Handle Search Params in Pages

## Purpose

Guide to handling URL search parameters in Next.js 15 pages. Covers server-side parsing with the nuqs cache, passing values to client components, updating URL state from client components, and common search params patterns.

## How Search Params Work in Next.js 15

In Next.js 15, `searchParams` is a `Promise` passed to page components:

```tsx
type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  // params is now a plain object: { key: "value", ... }
}
```

This codebase uses `nuqs` to manage search params with type safety and caching.

## The Standard Pattern

Every page that reads search params follows this three-file pattern:

```
/app/(application)/projects/
  search-params.ts       # 1. Define parsers and cache
  page.tsx               # 2. Parse on the server
  _components/
    project-filters.tsx  # 3. Read/update on the client
```

### File 1: `search-params.ts`

```tsx
import { createSearchParamsCache, parseAsString, parseAsInteger } from "nuqs/server";

// Parser objects -- used by both server and client
export const projectParsers = {
  search: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
};

// Server-side cache -- used only by the page.tsx server component
export const searchParamsCache = createSearchParamsCache(projectParsers);
```

### File 2: `page.tsx` (Server Component)

```tsx
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";

import { ProjectList } from "./_components/project-list";
import { searchParamsCache } from "./search-params";

export const metadata: Metadata = {
  title: "Projects",
};

type ProjectsPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  // Parse and cache the search params
  await searchParamsCache.parse(searchParams);

  return (
    <div className="flex flex-col gap-6 p-6">
      <ProjectList />
    </div>
  );
}
```

### File 3: Client Component

```tsx
// /app/(application)/projects/_components/project-list.tsx
"use client";

import { useQueryStates } from "nuqs";
import { projectParsers } from "../search-params";

export function ProjectList() {
  const [{ search, page }, setParams] = useQueryStates(projectParsers);

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setParams({ search: e.target.value, page: 1 })}
      />
      <div>Current page: {page}</div>
      <button onClick={() => setParams({ page: page + 1 })}>Next</button>
    </div>
  );
}
```

## Server-Side Access to Parsed Values

You can destructure the parsed values for server-side use:

```tsx
export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { search, page } = await searchParamsCache.parse(searchParams);

  // Use on the server (e.g., for server-side data fetching)
  console.log("Searching for:", search, "on page:", page);

  return <ProjectList />;
}
```

### Passing Parsed Values as Props

If you prefer explicit prop passing over the nuqs cache:

```tsx
// page.tsx
export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { search, page } = await searchParamsCache.parse(searchParams);

  return <ProjectList initialSearch={search} initialPage={page} />;
}
```

```tsx
// _components/project-list.tsx
"use client";

import { useQueryStates } from "nuqs";
import { projectParsers } from "../search-params";

interface ProjectListProps {
  initialSearch: string;
  initialPage: number;
}

export function ProjectList({ initialSearch, initialPage }: ProjectListProps) {
  // useQueryStates still works -- the cache was populated by page.tsx
  const [{ search, page }, setParams] = useQueryStates(projectParsers);

  // search and page will be hydrated from the URL, not the props
  // The props can be used as a fallback or for SSR
}
```

## Common Search Params Patterns

### Pattern 1: Search + Filter + Pagination

```tsx
// search-params.ts
import {
  createSearchParamsCache,
  parseAsString,
  parseAsInteger,
  parseAsStringEnum,
} from "nuqs/server";

const statusOptions = ["all", "active", "completed", "archived"] as const;
const sortOptions = ["newest", "oldest", "name", "updated"] as const;

export const projectParsers = {
  search: parseAsString.withDefault(""),
  status: parseAsStringEnum(statusOptions).withDefault("all"),
  sort: parseAsStringEnum(sortOptions).withDefault("newest"),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(20),
};

export const searchParamsCache = createSearchParamsCache(projectParsers);
```

### Pattern 2: Modal/Dialog State in URL

```tsx
// search-params.ts
import { createSearchParamsCache, parseAsString, parseAsBoolean } from "nuqs/server";

export const pageParsers = {
  create: parseAsBoolean.withDefault(false),    // ?create=true opens modal
  editId: parseAsString,                         // ?editId=abc opens edit modal
};

export const searchParamsCache = createSearchParamsCache(pageParsers);
```

```tsx
// _components/project-list.tsx
"use client";

import { useQueryStates } from "nuqs";
import { pageParsers } from "../search-params";

export function ProjectList() {
  const [{ create, editId }, setParams] = useQueryStates(pageParsers);

  return (
    <>
      <button onClick={() => setParams({ create: true })}>
        Create Project
      </button>

      {create && (
        <CreateProjectModal onClose={() => setParams({ create: null })} />
      )}

      {editId && (
        <EditProjectModal
          projectId={editId}
          onClose={() => setParams({ editId: null })}
        />
      )}
    </>
  );
}
```

### Pattern 3: Tab State in URL

```tsx
// search-params.ts
import { createSearchParamsCache, parseAsStringEnum } from "nuqs/server";

const tabValues = ["overview", "tasks", "members", "settings"] as const;

export const tabParsers = {
  tab: parseAsStringEnum(tabValues).withDefault("overview"),
};

export const searchParamsCache = createSearchParamsCache(tabParsers);
```

```tsx
// _components/project-tabs.tsx
"use client";

import { useQueryState, parseAsStringEnum } from "nuqs";

const tabValues = ["overview", "tasks", "members", "settings"] as const;

export function ProjectTabs() {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringEnum(tabValues).withDefault("overview")
  );

  return (
    <div>
      {tabValues.map((value) => (
        <button
          key={value}
          onClick={() => setTab(value)}
          className={tab === value ? "font-bold" : ""}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
```

### Pattern 4: Message/Error Feedback (Auth Pattern)

This is the existing pattern used in auth pages:

```tsx
// search-params.ts
import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const messageParsers = {
  message: parseAsString.withDefault(""),
  error: parseAsString.withDefault(""),
};

export const searchParamsCache = createSearchParamsCache(messageParsers);
```

Used to pass success/error messages via URL redirects:

```tsx
// After a successful action, redirect with a message
redirect(`/sign-in?message=${encodeURIComponent("Password reset successfully!")}`);

// After an error, redirect with an error
redirect(`/sign-in?error=${encodeURIComponent("Session expired")}`);
```

### Pattern 5: Date Range Filter

```tsx
// search-params.ts
import { createSearchParamsCache, parseAsIsoDateTime } from "nuqs/server";

export const dateParsers = {
  from: parseAsIsoDateTime,
  to: parseAsIsoDateTime,
};

export const searchParamsCache = createSearchParamsCache(dateParsers);
```

## Without nuqs: Raw Search Params

If you need to read a search param once without the full nuqs setup:

```tsx
// page.tsx -- simple server-side access
type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";

  return <SearchResults query={query} />;
}
```

However, this approach lacks type safety and does not sync with client components. Prefer nuqs for any page where search params are used interactively.

## Combining Search Params with oRPC Queries

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";

import { orpc } from "@/lib/orpc/react";
import { projectParsers } from "../search-params";

export function ProjectList() {
  const [{ search, status, page, perPage }] = useQueryStates(projectParsers);

  // Pass URL state as query input
  const { data, isLoading } = useQuery(
    orpc.projects.list.queryOptions({
      input: {
        search: search || undefined,
        status: status === "all" ? undefined : status,
        page,
        perPage,
      },
    })
  );

  // ...
}
```

## Checklist for Adding Search Params to a Page

1. Create `search-params.ts` alongside `page.tsx`
2. Define parsers with appropriate types and defaults
3. Export both the parsers and the `searchParamsCache`
4. In `page.tsx`, accept `searchParams: Promise<SearchParams>` and call `await searchParamsCache.parse(searchParams)`
5. In client components, use `useQueryStates(parsers)` from `"nuqs"` to read and update values
6. Import parsers from `"../search-params"` (relative to `_components/`)

## Rules

- `searchParams` is a `Promise` in Next.js 15 -- always await it
- The `searchParamsCache.parse()` call in the server page is REQUIRED for client components to work
- Use `withDefault()` on parsers to avoid null handling in client components
- Import `createSearchParamsCache` and parsers from `"nuqs/server"`
- Import `useQueryStates` and `useQueryState` from `"nuqs"` (without `/server`)
- Always reset page to 1 when filter/search values change
- Use `parseAsStringEnum` for parameters with a fixed set of values
- Use `null` to remove a parameter from the URL
