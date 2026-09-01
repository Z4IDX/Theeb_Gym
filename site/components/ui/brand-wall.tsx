import Image from "next/image";

export type Brand = {
  name: string;
  logo?: { src: string; width: number; height: number };
};

export type BrandWallProps = {
  brands: Brand[];
  className?: string;
};

/**
 * The 14-brand equipment wall. Vector logos are not available for most
 * brands, so each cell degrades to the brand name set in the display face —
 * a hairline-divided grid reads as an intentional typographic wall rather
 * than a broken logo grid.
 */
export function BrandWall({ brands, className = "" }: BrandWallProps) {
  return (
    <ul
      className={`grid grid-cols-2 divide-x divide-y divide-ink-line border border-ink-line sm:grid-cols-3 lg:grid-cols-4 ${className}`}
    >
      {brands.map((brand) => (
        <li key={brand.name} className="flex min-h-28 items-center justify-center p-6 text-center">
          {brand.logo ? (
            <Image
              src={brand.logo.src}
              alt={brand.name}
              width={brand.logo.width}
              height={brand.logo.height}
              className="max-h-10 w-auto object-contain opacity-90"
            />
          ) : (
            <span className="font-display text-lg text-bone-dim sm:text-xl">{brand.name}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
