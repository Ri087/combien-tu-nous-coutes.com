# Skill: How to Use URL State with nuqs

## Purpose

Guide to managing URL state with the `nuqs` library in the Next.js 16 App Router. Covers `createSearchParamsCache`, parser types, the `search-params.ts` file pattern, and client-side URL state updates.

## What is nuqs?

`nuqs` (pronounced "nukes") is a type-safe URL search params state manager for Next.js. It replaces manual `URLSearchParams` manipulation with React hooks that keep URL and component state in sync.

The codebase already has `nuqs` configured via the `NuqsAdapter` in `/app/providers.tsx`.

## Architecture: Server + Client Coordination

nuqs uses a two-part architecture:

1. **Server side**: `createSearchParamsCache` + parsers defined in `search-params.ts`
2. **Client side**: `useQueryStates` or `useQueryState` hooks in client components

The server parses and caches search params. The client reads and updates them.

## The `search-params.ts` Pattern

Every page that uses URL state needs a `search-params.ts` file alongside its `page.tsx`:

```
/app/(application)/projects/
  page.tsx                    # Server Component -- parses search params
  search-params.ts            # Shared parsers definition
  _components/
    project-list.tsx          # Client Component -- reads/updates search params
```

### Defining Parsers

```tsx
// /app/(application)/projects/search-params.ts
import { createSearchParamsCache, parseAsString, parseAsInteger } from "nuqs/server";

// Define parsers for each URL parameter
export const projectParsers = {
  search: parseAsString.withDefault(""),
  status: parseAsString.withDefault("all"),
  page: parseAsInteger.withDefault(1),
  sort: parseAsString.withDefault("created_at"),
};

// Create the server-side cache
export const searchParamsCache = createSearchParamsCache(projectParsers);
```

### Available Parsers

| Parser | Type | Example URL |
|--------|------|-------------|
| `parseAsString` | `string \| null` | `?search=hello` |
| `parseAsString.withDefault("")` | `string` | `?search=hello` (default: `""`) |
| `parseAsInteger` | `number \| null` | `?page=2` |
| `parseAsInteger.withDefault(1)` | `number` | `?page=2` (default: `1`) |
| `parseAsFloat` | `number \| null` | `?price=9.99` |
| `parseAsBoolean` | `boolean \| null` | `?active=true` |
| `parseAsArrayOf(parseAsString)` | `string[] \| null` | `?tags=a&tags=b` |
| `parseAsStringEnum(["a","b"])` | `"a" \| "b" \| null` | `?status=a` |
| `parseAsStringLiteral(["a","b"])` | `"a" \| "b" \| null` | `?status=a` |
| `parseAsTimestamp` | `Date \| null` | `?date=1234567890` |
| `parseAsIsoDateTime` | `Date \| null` | `?date=2024-01-01` |
| `parseAsJson` | `T \| null` | `?filter={"key":"val"}` |

## Server-Side: Parsing in page.tsx

The page (Server Component) must parse the search params before client components can access them:

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
  // REQUIRED: Parse search params on the server
  await searchParamsCache.parse(searchParams);

  return (
    <div className="flex flex-col gap-6 p-6">
      <ProjectList />
    </div>
  );
}
```

You can also destructure the parsed values for server-side use:

```tsx
export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { search, status, page } = await searchParamsCache.parse(searchParams);

  // Use parsed values for server-side data fetching
  // const projects = await getProjects({ search, status, page });

  return <ProjectList />;
}
```

## Client-Side: Reading and Updating URL State

### `useQueryStates` -- Multiple Parameters

```tsx
// /app/(application)/projects/_components/project-list.tsx
"use client";

import { useQueryStates } from "nuqs";
import { projectParsers } from "../search-params";

export function ProjectList() {
  const [{ search, status, page, sort }, setParams] = useQueryStates(projectParsers);

  // Read values
  console.log(search);  // string (with default: "")
  console.log(page);    // number (with default: 1)

  // Update a single param
  const handleSearchChange = (value: string) => {
    setParams({ search: value, page: 1 }); // Reset page when searching
  };

  // Update multiple params at once
  const handleFilterChange = (newStatus: string) => {
    setParams({ status: newStatus, page: 1 });
  };

  // Clear a param (set to null removes it from URL)
  const handleClearSearch = () => {
    setParams({ search: null });
  };

  return (
    <div>
      <input
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Search projects..."
      />
      {/* ... */}
    </div>
  );
}
```

### `useQueryState` -- Single Parameter

For simpler cases with a single URL parameter:

```tsx
"use client";

