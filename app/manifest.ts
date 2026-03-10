import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Combien tu nous coûtes ? — Calculateur de coût de réunion",
    short_name: "Combien tu nous coûtes ?",
    description:
      "Calcule en temps réel combien ta réunion coûte à l'entreprise. Charges patronales incluses.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
    lang: "fr",
    icons: [
      {
        src: "/favicon.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
