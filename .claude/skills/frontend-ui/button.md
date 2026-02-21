# AlignUI Button Components

## When to Use

Use Button components for all clickable actions in the application: form submissions, navigation triggers, toolbar actions, dialog confirmations, and any interactive element that performs an action on click.

Choose the right button type based on context:
- **Button** -- Standard action buttons (primary CTAs, form actions, toolbar buttons)
- **CompactButton** -- Icon-only buttons in tight spaces (close buttons, inline actions, table row actions)
- **FancyButton** -- Hero/premium CTAs with gradient overlay animation (landing pages, onboarding, upgrade prompts)
- **LinkButton** -- Text-styled buttons that look like links (inline text actions, "Learn more", "View all")
- **SocialButton** -- OAuth/social login buttons (sign-in pages, account linking)

## Import Patterns

```tsx
import * as Button from '@/components/ui/button';
import * as CompactButton from '@/components/ui/compact-button';
import * as FancyButton from '@/components/ui/fancy-button';
import * as LinkButton from '@/components/ui/link-button';
import * as SocialButton from '@/components/ui/social-button';
```

## Button (Standard)

### Parts

| Part | Description |
|------|-------------|
| `Button.Root` | The button container. Accepts all standard `<button>` HTML attributes. |
| `Button.Icon` | Polymorphic icon wrapper. Use `as={RiIconName}` to render a Remixicon. |

### Props on Root

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `variant` | `'primary'` \| `'neutral'` \| `'error'` | `'primary'` | Color scheme |
| `mode` | `'filled'` \| `'stroke'` \| `'lighter'` \| `'ghost'` | `'filled'` | Visual style |
| `size` | `'medium'` \| `'small'` \| `'xsmall'` \| `'xxsmall'` | `'medium'` | Button height (40px/36px/32px/28px) |
| `asChild` | `boolean` | `false` | Render as child element (Radix Slot pattern) |
| `disabled` | `boolean` | `false` | Disabled state |

### Complete Usage Examples

```tsx
import * as Button from '@/components/ui/button';
import { RiAddLine, RiDeleteBinLine, RiArrowRightLine } from '@remixicon/react';

// Primary filled (default) -- main CTA
<Button.Root>
  Create Project
</Button.Root>

// Primary filled with leading icon
<Button.Root variant="primary" mode="filled" size="medium">
  <Button.Icon as={RiAddLine} />
  New Project
</Button.Root>

// Neutral stroke -- secondary action
<Button.Root variant="neutral" mode="stroke" size="medium">
  Cancel
</Button.Root>

// Neutral ghost -- tertiary/low-emphasis action
<Button.Root variant="neutral" mode="ghost" size="small">
  <Button.Icon as={RiArrowRightLine} />
  View Details
</Button.Root>

// Error filled -- destructive action
<Button.Root variant="error" mode="filled" size="medium">
  <Button.Icon as={RiDeleteBinLine} />
  Delete
</Button.Root>

// Primary lighter -- soft emphasis
<Button.Root variant="primary" mode="lighter" size="small">
  Edit
</Button.Root>

// Small button
<Button.Root variant="neutral" mode="stroke" size="xsmall">
  Options
</Button.Root>

// As link using asChild
<Button.Root variant="primary" mode="filled" asChild>
  <a href="/dashboard">Go to Dashboard</a>
</Button.Root>

// Disabled state
<Button.Root variant="primary" mode="filled" disabled>
  Processing...
</Button.Root>

// With trailing icon
<Button.Root variant="primary" mode="filled">
  Next
  <Button.Icon as={RiArrowRightLine} />
</Button.Root>
```

### Variant Guide

| Variant | Mode | Use Case |
|---------|------|----------|
| `primary` + `filled` | Main CTA, submit buttons | High emphasis |
| `primary` + `stroke` | Secondary primary action | Medium emphasis |
| `primary` + `lighter` | Soft primary accent | Low emphasis |
| `primary` + `ghost` | Inline primary action | Minimal emphasis |
| `neutral` + `filled` | Important non-primary action | High emphasis neutral |
| `neutral` + `stroke` | Standard secondary button | Most common secondary |
| `neutral` + `lighter` | Soft neutral action | Low emphasis neutral |
| `neutral` + `ghost` | Toolbar/inline actions | Minimal emphasis |
| `error` + `filled` | Destructive primary action | Delete, remove |
| `error` + `stroke` | Destructive secondary action | Cancel with warning |
| `error` + `lighter` | Soft destructive hint | Low emphasis destructive |
| `error` + `ghost` | Inline destructive action | Minimal destructive |

