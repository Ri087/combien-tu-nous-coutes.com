# Password Reset - Forgot Password + Reset Password Flow

## When to Use

Use this skill when you need to:
- Understand or modify the forgot password flow
- Understand or modify the reset password flow
- Debug password reset issues
- Implement password strength criteria UI

## Complete Flow

```
1. User clicks "Forgot password?" on /sign-in
2. Navigates to /forgot-password
3. User enters email
4. authClient.forgetPassword.emailOtp({ email })
5. Better Auth sends email with reset link containing token
6. Success message: "Check your email for a password reset link."
7. User clicks link -> /reset-password?token=...
8. If ?error param -> redirect to /forgot-password with error
9. If no ?token -> redirect to /sign-in
10. User enters new password + confirm password
11. authClient.resetPassword({ newPassword, token })
12. Success -> redirect to /sign-in?message=Your password has been reset successfully.
```

## File Structure

```
/app/(auth)/forgot-password/
  page.tsx                              # Server page
  _components/
    forgot-password-form.tsx            # Email form

/app/(auth)/reset-password/
  page.tsx                              # Server page with token guard
  search-params.ts                      # nuqs: token + error params
  _components/
    reset-password-form.tsx             # New password form
    level-bar.tsx                       # Password strength indicator

/validators/auth.ts                     # forgotPasswordSchema, resetPasswordSchema
```

## Part 1: Forgot Password

### Zod Validator

From `/validators/auth.ts`:

```typescript
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});
```

### Page Component

The page at `/app/(auth)/forgot-password/page.tsx`:

```typescript
import type { Metadata } from "next";

import { ForgotPasswordForm } from "./_components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
};

type SearchParams = Promise<{ error: string | null }>;

export default async function PageForgotPassword({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error } = await searchParams;

  return (
    <div className="w-full max-w-[472px] px-4">
      <ForgotPasswordForm error={error} />
    </div>
  );
}
```

The page reads an optional `?error=...` param (set when the reset link is invalid/expired).

### Form Component

The form at `/app/(auth)/forgot-password/_components/forgot-password-form.tsx`:

```typescript
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiDoorLockFill, RiMailCheckFill, RiMailLine } from "@remixicon/react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { StaggeredFadeLoader } from "@/components/staggered-fade-loader";
import * as Divider from "@/components/ui/divider";
import * as FancyButton from "@/components/ui/fancy-button";
import { FormGlobalMessage, FormMessage } from "@/components/ui/form";
import * as Input from "@/components/ui/input";
import * as Label from "@/components/ui/label";
import * as LinkButton from "@/components/ui/link-button";
import { PROJECT } from "@/constants/project";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils/cn";
import { forgotPasswordSchema } from "@/validators/auth";

export function ForgotPasswordForm({ error }: { error: string | null }) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsLoading(true);
    const { error } = await authClient.forgetPassword.emailOtp({
      email: values.email,
    });

    if (error) {
      form.setError("email", {
        message: error.message,
      });
    } else {
      setSuccess(true);
    }

    setIsLoading(false);
  }

  return (
    <form
      className="flex w-full flex-col gap-6 rounded-20 bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset md:p-8"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {/* Header with lock icon */}
      <div className="flex flex-col items-center gap-2">
        {/* ... icon ... */}
        <div className="space-y-1 text-center">
          <div className="text-title-h6 lg:text-title-h5">
            Forgot your password?
          </div>
          <div className="text-paragraph-sm text-text-sub-600 lg:text-paragraph-md">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </div>
        </div>
      </div>

      <Divider.Root />

      {/* Email input */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Label.Root htmlFor="email">
            Email <Label.Asterisk />
          </Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Icon as={RiMailLine} />
              <Input.Input
                id="email"
                placeholder={`hello@${PROJECT.DOMAIN}`}
                required
                type="email"
                {...form.register("email")}
              />
            </Input.Wrapper>
          </Input.Root>
          {form.formState.errors.email && (
            <FormMessage variant="error">
              {form.formState.errors.email.message}
            </FormMessage>
          )}
        </div>
      </div>

      {/* Success message */}
      {success && (
        <FormGlobalMessage Icon={RiMailCheckFill} variant="success">
          Check your email for a password reset link.
        </FormGlobalMessage>
      )}

      {/* Error from redirect (invalid/expired link) */}
      {error && !success && (
        <FormGlobalMessage variant="error">{error}</FormGlobalMessage>
      )}

      <FancyButton.Root disabled={isLoading} size="medium" variant="primary">
        {isLoading ? (
          <>
            <StaggeredFadeLoader variant="muted" />
            Sending email...
          </>
        ) : (
          "Reset password"
        )}
      </FancyButton.Root>

      {/* Contact support link */}
      <div className="flex flex-col items-center gap-1 text-center text-paragraph-sm text-text-sub-600">
        Don&apos;t have access anymore?
        <LinkButton.Root asChild size="medium" underline variant="black">
          <Link href={`mailto:${PROJECT.HELP_EMAIL}`}>Contact us</Link>
        </LinkButton.Root>
      </div>
    </form>
  );
}
```

