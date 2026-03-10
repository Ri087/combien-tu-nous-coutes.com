import type { Metadata } from "next";
import Link from "next/link";

import { MARKETING_PAGES } from "@/constants/pages";
import { PROJECT } from "@/constants/project";

export const metadata: Metadata = {
  title: `Conditions g\u00e9n\u00e9rales d'utilisation — ${PROJECT.NAME}`,
  description:
    "Conditions g\u00e9n\u00e9rales d'utilisation de combien-tu-nous-coutes.com.",
};

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-[720px] px-6 py-16">
      <h1 className="mb-8 font-[family-name:var(--font-display)] text-title-h2 italic">
        Conditions g\u00e9n\u00e9rales d&apos;utilisation
      </h1>
      <p className="mb-4 text-paragraph-sm text-text-sub-600">
        Derni\u00e8re mise \u00e0 jour : 10 mars 2026
      </p>

      <div className="space-y-8 text-paragraph-sm text-text-sub-600 [&_h2]:mb-3 [&_h2]:text-label-md [&_h2]:text-text-strong-950 [&_ul]:list-disc [&_ul]:pl-5">
        <section>
          <h2>1. Objet</h2>
          <p>
            Les pr\u00e9sentes conditions g\u00e9n\u00e9rales d&apos;utilisation
            (CGU) r\u00e9gissent l&apos;acc\u00e8s et l&apos;utilisation du site{" "}
            <strong>combien-tu-nous-coutes.com</strong>, \u00e9dit\u00e9 par{" "}
            {PROJECT.COMPANY}.
          </p>
        </section>

        <section>
          <h2>2. Acc\u00e8s au service</h2>
          <p>
            Le site est accessible gratuitement \u00e0 tout utilisateur
            disposant d&apos;un acc\u00e8s \u00e0 Internet. Le calculateur de
            co\u00fbt de r\u00e9union fonctionne int\u00e9gralement dans le
            navigateur, sans n\u00e9cessiter de cr\u00e9ation de compte.
          </p>
        </section>

        <section>
          <h2>3. Propri\u00e9t\u00e9 intellectuelle</h2>
          <p>
            L&apos;ensemble du contenu du site (textes, graphismes, logos,
            ic\u00f4nes, code source) est prot\u00e9g\u00e9 par le droit
            d&apos;auteur et reste la propri\u00e9t\u00e9 exclusive de{" "}
            {PROJECT.COMPANY}. Toute reproduction sans autorisation
            pr\u00e9alable est interdite.
          </p>
        </section>

        <section>
          <h2>4. Limitation de responsabilit\u00e9</h2>
          <p>
            Les calculs fournis par le site sont donn\u00e9s \u00e0 titre
            indicatif. {PROJECT.COMPANY} ne saurait \u00eatre tenu responsable
            de l&apos;utilisation des r\u00e9sultats ni de leur exactitude. Le
            taux de charges patronales utilis\u00e9 (45%) est une estimation
            moyenne.
          </p>
        </section>

        <section>
          <h2>5. Donn\u00e9es personnelles</h2>
          <p>
            Le traitement des donn\u00e9es personnelles est d\u00e9crit dans
            notre{" "}
            <Link
              className="text-feature-base underline"
              href={MARKETING_PAGES.PRIVACY_POLICY}
            >
              politique de confidentialit\u00e9
            </Link>
            .
          </p>
        </section>

        <section>
          <h2>6. Modification des CGU</h2>
          <p>
            Nous nous r\u00e9servons le droit de modifier les pr\u00e9sentes CGU
            \u00e0 tout moment. Les modifications entrent en vigueur d\u00e8s
            leur publication sur le site.
          </p>
        </section>

        <section>
          <h2>7. Droit applicable</h2>
          <p>
            Les pr\u00e9sentes CGU sont r\u00e9gies par le droit fran\u00e7ais.
            En cas de litige, les tribunaux fran\u00e7ais seront seuls
            comp\u00e9tents.
          </p>
        </section>

        <section>
          <h2>8. Contact</h2>
          <p>
            Pour toute question, contactez-nous \u00e0{" "}
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
