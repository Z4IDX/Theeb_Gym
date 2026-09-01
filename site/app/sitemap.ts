import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n";

const ROUTES = ["", "/gym", "/coaches", "/visit"];
const BASE = "https://theebgym.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap((lang) =>
    ROUTES.map((route) => ({
      url: `${BASE}/${lang}${route}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: route === "" ? 1 : 0.8,
      // Both languages are equal citizens; each URL declares the other.
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${BASE}/${l}${route}`]),
        ),
      },
    })),
  );
}
