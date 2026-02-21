# Auth Client - Frontend API Reference

## When to Use

Use this skill when you need to:
- Call any authentication method from a client component
- Look up the correct method name and parameters for an auth action
- Understand the difference between callback-style and await-style usage
- Implement any auth-related client interaction

## Setup

The auth client is defined in `/lib/auth/client.ts`:

```typescript
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
});
```

Import it in any client component:

```typescript
"use client";

import { authClient } from "@/lib/auth/client";
```

## Available Methods

### Session

#### `authClient.useSession()` (React Hook)

Returns the current session reactively. Re-renders when session changes.

```typescript
"use client";

import { authClient } from "@/lib/auth/client";

export function MyComponent() {
  const { data: session, isPending, error } = authClient.useSession();

  if (isPending) return <p>Loading...</p>;
  if (!session) return <p>Not logged in</p>;

  return <p>Hello, {session.user.name}</p>;
}
```

**Return type**:
```typescript
{
  data: {
    session: { id, token, expiresAt, userId, ipAddress, userAgent, createdAt, updatedAt },
    user: { id, name, email, emailVerified, image, createdAt, updatedAt }
  } | null;
  isPending: boolean;
  error: Error | null;
}
```

#### `authClient.getSession()` (Async)

One-off session fetch, not a hook. Use outside of React render.

```typescript
const { data: session, error } = await authClient.getSession();
```

---

### Sign Up

#### `authClient.signUp.email()`

Creates a new user account with email and password.

```typescript
authClient.signUp.email(
  {
    name: "John Doe",
    email: "john@example.com",
    password: "SecurePass1",
  },
  {
    onError: (ctx) => {
      // ctx.error.code: "USER_ALREADY_EXISTS" | "PASSWORD_TOO_SHORT" | etc.
      // ctx.error.message: human-readable string
    },
    onSuccess: () => {
      // User created, auto signed in (session cookie set)
    },
  }
);
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | User's display name |
| `email` | `string` | Yes | User's email address |
| `password` | `string` | Yes | Must meet password requirements |

**Common errors**: `USER_ALREADY_EXISTS`, `PASSWORD_TOO_SHORT`, `PASSWORD_TOO_LONG`

---

### Sign In

#### `authClient.signIn.email()`

Signs in with email and password.

```typescript
authClient.signIn.email(
  {
    email: "john@example.com",
    password: "SecurePass1",
    callbackURL: "/dashboard",
    rememberMe: false,
  },
  {
    onError: (ctx) => {
      // ctx.error.code: "EMAIL_NOT_VERIFIED" | "INVALID_EMAIL_OR_PASSWORD" | etc.
    },
    // No onSuccess needed when callbackURL is set
  }
);
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | User's email |
| `password` | `string` | Yes | User's password |
| `callbackURL` | `string` | No | Redirect URL on success |
| `rememberMe` | `boolean` | No | Extend session duration |

**Common errors**: `EMAIL_NOT_VERIFIED`, `INVALID_EMAIL_OR_PASSWORD`, `USER_NOT_FOUND`

**Important**: When `EMAIL_NOT_VERIFIED` is returned, the app sends a verification OTP and redirects to `/verification?email=...`.

---

### Email OTP

#### `authClient.emailOtp.sendVerificationOtp()`

Sends a 6-digit OTP to the user's email for verification.

```typescript
authClient.emailOtp.sendVerificationOtp(
  {
    email: "john@example.com",
    type: "email-verification",
  },
  {
    onError: (ctx) => {
      // Error sending OTP
    },
    onSuccess: () => {
      // OTP sent successfully
    },
  }
);
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | Recipient email |
| `type` | `"email-verification"` | Yes | Always use this value |

**Note**: There is a shared utility at `/app/(auth)/_lib/send-verification-otp.ts` that wraps this in a Promise:

```typescript
import sendVerificationOtp from "@/app/(auth)/_lib/send-verification-otp";

const redirectUrl = await sendVerificationOtp("john@example.com");
// redirectUrl = "/verification?email=john@example.com"
router.push(redirectUrl);
```

#### `authClient.emailOtp.verifyEmail()`

Verifies the user's email with the OTP code.

```typescript
authClient.emailOtp.verifyEmail(
  {
    email: "john@example.com",
    otp: "123456",
  },
  {
    onError: (ctx) => {
      // ctx.error.code: "INVALID_OTP"
    },
    onSuccess: () => {
      // Email verified, user auto signed in
      // Redirect to dashboard
    },
  }
);
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | The email being verified |
| `otp` | `string` | Yes | The 6-digit code |

**Common errors**: `INVALID_OTP`

---

### Password Reset

#### `authClient.forgetPassword.emailOtp()`

Requests a password reset email. The email contains a link with a token.

```typescript
const { error } = await authClient.forgetPassword.emailOtp({
  email: "john@example.com",
});

if (error) {
  // Handle error
} else {
  // Show success message
}
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | User's email address |

**Important naming**: The method is `forgetPassword` (not `forgotPassword`). This is Better Auth's convention.

#### `authClient.resetPassword()`

Resets the password using the token from the email link.

```typescript
await authClient.resetPassword(
  {
    newPassword: "NewSecurePass1",
    token: "token-from-url",
  },
  {
    onError: (ctx) => {
      // Invalid or expired token
    },
    onSuccess: () => {
      // Password reset, redirect to sign-in
    },
  }
);
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `newPassword` | `string` | Yes | The new password |
| `token` | `string` | Yes | Reset token from URL |

---

