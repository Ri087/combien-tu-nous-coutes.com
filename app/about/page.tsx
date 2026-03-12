import type { Metadata } from "next";
import Link from "next/link";
import * as FancyButton from "@/components/ui/fancy-button";
import { MARKETING_PAGES } from "@/constants/pages";
import { PROJECT } from "@/constants/project";

export const metadata: Metadata = {
  title: `À propos — ${PROJECT.NAME}`,
  description:
    "Découvrez pourquoi nous avons créé ce calculateur de coût de réunion. Comment économiser le temps et l'argent gaspillés en réunions inutiles.",
};

export default function AboutPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-stroke-soft-200 border-b">
        <div className="mx-auto max-w-[1200px] px-6 py-8">
          <Link
            className="text-feature-base text-paragraph-sm underline"
            href={MARKETING_PAGES.LANDING_PAGE}
          >
            ← Retour au compteur
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-16">
        <article className="mx-auto max-w-[720px] px-6">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="mb-6 font-[family-name:var(--font-display)] text-text-strong-950 text-title-h1 italic">
              Le problème des réunions coûteuses
            </h1>
            <p className="text-paragraph-lg text-text-strong-950">
              Avez-vous déjà pensé à combien coûte réellement une réunion ? Pas
              juste le temps perdu, mais son coût réel en salaires, en charges
              patronales, en productivité perdue ?
            </p>
          </div>

          {/* Problem Section */}
          <section className="mb-12 space-y-4">
            <h2 className="font-[family-name:var(--font-display)] text-text-strong-950 text-title-h2 italic">
              La réalité des réunions
            </h2>
            <p className="text-paragraph-sm text-text-strong-950">
              En France, une réunion avec 5 personnes ayant un salaire brut
              moyen de 2 500 € par mois coûte environ{" "}
              <strong>500 € par heure</strong> à l'entreprise. Ce calcul inclut
              les salaires bruts ET les charges patronales (45% en moyenne).
            </p>
            <p className="text-paragraph-sm text-text-strong-950">
              Une étude de 2024 montre qu'en France, les employés assistent en
              moyenne à <strong>8 réunions par semaine</strong> — souvent
              improductives. Cela représente{" "}
              <strong>des milliers d'euros gaspillés</strong> par an dans chaque
              entreprise.
            </p>
            <p className="text-paragraph-sm text-text-strong-950">
              Le pire ? La plupart des managers ne réalisent même pas combien ça
              coûte. Il n'existe pas d'outil simple pour{" "}
              <strong>visualiser en temps réel le coût réel</strong> d'une
              réunion.
            </p>
          </section>

          {/* Solution Section */}
          <section className="mb-12 space-y-4">
            <h2 className="font-[family-name:var(--font-display)] text-text-strong-950 text-title-h2 italic">
              Notre solution
            </h2>
            <p className="text-paragraph-sm text-text-strong-950">
              <strong>{PROJECT.NAME}</strong> a été créé pour une raison simple
              : <em>rendre visible l'invisible</em>.
            </p>
            <p className="text-paragraph-sm text-text-strong-950">
              En saisissant simplement :
            </p>
            <ul className="space-y-2 text-paragraph-sm text-text-strong-950 [&_li]:ml-6 [&_li]:list-disc">
              <li>Le nombre de participants</li>
              <li>Leur salaire brut moyen</li>
              <li>La durée de la réunion</li>
            </ul>
            <p className="text-paragraph-sm text-text-strong-950">
              Notre calculateur affiche en <strong>direct</strong> le coût exact
              de votre réunion, charges patronales incluses. Rien ne change les
              esprits comme de voir l'argent s'échapper en direct.
            </p>
          </section>

          {/* Why It Matters */}
          <section className="mb-12 space-y-4">
            <h2 className="font-[family-name:var(--font-display)] text-text-strong-950 text-title-h2 italic">
              Pourquoi c'est important
            </h2>
            <p className="text-paragraph-sm text-text-strong-950">
              Quand une équipe voit combien coûte réellement une réunion, les
              choses changent :
            </p>
            <ul className="space-y-2 text-paragraph-sm text-text-strong-950 [&_li]:ml-6 [&_li]:list-disc">
              <li>
                <strong>Les réunions deviennent plus courtes</strong> — personne
                ne veut gaspiller 500 € par heure
              </li>
              <li>
                <strong>Les réunions inutiles sont supprimées</strong> — email
                suffira
              </li>
              <li>
                <strong>La productivité augmente</strong> — plus de temps pour
                le vrai travail
              </li>
              <li>
                <strong>Les équipes prennent conscience</strong> du coût réel de
                leurs décisions
              </li>
            </ul>
          </section>

          {/* How It Works */}
          <section className="mb-12 space-y-4">
            <h2 className="font-[family-name:var(--font-display)] text-text-strong-950 text-title-h2 italic">
              Comment ça marche
            </h2>
            <p className="text-paragraph-sm text-text-strong-950">
              Notre calculateur de coût de réunion utilise une formule simple
              mais efficace :
            </p>
            <div className="rounded-lg bg-bg-soft-50 p-4">
              <p className="font-[family-name:var(--font-mono)] text-label-md text-text-strong-950">
                Coût/heure = (Salaire brut mois × 12 ÷ 1820 heures/an) ×
                Participants × (1 + 45% charges patronales)
              </p>
            </div>
            <p className="text-paragraph-sm text-text-strong-950">
              Les 45% de charges patronales correspondent à la moyenne française
              (URSSAF, assurances, cotisations sociales). Cette estimation
              inclut tous les coûts réels que l'employeur supporte.
            </p>
            <p className="text-paragraph-sm text-text-strong-950">
              Aucune donnée n'est collectée. Tout se calcule dans votre
              navigateur — vos données restent vôtres.
            </p>
          </section>

          {/* Stats Section */}
          <section className="mb-12 space-y-4">
            <h2 className="font-[family-name:var(--font-display)] text-text-strong-950 text-title-h2 italic">
              Les chiffres clés
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg bg-bg-soft-50 p-6">
                <p className="font-bold text-feature-dark text-title-h3">
                  500€/h
                </p>
                <p className="mt-2 text-paragraph-sm text-text-strong-950">
                  Coût moyen d'une réunion avec 5 personnes
                </p>
              </div>
              <div className="rounded-lg bg-bg-soft-50 p-6">
                <p className="font-bold text-feature-dark text-title-h3">
                  8/semaine
                </p>
                <p className="mt-2 text-paragraph-sm text-text-strong-950">
                  Réunions moyennes par employé en France
                </p>
              </div>
              <div className="rounded-lg bg-bg-soft-50 p-6">
                <p className="font-bold text-feature-dark text-title-h3">45%</p>
                <p className="mt-2 text-paragraph-sm text-text-strong-950">
                  Charges patronales moyennes incluses
                </p>
              </div>
              <div className="rounded-lg bg-bg-soft-50 p-6">
                <p className="font-bold text-feature-dark text-title-h3">∞</p>
                <p className="mt-2 text-paragraph-sm text-text-strong-950">
                  Potentiel d'économies dans votre entreprise
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="mb-12 space-y-6 rounded-lg bg-bg-soft-50 p-8">
            <div>
              <h2 className="mb-3 font-[family-name:var(--font-display)] text-text-strong-950 text-title-h2 italic">
                Prêt à découvrir ?
              </h2>
              <p className="text-paragraph-sm text-text-strong-950">
                Lancez notre calculateur et voyez par vous-même combien coûte
                votre prochaine réunion. Cela peut changer votre perspective sur
                la productivité.
              </p>
            </div>
            <FancyButton.Root asChild>
              <Link href={MARKETING_PAGES.LANDING_PAGE}>
                Lancer le compteur →
              </Link>
            </FancyButton.Root>
          </section>

          {/* Contact */}
          <section className="space-y-4 border-stroke-soft-200 border-t pt-8">
            <h2 className="font-[family-name:var(--font-display)] text-text-strong-950 text-title-h2 italic">
              Des questions ?
            </h2>
            <p className="text-paragraph-sm text-text-strong-950">
              Vous avez des suggestions, des questions, ou vous trouvez une
              erreur dans nos calculs ? N'hésitez pas à nous contacter :
            </p>
            <p className="text-paragraph-sm">
              <a
                className="text-feature-base underline"
                href={`mailto:${PROJECT.HELP_EMAIL}`}
              >
                {PROJECT.HELP_EMAIL}
              </a>
            </p>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-stroke-soft-200 border-t px-6 py-4 text-center">
        <p className="text-paragraph-xs text-text-soft-400">
          combien-tu-nous-coutes.com — aucune donnée collectée
        </p>
      </footer>
    </div>
  );
}
