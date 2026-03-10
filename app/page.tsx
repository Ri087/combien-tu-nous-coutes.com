import { MeetingCounter } from "./_components/meeting-counter";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Combien tu nous coûtes ?",
  url: "https://combien-tu-nous-coutes.com",
  description:
    "Calcule en temps réel combien ta réunion coûte à l'entreprise. Charges patronales incluses.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
  inLanguage: "fr",
};

export default function Home() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />
      <MeetingCounter />
    </>
  );
}
