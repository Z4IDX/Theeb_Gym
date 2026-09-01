import Link from "next/link";
import { whatsappUrl, WHATSAPP_MESSAGES } from "@/lib/site";
import type { Locale } from "@/lib/i18n";

type Variant = "solid" | "outline" | "ghost";

const styles: Record<Variant, string> = {
  solid:
    "bg-blood text-bone hover:bg-blood-hot border border-transparent",
  outline:
    "border border-bone/25 text-bone hover:border-bone/60 hover:bg-bone/5",
  ghost: "text-bone-dim hover:text-bone",
};

/** The single conversion action on the site. Always pre-fills the message. */
export function WhatsAppCta({
  locale,
  context = "home",
  label,
  variant = "solid",
  className = "",
}: {
  locale: Locale;
  context?: keyof typeof WHATSAPP_MESSAGES;
  label: string;
  variant?: Variant;
  className?: string;
}) {
  const href = whatsappUrl(WHATSAPP_MESSAGES[context][locale]);
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2.5 px-7 py-4 text-sm font-semibold tracking-wide transition-colors ${styles[variant]} ${className}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[1.15em] shrink-0 fill-current">
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.38-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.42 9.42 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.41 9.41 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43zM20.52 3.45A11.78 11.78 0 0 0 12.04 0C5.5 0 .18 5.32.18 11.86c0 2.09.55 4.13 1.59 5.93L.08 24l6.35-1.66a11.83 11.83 0 0 0 5.61 1.43h.01c6.53 0 11.85-5.32 11.85-11.86 0-3.17-1.23-6.15-3.38-8.39z" />
      </svg>
      {label}
    </Link>
  );
}
