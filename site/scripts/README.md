# Asset pipeline

`npm run assets` (`node scripts/process-assets.mjs`) regenerates everything in
`public/media/` from the read-only originals in `../media` and
`../assets/img/gallery`, then rewrites `lib/media.ts`. It's idempotent — outputs
newer than their source are left alone — so re-run it any time after adding or
swapping a source file. Video compression (`scripts/process-video.mjs`) runs
automatically at the end of the same command.

## Consuming an asset

```tsx
import { MEDIA, srcSet, src } from "@/lib/media";

const asset = MEDIA["nawaiseh-judging"];
const lang: "en" | "ar" = "en"; // from your i18n context

<picture>
  <source type="image/avif" srcSet={srcSet("nawaiseh-judging", "avif")} sizes="(min-width: 768px) 50vw, 100vw" />
  <source type="image/webp" srcSet={srcSet("nawaiseh-judging", "webp")} sizes="(min-width: 768px) 50vw, 100vw" />
  <img
    src={src("nawaiseh-judging")}
    width={asset.width}
    height={asset.height}
    alt={asset.alt[lang]}
    loading="lazy"
    decoding="async"
    style={{
      backgroundImage: `url(${asset.blurDataURL})`,
      backgroundSize: "cover",
    }}
  />
</picture>
```

Use `loading="eager"` (and drop the blur background) only for an above-the-fold
hero image. `width`/`height` always come from `asset.width`/`asset.height` (the
*intrinsic* size) so the browser reserves the correct aspect ratio — never the
rendered display size.
