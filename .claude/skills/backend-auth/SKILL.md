---
name: backend-auth
description: |
  Better Auth authentication system guide. Use when implementing authentication flows, checking user sessions, protecting pages or API routes, implementing sign-up/sign-in forms, OTP email verification, password reset, or using the authClient on the frontend.
---

# Better Auth Authentication System

This skill covers the complete authentication system built with Better Auth. It includes server-side session checks, page and API route protection, sign-up and sign-in flows, OTP email verification, password reset, and the frontend `authClient` usage. The auth system uses `drizzleAdapter` for database storage and `emailOTP` for verification.

## Reference Files

- **overview.md** -- Architecture overview of the Better Auth setup, including `betterAuth()` configuration and adapter setup
- **session-check.md** -- How to check the current user session on the server using `getServerSession()`
- **protect-pages.md** -- How to protect Next.js pages so only authenticated users can access them
- **protect-api.md** -- How to protect oRPC routes and API endpoints with auth middleware
- **sign-up-flow.md** -- Complete sign-up implementation including form, validation, and email verification
- **sign-in-flow.md** -- Complete sign-in implementation with email/password authentication
- **otp-verification.md** -- How OTP email verification works and how to implement the verification page
- **password-reset.md** -- Password reset flow implementation with email-based recovery
- **auth-client.md** -- How to use the `authClient` on the frontend for session management and auth actions

## Key Rules

1. **Always use `getServerSession()` for server-side session checks.** Never manually parse cookies or tokens.
2. **Always use `protectedProcedure` for authenticated oRPC routes.** This automatically injects the user into `context`.
3. **Never store sensitive auth data in client-side state.** Use the `authClient` session hook instead.
4. **Always redirect unauthenticated users** to the sign-in page using the auth middleware or page-level checks.
5. **Use `AUTH_PAGES` constants** for auth-related page paths (sign-in, sign-up, etc.).

## Related Skills

- **backend-orpc** -- Protected procedures that rely on auth context
- **backend-middleware** -- Auth middleware implementation for oRPC
- **backend-email** -- Email templates used for OTP and password reset
- **frontend-forms** -- Building sign-in and sign-up forms
