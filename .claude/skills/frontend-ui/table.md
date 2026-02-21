# AlignUI Table Component

## When to Use

Use Table for displaying structured tabular data: lists of records, resources, transactions, users, or any data that benefits from column-based presentation with sorting, pagination, or row actions.

## Import Pattern

```tsx
import * as Table from '@/components/ui/table';
```

## Parts

| Part | Description |
|------|-------------|
| `Table.Root` | Outer container with horizontal scroll wrapper + `<table>` element. |
| `Table.Header` | `<thead>` element. Contains column headers. |
| `Table.Head` | `<th>` element. Column header cell with rounded corners and subdued background. |
| `Table.Body` | `<tbody>` element. Adds spacing between header and body rows. |
| `Table.Row` | `<tr>` element. Has `group/row` class for hover targeting on cells. |
| `Table.RowDivider` | Divider row between data rows. Uses AlignUI Divider internally. |
| `Table.Cell` | `<td>` element. 64px height, rounded corners, hover background on row. |
| `Table.Caption` | `<caption>` element. Table description text below the table. |

## Props

### Body Props

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `spacing` | `number` | `8` | Pixel spacing between thead and tbody |

### Head/Cell/Row Props

Standard HTML table element attributes (`className`, `colSpan`, `onClick`, etc.).

## Complete Usage Examples

### Basic static table

```tsx
import * as Table from '@/components/ui/table';

<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.Head>Name</Table.Head>
      <Table.Head>Email</Table.Head>
      <Table.Head>Role</Table.Head>
      <Table.Head>Status</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.Cell>John Doe</Table.Cell>
      <Table.Cell>john@example.com</Table.Cell>
      <Table.Cell>Admin</Table.Cell>
      <Table.Cell>Active</Table.Cell>
    </Table.Row>
    <Table.RowDivider />
    <Table.Row>
      <Table.Cell>Jane Smith</Table.Cell>
      <Table.Cell>jane@example.com</Table.Cell>
      <Table.Cell>Editor</Table.Cell>
      <Table.Cell>Active</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table.Root>
```

### Table with rich cell content

```tsx
import * as Table from '@/components/ui/table';
import * as Avatar from '@/components/ui/avatar';
import * as Badge from '@/components/ui/badge';
import * as StatusBadge from '@/components/ui/status-badge';
import * as CompactButton from '@/components/ui/compact-button';
import { RiMoreLine } from '@remixicon/react';

<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.Head>Member</Table.Head>
      <Table.Head>Role</Table.Head>
      <Table.Head>Status</Table.Head>
      <Table.Head className="w-10" />
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {members.map((member, index) => (
      <React.Fragment key={member.id}>
        {index > 0 && <Table.RowDivider />}
        <Table.Row>
          <Table.Cell>
            <div className="flex items-center gap-3">
              <Avatar.Root size="32" color="blue">
                <Avatar.Image src={member.avatar} alt={member.name} />
              </Avatar.Root>
              <div>
                <p className="text-label-sm text-text-strong-950">{member.name}</p>
                <p className="text-paragraph-xs text-text-sub-600">{member.email}</p>
              </div>
            </div>
          </Table.Cell>
          <Table.Cell>
            <Badge.Root variant="lighter" color="blue" size="medium">
              {member.role}
            </Badge.Root>
          </Table.Cell>
          <Table.Cell>
            <StatusBadge.Root variant="light" status={member.status}>
              <StatusBadge.Dot />
              {member.statusLabel}
            </StatusBadge.Root>
          </Table.Cell>
          <Table.Cell>
            <CompactButton.Root variant="ghost" size="large">
              <CompactButton.Icon as={RiMoreLine} />
            </CompactButton.Root>
          </Table.Cell>
        </Table.Row>
      </React.Fragment>
    ))}
  </Table.Body>
</Table.Root>
```

### Table with TanStack Table (sorting + pagination)

```tsx
'use client';

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import * as Table from '@/components/ui/table';
import * as Button from '@/components/ui/button';
import { RiArrowUpSLine, RiArrowDownSLine } from '@remixicon/react';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
];

function UsersTable({ data }: { data: User[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <Table.Root>
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.Head
                  key={header.id}
                  className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' && (
                      <RiArrowUpSLine className="size-4" />
                    )}
                    {header.column.getIsSorted() === 'desc' && (
                      <RiArrowDownSLine className="size-4" />
                    )}
                  </div>
                </Table.Head>
              ))}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.map((row, index) => (
            <React.Fragment key={row.id}>
              {index > 0 && <Table.RowDivider />}
              <Table.Row>
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            </React.Fragment>
          ))}
        </Table.Body>
      </Table.Root>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-paragraph-sm text-text-sub-600">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </p>
        <div className="flex items-center gap-2">
          <Button.Root
            variant="neutral"
            mode="stroke"
            size="xsmall"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            Previous
          </Button.Root>
          <Button.Root
            variant="neutral"
            mode="stroke"
            size="xsmall"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            Next
          </Button.Root>
        </div>
      </div>
    </div>
  );
}
```

