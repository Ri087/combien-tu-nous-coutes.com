# AlignUI Alert & Banner Components

## When to Use

Use **Alert** for contextual inline messages: form validation summaries, operation results, warnings, feature announcements, or any feedback that appears within the page flow.

Use **Banner** for page-level or app-level notifications that span the full width at the top of a page or viewport: system announcements, maintenance notices, upgrade prompts, or global status messages.

## Import Patterns

```tsx
import * as Alert from '@/components/ui/alert';
import * as Banner from '@/components/ui/banner';
```

---

## Alert

### Parts

| Part | Description |
|------|-------------|
| `Alert.Root` | The alert container. Full width, rounded, with padding based on size. |
| `Alert.Icon` | Polymorphic status icon. Use `as={RiIconName}`. Colored by status (in non-filled variants). |
| `Alert.CloseIcon` | Dismiss icon. Defaults to `RiCloseLine` if no `as` prop is provided. Has reduced opacity. |

### Props on Root

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `variant` | `'filled'` \| `'light'` \| `'lighter'` \| `'stroke'` | `'filled'` | Visual style |
| `status` | `'error'` \| `'warning'` \| `'success'` \| `'information'` \| `'feature'` | `'information'` | Semantic status (determines color) |
| `size` | `'xsmall'` \| `'small'` \| `'large'` | `'small'` | Alert size |
| `wrapperClassName` | `string` | -- | Additional classes on the inner wrapper |

### Size Details

| Size | Height/Padding | Text | Icon | Use Case |
|------|---------------|------|------|----------|
| `xsmall` | `p-2`, `rounded-lg` | `text-paragraph-xs` | `size-4` | Inline hints, compact alerts |
| `small` | `px-2.5 py-2`, `rounded-lg` | `text-paragraph-sm` | `size-5` | Standard form messages |
| `large` | `p-3.5 pb-4`, `rounded-xl` | `text-paragraph-sm` | `size-5` | Prominent announcements |

### Variant Guide

| Variant | Filled | Light | Lighter | Stroke |
|---------|--------|-------|---------|--------|
| `error` | Red bg, white text | Red light bg, dark text | Red lighter bg, dark text | White bg, border, dark text |
| `warning` | Orange bg, white text | Orange light bg | Orange lighter bg | White bg, border |
| `success` | Green bg, white text | Green light bg | Green lighter bg | White bg, border |
| `information` | Blue bg, white text | Blue light bg | Blue lighter bg | White bg, border |
| `feature` | Gray bg, white text | Gray light bg | Gray lighter bg | White bg, border |

### Complete Usage Examples

```tsx
import * as Alert from '@/components/ui/alert';
import {
  RiErrorWarningLine,
  RiAlertLine,
  RiCheckboxCircleLine,
  RiInformationLine,
  RiSparklingLine,
} from '@remixicon/react';

// Error alert (filled)
<Alert.Root variant="filled" status="error" size="small">
  <Alert.Icon as={RiErrorWarningLine} />
  Something went wrong. Please try again.
</Alert.Root>

// Warning alert (light)
<Alert.Root variant="light" status="warning" size="small">
  <Alert.Icon as={RiAlertLine} />
  Your trial expires in 3 days.
</Alert.Root>

// Success alert (lighter)
<Alert.Root variant="lighter" status="success" size="small">
  <Alert.Icon as={RiCheckboxCircleLine} />
  Project created successfully.
</Alert.Root>

// Information alert (stroke)
<Alert.Root variant="stroke" status="information" size="small">
  <Alert.Icon as={RiInformationLine} />
  This feature is in beta.
</Alert.Root>

// Feature alert (lighter)
<Alert.Root variant="lighter" status="feature" size="large">
  <Alert.Icon as={RiSparklingLine} />
  New: AI-powered summaries are now available for all projects.
</Alert.Root>

// Dismissible alert
<Alert.Root variant="light" status="warning" size="small">
  <Alert.Icon as={RiAlertLine} />
  Your storage is almost full.
  <button type="button" onClick={handleDismiss} className="ml-auto">
    <Alert.CloseIcon />
  </button>
</Alert.Root>

// Custom close icon
<Alert.Root variant="stroke" status="information" size="small">
  <Alert.Icon as={RiInformationLine} />
  Update available.
  <button type="button" onClick={handleDismiss} className="ml-auto">
    <Alert.CloseIcon as={RiCloseLine} />
  </button>
</Alert.Root>

// Extra small for compact spaces
<Alert.Root variant="lighter" status="error" size="xsmall">
  <Alert.Icon as={RiErrorWarningLine} />
  Invalid email format.
</Alert.Root>

// Large for prominent messages
<Alert.Root variant="light" status="success" size="large">
  <Alert.Icon as={RiCheckboxCircleLine} />
  <div>
    <p className="text-label-sm">Payment successful</p>
    <p className="mt-1 text-paragraph-sm opacity-80">
      Your subscription has been renewed for another year.
    </p>
  </div>
</Alert.Root>

// Text only (no icon)
<Alert.Root variant="lighter" status="information" size="small">
  You have 5 unread notifications.
</Alert.Root>
```

---

## Banner

### Parts

| Part | Description |
|------|-------------|
| `Banner.Root` | Full-width banner container. Fixed height `h-11` (44px). Centered grid layout. |
| `Banner.Content` | Content wrapper. Centers the main content (icon + text). |
| `Banner.Icon` | Polymorphic icon. Colored by status/variant combination. |
| `Banner.CloseButton` | Dismiss button. Positioned at the end (right). Supports `asChild`. |

