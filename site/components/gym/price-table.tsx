import type { Pricing } from "@/lib/content";

export type PriceTableProps = {
  pricing: Pricing;
  className?: string;
};

/**
 * The published membership terms, transcribed from the owner's own price-list
 * graphic rather than embedded as that JPEG. Rendering it as real text is what
 * lets it be translated, read aloud, indexed, and edited in the CMS without a
 * designer — none of which a picture of a table can do.
 *
 * It is a real <table>: term and fee are tabular data, and a screen reader
 * should announce "1 year, 400 JD" as one row rather than as two loose strings.
 *
 * Every row is weighted the same. The longest term is the cheapest per month,
 * but no row is badged "best value" — that claim is not on the owner's graphic
 * and this site does not invent copy for a real business.
 */
export function PriceTable({ pricing, className = "" }: PriceTableProps) {
  return (
    <div className={className}>
      <table className="w-full border-collapse border-y border-ink-line text-start">
        <caption className="sr-only">{pricing.headline}</caption>
        <tbody className="divide-y divide-ink-line">
          {pricing.plans.map((plan) => (
            <tr key={plan.term}>
              <th
                scope="row"
                className="py-6 text-start align-baseline font-display text-xl font-semibold text-bone"
              >
                {plan.term}
              </th>
              <td className="py-6 text-end align-baseline">
                {/* Digits stay LTR in Arabic, and tabular figures keep the
                    column of prices from shifting width row to row. */}
                <span
                  dir="ltr"
                  className="inline-block font-display text-display-sm text-bone tabular-nums"
                >
                  {plan.price}
                </span>
                <span className="ms-2 text-sm text-bone-dim">{pricing.currency}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-8 max-w-2xl text-base text-bone-dim">{pricing.note}</p>

      <ul className="mt-12 grid grid-cols-1 gap-px overflow-hidden border border-ink-line bg-ink-line sm:grid-cols-3">
        {pricing.includes.map((item) => (
          <li key={item.title} className="bg-ink px-6 py-7">
            <h3 className="font-display text-lg text-bone">{item.title}</h3>
            <p className="mt-2 text-sm text-bone-dim">{item.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
