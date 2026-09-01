#!/usr/bin/env node
// Idempotent asset pipeline for Theeb Gym.
//
// Reads the declarative SOURCES list below, generates responsive AVIF + WebP
// renditions (plus a tiny blurred LQIP placeholder) into public/media/, and
// (re)writes the typed, generated lib/media.ts manifest that components read
// through MEDIA / srcSet() / src().
//
// Usage: node scripts/process-assets.mjs   (wired to `npm run assets`)
//
// Safe to re-run: any output file newer than its source is left untouched.

import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { processVideos } from "./process-video.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, "..");
const PROJECT_ROOT = path.resolve(SITE_ROOT, "..");

const MEDIA_SRC_DIR = path.join(PROJECT_ROOT, "media");
const GALLERY_SRC_DIR = path.join(MEDIA_SRC_DIR, "gallery");
const OUT_DIR = path.join(SITE_ROOT, "public", "media");
const MEDIA_TS_PATH = path.join(SITE_ROOT, "lib", "media.ts");

// ---------------------------------------------------------------------------
// Declarative source list. Every source file lives outside the app
// (D:/projects/theeb gym/media, including media/gallery) and is read-only.
// Filenames with spaces / Arabic / emoji become clean ASCII slugs here.
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} ImageSource
 * @property {string} slug
 * @property {string} file          absolute path to the source image
 * @property {{en: string, ar: string}} alt
 * @property {{left:number, top:number, width:number, height:number}} [extract]
 *   Optional deterministic crop (sharp .extract()) applied before resizing.
 */

