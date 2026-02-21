# Email Components Reference

## When to use

When building or modifying email templates and you need to know which shared components are available, their props, and how to use them correctly.

## Component inventory

All shared email components live in `/emails/components/` and `/emails/common/`. Every email template should compose from these building blocks.

---

### EmailLayout

**File:** `/emails/components/email-layout.tsx`
**Purpose:** Top-level wrapper for every email. Provides Html, Preview text, Tailwind CSS support, Head, Body, and a centered Container.

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `ReactNode` | Yes | Email content |
| `previewText` | `string` | Yes | Text shown in email client preview/snippet |

**Usage:**

```tsx
import { EmailLayout } from "./components/email-layout";

<EmailLayout previewText={`Your verification code for ${host}`}>
  {/* Logomark, Card, Footer go here */}
</EmailLayout>
```

**Renders:** `<Html>`, `<Preview>`, `<Tailwind>`, `<Head />`, `<Body className="bg-neutral-950 font-sans">`, `<Container className="mx-auto max-w-[580px] px-3 py-5">`.

---

### Card

**File:** `/emails/components/card.tsx`
**Purpose:** Dark-themed content card that contains the main email body. Renders as a `<Section>` with rounded corners and padding.

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `ReactNode` | Yes | Card content |

**Usage:**

```tsx
import { Card } from "./components/card";

<Card>
  <EmailHeading>Hi there,</EmailHeading>
  <EmailText>Your message content here.</EmailText>
</Card>
```

**Renders:** `<Section className="my-4 w-full rounded-3xl bg-zinc-800 p-10">`.

---

### EmailHeading

**File:** `/emails/components/email-text.tsx`
**Purpose:** Heading element for email titles/greetings. Renders as a `<Heading>` from `@react-email/components`.

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `ReactNode` | Yes | Heading text |
| `className` | `string` | No | Additional Tailwind classes |

**Usage:**

```tsx
import { EmailHeading } from "./components/email-text";

<EmailHeading>{name ? `Hi ${name},` : "Hi there,"}</EmailHeading>
```

**Default styles:** `mt-0 mb-4 font-medium text-white text-xl`.

---

### EmailText

**File:** `/emails/components/email-text.tsx`
**Purpose:** Paragraph element for body text. Renders as a `<Text>` from `@react-email/components`.

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `ReactNode` | Yes | Text content |
| `className` | `string` | No | Additional Tailwind classes |

**Usage:**

```tsx
import { EmailText } from "./components/email-text";

<EmailText>
  {"Please use the following code to verify your email address:"}
</EmailText>

{/* With custom styling */}
<EmailText className="text-gray-500 text-sm">
  {"This link will expire in 1 hour."}
</EmailText>

{/* Multi-line sign-off */}
<EmailText>
  {"Thanks,"}
  <br />
  {`The ${PROJECT.NAME} Team`}
</EmailText>
```

**Default styles:** `my-3 text-sm text-white leading-6`.

---

### EmailFooter

**File:** `/emails/components/email-text.tsx`
**Purpose:** Footer section with optional social/legal links and automatic copyright line.

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `className` | `string` | No | Additional classes for the copyright text |
| `twitterLink` | `string` | No | Twitter/X profile URL |
| `linkedinLink` | `string` | No | LinkedIn profile URL |
| `docsLink` | `string` | No | Documentation URL |
| `privacyLink` | `string` | No | Privacy policy URL |
| `termsLink` | `string` | No | Terms of service URL |

**Usage:**

```tsx
import { EmailFooter } from "./components/email-text";

{/* Minimal -- just copyright */}
<EmailFooter />

{/* With links */}
<EmailFooter
  twitterLink="https://twitter.com/company"
  privacyLink="https://example.com/privacy"
  termsLink="https://example.com/terms"
/>
```

**Renders:** A `<Section>` with optional dot-separated links and `"(c) {year} {PROJECT.COMPANY}"` text.

---

### EmailButton

**File:** `/emails/components/email-button.tsx`
**Purpose:** Call-to-action button rendered as a styled `<Button>` from `@react-email/components`.

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `href` | `string` | Yes | URL the button links to |
| `children` | `ReactNode` | Yes | Button label text |

