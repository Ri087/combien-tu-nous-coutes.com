# Typography

## When to use

- Every time you render text. This guide defines all available text size classes.
- Choose the correct category (title, label, paragraph, subheading) based on the text's purpose.

## Fonts

| Font | Variable | Tailwind Class | Use |
|------|----------|---------------|-----|
| Inter | `--font-sans` | `font-sans` | All UI text (default, no need to specify) |
| Geist Mono | `--font-geist-mono` | `font-mono` | Code, monospaced content |

Fonts are loaded in `app/layout.tsx` and applied globally. You do not need to import or configure them.

## Text Categories

### Title (Headings)

For page titles, section headings, and hero text. Font weight: 500 (medium).

| Class | Size | Line Height | Letter Spacing |
|-------|------|------------|----------------|
| `text-title-h1` | 3.5rem (56px) | 4rem (64px) | -0.01em |
| `text-title-h2` | 3rem (48px) | 3.5rem (56px) | -0.01em |
| `text-title-h3` | 2.5rem (40px) | 3rem (48px) | -0.01em |
| `text-title-h4` | 2rem (32px) | 2.5rem (40px) | -0.005em |
| `text-title-h5` | 1.5rem (24px) | 2rem (32px) | 0em |
| `text-title-h6` | 1.25rem (20px) | 1.75rem (28px) | 0em |

```tsx
<h1 className="text-title-h1 text-text-strong-950">Hero Title</h1>
<h2 className="text-title-h3 text-text-strong-950">Page Title</h2>
<h3 className="text-title-h5 text-text-strong-950">Section Title</h3>
<h4 className="text-title-h6 text-text-strong-950">Card Title</h4>
```

### Label (Interactive Elements)

For buttons, form labels, navigation items, table headers. Font weight: 500 (medium).

| Class | Size | Line Height | Letter Spacing |
|-------|------|------------|----------------|
| `text-label-xl` | 1.5rem (24px) | 2rem (32px) | -0.015em |
| `text-label-lg` | 1.125rem (18px) | 1.5rem (24px) | -0.015em |
| `text-label-md` | 1rem (16px) | 1.5rem (24px) | -0.011em |
| `text-label-sm` | 0.875rem (14px) | 1.25rem (20px) | -0.006em |
| `text-label-xs` | 0.75rem (12px) | 1rem (16px) | 0em |

```tsx
<label className="text-label-sm text-text-strong-950">Email</label>
<span className="text-label-md text-text-strong-950">Navigation Item</span>
<th className="text-label-xs text-text-sub-600">Column Header</th>
```

### Paragraph (Body Text)

For descriptions, content, help text. Font weight: 400 (regular).

| Class | Size | Line Height | Letter Spacing |
|-------|------|------------|----------------|
| `text-paragraph-xl` | 1.5rem (24px) | 2rem (32px) | -0.015em |
| `text-paragraph-lg` | 1.125rem (18px) | 1.5rem (24px) | -0.015em |
| `text-paragraph-md` | 1rem (16px) | 1.5rem (24px) | -0.011em |
| `text-paragraph-sm` | 0.875rem (14px) | 1.25rem (20px) | -0.006em |
| `text-paragraph-xs` | 0.75rem (12px) | 1rem (16px) | 0em |

```tsx
<p className="text-paragraph-md text-text-sub-600">
  This is body text for descriptions and content.
</p>
<p className="text-paragraph-sm text-text-sub-600">
  Smaller body text for compact layouts.
</p>
<span className="text-paragraph-xs text-text-soft-400">
  Timestamp or metadata
</span>
```

### Subheading (Section Markers)

For category labels, section dividers, overlines. Font weight: 500 (medium). Wider letter spacing for emphasis.

| Class | Size | Line Height | Letter Spacing |
|-------|------|------------|----------------|
| `text-subheading-md` | 1rem (16px) | 1.5rem (24px) | 0.06em |
| `text-subheading-sm` | 0.875rem (14px) | 1.25rem (20px) | 0.06em |
| `text-subheading-xs` | 0.75rem (12px) | 1rem (16px) | 0.04em |
| `text-subheading-2xs` | 0.6875rem (11px) | 0.75rem (12px) | 0.02em |

