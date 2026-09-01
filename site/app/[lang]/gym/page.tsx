import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { getDictionary } from "@/lib/dictionary";
import {
  getAmenities,
  getBrands,
  getClasses,
  getGallery,
  getGymPage,
  getZones,
} from "@/lib/content";
import { MEDIA } from "@/lib/media";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { StatRow } from "@/components/ui/stat";
import { BrandWall } from "@/components/ui/brand-wall";
import { AmenityList } from "@/components/ui/amenity-list";
import { Gallery } from "@/components/ui/gallery";
import { CtaBand } from "@/components/ui/cta-band";
import { Prose } from "@/components/ui/prose";
import { Reveal } from "@/components/ui/reveal";
import { ZoneList } from "@/components/gym/zone-list";
import { ClassList } from "@/components/gym/class-list";
import { PriceTable } from "@/components/gym/price-table";

/**
 * The gym page proves the scale claim and then spends most of its length on
 * the thing no competitor in Amman says: the building is open twenty hours a
 * day and has a coffee house, a supplement store and a barber in it.
 *
 * One rule is still load-bearing here: no class carries a day or a time.
 *
 * The other one used to be "no fee anywhere on this page". That was reversed on
 * 2026-09-01 when the owner supplied their own price-list graphic, so
 * `#membership` now carries the real terms as text. Classes are confirmed by
 * that same graphic ("12 classes a month"), which settles what was open in
 * LAUNCH-BLOCKERS.md.
 */

const COPY = {
  scaleTitle: {
    en: "You never wait for a rack.",
    ar: "لن تنتظر دورك على أي جهاز.",
  },
  scaleLead: {
    en: "The numbers matter only for what they buy you: at the busiest hour of the evening, the thing you came to use is free.",
    ar: "الأرقام لا تهمّ لذاتها، بل لما تعنيه: في أكثر ساعات المساء ازدحاماً، الجهاز الذي جئت من أجله متاح.",
  },
  statArea: { en: "Square metres", ar: "متر مربع" },
  statMachines: { en: "Machines", ar: "جهاز تدريب" },
  statBrands: { en: "Global brands", ar: "علامة عالمية" },
  equipment: { en: "In this zone", ar: "في هذه المنطقة" },
  suits: { en: "Suits", ar: "تناسب" },
  amenitiesEyebrow: { en: "Under the same roof", ar: "تحت السقف نفسه" },
  amenitiesTitle: {
    en: "You don't visit Theeb. You spend the evening here.",
    ar: "أنت لا تزور الذيب، بل تقضي مساءك فيه.",
  },
  amenitiesLead: {
    en: "Six in the morning to two the next. Train, shower, get your hair cut, pick up what you need and sit down with a coffee — without moving the car.",
    ar: "من السادسة صباحاً حتى الثانية بعد منتصف الليل. تتمرّن، وتستحمّ، وتقصّ شعرك، وتشتري ما تحتاجه، وتجلس على قهوة — دون أن تحرّك سيارتك.",
  },
  galleryEyebrow: { en: "Inside", ar: "من الداخل" },
  galleryTitle: { en: "The floor, as it actually looks.", ar: "الصالة كما هي فعلاً." },
  ctaHeading: {
    en: "Ask us anything about the gym.",
    ar: "اسألنا عن أي شيء يخصّ النادي.",
  },
} satisfies Record<string, Record<Locale, string>>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const [t, page] = await Promise.all([getDictionary(locale), getGymPage(locale)]);

  return {
    title: t.nav.gym,
    description: page.metaDescription,
    alternates: {
      canonical: `/${locale}/gym`,
      languages: { en: "/en/gym", ar: "/ar/gym" },
    },
    openGraph: {
      title: `${t.nav.gym} — ${SITE.name[locale]}`,
      description: page.metaDescription,
      locale: locale === "ar" ? "ar_JO" : "en_JO",
      type: "website",
    },
  };
}

