# Better Auth - Overview, Configuration & Auth Flow

## When to Use

Use this skill when you need to:
- Understand how authentication works in this codebase
- Add new auth plugins or providers
- Debug auth-related issues
- Understand the full user lifecycle (sign up, verify, sign in, sign out)

## Architecture Overview

This project uses **Better Auth v1.4.18** as the authentication framework. It runs entirely server-side (no external auth service) and stores all auth data in Neon Postgres via the Drizzle adapter.

### Key Decisions

- **Email/password** is the only credential method (no social OAuth)
- **Email verification is required** before a user can sign in
- **OTP-based verification** (6-digit code sent via email) instead of magic links
- **Auto sign-in** after registration and after email verification
- **Session-based** auth with HTTP-only cookies managed by `nextCookies()` plugin

## Configuration File

The auth configuration lives at `/auth.ts`:

```typescript
import { render } from "@react-email/components";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins/email-otp";

import { PROJECT } from "@/constants/project";
import { db } from "@/db";
import VerifyEmailTemplate from "@/emails/verify-email";
import { env } from "@/env";
import { resend } from "@/lib/utils/email/resend";

export const auth = betterAuth({
  baseURL: getBaseUrl(),
  trustedOrigins: [getBaseUrl()],
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: true,
  },
  telemetry: {
    enabled: false,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
  },
  plugins: [
    emailOTP({
      generateOTP: () => {
        if (env.NODE_ENV === "testing") {
          return "123456";
        }
        // Cryptographically secure 6-digit code
        const randomBytes = crypto.getRandomValues(new Uint8Array(4));
        const randomNumber = randomBytes.reduce(
          (acc, byte, i) => acc + byte * 256 ** i,
          0
        );
        return String(randomNumber % 1_000_000).padStart(6, "0");
      },
      async sendVerificationOTP({ email, otp }, request) {
        const host = request?.headers?.get("host") ?? "localhost:3000";
        const protocol = getProtocol();
        const verificationUrl = `${protocol}://${host}/verification?otp=${otp}&email=${email}`;

        const html = await render(
          VerifyEmailTemplate({ otp, host, verificationUrl })
        );

        await resend.emails.send({
          from: env.RESEND_FROM_EMAIL,
          to: email,
          subject: `Your verification code for ${PROJECT.NAME}`,
          html,
        });
      },
    }),
    nextCookies(),
  ],
});
```

### Configuration Breakdown

| Option | Value | Purpose |
|--------|-------|---------|
| `emailAndPassword.enabled` | `true` | Enables email/password sign-up and sign-in |
| `emailAndPassword.requireEmailVerification` | `true` | Blocks sign-in until email is verified |
| `emailAndPassword.autoSignIn` | `true` | Auto signs in after successful registration |
| `emailVerification.autoSignInAfterVerification` | `true` | Auto signs in after OTP verification |
| `nextCookies()` | plugin | Manages session cookies in Next.js (SSR-compatible) |
| `emailOTP()` | plugin | Enables OTP-based email verification and password reset |

## Database Schema

Auth tables are defined in `/db/schema/auth/schema.ts`. Better Auth manages these tables automatically via the Drizzle adapter:

| Table | Purpose |
|-------|---------|
| `user` | User accounts (id, name, email, emailVerified, image) |
| `session` | Active sessions (token, expiresAt, userId, ipAddress, userAgent) |
| `account` | Credential/provider accounts (password hash stored here for email/password) |
| `verification` | OTP codes and reset tokens (identifier, value, expiresAt) |

**Important**: The `user.id` field is `text`, not `uuid`. When creating schemas that reference users, use `text` type for the foreign key:

```typescript
userId: text("user_id")
  .notNull()
  .references(() => user.id, { onDelete: "cascade" }),
```

## API Route

All Better Auth endpoints are handled by a single catch-all route at `/app/api/auth/[...all]/route.ts`:

```typescript
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/auth";

export const { POST, GET } = toNextJsHandler(auth);
```

This exposes endpoints like:
- `POST /api/auth/sign-up/email` - Register
- `POST /api/auth/sign-in/email` - Sign in
- `GET /api/auth/get-session` - Get current session
- `POST /api/auth/sign-out` - Sign out
- `POST /api/auth/email-otp/send-verification-otp` - Send OTP
- `POST /api/auth/email-otp/verify-email` - Verify OTP
- `POST /api/auth/forget-password/email-otp` - Request password reset OTP
- `POST /api/auth/reset-password` - Reset password with token

## Complete Auth Flow

### Sign Up Flow

```
User fills sign-up form
  -> authClient.signUp.email({ name, email, password })
  -> Better Auth creates user + account records
  -> autoSignIn creates a session
  -> Client calls authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" })
  -> Better Auth generates 6-digit OTP, stores in verification table
  -> sendVerificationOTP callback sends email via Resend
  -> Redirect to /verification?email=...
  -> User enters OTP (or clicks link in email with ?otp=...)
  -> authClient.emailOtp.verifyEmail({ email, otp })
  -> Better Auth marks emailVerified = true, auto signs in
  -> Redirect to /dashboard
