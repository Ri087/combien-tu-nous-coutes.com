// instrumentation.ts
import type { NextRequest } from "next/server";

const POSTHOG_COOKIE_REGEX = /ph_phc_.*?_posthog=([^;]+)/;

/**
 * This function is required by Next.js instrumentation API
 */
export async function register() {
	if (process.env.NEXT_RUNTIME === "nodejs") {
		await import("./orpc/server");
	}
}

/**
 * Error handler for Next.js requests
 */
export const onRequestError = async (
	err: Error,
	request: NextRequest,
): Promise<void> => {
	if (process.env.NEXT_RUNTIME === "nodejs") {
		// Dynamic import to avoid loading this in the browser
		const { getPostHogServer } = await import("@/lib/posthog/server-client");
		const posthog = getPostHogServer();

		let distinctId: string | null = null;
		if (request.headers.has("cookie")) {
			const cookieString = request.headers.get("cookie") || "";
			const postHogCookieMatch = cookieString.match(POSTHOG_COOKIE_REGEX);

			if (postHogCookieMatch?.[1]) {
				try {
					const decodedCookie = decodeURIComponent(postHogCookieMatch[1]);
					const postHogData = JSON.parse(decodedCookie) as {
						distinct_id: string;
					};
					distinctId = postHogData.distinct_id;
				} catch {
					// Failed to parse PostHog cookie data
				}
			}
		}

		posthog.captureException(err, distinctId || undefined);
	}
};