### Key Pattern: Await-Style Error Handling

Unlike sign-in/sign-up which use callback-style (`onError/onSuccess`), the forgot password form uses **await-style**:

```typescript
const { error } = await authClient.forgetPassword.emailOtp({
  email: values.email,
});

if (error) {
  form.setError("email", { message: error.message });
} else {
  setSuccess(true);
}
```

Both patterns work with Better Auth's client. The await style is simpler for single-action flows.

## Part 2: Reset Password

### Zod Validator

From `/validators/auth.ts`:

```typescript
export const resetPasswordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
```

Note the `.refine()` for cross-field validation (password match check).

### Search Params

Defined in `/app/(auth)/reset-password/search-params.ts`:

```typescript
import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const resetPasswordParsers = {
  error: parseAsString,
  token: parseAsString,
};

export const searchParamsCache = createSearchParamsCache(resetPasswordParsers);
```

### Page Component with Guards

The page at `/app/(auth)/reset-password/page.tsx`:

```typescript
import { redirect } from "next/navigation";
import type { SearchParams } from "nuqs/server";

import { PAGES } from "@/constants/pages";

import { ResetPasswordForm } from "./_components/reset-password-form";
import { searchParamsCache } from "./search-params";

type ResetPasswordPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function PageResetPassword({
  searchParams,
}: ResetPasswordPageProps) {
  const { token, error } = await searchParamsCache.parse(searchParams);

  if (error) {
    redirect(`${PAGES.FORGOT_PASSWORD}?error=This link is invalid or expired`);
  }

  if (!token) {
    redirect(PAGES.SIGN_IN);
  }

  return (
    <div className="w-full max-w-[472px] px-4">
      <ResetPasswordForm />
    </div>
  );
}
```

**Guards**:
1. If `?error=...` is present: redirect to `/forgot-password?error=This link is invalid or expired`
2. If `?token` is missing: redirect to `/sign-in`

### Form Component with Password Strength

The form at `/app/(auth)/reset-password/_components/reset-password-form.tsx`:

```typescript
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiLockFill,
} from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import * as React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { PasswordInput } from "@/app/(auth)/_components/password-input";
import { StaggeredFadeLoader } from "@/components/staggered-fade-loader";
import * as Divider from "@/components/ui/divider";
import * as FancyButton from "@/components/ui/fancy-button";
import { FormMessage } from "@/components/ui/form";
import * as Label from "@/components/ui/label";
import { PAGES } from "@/constants/pages";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils/cn";
import { resetPasswordSchema } from "@/validators/auth";

import { resetPasswordParsers } from "../search-params";
import * as LevelBar from "./level-bar";

const uppercaseRegex = /[A-Z]/;
const numberRegex = /[0-9]/;

export function ResetPasswordForm() {
  const [{ token }] = useQueryStates(resetPasswordParsers);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const [criteria, setCriteria] = React.useState({
    length: false,
    uppercase: false,
    number: false,
  });

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue("password", value);
    setCriteria({
      length: value.length >= 8,
      uppercase: uppercaseRegex.test(value),
      number: numberRegex.test(value),
    });
  };

  const countTrueCriteria = (criteria: { [key: string]: boolean }): number => {
    return Object.values(criteria).filter((value) => value).length;
  };

  const trueCriteriaCount = countTrueCriteria(criteria);

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    setIsLoading(true);
    if (!token) {
      return;
    }

    await authClient.resetPassword(
      {
        newPassword: values.password,
        token,
      },
      {
        onError: (ctx) => {
          form.setError("password", {
            message: ctx.error.message,
          });
          setIsLoading(false);
        },
        onSuccess: () => {
          router.push(
            PAGES.SIGN_IN +
              "?message=" +
              "Your password has been reset successfully."
          );
        },
      }
    );
  }

  return (
    <form
      className="flex w-full flex-col gap-6 rounded-20 bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset md:p-8"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {/* Header */}
      {/* ... */}

      <Divider.Root variant="line-spacing" />

      {/* Password inputs */}
      <div className="space-y-3">
        <div className="space-y-1">
          <Label.Root htmlFor="password">
            New password <Label.Asterisk />
          </Label.Root>
          <PasswordInput
            id="password"
            {...form.register("password")}
            onChange={handlePasswordChange}
          />
          {form.formState.errors.password && (
            <FormMessage variant="error">
              {form.formState.errors.password.message}
            </FormMessage>
          )}
        </div>

        <div className="space-y-1">
          <Label.Root htmlFor="confirm-password">
            Confirm new password <Label.Asterisk />
          </Label.Root>
          <PasswordInput
            id="confirm-password"
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword && (
            <FormMessage variant="error">
              {form.formState.errors.confirmPassword.message}
            </FormMessage>
          )}
        </div>

        {/* Password criteria with level bar */}
        <div className="mt-2.5 space-y-2">
          <LevelBar.Root level={trueCriteriaCount} levels={3} />
          <div className="text-paragraph-xs text-text-sub-600">
            Your password must meet the following criteria:
          </div>
          {/* Uppercase criterion */}
          <div className="flex items-center gap-1.5 text-paragraph-xs text-text-sub-600">
            {criteria.uppercase ? (
              <RiCheckboxCircleFill className="size-4 shrink-0 text-success-base" />
            ) : (
              <RiCloseCircleFill className="size-4 shrink-0 text-text-soft-400" />
            )}
            At least one uppercase letter
          </div>
          {/* Number criterion */}
          <div className="flex items-center gap-1.5 text-paragraph-xs text-text-sub-600">
            {criteria.number ? (
              <RiCheckboxCircleFill className="size-4 shrink-0 text-success-base" />
            ) : (
              <RiCloseCircleFill className="size-4 shrink-0 text-text-soft-400" />
            )}
            At least one number
          </div>
          {/* Length criterion */}
          <div className="flex items-center gap-1.5 text-paragraph-xs text-text-sub-600">
            {criteria.length ? (
              <RiCheckboxCircleFill className="size-4 shrink-0 text-success-base" />
            ) : (
              <RiCloseCircleFill className="size-4 shrink-0 text-text-soft-400" />
            )}
            At least 8 characters
          </div>
        </div>
      </div>

      <FancyButton.Root disabled={isLoading} size="medium" variant="primary">
        {isLoading ? (
          <>
            <StaggeredFadeLoader variant="muted" />
            Resetting password...
          </>
        ) : (
          "Reset password"
        )}
      </FancyButton.Root>
    </form>
  );
}
```

