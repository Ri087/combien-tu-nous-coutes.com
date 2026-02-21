# OTP Verification Flow - DigitInput, Auto-Submit, Resend Cooldown

## When to Use

Use this skill when you need to:
- Understand or modify the email verification flow
- Implement the 6-digit OTP input
- Handle auto-submit when all digits are entered
- Implement the resend OTP functionality with cooldown timer
- Handle OTP from email links (auto-verification)

## Complete Flow

```
1. User arrives at /verification?email=user@example.com
2. If no email param -> redirect to /sign-up
3. If ?otp=123456 is also present (from email link):
     -> Auto-fill digits
     -> Auto-submit immediately
4. User enters 6-digit code manually:
     -> Each digit fills in sequence
     -> On 6th digit: auto-submit
5. authClient.emailOtp.verifyEmail({ email, otp })
6. If INVALID_OTP:
     -> Show error, let user try again
7. If success:
     -> autoSignInAfterVerification activates
     -> Redirect to /dashboard
8. User can click "Resend code":
     -> 60-second cooldown starts
     -> New OTP is sent to email
```

## File Structure

```
/app/(auth)/verification/
  page.tsx                          # Server page with email guard
  search-params.ts                  # nuqs: email + otp params
  _components/
    verification-form.tsx           # Client form with DigitInput

/app/(auth)/_lib/
  send-verification-otp.ts         # Shared OTP sending utility

/validators/auth.ts                 # verifyEmailSchema
```

## Step 1: Zod Validator

From `/validators/auth.ts`:

```typescript
export const verifyEmailSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits long")
    .max(6, "OTP must be 6 digits long")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});
```

## Step 2: Search Params

Defined in `/app/(auth)/verification/search-params.ts`:

```typescript
import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const emailParsers = {
  email: parseAsString.withDefault(""),
  otp: parseAsString,
};

export const searchParamsCache = createSearchParamsCache(emailParsers);
```

Two params:
- `email` (required) - The email being verified
- `otp` (optional) - Pre-filled from email link for auto-verification

## Step 3: Page Component

The page at `/app/(auth)/verification/page.tsx`:

```typescript
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { SearchParams } from "nuqs/server";

import { PAGES } from "@/constants/pages";

import { VerificationForm } from "./_components/verification-form";
import { searchParamsCache } from "./search-params";

export const metadata: Metadata = {
  title: "Verify your email",
};

type VerificationPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function PageVerification({
  searchParams,
}: VerificationPageProps) {
  const { email } = await searchParamsCache.parse(searchParams);

  if (!email) {
    return redirect(PAGES.SIGN_UP);
  }

  return (
    <div className="w-full max-w-[472px] px-4">
      <VerificationForm />
    </div>
  );
}
```

**Guard**: If `email` is missing from the URL, the user is redirected to `/sign-up`.

## Step 4: Verification Form Component

The full component at `/app/(auth)/verification/_components/verification-form.tsx`:

