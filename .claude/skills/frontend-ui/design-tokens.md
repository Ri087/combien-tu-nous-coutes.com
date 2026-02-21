# Design Tokens

## When to use

- Every time you write UI code. Design tokens are the foundation of the AlignUI design system.
- Reference this guide to choose the correct color, shadow, border-radius, or spacing token.
- NEVER use raw Tailwind colors (e.g., `text-gray-500`). ALWAYS use AlignUI semantic tokens.

## Text Colors

| Token | Tailwind Class | When to use |
|-------|---------------|-------------|
| Strong 950 | `text-text-strong-950` | Primary text, headings, important labels |
| Sub 600 | `text-text-sub-600` | Secondary text, descriptions, metadata |
| Soft 400 | `text-text-soft-400` | Placeholder text, disabled labels, tertiary info |
| Disabled 300 | `text-text-disabled-300` | Disabled state text |
| White 0 | `text-text-white-0` | Text on dark/colored backgrounds |

### Usage

```tsx
<h1 className="text-title-h5 text-text-strong-950">Page Title</h1>
<p className="text-paragraph-sm text-text-sub-600">Description text</p>
<span className="text-paragraph-xs text-text-soft-400">Last updated 2 hours ago</span>
```

## Background Colors

| Token | Tailwind Class | When to use |
|-------|---------------|-------------|
| White 0 | `bg-bg-white-0` | Main background, cards, modals |
| Weak 50 | `bg-bg-weak-50` | Page background, subtle sections, hover states |
| Soft 200 | `bg-bg-soft-200` | Dividers, separators, input backgrounds |
| Sub 300 | `bg-bg-sub-300` | Stronger subtle backgrounds |
| Surface 800 | `bg-bg-surface-800` | Dark surfaces, elevated dark elements |
| Strong 950 | `bg-bg-strong-950` | Dark backgrounds, tooltips, dark cards |

### Usage

```tsx
{/* Page background */}
<div className="bg-bg-weak-50 min-h-screen">
  {/* Card on page */}
  <div className="bg-bg-white-0 rounded-20 border border-stroke-soft-200 p-4">
    Content
  </div>
</div>
```

## Stroke (Border) Colors

| Token | Tailwind Class | When to use |
|-------|---------------|-------------|
| Soft 200 | `border-stroke-soft-200` | Default borders, cards, inputs, dividers |
| Sub 300 | `border-stroke-sub-300` | Stronger borders, active states |
| Strong 950 | `border-stroke-strong-950` | High contrast borders, focus rings |
| White 0 | `border-stroke-white-0` | Borders on dark backgrounds |

### Usage

```tsx
{/* Card border */}
<div className="border border-stroke-soft-200 rounded-20">...</div>

{/* Input border */}
<div className="ring-1 ring-stroke-soft-200 ring-inset rounded-lg">...</div>

{/* Stronger border */}
<div className="border border-stroke-sub-300">...</div>
```

## Primary Colors

| Token | Tailwind Class | When to use |
|-------|---------------|-------------|
| Base | `bg-primary-base` / `text-primary-base` | Primary buttons, links, active indicators |
| Dark | `bg-primary-dark` | Primary hover state |
| Darker | `bg-primary-darker` | Primary pressed/active state |
| Alpha 24 | `bg-primary-alpha-24` | Subtle primary backgrounds |
| Alpha 16 | `bg-primary-alpha-16` | Very subtle primary tints |
| Alpha 10 | `bg-primary-alpha-10` | Focus rings, lightest primary |

```tsx
{/* Primary link */}
<a className="text-primary-base hover:text-primary-dark">Link</a>

{/* Primary badge background */}
<span className="bg-primary-alpha-10 text-primary-base rounded-md px-2 py-0.5">
  Active
</span>
```

## Semantic Status Colors

Each status has 4 levels: `dark`, `base`, `light`, `lighter`.

| Status | Base class | When to use |
|--------|-----------|-------------|
| Success | `text-success-base` / `bg-success-base` | Completed actions, positive states |
| Error | `text-error-base` / `bg-error-base` | Errors, destructive actions, validation |
| Warning | `text-warning-base` / `bg-warning-base` | Warnings, attention needed |
| Information | `text-information-base` / `bg-information-base` | Info messages, tips |
| Feature | `text-feature-base` / `bg-feature-base` | Premium/AI/special features |
| Away | `text-away-base` / `bg-away-base` | Away/idle status |
| Verified | `text-verified-base` / `bg-verified-base` | Verified/trusted |
| Highlighted | `text-highlighted-base` / `bg-highlighted-base` | Highlighted/pinned |
| Stable | `text-stable-base` / `bg-stable-base` | Stable/active status |
| Faded | `text-faded-base` / `bg-faded-base` | Neutral/default status |

### Status Levels

```tsx
{/* Filled -- high emphasis */}
<div className="bg-success-base text-static-white">Filled</div>

{/* Light -- medium emphasis */}
<div className="bg-success-light text-text-strong-950">Light</div>

{/* Lighter -- low emphasis */}
<div className="bg-success-lighter text-text-strong-950">Lighter</div>

{/* Dark -- for text on lighter backgrounds */}
<span className="text-success-dark">Dark label</span>
```

