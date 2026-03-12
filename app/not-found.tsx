import Link from "next/link";

import * as FancyButton from "@/components/ui/fancy-button";

import { BackgroundOrbs } from "./_components/background-orbs";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg-white-0">
      <BackgroundOrbs />

      {/* Main */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-[600px] text-center">
          <h1 className="font-[family-name:var(--font-display)] text-[6rem] text-feature-dark italic leading-none md:text-[8rem]">
            404
          </h1>
          <p className="mt-4 text-label-lg text-text-strong-950">
            Cette page n&apos;existe pas.
          </p>
          <p className="mt-2 text-paragraph-sm text-text-soft-400 italic">
            Contrairement à cette réunion qui n&apos;en finit pas.
          </p>
          <FancyButton.Root
            asChild
            className="mt-8"
            size="medium"
            variant="neutral"
          >
            <Link href="/">Retour au compteur</Link>
          </FancyButton.Root>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center">
        <p className="text-paragraph-xs text-text-soft-400">
          combien-tu-nous-coutes.com — aucune donnée collectée
        </p>
      </footer>
    </div>
  );
}
