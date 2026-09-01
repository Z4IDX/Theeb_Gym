import { FramedImage } from "@/components/ui/framed-image";
import { WhatsAppCta } from "@/components/whatsapp-cta";
import { MEDIA } from "@/lib/media";
import { SITE } from "@/lib/site";
import type { Locale } from "@/lib/i18n";

/**
 * A typography-led hero, not a photographic one.
 *
 * The largest photograph this client owns is 1170px wide, so a full-bleed
 * desktop hero image is not available at any quality — stretching one would
 * undo the credibility the page exists to build. Instead the headline carries
 * the composition and the photograph sits inside a deliberate frame at its
 * native 3:2 crop, occupying roughly a third of the viewport width, where it
 * is never asked to scale past its intrinsic size.
 *
 * The image is `nawaiseh-judging` — the owner at the scoring table of an IFBB
 * Pro League show. It is the credential in action rather than a portrait, which
 * is the whole argument of the page in one frame.
 */
export function Hero({
  locale,
  eyebrow,
  headline,
  subhead,
  ctaLabel,
  secondaryLabel,
  secondaryHref,
  caption,
  ownerRole,
}: {
  locale: Locale;
  eyebrow: string;
  headline: string;
  subhead: string;
  ctaLabel: string;
  secondaryLabel: string;
  secondaryHref: string;
  caption: string;
  ownerRole: string;
}) {
  const asset = MEDIA["nawaiseh-judging"];

  return (
    <section className="border-b border-ink-line">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-10 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="eyebrow">{eyebrow}</p>

            {/* Sized to the column, not the viewport: `display-xl` is a
                full-bleed size and overruns this seven-column track on desktop,
                where the longest word collides with the photograph beside it. */}
            <h1 className="font-display mt-6 text-display-lg text-balance text-bone">
              {headline}
            </h1>

            {/* The bilingual tagline sits under the headline as a rule, not as
                a second heading — it is a mark, not a message. */}
            <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 border-s-2 border-blood ps-4 text-sm tracking-widest text-bone-dim uppercase">
              <span dir="ltr">{SITE.tagline.en}</span>
              <span aria-hidden="true" className="text-bone-faint">·</span>
              <span dir="rtl" className="normal-case">{SITE.tagline.ar}</span>
            </p>

            <p className="mt-8 max-w-2xl text-lg text-bone-dim sm:text-xl">
              {subhead}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
              <WhatsAppCta locale={locale} context="home" label={ctaLabel} />
              <a
                href={secondaryHref}
                className="text-sm text-bone-dim underline decoration-ink-line underline-offset-4 transition-colors hover:text-bone"
              >
                {secondaryLabel}
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <FramedImage
              src={`/media/${asset.slug}-${asset.width}.webp`}
              alt={asset.alt[locale]}
              width={asset.width}
              height={asset.height}
              ratio="3/2"
              blurDataURL={asset.blurDataURL}
              priority
              caption={caption}
              sizes="(min-width: 1024px) 38vw, 100vw"
            />
            <p className="mt-4 text-sm text-bone-faint">{ownerRole}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
