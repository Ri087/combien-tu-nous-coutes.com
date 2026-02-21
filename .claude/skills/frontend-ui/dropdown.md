# AlignUI Dropdown Component

## When to Use

Use Dropdown for contextual action menus triggered by a button click: row actions in tables, user account menus, "more options" menus, context menus, and any list of actions that should appear on demand.

For value selection (picking one option from a list), use Select instead. Dropdowns are for actions, Selects are for values.

## Import Pattern

```tsx
import * as Dropdown from '@/components/ui/dropdown';
```

**Note:** This is a `'use client'` component. It must be used inside a Client Component.

## Parts

| Part | Description |
|------|-------------|
| `Dropdown.Root` | Radix DropdownMenu root. Controls open/close state. |
| `Dropdown.Trigger` | Element that opens the dropdown when clicked. |
| `Dropdown.Portal` | Portals content to document body. (Used internally by Content.) |
| `Dropdown.Content` | The dropdown panel. Portaled, animated. Default width `w-[300px]`. |
| `Dropdown.Item` | A clickable menu item. |
| `Dropdown.ItemIcon` | Polymorphic icon inside an Item. Use `as={RiIconName}`. |
| `Dropdown.Group` | Groups related items together with flex gap. |
| `Dropdown.Label` | Group label. Uppercase subheading text. |
| `Dropdown.MenuSub` | Submenu root. For nested menus. |
| `Dropdown.MenuSubTrigger` | Item that opens a submenu on hover. Shows right arrow automatically. |
| `Dropdown.MenuSubContent` | Submenu content panel. |
| `Dropdown.CheckboxItem` | Item with checkbox behavior (checked/unchecked). |
| `Dropdown.RadioGroup` | Group for radio items (single selection). |
| `Dropdown.RadioItem` | Item with radio behavior (one selected at a time). |
| `Dropdown.Separator` | Visual divider between items/groups. |
| `Dropdown.Arrow` | Optional arrow pointing to the trigger. |

## Props

### Root Props

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `open` | `boolean` | -- | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | -- | Callback when open state changes |
| `defaultOpen` | `boolean` | `false` | Uncontrolled default open state |
| `modal` | `boolean` | `true` | Whether to trap focus |

### Content Props

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `side` | `'top'` \| `'right'` \| `'bottom'` \| `'left'` | `'bottom'` | Placement side |
| `align` | `'start'` \| `'center'` \| `'end'` | `'center'` | Alignment on the side |
| `sideOffset` | `number` | `8` | Offset from trigger (px) |
| `className` | `string` | -- | Override default width with custom class |

### Item Props

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `inset` | `boolean` | `false` | Add left padding (align with items that have icons) |
| `disabled` | `boolean` | `false` | Disable this item |
| `onSelect` | `(event) => void` | -- | Callback when item is selected |

## Complete Usage Examples

### Basic dropdown with trigger

```tsx
import * as Dropdown from '@/components/ui/dropdown';
import * as CompactButton from '@/components/ui/compact-button';
import {
  RiMoreLine,
  RiEditLine,
  RiFileCopyLine,
  RiDeleteBinLine,
} from '@remixicon/react';

<Dropdown.Root>
  <Dropdown.Trigger asChild>
    <CompactButton.Root variant="ghost" size="large">
      <CompactButton.Icon as={RiMoreLine} />
    </CompactButton.Root>
  </Dropdown.Trigger>

  <Dropdown.Content align="end">
    <Dropdown.Item onSelect={handleEdit}>
      <Dropdown.ItemIcon as={RiEditLine} />
      Edit
    </Dropdown.Item>
    <Dropdown.Item onSelect={handleDuplicate}>
      <Dropdown.ItemIcon as={RiFileCopyLine} />
      Duplicate
    </Dropdown.Item>
    <Dropdown.Separator />
    <Dropdown.Item onSelect={handleDelete} className="text-error-base">
      <Dropdown.ItemIcon as={RiDeleteBinLine} className="text-error-base" />
      Delete
    </Dropdown.Item>
  </Dropdown.Content>
</Dropdown.Root>
```

### Dropdown with groups and labels

```tsx
import * as Dropdown from '@/components/ui/dropdown';
import * as Button from '@/components/ui/button';
import {
  RiAddLine,
  RiFileTextLine,
  RiFolderLine,
  RiUploadLine,
  RiLinkLine,
} from '@remixicon/react';

<Dropdown.Root>
  <Dropdown.Trigger asChild>
    <Button.Root variant="primary" mode="filled" size="medium">
      <Button.Icon as={RiAddLine} />
      Create New
    </Button.Root>
  </Dropdown.Trigger>

  <Dropdown.Content align="start">
    <Dropdown.Group>
      <Dropdown.Label>Documents</Dropdown.Label>
      <Dropdown.Item onSelect={handleCreateDoc}>
        <Dropdown.ItemIcon as={RiFileTextLine} />
        New Document
      </Dropdown.Item>
      <Dropdown.Item onSelect={handleCreateFolder}>
        <Dropdown.ItemIcon as={RiFolderLine} />
        New Folder
      </Dropdown.Item>
    </Dropdown.Group>
    <Dropdown.Separator />
    <Dropdown.Group>
      <Dropdown.Label>Import</Dropdown.Label>
      <Dropdown.Item onSelect={handleUpload}>
        <Dropdown.ItemIcon as={RiUploadLine} />
        Upload File
      </Dropdown.Item>
      <Dropdown.Item onSelect={handleImportUrl}>
        <Dropdown.ItemIcon as={RiLinkLine} />
        Import from URL
      </Dropdown.Item>
    </Dropdown.Group>
  </Dropdown.Content>
</Dropdown.Root>
```

