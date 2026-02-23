# Skill: URL State Management with nuqs

## Purpose

Complete guide to managing URL search parameter state using nuqs v2.4.3 in this Next.js 16 codebase. Covers client-side reading/writing of URL params, server-side parsing, and integration with oRPC queries.

## Prerequisites

- nuqs v2.4.3 is installed
- `NuqsAdapter` is already configured in `/app/providers.tsx`
- No additional setup needed

## Architecture

| Piece | File | Role |
|-------|------|------|
| NuqsAdapter | `/app/providers.tsx` | Wraps app with `NuqsAdapter` from `nuqs/adapters/next/app` |
| Search params file | `/app/(application)/[feature]/search-params.ts` | Defines parsers and cache per page |

## Key Imports

```tsx
// Client-side (in "use client" components)
import { useQueryState, useQueryStates } from "nuqs";
import { parseAsString, parseAsInteger, parseAsBoolean, parseAsStringEnum } from "nuqs";

// Server-side (in page.tsx / Server Components)
import { createSearchParamsCache, parseAsString, parseAsInteger } from "nuqs/server";
import type { SearchParams } from "nuqs/server";
```

## Pattern 1: Define Search Params (search-params.ts)

Create a `search-params.ts` file colocated with the page that uses URL state.

```tsx
// /app/(application)/projects/search-params.ts
import {
  createSearchParamsCache,
  parseAsString,
  parseAsInteger,
  parseAsStringEnum,
} from "nuqs/server";

// Define parsers for each search param
export const projectParsers = {
  search: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  status: parseAsStringEnum(["active", "archived", "all"]).withDefault("all"),
  sort: parseAsString.withDefault("createdAt"),
};

// Create the server-side cache
export const searchParamsCache = createSearchParamsCache(projectParsers);
```

## Pattern 2: Server-Side Parsing (page.tsx)

Parse search params on the server in the page component. This makes them available to the cache for server-side access.

```tsx
// /app/(application)/projects/page.tsx
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
  // Parse search params on the server (populates the cache)
  await searchParamsCache.parse(searchParams);

  return (
    <div className="flex flex-col gap-6 p-6">
      <ProjectList />
    </div>
  );
}
```

**Important:** In Next.js 16, `searchParams` is a `Promise` and must be awaited.

## Pattern 3: Client-Side Single Param (useQueryState)

Read and write a single URL parameter.

```tsx
// /app/(application)/projects/_components/project-search.tsx
"use client";

import { useQueryState, parseAsString } from "nuqs";
import * as Input from "@/components/ui/input";
import { RiSearchLine } from "@remixicon/react";

export function ProjectSearch() {
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("")
  );

  return (
    <Input.Root>
      <Input.Wrapper>
        <Input.Icon as={RiSearchLine} />
        <Input.Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Input.Wrapper>
    </Input.Root>
  );
}
```

## Pattern 4: Client-Side Multiple Params (useQueryStates)

Read and write multiple URL parameters at once.

```tsx
// /app/(application)/projects/_components/project-filters.tsx
"use client";

import { useQueryStates } from "nuqs";
import { projectParsers } from "../search-params";

export function ProjectFilters() {
  const [{ search, status, sort }, setParams] = useQueryStates(projectParsers);

  return (
    <div className="flex gap-3">
      <Input.Root>
        <Input.Wrapper>
          <Input.Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setParams({ search: e.target.value })}
          />
        </Input.Wrapper>
      </Input.Root>

      <select
        value={status}
        onChange={(e) => setParams({ status: e.target.value as "active" | "archived" | "all" })}
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="archived">Archived</option>
      </select>

      <select
        value={sort}
        onChange={(e) => setParams({ sort: e.target.value })}
      >
        <option value="createdAt">Date Created</option>
        <option value="name">Name</option>
      </select>
    </div>
  );
}
```

**Existing codebase example** -- the sign-in page uses `useQueryStates` to read `message` and `error` from URL:

