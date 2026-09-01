import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { getVisitPage, getSettings, getAmenities } from "@/lib/content";
import { localBusinessSchema, JsonLd } from "@/lib/schema";
import { SITE } from "@/lib/site";
import { MEDIA, src } from "@/lib/media";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { FramedImage } from "@/components/ui/framed-image";
import { HoursTable } from "@/components/ui/hours-table";
import { AmenityList } from "@/components/ui/amenity-list";
import { CtaBand } from "@/components/ui/cta-band";
import { Reveal } from "@/components/ui/reveal";
import { LocationMap } from "@/components/visit/location-map";
import { ContactNumbers } from "@/components/visit/contact-numbers";
import { Prose } from "@/components/visit/prose";

const COPY = {
  en: {
    mapTitle: "Map showing Theeb Gym's location in Marj Al-Hamam, Amman",
    coordsLabel: "GPS coordinates",
    parkingEyebrow: "Parking",
    hoursTitle: "Opening hours",
    fridayEyebrow: "The one day that's different",
    contactEyebrow: "Get in touch",
    contactTitle: "How to reach us",
    amenitiesEyebrow: "On site",
    amenitiesTitle: "What's here when you arrive",
    tourEyebrow: "Prefer a guide?",
    ctaHeading: "Ready to see it for yourself?",
  },
  ar: {
    mapTitle: "خريطة توضح موقع نادي الذيب في مرج الحمام، عمّان",
    coordsLabel: "إحداثيات الموقع",
    parkingEyebrow: "المواقف",
    hoursTitle: "أوقات الدوام",
    fridayEyebrow: "اليوم الوحيد المختلف",
    contactEyebrow: "تواصل معنا",
    contactTitle: "كيف تتواصل معنا",
    amenitiesEyebrow: "في الموقع",
    amenitiesTitle: "بانتظارك عند الوصول",
    tourEyebrow: "تفضّل مرافقة؟",
    ctaHeading: "جاهز تشوف النادي بنفسك؟",
  },
} as const;

function resolveLocale(lang: string): Locale {
  return isLocale(lang) ? lang : "en";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const t = await getDictionary(locale);
  const visit = await getVisitPage(locale);

  return {
    title: t.nav.visit,
    description: visit.metaDescription,
    alternates: {
      canonical: `/${locale}/visit`,
      languages: { en: "/en/visit", ar: "/ar/visit" },
    },
    openGraph: {
      title: `${t.nav.visit} — ${SITE.name[locale]}`,
      description: visit.metaDescription,
      locale: locale === "ar" ? "ar_JO" : "en_JO",
      type: "website",
    },
  };
}

export default async function VisitPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = resolveLocale(lang);

  const [t, visit, settings, amenities] = await Promise.all([
    getDictionary(locale),
    getVisitPage(locale),
    getSettings(locale),
    getAmenities(locale),
  ]);

  const c = COPY[locale];
  const hero = MEDIA["gallery-01"];

  const hoursRows = [
    { label: t.hours.daily, value: t.hours.dailyValue },
    { label: t.hours.friday, value: t.hours.fridayValue },
  ];

  const amenityItems = amenities
    .filter((amenity) => amenity.slug !== "parking")
    .map((amenity) => ({ title: amenity.name, body: amenity.body }));

  return (
    <div className="pb-8">
      <JsonLd data={localBusinessSchema(locale)} />

      {/* Hero / intro */}
      <Section tone="base" className="pt-14 lg:pt-20">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
          <div className="flex flex-col gap-6">
            <SectionHeader as="h1" align="start" eyebrow={visit.intro.eyebrow} title={visit.intro.headline} />
            <Prose text={visit.intro.body} />
          </div>
          <Reveal className="lg:pt-2">
            <FramedImage
              src={src("gallery-01", hero.widths[hero.widths.length - 1])}
              alt={hero.alt[locale]}
              width={hero.width}
              height={hero.height}
              ratio="3/2"
              frame="line"
              blurDataURL={hero.blurDataURL}
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="mx-auto lg:mx-0"
            />
          </Reveal>
        </div>
      </Section>

      {/* Where it is + map */}
      <Section tone="raised">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6">
            <LocationMap lat={SITE.coords.lat} lng={SITE.coords.lng} title={c.mapTitle} />
            <a
              href={settings.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center justify-center gap-2.5 border border-bone/25 px-6 py-3 text-sm font-semibold tracking-wide text-bone transition-colors hover:border-bone/60 hover:bg-bone/5"
            >
              {t.cta.directions}
            </a>
          </div>

          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <SectionHeader eyebrow={settings.address} title={visit.directions.headline} />
              <Prose text={visit.directions.body} />
              <p dir="ltr" className="text-start text-sm text-bone-faint">
                {c.coordsLabel}: {SITE.coords.lat}, {SITE.coords.lng}
              </p>
            </div>

            <div className="flex flex-col gap-4 border-t border-ink-line pt-8">
              <p className="eyebrow">{c.parkingEyebrow}</p>
              <h3 className="font-display text-display-sm text-bone">{visit.parking.headline}</h3>
              <Prose text={visit.parking.body} />
            </div>
          </div>
        </div>
      </Section>

      {/* Hours */}
      <Section tone="panel">
        <div className="flex flex-col gap-10">
          <SectionHeader title={c.hoursTitle} />
          <HoursTable rows={hoursRows} />
          <div className="max-w-2xl border-s-2 border-blood ps-6 sm:ps-8">
            <p className="eyebrow text-blood-hot">{c.fridayEyebrow}</p>
            <p className="mt-3 text-base text-bone sm:text-lg">{visit.fridayNote}</p>
          </div>
        </div>
      </Section>

      {/* Contact numbers */}
      <Section tone="base">
        <div className="flex flex-col gap-10">
          <SectionHeader eyebrow={c.contactEyebrow} title={c.contactTitle} />
          <ContactNumbers locale={locale} />
        </div>
      </Section>

      {/* Amenities */}
      <Section tone="raised">
        <div className="flex flex-col gap-10">
          <SectionHeader eyebrow={c.amenitiesEyebrow} title={c.amenitiesTitle} />
          <AmenityList items={amenityItems} />
        </div>
      </Section>

      {/* Free tour — soft, secondary mention only */}
      <Section tone="base" className="py-14 lg:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">{c.tourEyebrow}</p>
          <p className="mt-3 text-base text-bone-dim sm:text-lg">{visit.tourNote}</p>
        </div>
      </Section>

      {/* Closing CTA */}
      <Section tone="panel">
        <CtaBand locale={locale} context="visit" heading={c.ctaHeading} ctaLabel={t.cta.whatsapp} />
      </Section>
    </div>
  );
}