import { useQueryState, parseAsString } from "nuqs";

export function SearchInput() {
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("")
  );

  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### Update Options

```tsx
// Shallow update (default) -- does not trigger a server re-render
setParams({ search: "hello" });

// With history push (default is replace)
setParams({ search: "hello" }, { history: "push" });

// Throttled updates (useful for search inputs)
setParams({ search: "hello" }, { throttleMs: 300 });

// Scroll to top on update
setParams({ page: 2 }, { scroll: true });
```

## Existing Codebase Examples

### Sign-In Page Search Params

```tsx
// /app/(auth)/sign-in/search-params.ts
import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const messageParsers = {
  message: parseAsString.withDefault(""),
  error: parseAsString.withDefault(""),
};

export const searchParamsCache = createSearchParamsCache(messageParsers);
```

```tsx
// /app/(auth)/sign-in/_components/sign-in-form.tsx
"use client";
import { useQueryStates } from "nuqs";
import { messageParsers } from "../search-params";

export function SignInForm() {
  const [{ message, error }] = useQueryStates(messageParsers);
  // Display message or error from URL params
}
```

### Verification Page Search Params

```tsx
// /app/(auth)/verification/search-params.ts
import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const emailParsers = {
  email: parseAsString.withDefault(""),
  otp: parseAsString,
};

export const searchParamsCache = createSearchParamsCache(emailParsers);
```

## Complete Example: Filterable List Page

### search-params.ts

```tsx
import {
  createSearchParamsCache,
  parseAsString,
  parseAsInteger,
  parseAsStringEnum,
} from "nuqs/server";

const statusValues = ["all", "active", "archived", "draft"] as const;

export const projectParsers = {
  search: parseAsString.withDefault(""),
  status: parseAsStringEnum(statusValues).withDefault("all"),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
};

export const searchParamsCache = createSearchParamsCache(projectParsers);
```

### page.tsx

```tsx
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { ProjectList } from "./_components/project-list";
import { searchParamsCache } from "./search-params";

export const metadata: Metadata = { title: "Projects" };

type Props = { searchParams: Promise<SearchParams> };

export default async function ProjectsPage({ searchParams }: Props) {
  await searchParamsCache.parse(searchParams);
  return (
    <div className="flex flex-col gap-6 p-6">
      <ProjectList />
    </div>
  );
}
```

### _components/project-filters.tsx

```tsx
"use client";

import { RiSearchLine } from "@remixicon/react";
import { useQueryStates } from "nuqs";

import * as Input from "@/components/ui/input";
import * as SegmentedControl from "@/components/ui/segmented-control";
import { projectParsers } from "../search-params";

export function ProjectFilters() {
  const [{ search, status }, setParams] = useQueryStates(projectParsers);

  return (
    <div className="flex items-center gap-4">
      <Input.Root size="small" className="w-64">
        <Input.Wrapper>
          <Input.Icon as={RiSearchLine} />
          <Input.Input
            value={search}
            onChange={(e) => setParams({ search: e.target.value, page: 1 })}
            placeholder="Search projects..."
          />
        </Input.Wrapper>
      </Input.Root>

      <SegmentedControl.Root
        value={status}
        onValueChange={(val) => setParams({ status: val, page: 1 })}
      >
        <SegmentedControl.List>
          <SegmentedControl.Trigger value="all">All</SegmentedControl.Trigger>
          <SegmentedControl.Trigger value="active">Active</SegmentedControl.Trigger>
          <SegmentedControl.Trigger value="archived">Archived</SegmentedControl.Trigger>
        </SegmentedControl.List>
      </SegmentedControl.Root>
    </div>
  );
}
```

## Rules

- Always create a `search-params.ts` file alongside the `page.tsx` that uses URL state
- Always call `await searchParamsCache.parse(searchParams)` in the server page component
- Export both the parsers object and the cache from `search-params.ts`
- Use `withDefault()` to avoid null checks in client components
- Import parsers in client components for `useQueryStates`; import cache in server pages for `parse`
- The `searchParamsCache` import comes from `"nuqs/server"`, while `useQueryStates` comes from `"nuqs"`
- Reset pagination to page 1 when filters change
- Use throttling (`throttleMs: 300`) for text input fields to avoid excessive URL updates
