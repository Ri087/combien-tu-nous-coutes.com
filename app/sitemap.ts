import type { MetadataRoute } from "next";

const SITE_URL = "https://combien-tu-nous-coutes.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date("2026-03-10"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: new Date("2025-06-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/cookie-policy`,
      lastModified: new Date("2025-06-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms-of-service`,
      lastModified: new Date("2025-06-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
