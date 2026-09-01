import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { getDictionary } from "@/lib/dictionary";
import { getCoaches, getOwner, type StaffCoach } from "@/lib/content";
import { JsonLd, ownerSchema } from "@/lib/schema";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { CtaBand } from "@/components/ui/cta-band";
import { OwnerFeature } from "@/components/coaches/owner-feature";
import { CoachGrid } from "@/components/coaches/coach-grid";

/**
 * The coaches page carries the site's central argument: the training
 * standard at Theeb is set by someone who judges the sport internationally,
 * not by someone selling memberships. Ahmad Al-Nawaiseh gets a full
 * editorial treatment; every other coach on the roster is a name and a
 * photo, by the content model's own rule (see `lib/content.ts`).
 */

const META_DESCRIPTION: Record<Locale, string> = {
  en: "Meet the coaches at Theeb Gym, led by Ahmad Al-Nawaiseh — an IFBB Pro League / NPC international judge and accredited training instructor at Mutah University.",
  ar: "تعرّف على مدربي نادي الذيب، بقيادة أحمد النوايسة — حَكَم دولي معتمد من IFBB Pro League / NPC ومدرّب تدريب معتمد في جامعة مؤتة.",
};

const HERO_COPY = {
  eyebrow: { en: "Coaching", ar: "التدريب" } as Record<Locale, string>,
  title: {
    en: "The standard is set by a judge, not a salesman.",
    ar: "المعيار يضعه حَكَم دولي، لا بائع اشتراكات.",
  } as Record<Locale, string>,
  lead: {
    en: "Ahmad Al-Nawaiseh judges professional bodybuilding internationally and certifies coaches at Mutah University. He built this floor, and everyone who trains on it works to the standard he set.",
    ar: "أحمد النوايسة يحكّم كمال الأجسام الاحترافي دولياً، ويمنح المدربين شهاداتهم في جامعة مؤتة. هو من بنى هذه الصالة، وكل من يدرّب عليها يعمل وفق المعيار الذي وضعه.",
  } as Record<Locale, string>,
};

const CTA_COPY = {
  heading: {
    en: "Questions about training at Theeb?",
    ar: "عندك سؤال عن التدريب في الذيب؟",
  } as Record<Locale, string>,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const t = await getDictionary(locale);

  return {
    title: t.nav.coaches,
    description: META_DESCRIPTION[locale],
    alternates: {
      canonical: `/${locale}/coaches`,
      languages: { en: "/en/coaches", ar: "/ar/coaches" },
    },
    openGraph: {
      title: `${t.nav.coaches} — ${SITE.name[locale]}`,
      description: META_DESCRIPTION[locale],
      locale: locale === "ar" ? "ar_JO" : "en_JO",
      type: "website",
    },
  };
}

export default async function CoachesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;

  const t = await getDictionary(locale);
  const [owner, coaches] = await Promise.all([getOwner(locale), getCoaches(locale)]);
  const staff: StaffCoach[] = coaches.filter((coach): coach is StaffCoach => !coach.isOwner);

  return (
    <>
      {owner ? <JsonLd data={ownerSchema()} /> : null}

      <Section>
        <SectionHeader
          as="h1"
          eyebrow={HERO_COPY.eyebrow[locale]}
          title={HERO_COPY.title[locale]}
          lead={HERO_COPY.lead[locale]}
        />
      </Section>

      {owner ? (
        <Section tone="raised">
          <OwnerFeature owner={owner} locale={locale} instagramLabel={t.cta.instagram} />
        </Section>
      ) : null}

      {staff.length > 0 ? (
        <Section>
          <CoachGrid coaches={staff} locale={locale} />
        </Section>
      ) : null}

      <Section tone="panel">
        <CtaBand
          locale={locale}
          context="coaches"
          heading={CTA_COPY.heading[locale]}
          ctaLabel={t.cta.whatsapp}
        />
      </Section>
    </>
  );
}
