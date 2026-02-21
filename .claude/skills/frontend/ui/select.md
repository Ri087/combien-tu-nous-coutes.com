# AlignUI Select Component

## When to Use

Use Select for single-value selection from a predefined list of options. Ideal for form fields like country, category, status, currency, or any enumerated choice. For multi-select or searchable lists, consider using a combobox pattern instead.

## Import Pattern

```tsx
import * as Select from '@/components/ui/select';
```

**Note:** This is a `'use client'` component. It must be used inside a Client Component.

## Parts

| Part | Description |
|------|-------------|
| `Select.Root` | Provider component. Controls size, variant, error state, and open/value state. |
| `Select.Trigger` | The clickable trigger button. Automatically renders a dropdown arrow icon. |
| `Select.TriggerIcon` | Optional icon inside the trigger (before the value text). |
| `Select.Value` | Displays the selected value or placeholder text. |
| `Select.Content` | The dropdown panel. Portaled, scrollable, animated. |
| `Select.Item` | A selectable option inside the dropdown. |
| `Select.ItemIcon` | Optional icon inside an Item (before the item text). |
| `Select.Group` | Groups related items together. |
| `Select.GroupLabel` | Label for a group of items. |
| `Select.Separator` | Visual divider between items or groups. |

## Props

### Root Props

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `size` | `'medium'` \| `'small'` \| `'xsmall'` | `'medium'` | Trigger height (40px/36px/32px) |
| `variant` | `'default'` \| `'compact'` \| `'compactForInput'` \| `'inline'` | `'default'` | Layout variant |
| `hasError` | `boolean` | `false` | Red error border + focus ring |
| `value` | `string` | -- | Controlled value |
| `defaultValue` | `string` | -- | Uncontrolled default value |
| `onValueChange` | `(value: string) => void` | -- | Callback when value changes |
| `open` | `boolean` | -- | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | -- | Callback when open changes |
| `disabled` | `boolean` | `false` | Disable the entire select |
| `name` | `string` | -- | Form field name for native form submission |

### Item Props

| Prop | Values | Description |
|------|--------|-------------|
| `value` | `string` (required) | The value submitted when this item is selected |
| `disabled` | `boolean` | Disable this specific item |

## Complete Usage Examples

### Basic select

```tsx
import * as Select from '@/components/ui/select';

<Select.Root size="medium">
  <Select.Trigger>
    <Select.Value placeholder="Select a role" />
  </Select.Trigger>
  <Select.Content>
    <Select.Item value="admin">Admin</Select.Item>
    <Select.Item value="editor">Editor</Select.Item>
    <Select.Item value="viewer">Viewer</Select.Item>
  </Select.Content>
</Select.Root>
```

### Controlled select

```tsx
'use client';

import { useState } from 'react';
import * as Select from '@/components/ui/select';

function RoleSelect() {
  const [role, setRole] = useState('');

  return (
    <Select.Root size="medium" value={role} onValueChange={setRole}>
      <Select.Trigger>
        <Select.Value placeholder="Select a role" />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="admin">Admin</Select.Item>
        <Select.Item value="editor">Editor</Select.Item>
        <Select.Item value="viewer">Viewer</Select.Item>
      </Select.Content>
    </Select.Root>
  );
}
```

### Select with icons on items

```tsx
import * as Select from '@/components/ui/select';
import { RiShieldLine, RiEditLine, RiEyeLine } from '@remixicon/react';

<Select.Root size="medium">
  <Select.Trigger>
    <Select.Value placeholder="Select role" />
  </Select.Trigger>
  <Select.Content>
    <Select.Item value="admin">
      <Select.ItemIcon as={RiShieldLine} />
      Admin
    </Select.Item>
    <Select.Item value="editor">
      <Select.ItemIcon as={RiEditLine} />
      Editor
    </Select.Item>
    <Select.Item value="viewer">
      <Select.ItemIcon as={RiEyeLine} />
      Viewer
    </Select.Item>
  </Select.Content>
</Select.Root>
```

### Select with icon on trigger

```tsx
import * as Select from '@/components/ui/select';
import { RiGlobalLine } from '@remixicon/react';

<Select.Root size="medium">
  <Select.Trigger>
    <Select.TriggerIcon as={RiGlobalLine} />
    <Select.Value placeholder="Country" />
  </Select.Trigger>
  <Select.Content>
    <Select.Item value="us">United States</Select.Item>
    <Select.Item value="uk">United Kingdom</Select.Item>
    <Select.Item value="fr">France</Select.Item>
  </Select.Content>
</Select.Root>
```

### Select with groups

