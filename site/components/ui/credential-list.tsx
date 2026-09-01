export type CredentialItem = {
  title: string;
  org?: string;
  years?: string;
};

export type CredentialListProps = {
  items: CredentialItem[];
  className?: string;
};

/**
 * The owner's certifications, rendered as a serious document rather than a
 * badge grid. `years` is forced dir="ltr" — it's a date range and must not
 * have its digit/dash order mirrored by the surrounding RTL context.
 */
export function CredentialList({ items, className = "" }: CredentialListProps) {
  return (
    <ol className={`divide-y divide-ink-line border-y border-ink-line ${className}`}>
      {items.map((item, index) => (
        <li key={item.title} className="flex items-baseline gap-5 py-5">
          <span dir="ltr" className="inline-block w-8 shrink-0 font-display text-sm text-bone-faint">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <div>
              <p className="text-base font-semibold text-bone">{item.title}</p>
              {item.org ? <p className="text-sm text-bone-dim">{item.org}</p> : null}
            </div>
            {item.years ? (
              <span dir="ltr" className="inline-block text-sm text-bone-faint">
                {item.years}
              </span>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
