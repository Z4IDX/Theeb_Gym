import type { ReactNode } from "react";

export type SectionTone = "base" | "raised" | "panel";

const toneClass: Record<SectionTone, string> = {
  base: "bg-ink",
  raised: "bg-ink-raised",
  panel: "bg-ink-panel",
};

export type SectionProps = {
  id?: string;
  tone?: SectionTone;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
};

/**
 * Full-bleed section wrapper: the background token spans the viewport while
 * content stays inside the shared max-w-7xl container. Every page section
 * should be built from this rather than a bare <section>.
 */
export function Section({ id, tone = "base", className = "", containerClassName = "", children }: SectionProps) {
  return (
    <section id={id} className={`py-20 lg:py-32 ${toneClass[tone]} ${className}`}>
      <div className={`mx-auto max-w-7xl px-5 lg:px-10 ${containerClassName}`}>{children}</div>
    </section>
  );
}
