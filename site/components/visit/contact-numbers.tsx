import type { Locale } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { WhatsAppCta } from "@/components/whatsapp-cta";

const COPY = {
  en: {
    whatsappEyebrow: "WhatsApp — message this number",
    whatsappHint: "The primary way to reach us. Messages here get a reply.",
    whatsappCta: "Message us on WhatsApp",
    voiceEyebrow: "Phone — voice calls only",
    voiceHint: "This number is not on WhatsApp. Messages sent here will not be seen — call it, or WhatsApp the other number instead.",
    callCta: "Call",
  },
  ar: {
    whatsappEyebrow: "واتساب — راسل هذا الرقم",
    whatsappHint: "الطريقة الأساسية للتواصل معنا. الرسائل على هذا الرقم تصلها ردود.",
    whatsappCta: "راسلنا على واتساب",
    voiceEyebrow: "هاتف — للمكالمات فقط",
    voiceHint: "هذا الرقم غير مفعّل على واتساب. أي رسالة تُرسل إليه لن تُقرأ — اتصل عليه، أو راسل الرقم الآخر على واتساب.",
    callCta: "اتصل",
  },
} as const;

/**
 * The two phone numbers, deliberately never presented as interchangeable.
 * 0778000946 is WhatsApp-only in practice (it's the site's single CTA);
 * 0778000945 is voice-only and does not receive WhatsApp messages at all.
 */
export function ContactNumbers({ locale, className = "" }: { locale: Locale; className?: string }) {
  const t = COPY[locale];
  const telHref = `tel:+962${SITE.phone.slice(1)}`;

  return (
    <div className={`grid grid-cols-1 divide-y divide-ink-line border-y border-ink-line sm:grid-cols-2 sm:divide-x sm:divide-y-0 ${className}`}>
      <div className="flex flex-col items-start gap-4 py-8 first:pt-0 sm:px-8 sm:py-2 sm:first:ps-0">
        <p className="eyebrow text-blood-hot">{t.whatsappEyebrow}</p>
        <p dir="ltr" className="font-display text-display-sm text-bone">
          {SITE.whatsapp}
        </p>
        <p className="max-w-xs text-sm text-bone-dim">{t.whatsappHint}</p>
        <WhatsAppCta locale={locale} context="visit" label={t.whatsappCta} className="mt-1" />
      </div>

      <div className="flex flex-col items-start gap-4 py-8 sm:px-8 sm:py-2 sm:last:pe-0">
        <p className="eyebrow">{t.voiceEyebrow}</p>
        <p dir="ltr" className="font-display text-display-sm text-bone">
          {SITE.phone}
        </p>
        <p className="max-w-xs text-sm text-bone-dim">{t.voiceHint}</p>
        <a
          href={telHref}
          className="mt-1 inline-flex items-center justify-center gap-2.5 border border-bone/25 px-6 py-3 text-sm font-semibold tracking-wide text-bone transition-colors hover:border-bone/60 hover:bg-bone/5"
        >
          {t.callCta}
        </a>
      </div>
    </div>
  );
}
