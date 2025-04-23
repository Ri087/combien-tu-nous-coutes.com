import { Ratelimit } from "@upstash/ratelimit";

import redis from "@/lib/redis";

type DurationType =
    | `${number} s`
    | `${number} m`
    | `${number} h`
    | `${number} d`;

/**
 * Creates a rate limiter instance for a specific application feature
 *
 * @param limit Number of requests allowed in the time window
 * @param window Time window in seconds or as a string like "10 s"
 * @param prefix Optional prefix for the rate limit key
 * @returns A ratelimit instance
 */
export function createRateLimiter(
    limit: number,
    window: DurationType,
    prefix = "ratelimit"
) {
    return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, window),
        analytics: true,
        prefix,
    });
}

/**
 * Rate-limits a function. If the rate limit is exceeded, throws an error.
 *
 * @param ratelimit The rate limiter instance
 * @param identifier A unique identifier for the rate limit (e.g. user ID, IP address)
 * @param fn The function to rate limit
 * @returns The result of the function
 * @throws Error if rate limit is exceeded
 */
export async function withRateLimit<T>(
    ratelimit: Ratelimit,
    identifier: string,
    fn: () => Promise<T>
): Promise<T> {
    const { success, reset } = await ratelimit.limit(identifier);

    if (!success) {
        throw new Error(
            `Rate limit exceeded. Try again in ${Math.ceil((reset - Date.now()) / 1000)} seconds.`
        );
    }

    return fn();
}

/**
 * Creates a global rate limiter for form submissions
 */
export const formSubmissionRateLimiter = createRateLimiter(
    5,
    "1 m",
    "form_submission"
);

/**
 * Creates a global rate limiter for authentication attempts
 */
export const authRateLimiter = createRateLimiter(10, "5 m", "auth");

/**
 * Example usage:
 *
 * // In a server action or API route
 * export async function submitForm(data: FormData) {
 *   try {
 *     const userIp = headers().get("x-forwarded-for") ?? "127.0.0.1";
 *     return await withRateLimit(
 *       formSubmissionRateLimiter,
 *       `${userIp}:form_submission`,
 *       async () => {
 *         // Your form submission logic here
 *         return { success: true };
 *       }
 *     );
 *   } catch (error) {
 *     return { success: false, error: error.message };
 *   }
 * }
 */
