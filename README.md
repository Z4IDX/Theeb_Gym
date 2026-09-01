# Theeb Gym

The website for [Theeb Gym](https://www.instagram.com/theebfitness) (نادي الذيب) —
a 2,000 m² gym in Marj Al-Hamam, Amman.

Bilingual (English / Arabic, neither one a fallback), dark and typography-led,
with [Keystatic](https://keystatic.com) as a git-based CMS so the owner edits
content without a database. Every call to action is WhatsApp with a pre-filled
message — there is no signup, booking, or payment flow anywhere.

```
.
├── media/     read-only source photography and video (the pipeline's input)
├── site/      the Next.js application
└── PLAN.md    the agreed brief: what this site argues, and in what order
```

## Requirements

| | |
|---|---|
| Node.js | **20.9 or newer** (Next.js 16's floor; developed on 24.x) |
| npm | 10 or newer |
| Disk | ~600 MB, mostly `node_modules` |

No database, no Docker, no external services. `sharp` and `ffmpeg-static` ship as
prebuilt binaries, so the asset pipeline needs no system ImageMagick or ffmpeg.

## Install

```bash
git clone https://github.com/Z4IDX/Theeb_Gym.git
```

```bash
cd Theeb_Gym/site && npm install
```

```bash
npm run dev
```

Open **http://localhost:3000** — you'll be redirected to `/en` or `/ar` depending
on your browser's `Accept-Language` header. The CMS is at
**http://localhost:3000/keystatic**.

That is the whole setup. No `.env` file is needed for local development.

## Commands

All of these run from inside `site/`.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build (run `build` first) |
| `npm run lint` | ESLint |
| `npm run assets` | Regenerate `public/media/` **and** `lib/media.ts` from `../media` |
| `npm run icons` | Regenerate the favicons from `../media/wolf.png` |

`npm run assets` is idempotent — outputs newer than their source are skipped — so
it is safe to re-run any time. Run it after adding or replacing anything in
`media/`; see [site/scripts/README.md](site/scripts/README.md) for how to consume
the result.

## How it fits together

- **Routing.** `app/[lang]/layout.tsx` is the root layout — there is deliberately
  no `app/layout.tsx`, so `/en/*` and `/ar/*` are both real routes with neither as
  a default. `middleware.ts` does `Accept-Language` q-value negotiation.
- **Content.** Everything editable lives in `site/content/` as YAML and Markdoc,
  read through the typed getters in `lib/content.ts`. Pages never touch the
  Keystatic reader directly, and never see an unresolved `{ en, ar }` pair.
- **Media.** `lib/media.ts` is generated, not hand-written. Components reference
  assets by slug and get AVIF/WebP renditions plus a blur placeholder.
- **Arabic** is designed rather than mirrored: its own type family, scale and
  line-height, laid out with CSS logical properties.

## Editing content

Run the dev server and open `/keystatic`. Changes are written straight to the
YAML and Markdoc files in `site/content/`, so every edit is a reviewable diff.

In production the same admin can write to GitHub instead of the local disk — set
`NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO` to `owner/repo` and Keystatic switches to
GitHub storage, opening a pull request per change. Leave it unset and it stays on
local files, which is what `next dev` should always do.

## Deploying

Deploy as a normal Next.js app — Vercel's free tier is the intended target.
Static export was deliberately dropped because Keystatic's admin needs API routes
for GitHub auth; every content page still prerenders as static HTML.

## Before it goes live

**Read [site/LAUNCH-BLOCKERS.md](site/LAUNCH-BLOCKERS.md) first.** It is the
authoritative list of things the owner must confirm — including published prices,
two unverified staff names, and the 14 equipment brand names. Do not treat the
seeded content as fact until those are signed off.
