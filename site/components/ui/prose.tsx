/**
 * CMS prose fields are plain multiline text, not rendered Markdoc — paragraphs
 * are separated by a blank line in the source YAML. This renders each as its
 * own <p> instead of collapsing the whitespace into one run-on block.
 */
export function Prose({
  text,
  className = "",
  size = "base",
}: {
  text: string;
  className?: string;
  size?: "base" | "lg";
}) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className={
            size === "lg"
              ? "text-lg text-bone-dim sm:text-xl"
              : "text-base text-bone-dim sm:text-lg"
          }
        >
          {p}
        </p>
      ))}
    </div>
  );
}