---

## CompactButton (Icon-Only)

### Parts

| Part | Description |
|------|-------------|
| `CompactButton.Root` | The icon-only button container. |
| `CompactButton.Icon` | Polymorphic icon. Use `as={RiIconName}`. |

### Props on Root

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `variant` | `'stroke'` \| `'ghost'` \| `'white'` \| `'modifiable'` | `'stroke'` | Visual style |
| `size` | `'large'` \| `'medium'` | `'large'` | Size (24px/20px) |
| `fullRadius` | `boolean` | `false` | Circular shape (`rounded-full`) vs default (`rounded-md`) |
| `asChild` | `boolean` | `false` | Render as child element |

### Usage Examples

```tsx
import * as CompactButton from '@/components/ui/compact-button';
import { RiCloseLine, RiMoreLine, RiEditLine, RiDeleteBinLine } from '@remixicon/react';

// Close button (ghost) -- most common for dialogs/panels
<CompactButton.Root variant="ghost" size="large">
  <CompactButton.Icon as={RiCloseLine} />
</CompactButton.Root>

// Stroke variant -- bordered icon button
<CompactButton.Root variant="stroke" size="large">
  <CompactButton.Icon as={RiMoreLine} />
</CompactButton.Root>

// White variant -- on dark backgrounds
<CompactButton.Root variant="white" size="large">
  <CompactButton.Icon as={RiEditLine} />
</CompactButton.Root>

// Circular shape
<CompactButton.Root variant="stroke" size="large" fullRadius>
  <CompactButton.Icon as={RiDeleteBinLine} />
</CompactButton.Root>

// Medium size
<CompactButton.Root variant="ghost" size="medium">
  <CompactButton.Icon as={RiMoreLine} />
</CompactButton.Root>
```

---

## FancyButton (Gradient CTA)

### Parts

| Part | Description |
|------|-------------|
| `FancyButton.Root` | The gradient button container with overlay animation. |
| `FancyButton.Icon` | Polymorphic icon. Use `as={RiIconName}`. |

### Props on Root

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `variant` | `'neutral'` \| `'primary'` \| `'destructive'` \| `'basic'` | `'neutral'` | Color scheme with gradient |
| `size` | `'medium'` \| `'small'` \| `'xsmall'` | `'medium'` | Button height (40px/36px/32px) |
| `asChild` | `boolean` | `false` | Render as child element |

### Usage Examples

```tsx
import * as FancyButton from '@/components/ui/fancy-button';
import { RiSparklingLine, RiArrowRightLine } from '@remixicon/react';

// Neutral -- premium dark CTA
<FancyButton.Root variant="neutral" size="medium">
  <FancyButton.Icon as={RiSparklingLine} />
  Upgrade to Pro
</FancyButton.Root>

// Primary -- branded CTA with gradient
<FancyButton.Root variant="primary" size="medium">
  Get Started
  <FancyButton.Icon as={RiArrowRightLine} />
</FancyButton.Root>

// Destructive -- attention-grabbing destructive
<FancyButton.Root variant="destructive" size="small">
  Delete Account
</FancyButton.Root>

// Basic -- outlined with shadow (no gradient overlay)
<FancyButton.Root variant="basic" size="medium">
  Learn More
</FancyButton.Root>
```

---

## LinkButton (Text Link)

### Parts

| Part | Description |
|------|-------------|
| `LinkButton.Root` | The text link button container. |
| `LinkButton.Icon` | Polymorphic icon. Use `as={RiIconName}`. |

### Props on Root

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `variant` | `'gray'` \| `'black'` \| `'primary'` \| `'error'` \| `'modifiable'` | `'gray'` | Text color |
| `size` | `'medium'` \| `'small'` | `'medium'` | Text size (h=20px/16px) |
| `underline` | `boolean` | `false` | Always show underline (default: underline on hover only) |
| `asChild` | `boolean` | `false` | Render as child element |

### Usage Examples

