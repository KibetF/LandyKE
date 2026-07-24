import type { MetadataRoute } from "next";

const BASE = "https://www.landyke.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const services = [
    "cleaning",
    "financial-reporting",
    "lease-management",
    "maintenance",
    "rent-collection",
    "repairs",
    "tax-compliance",
    "tenant-acquisition",
  ];

  return [
    { url: BASE, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/services`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.8 },
    ...services.map((s) => ({
      url: `${BASE}/services/${s}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
