# Redis / KV Store - Upstash (Optional)

## When to use
- Rate limiting
- Caching
- Session storage
- Real-time features

## Setup (requires external service)

1. Create account at https://upstash.com
2. Create a Redis database
3. Add to .env.local:
KV_REST_API_URL="https://xxxxx.upstash.io"
KV_REST_API_TOKEN="xxxxx"
4. Re-add to env.ts
5. Re-install packages:
```bash
   pnpm add @upstash/redis @upstash/ratelimit
```

## Usage
```typescript
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const redis = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
});

// Rate limiting
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```