```typescript
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiMailCheckFill } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import sendVerificationOtp from "@/app/(auth)/_lib/send-verification-otp";
import { StaggeredFadeLoader } from "@/components/staggered-fade-loader";
import * as DigitInput from "@/components/ui/digit-input";
import * as Divider from "@/components/ui/divider";
import * as FancyButton from "@/components/ui/fancy-button";
import { FormGlobalMessage } from "@/components/ui/form";
import * as LinkButton from "@/components/ui/link-button";
import { AUTH_ERRORS } from "@/constants/auth-errors";
import { PAGES } from "@/constants/pages";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils/cn";
import { verifyEmailSchema } from "@/validators/auth";

import { emailParsers } from "../search-params";

export function VerificationForm() {
  const [{ email, otp }] = useQueryStates(emailParsers);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [resendingStatus, setResendingStatus] = useState<
    "idle" | "loading" | number
  >("idle");

  const { handleSubmit, formState, setValue, watch, setError } = useForm({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Submit handler
  const onSubmit = useCallback(
    (values: z.infer<typeof verifyEmailSchema>) => {
      setIsLoading(true);

      authClient.emailOtp.verifyEmail(
        {
          email,
          otp: values.otp,
        },
        {
          onError: (ctx) => {
            switch (ctx.error.code) {
              case AUTH_ERRORS.INVALID_OTP:
                setError("otp", {
                  message: "Invalid code. Please try again.",
                });
                break;
              default:
                setError("root.resend", {
                  message:
                    ctx.error.message ||
                    "An unknown error occurred. Please try again.",
                });
                break;
            }
            setIsLoading(false);
          },
          onSuccess: () => {
            router.push(PAGES.DASHBOARD);
          },
        }
      );
    },
    [email, router, setError]
  );

  // Auto-submit if OTP is in URL (from email link)
  useEffect(() => {
    if (otp) {
      setValue("otp", otp);
      handleSubmit(onSubmit)();
    }
  }, [otp, setValue, handleSubmit, onSubmit]);

  // Resend OTP handler
  const handleResendCode = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setResendingStatus("loading");

      sendVerificationOtp(email)
        .then((redirectUrl) => {
          router.push(redirectUrl);
        })
        .catch((error) => {
          console.error(error);
          setError("root.resend", {
            message: "An unknown error occurred. Please try again.",
          });
        })
        .finally(() => {
          setResendingStatus(60); // Start 60-second cooldown
        });
    },
    [email, router, setError]
  );

  // Cooldown countdown timer
  useEffect(() => {
    if (typeof resendingStatus === "number") {
      const interval = setInterval(() => {
        setResendingStatus((prev) => {
          const p = prev as number;
          return p > 0 ? p - 1 : "idle";
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [resendingStatus]);

  return (
    <form
      className="flex w-full flex-col gap-6 rounded-20 bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset md:p-8"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-2">
        {/* ... icon ... */}
        <div className="space-y-1 text-center">
          <div className="text-title-h6 lg:text-title-h5">
            Verify your email
          </div>
          <div className="text-paragraph-sm text-text-sub-600 lg:text-paragraph-md">
            Enter the 6-digit code sent to{" "}
            <span className="font-medium text-text-strong-950">{email}</span>
          </div>
        </div>
      </div>

      <Divider.Root />

      {/* 6-digit input */}
      <DigitInput.Root
        hasError={!!formState.errors.otp}
        numInputs={6}
        onChange={(value) => {
          setValue("otp", value);
          if (value.length === 6) {
            handleSubmit(onSubmit)();
          }
        }}
        shouldAutoFocus
        value={watch("otp")}
      />

      {/* OTP error */}
      <FormGlobalMessage variant="error">
        {formState.errors.otp?.message}
      </FormGlobalMessage>

      {/* Submit button */}
      <FancyButton.Root disabled={isLoading} size="medium" variant="primary">
        {isLoading ? (
          <>
            <StaggeredFadeLoader variant="muted" />
            Verifying...
          </>
        ) : (
          "Submit code"
        )}
      </FancyButton.Root>

      {/* Resend section */}
      <div className="flex flex-col items-center gap-1 text-center text-paragraph-sm text-text-sub-600">
        Didn&apos;t receive a code?
        <LinkButton.Root
          className={cn(resendingStatus !== "idle" && "pointer-events-none")}
          disabled={resendingStatus !== "idle"}
          onClick={handleResendCode}
          size="medium"
          underline
          variant="black"
        >
          {resendingStatus === "loading" ? (
            "Resending..."
          ) : (
            <>
              Resend code{" "}
              {typeof resendingStatus === "number" && `(${resendingStatus}s)`}
            </>
          )}
        </LinkButton.Root>
      </div>

      {/* Resend error */}
      <FormGlobalMessage variant="error">
        {formState.errors.root?.resend?.message}
      </FormGlobalMessage>
    </form>
  );
}
```

## Key Mechanisms

### Auto-Submit on Complete Input

When the user types the 6th digit, the form submits automatically:

```typescript
<DigitInput.Root
  numInputs={6}
  onChange={(value) => {
    setValue("otp", value);
    if (value.length === 6) {
      handleSubmit(onSubmit)();
    }
  }}
  shouldAutoFocus
  value={watch("otp")}
/>
```

