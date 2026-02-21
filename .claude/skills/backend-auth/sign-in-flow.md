# Sign-In Flow - Complete Implementation

## When to Use

Use this skill when you need to:
- Understand or modify the sign-in flow
- Handle sign-in errors (invalid credentials, unverified email)
- Add "remember me" functionality
- Debug sign-in issues

## Complete Flow

```
1. User navigates to /sign-in
2. Auth layout checks session -> if logged in, redirect to /dashboard
3. User fills form (email, password, optional rememberMe)
4. Client-side validation via Zod (signInSchema)
5. authClient.signIn.email({ email, password, callbackURL, rememberMe })
6. If EMAIL_NOT_VERIFIED:
     -> Send verification OTP
     -> Redirect to /verification?email=...
7. If INVALID_EMAIL_OR_PASSWORD:
     -> Show "Invalid email or password." error
8. If success:
     -> Session created, cookies set
     -> Auto redirect to callbackURL (/dashboard)
```

## File Structure

```
/app/(auth)/sign-in/
  page.tsx                     # Server page component
  search-params.ts             # nuqs search params (message, error)
  _components/
    sign-in-form.tsx           # Client form component

/app/(auth)/_lib/
  send-verification-otp.ts    # Shared OTP sending utility
```

## Step 1: Search Params

Defined in `/app/(auth)/sign-in/search-params.ts`:

```typescript
import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const messageParsers = {
  message: parseAsString.withDefault(""),
  error: parseAsString.withDefault(""),
};

export const searchParamsCache = createSearchParamsCache(messageParsers);
```

The sign-in page accepts:
- `?message=...` - Success message (e.g., after password reset)
- `?error=...` - Error message (e.g., from external redirect)

## Step 2: Page Component

The page at `/app/(auth)/sign-in/page.tsx`:

```typescript
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";

import { SignInForm } from "./_components/sign-in-form";
import { searchParamsCache } from "./search-params";

export const metadata: Metadata = {
  title: "Sign In",
};

type SignInPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function PageLogin({ searchParams }: SignInPageProps) {
  await searchParamsCache.parse(searchParams);

  return <SignInForm />;
}
```

## Step 3: Inline Zod Schema

The sign-in form defines its schema inline (not in `/validators/auth.ts`):

```typescript
export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});
```

**Note**: The password validation here is intentionally minimal (`min(1)`) because we don't want to enforce password complexity rules on sign-in -- only sign-up. The server will return `INVALID_EMAIL_OR_PASSWORD` for wrong credentials.

## Step 4: Form Component

The form at `/app/(auth)/sign-in/_components/sign-in-form.tsx`:

```typescript
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as LabelPrimitive from "@radix-ui/react-label";
import {
  RiCheckboxCircleFill,
  RiErrorWarningFill,
  RiMailLine,
  RiUserFill,
} from "@remixicon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PasswordInput } from "@/app/(auth)/_components/password-input";
import sendVerificationOtp from "../../_lib/send-verification-otp";
import { StaggeredFadeLoader } from "@/components/staggered-fade-loader";
import * as Checkbox from "@/components/ui/checkbox";
import * as Divider from "@/components/ui/divider";
import * as FancyButton from "@/components/ui/fancy-button";
import { FormGlobalMessage, FormMessage } from "@/components/ui/form";
import * as Input from "@/components/ui/input";
import * as Label from "@/components/ui/label";
import * as LinkButton from "@/components/ui/link-button";
import { AUTH_ERRORS } from "@/constants/auth-errors";
import { PAGES } from "@/constants/pages";
import { PROJECT } from "@/constants/project";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils/cn";

import { messageParsers } from "../search-params";

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

export function SignInForm() {
  const router = useRouter();
  const [{ message, error: errorQuery }] = useQueryStates(messageParsers);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorQuery);

  const { register, handleSubmit, formState, setValue } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (values: z.infer<typeof signInSchema>) => {
    setError(null);
    setIsLoading(true);

    authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: PAGES.DASHBOARD,
        rememberMe: values.rememberMe,
      },
      {
        onError: (ctx) => {
          if (ctx.error.code === AUTH_ERRORS.EMAIL_NOT_VERIFIED) {
            // Email not verified -> send OTP and redirect
            sendVerificationOtp(values.email)
              .then((redirectUrl) => {
                router.push(redirectUrl);
              })
              .catch((error) => {
                setError(error as string);
              })
              .finally(() => {
                setIsLoading(false);
              });
          } else if (ctx.error.code === AUTH_ERRORS.INVALID_EMAIL_OR_PASSWORD) {
            setIsLoading(false);
            setError("Invalid email or password.");
          } else {
            setIsLoading(false);
            setError(ctx.error.message);
          }
        },
        // No onSuccess needed -- Better Auth handles redirect via callbackURL
      }
    );
  };

  return (
    <div className="w-full max-w-[472px] px-4">
      <section className="flex w-full flex-col gap-6 rounded-20 bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset md:p-8">
        <form
          className="flex w-full flex-col gap-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* ... icon and title ... */}
          <Divider.Root />

          <div className="flex flex-col gap-3">
            {/* Email field */}
            <div className="flex flex-col gap-1">
              <Label.Root htmlFor="email">
                Email <Label.Asterisk />
              </Label.Root>
              <Input.Root hasError={!!formState.errors.email}>
                <Input.Wrapper>
                  <Input.Icon as={RiMailLine} />
                  <Input.Input
                    {...register("email")}
                    autoComplete="email webauthn"
                    id="email"
                    placeholder={`hello@${PROJECT.DOMAIN}`}
                    required
                    type="email"
                  />
                </Input.Wrapper>
              </Input.Root>
              <FormMessage>{formState.errors.email?.message}</FormMessage>
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1">
              <Label.Root htmlFor="password">
                Password <Label.Asterisk />
              </Label.Root>
              <PasswordInput
                {...register("password")}
                autoComplete="current-password webauthn"
                hasError={!!formState.errors.password}
                id="password"
                required
              />
              <FormMessage>{formState.errors.password?.message}</FormMessage>
            </div>
          </div>

          {/* Global error message */}
          <FormGlobalMessage Icon={RiErrorWarningFill} variant="error">
            {error}
          </FormGlobalMessage>

          {/* Success message (e.g., after password reset) */}
          {message && !error && (
            <FormGlobalMessage Icon={RiCheckboxCircleFill} variant="success">
              {message}
            </FormGlobalMessage>
          )}

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-2">
              <Checkbox.Root
                id="agree"
                onCheckedChange={(value) => {
                  setValue("rememberMe", !!value);
                }}
                {...register("rememberMe")}
              />
              <LabelPrimitive.Root
                className="block cursor-pointer text-paragraph-sm"
                htmlFor="agree"
              >
                Remember me
              </LabelPrimitive.Root>
            </div>
            <LinkButton.Root asChild size="medium" underline variant="gray">
              <Link href={PAGES.FORGOT_PASSWORD}>Forgot password?</Link>
            </LinkButton.Root>
          </div>

          <FancyButton.Root
            disabled={isLoading}
            size="medium"
            variant="primary"
          >
            {isLoading && <StaggeredFadeLoader variant="muted" />}
            {isLoading ? "Signing in..." : "Sign in"}
          </FancyButton.Root>
        </form>
      </section>
    </div>
  );
}
```