### Empty state table

```tsx
import * as Table from '@/components/ui/table';

<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.Head>Name</Table.Head>
      <Table.Head>Email</Table.Head>
      <Table.Head>Role</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.Cell colSpan={3}>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-label-sm text-text-strong-950">No members yet</p>
          <p className="text-paragraph-xs text-text-sub-600">
            Invite team members to get started.
          </p>
        </div>
      </Table.Cell>
    </Table.Row>
  </Table.Body>
</Table.Root>
```

### Table with clickable rows

```tsx
import { useRouter } from 'next/navigation';
import * as Table from '@/components/ui/table';

function ClickableTable({ projects }: { projects: Project[] }) {
  const router = useRouter();

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>Project</Table.Head>
          <Table.Head>Created</Table.Head>
          <Table.Head>Status</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {projects.map((project, index) => (
          <React.Fragment key={project.id}>
            {index > 0 && <Table.RowDivider />}
            <Table.Row
              className="cursor-pointer"
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <Table.Cell>
                <p className="text-label-sm text-text-strong-950">{project.name}</p>
              </Table.Cell>
              <Table.Cell>
                <p className="text-paragraph-sm text-text-sub-600">{project.createdAt}</p>
              </Table.Cell>
              <Table.Cell>
                <StatusBadge.Root variant="stroke" status={project.status}>
                  <StatusBadge.Dot />
                  {project.statusLabel}
                </StatusBadge.Root>
              </Table.Cell>
            </Table.Row>
          </React.Fragment>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
```

## Common Patterns

### Table header with actions

```tsx
<div className="flex items-center justify-between pb-4">
  <div>
    <h2 className="text-label-lg text-text-strong-950">Team Members</h2>
    <p className="text-paragraph-sm text-text-sub-600">Manage your team members and their roles.</p>
  </div>
  <Button.Root variant="primary" mode="filled" size="medium">
    <Button.Icon as={RiAddLine} />
    Add Member
  </Button.Root>
</div>
<Table.Root>
  {/* Table content */}
</Table.Root>
```

### Table with search + filter bar

```tsx
<div className="flex items-center gap-3 pb-4">
  <Input.Root size="small" className="max-w-xs">
    <Input.Wrapper>
      <Input.Icon as={RiSearchLine} />
      <Input.Input placeholder="Search members..." />
    </Input.Wrapper>
  </Input.Root>
  <Select.Root variant="compact" size="small">
    <Select.Trigger>
      <Select.Value placeholder="All roles" />
    </Select.Trigger>
    <Select.Content>
      <Select.Item value="all">All roles</Select.Item>
      <Select.Item value="admin">Admin</Select.Item>
      <Select.Item value="editor">Editor</Select.Item>
    </Select.Content>
  </Select.Root>
</div>
<Table.Root>
  {/* Table content */}
</Table.Root>
```

## Rules

1. NEVER create custom table HTML with manual styling. Always use AlignUI Table.
2. NEVER modify files in `/components/ui/`.
3. Always use the namespace import: `import * as Table from '@/components/ui/table'`.
4. Use `Table.RowDivider` between rows instead of CSS borders.
5. Each `Table.Cell` has `h-16` (64px) height by default. Override with `className` if needed.
6. Cells get `group-hover/row:bg-bg-weak-50` automatically on row hover.
7. Use `Table.Head` for column headers. It has `bg-bg-weak-50` background.
8. For sortable columns with TanStack Table, add sort indicators in `Table.Head`.
9. For empty states, use a single `Table.Cell` with `colSpan` spanning all columns.
10. Wrap rich content (avatar + text, badges, buttons) in flex containers inside cells.

## Related Skills

- `badge.md` -- Status indicators in table cells
- `avatar.md` -- User avatars in table cells
- `dropdown.md` -- Row action menus
- `drawer.md` -- Detail views triggered from row clicks
- `button.md` -- Action buttons and pagination controls
