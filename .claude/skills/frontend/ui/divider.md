# Divider and Utility Components

## When to use

- **Divider**: Separate content sections, list items, or form groups
- **Hint**: Display helper text, validation errors, or contextual information below form fields
- **KBD**: Display keyboard shortcuts or key combinations
- **Skeleton**: See `skeleton.md` for loading state patterns

---

## Divider

### Import

```tsx
import * as Divider from '@/components/ui/divider';
```

### Basic Usage

```tsx
<Divider.Root />
```

### Variants

| Variant | Description | Default |
|---------|------------|---------|
| `line` | Simple horizontal line | Yes |
| `line-spacing` | Line with vertical spacing (taller hit area) | No |
| `line-text` | Line with centered text (e.g., "OR") | No |
| `content` | Line with centered custom content | No |
| `text` | Standalone text label (no line) | No |
| `solid-text` | Solid background with text (section marker) | No |
| `dotted-line` | Dotted horizontal line | No |

### Examples

```tsx
{/* Simple line */}
<Divider.Root />

{/* Line with spacing */}
<Divider.Root variant="line-spacing" />

{/* Line with text (e.g., login page "OR" divider) */}
<Divider.Root variant="line-text">OR</Divider.Root>

{/* Line with custom content */}
<Divider.Root variant="content">
  <Badge.Root>Section</Badge.Root>
</Divider.Root>

{/* Standalone text label */}
<Divider.Root variant="text">Section Title</Divider.Root>

{/* Solid background text (category separator) */}
<Divider.Root variant="solid-text">CATEGORY</Divider.Root>

{/* Dotted line */}
<Divider.Root variant="dotted-line" />
```

### Common Patterns

```tsx
{/* Between form sections */}
<div className="flex flex-col gap-4">
  <div>{/* Section 1 fields */}</div>
  <Divider.Root />
  <div>{/* Section 2 fields */}</div>
</div>

{/* Social login divider */}
<div className="flex flex-col gap-4">
  <SocialButtons />
  <Divider.Root variant="line-text">OR</Divider.Root>
  <EmailPasswordForm />
</div>

{/* List with dividers */}
<div className="flex flex-col">
  {items.map((item, i) => (
    <React.Fragment key={item.id}>
      {i > 0 && <Divider.Root />}
      <ListItem item={item} />
    </React.Fragment>
  ))}
</div>
```

---

## Hint

### Import

```tsx
import * as Hint from '@/components/ui/hint';
```

### Parts

| Part | Description |
|------|------------|
| `Hint.Root` | Container that applies text styling and manages error/disabled state |
| `Hint.Icon` | Optional leading icon (polymorphic, use `as` prop) |

### Basic Usage

```tsx
<Hint.Root>
  This field is required.
</Hint.Root>
```

### With Icon

```tsx
import { RiInformationLine } from '@remixicon/react';

<Hint.Root>
  <Hint.Icon as={RiInformationLine} />
  Maximum 100 characters allowed.
</Hint.Root>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hasError` | `boolean` | `false` | Red error styling |
| `disabled` | `boolean` | `false` | Disabled/muted styling |

### Error State

```tsx
<Hint.Root hasError>
  <Hint.Icon as={RiErrorWarningLine} />
  Email address is invalid.
</Hint.Root>
```

### Disabled State

```tsx
<Hint.Root disabled>
  This field is not available.
</Hint.Root>
```

### With Form Field

```tsx
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Hint from '@/components/ui/hint';
import { RiInformationLine } from '@remixicon/react';

<div className="flex flex-col gap-1">
  <Label.Root htmlFor="email">Email</Label.Root>
  <Input.Root>
    <Input.Wrapper>
      <Input.Input id="email" placeholder="you@example.com" />
    </Input.Wrapper>
  </Input.Root>
  <Hint.Root>
    <Hint.Icon as={RiInformationLine} />
    We will never share your email.
  </Hint.Root>
</div>
```

### With React Hook Form Validation

```tsx
import * as Hint from '@/components/ui/hint';
import { RiErrorWarningLine } from '@remixicon/react';

{errors.email && (
  <Hint.Root hasError>
    <Hint.Icon as={RiErrorWarningLine} />
    {errors.email.message}
  </Hint.Root>
)}
```

### Styling Details

- Default: `text-paragraph-xs text-text-sub-600`
- Icon: `size-4 text-text-soft-400`
- Error: Text and icon turn `text-error-base`
- Disabled: Text and icon turn `text-text-disabled-300`

---

## KBD (Keyboard Shortcut)

### Import

```tsx
import * as KBD from '@/components/ui/kbd';
```

### Basic Usage

```tsx
<KBD.Root>Ctrl+S</KBD.Root>
```

### Common Patterns

```tsx
{/* Single key */}
<KBD.Root>Esc</KBD.Root>

{/* Key combination */}
<div className="flex items-center gap-1">
  <KBD.Root>Ctrl</KBD.Root>
  <span className="text-text-soft-400">+</span>
  <KBD.Root>K</KBD.Root>
</div>

{/* In a tooltip */}
<Tooltip.Content size="medium">
  <div className="flex items-center gap-2">
    <span>Search</span>
    <KBD.Root>Ctrl+K</KBD.Root>
  </div>
</Tooltip.Content>

{/* In a dropdown menu item */}
<div className="flex items-center justify-between">
  <span>Save</span>
  <KBD.Root>Ctrl+S</KBD.Root>
</div>
```

### Styling Details

- Height: `h-5`
- Background: `bg-bg-white-0`
- Border: `ring-1 ring-stroke-soft-200 ring-inset`
- Text: `text-subheading-xs text-text-soft-400`
- Border radius: `rounded`

---

## Rules

- Use `Divider.Root` (not a raw `<hr>` or `<div className="border-b ...">`) for consistent dividers
- Use `Hint.Root` (not raw text) below form fields for consistent helper/error text
- Always pass `hasError` to Hint when displaying validation errors
- Use `KBD.Root` for keyboard shortcuts, not styled `<code>` or `<span>` elements
- All these components work as Server Components (no `'use client'` needed) except when used in interactive contexts

## Related Skills

- `typography.md` -- Text styles used in these components
- `design-tokens.md` -- Color tokens (stroke-soft-200, text-soft-400, error-base)
- `icons.md` -- Icons used with Hint.Icon
- `skeleton.md` -- Skeleton loading states
