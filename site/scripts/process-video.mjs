// Video compression step for Theeb Gym's background-loop clips.
// Called from process-assets.mjs (also runnable standalone: `node scripts/process-video.mjs`).
//
// For each source video, emits into public/media/:
//   <slug>.mp4          H.264, capped at 1080px on the long edge, no audio
//   <slug>.webm         VP9 equivalent
//   <slug>-poster.avif  poster frame extracted at ~1s
//   <slug>-poster.webp  poster frame extracted at ~1s
//
// Idempotent: any output newer than its source video is left untouched.

import sharp from "sharp";
import ffmpegPath from "ffmpeg-static";
import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LONG_EDGE_CAP = 1080;
const POSTER_TIMESTAMP = "00:00:01.000";

/** @type {{slug: string, file: string}[]} */
function videoSources(MEDIA_SRC_DIR) {
  return [
    { slug: "video1", file: path.join(MEDIA_SRC_DIR, "video1.mp4") },
    { slug: "video2", file: path.join(MEDIA_SRC_DIR, "video2.mp4") },
  ];
}

async function mtime(file) {
  try {
    return (await fs.stat(file)).mtimeMs;
  } catch {
    return -1;
  }
}

async function fileSize(file) {
  try {
    return (await fs.stat(file)).size;
  } catch {
    return 0;
  }
}

/** Runs `ffmpeg -i <file>` and parses width/height/duration from stderr. */
async function probe(file) {
  let stderr = "";
  try {
    await execFileAsync(ffmpegPath, ["-i", file]);
  } catch (err) {
    // ffmpeg exits non-zero when no output is given; the info we need is on stderr.
    stderr = err.stderr ?? "";
  }
  const dimsMatch = stderr.match(/Video:.*?,\s*(\d{2,5})x(\d{2,5})\b/);
  const durationMatch = stderr.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  if (!dimsMatch) {
    throw new Error(`Could not probe dimensions for ${file}\n${stderr}`);
  }
  const width = Number(dimsMatch[1]);
  const height = Number(dimsMatch[2]);
  let durationSec = null;
  if (durationMatch) {
    const [, h, m, s] = durationMatch;
    durationSec = Number(h) * 3600 + Number(m) * 60 + Number(s);
  }
  return { width, height, durationSec };
}

function computeScaledDims(width, height) {
  if (height >= width) {
    const newHeight = Math.min(height, LONG_EDGE_CAP);
    const newWidth = Math.round((width * newHeight) / height / 2) * 2;
    return { width: Math.max(newWidth, 2), height: newHeight };
  }
  const newWidth = Math.min(width, LONG_EDGE_CAP);
  const newHeight = Math.round((height * newWidth) / width / 2) * 2;
  return { width: newWidth, height: Math.max(newHeight, 2) };
}

async function encode(args) {
  await execFileAsync(ffmpegPath, ["-y", "-hide_banner", "-loglevel", "error", ...args]);
}

export async function processVideos({ MEDIA_SRC_DIR, OUT_DIR, formatBytes }) {
  const sources = videoSources(MEDIA_SRC_DIR);
  const rows = [];

  for (const source of sources) {
    const srcMtime = await mtime(source.file);
    if (srcMtime < 0) {
      console.warn(`  SKIP (source not found): ${source.slug} -> ${source.file}`);
      continue;
    }

    const { width, height, durationSec } = await probe(source.file);
    const scaled = computeScaledDims(width, height);
    const scaleFilter = `scale=${scaled.width}:${scaled.height}`;

    const mp4Path = path.join(OUT_DIR, `${source.slug}.mp4`);
    const webmPath = path.join(OUT_DIR, `${source.slug}.webm`);
    const posterAvifPath = path.join(OUT_DIR, `${source.slug}-poster.avif`);
    const posterWebpPath = path.join(OUT_DIR, `${source.slug}-poster.webp`);

    let wrote = [];

    if ((await mtime(mp4Path)) < srcMtime) {
      await encode([
        "-i", source.file,
        "-vf", scaleFilter,
        "-c:v", "libx264",
        "-crf", "30",
        "-preset", "slow",
        "-movflags", "+faststart",
        "-an",
        mp4Path,
      ]);
      wrote.push("mp4");
    }

    // VP9 output is intentionally disabled. On this footage it encoded LARGER
    // than the H.264 it was meant to improve on (7.5 MB vs 4.3 MB, 10.7 MB vs
    // 5.2 MB), so it cost bandwidth and bought nothing. Re-enable only after
    // retuning the CRF and confirming the result actually beats the MP4.
    const ENABLE_VP9 = false;
    if (ENABLE_VP9 && (await mtime(webmPath)) < srcMtime) {
      await encode([
        "-i", source.file,
        "-vf", scaleFilter,
        "-c:v", "libvpx-vp9",
        "-crf", "36",
        "-b:v", "0",
        "-an",
        webmPath,
      ]);
      wrote.push("webm");
    }

    if ((await mtime(posterAvifPath)) < srcMtime || (await mtime(posterWebpPath)) < srcMtime) {
      const tmpFrame = path.join(OUT_DIR, `.${source.slug}-poster-tmp.png`);
      await encode([
        "-ss", POSTER_TIMESTAMP,
        "-i", source.file,
        "-vf", scaleFilter,
        "-frames:v", "1",
        tmpFrame,
      ]);
      await sharp(tmpFrame).avif({ quality: 55, effort: 6 }).toFile(posterAvifPath);
      await sharp(tmpFrame).webp({ quality: 78 }).toFile(posterWebpPath);
      await fs.unlink(tmpFrame).catch(() => {});
      wrote.push("poster");
    }

    const mp4Size = await fileSize(mp4Path);
    const webmSize = await fileSize(webmPath);
    const posterAvifSize = await fileSize(posterAvifPath);
    const posterWebpSize = await fileSize(posterWebpPath);

    rows.push({
      slug: source.slug,
      srcDims: `${width}x${height}`,
      srcDuration: durationSec ? `${durationSec.toFixed(1)}s` : "?",
      outDims: `${scaled.width}x${scaled.height}`,
      mp4Size,
      webmSize,
      posterSize: posterAvifSize + posterWebpSize,
      wrote: wrote.length ? wrote.join("+") : "up to date",
    });
  }

  console.log("Videos processed:");
  console.log(
    "  slug".padEnd(12) +
      "source".padEnd(20) +
      "output".padEnd(12) +
      "mp4".padEnd(10) +
      "webm".padEnd(10) +
      "poster".padEnd(10) +
      "status",
  );
  for (const r of rows) {
    console.log(
      `  ${r.slug}`.padEnd(12) +
        `${r.srcDims} ${r.srcDuration}`.padEnd(20) +
        `${r.outDims}`.padEnd(12) +
        formatBytes(r.mp4Size).padEnd(10) +
        formatBytes(r.webmSize).padEnd(10) +
        formatBytes(r.posterSize).padEnd(10) +
        r.wrote,
    );
  }
  console.log("");
}
