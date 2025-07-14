"use client";

import { usePostHog } from "posthog-js/react";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import * as Alert from "@/components/ui/alert";
import * as Button from "@/components/ui/button";

type ConsentStatus = "yes" | "no" | "undecided";

export function cookieConsentGiven(): ConsentStatus {
  if (typeof window === "undefined") {
    return "undecided";
  }

  const consent = localStorage.getItem("cookie_consent");

  if (!consent) {
    return "undecided";
  }

  return consent as ConsentStatus;
}

export default function CookieConsentBanner() {
  const [isMounted, setIsMounted] = useState(false);
  const [consentGiven, setConsentGiven] = useLocalStorage<ConsentStatus>(
    "cookie_consent",
    "undecided"
  );

  const posthog = usePostHog();

  useEffect(() => {
    if (consentGiven !== "undecided") {
      posthog.set_config({
        persistence: consentGiven === "yes" ? "localStorage+cookie" : "memory",
      });
    }
  }, [consentGiven, posthog]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (consentGiven !== "undecided" || !isMounted) {
    return null;
  }

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 w-fit p-4 md:right-auto md:bottom-4 md:left-4 md:max-w-md md:p-0">
      <Alert.Root size="large" status="information" variant="stroke">
        <div className="space-y-5">
          <div className="space-y-1.5">
            <div className="text-label-sm">Cookie Consent</div>
            <div>
              We use cookies to improve your experience and for analytics. You
              can accept or decline.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button.Root
              className="w-full"
              mode="stroke"
              onClick={() => setConsentGiven("no")}
              type="button"
              variant="neutral"
            >
              Decline
            </Button.Root>
            <Button.Root
              className="w-full"
              onClick={() => setConsentGiven("yes")}
              type="button"
            >
              Accept
            </Button.Root>
          </div>
        </div>
      </Alert.Root>
    </div>
  );
}
