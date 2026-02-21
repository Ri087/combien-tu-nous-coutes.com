# Accordion

## When to use

- FAQ sections
- Collapsible settings panels
- Expandable content sections (terms, details, help)
- Feature lists with detailed descriptions

## Import

```tsx
import * as Accordion from '@/components/ui/accordion';
```

## Setup

No provider needed. Just import and use directly. Requires `'use client'` directive.

## Parts

| Part | Description |
|------|------------|
| `Accordion.Root` | Container. Controls single/multiple expand behavior. |
| `Accordion.Item` | Individual accordion panel. Requires a unique `value` prop. |
| `Accordion.Header` | Wraps the trigger. Renders as an `h3` element. |
| `Accordion.Trigger` | Clickable header that toggles the item. |
| `Accordion.Icon` | Polymorphic icon displayed inside the trigger (left side). |
| `Accordion.Arrow` | Toggle indicator (+ / - icons) displayed inside the trigger (right side). |
| `Accordion.Content` | Collapsible content area with open/close animation. |

## Basic Usage

```tsx
'use client';

import * as Accordion from '@/components/ui/accordion';

<Accordion.Root type="single" collapsible>
  <Accordion.Item value="item-1">
    <Accordion.Header>
      <Accordion.Trigger>
        What is AlignUI?
        <Accordion.Arrow />
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content>
      AlignUI is a design system built on Tailwind CSS with 58+ components.
    </Accordion.Content>
  </Accordion.Item>

  <Accordion.Item value="item-2">
    <Accordion.Header>
      <Accordion.Trigger>
        How do I customize it?
        <Accordion.Arrow />
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content>
      Use design tokens and Tailwind classes to customize the appearance.
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
```

## Root Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'single' \| 'multiple'` | Required | Whether one or multiple items can be open |
| `collapsible` | `boolean` | `false` | Allow closing all items (only for `type="single"`) |
| `defaultValue` | `string \| string[]` | -- | Initially open item(s) |
| `value` | `string \| string[]` | -- | Controlled open item(s) |
| `onValueChange` | `(value: string \| string[]) => void` | -- | Callback on change |

## With Icon in Trigger

```tsx
import { RiQuestionLine } from '@remixicon/react';

<Accordion.Item value="faq-1">
  <Accordion.Header>
    <Accordion.Trigger>
      <Accordion.Icon as={RiQuestionLine} />
      Frequently asked question
      <Accordion.Arrow />
    </Accordion.Trigger>
  </Accordion.Header>
  <Accordion.Content>
    Answer to the question goes here.
  </Accordion.Content>
</Accordion.Item>
```

## Custom Arrow Icons

```tsx
import { RiArrowDownSLine, RiArrowUpSLine } from '@remixicon/react';

<Accordion.Arrow
  openIcon={RiArrowDownSLine}
  closeIcon={RiArrowUpSLine}
/>
```

The default icons are `RiAddLine` (closed) and `RiSubtractLine` (open).

## Multiple Expanded Items

```tsx
<Accordion.Root type="multiple" defaultValue={['item-1', 'item-3']}>
  <Accordion.Item value="item-1">...</Accordion.Item>
  <Accordion.Item value="item-2">...</Accordion.Item>
  <Accordion.Item value="item-3">...</Accordion.Item>
</Accordion.Root>
```

## Controlled State

```tsx
const [value, setValue] = React.useState<string>('');

<Accordion.Root type="single" collapsible value={value} onValueChange={setValue}>
  {/* items */}
</Accordion.Root>
```

## Common Patterns

### FAQ Section

```tsx
'use client';

import * as Accordion from '@/components/ui/accordion';

interface FAQItem {
  question: string;
  answer: string;
}

function FAQSection({ items }: { items: FAQItem[] }) {
  return (
    <div className="space-y-3">
      <h2 className="text-title-h5 text-text-strong-950">
        Frequently Asked Questions
      </h2>
      <Accordion.Root type="single" collapsible>
        {items.map((item, index) => (
          <Accordion.Item key={index} value={`faq-${index}`}>
            <Accordion.Header>
              <Accordion.Trigger>
                {item.question}
                <Accordion.Arrow />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>{item.answer}</Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}
```

### Accordion list with spacing

```tsx
<div className="flex flex-col gap-2">
  <Accordion.Root type="single" collapsible>
    <div className="flex flex-col gap-2">
      <Accordion.Item value="1">...</Accordion.Item>
      <Accordion.Item value="2">...</Accordion.Item>
    </div>
  </Accordion.Root>
</div>
```

## Styling Details

- **Item**: Rounded with ring border (`rounded-10 ring-1 ring-stroke-soft-200`), hover state changes to `bg-bg-weak-50`
- **Trigger text**: `text-label-sm text-text-strong-950` (bold small label)
- **Content text**: `text-paragraph-sm text-text-sub-600` (secondary text)
- **Icon**: `size-5 text-text-sub-600`
- **Arrow**: `size-5 text-text-soft-400`, transitions to `text-text-sub-600` on hover
- **Animation**: 200ms ease-out accordion-down/up keyframes

## Rules

- ALWAYS provide a unique `value` prop to each `Accordion.Item`
- ALWAYS include `Accordion.Arrow` inside `Accordion.Trigger` for visual toggle indication
- Use `type="single" collapsible` for most use cases (FAQ, settings)
- Use `type="multiple"` only when multiple sections should be readable simultaneously
- The `Accordion.Icon` is polymorphic -- use `as={RiIconName}` to render a Remix icon
- Requires `'use client'` directive

## Related Skills

- `icons.md` -- Icons used with Accordion.Icon
- `typography.md` -- Text styles used in triggers and content
- `design-tokens.md` -- Color and border tokens
