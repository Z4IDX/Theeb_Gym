export type StatProps = {
  value: string;
  label: string;
  sublabel?: string;
  className?: string;
};

/**
 * A single scale numeral (2,000 m², 250+, 14). The numeral is forced dir="ltr"
 * because digits must render left-to-right even when the surrounding page is
 * Arabic/RTL — Arabic script does not reorder Western numerals, but the
 * shaping context around them can otherwise mirror punctuation like "+".
 */
export function Stat({ value, label, sublabel, className = "" }: StatProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <span dir="ltr" className="inline-block font-display text-display-md text-bone">
        {value}
      </span>
      <span className="eyebrow">{label}</span>
      {sublabel ? <span className="text-sm text-bone-dim">{sublabel}</span> : null}
    </div>
  );
}

export type StatRowProps = {
  stats: StatProps[];
  className?: string;
};

/** Lays out a set of Stat blocks with hairline dividers between them. */
export function StatRow({ stats, className = "" }: StatRowProps) {
  return (
    <div className={`grid grid-cols-1 divide-y divide-ink-line border-y border-ink-line sm:grid-cols-3 sm:divide-x sm:divide-y-0 ${className}`}>
      {stats.map((stat) => (
        <div key={stat.label} className="px-0 py-6 first:pt-0 sm:px-8 sm:py-2 sm:first:ps-0 sm:last:pe-0">
          <Stat {...stat} />
        </div>
      ))}
    </div>
  );
}
