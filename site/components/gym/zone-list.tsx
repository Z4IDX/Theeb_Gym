import { FramedImage } from "@/components/ui/framed-image";
import { Prose } from "@/components/ui/prose";
import { MEDIA } from "@/lib/media";
import type { Zone } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

/**
 * Zones alternate the image side on wide screens. The order is set with
 * `order-*` on the grid children rather than by reversing the DOM, so the
 * heading still precedes its own description for a screen reader, and the
 * whole thing mirrors correctly in Arabic without any extra work.
 */
export function ZoneList({
  zones,
  locale,
  equipmentLabel,
}: {
  zones: Zone[];
  locale: Locale;
  equipmentLabel: string;
}) {
  return (
    <div className="flex flex-col gap-20 lg:gap-28">
      {zones.map((zone, index) => {
        const asset = zone.photo ? MEDIA[zone.photo as keyof typeof MEDIA] : undefined;
        const imageFirst = index % 2 === 1;

        return (
          <article
            key={zone.slug}
            className="grid items-start gap-8 lg:grid-cols-12 lg:gap-14"
          >
            <div
              className={`lg:col-span-7 ${imageFirst ? "lg:order-2" : ""}`}
            >
              <p className="eyebrow">
                {/* Zone numbers stay Western digits and LTR in both languages. */}
                <span dir="ltr" className="inline-block">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </p>
              <h3 className="font-display mt-3 text-display-sm">{zone.name}</h3>
              <Prose text={zone.summary} className="mt-5 max-w-2xl" />

              {zone.equipment.length > 0 ? (
                <>
                  <h4 className="eyebrow mt-8">{equipmentLabel}</h4>
                  <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-2">
                    {zone.equipment.map((item) => (
                      <li
                        key={item}
                        className="border border-ink-line px-3 py-1.5 text-sm text-bone-dim"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>

            {asset ? (
              <div className={`lg:col-span-5 ${imageFirst ? "lg:order-1" : ""}`}>
                <FramedImage
                  src={`/media/${asset.slug}-${asset.widths[asset.widths.length - 1]}.webp`}
                  alt={asset.alt[locale]}
                  width={asset.width}
                  height={asset.height}
                  ratio={asset.aspect > 1.2 ? "3/2" : asset.aspect < 0.9 ? "4/5" : "1/1"}
                  blurDataURL={asset.blurDataURL}
                  sizes="(min-width: 1024px) 34vw, 100vw"
                />
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
