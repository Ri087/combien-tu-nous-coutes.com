import { Redis } from "@upstash/redis";

import { env } from "@/env";

/**
 * Redis client instance using Upstash
 *
 * This creates a connection to our Redis database using Upstash.
 * Used for caching, rate limiting, and session storage.
 */
export const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL || "",
    token: env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Export a type-safe singleton instance
export default redis;