```tsx
<span className="text-subheading-xs text-text-soft-400 uppercase">
  CATEGORY
</span>
<span className="text-subheading-2xs text-text-soft-400">
  Section divider text
</span>
```

### Doc (Documentation)

For long-form documentation content. Based on 18px size with generous line height.

| Class | Size | Line Height | Letter Spacing | Weight |
|-------|------|------------|----------------|--------|
| `text-doc-label` | 1.125rem (18px) | 2rem (32px) | -0.015em | 500 |
| `text-doc-paragraph` | 1.125rem (18px) | 2rem (32px) | -0.015em | 400 |

## Quick Reference: Which class to use?

| Content Type | Class | Color |
|-------------|-------|-------|
| Page title | `text-title-h5` | `text-text-strong-950` |
| Section title | `text-title-h6` or `text-label-lg` | `text-text-strong-950` |
| Card title | `text-label-md` or `text-label-sm` | `text-text-strong-950` |
| Button text | `text-label-sm` | inherited |
| Form label | `text-label-sm` | `text-text-strong-950` |
| Body text | `text-paragraph-sm` | `text-text-sub-600` |
| Description | `text-paragraph-sm` | `text-text-sub-600` |
| Help/hint text | `text-paragraph-xs` | `text-text-sub-600` |
| Placeholder | `text-paragraph-sm` | `text-text-soft-400` |
| Metadata/timestamp | `text-paragraph-xs` | `text-text-soft-400` |
| Table header | `text-label-xs` | `text-text-sub-600` |
| Badge text | `text-label-xs` | varies |
| Category overline | `text-subheading-xs` | `text-text-soft-400` |

## Common Patterns

### Page header

```tsx
<div className="flex flex-col gap-1">
  <h1 className="text-title-h5 text-text-strong-950">Projects</h1>
  <p className="text-paragraph-sm text-text-sub-600">
    Manage your projects and collaborators.
  </p>
</div>
```

### Card header

```tsx
<div className="flex flex-col gap-0.5">
  <h3 className="text-label-sm text-text-strong-950">Card Title</h3>
  <p className="text-paragraph-xs text-text-sub-600">Short description</p>
</div>
```

### Form field

```tsx
<div className="flex flex-col gap-1">
  <label className="text-label-sm text-text-strong-950">Email</label>
  <Input.Root>
    <Input.Wrapper>
      <Input.Input placeholder="Enter your email" />
    </Input.Wrapper>
  </Input.Root>
  <Hint.Root>
    <span>We will never share your email.</span>
  </Hint.Root>
</div>
```

### Empty state

```tsx
<div className="flex flex-col items-center gap-2 py-12 text-center">
  <h3 className="text-label-md text-text-strong-950">No projects yet</h3>
  <p className="text-paragraph-sm text-text-sub-600">
    Create your first project to get started.
  </p>
</div>
```

### Stats/metric

```tsx
<div className="flex flex-col gap-0.5">
  <span className="text-subheading-2xs text-text-soft-400 uppercase">Revenue</span>
  <span className="text-title-h4 text-text-strong-950">$12,450</span>
</div>
```

## Monospace Text

```tsx
<code className="font-mono text-paragraph-sm bg-bg-weak-50 rounded-md px-1.5 py-0.5">
  npm install
</code>
```

## Rules

- ALWAYS use AlignUI text classes (`text-title-h5`, `text-label-sm`, `text-paragraph-sm`)
- NEVER use raw Tailwind text sizes (`text-sm`, `text-lg`, `text-2xl`)
- ALWAYS pair text size with the appropriate color token
- Use `label` for interactive/UI elements, `paragraph` for content
- Use `subheading` only for overlines and category markers, typically uppercase
- Titles go from `h1` (largest) to `h6` (smallest) -- most page titles use `h5` or `h6`
- Default font is Inter (sans). Only use `font-mono` for code content.

## Related Skills

- `design-tokens.md` -- Color tokens to pair with typography
- `spacing-layout.md` -- Spacing between text elements