```tsx
// From /app/(auth)/sign-in/_components/sign-in-form.tsx
const [{ message, error: errorQuery }] = useQueryStates(messageParsers);
```

## Pattern 5: URL State Driving oRPC Queries

Use URL params as input to oRPC queries for server-driven filtering.

```tsx
// /app/(application)/projects/_components/project-list.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { orpc } from "@/orpc/client";
import { projectParsers } from "../search-params";

export function ProjectList() {
  const [{ search, page, status, sort }] = useQueryStates(projectParsers);

  const { data, isLoading } = useQuery(
    orpc.projects.list.queryOptions({
      input: {
        search,
        page,
        status: status === "all" ? undefined : status,
        sort,
      },
    })
  );

  if (isLoading) return <ProjectListSkeleton />;

  return (
    <div>
      {data?.items.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

## Pattern 6: Pagination with URL State

```tsx
"use client";

import { useQueryState, parseAsInteger } from "nuqs";

export function Pagination({ totalPages }: { totalPages: number }) {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  return (
    <div className="flex items-center gap-2">
      <Button.Root
        variant="neutral"
        mode="stroke"
        size="small"
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
      >
        Previous
      </Button.Root>

      <span className="text-paragraph-sm text-text-sub-600">
        Page {page} of {totalPages}
      </span>

      <Button.Root
        variant="neutral"
        mode="stroke"
        size="small"
        disabled={page >= totalPages}
        onClick={() => setPage(page + 1)}
      >
        Next
      </Button.Root>
    </div>
  );
}
```

## Pattern 7: Tab State via URL

```tsx
"use client";

import { useQueryState, parseAsStringEnum } from "nuqs";
import * as Tabs from "@/components/ui/tabs";

const tabValues = ["overview", "tasks", "settings"] as const;

export function ProjectTabs() {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringEnum([...tabValues]).withDefault("overview")
  );

  return (
    <Tabs.Root value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
      <Tabs.List>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="tasks">Tasks</Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  );
}
```

## Available Parsers

| Parser | URL Value | TypeScript Type | Example |
|--------|-----------|----------------|---------|
| `parseAsString` | `?q=hello` | `string \| null` | Search text |
| `parseAsInteger` | `?page=2` | `number \| null` | Pagination |
| `parseAsBoolean` | `?open=true` | `boolean \| null` | Toggles |
| `parseAsStringEnum(["a","b"])` | `?status=a` | `"a" \| "b" \| null` | Tab/filter selection |
| `parseAsFloat` | `?price=9.99` | `number \| null` | Decimal values |

Use `.withDefault(value)` to avoid `null` and get a default value:

```tsx
parseAsString.withDefault("")        // string (never null)
parseAsInteger.withDefault(1)        // number (never null)
parseAsBoolean.withDefault(false)    // boolean (never null)
```

## File Structure Convention

```
/app/(application)/projects/
  page.tsx                              # Parses searchParams on server
  search-params.ts                      # Defines parsers + cache
  _components/
    project-list.tsx                    # Uses useQueryStates to read params
    project-search.tsx                  # Uses useQueryState to write search
    project-filters.tsx                 # Uses useQueryStates to write filters
```

## Rules

- ALWAYS create a `search-params.ts` file colocated with the page when using URL state
- ALWAYS call `searchParamsCache.parse(searchParams)` in the server page component
- ALWAYS use `.withDefault()` to avoid dealing with `null` values
- ALWAYS import parsers from `"nuqs"` in client components and from `"nuqs/server"` in server files
- ALWAYS reuse the same parser objects in both `search-params.ts` and client components for consistency
- PREFER `useQueryStates` over multiple `useQueryState` calls when reading related params
- USE URL state for: search, filters, pagination, tabs, sort order, modals (open/close)
- DO NOT use URL state for: form input values, temporary UI state, sensitive data
- REMEMBER that `searchParams` is a `Promise` in Next.js 16 -- always await it