### Auto-Verify from Email Link

The verification email includes a link like:
```
/verification?otp=123456&email=user@example.com
```

When the page loads with an `otp` param, it auto-fills and auto-submits:

```typescript
useEffect(() => {
  if (otp) {
    setValue("otp", otp);
    handleSubmit(onSubmit)();
  }
}, [otp, setValue, handleSubmit, onSubmit]);
```

### Resend Cooldown

The resend button has a 60-second cooldown to prevent abuse:

```typescript
const [resendingStatus, setResendingStatus] = useState<
  "idle" | "loading" | number
>("idle");
```

States:
- `"idle"` - Button is clickable
- `"loading"` - OTP is being sent, shows "Resending..."
- `60` to `1` - Countdown timer, shows "Resend code (42s)"
- Back to `"idle"` when countdown reaches 0

The countdown runs via `setInterval`:

```typescript
useEffect(() => {
  if (typeof resendingStatus === "number") {
    const interval = setInterval(() => {
      setResendingStatus((prev) => {
        const p = prev as number;
        return p > 0 ? p - 1 : "idle";
      });
    }, 1000);
    return () => clearInterval(interval);
  }
}, [resendingStatus]);
```

## DigitInput Component

The `DigitInput` component from AlignUI (`@/components/ui/digit-input`) renders 6 individual input boxes:

```typescript
<DigitInput.Root
  hasError={boolean}         // Red border on error
  numInputs={6}              // Number of digit boxes
  onChange={(value) => void}  // Called with concatenated string ("123456")
  shouldAutoFocus             // Focus first input on mount
  value={string}              // Current value
/>
```

Features:
- Auto-advances to next input after typing a digit
- Supports paste (e.g., paste "123456" fills all boxes)
- Backspace moves to previous input
- Only accepts numeric input

## Error Handling

| Error Code | Where Shown | Message |
|-----------|-------------|---------|
| `INVALID_OTP` | Below digit input (`formState.errors.otp`) | "Invalid code. Please try again." |
| Other errors | Below resend section (`formState.errors.root.resend`) | `ctx.error.message` or default |

Two separate error locations allow distinguishing between OTP validation errors and system errors.

## authClient Methods Used

### Verify Email

```typescript
authClient.emailOtp.verifyEmail(
  {
    email: string,    // The email being verified
    otp: string,      // The 6-digit code
  },
  {
    onError: (ctx) => { /* ctx.error.code */ },
    onSuccess: () => { /* Verified! */ },
  }
);
```

### Send Verification OTP (via shared utility)

```typescript
import sendVerificationOtp from "@/app/(auth)/_lib/send-verification-otp";

// Returns Promise<string> with redirect URL
const redirectUrl = await sendVerificationOtp(email);
// redirectUrl = "/verification?email=user@example.com"
```

Under the hood:

```typescript
authClient.emailOtp.sendVerificationOtp({
  email: string,
  type: "email-verification",
});
```

## OTP Generation (Server-Side)

For reference, the OTP is generated in `/auth.ts`:

- **Testing environment**: Always `"123456"`
- **Production**: Cryptographically secure 6-digit code using `crypto.getRandomValues()`
- Stored in the `verification` table with an expiration time
- Sent via Resend email service using the `VerifyEmailTemplate` React Email template

## Rules

- ALWAYS redirect to `/sign-up` if the `email` search param is missing
- ALWAYS auto-submit when the user enters the 6th digit
- ALWAYS auto-verify when `otp` is present in the URL
- ALWAYS implement the 60-second resend cooldown
- ALWAYS use `formState.errors.otp` for OTP errors and `formState.errors.root.resend` for system errors
- ALWAYS use `shouldAutoFocus` on the DigitInput to focus the first input
- The verification email includes a clickable link that auto-verifies -- the OTP is embedded in the URL

## Related Skills

- `sign-up-flow.md` - How users arrive at verification after sign-up
- `sign-in-flow.md` - How users arrive at verification from EMAIL_NOT_VERIFIED
- `auth-client.md` - Full authClient API reference
- `overview.md` - How OTP generation and email sending works