### Props on Root

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `variant` | `'filled'` \| `'light'` \| `'lighter'` \| `'stroke'` | `'filled'` | Visual style |
| `status` | `'error'` \| `'warning'` \| `'success'` \| `'information'` \| `'feature'` | `'feature'` | Semantic status |

### Complete Usage Examples

```tsx
import * as Banner from '@/components/ui/banner';
import {
  RiErrorWarningLine,
  RiInformationLine,
  RiCloseLine,
  RiSparklingLine,
} from '@remixicon/react';

// Error banner (filled)
<Banner.Root variant="filled" status="error">
  <Banner.Content>
    <Banner.Icon as={RiErrorWarningLine} />
    <span className="text-label-sm">Service disruption detected.</span>
  </Banner.Content>
  <Banner.CloseButton asChild>
    <button type="button" onClick={handleDismiss}>
      <RiCloseLine className="size-5" />
    </button>
  </Banner.CloseButton>
</Banner.Root>

// Information banner (light)
<Banner.Root variant="light" status="information">
  <Banner.Content>
    <Banner.Icon as={RiInformationLine} />
    <span className="text-label-sm">Scheduled maintenance on Feb 25, 2026.</span>
  </Banner.Content>
  <Banner.CloseButton asChild>
    <button type="button" onClick={handleDismiss}>
      <RiCloseLine className="size-5" />
    </button>
  </Banner.CloseButton>
</Banner.Root>

// Feature banner (lighter)
<Banner.Root variant="lighter" status="feature">
  <Banner.Content>
    <Banner.Icon as={RiSparklingLine} />
    <span className="text-label-sm">New features available! Check out the changelog.</span>
  </Banner.Content>
</Banner.Root>

// Stroke variant (subtle bottom border)
<Banner.Root variant="stroke" status="warning">
  <Banner.Content>
    <Banner.Icon as={RiAlertLine} />
    <span className="text-label-sm">Your subscription will renew tomorrow.</span>
  </Banner.Content>
  <Banner.CloseButton asChild>
    <button type="button" onClick={handleDismiss}>
      <RiCloseLine className="size-5" />
    </button>
  </Banner.CloseButton>
</Banner.Root>

// Banner without close button
<Banner.Root variant="filled" status="success">
  <Banner.Content>
    <Banner.Icon as={RiCheckboxCircleLine} />
    <span className="text-label-sm">All systems operational.</span>
  </Banner.Content>
</Banner.Root>
```

---

## Common Patterns

### Form validation summary

```tsx
{errors.length > 0 && (
  <Alert.Root variant="lighter" status="error" size="small">
    <Alert.Icon as={RiErrorWarningLine} />
    <div>
      <p className="text-label-sm">Please fix the following errors:</p>
      <ul className="mt-1 list-inside list-disc text-paragraph-xs">
        {errors.map((error, i) => (
          <li key={i}>{error}</li>
        ))}
      </ul>
    </div>
  </Alert.Root>
)}
```

### Dismissible state alert

```tsx
'use client';

import { useState } from 'react';
import * as Alert from '@/components/ui/alert';
import { RiInformationLine } from '@remixicon/react';

function DismissibleAlert() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <Alert.Root variant="stroke" status="information" size="small">
      <Alert.Icon as={RiInformationLine} />
      This is a beta feature. Feedback welcome.
      <button
        type="button"
        className="ml-auto"
        onClick={() => setVisible(false)}
      >
        <Alert.CloseIcon />
      </button>
    </Alert.Root>
  );
}
```

### Page-level banner at top of layout

```tsx
// In your layout or page component
<div className="flex flex-col">
  <Banner.Root variant="filled" status="information">
    <Banner.Content>
      <Banner.Icon as={RiInformationLine} />
      <span className="text-label-sm">Version 2.0 is now available.</span>
    </Banner.Content>
    <Banner.CloseButton asChild>
      <button type="button" onClick={handleDismiss}>
        <RiCloseLine className="size-5" />
      </button>
    </Banner.CloseButton>
  </Banner.Root>
  <main>{children}</main>
</div>
```

### Success message after action

```tsx
{showSuccess && (
  <Alert.Root variant="lighter" status="success" size="small">
    <Alert.Icon as={RiCheckboxCircleLine} />
    Changes saved successfully.
  </Alert.Root>
)}
```

## Rules

1. NEVER create custom alert/notification elements. Always use AlignUI Alert or Banner.
2. NEVER modify files in `/components/ui/`.
3. Use `Alert` for inline contextual messages within the page content.
4. Use `Banner` for full-width top-level announcements.
5. Always include `Alert.Icon` with a relevant Remixicon for visual clarity.
6. Use `Alert.CloseIcon` inside a `<button>` for dismissible alerts.
7. For Banner dismissal, use `Banner.CloseButton` with `asChild` wrapping a button.
8. Match `status` to semantic meaning: `error` for failures, `warning` for caution, `success` for confirmations, `information` for neutral info, `feature` for announcements.
9. Use `variant="filled"` for critical messages. Use `variant="lighter"` or `variant="stroke"` for low-priority info.
10. Banner has fixed height (44px). Do not put long multi-line content in banners.

## Related Skills

- `badge.md` -- For inline labels/tags, use Badge instead of Alert
- `modal.md` -- For confirmation dialogs, use Modal instead of Alert
- `button.md` -- Action buttons inside alert messages
