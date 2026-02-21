# Dark Mode

## When to use

- The project has built-in dark mode support via `next-themes` and CSS variables
- You should NEVER manually add `dark:` prefixes when using AlignUI design tokens
- Use this guide to understand how dark mode works and how to add theme switching

## How It Works

### Architecture

1. **`next-themes` ThemeProvider** in `app/providers.tsx` manages the theme state
2. **CSS variables** in `app/globals.css` define light and dark color values
3. **AlignUI semantic tokens** reference these CSS variables
4. **`attribute="class"`** mode adds/removes the `.dark` class on `<html>`

### Token Auto-Switching

All semantic tokens automatically adapt. You write ONE class and it works in both modes:

```tsx
{/* This text is dark in light mode, light in dark mode -- automatically */}
<p className="text-text-strong-950">Hello</p>

{/* This background is white in light mode, near-black in dark mode */}
<div className="bg-bg-white-0">Card</div>

{/* This border is light gray in light mode, dark gray in dark mode */}
<div className="border border-stroke-soft-200">Box</div>
```

### What changes between themes

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `bg-white-0` | White (#fff) | Near-black (neutral-950) |
| `bg-weak-50` | Very light gray (neutral-50) | Dark gray (neutral-900) |
| `bg-soft-200` | Light gray (neutral-200) | Dark gray (neutral-700) |
| `bg-strong-950` | Near-black (neutral-950) | White (neutral-0) |
| `text-strong-950` | Near-black | White |
| `text-sub-600` | Medium gray (neutral-600) | Light gray (neutral-400) |
| `text-soft-400` | Light gray (neutral-400) | Medium gray (neutral-500) |
| `stroke-soft-200` | Light gray (neutral-200) | Dark gray (neutral-700) |
| `stroke-sub-300` | Medium gray (neutral-300) | Darker gray (neutral-600) |

Status colors (success, error, warning, etc.) also adapt -- their `light` and `lighter` variants use alpha transparency in dark mode for proper blending.

## Setup (Already Done)

The following is already configured in this project. No setup needed.

### Provider (`app/providers.tsx`)

```tsx
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class">
      {children}
    </ThemeProvider>
  );
}
```

### HTML (`app/layout.tsx`)

```tsx
<html suppressHydrationWarning>
  <body className="bg-bg-white-0 text-text-strong-950">
    ...
  </body>
</html>
```

`suppressHydrationWarning` is required to avoid hydration mismatch from the injected theme class.

### Tailwind config

```ts
darkMode: ['class'],
safelist: ['.dark'],
```

## Theme Switch Component

A ready-to-use theme switch exists at `/components/theme-switch.tsx`:

```tsx
import ThemeSwitch from '@/components/theme-switch';

<ThemeSwitch />
```

This renders a segmented control with Light / Dark / System options using AlignUI's `SegmentedControl` component.

## Using the Theme in Code

### Read current theme

```tsx
'use client';

import { useTheme } from 'next-themes';

function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // theme: 'light' | 'dark' | 'system'
  // resolvedTheme: 'light' | 'dark' (actual resolved value)
  // setTheme: (theme: string) => void
}
```

### Toggle theme

```tsx
'use client';

import { useTheme } from 'next-themes';

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
      Toggle theme
    </button>
  );
}
```

### Conditional rendering by theme

```tsx
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

function ThemeAwareComponent() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return resolvedTheme === 'dark' ? <DarkLogo /> : <LightLogo />;
}
```

## When You MUST Use `dark:` Prefix

In rare cases where you use raw colors instead of semantic tokens, you need explicit dark mode handling:

```tsx
{/* Raw color -- needs dark: prefix */}
<div className="bg-white dark:bg-neutral-950">Not recommended</div>

{/* Semantic token -- auto-adapts, no prefix needed */}
<div className="bg-bg-white-0">Recommended</div>
```

### Cases where `dark:` might be needed

1. **Images/logos** that need different versions per theme
2. **Third-party components** that don't use AlignUI tokens
3. **Custom SVG fills** with hardcoded colors
4. **Box shadows** with hardcoded opacity values

## Static Colors

Use `static` colors when something must NOT change between themes:

```tsx
{/* Always dark text (e.g., on a colored button) */}
<span className="text-static-black">Always dark</span>

{/* Always light text (e.g., on a dark badge) */}
<span className="text-static-white">Always light</span>
```

## Common Patterns

### Image that adapts to theme

```tsx
'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';

function Logo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-8 w-32" />;

  return (
    <Image
      src={resolvedTheme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
      alt="Logo"
      width={128}
      height={32}
    />
  );
}
```

### Chart colors that adapt

```tsx
'use client';

import { useTheme } from 'next-themes';

function useChartColors() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return {
    gridColor: isDark ? 'hsl(227, 17%, 16%)' : 'hsl(220, 18%, 90%)',
    textColor: isDark ? 'hsl(220, 11%, 64%)' : 'hsl(222, 11%, 36%)',
  };
}
```

## Rules

- NEVER add `dark:` prefixes to semantic token classes (`bg-bg-white-0`, `text-text-strong-950`, etc.) -- they auto-adapt
- ALWAYS use semantic tokens instead of raw colors to get automatic dark mode support
- ALWAYS add `'use client'` when using `useTheme()`
- ALWAYS handle hydration mismatch when rendering theme-dependent content (mounted state check)
- The ThemeSwitch component at `/components/theme-switch.tsx` is ready to use
- DO NOT add `ThemeProvider` -- it is already in `providers.tsx`

## Related Skills

- `design-tokens.md` -- All semantic tokens and their light/dark values
- `typography.md` -- Text tokens that auto-adapt
