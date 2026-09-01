#!/usr/bin/env node
// Generates the site's browser icons from the wolf brand mark.
//
// Source is media/wolf.png — a white outline wolf-in-a-circle on transparency.
// On its own that is invisible against a light tab bar, so every icon here is
// flattened onto the site's --color-ink, which is also what the page sits on.
//
// Outputs (Next.js App Router file conventions, all under app/):
//   favicon.ico   32px, PNG-in-ICO — only for clients that ignore <link rel=icon>
//   icon.png      512px, the one browsers actually use
//   apple-icon.png 180px, iOS home screen
//
// Usage: node scripts/generate-icons.mjs   (wired to `npm run icons`)

import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, "..");
const PROJECT_ROOT = path.resolve(SITE_ROOT, "..");

const SOURCE = path.join(PROJECT_ROOT, "media", "wolf.png");
const APP_DIR = path.join(SITE_ROOT, "app");

/** --color-ink from app/globals.css. Keep these in step. */
const INK = { r: 10, g: 10, b: 11, alpha: 1 };

/** Fraction of the canvas the mark occupies. The rest is breathing room. */
const MARK_SCALE = 0.76;

/**
 * The source has a wide transparent margin baked in, which would shrink the
 * mark to nothing at 32px. Trimming first means MARK_SCALE is measured against
 * the artwork itself rather than against the export canvas it happened to sit in.
 */
async function markBuffer() {
  return sharp(SOURCE).trim().png().toBuffer();
}

async function renderIcon(mark, size) {
  const inner = Math.round(size * MARK_SCALE);
  const resized = await sharp(mark)
    .resize({ width: inner, height: inner, fit: "contain",
              background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: INK },
  })
    .composite([{ input: resized, gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * Minimal single-image .ico wrapping a PNG payload — the modern ICO variant
 * every current browser reads. 6-byte ICONDIR + 16-byte ICONDIRENTRY + PNG.
 */
function icoWrap(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size === 256 ? 0 : size, 0); // width  (0 means 256)
  entry.writeUInt8(size === 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // palette size
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);

  return Buffer.concat([header, entry, png]);
}

async function main() {
  const mark = await markBuffer();

  const icon512 = await renderIcon(mark, 512);
  const apple180 = await renderIcon(mark, 180);
  const icon32 = await renderIcon(mark, 32);

  await fs.writeFile(path.join(APP_DIR, "icon.png"), icon512);
  await fs.writeFile(path.join(APP_DIR, "apple-icon.png"), apple180);
  await fs.writeFile(path.join(APP_DIR, "favicon.ico"), icoWrap(icon32, 32));

  console.log("Icons written to app/:");
  console.log(`  favicon.ico     32x32    ${icoWrap(icon32, 32).length} B`);
  console.log(`  icon.png        512x512  ${icon512.length} B`);
  console.log(`  apple-icon.png  180x180  ${apple180.length} B`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
