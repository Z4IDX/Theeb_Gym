import type { GymClass } from "@/lib/content";

/**
 * Classes are described by what they do and who they suit — never by day or
 * time. The schedule moves too often to publish, so the section hands off to
 * Instagram instead. The content model has no schedule fields at all, which is
 * what keeps a stale timetable from ever reappearing here.
 */
export function ClassList({
  classes,
  suitsLabel,
}: {
  classes: GymClass[];
  suitsLabel: string;
}) {
  return (
    <ul className="grid gap-px border border-ink-line bg-ink-line sm:grid-cols-2">
      {classes.map((gymClass) => (
        <li key={gymClass.slug} className="bg-ink p-7 lg:p-9">
          <h3 className="font-display text-2xl">{gymClass.name}</h3>
          <p className="mt-4 text-bone-dim">{gymClass.description}</p>
          <p className="mt-5 border-s-2 border-blood ps-4 text-sm text-bone-faint">
            <span className="eyebrow block">{suitsLabel}</span>
            <span className="mt-1 block">{gymClass.suitsWho}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
