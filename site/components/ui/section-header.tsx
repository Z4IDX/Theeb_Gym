import type { ReactNode } from "react";

export type SectionHeaderAlign = "start" | "center";

export type SectionHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: SectionHeaderAlign;
  as?: "h1" | "h2" | "h3";
  className?: string;
};

const alignClass: Record<SectionHeaderAlign, string> = {
  start: "text-start items-start",
  center: "text-center items-center mx-auto",
};

/** The standard eyebrow + display heading + optional lead used to open a Section. */
export function SectionHeader({
  eyebrow,
  title,
  lead,
  align = "start",
  as: Heading = "h2",
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex max-w-3xl flex-col gap-4 ${alignClass[align]} ${className}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <Heading className="font-display text-display-md text-bone">{title}</Heading>
      {lead ? <p className="max-w-2xl text-base text-bone-dim sm:text-lg">{lead}</p> : null}
    </div>
  );
}
