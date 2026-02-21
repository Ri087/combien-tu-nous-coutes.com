---
name: backend-email
description: |
  React Email and Resend email system guide. Use when creating email templates, sending transactional emails, or working with shared email components (EmailLayout, Card, EmailButton, EmailText, OtpDisplay).
---

# React Email and Resend Email System

This skill covers the email infrastructure using React Email for templating and Resend for delivery. It includes creating new email templates with shared components, sending transactional emails from server-side code, and using the pre-built components (EmailLayout, Card, EmailButton, EmailText, OtpDisplay) for consistent email design.

## Reference Files

- **create-template.md** -- How to create a new email template using React Email components and the shared layout
- **email-components.md** -- Reference for shared email components: EmailLayout, Card, EmailButton, EmailText, OtpDisplay
- **send-email.md** -- How to send emails programmatically using the Resend client from server-side code

## Key Rules

1. **Always use the shared `EmailLayout` component** as the root wrapper for every email template.
2. **Always use the pre-built email components** (Card, EmailButton, EmailText) instead of raw HTML elements.
3. **Place all email templates in `/emails/`** following the existing naming convention.
4. **Never send emails from client-side code.** Email sending must happen on the server (oRPC handlers, server actions, or auth hooks).

## Related Skills

- **backend-auth** -- Auth flows that trigger emails (OTP verification, password reset)
- **backend-orpc** -- Server-side handlers where email sending is triggered
- **frontend-ui** -- Design tokens and visual consistency shared with email templates
