# Send Emails with Resend

## When to use

When you need to send a transactional email from server-side code -- from an oRPC handler, a server action, a Better Auth plugin callback, or any other server context.

## Steps

### 1. Understand the sending flow

The flow to send an email is:

1. Import the email template component
2. Call the template function with its props to get a React element
3. Render the React element to HTML using `render()` from `@react-email/components`
4. Send the HTML via `resend.emails.send()`

### 2. Send an email

```typescript
import { render } from "@react-email/components";
import { PROJECT } from "@/constants/project";
import InvitationEmailTemplate from "@/emails/invitation";
import { env } from "@/env";
import { resend } from "@/lib/utils/email/resend";

async function sendInvitationEmail(params: {
  to: string;
  inviterName: string;
  teamName: string;
  inviteUrl: string;
  recipientName?: string;
}) {
  const html = await render(
    InvitationEmailTemplate({
      inviterName: params.inviterName,
      teamName: params.teamName,
      inviteUrl: params.inviteUrl,
      recipientName: params.recipientName,
    })
  );

  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: params.to,
    subject: `You've been invited to join ${params.teamName} on ${PROJECT.NAME}`,
    html,
  });
}
```

### 3. Key imports

| Import | From | Purpose |
|---|---|---|
| `render` | `@react-email/components` | Converts React Email component to HTML string |
| `resend` | `@/lib/utils/email/resend` | Pre-configured Resend client instance |
| `env` | `@/env` | Type-safe environment variables |
| `PROJECT` | `@/constants/project` | Branding constants for subject lines |

### 4. The Resend client

The Resend client is pre-configured in `/lib/utils/email/resend.ts`:

```typescript
import { Resend } from "resend";
import { env } from "@/env";

export const resend = new Resend(env.RESEND_API_KEY);
```

Always import from `@/lib/utils/email/resend` -- never create a new Resend instance.

### 5. Environment variables

Two environment variables are required:

| Variable | Description | Example |
|---|---|---|
| `RESEND_API_KEY` | Resend API key | `re_xxxxxxxxxxxxx` |
| `RESEND_FROM_EMAIL` | Sender email address | `noreply@impulselab.ai` |

Both are validated via Zod in `/env.ts`. The app will fail to start if they are missing.

### 6. Using in an oRPC handler

```typescript
// /server/routers/invitations.ts
import { render } from "@react-email/components";
import { z } from "zod";
import { PROJECT } from "@/constants/project";
import InvitationEmailTemplate from "@/emails/invitation";
import { env } from "@/env";
import { resend } from "@/lib/utils/email/resend";
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const invitationsRouter = {
  sendInvite: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        teamName: z.string().min(1),
      })
    )
    .handler(async ({ context, input }) => {
      const inviteUrl = `https://${PROJECT.DOMAIN}/invite?token=generated-token`;

      const html = await render(
        InvitationEmailTemplate({
          inviterName: context.session.user.name,
          teamName: input.teamName,
          inviteUrl,
        })
      );

      await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to: input.email,
        subject: `Join ${input.teamName} on ${PROJECT.NAME}`,
        html,
      });

      return { success: true };
    }),
};
```

### 7. Using in Better Auth callbacks

The codebase already uses this pattern in `/auth.ts` for OTP verification:

```typescript
// Inside a Better Auth plugin callback
async sendVerificationOTP({ email, otp }, request) {
  const host = request?.headers?.get("host") ?? "localhost:3000";
  const protocol = getProtocol();
  const verificationUrl = `${protocol}://${host}/verification?otp=${otp}&email=${email}`;

  const html = await render(
    VerifyEmailTemplate({
      otp,
      host,
      verificationUrl,
    })
  );

  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: email,
    subject: `Your verification code for ${PROJECT.NAME}`,
    html,
  });
},
```

### 8. Error handling

Wrap `resend.emails.send()` in a try/catch when the caller needs to handle failures gracefully:

```typescript
try {
  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: recipientEmail,
    subject: "Your subject",
    html,
  });
} catch (error) {
  console.error("Failed to send email:", error);
  // Decide: throw to caller, or silently fail
  // For critical emails (auth), throw
  // For optional emails (notifications), you may log and continue
}
```

### 9. Sending to multiple recipients

The `to` field accepts a string or an array of strings:

```typescript
await resend.emails.send({
  from: env.RESEND_FROM_EMAIL,
  to: ["user1@example.com", "user2@example.com"],
  subject: "Team notification",
  html,
});
```

## resend.emails.send() parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `from` | `string` | Yes | Sender email -- always use `env.RESEND_FROM_EMAIL` |
| `to` | `string \| string[]` | Yes | Recipient email(s) |
| `subject` | `string` | Yes | Email subject line |
| `html` | `string` | Yes | Rendered HTML from `render()` |
| `cc` | `string \| string[]` | No | CC recipients |
| `bcc` | `string \| string[]` | No | BCC recipients |
| `reply_to` | `string \| string[]` | No | Reply-to address |

## Rules

- ALWAYS use `render()` from `@react-email/components` to convert the template to HTML -- do NOT call `ReactDOMServer.renderToString()`
- ALWAYS import the Resend client from `@/lib/utils/email/resend` -- do NOT instantiate a new `Resend()`
- ALWAYS use `env.RESEND_FROM_EMAIL` for the `from` field -- do NOT hardcode sender addresses
- ALWAYS use `PROJECT.NAME` in subject lines for consistent branding
- ALWAYS `await` the `render()` call -- it returns a Promise
- ALWAYS `await` the `resend.emails.send()` call
- Call the template as a function (e.g. `VerifyEmailTemplate({ otp })`) -- do NOT use JSX (e.g. `<VerifyEmailTemplate otp={otp} />`) when passing to `render()`

## Related skills

- See `create-template.md` for how to create a new email template
- See `email-components.md` for the shared component reference
