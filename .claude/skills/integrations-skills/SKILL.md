---
name: integrations
description: |
  Optional integration guides for Vercel Blob (file uploads), AI SDK v6 with Vercel AI Gateway, Tiptap rich text editor, PostHog analytics, and Upstash Redis. Use when adding file upload, AI features, rich text editing, analytics, caching, or rate limiting.
---

# Optional Integrations

This skill contains guides for optional integrations that can be added to the project on demand. Each integration is self-contained and includes setup instructions, configuration, and usage patterns. These are not included by default -- activate them only when the feature requires it.

## Reference Files

- **vercel-blob.md** -- How to set up Vercel Blob for file uploads, including client-side upload, server-side handling, and URL management
- **ai-sdk.md** -- How to integrate AI SDK v6 with Vercel AI Gateway for chat, text generation, structured output, and streaming
- **tiptap.md** -- How to add a Tiptap rich text editor with custom extensions, toolbar, and form integration
- **analytics.md** -- How to set up PostHog analytics for event tracking, feature flags, and user identification
- **redis.md** -- How to set up Upstash Redis for caching, rate limiting, and session storage

## Key Rules

1. **Only add an integration when it is needed.** Do not pre-install packages or configure services that are not yet required.
2. **Follow the setup instructions in each file exactly.** Each integration has specific environment variables and configuration steps.
3. **Always add required environment variables to `.env.example`** when setting up a new integration.
4. **Keep integration code isolated.** Place integration-specific utilities in `/lib/[integration].ts` so they can be imported cleanly.

## Related Skills

- **backend-orpc** -- API routes that use integrations (file upload endpoints, AI endpoints)
- **frontend-forms** -- Forms that use Tiptap or file upload integrations
- **frontend-state** -- TanStack Query patterns for fetching integration data
- **workflow-skills** -- Add-feature workflow that may include integration setup steps
