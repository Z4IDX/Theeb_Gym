import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Archivo, Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import { LOCALES, dir, isLocale, type Locale } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { getDictionary } from "@/lib/dictionary";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteLoader } from "@/components/site-loader";
import "../globals.css";

const display = Archivo({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const t = await getDictionary(locale);

  return {
    metadataBase: new URL("https://theebgym.com"),
    title: {
      default: `${SITE.name[locale]} — ${SITE.tagline[locale]}`,
      template: `%s — ${SITE.name[locale]}`,
    },
    description: t.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", ar: "/ar" },
    },
    openGraph: {
      title: `${SITE.name[locale]} — ${SITE.tagline[locale]}`,
      description: t.meta.description,
      locale: locale === "ar" ? "ar_JO" : "en_JO",
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);

  return (
    <html
      lang={lang}
      dir={dir(lang)}
      className={`${display.variable} ${body.variable} ${arabic.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-ink text-bone">
        {/*
          Runs before the browser paints the rest of <body>, which is what keeps
          the intro from flashing in after the page is already visible. It only
          arms the overlay — SiteLoader plays it. Skipping here (rather than
          inside the component) also means a returning visitor or a
          reduced-motion visitor never sees a frame of it.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(sessionStorage.getItem("theeb:intro"))return;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;document.documentElement.dataset.loader="loading"}catch(e){}})()`,
          }}
        />
        <SiteLoader lockup={SITE.lockup} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:start-4 focus:z-50 focus:rounded focus:bg-blood focus:px-4 focus:py-2"
        >
          {t.nav.skipToContent}
        </a>
        <SiteHeader locale={lang} t={t} />
        <main id="main">{children}</main>
        <SiteFooter locale={lang} t={t} />
      </body>
    </html>
  );
}
