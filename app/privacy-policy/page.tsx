import type { Metadata } from "next";
import Link from "next/link";

import { MARKETING_PAGES } from "@/constants/pages";
import { PROJECT } from "@/constants/project";

export const metadata: Metadata = {
  title: `Politique de confidentialit\u00e9 — ${PROJECT.NAME}`,
  description:
    "Politique de confidentialit\u00e9 de combien-tu-nous-coutes.com. D\u00e9couvrez comment nous traitons vos donn\u00e9es personnelles.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-[720px] px-6 py-16">
      <h1 className="mb-8 font-[family-name:var(--font-display)] text-title-h2 italic">
        Politique de confidentialit\u00e9
      </h1>
      <p className="mb-4 text-paragraph-sm text-text-sub-600">
        Derni\u00e8re mise \u00e0 jour : 10 mars 2026
      </p>

      <div className="space-y-8 text-paragraph-sm text-text-sub-600 [&_h2]:mb-3 [&_h2]:text-label-md [&_h2]:text-text-strong-950 [&_ul]:list-disc [&_ul]:pl-5">
        <section>
          <h2>1. Introduction</h2>
          <p>
            {PROJECT.COMPANY} ({"\u00ab"} nous {"\u00bb"}) s&apos;engage \u00e0
            prot\u00e9ger la vie priv\u00e9e des utilisateurs de son site{" "}
            <strong>combien-tu-nous-coutes.com</strong>. Cette politique
            d\u00e9crit les donn\u00e9es que nous collectons, pourquoi et
            comment nous les utilisons.
          </p>
        </section>

        <section>
          <h2>2. Donn\u00e9es collect\u00e9es</h2>
          <p>
            Notre service fonctionne{" "}
            <strong>sans cr\u00e9ation de compte</strong> pour le calculateur de
            co\u00fbt de r\u00e9union. Les donn\u00e9es saisies (nombre de
            participants, salaire brut) restent exclusivement dans votre
            navigateur et ne sont jamais transmises \u00e0 nos serveurs.
          </p>
          <ul className="mt-2">
            <li>
              Aucune donn\u00e9e personnelle n&apos;est collect\u00e9e par le
              calculateur
            </li>
            <li>
              Les cookies techniques n\u00e9cessaires au fonctionnement du site
            </li>
            <li>
              Les cookies d&apos;analyse (uniquement avec votre consentement)
            </li>
          </ul>
        </section>

        <section>
          <h2>3. Utilisation des donn\u00e9es</h2>
          <p>
            Les donn\u00e9es d&apos;analyse, lorsque vous y consentez, sont
            utilis\u00e9es uniquement pour am\u00e9liorer le service et
            comprendre l&apos;utilisation du site.
          </p>
        </section>

        <section>
          <h2>4. Partage des donn\u00e9es</h2>
          <p>
            Nous ne vendons, ne louons ni ne partageons vos donn\u00e9es
            personnelles avec des tiers, sauf obligation l\u00e9gale.
          </p>
        </section>

        <section>
          <h2>5. Vos droits</h2>
          <p>
            Conform\u00e9ment au RGPD, vous disposez d&apos;un droit
            d&apos;acc\u00e8s, de rectification, de suppression et de
            portabilit\u00e9 de vos donn\u00e9es. Pour exercer ces droits,
            contactez-nous \u00e0{" "}
            <a
              className="text-feature-base underline"
              href={`mailto:${PROJECT.HELP_EMAIL}`}
            >
              {PROJECT.HELP_EMAIL}
            </a>
            .
          </p>
        </section>

        <section>
          <h2>6. Contact</h2>
          <p>
            Pour toute question relative \u00e0 cette politique, contactez-nous
            \u00e0{" "}
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