/** @type {ImageSource[]} */
const SOURCES = [
  // --- Owner: Ahmad Al-Nawaiseh (coaching director, IFBB Pro League judge) ---
  {
    slug: "nawaiseh-credentials",
    file: path.join(MEDIA_SRC_DIR, "coach nawaiseh.jpg"),
    alt: {
      en: "Instagram credential graphic for Ahmad Al-Nawaiseh, Theeb Fitness's coaching director, listing his sports-training degrees, IFBB Pro League judge certification and 19+ years of experience",
      ar: "بطاقة اعتماد من إنستغرام لأحمد النوايسة، مدير التدريب في ذيب فيتنس، توضح شهاداته في التدريب الرياضي واعتماده حكمًا دوليًا في IFBB Pro League وخبرته التي تتجاوز 19 عامًا",
    },
  },
  {
    // Deterministic crop of the studio cutout inside the credential graphic —
    // no background removal model available, so this is a plain, hand-verified
    // sharp .extract() region (coordinates confirmed by inspecting the image).
    slug: "nawaiseh-portrait",
    file: path.join(MEDIA_SRC_DIR, "coach nawaiseh.jpg"),
    extract: { left: 620, top: 380, width: 460, height: 575 },
    alt: {
      en: "Close portrait of Ahmad Al-Nawaiseh, owner and coaching director of Theeb Gym, smiling with arms crossed in a Theeb Fitness polo shirt",
      ar: "صورة مقرّبة لأحمد النوايسة، مالك ومدير التدريب في ذيب جيم، يبتسم وذراعاه متقاطعتان بقميص ذيب فيتنس",
    },
  },
  {
    slug: "nawaiseh-judging",
    file: path.join(MEDIA_SRC_DIR, "signing_nawaiseh.jpg"),
    alt: {
      en: "Ahmad Al-Nawaiseh signing scorecards at the judges' table beside a competitor backstage at an IFBB Pro League bodybuilding show",
      ar: "أحمد النوايسة يوقّع بطاقات التحكيم على طاولة الحكام بجانب أحد المتنافسين خلف الكواليس في بطولة IFBB Pro League لكمال الأجسام",
    },
  },
  {
    slug: "nawaiseh-conference",
    file: path.join(MEDIA_SRC_DIR, "nawaisehconfrence.jpg"),
    alt: {
      en: "Ahmad Al-Nawaiseh speaking at a lectern with a wireless microphone during a sports conference",
      ar: "أحمد النوايسة يتحدث خلف منصة بميكروفون لاسلكي خلال مؤتمر رياضي",
    },
  },
  {
    slug: "nawaiseh-stage-tunisia",
    file: path.join(MEDIA_SRC_DIR, "onstage2.jpg"),
    alt: {
      en: "Ahmad Al-Nawaiseh on stage with fellow officials at an IFBB-affiliated bodybuilding championship in Tunisia",
      ar: "أحمد النوايسة على المسرح مع مسؤولين آخرين في بطولة لكمال الأجسام تابعة لـ IFBB في تونس",
    },
  },
  {
    slug: "nawaiseh-award-stage",
    file: path.join(MEDIA_SRC_DIR, "onstage_gettingaward.jpg"),
    alt: {
      en: "Ahmad Al-Nawaiseh among a lineup of judges and officials holding trophies on stage at an international bodybuilding show",
      ar: "أحمد النوايسة ضمن صف من الحكام والمسؤولين يحملون الجوائز على المسرح في بطولة دولية لكمال الأجسام",
    },
  },
  {
    slug: "nawaiseh-judging-tunisia",
    file: path.join(
      MEDIA_SRC_DIR,
      "It was a great show @ifbbproleague_tunisia  we judged great athletes on our pro show big thanks.jpg",
    ),
    alt: {
      en: "Ahmad Al-Nawaiseh and fellow IFBB Pro League judges posing on stage at a professional bodybuilding championship in Tunisia",
      ar: "أحمد النوايسة وزملاؤه حكام IFBB Pro League في وقفة على المسرح خلال بطولة احترافية لكمال الأجسام في تونس",
    },
  },
  {
    slug: "nawaiseh-speaking-libya",
    file: path.join(
      MEDIA_SRC_DIR,
      "It was great show thx \uD83D\uDE4F again libya \uD83C\uDDF1\uD83C\uDDFE @ashoorclassic_ifbblibya the best show in libya  #npce.jpg",
    ),
    alt: {
      en: "Ahmad Al-Nawaiseh speaking on stage with a microphone at the Ashoor Classic bodybuilding show in Libya",
      ar: "أحمد النوايسة يتحدث على المسرح بالميكروفون في بطولة عاشور كلاسيك لكمال الأجسام في ليبيا",
    },
  },

  // --- Other coaches: portraits only, no credential claims (per site brief) ---
  {
    slug: "coach-aladaileh",
    file: path.join(MEDIA_SRC_DIR, "coachahmed.jpg"),
    alt: {
      en: "Portrait of a coach at Theeb Gym, standing with arms crossed in a Theeb Fitness T-shirt",
      ar: "صورة لأحد المدربين في ذيب جيم، واقفًا وذراعاه متقاطعتان بقميص ذيب فيتنس",
    },
  },
  {
    slug: "coach-khoury",
    file: path.join(MEDIA_SRC_DIR, "coachjimmy.jpg"),
    alt: {
      en: "Portrait of a coach at Theeb Gym, standing with arms crossed in a Theeb Fitness T-shirt",
      ar: "صورة لأحد المدربين في ذيب جيم، واقفًا وذراعاه متقاطعتان بقميص ذيب فيتنس",
    },
  },

  // --- Facility promo graphics (verified numbers: 250+ machines, 2000 m²) ---
  {
    slug: "facility-machines",
    file: path.join(MEDIA_SRC_DIR, "machines.jpg"),
    alt: {
      en: "Theeb Gym promotional graphic over a photo of the training floor, highlighting more than 250 machines from leading global equipment brands",
      ar: "بطاقة ترويجية من ذيب جيم فوق صورة لصالة التدريب، تُبرز أكثر من 250 جهاز رياضي من أقوى الماركات العالمية",
    },
  },
  {
    slug: "facility-space",
    file: path.join(MEDIA_SRC_DIR, "size.jpg"),
    alt: {
      en: "Theeb Gym promotional graphic over a photo of the training floor, highlighting the 2,000 square metre integrated sports space",
      ar: "بطاقة ترويجية من ذيب جيم فوق صورة لصالة التدريب، تُبرز مساحة رياضية متكاملة تبلغ 2000 متر مربع",
    },
  },

  // --- Gallery: converted gym floor photos ---
  {
    slug: "gallery-01",
    file: path.join(GALLERY_SRC_DIR, "gym-01.jpg"),
    alt: {
      en: "A row of plate-loaded leg press and iso-lateral press machines beside floor-to-ceiling windows overlooking the street",
      ar: "صف من أجهزة الضغط بالأثقال (ليغ برس) وأجهزة الضغط الجانبي بجانب نوافذ ممتدة من الأرض إلى السقف تطل على الشارع",
    },
  },
  {
    slug: "gallery-02",
    file: path.join(GALLERY_SRC_DIR, "gym-02.jpg"),
    alt: {
      en: "A red iso-lateral row machine and an adjustable bench on the training floor, with a staircase leading up to the mezzanine",
      ar: "جهاز تجديف جانبي أحمر ومقعد قابل للتعديل في صالة التدريب، مع درج يؤدي إلى الميزانين",
    },
  },
  {
    slug: "gallery-03",
    file: path.join(GALLERY_SRC_DIR, "gym-03.jpg"),
    alt: {
      en: "Loaded barbells and weight plates on storage racks in front of a mirrored wall reflecting the gym floor",
      ar: "قضبان حديد وأوزان محملة على حوامل تخزين أمام حائط مرايا يعكس صالة الجيم",
    },
  },
  {
    slug: "gallery-04",
    file: path.join(GALLERY_SRC_DIR, "gym-04.jpg"),
    alt: {
      en: "A cardio corner with StairMaster climbers, stationary bikes and a yellow-framed functional training rig, with agility lines marked on the floor",
      ar: "ركن للتمارين الهوائية يضم أجهزة StairMaster ودراجات ثابتة وهيكل تدريب وظيفي بإطار أصفر، مع خطوط رشاقة مرسومة على الأرض",
    },
  },
  {
    slug: "gallery-05",
    file: path.join(GALLERY_SRC_DIR, "gym-05.jpg"),
    alt: {
      en: "Hammer Strength dumbbell racks and Theeb-branded weight plates beside a mirrored corner of the gym",
      ar: "حوامل دمبل من ماركة Hammer Strength وأوزان تحمل شعار ذيب بجانب ركن مرايا في الجيم",
    },
  },
  {
    slug: "gallery-06",
    file: path.join(GALLERY_SRC_DIR, "gym-06.jpg"),
    alt: {
      en: "A wide view of the training floor with plate-loaded machines around a support column and a staircase up to the mezzanine level",
      ar: "منظر واسع لصالة التدريب يضم أجهزة محملة بالأثقال حول عمود داعم ودرج يؤدي إلى مستوى الميزانين",
    },
  },
  {
    slug: "gallery-07",
    file: path.join(GALLERY_SRC_DIR, "gym-07.jpg"),
    alt: {
      en: "A red plate-loaded leg press machine and other equipment lined up along the window wall",
      ar: "جهاز ليغ برس أحمر محمل بالأثقال وأجهزة أخرى مصطفة على طول حائط النوافذ",
    },
  },
  {
    slug: "gallery-08",
    file: path.join(GALLERY_SRC_DIR, "gym-08.jpg"),
    alt: {
      en: "An elevated view of the free-weight floor with a leg press, leg curl station and a chrome plate tree",
      ar: "منظر علوي لصالة الأوزان الحرة يضم جهاز ليغ برس ومحطة لتمرين الفخذ الخلفي وحامل أقراص من الكروم",
    },
  },
  {
    slug: "gallery-09",
    file: path.join(GALLERY_SRC_DIR, "gym-09.jpg"),
    alt: {
      en: "A Life Fitness multi-station cable trainer on the gym floor with cardio machines and dumbbell racks in the background",
      ar: "جهاز كابل متعدد المحطات من Life Fitness في صالة الجيم مع أجهزة كارديو وحوامل دمبل في الخلفية",
    },
  },
  {
    slug: "gallery-10",
    file: path.join(GALLERY_SRC_DIR, "gym-10.jpg"),
    alt: {
      en: "A yellow functional-training rig hung with colourful kettlebells and resistance bands, with an Arabic wolf wall sign behind it",
      ar: "هيكل تدريب وظيفي أصفر معلق عليه أثقال كيتل بألوان متعددة وأحزمة مقاومة، وخلفه لافتة جدارية بعبارة الذئب بالعربية",
    },
  },
  {
    slug: "gallery-11",
    file: path.join(GALLERY_SRC_DIR, "gym-11.jpg"),
    alt: {
      en: "A row of Hammer Strength dumbbell racks beside the windows with olympic weight plates on the floor",
      ar: "صف من حوامل دمبل Hammer Strength بجانب النوافذ مع أقراص أوزان أولمبية على الأرض",
    },
  },
  {
    slug: "gallery-12",
    file: path.join(GALLERY_SRC_DIR, "gym-12.jpg"),
    alt: {
      en: "Chrome-plated dumbbell and weight racks fully stocked along the training floor",
      ar: "حوامل دمبل وأوزان مطلية بالكروم ومكتملة على طول صالة التدريب",
    },
  },
  {
    slug: "gallery-13",
    file: path.join(GALLERY_SRC_DIR, "gym-13.jpg"),
    alt: {
      en: "A row of treadmills in a corridor beneath a 'Mind over matter' wall graphic and a howling-wolf metal wall sculpture",
      ar: "صف من أجهزة الجري في ممر أسفل عبارة جدارية 'العقل يتغلب على الجسد' ومنحوتة معدنية لذئب عاوٍ على الحائط",
    },
  },

  // --- Brand ---
  {
    slug: "logo-wordmark",
    file: path.join(MEDIA_SRC_DIR, "logo1.png"),
    alt: {
      en: "Theeb Fitness wordmark logo in red and white",
      ar: "شعار ذيب فيتنس الكتابي باللونين الأحمر والأبيض",
    },
  },
  {
    slug: "logo-mark-square",
    file: path.join(MEDIA_SRC_DIR, "logo.jpg"),
    alt: {
      en: "Square Theeb Fitness logo with a howling wolf emblem and wordmark on a dark background",
      ar: "شعار ذيب فيتنس المربع يضم رمز الذئب العاوي والاسم على خلفية داكنة",
    },
  },
  {
    slug: "wolf-mark",
    file: path.join(MEDIA_SRC_DIR, "wolf.png"),
    alt: {
      en: "Outline emblem of a howling wolf inside a circle, the Theeb Fitness brand mark",
      ar: "شعار الذئب العاوي داخل دائرة، الرمز المميز لعلامة ذيب فيتنس",
    },
  },
];

