"use client";

import type { User } from "better-auth";
import posthog from "posthog-js";
import { useEffect } from "react";

interface UserIdentifierProps {
  user: User | null | undefined;
}

/**
 * Component to identify users in PostHog.
 * Use this component in your layout to identify authenticated users.
 *
 * Example usage:
 * ```tsx
 * <PostHogUserIdentifier user={authResponse?.user} />
 * ```
 */
export function UserIdentifier({ user }: UserIdentifierProps) {
  useEffect(() => {
    // Only identify if we have a user
    if (user) {
      posthog.identify(user.id, {
        email: user.email,
        name: user.name,
      });
    } else {
      // Reset identification when user is not available (logged out)
      posthog.reset();
    }
  }, [user]);

  // This component doesn't render anything
  return null;
}