### Dropdown with submenu

```tsx
import * as Dropdown from '@/components/ui/dropdown';
import {
  RiMoreLine,
  RiShareLine,
  RiMailLine,
  RiTwitterXLine,
  RiLinksLine,
} from '@remixicon/react';

<Dropdown.Root>
  <Dropdown.Trigger asChild>
    <CompactButton.Root variant="ghost" size="large">
      <CompactButton.Icon as={RiMoreLine} />
    </CompactButton.Root>
  </Dropdown.Trigger>

  <Dropdown.Content>
    <Dropdown.MenuSub>
      <Dropdown.MenuSubTrigger>
        <Dropdown.ItemIcon as={RiShareLine} />
        Share
      </Dropdown.MenuSubTrigger>
      <Dropdown.MenuSubContent>
        <Dropdown.Item onSelect={handleEmail}>
          <Dropdown.ItemIcon as={RiMailLine} />
          Email
        </Dropdown.Item>
        <Dropdown.Item onSelect={handleTwitter}>
          <Dropdown.ItemIcon as={RiTwitterXLine} />
          Twitter
        </Dropdown.Item>
        <Dropdown.Item onSelect={handleCopyLink}>
          <Dropdown.ItemIcon as={RiLinksLine} />
          Copy Link
        </Dropdown.Item>
      </Dropdown.MenuSubContent>
    </Dropdown.MenuSub>
  </Dropdown.Content>
</Dropdown.Root>
```

### Dropdown with checkbox items

```tsx
'use client';

import { useState } from 'react';
import * as Dropdown from '@/components/ui/dropdown';
import * as Button from '@/components/ui/button';
import { RiFilterLine } from '@remixicon/react';

function FilterDropdown() {
  const [showActive, setShowActive] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <Button.Root variant="neutral" mode="stroke" size="small">
          <Button.Icon as={RiFilterLine} />
          Filter
        </Button.Root>
      </Dropdown.Trigger>

      <Dropdown.Content align="end" className="w-[200px]">
        <Dropdown.Label>Show</Dropdown.Label>
        <Dropdown.CheckboxItem
          checked={showActive}
          onCheckedChange={setShowActive}
        >
          Active projects
        </Dropdown.CheckboxItem>
        <Dropdown.CheckboxItem
          checked={showArchived}
          onCheckedChange={setShowArchived}
        >
          Archived projects
        </Dropdown.CheckboxItem>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
```

### Dropdown with radio items

```tsx
'use client';

import { useState } from 'react';
import * as Dropdown from '@/components/ui/dropdown';
import * as Button from '@/components/ui/button';
import { RiSortAsc } from '@remixicon/react';

function SortDropdown() {
  const [sortBy, setSortBy] = useState('date');

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <Button.Root variant="neutral" mode="stroke" size="small">
          <Button.Icon as={RiSortAsc} />
          Sort
        </Button.Root>
      </Dropdown.Trigger>

      <Dropdown.Content align="end" className="w-[200px]">
        <Dropdown.Label>Sort by</Dropdown.Label>
        <Dropdown.RadioGroup value={sortBy} onValueChange={setSortBy}>
          <Dropdown.RadioItem value="date">Date created</Dropdown.RadioItem>
          <Dropdown.RadioItem value="name">Name</Dropdown.RadioItem>
          <Dropdown.RadioItem value="updated">Last updated</Dropdown.RadioItem>
        </Dropdown.RadioGroup>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
```

### User account dropdown