// Deliberately skipped sources (documented, not processed):
//  - All *.heic files in media/: sharp in this install can decode AVIF but
//    NOT HEIC/HEVC, per the task brief. No usable decoder is available.
//  - media/"theeb classes.jpg": bakes a fixed weekly class schedule (specific
//    days/times) into the pixels. The locked product decision
//    (theeb-rebuild-decisions.md, Round 2) is to NEVER print a fixed class
//    schedule because it shifts too often — shipping this image would violate
//    that rule outright. Classes should be described in copy instead, with a
//    pointer to Instagram for the current week.
//  - assets/img/{conference,coach-aladaileh,coach-khoury,coach-nawaiseh,
//    machines,space,classes}.jpg and assets/img/logo.png: pixel-identical
//    (recompressed) duplicates of files already covered via media/ above —
//    processing both would just double the output for no benefit.

const AVIF_OPTS = { quality: 55, effort: 6 };
const WEBP_OPTS = { quality: 78 };
const WIDTH_RATIOS = [1, 0.75, 0.5, 1 / 3];
const MAX_WIDTH = 1200;
const MIN_WIDTH = 80;

function computeWidths(intrinsicWidth) {
  const top = Math.min(intrinsicWidth, MAX_WIDTH);
  const widths = WIDTH_RATIOS.map((r) => Math.round(top * r)).filter(
    (w) => w >= MIN_WIDTH && w <= intrinsicWidth,
  );
  return [...new Set(widths)].sort((a, b) => a - b);
}

