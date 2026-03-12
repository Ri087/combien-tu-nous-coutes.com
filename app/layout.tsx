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
const TITLE =
  "Combien tu nous coûtes ? — Calculateur de coût de réunion en temps réel";
const DESCRIPTION =
  "Calculateur de coût de réunion gratuit. Découvrez en temps réel combien votre réunion coûte à l'entreprise. Calcul automatique avec nombre de participants, salaire brut moyen et charges patronales (45%). Lance le compteur, observe les euros s'échapper.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "coût réunion",
    "calculateur réunion",
    "combien coûte une réunion",
    "coût réunion en temps réel",
    "calcul coût réunion",
    "productivité",
    "meeting cost calculator",
    "charges patronales",
    "coût entreprise",
    "temps perdu réunion",
    "réunionite",
    "calculatrice réunion",
    "outil productivité",
    "waste meeting",
    "réunion inutile",
  ],
  authors: [{ name: "combien-tu-nous-coutes.com" }],
  creator: "combien-tu-nous-coutes.com",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Combien tu nous coûtes ? — Calculateur de coût de réunion",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Combien tu nous coûtes",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/opengraph-image.jpeg`,
        width: 1200,
        height: 630,
        alt: "Calculateur de coût de réunion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Combien tu nous coûtes ? — Calculateur de coût de réunion",
    description: DESCRIPTION,
    images: [`${SITE_URL}/twitter-image.jpeg`],
    creator: "@combien_coûtes",
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Combien tu nous coûtes",
        url: "https://combien-tu-nous-coutes.com",
        sameAs: [],
        description:
          "Calculateur de coût de réunion en temps réel - Découvrez combien votre réunion coûte à l'entreprise",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "Support",
          url: "https://combien-tu-nous-coutes.com",
        },
      },
      {
        "@type": "WebApplication",
        name: "Combien tu nous coûtes",
        url: "https://combien-tu-nous-coutes.com",
        applicationCategory: "BusinessApplication",
        description:
          "Calculateur de coût de réunion en temps réel avec calcul des charges patronales",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
          description: "Gratuit",
        },
      },
    ],
  };

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
      <head>
        <Script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          id="json-ld"
          type="application/ld+json"
        />
      </head>
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
