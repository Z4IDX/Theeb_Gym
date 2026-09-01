export type PullQuoteProps = {
  quote: string;
  attribution?: string;
  role?: string;
  className?: string;
};

/**
 * A large display-type pull quote. Arabic must not be uppercased or
 * letter-spaced — the [lang="ar"] .font-display rules in globals.css already
 * neutralise both, so this component just applies .font-display and stays
 * out of the way.
 */
export function PullQuote({ quote, attribution, role, className = "" }: PullQuoteProps) {
  return (
    <figure className={`border-s-2 border-blood ps-6 sm:ps-10 ${className}`}>
      <blockquote className="font-display text-display-sm text-bone sm:text-display-md">
        &ldquo;{quote}&rdquo;
      </blockquote>
      {attribution ? (
        <figcaption className="mt-6 flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-bone">{attribution}</span>
          {role ? <span className="text-sm text-bone-dim">{role}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
