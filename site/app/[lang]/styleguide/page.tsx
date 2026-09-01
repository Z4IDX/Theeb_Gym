import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { FramedImage } from "@/components/ui/framed-image";
import { Stat, StatRow } from "@/components/ui/stat";
import { BrandWall } from "@/components/ui/brand-wall";
import { Gallery } from "@/components/ui/gallery";
import { AmenityList } from "@/components/ui/amenity-list";
import { CredentialList } from "@/components/ui/credential-list";
import { PullQuote } from "@/components/ui/quote";
import { HoursTable } from "@/components/ui/hours-table";
import { CtaBand } from "@/components/ui/cta-band";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Styleguide",
};

/**
 * Private component review page. Not linked from navigation, not indexed.
 * Every component below is rendered once with English content and once with
 * Arabic content so RTL behaviour (mirroring, LTR-forced numerals/times,
 * Arabic display type) is reviewable side by side.
 */
export default function StyleguidePage() {
  return (
    <div className="pb-32">
      <div className="border-b border-ink-line bg-ink-raised px-5 py-10 lg:px-10">
        <p className="eyebrow">Internal</p>
        <h1 className="mt-2 font-display text-display-sm">UI Component Kit</h1>
        <p className="mt-2 max-w-2xl text-sm text-bone-dim">
          Every component in <code className="text-bone">components/ui</code>, shown with English and Arabic example
          content. This page is not indexed and is not linked from the site.
        </p>
      </div>

      <ComponentBlock title="Section + SectionHeader">
        <DemoPair>
          <div className="border border-ink-line">
            <Section tone="panel" className="py-10">
              <SectionHeader
                eyebrow="The floor"
                title="2,000 m² built for serious training"
                lead="250+ machines from 14 global brands, laid out by an IFBB Pro League judge."
              />
            </Section>
          </div>
          <div className="border border-ink-line">
            <Section tone="panel" className="py-10">
              <SectionHeader
                eyebrow="الصالة"
                title="٢٬٠٠٠ متر مربع مخصصة للتدريب الجاد"
                lead="أكثر من ٢٥٠ جهاز من ١٤ علامة عالمية، صممها حكم دولي معتمد من IFBB."
              />
            </Section>
          </div>
        </DemoPair>
      </ComponentBlock>

      <ComponentBlock title="FramedImage">
        <DemoPair>
          <FramedImage
            src="/logo.png"
            alt="Placeholder training floor photo"
            width={480}
            height={600}
            ratio="4/5"
            frame="line"
            caption="The free-weight floor, looking toward the platform wall."
          />
          <FramedImage
            src="/logo.png"
            alt="صورة مؤقتة لصالة التدريب"
            width={480}
            height={600}
            ratio="4/5"
            frame="panel"
            caption="صالة الأوزان الحرة، باتجاه حائط منصات الرفع."
          />
        </DemoPair>
      </ComponentBlock>

      <ComponentBlock title="Stat + StatRow">
        <DemoPair>
          <StatRow
            stats={[
              { value: "2,000 m²", label: "Floor area" },
              { value: "250+", label: "Machines" },
              { value: "14", label: "Global brands" },
            ]}
          />
          <StatRow
            stats={[
              { value: "2,000 m²", label: "مساحة الصالة" },
              { value: "250+", label: "جهاز تدريب" },
              { value: "14", label: "علامة عالمية" },
            ]}
          />
        </DemoPair>
      </ComponentBlock>

      <ComponentBlock title="BrandWall">
        <DemoPair stacked>
          <BrandWall
            brands={BRAND_NAMES.map((name) => ({ name }))}
          />
          <BrandWall
            brands={BRAND_NAMES.map((name) => ({ name }))}
          />
        </DemoPair>
      </ComponentBlock>

      <ComponentBlock title="Gallery">
        <DemoPair stacked>
          <Gallery items={GALLERY_ITEMS_EN} closeLabel="Close" />
          <div dir="rtl" lang="ar">
            <Gallery items={GALLERY_ITEMS_AR} closeLabel="إغلاق" />
          </div>
        </DemoPair>
      </ComponentBlock>

      <ComponentBlock title="AmenityList">
        <DemoPair>
          <AmenityList
            items={[
              { title: "Coffee house", body: "A full coffee bar at the entrance — stay for the evening, not just the workout." },
              { title: "Supplement store", body: "Stocked supplement counter inside the gym." },
              { title: "Barber", body: "An in-house barber chair." },
            ]}
          />
          <AmenityList
            items={[
              { title: "كوفي هاوس", body: "بار قهوة كامل عند المدخل — لتقضي المساء، مو بس التمرين." },
              { title: "متجر المكملات", body: "ركن مكملات غذائية داخل الصالة." },
              { title: "حلاق", body: "كرسي حلاقة داخل النادي." },
            ]}
          />
        </DemoPair>
      </ComponentBlock>

      <ComponentBlock title="CredentialList">
        <DemoPair>
          <CredentialList
            items={[
              { title: "IFBB Pro League Judge", org: "International Federation of Bodybuilding & Fitness", years: "2012–present" },
              { title: "Certified Personal Trainer", org: "ISSA", years: "2008" },
            ]}
          />
          <CredentialList
            items={[
              { title: "حكم دولي معتمد IFBB", org: "الاتحاد الدولي لكمال الأجسام واللياقة", years: "2012–present" },
              { title: "مدرب شخصي معتمد", org: "ISSA", years: "2008" },
            ]}
          />
        </DemoPair>
      </ComponentBlock>

      <ComponentBlock title="PullQuote">
        <DemoPair>
          <PullQuote
            quote="I built the floor I always wished I had as a competitor."
            attribution="Ahmad Al-Nawaiseh"
            role="Owner, IFBB Pro League Judge"
          />
          <PullQuote
            quote="بنيت الصالة اللي كنت أتمناها لما كنت لاعب منافسات."
            attribution="أحمد النوايسة"
            role="المالك، حكم دولي معتمد IFBB"
          />
        </DemoPair>
      </ComponentBlock>

      <ComponentBlock title="HoursTable">
        <DemoPair>
          <HoursTable
            caption="Opening hours"
            rows={[
              { label: "Saturday – Thursday", value: "6:00am – 2:00am" },
              { label: "Friday", value: "2:00pm – 8:00pm" },
            ]}
          />
          <HoursTable
            caption="ساعات الدوام"
            rows={[
              { label: "السبت – الخميس", value: "6:00am – 2:00am" },
              { label: "الجمعة", value: "2:00pm – 8:00pm" },
            ]}
          />
        </DemoPair>
      </ComponentBlock>

      <ComponentBlock title="CtaBand">
        <DemoPair stacked>
          <CtaBand
            locale="en"
            context="visit"
            heading="Come see the floor for yourself."
            ctaLabel="Message us on WhatsApp"
            secondaryHref="/en/visit"
            secondaryLabel="Get directions"
          />
          <CtaBand
            locale="ar"
            context="visit"
            heading="تعال شوف الصالة بنفسك."
            ctaLabel="راسلنا على واتساب"
            secondaryHref="/ar/visit"
            secondaryLabel="احصل على الاتجاهات"
          />
        </DemoPair>
      </ComponentBlock>

      <ComponentBlock title="Reveal">
        <DemoPair>
          <Reveal className="border border-ink-line p-6">
            <p className="font-display text-display-sm">Scrolls into view</p>
          </Reveal>
          <Reveal className="border border-ink-line p-6">
            <p className="font-display text-display-sm">يظهر عند التمرير</p>
          </Reveal>
        </DemoPair>
      </ComponentBlock>
    </div>
  );
}

function ComponentBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-ink-line px-5 py-14 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <h2 className="eyebrow">{title}</h2>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

function DemoPair({ children, stacked = false }: { children: [ReactNode, ReactNode]; stacked?: boolean }) {
  const [en, ar] = children;
  return (
    <div className={stacked ? "flex flex-col gap-10" : "grid grid-cols-1 gap-10 lg:grid-cols-2"}>
      <div dir="ltr" lang="en">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-bone-faint">English</p>
        {en}
      </div>
      <div dir="rtl" lang="ar">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-bone-faint">العربية</p>
        {ar}
      </div>
    </div>
  );
}

const BRAND_NAMES = [
  "Hammer Strength",
  "Life Fitness",
  "Technogym",
  "Cybex",
  "Matrix",
  "Precor",
  "Nautilus",
  "Rogue",
  "Eleiko",
  "Panatta",
  "Gym80",
  "Prime Fitness",
  "Watson",
  "Escape Fitness",
];

const GALLERY_ITEMS_EN = [
  { src: "/logo.png", alt: "Free-weight floor", width: 480, height: 600, ratio: "4/5" as const, caption: "Free-weight floor" },
  { src: "/logo.png", alt: "Cardio deck", width: 600, height: 400, ratio: "3/2" as const, caption: "Cardio deck" },
  { src: "/logo.png", alt: "Platform wall", width: 480, height: 600, ratio: "4/5" as const, caption: "Platform wall" },
  { src: "/logo.png", alt: "Coffee bar", width: 600, height: 400, ratio: "3/2" as const, caption: "Coffee bar" },
];

const GALLERY_ITEMS_AR = [
  { src: "/logo.png", alt: "صالة الأوزان الحرة", width: 480, height: 600, ratio: "4/5" as const, caption: "صالة الأوزان الحرة" },
  { src: "/logo.png", alt: "منطقة الكارديو", width: 600, height: 400, ratio: "3/2" as const, caption: "منطقة الكارديو" },
  { src: "/logo.png", alt: "حائط منصات الرفع", width: 480, height: 600, ratio: "4/5" as const, caption: "حائط منصات الرفع" },
  { src: "/logo.png", alt: "بار القهوة", width: 600, height: 400, ratio: "3/2" as const, caption: "بار القهوة" },
];
