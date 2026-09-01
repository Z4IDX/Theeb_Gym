import type { Locale } from "@/lib/i18n";

/**
 * Homepage micro-copy that has no home in the CMS or the shared dictionary:
 * stat labels, image captions and the two labels the day-span rail needs.
 *
 * Everything narrative on this page comes from `getHome()`; everything reusable
 * (nav, CTA labels, hours) comes from `getDictionary()`. What is left is the
 * handful of strings below, which exist only because this page renders a
 * composition — a stat row, a 20-hour rail, framed captions — that no other
 * page shares. If the owner ever needs to edit them, they belong in
 * `content/dictionaries/*.json` under a `home` key.
 *
 * No numerals live here. Every number on this page comes from `SITE.floor`,
 * `SITE.hours` or the CMS body copy.
 */
type HomeCopy = {
  /** Sits above the owner's name in the hero. */
  ownerRole: string;
  /** Eyebrow over the hero credential rail. */
  credentialsLabel: string;
  heroCaption: string;
  authorityCaption: string;
  scaleCaption: string;
  durationCaption: string;
  stats: {
    area: string;
    machines: string;
    brands: string;
  };
  doorsOpen: string;
  doorsClose: string;
  hoursADay: string;
  amenitiesLabel: string;
  galleryEyebrow: string;
  galleryTitle: string;
};

export const HOME_COPY: Record<Locale, HomeCopy> = {
  en: {
    ownerRole: "Founder and coaching director",
    credentialsLabel: "Credentials",
    heroCaption: "IFBB Pro League — the scoring table.",
    authorityCaption: "At the podium.",
    scaleCaption: "The main training floor.",
    durationCaption: "The cardio corridor.",
    stats: {
      area: "Square metres",
      machines: "Machines",
      brands: "Global brands",
    },
    doorsOpen: "Doors open",
    doorsClose: "Doors close",
    hoursADay: "Hours a day",
    amenitiesLabel: "Under the same roof",
    galleryEyebrow: "Inside Theeb",
    galleryTitle: "The floor, as it actually looks.",
  },
  ar: {
    ownerRole: "المؤسّس ومدير التدريب",
    credentialsLabel: "الاعتمادات",
    heroCaption: "IFBB Pro League — طاولة التحكيم.",
    authorityCaption: "على المنصّة.",
    scaleCaption: "صالة التدريب الرئيسية.",
    durationCaption: "ممر الكارديو.",
    stats: {
      area: "متر مربع",
      machines: "جهاز تدريب",
      brands: "علامة عالمية",
    },
    doorsOpen: "تفتح الأبواب",
    doorsClose: "تُغلق الأبواب",
    hoursADay: "ساعة في اليوم",
    amenitiesLabel: "تحت السقف نفسه",
    galleryEyebrow: "داخل الذيب",
    galleryTitle: "الصالة كما هي فعلاً.",
  },
};
