# Sign-Up Flow - Complete Implementation

## When to Use

Use this skill when you need to:
- Understand or modify the user registration flow
- Create a custom sign-up form
- Debug sign-up errors
- Extend the sign-up process (e.g., add fields, custom validation)

## Complete Flow

```
1. User navigates to /sign-up
2. Auth layout checks session -> if logged in, redirect to /dashboard
3. User fills form (fullName, email, password)
4. Client-side validation via Zod (signUpSchema)
5. authClient.signUp.email({ name, email, password })
6. Better Auth creates user + account records, auto signs in
7. On success: send verification OTP via authClient.emailOtp.sendVerificationOtp()
8. Redirect to /verification?email=...
9. (Verification flow continues -- see otp-verification.md)
```

## File Structure

```
/app/(auth)/sign-up/
  page.tsx                     # Server page component
  search-params.ts             # nuqs search params definition
  _components/
    sign-up-form.tsx           # Client form component

/app/(auth)/_lib/
  send-verification-otp.ts    # Shared OTP sending utility

/validators/auth.ts            # signUpSchema Zod validator
```

## Step 1: Zod Validator

Defined in `/validators/auth.ts`:

```typescript
import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
    .regex(/[0-9]/, "Password must contain at least 1 number"),
});
```

Password requirements:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number

## Step 2: Search Params

Defined in `/app/(auth)/sign-up/search-params.ts`:

```typescript
import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const signUpParsers = {
  signUpEmail: parseAsString.withDefault(""),
};

export const signUpSearchParams = createSearchParamsCache(signUpParsers);
```

The `signUpEmail` param allows pre-filling the email field (e.g., from a marketing page CTA).

## Step 3: Page Component

The page at `/app/(auth)/sign-up/page.tsx`:

```typescript
import type { Metadata } from "next";
import type { SearchParams } from "nuqs";

import { SignUpForm } from "./_components/sign-up-form";
import { signUpSearchParams } from "./search-params";

export const metadata: Metadata = {
  title: "Register",
};

interface PageRegisterProps {
  searchParams: Promise<SearchParams>;
}

export default async function PageRegister({
  searchParams,
}: PageRegisterProps) {
  await signUpSearchParams.parse(searchParams);

  return <SignUpForm />;
}
```

The page is a server component that parses search params and renders the client form.

## Step 4: Form Component

The form at `/app/(auth)/sign-up/_components/sign-up-form.tsx`:

```typescript
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  RiErrorWarningFill,
  RiInformationFill,
  RiMailLine,
  RiUserAddFill,
  RiUserLine,
} from "@remixicon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { PasswordInput } from "@/app/(auth)/_components/password-input";
import sendVerificationOtp from "@/app/(auth)/_lib/send-verification-otp";
import { StaggeredFadeLoader } from "@/components/staggered-fade-loader";
import * as Divider from "@/components/ui/divider";
import * as FancyButton from "@/components/ui/fancy-button";
import { FormGlobalMessage, FormMessage } from "@/components/ui/form";
import * as Input from "@/components/ui/input";
import * as Label from "@/components/ui/label";
import * as LinkButton from "@/components/ui/link-button";
import { AUTH_ERRORS } from "@/constants/auth-errors";
import { PROJECT } from "@/constants/project";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils/cn";
import { signUpSchema } from "@/validators/auth";

import { signUpParsers } from "../search-params";

export function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [{ signUpEmail }] = useQueryStates(signUpParsers);

  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: signUpEmail,
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof signUpSchema>) {
    setError(null);
    setIsLoading(true);

    authClient.signUp.email(
      {
        name: values.fullName,
        email: values.email,
        password: values.password,
      },
      {
        onError: (ctx) => {
          switch (ctx.error.code) {
            case AUTH_ERRORS.USER_ALREADY_EXISTS:
              setError("A user with this email already exists.");
              break;
            default:
              setError(
                ctx.error.message || "An error occurred during sign up."
              );
          }
          setIsLoading(false);
        },
        onSuccess: () => {
          sendVerificationOtp(values.email)
            .then((redirectUrl) => {
              router.push(redirectUrl);
            })
            .catch((error) => {
              setIsLoading(false);
              setError(error as string);
            });
        },
      }
    );
  }

  return (
    <div className="w-full max-w-[472px] px-4">
      <form
        className="flex w-full flex-col gap-6 rounded-20 bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset md:p-8"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* ... icon and title ... */}
        <Divider.Root />

        <div className="flex flex-col gap-3">
          {/* Full Name field */}
          <div className="flex flex-col gap-1">
            <Label.Root htmlFor="fullname">
              Full name <Label.Asterisk />
            </Label.Root>
            <Input.Root hasError={!!formState.errors.fullName}>
              <Input.Wrapper>
                <Input.Icon as={RiUserLine} />
                <Input.Input
                  id="fullname"
                  placeholder="James Brown"
                  required
                  type="text"
                  {...register("fullName")}
                />
              </Input.Wrapper>
            </Input.Root>
            <FormMessage>{formState.errors.fullName?.message}</FormMessage>
          </div>

          {/* Email field */}
          <div className="flex flex-col gap-1">
            <Label.Root htmlFor="email">
              Email <Label.Asterisk />
            </Label.Root>
            <Input.Root hasError={!!formState.errors.email}>
              <Input.Wrapper>
                <Input.Icon as={RiMailLine} />
                <Input.Input
                  disabled={!!signUpEmail}
                  id="email"
                  placeholder={`hello@${PROJECT.DOMAIN}`}
                  required
                  type="email"
                  {...register("email")}
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
              hasError={!!formState.errors.password}
              id="password"
              required
              {...register("password")}
            />
            {formState.errors.password ? (
              <FormMessage>{formState.errors.password.message}</FormMessage>
            ) : (
              <div className="flex gap-1 text-paragraph-xs text-text-sub-600">
                <RiInformationFill className="size-4 shrink-0 text-text-soft-400" />
                Password must be at least 8 characters long and contain a number.
              </div>
            )}
          </div>
        </div>

        <FormGlobalMessage Icon={RiErrorWarningFill} variant="error">
          {error}
        </FormGlobalMessage>

        <FancyButton.Root disabled={isLoading} size="medium" variant="primary">
          {isLoading && <StaggeredFadeLoader variant="muted" />}
          {isLoading ? "Registering..." : "Register"}
        </FancyButton.Root>
      </form>
    </div>
  );
}
```