```tsx
import * as Select from '@/components/ui/select';

<Select.Root size="medium">
  <Select.Trigger>
    <Select.Value placeholder="Select a timezone" />
  </Select.Trigger>
  <Select.Content>
    <Select.Group>
      <Select.GroupLabel>Americas</Select.GroupLabel>
      <Select.Item value="est">Eastern Time (EST)</Select.Item>
      <Select.Item value="cst">Central Time (CST)</Select.Item>
      <Select.Item value="pst">Pacific Time (PST)</Select.Item>
    </Select.Group>
    <Select.Separator />
    <Select.Group>
      <Select.GroupLabel>Europe</Select.GroupLabel>
      <Select.Item value="gmt">GMT (London)</Select.Item>
      <Select.Item value="cet">CET (Paris)</Select.Item>
    </Select.Group>
  </Select.Content>
</Select.Root>
```

### Compact variant (auto width)

```tsx
<Select.Root variant="compact" size="medium">
  <Select.Trigger>
    <Select.Value placeholder="Status" />
  </Select.Trigger>
  <Select.Content>
    <Select.Item value="active">Active</Select.Item>
    <Select.Item value="inactive">Inactive</Select.Item>
  </Select.Content>
</Select.Root>
```

### CompactForInput variant (inside an Input.Root)

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
      <Select.Item value="gbp">GBP</Select.Item>
    </Select.Content>
  </Select.Root>
</Input.Root>
```

### Inline variant (minimal, no border)

```tsx
<div className="flex items-center gap-1 text-paragraph-sm text-text-sub-600">
  Sort by
  <Select.Root variant="inline" size="medium">
    <Select.Trigger>
      <Select.Value placeholder="Date" />
    </Select.Trigger>
    <Select.Content>
      <Select.Item value="date">Date</Select.Item>
      <Select.Item value="name">Name</Select.Item>
      <Select.Item value="status">Status</Select.Item>
    </Select.Content>
  </Select.Root>
</div>
```

### Select with error state

```tsx
<div className="space-y-1">
  <label className="text-label-sm text-text-strong-950">Category</label>
  <Select.Root size="medium" hasError>
    <Select.Trigger>
      <Select.Value placeholder="Select category" />
    </Select.Trigger>
    <Select.Content>
      <Select.Item value="design">Design</Select.Item>
      <Select.Item value="engineering">Engineering</Select.Item>
    </Select.Content>
  </Select.Root>
  <p className="text-paragraph-xs text-error-base">Please select a category.</p>
</div>
```

### Small and xsmall sizes

```tsx
// Small
<Select.Root size="small">
  <Select.Trigger>
    <Select.Value placeholder="Priority" />
  </Select.Trigger>
  <Select.Content>
    <Select.Item value="high">High</Select.Item>
    <Select.Item value="medium">Medium</Select.Item>
    <Select.Item value="low">Low</Select.Item>
  </Select.Content>
</Select.Root>

// Extra small
<Select.Root size="xsmall">
  <Select.Trigger>
    <Select.Value placeholder="Filter" />
  </Select.Trigger>
  <Select.Content>
    <Select.Item value="all">All</Select.Item>
    <Select.Item value="active">Active</Select.Item>
  </Select.Content>
</Select.Root>
```

## Integration with React Hook Form

```tsx
'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Select from '@/components/ui/select';

const schema = z.object({
  role: z.string().min(1, 'Role is required'),
});

type FormData = z.infer<typeof schema>;

function RoleForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <div className="space-y-1">
            <label className="text-label-sm text-text-strong-950">Role</label>
            <Select.Root
              size="medium"
              value={field.value}
              onValueChange={field.onChange}
              hasError={!!errors.role}
            >
              <Select.Trigger>
                <Select.Value placeholder="Select a role" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="admin">Admin</Select.Item>
                <Select.Item value="editor">Editor</Select.Item>
                <Select.Item value="viewer">Viewer</Select.Item>
              </Select.Content>
            </Select.Root>
            {errors.role && (
              <p className="text-paragraph-xs text-error-base">{errors.role.message}</p>
            )}
          </div>
        )}
      />
    </form>
  );
}
```

## Rules

1. NEVER create custom select/dropdown elements for single-value selection. Always use AlignUI Select.
2. NEVER modify files in `/components/ui/`.
3. Always use the namespace import: `import * as Select from '@/components/ui/select'`.
4. The structure must be: `Root > Trigger > Value` and `Root > Content > Item(s)`.
5. Every `Select.Item` must have a unique `value` string prop.
6. Use `Select.TriggerIcon` for icons in the trigger, not raw icon components.
7. Use `Select.ItemIcon` for icons in items, not raw icon components.
8. Use `variant="compactForInput"` when embedding a Select inside an `Input.Root`.
9. Use `variant="inline"` for minimal inline selectors (no border, no background).
10. With React Hook Form, use `Controller` and map `field.value`/`field.onChange` to the Root.

## Related Skills

- `input.md` -- Combining Select with Input (compactForInput)
- `dropdown.md` -- For action menus (not value selection), use Dropdown instead
- `button.md` -- Trigger styling alternatives
