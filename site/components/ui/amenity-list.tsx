import type { ReactNode } from "react";

export type AmenityItem = {
  title: string;
  body: string;
  icon?: ReactNode;
};

export type AmenityListProps = {
  items: AmenityItem[];
  className?: string;
};

/**
 * The coffee house / supplement store / barber / parking / showers / lockers
 * list. Hairline-divided rows, no cartoon iconography — pass a monoline SVG
 * (currentColor, no fill) as `icon` if one is needed, otherwise the row is
 * type-only.
 */
export function AmenityList({ items, className = "" }: AmenityListProps) {
  return (
    <ul className={`divide-y divide-ink-line border-y border-ink-line ${className}`}>
      {items.map((item) => (
        <li key={item.title} className="flex items-start gap-5 py-6">
          {item.icon ? (
            <span aria-hidden="true" className="mt-1 size-6 shrink-0 text-blood-hot">
              {item.icon}
            </span>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <h3 className="font-display text-xl text-bone">{item.title}</h3>
            <p className="text-sm text-bone-dim sm:text-base">{item.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
