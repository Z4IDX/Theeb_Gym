import { SITE } from "./site";
import type { Locale } from "./i18n";

/**
 * LocalBusiness/HealthClub JSON-LD built from the owner-confirmed facts and the
 * real Google Maps coordinates. Hours are the actual ones: 06:00–02:00 every day
 * except Friday, which is 14:00–20:00. The closing time crosses midnight, which
 * schema.org expresses as a close time earlier than the open time.
 */
export function localBusinessSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": ["HealthClub", "LocalBusiness"],
    "@id": "https://theebgym.com/#gym",
    name: SITE.name[locale],
    alternateName: [SITE.lockup, SITE.name.en, SITE.name.ar],
    slogan: SITE.tagline[locale],
    foundingDate: String(SITE.opened),
    url: `https://theebgym.com/${locale}`,
    telephone: `+962${SITE.whatsapp.slice(1)}`,
    image: "https://theebgym.com/logo.png",
    logo: "https://theebgym.com/logo.png",
    address: {
      "@type": "PostalAddress",
      streetAddress: locale === "ar" ? "مرج الحمام" : "Marj Al-Hamam",
      addressLocality: locale === "ar" ? "عمّان" : "Amman",
      addressCountry: "JO",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.coords.lat,
      longitude: SITE.coords.lng,
    },
    hasMap: SITE.mapsUrl,
    sameAs: [SITE.instagram, SITE.ownerInstagram],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Saturday",
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
        ],
        opens: SITE.hours.daily.open,
        closes: SITE.hours.daily.close,
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Friday",
        opens: SITE.hours.friday.open,
        closes: SITE.hours.friday.close,
      },
    ],
    amenityFeature: [
      "Coffee house",
      "Supplement store",
      "Barber",
      "Parking",
      "Showers",
      "Lockers",
    ].map((name) => ({
      "@type": "LocationFeatureSpecification",
      name,
      value: true,
    })),
  };
}

/** The gym's founder, whose authority the whole site rests on. */
export function ownerSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://theebgym.com/#nawaiseh",
    name: "Ahmad Al-Nawaiseh",
    jobTitle: "Founder, IFBB Pro League / NPC International Judge",
    worksFor: { "@id": "https://theebgym.com/#gym" },
    sameAs: [SITE.ownerInstagram],
  };
}

/** Renders a JSON-LD block. Keys are already trusted, generated data. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
