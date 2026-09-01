# Theeb Gym — rebuild plan

Brief agreed 2026-08-28. This supersedes the existing static site entirely.

## 1. What this site is

A **credibility play with one conversion action.** It exists to make someone arriving
from Instagram believe Theeb is the most serious gym in Amman, then message WhatsApp.

- No prices anywhere.
- No online signup, no class booking, no payments.
- No coaching or PT offer.
- Every call to action is **WhatsApp `0778000946`, with a pre-filled message.**

## 2. The argument, in order

1. **Authority** — Ahmad Al-Nawaiseh judges professional bodybuilding internationally
   (IFBB Pro League / NPC) and certifies other coaches at Mutah University. He built this
   floor. *The standard here is set by someone who judges the sport, not someone who
   sells memberships.*
2. **Scale** — 2,000 m², 250+ machines, 14 global brands. The proof point is
   **you never wait for a rack.**
3. **Duration** — 6am to 2am. Coffee house, KABS supplements, barber, parking.
   You don't visit Theeb, you spend your evening there. This is the most distinctive
   and least-copied thing about the gym and no competitor's site says it.

## 3. Confirmed facts

| | |
|---|---|
| Name | Theeb Gym / نادي الذيب. Logo lockup reads THEEB FITNESS. |
| Tagline | Break Limits · اكسر الحدود |
| Opened | 2025 |
| Location | Marj Al-Hamam, Amman — `31.8867084, 35.8572222` |
| Hours | 6:00–02:00 daily · **Friday 14:00–20:00** |
| Phone | 0778000946 (WhatsApp), 0778000945 |
| Instagram | @theebfitness — 23.7K · owner @captain_ahmad_nawaiseh |
| Floor | 2,000 m², 250+ machines, 14 brands |
| Amenities | Theeb Coffee House, KABS supplement store, barber, parking, showers, lockers |
| Gym type | **Mixed.** Dedicated women's lockers and showers. No ladies-only section. |

**Never repeat from the old site:** the ladies-only section (fabricated), the prices
(invented), the old opening hours (wrong), the fixed class timetable (fiction).

## 4. Routes

Four pages. Both languages are real routes — `/en/*` and `/ar/*` — with `Accept-Language`
detection and no default winner.

| Route | Contains |
|---|---|
| `/` | Hero (Nawaiseh) → floor & scale → amenities / the 2am story → gallery → WhatsApp |
| `/gym` | Zones, 14-brand logo wall, amenities in depth, what a membership covers |
| `/coaches` | Nawaiseh at full depth. Remaining coaches as portraits only. |
| `/visit` | Map, hours, parking, directions, both numbers |

**No membership page** — a page that exists to withhold a price frustrates people.
"What your membership covers" is a section on `/gym`; the nav item anchors to it.

**No classes page** — the schedule shifts too often to publish. Classes are described
by what they do and who they suit, in a section on `/gym`, ending in
"this week's schedule → Instagram." That turns a maintenance problem into IG traffic.

## 5. Design language

Driven by a hard constraint: **no asset exceeds 1200px wide.**

- Typography-led and dark. Type carries the page; images support it.
- Images framed at native crops (4:5 portrait, 3:2 landscape). **Never full-bleed on desktop.**
- The two videos are the only full-bleed-capable assets — used sparingly, compressed hard.
- Keep the wolf and the red/black. Rebuild the palette with intent rather than pure #FF0000.
- Arabic is designed, not swapped: RTL via CSS logical properties, Arabic-specific type
  scale and line-height. Not a mirrored stylesheet.

## 6. Stack

- **Next.js** (App Router, static export) + TypeScript
- **Keystatic** — git-based CMS, no database, free; the site owner edits it
- Tailwind with logical properties for RTL
- GSAP only where it earns its place; `prefers-reduced-motion` honoured
- `LocalBusiness` JSON-LD with the real coordinates and hours

### Content model
Collections: `coaches` (name, photo, `isOwner`, credentials[], socials, order) ·
`zones` · `brands` · `classes` (no schedule fields, deliberately) · `amenities` · `gallery`
Singletons: `settings` (numbers, WhatsApp message text per page, hours, socials, coords) · `home`

## 7. Phases

1. **Foundation** — Next.js, bilingual routing, RTL, design tokens, type scale
2. **Asset pipeline** — HEIC→AVIF/WebP, extract the Nawaiseh cutout, compress both videos
3. **Keystatic + content model**, seeded with real bilingual copy
4. **Pages** — `/gym`, `/coaches`, `/visit`, then `/` last from proven components
5. **Polish** — motion, SEO, schema, Lighthouse on throttled mobile
6. **Launch** — domain, deploy

## 8. Risks

1. **Asset ceiling.** 1080px caps how premium this can look. A proper shoot is the single
   highest-value thing that could happen to this project.
2. **One-person homepage.** If the hero rests on Nawaiseh, his portrait has to carry it.
   The extractable studio cutout is currently the only viable candidate.
3. **Arabic copy.** Both languages equal means every headline written twice, persuasively.
   Drafted here, needs a native review before launch.

## 9. Open

- Domain and hosting — not yet decided
- Logo as vector — only raster available (`logo1.png`, 813×281)
- Deadline — not set