## Error Handling

| Error Code | Handling | User-Facing Result |
|-----------|---------|-------------------|
| `EMAIL_NOT_VERIFIED` | Send verification OTP, redirect to `/verification?email=...` | User sees verification page |
| `INVALID_EMAIL_OR_PASSWORD` | Show error message | "Invalid email or password." |
| Other errors | Show server error message | `ctx.error.message` |

### EMAIL_NOT_VERIFIED Flow

This is the most important error case. When a user tries to sign in but hasn't verified their email:

1. The sign-in fails with `EMAIL_NOT_VERIFIED`
2. The form calls `sendVerificationOtp(values.email)` to trigger a new OTP
3. On success, the user is redirected to `/verification?email=...`
4. After verification, `autoSignInAfterVerification: true` signs them in automatically
5. They are redirected to `/dashboard`

## authClient.signIn.email Parameters

```typescript
authClient.signIn.email(
  {
    email: string,           // User's email
    password: string,        // User's password
    callbackURL: string,     // Where to redirect after success (PAGES.DASHBOARD)
    rememberMe: boolean,     // Extend session duration
  },
  {
    onError: (ctx) => {
      // ctx.error.code - AUTH_ERRORS constant
      // ctx.error.message - Human-readable message
    },
    // onSuccess is optional -- callbackURL handles redirect
  }
);
```

**Note**: There is no `onSuccess` callback in the current implementation. Better Auth handles the redirect via `callbackURL` when sign-in succeeds.

## Search Params Messages

The sign-in page reads search params for messages:

```
/sign-in?message=Your password has been reset successfully.
```

This is used by the password reset flow to show a success message after the user resets their password.

```
/sign-in?error=Some error message
```

This is used for error messages from external redirects.

The `message` is shown as a green success banner, and `error` is shown as a red error banner.

## UI Components Used

- `PasswordInput` - Custom password field with show/hide toggle
- `Input.Root / Input.Wrapper / Input.Icon / Input.Input` - AlignUI input
- `Label.Root / Label.Asterisk` - AlignUI label
- `Checkbox.Root` - AlignUI checkbox for "Remember me"
- `FancyButton.Root` - AlignUI primary button
- `FormMessage` - Field-level error
- `FormGlobalMessage` - Form-level error/success banner
- `LinkButton.Root` - Text link button for "Forgot password?"
- `Divider.Root` - Visual separator
- `StaggeredFadeLoader` - Loading animation

## Rules

- ALWAYS handle `EMAIL_NOT_VERIFIED` by sending OTP and redirecting to verification
- ALWAYS handle `INVALID_EMAIL_OR_PASSWORD` with a user-friendly message
- ALWAYS use `PAGES.DASHBOARD` as the `callbackURL`
- ALWAYS use the `AUTH_ERRORS` constants for error code comparison
- NEVER show raw server error codes to the user
- The sign-in schema validation is minimal on purpose -- server validates credentials
- The `autoComplete` attributes (`email webauthn`, `current-password webauthn`) enable passkey support

## Related Skills

- `otp-verification.md` - Verification flow after EMAIL_NOT_VERIFIED redirect
- `sign-up-flow.md` - Registration flow
- `password-reset.md` - Forgot/reset password flow
- `auth-client.md` - Full authClient API reference
