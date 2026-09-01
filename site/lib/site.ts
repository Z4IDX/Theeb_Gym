import type { Locale } from "./i18n";

/**
 * Owner-confirmed facts. Nothing here comes from the old static site.
 *
 * Class timetables and any "ladies-only" facility do not exist and must never
 * be added. Prices DO now exist, as of the owner's own price-list graphic — but
 * they live in the CMS (`content/pages/gym.yaml` -> `pricing`), not here, so the
 * owner can change them without a deploy.
 */
export const SITE = {
  name: { en: "Theeb Gym", ar: "نادي الذيب" },
  lockup: "THEEB FITNESS",
  tagline: { en: "Break Limits", ar: "اكسر الحدود" },
  opened: 2025,
  address: { en: "Marj Al-Hamam, Amman, Jordan", ar: "مرج الحمام، عمّان، الأردن" },
  coords: { lat: 31.8867084, lng: 35.8572222 },
  mapsUrl: "https://maps.app.goo.gl/e8RGGdA99J2q5msj8",
  whatsapp: "0778000946",
  whatsappIntl: "962778000946",
  phone: "0778000945",
  instagram: "https://www.instagram.com/theebfitness",
  instagramHandle: "@theebfitness",
  ownerInstagram: "https://www.instagram.com/captain_ahmad_nawaiseh/",
  floor: { area: "2,000", machines: "250+", brands: "14" },
  hours: {
    /** Sat-Thu */
    daily: { open: "06:00", close: "02:00" },
    friday: { open: "14:00", close: "20:00" },
  },
} as const;

/** Every CTA on the site is a WhatsApp deep link with the message pre-filled. */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${SITE.whatsappIntl}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_MESSAGES: Record<string, Record<Locale, string>> = {
  home: {
    en: "Hi Theeb Gym — I'd like to know more about joining.",
    ar: "مرحباً نادي الذيب — حابب أعرف أكثر عن الاشتراك.",
  },
  gym: {
    en: "Hi Theeb Gym — I saw the gym page and I have a question.",
    ar: "مرحباً نادي الذيب — شفت صفحة النادي وعندي استفسار.",
  },
  coaches: {
    en: "Hi Theeb Gym — I'd like to ask about training at Theeb.",
    ar: "مرحباً نادي الذيب — حابب أسأل عن التدريب في الذيب.",
  },
  visit: {
    en: "Hi Theeb Gym — I'd like to come and see the gym.",
    ar: "مرحباً نادي الذيب — حابب أزور النادي وأشوفه.",
  },
  tour: {
    en: "Hi Theeb Gym — can I book a free tour?",
    ar: "مرحباً نادي الذيب — بقدر أحجز جولة مجانية؟",
  },
};