```tsx
import * as Dropdown from '@/components/ui/dropdown';
import * as Avatar from '@/components/ui/avatar';
import {
  RiUserLine,
  RiSettings4Line,
  RiLogoutBoxLine,
  RiMoonLine,
} from '@remixicon/react';

<Dropdown.Root>
  <Dropdown.Trigger asChild>
    <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-stroke-strong-950">
      <Avatar.Root size="32">
        <Avatar.Image src={user.avatar} alt={user.name} />
      </Avatar.Root>
    </button>
  </Dropdown.Trigger>

  <Dropdown.Content align="end">
    <div className="px-2 py-2">
      <p className="text-label-sm text-text-strong-950">{user.name}</p>
      <p className="text-paragraph-xs text-text-sub-600">{user.email}</p>
    </div>
    <Dropdown.Separator />
    <Dropdown.Item onSelect={handleProfile}>
      <Dropdown.ItemIcon as={RiUserLine} />
      Profile
    </Dropdown.Item>
    <Dropdown.Item onSelect={handleSettings}>
      <Dropdown.ItemIcon as={RiSettings4Line} />
      Settings
    </Dropdown.Item>
    <Dropdown.Item onSelect={handleThemeToggle}>
      <Dropdown.ItemIcon as={RiMoonLine} />
      Dark Mode
    </Dropdown.Item>
    <Dropdown.Separator />
    <Dropdown.Item onSelect={handleLogout} className="text-error-base">
      <Dropdown.ItemIcon as={RiLogoutBoxLine} className="text-error-base" />
      Sign Out
    </Dropdown.Item>
  </Dropdown.Content>
</Dropdown.Root>
```

### Dropdown with disabled items

```tsx
<Dropdown.Content>
  <Dropdown.Item onSelect={handleEdit}>
    <Dropdown.ItemIcon as={RiEditLine} />
    Edit
  </Dropdown.Item>
  <Dropdown.Item disabled>
    <Dropdown.ItemIcon as={RiArchiveLine} />
    Archive (no permission)
  </Dropdown.Item>
  <Dropdown.Separator />
  <Dropdown.Item onSelect={handleDelete} className="text-error-base">
    <Dropdown.ItemIcon as={RiDeleteBinLine} className="text-error-base" />
    Delete
  </Dropdown.Item>
</Dropdown.Content>
```

### Custom width dropdown

```tsx
<Dropdown.Content className="w-[240px]">
  {/* Narrower dropdown content */}
</Dropdown.Content>

<Dropdown.Content className="w-[400px]">
  {/* Wider dropdown content */}
</Dropdown.Content>
```

## Common Patterns

### Table row actions

```tsx
<Table.Cell>
  <Dropdown.Root>
    <Dropdown.Trigger asChild>
      <CompactButton.Root variant="ghost" size="large">
        <CompactButton.Icon as={RiMoreLine} />
      </CompactButton.Root>
    </Dropdown.Trigger>
    <Dropdown.Content align="end">
      <Dropdown.Item onSelect={() => handleEdit(row.id)}>
        <Dropdown.ItemIcon as={RiEditLine} />
        Edit
      </Dropdown.Item>
      <Dropdown.Item onSelect={() => handleDuplicate(row.id)}>
        <Dropdown.ItemIcon as={RiFileCopyLine} />
        Duplicate
      </Dropdown.Item>
      <Dropdown.Separator />
      <Dropdown.Item
        onSelect={() => handleDelete(row.id)}
        className="text-error-base"
      >
        <Dropdown.ItemIcon as={RiDeleteBinLine} className="text-error-base" />
        Delete
      </Dropdown.Item>
    </Dropdown.Content>
  </Dropdown.Root>
</Table.Cell>
```

### Toolbar action dropdown

```tsx
<div className="flex items-center gap-2">
  <Button.Root variant="primary" mode="filled" size="small">
    Save
  </Button.Root>
  <Dropdown.Root>
    <Dropdown.Trigger asChild>
      <Button.Root variant="neutral" mode="stroke" size="small">
        <Button.Icon as={RiArrowDownSLine} />
      </Button.Root>
    </Dropdown.Trigger>
    <Dropdown.Content align="end">
      <Dropdown.Item onSelect={handleSaveAsDraft}>Save as Draft</Dropdown.Item>
      <Dropdown.Item onSelect={handleSaveAndPublish}>Save & Publish</Dropdown.Item>
      <Dropdown.Item onSelect={handleSchedule}>Schedule</Dropdown.Item>
    </Dropdown.Content>
  </Dropdown.Root>
</div>
```

## Rules

1. NEVER create custom dropdown/popover menus. Always use AlignUI Dropdown.
2. NEVER modify files in `/components/ui/`.
3. Always use the namespace import: `import * as Dropdown from '@/components/ui/dropdown'`.
4. Use `Dropdown.Trigger` with `asChild` to wrap buttons/icons as triggers.
5. Use `Dropdown.ItemIcon` for icons in items, not raw icon components.
6. Use `onSelect` on `Dropdown.Item` for action callbacks (not `onClick`).
7. Content auto-portals. Do not wrap in a Portal manually.
8. Default Content width is `w-[300px]`. Override with `className` as needed.
9. For destructive items, add `className="text-error-base"` to both the Item and its ItemIcon.
10. Use `CompactButton` with `RiMoreLine` as the standard "more actions" trigger.
11. For value selection (not actions), use Select component instead.
12. Use `Dropdown.Separator` between logical groups of items.
13. Use `Dropdown.Label` for group headings. It renders as uppercase subheading text.

## Related Skills

- `select.md` -- For value selection (not action menus)
- `button.md` -- Trigger buttons for dropdowns
- `table.md` -- Row action dropdowns
- `avatar.md` -- User menu with avatar trigger