async function mtime(file) {
  try {
    const stat = await fs.stat(file);
    return stat.mtimeMs;
  } catch {
    return -1;
  }
}

async function fileSize(file) {
  try {
    const stat = await fs.stat(file);
    return stat.size;
  } catch {
    return 0;
  }
}

function makePipeline(source) {
  let pipeline = sharp(source.file, { failOn: "none" });
  if (source.extract) pipeline = pipeline.extract(source.extract);
  return pipeline;
}

async function processImageSource(source, srcMtime) {
  const metadata = await makePipeline(source).metadata();
  const intrinsicWidth = source.extract ? source.extract.width : metadata.width;
  const intrinsicHeight = source.extract ? source.extract.height : metadata.height;
  const widths = computeWidths(intrinsicWidth);

  let bytesWritten = 0;
  let filesWritten = 0;
  let filesSkipped = 0;

  for (const width of widths) {
    const avifPath = path.join(OUT_DIR, `${source.slug}-${width}.avif`);
    const webpPath = path.join(OUT_DIR, `${source.slug}-${width}.webp`);

    const avifMtime = await mtime(avifPath);
    if (avifMtime < srcMtime) {
      await makePipeline(source)
        .resize({ width, withoutEnlargement: true })
        .avif(AVIF_OPTS)
        .toFile(avifPath);
      filesWritten++;
    } else {
      filesSkipped++;
    }
    bytesWritten += await fileSize(avifPath);

    const webpMtime = await mtime(webpPath);
    if (webpMtime < srcMtime) {
      await makePipeline(source)
        .resize({ width, withoutEnlargement: true })
        .webp(WEBP_OPTS)
        .toFile(webpPath);
      filesWritten++;
    } else {
      filesSkipped++;
    }
    bytesWritten += await fileSize(webpPath);
  }

  // LQIP: tiny blurred placeholder, cheap enough to always (re)compute.
  const lqipBuffer = await makePipeline(source)
    .resize({ width: 20, withoutEnlargement: true })
    .webp({ quality: 20 })
    .toBuffer();
  const blurDataURL = `data:image/webp;base64,${lqipBuffer.toString("base64")}`;

  return {
    slug: source.slug,
    width: intrinsicWidth,
    height: intrinsicHeight,
    aspect: Math.round((intrinsicWidth / intrinsicHeight) * 10000) / 10000,
    widths,
    blurDataURL,
    alt: source.alt,
    bytesWritten,
    filesWritten,
    filesSkipped,
  };
}