```tsx
import * as LinkButton from '@/components/ui/link-button';
import { RiArrowRightLine, RiExternalLinkLine } from '@remixicon/react';

// Gray link (default)
<LinkButton.Root variant="gray" size="medium">
  View all projects
  <LinkButton.Icon as={RiArrowRightLine} />
</LinkButton.Root>

// Primary link
<LinkButton.Root variant="primary" size="medium">
  Learn more
</LinkButton.Root>

// Always underlined
<LinkButton.Root variant="primary" size="small" underline>
  Documentation
  <LinkButton.Icon as={RiExternalLinkLine} />
</LinkButton.Root>

// As anchor tag
<LinkButton.Root variant="primary" asChild>
  <a href="https://example.com" target="_blank" rel="noopener noreferrer">
    Visit Site
    <LinkButton.Icon as={RiExternalLinkLine} />
  </a>
</LinkButton.Root>
```

---

## SocialButton (OAuth)

### Parts

| Part | Description |
|------|-------------|
| `SocialButton.Root` | The social login button container. Fixed height 40px. |
| `SocialButton.Icon` | Polymorphic icon for the brand logo. Use `as={BrandIcon}`. |

### Props on Root

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `brand` | `'apple'` \| `'twitter'` \| `'google'` \| `'facebook'` \| `'linkedin'` \| `'github'` \| `'dropbox'` | -- | Social brand |
| `mode` | `'filled'` \| `'stroke'` | `'filled'` | Visual style |
| `asChild` | `boolean` | `false` | Render as child element |

### Usage Examples

```tsx
import * as SocialButton from '@/components/ui/social-button';
import { RiGoogleFill, RiGithubFill, RiAppleFill } from '@remixicon/react';

// Google filled
<SocialButton.Root brand="google" mode="filled">
  <SocialButton.Icon as={RiGoogleFill} />
  Continue with Google
</SocialButton.Root>

// GitHub stroke
<SocialButton.Root brand="github" mode="stroke">
  <SocialButton.Icon as={RiGithubFill} />
  Continue with GitHub
</SocialButton.Root>

// Apple filled
<SocialButton.Root brand="apple" mode="filled">
  <SocialButton.Icon as={RiAppleFill} />
  Continue with Apple
</SocialButton.Root>
```

---

## Common Patterns

### Form with primary + secondary buttons

```tsx
<div className="flex items-center justify-end gap-3">
  <Button.Root variant="neutral" mode="stroke" size="medium">
    Cancel
  </Button.Root>
  <Button.Root variant="primary" mode="filled" size="medium" type="submit">
    Save Changes
  </Button.Root>
</div>
```

### Destructive confirmation dialog footer

```tsx
<Modal.Footer>
  <Modal.Close asChild>
    <Button.Root variant="neutral" mode="stroke" size="medium">
      Cancel
    </Button.Root>
  </Modal.Close>
  <Button.Root variant="error" mode="filled" size="medium" onClick={handleDelete}>
    <Button.Icon as={RiDeleteBinLine} />
    Delete
  </Button.Root>
</Modal.Footer>
```

### Button loading state

```tsx
<Button.Root variant="primary" mode="filled" disabled={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}
</Button.Root>
```

### Social login stack

```tsx
<div className="flex flex-col gap-3">
  <SocialButton.Root brand="google" mode="stroke">
    <SocialButton.Icon as={RiGoogleFill} />
    Continue with Google
  </SocialButton.Root>
  <SocialButton.Root brand="github" mode="stroke">
    <SocialButton.Icon as={RiGithubFill} />
    Continue with GitHub
  </SocialButton.Root>
</div>
```

---

## Rules

1. NEVER create custom `<button>` elements. Always use the AlignUI Button components.
2. NEVER modify files in `/components/ui/`. These are the design system -- read-only.
3. Always use the namespace import pattern: `import * as Button from '@/components/ui/button'`.
4. Use `Button.Icon` with the `as` prop for icons. Do not place raw `<RiIcon />` elements as children.
5. Use `asChild` with `<a>` or Next.js `<Link>` for navigation buttons.
6. Match button emphasis to action importance: `filled` > `stroke` > `lighter` > `ghost`.
7. Use `CompactButton` for icon-only actions, never `Button.Root` without text.
8. Reserve `FancyButton` for hero CTAs only -- do not overuse gradient buttons.
9. Always pair `variant="error"` with destructive actions only (delete, remove, revoke).
10. Icons come from `@remixicon/react`. Example: `import { RiAddLine } from '@remixicon/react'`.

## Related Skills

- `modal.md` -- Button placement in dialog footers
- `input.md` -- Form submit buttons
- `dropdown.md` -- Trigger buttons for dropdown menus