## Step 5: Shared OTP Sending Utility

Defined in `/app/(auth)/_lib/send-verification-otp.ts`:

```typescript
import { PAGES } from "@/constants/pages";
import { authClient } from "@/lib/auth/client";

export default function sendVerificationOtp(email: string): Promise<string> {
  return new Promise((resolve, reject) => {
    authClient.emailOtp.sendVerificationOtp(
      {
        email,
        type: "email-verification",
      },
      {
        onError: (ctx) => {
          reject(ctx.error.message);
        },
        onSuccess: () => {
          resolve(`${PAGES.VERIFICATION}?email=${email}`);
        },
      }
    );
  });
}
```

This utility is shared between sign-up and sign-in flows (when email is not verified).

## Error Handling

| Error Code | User-Facing Message | When It Happens |
|-----------|---------------------|-----------------|
| `USER_ALREADY_EXISTS` | "A user with this email already exists." | Email is already registered |
| Default | `ctx.error.message` or "An error occurred during sign up." | Any other server error |

## Key Patterns

### authClient.signUp.email Parameters

```typescript
authClient.signUp.email(
  {
    name: string,      // User's display name
    email: string,     // User's email
    password: string,  // User's password
  },
  {
    onError: (ctx) => { /* ctx.error.code, ctx.error.message */ },
    onSuccess: () => { /* Registration successful */ },
  }
);
```

### Flow After Success

1. `authClient.signUp.email` creates the user and auto-signs in (session cookie set)
2. `sendVerificationOtp(email)` triggers OTP email
3. `router.push(redirectUrl)` navigates to `/verification?email=...`
4. The user must verify their email before they can sign in again

### Pre-Filling Email

Navigate to `/sign-up?signUpEmail=user@example.com` to pre-fill the email field and disable it.

## UI Components Used

- `PasswordInput` - Custom password field with show/hide toggle (from `@/app/(auth)/_components/password-input`)
- `Input.Root / Input.Wrapper / Input.Icon / Input.Input` - AlignUI input components
- `Label.Root / Label.Asterisk` - AlignUI label with required asterisk
- `FancyButton.Root` - AlignUI primary action button
- `FormMessage` - Field-level validation error display
- `FormGlobalMessage` - Form-level error display
- `Divider.Root` - Visual separator
- `StaggeredFadeLoader` - Loading spinner animation

## Rules

- ALWAYS validate with `signUpSchema` before calling the API
- ALWAYS handle the `USER_ALREADY_EXISTS` error explicitly
- ALWAYS send verification OTP after successful sign-up
- ALWAYS redirect to `/verification?email=...` after sending OTP
- NEVER store the password in state after submission
- ALWAYS use the `PasswordInput` component (never a plain `<input type="password">`)
- The `signUpEmail` search param can pre-fill and disable the email field

## Related Skills

- `otp-verification.md` - What happens after redirect to /verification
- `sign-in-flow.md` - Sign-in flow (handles EMAIL_NOT_VERIFIED case)
- `auth-client.md` - Full authClient API reference
- `overview.md` - Complete auth architecture