function tsStringLiteral(value) {
  return JSON.stringify(value);
}

function generateMediaTs(assets) {
  const entries = assets
    .map((a) => {
      return `  ${tsStringLiteral(a.slug)}: {
    slug: ${tsStringLiteral(a.slug)},
    width: ${a.width},
    height: ${a.height},
    aspect: ${a.aspect},
    widths: [${a.widths.join(", ")}],
    blurDataURL: ${tsStringLiteral(a.blurDataURL)},
    alt: { en: ${tsStringLiteral(a.alt.en)}, ar: ${tsStringLiteral(a.alt.ar)} },
  },`;
    })
    .join("\n");

  return `// AUTO-GENERATED by scripts/process-assets.mjs — do not edit by hand.
// Re-run \`npm run assets\` to regenerate after adding/changing source media.

export type MediaAsset = {
  slug: string;
  width: number;
  height: number;
  aspect: number;
  widths: readonly number[];
  blurDataURL: string;
  alt: { en: string; ar: string };
};

export const MEDIA = {
${entries}
} as const satisfies Record<string, MediaAsset>;

export type MediaSlug = keyof typeof MEDIA;

/** Builds a srcSet string ("/media/slug-360.webp 360w, ...") for one format. */
export function srcSet(slug: string, format: "avif" | "webp"): string {
  const asset = (MEDIA as Record<string, MediaAsset>)[slug];
  if (!asset) throw new Error(\`Unknown media slug: \${slug}\`);
  return asset.widths.map((w) => \`/media/\${slug}-\${w}.\${format} \${w}w\`).join(", ");
}

/** Returns a single image URL (WebP) at the given width, or the largest available. */
export function src(slug: string, width?: number): string {
  const asset = (MEDIA as Record<string, MediaAsset>)[slug];
  if (!asset) throw new Error(\`Unknown media slug: \${slug}\`);
  const w = width ?? asset.widths[asset.widths.length - 1];
  const closest = asset.widths.includes(w)
    ? w
    : asset.widths.reduce((best, candidate) =>
        Math.abs(candidate - w) < Math.abs(best - w) ? candidate : best,
      );
  return \`/media/\${slug}-\${closest}.webp\`;
}
`;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const results = [];
  for (const source of SOURCES) {
    const srcMtime = await mtime(source.file);
    if (srcMtime < 0) {
      console.warn(`  SKIP (source not found): ${source.slug} -> ${source.file}`);
      continue;
    }
    const result = await processImageSource(source, srcMtime);
    results.push(result);
  }

  const mediaTs = generateMediaTs(results);
  await fs.mkdir(path.dirname(MEDIA_TS_PATH), { recursive: true });
  await fs.writeFile(MEDIA_TS_PATH, mediaTs, "utf8");

  // Summary table
  const totalBytes = results.reduce((sum, r) => sum + r.bytesWritten, 0);
  const totalWritten = results.reduce((sum, r) => sum + r.filesWritten, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.filesSkipped, 0);

  console.log("\nImages processed:");
  console.log(
    "  slug".padEnd(28) + "intrinsic".padEnd(12) + "widths".padEnd(22) + "bytes",
  );
  for (const r of results) {
    console.log(
      `  ${r.slug}`.padEnd(28) +
        `${r.width}x${r.height}`.padEnd(12) +
        `[${r.widths.join(",")}]`.padEnd(22) +
        formatBytes(r.bytesWritten),
    );
  }
  console.log(
    `\n  ${results.length} assets, ${totalWritten} files written, ${totalSkipped} files already up to date, ${formatBytes(totalBytes)} total.\n`,
  );

  await processVideos({ SITE_ROOT, MEDIA_SRC_DIR, OUT_DIR, formatBytes });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
