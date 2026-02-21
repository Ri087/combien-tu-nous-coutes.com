# Create an Email Template

## When to use

When you need to create a new transactional email (welcome, notification, invitation, password reset, etc.). Each email template is a React component in `/emails/` that uses the shared layout and component library.

## Steps

### 1. Define the props interface

Determine what data the email needs. Every template receives its data as props.

```typescript
interface InvitationEmailTemplateProps {
  inviterName: string;
  teamName: string;
  inviteUrl: string;
  recipientName?: string;
}
```

### 2. Create the template file

Create `/emails/[template-name].tsx`. The file must:

- Default-export the component function
- Attach a `.PreviewProps` static property for the React Email dev preview
- Use the shared components for consistent styling

```typescript
// /emails/invitation.tsx
import { PROJECT } from "@/constants/project";

import { Logomark } from "./common/logomark";
import { Card } from "./components/card";
import { EmailButton } from "./components/email-button";
import { EmailLayout } from "./components/email-layout";
import { EmailFooter, EmailHeading, EmailText } from "./components/email-text";

interface InvitationEmailTemplateProps {
  inviterName: string;
  teamName: string;
  inviteUrl: string;
  recipientName?: string;
}

export default function InvitationEmailTemplate({
  inviterName,
  teamName,
  inviteUrl,
  recipientName,
}: InvitationEmailTemplateProps) {
  return (
    <EmailLayout
      previewText={`${inviterName} invited you to join ${teamName} on ${PROJECT.NAME}`}
    >
      <div className="mb-6 flex w-full items-center justify-center">
        <Logomark className="h-8 text-white" />
      </div>

      <Card>
        <EmailHeading>
          {recipientName ? `Hi ${recipientName},` : "Hi there,"}
        </EmailHeading>

        <EmailText>
          <strong>{inviterName}</strong>
          {" has invited you to join "}
          <strong>{teamName}</strong>
          {` on ${PROJECT.NAME}. Click the button below to accept the invitation:`}
        </EmailText>

        <EmailButton href={inviteUrl}>{"Accept Invitation"}</EmailButton>

        <EmailText>
          {
            "If you weren't expecting this invitation, you can safely ignore this email."
          }
        </EmailText>

        <EmailText>
          {"Thanks,"}
          <br />
          {`The ${PROJECT.NAME} Team`}
        </EmailText>
      </Card>

      <EmailFooter />
    </EmailLayout>
  );
}

InvitationEmailTemplate.PreviewProps = {
  inviterName: "Alice",
  teamName: "Acme Corp",
  inviteUrl: `https://${PROJECT.DOMAIN}/invite?token=abc123`,
  recipientName: "Leonard",
} as InvitationEmailTemplateProps;
```

### 3. Template structure breakdown

Every template follows this exact structure:

```
<EmailLayout previewText="...">        <!-- Wraps Html, Preview, Tailwind, Head, Body, Container -->
  <div className="mb-6 ...">           <!-- Logomark above the card -->
    <Logomark className="h-8 text-white" />
  </div>

  <Card>                               <!-- Main content block (dark card) -->
    <EmailHeading>...</EmailHeading>    <!-- Greeting heading -->
    <EmailText>...</EmailText>          <!-- Body paragraphs -->
    <EmailButton href="...">...</EmailButton>  <!-- CTA button (optional) -->
    <OtpDisplay otp={otp} />           <!-- OTP code display (optional) -->
    <EmailText>Closing text</EmailText> <!-- Sign-off -->
  </Card>

  <EmailFooter />                      <!-- Copyright and optional links -->
</EmailLayout>
```

### 4. Using OTP codes

If the email contains a verification code, use `OtpDisplay`:

```typescript
import { OtpDisplay } from "./components/otp-display";

// Inside <Card>:
<OtpDisplay otp={otp} />
```

The `otp` prop is a string (e.g. `"123456"`). The component renders it in a styled monospace block with letter-spacing.

### 5. Using the PROJECT constant

Always use `PROJECT` from `@/constants/project` for branding:

```typescript
import { PROJECT } from "@/constants/project";

// Available properties:
// PROJECT.NAME     - "Impulse Next.js" (product name)
// PROJECT.COMPANY  - "Impulse Lab" (company name)
// PROJECT.DOMAIN   - "impulselab.ai" (domain)
```

Use `PROJECT.NAME` for product references, `PROJECT.COMPANY` for legal/footer text.

### 6. PreviewProps

Attach a `.PreviewProps` static property with realistic sample data for the React Email dev preview. Cast it to the props interface:

```typescript
InvitationEmailTemplate.PreviewProps = {
  inviterName: "Alice",
  teamName: "Acme Corp",
  inviteUrl: `https://${PROJECT.DOMAIN}/invite?token=abc123`,
  recipientName: "Leonard",
} as InvitationEmailTemplateProps;
```

### 7. Preview the template

Run the React Email dev server to preview in-browser:

```bash
pnpm dev:email
```

This starts the preview server on port 3001. Open `http://localhost:3001` and select your template.

## Template file conventions

| Convention | Rule |
|---|---|
| File location | `/emails/[kebab-case-name].tsx` |
| Export | `export default function TemplateNameTemplate(props)` |
| Props interface | Defined in the same file, above the component |
| PreviewProps | `.PreviewProps` static property with cast `as PropsInterface` |
| Imports order | External packages, then `@/constants`, then relative `./common/*`, then relative `./components/*` |

## Rules

- ALWAYS use `EmailLayout` as the outermost wrapper -- it provides Html, Preview, Tailwind, Head, Body, Container
- ALWAYS include `<Logomark className="h-8 text-white" />` above the Card
- ALWAYS wrap main content in `<Card>`
- ALWAYS end with `<EmailFooter />` after the Card
- ALWAYS attach `.PreviewProps` for the dev preview
- ALWAYS use `PROJECT.NAME` or `PROJECT.COMPANY` instead of hardcoding the product name
- ALWAYS use `EmailText` for paragraphs and `EmailHeading` for headings -- do NOT use raw HTML `<p>` or `<h1>`
- ALWAYS use `EmailButton` for CTA links -- do NOT use raw `<a>` tags for primary actions
- Use string literals wrapped in `{}` for text content (e.g. `{"Click here"}`) to match codebase style
- The default export can be either `export default function` at declaration or `export default` at the bottom -- both patterns exist in the codebase

## Related skills

- See `send-email.md` for how to send the template with Resend
- See `email-components.md` for the full component reference
