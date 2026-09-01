"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { switchLocalePath, type Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";
import { WhatsAppCta } from "./whatsapp-cta";

export function SiteHeader({ locale, t }: { locale: Locale; t: Dictionary }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const other: Locale = locale === "en" ? "ar" : "en";

  const links = [
    { href: `/${locale}/gym`, label: t.nav.gym },
    { href: `/${locale}/coaches`, label: t.nav.coaches },
    { href: `/${locale}/gym#membership`, label: t.nav.membership },
    { href: `/${locale}/visit`, label: t.nav.visit },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink-line/80 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-4 lg:px-10">
        <Link href={`/${locale}`} className="shrink-0" aria-label="Theeb Fitness">
          <Image src="/logo.png" alt="Theeb Fitness" width={813} height={281} priority className="h-8 w-auto lg:h-9" />
        </Link>

        <nav className="ms-auto hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-bone-dim transition-colors hover:text-bone"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-3 lg:ms-0">
          <Link
            href={switchLocalePath(pathname, other)}
            hrefLang={other}
            className="border border-ink-line px-3 py-2 text-xs font-semibold text-bone-dim transition-colors hover:border-bone/40 hover:text-bone"
          >
            {t.nav.switchLanguage}
          </Link>
          <WhatsAppCta
            locale={locale}
            label={t.cta.whatsappShort}
            className="hidden px-5 py-2.5 text-xs sm:inline-flex"
          />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? t.nav.close : t.nav.menu}
            className="border border-ink-line p-2.5 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="size-4 stroke-current" fill="none" strokeWidth="2" aria-hidden="true">
              {open ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-ink-line bg-ink px-5 pb-6 pt-2 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block border-b border-ink-line/60 py-4 font-display text-2xl"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
