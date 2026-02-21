# AlignUI Input Component

## When to Use

Use Input for all text entry fields in forms: email, password, search, URLs, phone numbers, and any single-line text input. For multi-line text, use a textarea component instead.

## Import Pattern

```tsx
import * as Input from '@/components/ui/input';
```

## Parts

| Part | Description |
|------|-------------|
| `Input.Root` | Outer container. Controls size, error state, and border styling. |
| `Input.Wrapper` | Inner `<label>` wrapper. Groups the input with its icons/affixes. Provides hover/focus delegation. |
| `Input.Input` | The actual `<input>` element. Accepts all standard HTML input attributes. |
| `Input.Icon` | Polymorphic icon (leading or trailing). Use `as={RiIconName}`. |
| `Input.Affix` | Separated section (e.g., currency selector, domain). Rendered outside Wrapper, divided by a border. |
| `Input.InlineAffix` | Inline text prefix/suffix inside Wrapper (e.g., "$", "kg", ".com"). |

## Props

### Root Props

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `size` | `'medium'` \| `'small'` \| `'xsmall'` | `'medium'` | Input height (40px/36px/32px) |
| `hasError` | `boolean` | `false` | Show error ring (red border + red focus shadow) |
| `asChild` | `boolean` | `false` | Render as child element |

### Input Props

Standard HTML `<input>` attributes: `placeholder`, `value`, `onChange`, `type`, `disabled`, `name`, `id`, `autoComplete`, `readOnly`, etc.

### Icon Props

| Prop | Description |
|------|-------------|
| `as` | The icon component to render. Example: `as={RiSearchLine}` |

## Complete Usage Examples

### Basic input

```tsx
import * as Input from '@/components/ui/input';

<Input.Root size="medium">
  <Input.Wrapper>
    <Input.Input placeholder="Enter your name" />
  </Input.Wrapper>
</Input.Root>
```

### Input with leading icon

```tsx
import * as Input from '@/components/ui/input';
import { RiSearchLine } from '@remixicon/react';

<Input.Root size="medium">
  <Input.Wrapper>
    <Input.Icon as={RiSearchLine} />
    <Input.Input placeholder="Search..." />
  </Input.Wrapper>
</Input.Root>
```

### Input with trailing icon

```tsx
import * as Input from '@/components/ui/input';
import { RiMailLine } from '@remixicon/react';

<Input.Root size="medium">
  <Input.Wrapper>
    <Input.Input placeholder="Email address" type="email" />
    <Input.Icon as={RiMailLine} />
  </Input.Wrapper>
</Input.Root>
```

### Input with both icons

```tsx
import * as Input from '@/components/ui/input';
import { RiSearchLine, RiCloseLine } from '@remixicon/react';

<Input.Root size="medium">
  <Input.Wrapper>
    <Input.Icon as={RiSearchLine} />
    <Input.Input placeholder="Search projects..." value={query} onChange={handleChange} />
    {query && (
      <button type="button" onClick={clearSearch}>
        <Input.Icon as={RiCloseLine} />
      </button>
    )}
  </Input.Wrapper>
</Input.Root>
```

### Input with error state

```tsx
import * as Input from '@/components/ui/input';

<div className="space-y-1">
  <Input.Root size="medium" hasError>
    <Input.Wrapper>
      <Input.Input placeholder="Email" value={email} onChange={handleChange} />
    </Input.Wrapper>
  </Input.Root>
  <p className="text-paragraph-xs text-error-base">Please enter a valid email address.</p>
</div>
```

### Input with inline affix (prefix)

```tsx
import * as Input from '@/components/ui/input';

<Input.Root size="medium">
  <Input.Wrapper>
    <Input.InlineAffix>$</Input.InlineAffix>
    <Input.Input placeholder="0.00" type="number" />
  </Input.Wrapper>
</Input.Root>
```

### Input with inline affix (suffix)

```tsx
import * as Input from '@/components/ui/input';

<Input.Root size="medium">
  <Input.Wrapper>
    <Input.Input placeholder="Weight" type="number" />
    <Input.InlineAffix>kg</Input.InlineAffix>
  </Input.Wrapper>
</Input.Root>
```

### Input with separated affix (e.g., domain)

```tsx
import * as Input from '@/components/ui/input';

<Input.Root size="medium">
  <Input.Affix>https://</Input.Affix>
  <Input.Wrapper>
    <Input.Input placeholder="your-site.com" />
  </Input.Wrapper>
</Input.Root>
```

### Input with trailing affix (e.g., select inside input)

