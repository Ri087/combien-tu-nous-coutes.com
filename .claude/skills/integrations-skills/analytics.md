# Analytics - PostHog (Optional)

## When to use
- Product analytics
- Feature flags
- Session recordings

## Setup (requires external service)

1. Create account at https://posthog.com
2. Get your project API key
3. Add to .env.local:
NEXT_PUBLIC_POSTHOG_KEY="phc_xxxxx"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
4. Re-add to env.ts:
```typescript
   // client:
   NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1),
   NEXT_PUBLIC_POSTHOG_HOST: z.string().url(),
```
5. Re-add PostHogProvider to providers.tsx

## Note
This was removed from the base boilerplate to simplify initial setup.
Re-install packages if needed:
```bash
pnpm add posthog-js posthog-node
```
