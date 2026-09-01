import { FramedImage } from "@/components/ui/framed-image";
import { SectionHeader } from "@/components/ui/section-header";
import { MEDIA, src, type MediaAsset } from "@/lib/media";
import type { Locale } from "@/lib/i18n";
import type { StaffCoach } from "@/lib/content";

/**
 * Every coach except the owner is a name and a face — nothing else. No bio,
 * no credentials, no speciality, no booking offer. Renders nothing at all
 * when there are no staff coaches, so the roster can shrink to zero without
 * leaving a broken or empty-looking section on the page.
 */

function mediaAsset(slug: string): MediaAsset {
  const asset = (MEDIA as Record<string, MediaAsset>)[slug];
  if (!asset) throw new Error(`Unknown media slug: ${slug}`);
  return asset;
}

const HEADING: Record<Locale, { eyebrow: string; title: string }> = {
  en: { eyebrow: "The team", title: "Coaching staff" },
  ar: { eyebrow: "الفريق", title: "طاقم التدريب" },
};

export function CoachGrid({ coaches, locale }: { coaches: StaffCoach[]; locale: Locale }) {
  if (coaches.length === 0) return null;

  return (
    <div className="flex flex-col gap-10">
      <SectionHeader eyebrow={HEADING[locale].eyebrow} title={HEADING[locale].title} />
      <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {coaches.map((coach) => {
          const asset = mediaAsset(coach.photo);
          return (
            <li key={coach.slug} className="flex flex-col gap-3">
              <FramedImage
                src={src(coach.photo, asset.widths[asset.widths.length - 1])}
                alt={asset.alt[locale]}
                width={asset.width}
                height={asset.height}
                blurDataURL={asset.blurDataURL}
                ratio="4/5"
                frame="line"
                sizes="(min-width: 1024px) 25vw, 50vw"
              />
              <p className="font-display text-lg text-bone">{coach.name}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
