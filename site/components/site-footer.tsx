import Link from "next/link";
import { SITE } from "@/lib/site";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";
import { WhatsAppCta } from "./whatsapp-cta";

export function SiteFooter({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <footer className="border-t border-ink-line bg-ink-raised">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
        <div>
          <p className="font-display text-2xl">{SITE.lockup}</p>
          <p className="mt-2 text-sm text-bone-dim">{SITE.tagline[locale]}</p>
          <WhatsAppCta locale={locale} label={t.cta.whatsapp} className="mt-6" />
        </div>

        <div>
          <h2 className="eyebrow">{t.footer.contact}</h2>
          <ul className="mt-4 space-y-2 text-sm text-bone-dim">
            <li>
              <a href={`tel:+962${SITE.whatsapp.slice(1)}`} className="hover:text-bone">
                {SITE.whatsapp}
              </a>{" "}
              <span className="text-bone-faint">· {t.footer.whatsappOnly}</span>
            </li>
            <li>
              <a href={`tel:+962${SITE.phone.slice(1)}`} className="hover:text-bone">
                {SITE.phone}
              </a>{" "}
              <span className="text-bone-faint">· {t.footer.phoneOnly}</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="eyebrow">{t.hours.label}</h2>
          <ul className="mt-4 space-y-2 text-sm text-bone-dim">
            <li>
              {t.hours.daily} · {t.hours.dailyValue}
            </li>
            <li>
              {t.hours.friday} · {t.hours.fridayValue}
            </li>
          </ul>
          <h2 className="eyebrow mt-6">{t.footer.find}</h2>
          <p className="mt-3 text-sm text-bone-dim">{SITE.address[locale]}</p>
        </div>

        <div>
          <h2 className="eyebrow">{t.footer.pages}</h2>
          <ul className="mt-4 space-y-2 text-sm text-bone-dim">
            <li><Link href={`/${locale}/gym`} className="hover:text-bone">{t.nav.gym}</Link></li>
            <li><Link href={`/${locale}/coaches`} className="hover:text-bone">{t.nav.coaches}</Link></li>
            <li><Link href={`/${locale}/visit`} className="hover:text-bone">{t.nav.visit}</Link></li>
          </ul>
          <h2 className="eyebrow mt-6">{t.footer.follow}</h2>
          <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-bone-dim hover:text-bone">
            {SITE.instagramHandle}
          </a>
        </div>
      </div>

      <div className="border-t border-ink-line px-5 py-6 text-center text-xs text-bone-faint lg:px-10">
        © {new Date().getFullYear()} {SITE.name[locale]}. {t.footer.rights}
      </div>
    </footer>
  );
}
