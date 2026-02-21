# Spacing and Layout

## When to use

- Every time you structure a page, section, or component layout
- Reference this guide for consistent spacing, grid, and container patterns
- Follow these patterns to match the AlignUI design system's visual rhythm

## Container Patterns

### Page container

```tsx
{/* Standard page content */}
<div className="mx-auto max-w-5xl px-5 py-6">
  {/* Page content */}
</div>
```

### Full-width page with sidebar

```tsx
<div className="flex min-h-screen">
  {/* Sidebar: fixed width */}
  <aside className="w-[272px] shrink-0 border-r border-stroke-soft-200">
    {/* Sidebar content */}
  </aside>

  {/* Main content: fills remaining space */}
  <main className="flex-1 overflow-auto">
    <div className="mx-auto max-w-5xl px-5 py-6">
      {/* Content */}
    </div>
  </main>
</div>
```

### Narrow content (forms, settings)

```tsx
<div className="mx-auto max-w-lg px-5 py-6">
  {/* Narrow form content */}
</div>
```

## Card Patterns

### Standard card

```tsx
<div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-4">
  {/* Card content */}
</div>
```

### Elevated card (with shadow)

```tsx
<div className="rounded-20 bg-bg-white-0 p-4 shadow-regular-md">
  {/* Elevated card content */}
</div>
```

### Compact card

```tsx
<div className="rounded-10 border border-stroke-soft-200 bg-bg-white-0 p-3">
  {/* Compact card content */}
</div>
```

### Card with header and body

```tsx
<div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0">
  <div className="border-b border-stroke-soft-200 px-4 py-3">
    <h3 className="text-label-sm text-text-strong-950">Card Title</h3>
  </div>
  <div className="p-4">
    {/* Card body */}
  </div>
</div>
```

## Flex Layouts

### Vertical stack (most common)

```tsx
{/* Tight spacing */}
<div className="flex flex-col gap-1">...</div>

{/* Standard spacing */}
<div className="flex flex-col gap-3">...</div>

{/* Section spacing */}
<div className="flex flex-col gap-4">...</div>

{/* Page section spacing */}
<div className="flex flex-col gap-6">...</div>

{/* Large section spacing */}
<div className="flex flex-col gap-8">...</div>
```

### Horizontal row

```tsx
{/* Aligned center (default for rows) */}
<div className="flex items-center gap-2">...</div>

{/* Space between (header pattern) */}
<div className="flex items-center justify-between">...</div>

{/* Wrap on overflow */}
<div className="flex flex-wrap items-center gap-2">...</div>
```

### Common flex patterns

```tsx
{/* Page header with action */}
<div className="flex items-center justify-between">
  <div className="flex flex-col gap-1">
    <h1 className="text-title-h5 text-text-strong-950">Projects</h1>
    <p className="text-paragraph-sm text-text-sub-600">Manage your projects</p>
  </div>
  <Button.Root variant="primary" size="md" mode="filled">
    <Button.Icon as={RiAddLine} />
    <span>New Project</span>
  </Button.Root>
</div>

{/* List item row */}
<div className="flex items-center gap-3 rounded-10 border border-stroke-soft-200 p-3">
  <Avatar.Root size="40" />
  <div className="flex flex-1 flex-col gap-0.5">
    <span className="text-label-sm text-text-strong-950">Item Name</span>
    <span className="text-paragraph-xs text-text-sub-600">Description</span>
  </div>
  <Button.Root variant="neutral" size="sm" mode="ghost">
    <Button.Icon as={RiMoreLine} />
  </Button.Root>
</div>
```

## Grid Layouts

### Two-column grid

```tsx
<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
  <div>Column 1</div>
  <div>Column 2</div>
</div>
```

### Three-column grid

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>
```

### Four-column grid (stats/metrics)

```tsx
<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
  <div>Metric 1</div>
  <div>Metric 2</div>
  <div>Metric 3</div>
  <div>Metric 4</div>
