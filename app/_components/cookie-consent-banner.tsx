"use client";

import { useEffect, useState } from "react";

import { usePostHog } from "posthog-js/react";
import { useLocalStorage } from "usehooks-ts";

import * as Alert from "@/components/ui/alert";
import * as Button from "@/components/ui/button";

type ConsentStatus = "yes" | "no" | "undecided";

export function cookieConsentGiven(): ConsentStatus {
    // Only run on client since localStorage is not available on server
    if (typeof window === "undefined") return "undecided";

    const consent = localStorage.getItem("cookie_consent");
    if (!consent) return "undecided";
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
                persistence:
                    consentGiven === "yes" ? "localStorage+cookie" : "memory",
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
        <div className="fixed bottom-0 left-0 right-0 md:bottom-4 md:left-4 md:right-auto md:max-w-md w-fit p-4 md:p-0 z-50">
            <Alert.Root variant="stroke" status="information" size="large">
                <div className="space-y-5">
                    <div className="space-y-1.5">
                        <div className="text-label-sm">Cookie Consent</div>
                        <div>
                            We use cookies to improve your experience and for
                            analytics. You can accept or decline.
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button.Root
                            type="button"
                            variant="neutral"
                            mode="stroke"
                            className="w-full"
                            onClick={() => setConsentGiven("no")}
                        >
                            Decline
                        </Button.Root>
                        <Button.Root
                            type="button"
                            className="w-full"
                            onClick={() => setConsentGiven("yes")}
                        >
                            Accept
                        </Button.Root>
                    </div>
                </div>
            </Alert.Root>
        </div>
    );
}
