import Image from "next/image";

export type FramedImageRatio = "4/5" | "3/2" | "1/1";

export type FramedImageFrame = "line" | "panel" | "none";

const ratioClass: Record<FramedImageRatio, string> = {
  "4/5": "aspect-[4/5]",
  "3/2": "aspect-[3/2]",
  "1/1": "aspect-[1/1]",
};

const frameClass: Record<FramedImageFrame, string> = {
  line: "border border-ink-line p-2",
  panel: "border border-ink-line bg-ink-panel p-3",
  none: "",
};

export type FramedImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  ratio?: FramedImageRatio;
  blurDataURL?: string;
  priority?: boolean;
  caption?: string;
  frame?: FramedImageFrame;
  sizes?: string;
  className?: string;
};

/**
 * The site's core photo primitive. No source photo exceeds ~1200px wide, so
 * the frame is capped at the image's own intrinsic width via inline style
 * rather than allowed to stretch to fill an arbitrary layout column.
 */
export function FramedImage({
  src,
  alt,
  width,
  height,
  ratio = "4/5",
  blurDataURL,
  priority = false,
  caption,
  frame = "line",
  sizes = "(min-width: 1024px) 33vw, 100vw",
  className = "",
}: FramedImageProps) {
  return (
    <figure className={`w-full ${className}`} style={{ maxWidth: width }}>
      <div className={`relative overflow-hidden ${ratioClass[ratio]} ${frameClass[frame]}`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder={blurDataURL ? "blur" : undefined}
          blurDataURL={blurDataURL}
          className="object-cover"
        />
      </div>
      {caption ? (
        <figcaption className="mt-3 border-t border-ink-line pt-3 text-xs text-bone-faint">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