</div>
```

### Form layout (label + input side by side)

```tsx
<div className="grid grid-cols-1 gap-4 lg:grid-cols-[200px_1fr]">
  <label className="text-label-sm text-text-strong-950 lg:pt-2">Name</label>
  <Input.Root>
    <Input.Wrapper>
      <Input.Input placeholder="Enter name" />
    </Input.Wrapper>
  </Input.Root>
</div>
```

## Spacing Reference

### Gap values commonly used

| Gap | Pixels | When to use |
|-----|--------|-------------|
| `gap-0.5` | 2px | Very tight (label + sublabel) |
| `gap-1` | 4px | Tight (title + description) |
| `gap-1.5` | 6px | Compact groups |
| `gap-2` | 8px | Related items (icon + text, avatar + name) |
| `gap-2.5` | 10px | Form fields (label to hint) |
| `gap-3` | 12px | List items, form fields |
| `gap-4` | 16px | Card content, standard sections |
| `gap-5` | 20px | Larger sections |
| `gap-6` | 24px | Page sections |
| `gap-8` | 32px | Major page divisions |

### Padding values commonly used

| Padding | Pixels | When to use |
|---------|--------|-------------|
| `p-2` | 8px | Tiny components, compact buttons |
| `p-3` | 12px | Small cards, list items |
| `p-3.5` | 14px | Accordion items |
| `p-4` | 16px | Standard cards, form sections |
| `p-5` | 20px | Page horizontal padding |
| `p-6` | 24px | Large sections, modal content |

## Responsive Patterns

### Mobile-first breakpoints

```tsx
{/* Stack on mobile, row on desktop */}
<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
  ...
</div>

{/* Single column on mobile, multi on desktop */}
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  ...
</div>

{/* Hide on mobile, show on desktop */}
<div className="hidden lg:block">Desktop only</div>

{/* Show on mobile, hide on desktop */}
<div className="block lg:hidden">Mobile only</div>
```

### Common breakpoints

| Prefix | Min Width | Use |
|--------|-----------|-----|
| (none) | 0px | Mobile first (default) |
| `sm:` | 640px | Small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Large desktop |

## Section Patterns

### Page with sections

```tsx
<div className="flex flex-col gap-8">
  {/* Section 1 */}
  <section className="flex flex-col gap-4">
    <h2 className="text-label-lg text-text-strong-950">General</h2>
    <div className="rounded-20 border border-stroke-soft-200 p-4">
      {/* Section content */}
    </div>
  </section>

  {/* Section 2 */}
  <section className="flex flex-col gap-4">
    <h2 className="text-label-lg text-text-strong-950">Security</h2>
    <div className="rounded-20 border border-stroke-soft-200 p-4">
      {/* Section content */}
    </div>
  </section>
</div>
```

### Divider between sections

```tsx
import * as Divider from '@/components/ui/divider';

<div className="flex flex-col gap-4">
  <div>Section content</div>
  <Divider.Root />
  <div>Next section</div>
</div>
```

## Sidebar Layout Reference

| Property | Value | Description |
|----------|-------|-------------|
| Sidebar width (expanded) | `w-[272px]` | Standard sidebar |
| Sidebar width (collapsed) | `w-18` (72px) | Icon-only sidebar |
| Header height | `h-[60px]` | Standard header |
| Modal max width | `max-w-[548px]` (max-w-137) | Standard modal |

## Rules

- ALWAYS use `gap-*` for spacing between children (not margins between siblings)
- Use `flex flex-col gap-*` for vertical stacks, not `space-y-*` (gap is more predictable)
- Cards use `rounded-20` (large) or `rounded-10` (compact), not arbitrary radii
- Page container is `max-w-5xl mx-auto px-5`
- Use responsive prefixes (`lg:`, `md:`) for layout changes, not JavaScript
- Minimum touch target is 44x44px for interactive elements on mobile
- Keep consistent padding: `p-4` for cards, `p-3` for compact items, `px-5` for page margins

## Related Skills

- `design-tokens.md` -- Colors and borders used in layouts
- `typography.md` -- Text sizing within layouts
- `divider.md` -- Divider component for sections
