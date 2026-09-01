import Link from "next/link";
import { FramedImage } from "@/components/ui/framed-image";
import { CredentialList } from "@/components/ui/credential-list";
import { Gallery, type GalleryItem } from "@/components/ui/gallery";
import { SectionHeader } from "@/components/ui/section-header";
import { Reveal } from "@/components/ui/reveal";
import { MEDIA, src, type MediaAsset } from "@/lib/media";
import type { Locale } from "@/lib/i18n";
import type { OwnerCoach } from "@/lib/content";

/**
 * The owner-only editorial treatment: portrait, biography, credentials, the
 * judging-table photo, and a small gallery of his international judging and
 * speaking record. Every image slug here is a specific, curated asset from
 * `lib/media.ts` — not the generic per-coach `photo` field the staff grid
 * uses — because these were named as this section's imagery.
 */

function mediaAsset(slug: string): MediaAsset {
  const asset = (MEDIA as Record<string, MediaAsset>)[slug];
  if (!asset) throw new Error(`Unknown media slug: ${slug}`);
  return asset;
}

function largestSrc(slug: string, asset: MediaAsset): string {
  return src(slug, asset.widths[asset.widths.length - 1]);
}

const JUDGING_CAPTION: Record<Locale, string> = {
  en: "International Judge — IFBB Pro League / NPC",
  ar: "حَكَم دولي — IFBB Pro League / NPC",
};

const ROLE_EYEBROW: Record<Locale, string> = {
  en: "Founder — International Judge, IFBB Pro League / NPC",
  ar: "المؤسس — حَكَم دولي، IFBB Pro League / NPC",
};

const SUPPORTING_COPY = {
  eyebrow: { en: "On the record", ar: "في السجل" } as Record<Locale, string>,
  title: {
    en: "The credential in action",
    ar: "الاعتماد على أرض الواقع",
  } as Record<Locale, string>,
  lead: {
    en: "Judging panels, coaching conferences and championship stages across the region — the same standard he holds this floor to.",
    ar: "لجان تحكيم ومؤتمرات تدريبية ومسارح بطولات حول المنطقة — نفس المعيار الذي يطبّقه على هذه الصالة.",
  } as Record<Locale, string>,
};

const SUPPORTING_SLUGS = [
  "nawaiseh-conference",
  "nawaiseh-stage-tunisia",
  "nawaiseh-award-stage",
  "nawaiseh-judging-tunisia",
  "nawaiseh-speaking-libya",
  "nawaiseh-credentials",
] as const;

export function OwnerFeature({
  owner,
  locale,
  instagramLabel,
}: {
  owner: OwnerCoach;
  locale: Locale;
  instagramLabel: string;
}) {
  const portrait = mediaAsset("nawaiseh-portrait");
  const judging = mediaAsset("nawaiseh-judging");

  const galleryItems: GalleryItem[] = SUPPORTING_SLUGS.map((slug) => {
    const asset = mediaAsset(slug);
    return {
      src: largestSrc(slug, asset),
      alt: asset.alt[locale],
      width: asset.width,
      height: asset.height,
      ratio: asset.aspect >= 1.2 ? "3/2" : "4/5",
    };
  });

  return (
    <div className="flex flex-col gap-16 lg:gap-20">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[360px_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <FramedImage
            src={largestSrc("nawaiseh-portrait", portrait)}
            alt={portrait.alt[locale]}
            width={portrait.width}
            height={portrait.height}
            blurDataURL={portrait.blurDataURL}
            ratio="4/5"
            frame="line"
            priority
            sizes="(min-width: 1024px) 360px, 100vw"
          />
        </div>

        <div className="flex flex-col gap-8">
          <div>
            <p className="eyebrow">{ROLE_EYEBROW[locale]}</p>
            <h2 className="mt-2 font-display text-display-md text-bone">{owner.name}</h2>
          </div>

          <div
            className="max-w-2xl text-base text-bone-dim sm:text-lg [&_p]:mt-4 [&_p:first-child]:mt-0 [&_a]:text-bone [&_a]:underline [&_a]:decoration-ink-line [&_a]:underline-offset-4 [&_a:hover]:text-blood"
            dangerouslySetInnerHTML={{ __html: owner.bio }}
          />

          {owner.instagram ? (
            <Link
              href={owner.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit text-sm text-bone-dim underline decoration-ink-line underline-offset-4 transition-colors hover:text-bone"
            >
              {instagramLabel}
            </Link>
          ) : null}

          <CredentialList
            items={owner.credentials.map((credential) => ({
              title: credential.title,
              org: credential.org,
              years: credential.years ?? undefined,
            }))}
          />
        </div>
      </div>

      <Reveal>
        <FramedImage
          src={largestSrc("nawaiseh-judging", judging)}
          alt={judging.alt[locale]}
          width={judging.width}
          height={judging.height}
          blurDataURL={judging.blurDataURL}
          ratio="3/2"
          frame="panel"
          caption={JUDGING_CAPTION[locale]}
          sizes="(min-width: 1024px) 800px, 100vw"
          className="mx-auto"
        />
      </Reveal>

      <div className="flex flex-col gap-8">
        <SectionHeader
          eyebrow={SUPPORTING_COPY.eyebrow[locale]}
          title={SUPPORTING_COPY.title[locale]}
          lead={SUPPORTING_COPY.lead[locale]}
        />
        <Gallery items={galleryItems} closeLabel={locale === "ar" ? "إغلاق" : "Close"} />
      </div>
    </div>
  );
}
