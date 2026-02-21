# AlignUI Modal (Dialog) Component

## When to Use

Use Modal for focused interactions that require user attention: confirmation dialogs, short forms, alerts, detail views, and any content that should overlay the current page. Modals block interaction with the background until dismissed.

For side panels or longer detail views, use Drawer instead.

## Import Pattern

```tsx
import * as Modal from '@/components/ui/modal';
```

## Parts

| Part | Description |
|------|-------------|
| `Modal.Root` | Radix Dialog root. Controls open/close state. |
| `Modal.Trigger` | Element that opens the modal when clicked. |
| `Modal.Close` | Element that closes the modal when clicked. |
| `Modal.Portal` | Portals content to document body. (Used internally by Content.) |
| `Modal.Overlay` | Backdrop overlay with blur effect and fade animation. (Used internally by Content.) |
| `Modal.Content` | The modal panel. Centered, animated, includes Portal + Overlay automatically. |
| `Modal.Header` | Header section with optional icon, title, and description. Has bottom border. |
| `Modal.Title` | Dialog title text. `text-label-sm text-text-strong-950`. |
| `Modal.Description` | Dialog description text. `text-paragraph-xs text-text-sub-600`. |
| `Modal.Body` | Main content area with `p-5` padding. |
| `Modal.Footer` | Footer with flex layout, top border. For action buttons. |

## Props

### Root Props

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `open` | `boolean` | -- | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | -- | Callback when open state changes |
| `defaultOpen` | `boolean` | `false` | Uncontrolled default open state |
| `modal` | `boolean` | `true` | Whether to block interaction with outside elements |

### Content Props

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `showClose` | `boolean` | `true` | Show the X close button in top-right corner |
| `overlayClassName` | `string` | -- | Additional classes for the overlay |
| `className` | `string` | -- | Additional classes for the content panel |

Default max-width: `max-w-[400px]`. Override with `className` for wider modals.

### Header Props (Shorthand)

| Prop | Values | Description |
|------|--------|-------------|
| `icon` | `RemixiconComponentType` | Icon displayed in a circular container |
| `title` | `string` | Title text |
| `description` | `string` | Description text |

You can use these shorthand props OR pass children to Header for full customization.

## Complete Usage Examples

### Basic modal with trigger

```tsx
import * as Modal from '@/components/ui/modal';
import * as Button from '@/components/ui/button';
import { RiAddLine } from '@remixicon/react';

<Modal.Root>
  <Modal.Trigger asChild>
    <Button.Root variant="primary" mode="filled">
      <Button.Icon as={RiAddLine} />
      Create Project
    </Button.Root>
  </Modal.Trigger>

  <Modal.Content>
    <Modal.Header title="Create Project" description="Add a new project to your workspace." />
    <Modal.Body>
      {/* Form content */}
    </Modal.Body>
    <Modal.Footer>
      <Modal.Close asChild>
        <Button.Root variant="neutral" mode="stroke" size="medium">
          Cancel
        </Button.Root>
      </Modal.Close>
      <Button.Root variant="primary" mode="filled" size="medium">
        Create
      </Button.Root>
    </Modal.Footer>
  </Modal.Content>
</Modal.Root>
```

### Controlled modal

```tsx
'use client';

import { useState } from 'react';
import * as Modal from '@/components/ui/modal';
import * as Button from '@/components/ui/button';

function ControlledModal() {
  const [open, setOpen] = useState(false);

  const handleCreate = async () => {
    await createProject();
    setOpen(false);
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root variant="primary" mode="filled">
          Create
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content>
        <Modal.Header title="Create Project" />
        <Modal.Body>
          <p className="text-paragraph-sm text-text-sub-600">
            This will create a new project in your workspace.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button.Root variant="neutral" mode="stroke" size="medium" onClick={() => setOpen(false)}>
            Cancel
          </Button.Root>
          <Button.Root variant="primary" mode="filled" size="medium" onClick={handleCreate}>
            Create
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
```

### Modal with header icon

