# AlignUI Badge & StatusBadge Components

## When to Use

Use **Badge** for labeling, categorization, and tagging: feature labels, category indicators, count indicators, tag chips, and color-coded classifications.

Use **StatusBadge** specifically for workflow/process states: completed, pending, failed, disabled. It provides semantic status colors and layout optimized for status display.

## Import Patterns

```tsx
import * as Badge from '@/components/ui/badge';
import * as StatusBadge from '@/components/ui/status-badge';
```

---

## Badge

### Parts

| Part | Description |
|------|-------------|
| `Badge.Root` | The badge container. Inline-flex, pill-shaped (rounded-full). |
| `Badge.Icon` | Polymorphic icon. Use `as={RiIconName}`. |
| `Badge.Dot` | A small circular dot indicator (uses `before:` pseudo-element). |

### Props on Root

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `variant` | `'filled'` \| `'light'` \| `'lighter'` \| `'stroke'` | `'filled'` | Visual style |
| `size` | `'small'` \| `'medium'` | `'small'` | Badge height (16px/20px) |
| `color` | `'gray'` \| `'blue'` \| `'orange'` \| `'red'` \| `'green'` \| `'yellow'` \| `'purple'` \| `'sky'` \| `'pink'` \| `'teal'` | `'gray'` | Color scheme |
| `disabled` | `boolean` | `false` | Disabled appearance |
| `square` | `boolean` | `false` | Equal width/height for number badges |
| `asChild` | `boolean` | `false` | Render as child element |

### Variant Guide

| Variant | Appearance | Use Case |
|---------|------------|----------|
| `filled` | Solid color bg, white text | High emphasis, primary labels |
| `light` | Medium color bg, dark text | Medium emphasis |
| `lighter` | Light color bg, base color text | Low emphasis, subtle labels |
| `stroke` | Border only, colored text | Minimal emphasis, outlined tags |

### Color Semantic Guide

| Color | Semantic | Use For |
|-------|----------|---------|
| `gray` | Neutral, default | Generic labels, inactive states |
| `blue` | Information | Info badges, links, types |
| `green` | Success | Active, online, complete |
| `red` | Error/danger | Errors, critical, removed |
| `orange` | Warning | Warnings, attention needed |
| `yellow` | Away/caution | Pending, paused |
| `purple` | Feature | Feature flags, premium |
| `sky` | Verified | Verified, trusted |
| `pink` | Highlighted | Highlighted, special |
| `teal` | Stable | Stable, balanced |

### Complete Usage Examples

```tsx
import * as Badge from '@/components/ui/badge';
import { RiStarLine, RiFlashlightLine } from '@remixicon/react';

// Basic filled badge
<Badge.Root variant="filled" color="blue" size="small">
  New
</Badge.Root>

// Medium size with icon
<Badge.Root variant="light" color="green" size="medium">
  <Badge.Icon as={RiStarLine} />
  Featured
</Badge.Root>

// With dot indicator
<Badge.Root variant="lighter" color="orange" size="medium">
  <Badge.Dot />
  Pending
</Badge.Root>

// Stroke variant
<Badge.Root variant="stroke" color="purple" size="small">
  Premium
</Badge.Root>

// Number badge (square)
<Badge.Root variant="filled" color="red" size="small" square>
  5
</Badge.Root>

// Disabled
<Badge.Root variant="filled" color="blue" size="small" disabled>
  Disabled
</Badge.Root>

// All color examples (filled, small)
<Badge.Root variant="filled" color="gray" size="small">Gray</Badge.Root>
<Badge.Root variant="filled" color="blue" size="small">Blue</Badge.Root>
<Badge.Root variant="filled" color="orange" size="small">Orange</Badge.Root>
<Badge.Root variant="filled" color="red" size="small">Red</Badge.Root>
<Badge.Root variant="filled" color="green" size="small">Green</Badge.Root>
<Badge.Root variant="filled" color="yellow" size="small">Yellow</Badge.Root>
<Badge.Root variant="filled" color="purple" size="small">Purple</Badge.Root>
<Badge.Root variant="filled" color="sky" size="small">Sky</Badge.Root>
<Badge.Root variant="filled" color="pink" size="small">Pink</Badge.Root>
<Badge.Root variant="filled" color="teal" size="small">Teal</Badge.Root>
```

---

## StatusBadge

### Parts

| Part | Description |
|------|-------------|
| `StatusBadge.Root` | The status badge container. 24px height, rounded-md shape. |
| `StatusBadge.Icon` | Polymorphic status icon. Use `as={RiIconName}`. Colored by status. |
| `StatusBadge.Dot` | A circular dot indicator. Colored by status. |