```tsx
import * as Input from '@/components/ui/input';
import * as Select from '@/components/ui/select';

<Input.Root size="medium">
  <Input.Wrapper>
    <Input.Input placeholder="0.00" type="number" />
  </Input.Wrapper>
  <Select.Root variant="compactForInput" size="medium">
    <Select.Trigger>
      <Select.Value placeholder="USD" />
    </Select.Trigger>
    <Select.Content>
      <Select.Item value="usd">USD</Select.Item>
      <Select.Item value="eur">EUR</Select.Item>
    </Select.Content>
  </Select.Root>
</Input.Root>
```

### Disabled input

```tsx
<Input.Root size="medium">
  <Input.Wrapper>
    <Input.Input placeholder="Disabled" disabled />
  </Input.Wrapper>
</Input.Root>
```

### Small size

```tsx
<Input.Root size="small">
  <Input.Wrapper>
    <Input.Icon as={RiSearchLine} />
    <Input.Input placeholder="Quick search..." />
  </Input.Wrapper>
</Input.Root>
```

### Extra small size

```tsx
<Input.Root size="xsmall">
  <Input.Wrapper>
    <Input.Input placeholder="Filter..." />
  </Input.Wrapper>
</Input.Root>
```

## Integration with React Hook Form

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Input from '@/components/ui/input';
import * as Button from '@/components/ui/button';
import { RiMailLine } from '@remixicon/react';

const schema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(1, 'Name is required'),
});

type FormData = z.infer<typeof schema>;

export function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-label-sm text-text-strong-950">Name</label>
        <Input.Root size="medium" hasError={!!errors.name}>
          <Input.Wrapper>
            <Input.Input placeholder="John Doe" {...register('name')} />
          </Input.Wrapper>
        </Input.Root>
        {errors.name && (
          <p className="text-paragraph-xs text-error-base">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-label-sm text-text-strong-950">Email</label>
        <Input.Root size="medium" hasError={!!errors.email}>
          <Input.Wrapper>
            <Input.Icon as={RiMailLine} />
            <Input.Input placeholder="john@example.com" type="email" {...register('email')} />
          </Input.Wrapper>
        </Input.Root>
        {errors.email && (
          <p className="text-paragraph-xs text-error-base">{errors.email.message}</p>
        )}
      </div>

      <Button.Root variant="primary" mode="filled" type="submit">
        Submit
      </Button.Root>
    </form>
  );
}
```

## Common Patterns

### Label + Input + Helper Text

```tsx
<div className="space-y-1">
  <label className="text-label-sm text-text-strong-950">Field Label</label>
  <Input.Root size="medium">
    <Input.Wrapper>
      <Input.Input placeholder="Placeholder" />
    </Input.Wrapper>
  </Input.Root>
  <p className="text-paragraph-xs text-text-sub-600">Helper text goes here.</p>
</div>
```

### Password input with toggle

```tsx
'use client';

import { useState } from 'react';
import * as Input from '@/components/ui/input';
import { RiEyeLine, RiEyeOffLine, RiLockLine } from '@remixicon/react';

function PasswordInput() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input.Root size="medium">
      <Input.Wrapper>
        <Input.Icon as={RiLockLine} />
        <Input.Input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
        />
        <button type="button" onClick={() => setShowPassword(!showPassword)}>
          <Input.Icon as={showPassword ? RiEyeOffLine : RiEyeLine} />
        </button>
      </Input.Wrapper>
    </Input.Root>
  );
}
```

## Rules

1. NEVER create custom `<input>` elements with manual Tailwind styling. Always use AlignUI Input.
2. NEVER modify files in `/components/ui/`.
3. Always wrap `Input.Input` inside `Input.Wrapper` inside `Input.Root`.
4. The hierarchy must be: `Root > Wrapper > (Icon?, Input, Icon?, InlineAffix?)` and `Root > (Affix?, Wrapper, Affix?)`.
5. Use `hasError` on `Root` for error states -- do not add red border classes manually.
6. Use `Input.Icon` with the `as` prop for icons. Do not place raw SVGs inside the wrapper.
7. When using React Hook Form, spread `{...register('fieldName')}` directly on `Input.Input`.
8. Use `Input.Affix` for separated sections (with border divider) and `Input.InlineAffix` for inline text.
9. Always add a `<label>` above the input for accessibility. Use class `text-label-sm text-text-strong-950`.
10. For error messages below the input, use class `text-paragraph-xs text-error-base`.

## Related Skills

- `select.md` -- Select inside input (compactForInput variant)
- `button.md` -- Submit buttons for forms
- `modal.md` -- Input fields inside modal forms
