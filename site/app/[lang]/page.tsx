import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { getDictionary } from "@/lib/dictionary";
import { getAmenities, getGallery, getHome, getOwner } from "@/lib/content";
import { MEDIA } from "@/lib/media";
import { JsonLd, localBusinessSchema, ownerSchema } from "@/lib/schema";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { StatRow } from "@/components/ui/stat";
import { AmenityList } from "@/components/ui/amenity-list";
import { CredentialList } from "@/components/ui/credential-list";
import { FramedImage } from "@/components/ui/framed-image";
import { Gallery } from "@/components/ui/gallery";
import { CtaBand } from "@/components/ui/cta-band";
import { Prose } from "@/components/ui/prose";
import { Reveal } from "@/components/ui/reveal";
import { Hero } from "@/components/home/hero";
import { HoursRail } from "@/components/home/hours-rail";
import { HOME_COPY } from "@/components/home/copy";

/**
 * The homepage runs one argument in three moves: authority (the man who built
 * this floor judges the sport), scale (so you never wait for a rack), and
 * duration (twenty hours a day, with everything else already in the building).
 *
 * It leads with the owner rather than the 2,000 m² claim, because the scale
 * number is the one thing a competitor could copy in an afternoon.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const home = await getHome(locale);

  return {
    description: home.metaDescription,
    alternates: { canonical: `/${locale}`, languages: { en: "/en", ar: "/ar" } },
    openGraph: {
      title: `${SITE.name[locale]} — ${SITE.tagline[locale]}`,
      description: home.metaDescription,
      locale: locale === "ar" ? "ar_JO" : "en_JO",
      type: "website",
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;

  const [t, home, owner, amenities, gallery] = await Promise.all([
    getDictionary(locale),
    getHome(locale),
    getOwner(locale),
    getAmenities(locale),
    getGallery(locale),
  ]);
  const copy = HOME_COPY[locale];
  const conference = MEDIA["nawaiseh-conference"];

  return (
    <>
      <JsonLd data={localBusinessSchema(locale)} />
      <JsonLd data={ownerSchema()} />

      <Hero
        locale={locale}
        eyebrow={home.hero.eyebrow}
        headline={home.hero.headline}
        subhead={home.hero.subhead}
        ctaLabel={t.cta.whatsapp}
        secondaryLabel={t.nav.gym}
        secondaryHref={`/${locale}/gym`}
        caption={copy.heroCaption}
        ownerRole={copy.ownerRole}
      />

      {/* 1. Authority */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeader
              eyebrow={home.authority.kicker}
              title={home.authority.headline}
            />
            <Prose text={home.authority.body} className="mt-8" size="lg" />
            {owner ? (
              <>
                <h3 className="eyebrow mt-12">{copy.credentialsLabel}</h3>
                <CredentialList
                  className="mt-5"
                  items={owner.credentials.map((credential) => ({
                    title: credential.title,
                    org: credential.org,
                    years: credential.years ?? undefined,
                  }))}
                />
              </>
            ) : null}
          </div>
          <div className="lg:col-span-5">
            <FramedImage
              src={`/media/${conference.slug}-${conference.width}.webp`}
              alt={conference.alt[locale]}
              width={conference.width}
              height={conference.height}
              ratio="4/5"
              blurDataURL={conference.blurDataURL}
              caption={copy.authorityCaption}
              sizes="(min-width: 1024px) 38vw, 100vw"
            />
          </div>
        </div>
      </Section>

      {/* 2. Scale */}
      <Section tone="raised">
        <SectionHeader eyebrow={home.scale.kicker} title={home.scale.headline} />
        <Reveal>
          <StatRow
            className="mt-12"
            stats={[
              { value: SITE.floor.area, label: copy.stats.area },
              { value: SITE.floor.machines, label: copy.stats.machines },
              { value: SITE.floor.brands, label: copy.stats.brands },
            ]}
          />
        </Reveal>
        <Prose text={home.scale.body} className="mt-12 max-w-3xl" size="lg" />
      </Section>

      {/* 3. Duration — the least-copied thing about this gym. */}
      <Section>
        <SectionHeader
          eyebrow={home.duration.kicker}
          title={home.duration.headline}
        />
        <HoursRail
          openLabel={copy.doorsOpen}
          closeLabel={copy.doorsClose}
          hoursLabel={copy.hoursADay}
        />
        <Prose text={home.duration.body} className="mt-12 max-w-3xl" size="lg" />
        <h3 className="eyebrow mt-16">{copy.amenitiesLabel}</h3>
        <Reveal className="mt-5">
          <AmenityList
            items={amenities.map((amenity) => ({
              title: amenity.name,
              body: amenity.body,
            }))}
          />
        </Reveal>
      </Section>

      <Section tone="raised">
        <SectionHeader eyebrow={copy.galleryEyebrow} title={copy.galleryTitle} />
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
          context="home"
          heading={home.closing.headline}
          ctaLabel={t.cta.whatsapp}
        />
        <p className="mt-8 max-w-2xl text-bone-dim">{home.closing.body}</p>
        {/* The tour is a soft secondary line by design — never a button. */}
        <p className="mt-3 max-w-2xl text-sm text-bone-faint">
          {home.closing.tourNote}
        </p>
      </Section>
    </>
  );
}