## Password Strength Criteria UI

The reset password form includes a real-time password strength indicator with three criteria:

```typescript
const [criteria, setCriteria] = React.useState({
  length: false,      // >= 8 characters
  uppercase: false,   // At least 1 uppercase letter
  number: false,      // At least 1 number
});
```

Updated on every keystroke via `handlePasswordChange`:

```typescript
const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  form.setValue("password", value);
  setCriteria({
    length: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    number: /[0-9]/.test(value),
  });
};
```

The `LevelBar` component shows progress (0/3, 1/3, 2/3, 3/3):

```typescript
<LevelBar.Root level={trueCriteriaCount} levels={3} />
```

Each criterion shows a green check or gray X icon:
- Green: `RiCheckboxCircleFill` with `text-success-base`
- Gray: `RiCloseCircleFill` with `text-text-soft-400`

## authClient Methods

### Forgot Password (Request OTP)

```typescript
const { error } = await authClient.forgetPassword.emailOtp({
  email: string,
});
```

Note: The method is `forgetPassword` (not `forgotPassword`) -- this is Better Auth's naming.

### Reset Password

```typescript
await authClient.resetPassword(
  {
    newPassword: string,    // The new password
    token: string,          // Token from email link URL
  },
  {
    onError: (ctx) => { /* ctx.error.message */ },
    onSuccess: () => { /* Password reset! */ },
  }
);
```

## Redirect Flow

```
/sign-in (click "Forgot password?")
  -> /forgot-password (enter email)
  -> Email sent with link to /reset-password?token=xxx
  -> /reset-password (enter new password)
  -> /sign-in?message=Your password has been reset successfully.
```

If the reset link is expired/invalid:
```
/reset-password?error=true
  -> /forgot-password?error=This link is invalid or expired
```

## Rules

- ALWAYS guard the reset password page: redirect if no token, redirect if error
- ALWAYS use `resetPasswordSchema` with `.refine()` for password match validation
- ALWAYS show real-time password strength criteria
- ALWAYS redirect to `/sign-in?message=...` after successful reset
- ALWAYS use `authClient.forgetPassword.emailOtp()` (note: `forgetPassword`, not `forgotPassword`)
- NEVER store the reset token in client-side state beyond what nuqs provides from the URL
- The token is a one-time use token -- after successful reset, it is invalidated

## Related Skills

- `sign-in-flow.md` - Where users go after password reset
- `otp-verification.md` - OTP patterns (similar email-based verification)
- `auth-client.md` - Full authClient API reference
- `overview.md` - Auth architecture overview
