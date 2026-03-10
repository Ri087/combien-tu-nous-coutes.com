import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg-white-0">
      {/* Orbs */}
      <div className="-top-32 -left-32 pointer-events-none absolute size-[400px] rounded-full bg-feature-base opacity-30 blur-[100px]" />
      <div className="-right-32 pointer-events-none absolute top-1/3 size-[350px] rounded-full bg-information-base opacity-25 blur-[100px]" />
      <div className="-bottom-24 pointer-events-none absolute left-1/4 size-[300px] rounded-full bg-success-base opacity-20 blur-[100px]" />

      {/* Main */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-[600px] text-center">
          <h1 className="bg-gradient-to-r from-feature-dark via-error-base to-warning-base bg-clip-text font-[family-name:var(--font-display)] text-[6rem] text-transparent italic leading-none md:text-[8rem]">
            404
          </h1>
          <p className="mt-4 text-label-lg text-text-strong-950">
            Cette page n&apos;existe pas.
          </p>
          <p className="mt-2 text-paragraph-sm text-text-soft-400 italic">
            Contrairement à cette réunion qui n&apos;en finit pas.
          </p>
          <Link
            className="mt-8 inline-flex items-center justify-center rounded-10 bg-text-strong-950 px-5 py-2.5 text-label-sm text-white transition-colors hover:bg-text-strong-950/90"
            href="/"
          >
            Retour au compteur
          </Link>
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
