/**
 * The public site is rendered by `app/[lang]/layout.tsx`, which owns the <html>
 * element so it can set `lang` and `dir` per locale. There is intentionally no
 * `app/layout.tsx`, so the Keystatic admin needs its own root layout.
 *
 * Nothing from the site's own styling is loaded here — Keystatic ships its own
 * UI and `globals.css` would fight it.
 */
export default function KeystaticLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