export default async function GymPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;

  const [t, page, zones, brands, classes, amenities, gallery] = await Promise.all([
    getDictionary(locale),
    getGymPage(locale),
    getZones(locale),
    getBrands(),
    getClasses(locale),
    getAmenities(locale),
    getGallery(locale),
  ]);

  return (
    <>
      <Section>
        <SectionHeader
          as="h1"
          eyebrow={page.intro.eyebrow}
          title={page.intro.headline}
        />
        <Prose text={page.intro.body} className="mt-8 max-w-3xl" size="lg" />
      </Section>

      <Section tone="raised">
        <SectionHeader title={COPY.scaleTitle[locale]} lead={COPY.scaleLead[locale]} />
        <StatRow
          className="mt-12"
          stats={[
            { value: SITE.floor.area, label: COPY.statArea[locale] },
            { value: SITE.floor.machines, label: COPY.statMachines[locale] },
            { value: SITE.floor.brands, label: COPY.statBrands[locale] },
          ]}
        />
      </Section>

      <Section>
        <SectionHeader title={page.zonesIntro.headline} lead={page.zonesIntro.body} />
        <div className="mt-16">
          <ZoneList zones={zones} locale={locale} equipmentLabel={COPY.equipment[locale]} />
        </div>
      </Section>

      <Section tone="raised">
        <SectionHeader title={page.brandsIntro.headline} lead={page.brandsIntro.body} />
        {/* No vector logos exist, so BrandWall renders its typographic fallback. */}
        <BrandWall className="mt-12" brands={brands.map((brand) => ({ name: brand.name }))} />
      </Section>

      <Section>
        <SectionHeader
          eyebrow={COPY.amenitiesEyebrow[locale]}
          title={COPY.amenitiesTitle[locale]}
          lead={COPY.amenitiesLead[locale]}
        />
        <Reveal className="mt-12">
          <AmenityList
            items={amenities.map((amenity) => ({
              title: amenity.name,
              body: amenity.body,
            }))}
          />
        </Reveal>
      </Section>

      <Section tone="raised">
        <SectionHeader title={page.classes.headline} lead={page.classes.body} />
        <div className="mt-12">
          <ClassList classes={classes} suitsLabel={COPY.suits[locale]} />
        </div>
        <p className="mt-10 text-lg text-bone">
          {page.classes.instagramLine}{" "}
          <Link
            href={SITE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blood-hot underline underline-offset-4 hover:text-bone"
          >
            {SITE.instagramHandle}
          </Link>
        </p>
      </Section>

      {/* The nav links to /gym#membership. This anchor must not be renamed. */}
      <Section id="membership">
        <SectionHeader title={page.membership.headline} />
        <Prose text={page.membership.body} className="mt-8 max-w-3xl" size="lg" />

        <h3 className="font-display mt-20 text-display-sm text-bone">
          {page.pricing.headline}
        </h3>
        <PriceTable className="mt-8" pricing={page.pricing} />
      </Section>

      <Section tone="raised">
        <SectionHeader
          eyebrow={COPY.galleryEyebrow[locale]}
          title={COPY.galleryTitle[locale]}
        />
        <Gallery
          className="mt-12"
          closeLabel={t.nav.close}
          items={gallery.flatMap((item) => {
            const asset = MEDIA[item.image as keyof typeof MEDIA];
            if (!asset) return [];
            return [
              {
                src: `/media/${asset.slug}-${asset.widths[asset.widths.length - 1]}.webp`,
                alt: item.alt || asset.alt[locale],
                width: asset.width,
                height: asset.height,
                ratio: item.crop,
              },
            ];
          })}
        />
      </Section>

      <Section tone="panel">
        <CtaBand
          locale={locale}
          context="gym"
          heading={COPY.ctaHeading[locale]}
          ctaLabel={t.cta.whatsapp}
        />
      </Section>
    </>
  );
}
