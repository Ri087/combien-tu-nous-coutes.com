import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { NotificationProvider } from "@/components/ui/notification-provider";
import { Toaster } from "@/components/ui/sonner";
import { Provider as TooltipProvider } from "@/components/ui/tooltip";
import { CSPostHogProvider } from "@/providers/posthog";
import { ORPCQueryClientProvider } from "@/providers/query-client.provider";

import CookieConsentBanner from "./_components/cookie-consent-banner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ORPCQueryClientProvider>
      <CSPostHogProvider>
        <ThemeProvider attribute="class">
          <NuqsAdapter>
            <TooltipProvider>{children}</TooltipProvider>
          </NuqsAdapter>
          <CookieConsentBanner />
          <NotificationProvider />
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </CSPostHogProvider>
    </ORPCQueryClientProvider>
  );
}
