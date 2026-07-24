import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/admin",
        "/properties",
        "/tenants",
        "/payments",
        "/reports",
        "/maintenance",
        "/documents",
        "/settings",
        "/my/",
        "/caretaker/",
        "/login",
        "/tenant-login",
        "/setup-password",
        "/unauthorized",
      ],
    },
    sitemap: "https://www.landyke.com/sitemap.xml",
  };
}
