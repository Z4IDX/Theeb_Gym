/**
 * CMS prose fields (`intro.body`, `directions.body`, `parking.body`, ...) are
 * plain multiline text, not rendered Markdoc — paragraphs are separated by a
 * blank line in the source YAML. This renders each as its own <p> rather than
 * collapsing the whitespace or dumping one run-on block.
 */
export function Prose({ text, className = "" }: { text: string; className?: string }) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {paragraphs.map((p, i) => (
        <p key={i} className="text-base text-bone-dim sm:text-lg">
          {p}
        </p>
      ))}
    </div>
  );
}
