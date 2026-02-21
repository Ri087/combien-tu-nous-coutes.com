# AlignUI Drawer Component

## When to Use

Use Drawer for side panel interactions: detail views, editing forms, settings panels, or any content that slides in from the right side of the screen. Drawers are best for content that is supplementary to the main view and may require scrolling.

For centered focused dialogs (confirmations, short forms), use Modal instead.

## Import Pattern

```tsx
import * as Drawer from '@/components/ui/drawer';
```

**Note:** This is a `'use client'` component. It must be used inside a Client Component.

## Parts

| Part | Description |
|------|-------------|
| `Drawer.Root` | Radix Dialog root. Controls open/close state. |
| `Drawer.Trigger` | Element that opens the drawer when clicked. |
| `Drawer.Close` | Element that closes the drawer when clicked. |
| `Drawer.Content` | The drawer panel. Slides in from the right. Includes Portal + Overlay. |
| `Drawer.Header` | Header with title area and optional close button. |
| `Drawer.Title` | The drawer title text. `text-label-lg text-text-strong-950`. |
| `Drawer.Body` | Scrollable content area. `flex-1` to fill remaining space. |
| `Drawer.Footer` | Bottom action bar with border separator. |

## Props

### Root Props

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `open` | `boolean` | -- | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | -- | Callback when open state changes |
| `defaultOpen` | `boolean` | `false` | Uncontrolled default open state |
| `modal` | `boolean` | `true` | Whether to block interaction with outside elements |

### Content Props

Standard HTML div attributes plus Radix Dialog Content props. Default max-width: `max-w-[400px]`. Override with `className`.

### Header Props

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `showCloseButton` | `boolean` | `true` | Show the X close button |

## Complete Usage Examples

### Basic drawer with trigger

```tsx
import * as Drawer from '@/components/ui/drawer';
import * as Button from '@/components/ui/button';
import { RiMenuLine } from '@remixicon/react';

<Drawer.Root>
  <Drawer.Trigger asChild>
    <Button.Root variant="neutral" mode="stroke" size="medium">
      <Button.Icon as={RiMenuLine} />
      View Details
    </Button.Root>
  </Drawer.Trigger>

  <Drawer.Content>
    <Drawer.Header>
      <Drawer.Title>Project Details</Drawer.Title>
    </Drawer.Header>
    <Drawer.Body>
      <div className="p-5">
        <p className="text-paragraph-sm text-text-sub-600">
          Project information goes here.
        </p>
      </div>
    </Drawer.Body>
    <Drawer.Footer>
      <Drawer.Close asChild>
        <Button.Root variant="neutral" mode="stroke" size="medium">
          Close
        </Button.Root>
      </Drawer.Close>
      <Button.Root variant="primary" mode="filled" size="medium">
        Save
      </Button.Root>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>
```

### Controlled drawer

```tsx
'use client';

import { useState } from 'react';
import * as Drawer from '@/components/ui/drawer';
import * as Button from '@/components/ui/button';

function ProjectDrawer({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button.Root variant="neutral" mode="ghost" size="small">
          Details
        </Button.Root>
      </Drawer.Trigger>

      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Project Details</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <div className="space-y-4 p-5">
            {/* Detail content */}
          </div>
        </Drawer.Body>
        <Drawer.Footer>
          <Button.Root
            variant="neutral"
            mode="stroke"
            size="medium"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button.Root>
          <Button.Root variant="primary" mode="filled" size="medium">
            Update
          </Button.Root>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer.Root>
  );
}
```

### Drawer with form