### Password Change (Authenticated)

#### `authClient.changePassword()`

Changes the password for a signed-in user. Requires the current password.

```typescript
const { error } = await authClient.changePassword({
  currentPassword: "OldPass1",
  newPassword: "NewPass1",
  revokeOtherSessions: true,
});
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `currentPassword` | `string` | Yes | Current password for verification |
| `newPassword` | `string` | Yes | New password |
| `revokeOtherSessions` | `boolean` | No | Revoke all other sessions |

The Zod validator for this is in `/validators/auth.ts`:

```typescript
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
      .regex(/[0-9]/, "Password must contain at least 1 number"),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters long")
      .regex(/[A-Z]/, "Confirm password must contain at least 1 uppercase letter")
      .regex(/[0-9]/, "Confirm password must contain at least 1 number"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
```

---

### User Profile

#### `authClient.updateUser()`

Updates the current user's profile.

```typescript
const { error } = await authClient.updateUser({
  name: "New Name",
  image: "https://example.com/avatar.jpg",
});
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | No | Update display name |
| `image` | `string` | No | Update profile image URL |

---

### Sign Out (Client-Side)

#### `authClient.signOut()`

Signs out the current user from the client side.

```typescript
await authClient.signOut();
```

**Note**: This codebase uses a **server action** for sign-out instead of the client method. The server action at `/server/actions/sign-out.ts` calls `auth.api.signOut()` server-side, revalidates the path, and redirects:

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { PAGES } from "@/constants/pages";

export async function signOut() {
  await auth.api.signOut({
    headers: await headers(),
  });
  revalidatePath(PAGES.SIGN_IN);
  redirect(PAGES.SIGN_IN);
}
```

Prefer the server action for sign-out because it handles cache revalidation and server-side redirect.

---

### Session Management

#### `authClient.listSessions()`

Lists all active sessions for the current user.

```typescript
const { data: sessions } = await authClient.listSessions();
// sessions: Array<{ id, token, expiresAt, userAgent, ipAddress, ... }>
```

#### `authClient.revokeSession()`

Revokes a specific session.

```typescript
await authClient.revokeSession({
  token: "session-token-to-revoke",
});
```

#### `authClient.revokeSessions()`

Revokes all sessions except the current one.

```typescript
await authClient.revokeSessions();
```

---

## Two Invocation Styles

Better Auth's client supports two styles of calling methods:

### Callback Style

Used in most auth forms in this codebase:

```typescript
authClient.signIn.email(
  { email, password, callbackURL: PAGES.DASHBOARD },
  {
    onError: (ctx) => {
      console.error(ctx.error.code, ctx.error.message);
    },
    onSuccess: () => {
      // Handle success
    },
  }
);
```

### Await Style

Returns `{ data, error }`:

```typescript
const { data, error } = await authClient.forgetPassword.emailOtp({
  email,
});

if (error) {
  console.error(error.message);
} else {
  // Success
}
```

Both styles work for all methods. The codebase uses:
- **Callback style** for sign-up, sign-in, verification, reset password (where error-specific branching is needed)
- **Await style** for forgot password (simpler flow)

## Error Object Shape

In callback style:

```typescript
onError: (ctx) => {
  ctx.error.code;     // string - AUTH_ERRORS constant (e.g., "INVALID_EMAIL_OR_PASSWORD")
  ctx.error.message;  // string - Human-readable error message
}
```

In await style:

```typescript
const { error } = await authClient.someMethod(params);
if (error) {
  error.code;     // string
  error.message;  // string
}
```

Always compare error codes against the `AUTH_ERRORS` constants from `/constants/auth-errors.ts`.

## Rules

- ALWAYS import from `@/lib/auth/client` (never create a new `createAuthClient` instance)
- ALWAYS use `AUTH_ERRORS` constants for error code comparison, not raw strings
- ALWAYS use the `signOut` server action instead of `authClient.signOut()` for sign-out
- ALWAYS use `authClient.useSession()` in React components (not `getSession()`)
- The `emailOTPClient()` plugin must be included for `emailOtp.*` methods to work
- The method is `forgetPassword` (not `forgotPassword`) -- this is Better Auth's naming
- `useSession()` is a React hook -- only use it in client components, and follow React hook rules

## Quick Reference Table

| Action | Method | Style Used |
|--------|--------|-----------|
| Get session (hook) | `authClient.useSession()` | Hook |
| Get session (async) | `authClient.getSession()` | Await |
| Sign up | `authClient.signUp.email()` | Callback |
| Sign in | `authClient.signIn.email()` | Callback |
| Send verification OTP | `authClient.emailOtp.sendVerificationOtp()` | Callback |
| Verify email | `authClient.emailOtp.verifyEmail()` | Callback |
| Forgot password | `authClient.forgetPassword.emailOtp()` | Await |
| Reset password | `authClient.resetPassword()` | Callback |
| Change password | `authClient.changePassword()` | Await |
| Update user | `authClient.updateUser()` | Await |
| Sign out | `signOut()` server action | Server action |
| List sessions | `authClient.listSessions()` | Await |
| Revoke session | `authClient.revokeSession()` | Await |
| Revoke all sessions | `authClient.revokeSessions()` | Await |

## Related Skills

- `overview.md` - Auth architecture and configuration
- `session-check.md` - Server-side vs client-side session checks
- `sign-up-flow.md` - Sign-up implementation details
- `sign-in-flow.md` - Sign-in implementation details
- `otp-verification.md` - OTP verification flow
- `password-reset.md` - Password reset flow