## Raw Color Scales

Available for special cases (prefer semantic tokens above):

| Scale | Range | Example |
|-------|-------|---------|
| Neutral | 0-950 | `bg-neutral-100`, `text-neutral-600` |
| Blue | 50-950 | `bg-blue-50`, `text-blue-600` |
| Red | 50-950 | `bg-red-50`, `text-red-600` |
| Green | 50-950 | `bg-green-50`, `text-green-600` |
| Orange | 50-950 | `bg-orange-50`, `text-orange-600` |
| Yellow | 50-950 | `bg-yellow-50`, `text-yellow-600` |
| Purple | 50-950 | `bg-purple-50`, `text-purple-600` |
| Sky | 50-950 | `bg-sky-50`, `text-sky-600` |
| Pink | 50-950 | `bg-pink-50`, `text-pink-600` |
| Teal | 50-950 | `bg-teal-50`, `text-teal-600` |

Each also has `alpha-24`, `alpha-16`, `alpha-10` variants.

## Static Colors

| Token | Class | When to use |
|-------|-------|-------------|
| Static Black | `text-static-black` | Text that must stay dark in both themes |
| Static White | `text-static-white` | Text that must stay light in both themes |

## Shadow Tokens

| Token | Tailwind Class | When to use |
|-------|---------------|-------------|
| Regular XS | `shadow-regular-xs` | Subtle elevation, small cards |
| Regular SM | `shadow-regular-sm` | Cards, dropdowns |
| Regular MD | `shadow-regular-md` | Modals, popovers, elevated cards |
| Tooltip | `shadow-tooltip` | Tooltips |
| Button Primary Focus | `shadow-button-primary-focus` | Primary button focus ring |
| Button Important Focus | `shadow-button-important-focus` | Important button focus ring |
| Button Error Focus | `shadow-button-error-focus` | Error button focus ring |
| Fancy Buttons Neutral | `shadow-fancy-buttons-neutral` | FancyButton neutral |
| Fancy Buttons Primary | `shadow-fancy-buttons-primary` | FancyButton primary |
| Fancy Buttons Error | `shadow-fancy-buttons-error` | FancyButton error |
| Fancy Buttons Stroke | `shadow-fancy-buttons-stroke` | FancyButton stroke |
| Toggle Switch | `shadow-toggle-switch` | Switch component |
| Switch Thumb | `shadow-switch-thumb` | Switch thumb |

```tsx
{/* Card with shadow */}
<div className="bg-bg-white-0 rounded-20 shadow-regular-md p-4">
  Elevated card
</div>
```

## Border Radius Tokens

| Token | Tailwind Class | Pixels | When to use |
|-------|---------------|--------|-------------|
| rounded-10 | `rounded-10` | 10px | Cards, inputs, small containers |
| rounded-20 | `rounded-20` | 20px | Large cards, modals, sections |
| rounded-sm | `rounded-sm` | 2px | Tiny elements |
| rounded-md | `rounded-md` | 6px | Badges, small buttons |
| rounded-lg | `rounded-lg` | 8px | Buttons, form elements |
| rounded-xl | `rounded-xl` | 12px | Alerts, medium containers |
| rounded-full | `rounded-full` | 9999px | Avatars, pills, circular buttons |

```tsx
{/* Standard card */}
<div className="rounded-20 border border-stroke-soft-200 p-4">Card</div>

{/* Input-like element */}
<div className="rounded-10 border border-stroke-soft-200 px-3 py-2">Input</div>

{/* Pill/badge */}
<span className="rounded-full bg-primary-alpha-10 px-2 py-0.5">Badge</span>
```

## Overlay

```tsx
{/* Modal backdrop */}
<div className="fixed inset-0 bg-overlay" />
```

## Common Token Combinations

### Card

```tsx
className="bg-bg-white-0 rounded-20 border border-stroke-soft-200 p-4"
```

### Card with shadow (elevated)

```tsx
className="bg-bg-white-0 rounded-20 shadow-regular-md p-4"
```

### Section header

```tsx
<h2 className="text-label-md text-text-strong-950">Section Title</h2>
<p className="text-paragraph-sm text-text-sub-600">Description</p>
```

### Metadata line

```tsx
<span className="text-paragraph-xs text-text-soft-400">Updated 2h ago</span>
```

### Divider

```tsx
<div className="h-px w-full bg-stroke-soft-200" />
```

## Rules

- NEVER use raw Tailwind color utilities (e.g., `text-gray-500`, `bg-slate-100`)
- ALWAYS use the semantic token classes (`text-text-sub-600`, `bg-bg-weak-50`)
- Semantic tokens auto-adapt to dark mode -- no `dark:` prefix needed
- Use `text-static-black` / `text-static-white` only when the color must NOT change in dark mode
- Use status colors (`success-base`, `error-base`) for semantic meaning, not decoration
- Cards use `border-stroke-soft-200`, not `border-gray-200`
- Default body styles are already set: `bg-bg-white-0 text-text-strong-950` (in `layout.tsx`)

## Related Skills

- `typography.md` -- Text size tokens
- `dark-mode.md` -- How tokens adapt to dark mode
- `spacing-layout.md` -- Spacing and layout patterns