```tsx
import * as Modal from '@/components/ui/modal';
import * as Button from '@/components/ui/button';
import { RiDeleteBinLine } from '@remixicon/react';

<Modal.Root>
  <Modal.Trigger asChild>
    <Button.Root variant="error" mode="filled">
      Delete
    </Button.Root>
  </Modal.Trigger>

  <Modal.Content>
    <Modal.Header
      icon={RiDeleteBinLine}
      title="Delete Project"
      description="This action cannot be undone. All data will be permanently removed."
    />
    <Modal.Footer>
      <Modal.Close asChild>
        <Button.Root variant="neutral" mode="stroke" size="medium">
          Cancel
        </Button.Root>
      </Modal.Close>
      <Button.Root variant="error" mode="filled" size="medium">
        Delete
      </Button.Root>
    </Modal.Footer>
  </Modal.Content>
</Modal.Root>
```

### Modal with custom header children

```tsx
import * as Modal from '@/components/ui/modal';

<Modal.Content>
  <Modal.Header>
    <div className="flex-1 space-y-1">
      <Modal.Title>Custom Header</Modal.Title>
      <Modal.Description>With custom layout and additional elements.</Modal.Description>
    </div>
  </Modal.Header>
  <Modal.Body>
    {/* Content */}
  </Modal.Body>
</Modal.Content>
```

### Modal with form

```tsx
'use client';

import { useState } from 'react';
import * as Modal from '@/components/ui/modal';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import { RiEditLine } from '@remixicon/react';

function EditProjectModal({ project }: { project: { name: string } }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(project.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProject({ name });
    setOpen(false);
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root variant="neutral" mode="stroke" size="small">
          <Button.Icon as={RiEditLine} />
          Edit
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content>
        <form onSubmit={handleSubmit}>
          <Modal.Header
            icon={RiEditLine}
            title="Edit Project"
            description="Update the project details."
          />
          <Modal.Body>
            <div className="space-y-1">
              <label className="text-label-sm text-text-strong-950">Project Name</label>
              <Input.Root size="medium">
                <Input.Wrapper>
                  <Input.Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter project name"
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>
          </Modal.Body>
          <Modal.Footer>
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
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
```

### Wide modal

```tsx
<Modal.Content className="max-w-[560px]">
  <Modal.Header title="Large Modal" />
  <Modal.Body>
    {/* Content that needs more horizontal space */}
  </Modal.Body>
</Modal.Content>
```

### Modal without close button

```tsx
<Modal.Content showClose={false}>
  <Modal.Header title="Mandatory Action" description="You must complete this step." />
  <Modal.Body>
    {/* Content */}
  </Modal.Body>
  <Modal.Footer>
    <Button.Root variant="primary" mode="filled" size="medium">
      Confirm
    </Button.Root>
  </Modal.Footer>
</Modal.Content>
```

## Common Patterns

### Confirmation dialog

```tsx
<Modal.Content>
  <Modal.Header
    icon={RiAlertLine}
    title="Are you sure?"
    description="This action cannot be undone."
  />
  <Modal.Footer>
    <Modal.Close asChild>
      <Button.Root variant="neutral" mode="stroke" size="medium">
        Cancel
      </Button.Root>
    </Modal.Close>
    <Button.Root variant="error" mode="filled" size="medium" onClick={onConfirm}>
      Confirm
    </Button.Root>
  </Modal.Footer>
</Modal.Content>
```

### Success/info modal (no footer)

```tsx
<Modal.Content>
  <Modal.Header
    icon={RiCheckLine}
    title="Project Created"
    description="Your project has been successfully created."
  />
  <Modal.Body>
    <p className="text-paragraph-sm text-text-sub-600">
      You can now start adding tasks and inviting team members.
    </p>
  </Modal.Body>
</Modal.Content>
```

## Rules

1. NEVER create custom dialog/overlay implementations. Always use AlignUI Modal.
2. NEVER modify files in `/components/ui/`.
3. Always use the namespace import: `import * as Modal from '@/components/ui/modal'`.
4. Use `Modal.Trigger` with `asChild` to wrap existing buttons as triggers.
5. Use `Modal.Close` with `asChild` for cancel/close buttons inside the modal.
6. The Content component already includes Portal and Overlay -- do not add them separately.
7. Use the Header shorthand props (`icon`, `title`, `description`) for standard headers.
8. Place action buttons in `Modal.Footer` with cancel on the left, primary action on the right.
9. For forms inside modals, wrap the form around `Header + Body + Footer` inside Content.
10. Default max-width is 400px. Use `className="max-w-[560px]"` on Content for wider modals.

## Related Skills

- `button.md` -- Action buttons in modal footers
- `input.md` -- Form fields inside modal body
- `drawer.md` -- Alternative for side panels and longer content
