export type LocationMapProps = {
  lat: number;
  lng: number;
  title: string;
  className?: string;
};

/**
 * Plain <iframe> embed of Google Maps — no API key, no client-side JS
 * library. The tile layer is glaring white by default, so it's run through a
 * CSS filter (invert + hue-rotate) to sit on the dark page without a bright
 * rectangle breaking the layout. The filter is judgement-tuned to keep roads
 * and labels legible rather than fully "dark mode."
 *
 * Privacy: no personal data is passed into the embed URL, and referrerPolicy
 * is capped at no-referrer-when-downgrade.
 */
export function LocationMap({ lat, lng, title, className = "" }: LocationMapProps) {
  const src = `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;

  return (
    <div className={`border border-ink-line bg-ink-panel p-2 ${className}`}>
      <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/10]">
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
          style={{
            filter:
              "grayscale(0.25) invert(90%) hue-rotate(180deg) brightness(0.95) contrast(0.85) saturate(0.85)",
          }}
        />
      </div>
    </div>
  );
}
