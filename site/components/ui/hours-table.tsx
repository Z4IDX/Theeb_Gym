export type HoursRow = {
  label: string;
  value: string;
};

export type HoursTableProps = {
  rows: HoursRow[];
  caption?: string;
  className?: string;
};

/**
 * The Saturday–Thursday / Friday hours table. Values are forced dir="ltr"
 * since "6:00am–2:00am" is a time range and must not be visually reversed by
 * an Arabic RTL context.
 */
export function HoursTable({ rows, caption, className = "" }: HoursTableProps) {
  return (
    <table className={`w-full border-collapse text-start ${className}`}>
      {caption ? <caption className="eyebrow mb-4 text-start">{caption}</caption> : null}
      <tbody className="divide-y divide-ink-line border-y border-ink-line">
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row" className="py-4 pe-4 text-start text-base font-medium text-bone">
              {row.label}
            </th>
            <td dir="ltr" className="py-4 text-end text-base text-bone-dim">
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
