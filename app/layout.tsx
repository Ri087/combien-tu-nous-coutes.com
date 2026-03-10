import type { Metadata } from "next";
import { Inter as FontSans, Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import { env } from "@/env";
import { cn } from "@/lib/utils/cn";
import { Providers } from "./providers";

import "@/orpc/server";
import "./globals.css";

const inter = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
});

const geistMono = localFont({
  src: "./fonts/GeistMono[wght].woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const SITE_URL = "https://combien-tu-nous-coutes.com";
const TITLE = "Combien tu nous coûtes ? — Calculateur de coût de réunion";
const DESCRIPTION =
  "Calcule en temps réel combien ta réunion coûte à l'entreprise. Nombre de participants, salaire brut, charges patronales incluses. Lance le compteur, observe, souffre.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "coût réunion",
    "calculateur réunion",
    "combien coûte une réunion",
    "productivité",
    "meeting cost calculator",
    "charges patronales",
    "coût entreprise",
    "temps perdu réunion",
    "réunionite",
  ],
  authors: [{ name: "combien-tu-nous-coutes.com" }],
  creator: "combien-tu-nous-coutes.com",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Combien tu nous coûtes ?",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "combien-tu-nous-coutes.com",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Combien tu nous coûtes ?",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={cn(
        inter.variable,
        geistMono.variable,
        instrumentSerif.variable,
        "antialiased"
      )}
      lang="fr"
      suppressHydrationWarning
    >
      {env.NEXT_PUBLIC_REACT_SCAN_DEVTOOLS === "true" &&
        env.NODE_ENV === "development" && (
          <Script
            crossOrigin="anonymous"
            src="//unpkg.com/react-scan/dist/auto.global.js"
          />
        )}
      <body className="bg-bg-white-0 text-text-strong-950">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <main className="flex flex-1 flex-col">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
