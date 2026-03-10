import type { Metadata } from "next";
import Link from "next/link";

import { MARKETING_PAGES } from "@/constants/pages";
import { PROJECT } from "@/constants/project";

export const metadata: Metadata = {
  title: `Politique de cookies — ${PROJECT.NAME}`,
  description:
    "Politique de cookies de combien-tu-nous-coutes.com. D\u00e9couvrez quels cookies nous utilisons et pourquoi.",
};

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-[720px] px-6 py-16">
      <h1 className="mb-8 font-[family-name:var(--font-display)] text-title-h2 italic">
        Politique de cookies
      </h1>
      <p className="mb-4 text-paragraph-sm text-text-sub-600">
        Derni\u00e8re mise \u00e0 jour : 10 mars 2026
      </p>

      <div className="space-y-8 text-paragraph-sm text-text-sub-600 [&_h2]:mb-3 [&_h2]:text-label-md [&_h2]:text-text-strong-950 [&_ul]:list-disc [&_ul]:pl-5">
        <section>
          <h2>1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
          <p>
            Un cookie est un petit fichier texte stock\u00e9 sur votre appareil
            lorsque vous visitez un site web. Il permet au site de
            m\u00e9moriser certaines informations sur votre visite.
          </p>
        </section>

        <section>
          <h2>2. Cookies que nous utilisons</h2>
          <ul>
            <li>
              <strong>Cookies essentiels :</strong> n\u00e9cessaires au
              fonctionnement du site (consentement cookies, session
              d&apos;authentification le cas \u00e9ch\u00e9ant).
            </li>
            <li>
              <strong>Cookies d&apos;analyse :</strong> utilis\u00e9s uniquement
              avec votre consentement pour mesurer la fr\u00e9quentation du site
              et am\u00e9liorer l&apos;exp\u00e9rience utilisateur.
            </li>
          </ul>
        </section>

        <section>
          <h2>3. Gestion des cookies</h2>
          <p>
            Vous pouvez \u00e0 tout moment modifier vos pr\u00e9f\u00e9rences en
            mati\u00e8re de cookies via la banni\u00e8re de consentement ou les
            param\u00e8tres de votre navigateur. La d\u00e9sactivation de
            certains cookies peut affecter le fonctionnement du site.
          </p>
        </section>

        <section>
          <h2>4. Dur\u00e9e de conservation</h2>
          <p>
            Les cookies essentiels sont conserv\u00e9s pendant la dur\u00e9e de
            votre session. Les cookies d&apos;analyse sont conserv\u00e9s pour
            une dur\u00e9e maximale de 13 mois conform\u00e9ment aux
            recommandations de la CNIL.
          </p>
        </section>

        <section>
          <h2>5. Contact</h2>
          <p>
            Pour toute question relative aux cookies, contactez-nous \u00e0{" "}
            <a
              className="text-feature-base underline"
              href={`mailto:${PROJECT.HELP_EMAIL}`}
            >
              {PROJECT.HELP_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-12 border-stroke-soft-200 border-t pt-6">
        <Link
          className="text-feature-base text-paragraph-sm underline"
          href={MARKETING_PAGES.LANDING_PAGE}
        >
          &larr; Retour \u00e0 l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
