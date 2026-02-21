# Pagination

## When to use

- Navigate between pages of data (tables, lists, grids)
- Display page numbers with previous/next controls
- Any paginated content display

## Import

```tsx
import * as Pagination from '@/components/ui/pagination';
```

## Parts

| Part | Description |
|------|------------|
| `Pagination.Root` | Container. Controls variant styling. Passes variant to children. |
| `Pagination.Item` | Individual page number button. Supports `current` prop for active state. |
| `Pagination.NavButton` | Previous/Next navigation button. |
| `Pagination.NavIcon` | Icon inside a NavButton (polymorphic, use `as` prop). |

## Basic Usage

```tsx
'use client';

import * as Pagination from '@/components/ui/pagination';
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';

<Pagination.Root>
  <Pagination.NavButton disabled>
    <Pagination.NavIcon as={RiArrowLeftSLine} />
  </Pagination.NavButton>
  <Pagination.Item current>1</Pagination.Item>
  <Pagination.Item>2</Pagination.Item>
  <Pagination.Item>3</Pagination.Item>
  <Pagination.Item>4</Pagination.Item>
  <Pagination.Item>5</Pagination.Item>
  <Pagination.NavButton>
    <Pagination.NavIcon as={RiArrowRightSLine} />
  </Pagination.NavButton>
</Pagination.Root>
```

## Variants

| Variant | Description | Default |
|---------|------------|---------|
| `basic` | Individual rounded-lg items with ring border, `gap-2` | Yes |
| `rounded` | Individual rounded-full items with ring border, `gap-2` | No |
| `group` | Connected items with shared border, no gap | No |

```tsx
{/* Basic (default) */}
<Pagination.Root variant="basic">...</Pagination.Root>

{/* Rounded */}
<Pagination.Root variant="rounded">...</Pagination.Root>

{/* Group */}
<Pagination.Root variant="group">...</Pagination.Root>
```

## Props

### Pagination.Root

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'basic' \| 'rounded' \| 'group'` | `'basic'` | Visual style variant |
| `asChild` | `boolean` | `false` | Merge props with child element |

### Pagination.Item

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `current` | `boolean` | `false` | Marks the item as the active/current page |
| `asChild` | `boolean` | `false` | Merge props with child element |
| `disabled` | `boolean` | `false` | Disable the button |
| `onClick` | `() => void` | -- | Click handler |

### Pagination.NavButton

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Merge props with child element |
| `disabled` | `boolean` | `false` | Disable navigation (e.g., on first/last page) |
| `onClick` | `() => void` | -- | Click handler |

## Styling Details

- **Active item**: `text-text-strong-950` (via `current` prop)
- **Inactive item**: `text-text-sub-600`
- **Hover**: `bg-bg-weak-50` (basic/rounded also remove ring)
- **NavIcon**: `size-5`
- **Items (basic/rounded)**: `h-8 min-w-8`, ring border
- **Items (group)**: `h-8 min-w-10`, divided border
- **Transition**: 200ms ease-out

## Common Patterns

### With URL state (nuqs)

```tsx
'use client';

import { useQueryState, parseAsInteger } from 'nuqs';
import * as Pagination from '@/components/ui/pagination';
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';

function PaginationControls({ totalPages }: { totalPages: number }) {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <Pagination.Root>
      <Pagination.NavButton
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
      >
        <Pagination.NavIcon as={RiArrowLeftSLine} />
      </Pagination.NavButton>

      {pages.map((p) => (
        <Pagination.Item
          key={p}
          current={p === page}
          onClick={() => setPage(p)}
        >
          {p}
        </Pagination.Item>
      ))}

      <Pagination.NavButton
        disabled={page >= totalPages}
        onClick={() => setPage(page + 1)}
      >
        <Pagination.NavIcon as={RiArrowRightSLine} />
      </Pagination.NavButton>
    </Pagination.Root>
  );
}
```

### With ellipsis for many pages

```tsx
'use client';

import * as Pagination from '@/components/ui/pagination';
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 3) return [1, 2, 3, 4, '...', total];
  if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

function PaginationWithEllipsis({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = getPageNumbers(page, totalPages);

  return (
    <Pagination.Root>
      <Pagination.NavButton
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <Pagination.NavIcon as={RiArrowLeftSLine} />
      </Pagination.NavButton>

      {pages.map((p, i) =>
        p === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-8 min-w-8 items-center justify-center text-text-soft-400"
          >
            ...
          </span>
        ) : (
          <Pagination.Item
            key={p}
            current={p === page}
            onClick={() => onPageChange(p)}
          >
            {p}
          </Pagination.Item>
        )
      )}

      <Pagination.NavButton
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <Pagination.NavIcon as={RiArrowRightSLine} />
      </Pagination.NavButton>
    </Pagination.Root>
  );
}
```

### With React Query data

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useQueryState, parseAsInteger } from 'nuqs';

function PaginatedList() {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['items', page],
    queryFn: () => fetchItems({ page, limit }),
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* List content */}
      {isLoading ? <ListSkeleton /> : <ItemList items={data.items} />}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <PaginationWithEllipsis
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
```

### Simple previous/next without page numbers

```tsx
<Pagination.Root>
  <Pagination.NavButton
    disabled={page <= 1}
    onClick={() => setPage(page - 1)}
  >
    <Pagination.NavIcon as={RiArrowLeftSLine} />
  </Pagination.NavButton>
  <span className="px-3 text-label-sm text-text-sub-600">
    Page {page} of {totalPages}
  </span>
  <Pagination.NavButton
    disabled={page >= totalPages}
    onClick={() => setPage(page + 1)}
  >
    <Pagination.NavIcon as={RiArrowRightSLine} />
  </Pagination.NavButton>
</Pagination.Root>
```

## Rules

- ALWAYS disable the previous NavButton when on page 1 (`disabled={page <= 1}`)
- ALWAYS disable the next NavButton when on the last page (`disabled={page >= totalPages}`)
- Mark the current page with `current` prop on `Pagination.Item`
- Use `nuqs` (`useQueryState`) for URL-based page state so pages are shareable and bookmarkable
- Use `RiArrowLeftSLine` and `RiArrowRightSLine` for navigation icons
- For large page counts (>7 pages), implement ellipsis logic
- Hide pagination entirely when there is only 1 page
- Center the pagination: wrap in `<div className="flex justify-center">...</div>`
- Requires `'use client'` directive

## Related Skills

- `icons.md` -- Navigation icons (RiArrowLeftSLine, RiArrowRightSLine)
- `skeleton.md` -- Loading state while fetching paginated data
- `spacing-layout.md` -- Layout patterns for pagination placement