```

### Sign In Flow

```
User fills sign-in form
  -> authClient.signIn.email({ email, password, callbackURL, rememberMe })
  -> If email not verified:
       -> Error code: EMAIL_NOT_VERIFIED
       -> Client sends verification OTP
       -> Redirect to /verification?email=...
  -> If invalid credentials:
       -> Error code: INVALID_EMAIL_OR_PASSWORD
       -> Show error message
  -> If success:
       -> Session created, cookies set
       -> Auto redirect to callbackURL (/dashboard)
```

### Forgot Password Flow

```
User enters email on /forgot-password
  -> authClient.forgetPassword.emailOtp({ email })
  -> Better Auth sends password reset email with token link
  -> User clicks link -> /reset-password?token=...
  -> User enters new password + confirmation
  -> authClient.resetPassword({ newPassword, token })
  -> Success -> redirect to /sign-in?message=Your password has been reset successfully.
```

### Sign Out Flow

```
Server action in /server/actions/sign-out.ts
  -> auth.api.signOut({ headers: await headers() })
  -> revalidatePath(PAGES.SIGN_IN)
  -> redirect(PAGES.SIGN_IN)
```

## Page Constants

All auth page paths are centralized in `/constants/pages.ts`:

```typescript
export const AUTH_PAGES = {
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFICATION: "/verification",
};

export const APPLICATION_PAGES = {
  DASHBOARD: "/dashboard",
};

export const PAGES = {
  ...MARKETING_PAGES,
  ...APPLICATION_PAGES,
  ...AUTH_PAGES,
};
```

Always use `PAGES.SIGN_IN` instead of hardcoding `"/sign-in"`.

## Auth Error Constants

Error codes are defined in `/constants/auth-errors.ts`:

```typescript
export const AUTH_ERRORS = {
  USER_NOT_FOUND: "USER_NOT_FOUND",
  INVALID_EMAIL_OR_PASSWORD: "INVALID_EMAIL_OR_PASSWORD",
  INVALID_OTP: "INVALID_OTP",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
  PASSWORD_TOO_SHORT: "PASSWORD_TOO_SHORT",
  PASSWORD_TOO_LONG: "PASSWORD_TOO_LONG",
  // ... and more
};
```

Always compare `ctx.error.code` against `AUTH_ERRORS.XXX` constants, never raw strings.

## Session Type

The session type is inferred from the auth config at `/lib/auth/types.ts`:

```typescript
import type { auth } from "@/auth";

export type Session = typeof auth.$Infer.Session;
```

The `Session` type contains:
- `session`: `{ id, token, expiresAt, userId, ... }`
- `user`: `{ id, name, email, emailVerified, image, createdAt, updatedAt }`

## Key Files Reference

| File | Purpose |
|------|---------|
| `/auth.ts` | Better Auth configuration |
| `/app/api/auth/[...all]/route.ts` | Auth API catch-all route |
| `/lib/auth/utils.ts` | `getServerSession()` helper |
| `/lib/auth/client.ts` | `authClient` for client-side auth |
| `/lib/auth/types.ts` | `Session` type export |
| `/constants/auth-errors.ts` | Error code constants |
| `/constants/pages.ts` | Page path constants |
| `/validators/auth.ts` | Zod schemas for auth forms |
| `/server/actions/sign-out.ts` | Server action for sign-out |
| `/server/middleware/auth.middleware.ts` | oRPC auth middleware |
| `/db/schema/auth/` | Auth database tables |

## Rules

- NEVER modify `/auth.ts` unless explicitly adding a new plugin or provider
- ALWAYS use the `PAGES` constants for redirects, never hardcode paths
- ALWAYS use `AUTH_ERRORS` constants for error code comparisons
- The `user.id` column is `text` type, not `uuid` -- use `text` for foreign keys referencing users
- The `nextCookies()` plugin MUST be the last plugin in the array
- In testing environment, OTP is always `"123456"`

## Related Skills

- `session-check.md` - How to read session data server-side and client-side
- `protect-pages.md` - How to protect pages with layout-level session checks
- `protect-api.md` - How to protect oRPC procedures with auth middleware
- `auth-client.md` - Full reference for the `authClient` methods