```tsx
'use client';

import { useState } from 'react';
import * as Drawer from '@/components/ui/drawer';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Select from '@/components/ui/select';

function EditDrawer() {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Save logic
    setOpen(false);
  };

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button.Root variant="neutral" mode="stroke" size="small">
          Edit
        </Button.Root>
      </Drawer.Trigger>

      <Drawer.Content>
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <Drawer.Header>
            <Drawer.Title>Edit Project</Drawer.Title>
          </Drawer.Header>

          <Drawer.Body>
            <div className="space-y-4 p-5">
              <div className="space-y-1">
                <label className="text-label-sm text-text-strong-950">Name</label>
                <Input.Root size="medium">
                  <Input.Wrapper>
                    <Input.Input placeholder="Project name" />
                  </Input.Wrapper>
                </Input.Root>
              </div>

              <div className="space-y-1">
                <label className="text-label-sm text-text-strong-950">Status</label>
                <Select.Root size="medium">
                  <Select.Trigger>
                    <Select.Value placeholder="Select status" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="active">Active</Select.Item>
                    <Select.Item value="paused">Paused</Select.Item>
                    <Select.Item value="completed">Completed</Select.Item>
                  </Select.Content>
                </Select.Root>
              </div>

              <div className="space-y-1">
                <label className="text-label-sm text-text-strong-950">Description</label>
                <Input.Root size="medium">
                  <Input.Wrapper>
                    <Input.Input placeholder="Project description" />
                  </Input.Wrapper>
                </Input.Root>
              </div>
            </div>
          </Drawer.Body>

          <Drawer.Footer>
            <Button.Root
              variant="neutral"
              mode="stroke"
              size="medium"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button.Root>
            <Button.Root variant="primary" mode="filled" size="medium" type="submit">
              Save Changes
            </Button.Root>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer.Root>
  );
}
```

### Drawer without close button

```tsx
<Drawer.Content>
  <Drawer.Header showCloseButton={false}>
    <Drawer.Title>Settings</Drawer.Title>
  </Drawer.Header>
  <Drawer.Body>
    {/* Content */}
  </Drawer.Body>
</Drawer.Content>
```

### Drawer with custom header

```tsx
<Drawer.Content>
  <Drawer.Header>
    <div className="flex flex-1 items-center gap-3">
      <Avatar.Root size="40">
        <Avatar.Image src="/user.jpg" alt="User" />
      </Avatar.Root>
      <div>
        <Drawer.Title>John Doe</Drawer.Title>
        <p className="text-paragraph-xs text-text-sub-600">john@example.com</p>
      </div>
    </div>
  </Drawer.Header>
  <Drawer.Body>
    {/* User details */}
  </Drawer.Body>
</Drawer.Content>
```

### Wide drawer

```tsx
<Drawer.Content className="max-w-[560px]">
  <Drawer.Header>
    <Drawer.Title>Wide Panel</Drawer.Title>
  </Drawer.Header>
  <Drawer.Body>
    {/* Content needing more space */}
  </Drawer.Body>
</Drawer.Content>
```

## Common Patterns

### Detail view drawer (read-only)

```tsx
<Drawer.Content>
  <Drawer.Header>
    <Drawer.Title>Order #12345</Drawer.Title>
  </Drawer.Header>
  <Drawer.Body>
    <div className="space-y-6 p-5">
      <div>
        <p className="text-subheading-xs text-text-soft-400 uppercase">Customer</p>
        <p className="text-paragraph-sm text-text-strong-950">John Doe</p>
      </div>
      <div>
        <p className="text-subheading-xs text-text-soft-400 uppercase">Amount</p>
        <p className="text-paragraph-sm text-text-strong-950">$249.00</p>
      </div>
      <div>
        <p className="text-subheading-xs text-text-soft-400 uppercase">Status</p>
        <StatusBadge.Root variant="light" status="completed">
          Completed
        </StatusBadge.Root>
      </div>
    </div>
  </Drawer.Body>
</Drawer.Content>
```

### Drawer with scrollable content

```tsx
<Drawer.Content>
  <Drawer.Header>
    <Drawer.Title>Activity Log</Drawer.Title>
  </Drawer.Header>
  <Drawer.Body className="overflow-y-auto">
    <div className="space-y-3 p-5">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3">
          {/* Activity items */}
        </div>
      ))}
    </div>
  </Drawer.Body>
</Drawer.Content>
```

## Rules

1. NEVER create custom side panel implementations. Always use AlignUI Drawer.
2. NEVER modify files in `/components/ui/`.
3. Always use the namespace import: `import * as Drawer from '@/components/ui/drawer'`.
4. Content already includes Portal + Overlay. Do not add them separately.
5. Drawer slides from the right side. Default max-width is 400px.
6. Use `Drawer.Body` for main content. It uses `flex-1` to fill available space.
7. Add padding (`p-5`) inside Drawer.Body as needed. Body itself has no padding.
8. For forms, wrap the form around Header + Body + Footer inside Content.
9. Place action buttons in Footer: cancel on left, primary action on right.
10. Use `showCloseButton={false}` on Header when the close button is not needed.

## Related Skills

- `modal.md` -- For centered focused dialogs
- `button.md` -- Action buttons in drawer footer
- `input.md` -- Form fields inside drawer body
- `table.md` -- Drawer for row detail views