**Usage:**

```tsx
import { EmailButton } from "./components/email-button";

<EmailButton href={verificationUrl}>{"Verify Email"}</EmailButton>
<EmailButton href={resetUrl}>{"Reset password"}</EmailButton>
```

**Renders:** `<Button className="mx-auto my-5 block w-auto rounded-md bg-[#0085ff] px-6 py-3 text-center font-medium text-base text-white no-underline">`.

---

### OtpDisplay

**File:** `/emails/components/otp-display.tsx`
**Purpose:** Displays a 6-digit OTP code in a styled monospace block with wide letter-spacing for readability.

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `otp` | `string` | Yes | The OTP code string (e.g. `"123456"`) |

**Usage:**

```tsx
import { OtpDisplay } from "./components/otp-display";

<OtpDisplay otp={otp} />
```

**Renders:** `<Section className="mx-auto w-full rounded-md bg-[#323336] text-center">` with `<Text className="font-mono text-lg text-white leading-5 tracking-[10px]">`.

---

### Logo

**File:** `/emails/common/logo.tsx`
**Purpose:** Renders the company logo as an inline SVG in a centered `<Section>`. Typically not used directly in templates (use `Logomark` instead).

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `className` | `string` | No | Additional Tailwind classes |

**Usage:**

```tsx
import { Logo } from "./common/logo";

<Logo className="text-white" />
```

---

### Logomark

**File:** `/emails/common/logomark.tsx`
**Purpose:** Renders the logo icon alongside the product name (`PROJECT.NAME`). This is the standard branding element used above the Card in every template.

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `className` | `string` | No | Additional classes for the container |
| `logoClassName` | `string` | No | Additional classes for the logo icon |
| `textClassName` | `string` | No | Additional classes for the product name text |

**Usage:**

```tsx
import { Logomark } from "./common/logomark";

<div className="mb-6 flex w-full items-center justify-center">
  <Logomark className="h-8 text-white" />
</div>
```

---

## Standard template composition

Every email template follows this composition order:

```tsx
<EmailLayout previewText="...">
  {/* 1. Logomark (branding) */}
  <div className="mb-6 flex w-full items-center justify-center">
    <Logomark className="h-8 text-white" />
  </div>

  {/* 2. Card (main content) */}
  <Card>
    <EmailHeading>{"Greeting"}</EmailHeading>
    <EmailText>{"Body paragraph"}</EmailText>
    <EmailButton href="...">{"CTA"}</EmailButton>     {/* optional */}
    <OtpDisplay otp={otp} />                            {/* optional */}
    <EmailText>
      {"Thanks,"}
      <br />
      {`The ${PROJECT.NAME} Team`}
    </EmailText>
  </Card>

  {/* 3. Footer (copyright + optional links) */}
  <EmailFooter />
</EmailLayout>
```

## Import patterns

All components are imported via relative paths from within `/emails/`:

```typescript
// Layout and card
import { EmailLayout } from "./components/email-layout";
import { Card } from "./components/card";

// Text components (multiple exports from one file)
import { EmailFooter, EmailHeading, EmailText } from "./components/email-text";

// Interactive elements
import { EmailButton } from "./components/email-button";
import { OtpDisplay } from "./components/otp-display";

// Branding
import { Logomark } from "./common/logomark";
import { Logo } from "./common/logo";

// Project constants
import { PROJECT } from "@/constants/project";
```

## Rules

- ALWAYS use these shared components -- do NOT create custom email components unless the design requires something truly novel
- ALWAYS import `EmailHeading`, `EmailText`, and `EmailFooter` from the same file: `./components/email-text`
- ALWAYS place `Logomark` above the `Card`, wrapped in a centered flex div
- ALWAYS place `EmailFooter` after the `Card`, not inside it
- Use `className` prop on `EmailText` for variant styling (e.g. `text-gray-500 text-sm` for muted text)
- The `cn()` utility from `@/lib/utils` is used internally by these components for class merging -- you do not need to use it in templates

## Related skills

- See `create-template.md` for the full template creation workflow
- See `send-email.md` for sending emails with Resend