### Props on Root

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `variant` | `'stroke'` \| `'light'` | `'stroke'` | Visual style |
| `status` | `'completed'` \| `'pending'` \| `'failed'` \| `'disabled'` | `'disabled'` | Status type (determines icon/dot color) |
| `asChild` | `boolean` | `false` | Render as child element |

### Status Color Mapping

| Status | Color | Use For |
|--------|-------|---------|
| `completed` | Green (success) | Done, approved, active |
| `pending` | Orange (warning) | In progress, waiting, review |
| `failed` | Red (error) | Failed, rejected, error |
| `disabled` | Gray (faded) | Disabled, archived, inactive |

### Complete Usage Examples

```tsx
import * as StatusBadge from '@/components/ui/status-badge';
import { RiCheckLine, RiTimeLine, RiCloseLine, RiSubtractLine } from '@remixicon/react';

// Stroke variant with dot
<StatusBadge.Root variant="stroke" status="completed">
  <StatusBadge.Dot />
  Completed
</StatusBadge.Root>

<StatusBadge.Root variant="stroke" status="pending">
  <StatusBadge.Dot />
  Pending
</StatusBadge.Root>

<StatusBadge.Root variant="stroke" status="failed">
  <StatusBadge.Dot />
  Failed
</StatusBadge.Root>

<StatusBadge.Root variant="stroke" status="disabled">
  <StatusBadge.Dot />
  Disabled
</StatusBadge.Root>

// Light variant with icon
<StatusBadge.Root variant="light" status="completed">
  <StatusBadge.Icon as={RiCheckLine} />
  Completed
</StatusBadge.Root>

<StatusBadge.Root variant="light" status="pending">
  <StatusBadge.Icon as={RiTimeLine} />
  In Review
</StatusBadge.Root>

<StatusBadge.Root variant="light" status="failed">
  <StatusBadge.Icon as={RiCloseLine} />
  Rejected
</StatusBadge.Root>

<StatusBadge.Root variant="light" status="disabled">
  <StatusBadge.Icon as={RiSubtractLine} />
  Archived
</StatusBadge.Root>

// Stroke variant with icon
<StatusBadge.Root variant="stroke" status="completed">
  <StatusBadge.Icon as={RiCheckLine} />
  Active
</StatusBadge.Root>
```

---

## Common Patterns

### Badge list (tags)

```tsx
<div className="flex flex-wrap gap-2">
  {tags.map((tag) => (
    <Badge.Root key={tag} variant="lighter" color="blue" size="small">
      {tag}
    </Badge.Root>
  ))}
</div>
```

### Status column in a table

```tsx
<Table.Cell>
  <StatusBadge.Root variant="stroke" status={row.status}>
    <StatusBadge.Dot />
    {row.statusLabel}
  </StatusBadge.Root>
</Table.Cell>
```

### Category badge with icon

```tsx
<Badge.Root variant="light" color="purple" size="medium">
  <Badge.Icon as={RiFlashlightLine} />
  Premium Feature
</Badge.Root>
```

### Notification count badge

```tsx
<div className="relative">
  <RiBellLine className="size-5 text-text-sub-600" />
  <Badge.Root
    variant="filled"
    color="red"
    size="small"
    square
    className="absolute -top-1.5 -right-1.5"
  >
    3
  </Badge.Root>
</div>
```

## Rules

1. NEVER create custom badge/pill elements. Always use AlignUI Badge or StatusBadge.
2. NEVER modify files in `/components/ui/`.
3. Use `Badge` for generic labels and categorization. Use `StatusBadge` for workflow states.
4. Use `Badge.Dot` or `StatusBadge.Dot` for simple dot indicators. Use Icon for richer indicators.
5. Match badge colors to semantic meaning (green=success, red=error, etc.).
6. Use `size="small"` for compact contexts (tables, lists). Use `size="medium"` for standalone badges.
7. Use `variant="lighter"` or `variant="stroke"` for subtle badges that do not dominate the layout.
8. Use `square` prop on Badge for number-only badges to maintain equal width/height.
9. StatusBadge has fixed height `h-6` (24px) and only 4 statuses. Do not try to add custom statuses.
10. Icons come from `@remixicon/react`.

## Related Skills

- `table.md` -- Status badges in table cells
- `avatar.md` -- Badges next to avatars
- `alert.md` -- For inline messages, use Alert instead of Badge
