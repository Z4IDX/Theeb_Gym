import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { WHATSAPP_MESSAGES } from "@/lib/site";
import { WhatsAppCta } from "@/components/whatsapp-cta";

export type CtaBandProps = {
  locale: Locale;
  context?: keyof typeof WHATSAPP_MESSAGES;
  heading: string;
  ctaLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
};

/** The recurring end-of-page conversion band: display headline + WhatsApp CTA. */
export function CtaBand({
  locale,
  context = "home",
  heading,
  ctaLabel,
  secondaryHref,
  secondaryLabel,
  className = "",
}: CtaBandProps) {
  return (
    <div className={`flex flex-col items-start gap-8 border-t border-ink-line pt-12 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <h2 className="font-display text-display-md text-bone">{heading}</h2>
      <div className="flex shrink-0 flex-col items-start gap-4 sm:items-end">
        <WhatsAppCta locale={locale} context={context} label={ctaLabel} />
        {secondaryHref && secondaryLabel ? (
          <Link href={secondaryHref} className="text-sm text-bone-dim underline decoration-ink-line underline-offset-4 transition-colors hover:text-bone">
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
