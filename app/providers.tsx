import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { NotificationProvider } from "@/components/ui/notification-provider";
import { Toaster } from "@/components/ui/sonner";
import { Provider as TooltipProvider } from "@/components/ui/tooltip";
import { ORPCQueryClientProvider } from "@/providers/query-client.provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ORPCQueryClientProvider>
      <ThemeProvider attribute="class">
        <NuqsAdapter>
          <TooltipProvider>{children}</TooltipProvider>
        </NuqsAdapter>
        <NotificationProvider />
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    </ORPCQueryClientProvider>
  );
}
