# Tooltip

## When to use

- Display supplementary information on hover/focus for icons, truncated text, or actions
- Provide context for icon-only buttons
- Show keyboard shortcut hints
- Explain form field requirements

## Import

```tsx
import * as Tooltip from '@/components/ui/tooltip';
```

## Setup

`TooltipProvider` is already mounted in `app/providers.tsx`. You do NOT need to add it again. Just use `Tooltip.Root`, `Tooltip.Trigger`, and `Tooltip.Content` directly.

## Parts

| Part | Description |
|------|------------|
| `Tooltip.Root` | Wraps the trigger and content. Manages open/close state. |
| `Tooltip.Trigger` | The element that triggers the tooltip on hover/focus. Renders as `asChild` by default. |
| `Tooltip.Content` | The tooltip popup. Accepts `variant`, `size`, and `side` props. |

## Basic Usage

```tsx
import * as Tooltip from '@/components/ui/tooltip';
import { RiInformationLine } from '@remixicon/react';

<Tooltip.Root>
  <Tooltip.Trigger asChild>
    <button>
      <RiInformationLine className="size-5" />
    </button>
  </Tooltip.Trigger>
  <Tooltip.Content>
    This is helpful information
  </Tooltip.Content>
</Tooltip.Root>
```

## Variants

| Variant | Description | Default |
|---------|------------|---------|
| `dark` | Dark background (`bg-bg-strong-950`), white text | Yes |
| `light` | White background, dark text, soft ring border | No |

```tsx
// Dark tooltip (default)
<Tooltip.Content variant="dark">Dark tooltip</Tooltip.Content>

// Light tooltip
<Tooltip.Content variant="light">Light tooltip</Tooltip.Content>
```

## Sizes

| Size | Description | Default |
|------|------------|---------|
| `xsmall` | Smallest, `text-paragraph-xs`, minimal padding | No |
| `small` | Standard, `text-paragraph-sm` | Yes |
| `medium` | Largest, `text-label-sm`, more padding | No |

```tsx
<Tooltip.Content size="xsmall">Tiny hint</Tooltip.Content>
<Tooltip.Content size="small">Standard tooltip</Tooltip.Content>
<Tooltip.Content size="medium">Detailed tooltip with more content</Tooltip.Content>
```

## Props (Content)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'dark' \| 'light'` | `'dark'` | Visual style |
| `size` | `'xsmall' \| 'small' \| 'medium'` | `'small'` | Size of the tooltip |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | Placement relative to trigger |
| `sideOffset` | `number` | `4` | Distance from the trigger in pixels |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Alignment along the side |

## Common Patterns

### Icon button with tooltip

```tsx
import * as Tooltip from '@/components/ui/tooltip';
import * as Button from '@/components/ui/button';
import { RiDeleteBinLine } from '@remixicon/react';

<Tooltip.Root>
  <Tooltip.Trigger asChild>
    <Button.Root variant="neutral" mode="ghost" size="sm">
      <Button.Icon as={RiDeleteBinLine} />
    </Button.Root>
  </Tooltip.Trigger>
  <Tooltip.Content side="bottom">Delete item</Tooltip.Content>
</Tooltip.Root>
```

### Tooltip with keyboard shortcut

```tsx
import * as Tooltip from '@/components/ui/tooltip';
import { Kbd as KBD } from '@/components/ui/kbd';

<Tooltip.Root>
  <Tooltip.Trigger asChild>
    <button>Save</button>
  </Tooltip.Trigger>
  <Tooltip.Content size="medium">
    <div className="flex items-center gap-2">
      <span>Save changes</span>
      <KBD.Root>Ctrl+S</KBD.Root>
    </div>
  </Tooltip.Content>
</Tooltip.Root>
```

### Controlled open state

```tsx
const [open, setOpen] = React.useState(false);

<Tooltip.Root open={open} onOpenChange={setOpen}>
  <Tooltip.Trigger asChild>
    <button>Hover me</button>
  </Tooltip.Trigger>
  <Tooltip.Content>Controlled tooltip</Tooltip.Content>
</Tooltip.Root>
```

## Rules

- ALWAYS use `asChild` on `Tooltip.Trigger` when wrapping an existing interactive element (button, link)
- DO NOT add `TooltipProvider` -- it is already in `app/providers.tsx`
- Use `dark` variant by default; use `light` only when the tooltip is over a dark background
- Use `small` size for short text, `medium` for multiline or complex content
- Tooltip content must be concise -- use a Popover for long or interactive content
- The component requires `'use client'` in any file that uses it interactively

## Related Skills

- `icons.md` -- Icons frequently paired with tooltips
- `design-tokens.md` -- Color tokens used in tooltip variants
