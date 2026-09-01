import { SITE } from "@/lib/site";

/**
 * The twenty-hour day, drawn once. Every numeral is forced dir="ltr": in an
 * Arabic paragraph an unmarked "06:00" can have its digit order mirrored, and
 * a wrong opening time is the most expensive typo on the site.
 */
export function HoursRail({
  openLabel,
  closeLabel,
  hoursLabel,
}: {
  openLabel: string;
  closeLabel: string;
  hoursLabel: string;
}) {
  const cells = [
    { label: openLabel, value: SITE.hours.daily.open },
    { label: hoursLabel, value: "20" },
    { label: closeLabel, value: SITE.hours.daily.close },
  ];

  return (
    <div className="mt-12 grid gap-px border border-ink-line bg-ink-line sm:grid-cols-3">
      {cells.map((cell) => (
        <div key={cell.label} className="bg-ink px-6 py-8">
          <p className="eyebrow">{cell.label}</p>
          <p dir="ltr" className="font-display mt-3 text-display-sm text-bone">
            {cell.value}
          </p>
        </div>
      ))}
    </div>
  );
}
