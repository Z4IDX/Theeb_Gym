# Launch blockers

Everything below must be confirmed by the owner (Ahmad Al-Nawaiseh) before this
site goes live. None of it is safe to ship on the current seed content as-is.

## 0. Prices are now published — confirm this is intended

**This reverses a locked product decision.** The brief said, in the owner's own
words, that fees were never to appear on the site and that every price question
was to be routed to WhatsApp. As of 2026-09-01 the Gym page publishes the full
term sheet — 60 / 100 / 140 / 240 / 400 JD — transcribed from the price-list
graphic the owner supplied (`media/gallery/Memberships.jpeg`).

The graphic is Theeb's own published artwork, so the numbers themselves are as
trustworthy as any fact on this site. What needs confirming is the *policy*:
that the owner now wants these on a public web page, where they are indexed and
quotable, rather than given out per enquiry. A price on a website is also the
single most expensive thing to keep current — every change now means a CMS edit.

Prices live in `content/pages/gym.yaml` under `pricing`, as editable bilingual
text rather than as the JPEG, so the owner can correct them without a designer.

## 1. The two staff coaches are unverified names on real photos

`content/coaches/coach-aladaileh/` and `content/coaches/coach-khoury/` use two
real staff portraits (`coach-aladaileh`, `coach-khoury` in `lib/media.ts`), but
their `name` field is a deliberate placeholder — `"Coach — name to be
confirmed"` / `"مدرّب — الاسم لم يُؤكَّد بعد"` — not a real name. The four other
"coaches" seeded earlier (Hamza Al-Khatib, Omar Al-Zoubi, Laith Abu Hassan,
Saif Al-Tarawneh) were invented names for a real business and have been
deleted entirely; they must not come back.

**Needed from the owner:** the actual staff roster — names, which photos go
with which name, and whether the roster includes any women (the site makes no
assumption either way).

**Related problem you cannot see from the content files alone:** the alt text
already baked into `lib/media.ts` (which this pass was not permitted to edit)
names these two photos "Ahmad Aladaileh" and "Jameel Khoury" —

- `coach-aladaileh` alt: "Portrait of **Ahmad Aladaileh**, head coach at Theeb Gym..."
- `coach-khoury` alt: "Portrait of **Jameel Khoury**, head coach at Theeb Gym..."

Those names are asserted as fact in accessibility/SEO text even though they
are just as unverified as the four deleted names — they appear to come from
the same untrusted old site. The content entries in this pass deliberately do
**not** repeat those names (see above), but the alt text still ships them
until someone with access to `lib/media.ts` reconciles it with whatever roster
the owner confirms.

## 2. The 14 equipment brand names are plausible, not confirmed

`content/brands/*.yaml`: Hammer Strength, Life Fitness, Technogym, Cybex,
Precor, Nautilus, Matrix, Panatta, Watson, Eleiko, Rogue, Atlantis, Arsenal
Strength, Gymleco. The confirmed facts only establish "250+ machines, 14
global brands" as a count — not which 14. Get the owner to check this list
against what is actually on the floor before it ships as named brand badges.

## 3. Zone equipment lists are plausible kit, not a confirmed inventory

Every `content/zones/*.yaml` `equipment` list (e.g. free weights: "Adjustable
and Scott benches", "Cable crossover stations"; power & platforms: "Deadlift
and trap bars"; etc.) is a reasonable guess at what a zone with that name
would contain, not a walkthrough inventory. Needs owner sign-off zone by zone.

## 4. Zone photos are an editorial best-guess pairing, not a confirmed match

This pass added `photo` to five of the seven zones by matching the zone name
against the *alt text* of otherwise-generic training-floor photography (the
13 `gallery-NN` images have no zone label of their own):

| Zone | Photo | Why it was picked |
|---|---|---|
| Free Weights | `gallery-08` | alt text explicitly says "free-weight floor" |
| Plate-Loaded | `gallery-07` | alt text explicitly says "plate-loaded leg press" |
| Selectorised Machines | `gallery-09` | shows a Life Fitness cable trainer (a selectorized machine) |
| Cardio | `gallery-04` | shows StairMaster climbers and bikes, though the same frame also has a functional rig and agility lines |
| Functional & Turf | `gallery-10` | shows a functional rig and kettlebells, but no turf is visible in frame |

Power & Platforms and Stretching & Recovery were left with no photo — nothing
in the real image set unambiguously shows a power rack, a lifting platform, or
a stretching area. Have the owner confirm these five pairings actually show
the zone they're now attached to, since none of the source photos were
labelled by zone.

## 5. Group classes exist; the five named ones are still unverified

**Partly resolved 2026-09-01.** The owner's own price-list graphic
(`media/gallery/Memberships.jpeg`) states "Free Classes — 12 class a month",
which settles the open question of whether Theeb runs group classes at all. It
does.

What it does *not* settle is the roster. `content/classes/*.yaml` still names
five specific classes — HIIT, Cycling, Boxing Conditioning, Functional
Conditioning, Mobility & Stretch — with descriptions that were written
speculatively. Confirm those five and their descriptions with the owner before
launch. The "12 a month" allowance is now published on the Gym page and is
safe; the five names are not.

## 6. An unconfirmed personal detail in the owner's bio

`content/coaches/ahmad-al-nawaiseh/bio/en.mdoc` and `ar.mdoc` (left untouched,
per instructions) state that Ahmad Al-Nawaiseh "also owns Turbo Gym, in
another governorate." This is not in the confirmed-facts list. Verify before
it ships as a factual claim about the owner.

## 7. Google Maps link

`content/settings.yaml` → `mapsUrl: https://maps.app.goo.gl/e8RGGdA99J2q5msj8`.
The coordinates (31.8867084 / 35.8572222) are confirmed; this specific short
link was not separately verified in this pass. Click-test it before launch.

---

## What was fixed in this pass (for reference)

- Deleted four fabricated coach entries (Hamza Al-Khatib, Omar Al-Zoubi, Laith
  Abu Hassan, Saif Al-Tarawneh) — invented names for a real business.
- Replaced their real-photo counterparts with two provisional entries
  (`coach-aladaileh`, `coach-khoury`) using a placeholder name, `isOwner:
  false`, no credentials, no bio.
- Set Ahmad Al-Nawaiseh's photo to `nawaiseh-portrait`.
- Replaced 8 invented gallery entries (paths like
  `/media/gallery/floor-wide/image.jpg`, which do not exist) with 15 entries
  built on the real `gallery-01`…`gallery-13`, `facility-machines` and
  `facility-space` slugs, reusing the alt text already written in
  `lib/media.ts` and setting `crop` from each image's real aspect ratio.
- Cleared every zone and amenity `photo` field that pointed at a
  nonexistent path; re-populated five of the seven zones with a real slug
  only where the alt text of that slug genuinely matches the zone (see §4
  above); left the rest empty, which the components already handle.
- Changed `coaches.photo`, `zones.photo`, `amenities.photo` and
  `gallery.image` in `keystatic.config.ts` from `fields.image()` (which
  pointed at directories that don't match how these assets are actually
  built) to `fields.select()` over the real slugs in `lib/media.ts`. See the
  comment above `mediaSlugField`/`optionalMediaSlugField` in
  `keystatic.config.ts` for the trade-off: the owner can no longer upload a
  brand-new photo directly through Keystatic — new photos still have to go
  through `npm run assets` first, exactly as a hand-typed path would have
  required, but the select now makes it impossible to save a slug that was
  never actually generated. `brands.logo` was left untouched — no brand file
  references a logo, and no logo assets exist in `lib/media.ts` to point it
  at.

## 6. Video assets are encoded but unused

`public/media/video1.mp4` (4.3 MB) and `video2.mp4` (5.2 MB) are compressed and
ready, with AVIF/WebP poster frames, but **no page references them**. The
homepage hero is deliberately typographic rather than video-backed.

The VP9 `.webm` variants were deleted: they encoded *larger* than the H.264
MP4s they were meant to improve on (7.5 MB and 10.7 MB respectively), so they
cost bandwidth and bought nothing. Re-run `npm run assets` if they are ever
wanted, but retune the CRF first.

Also note `video2-poster.avif` is only 1.9 KB, which almost certainly means the
frame extracted at ~1s is near-black. Pick a better timestamp before using it.

## 7. Two facts the site asserts that nobody has re-checked

- **"14 global brands"** and **"250+ machines"** are owner-confirmed as counts,
  and are used verbatim. Fine to ship.
- **"2,000 m²"** likewise. Fine to ship.
- **"Twenty hours a day"** on the homepage is derived arithmetic from the
  confirmed 06:00–02:00. It is correct for Saturday–Thursday but **not** for
  Friday (14:00–20:00, six hours). The copy does not currently qualify this.
  Decide whether that matters to the owner.
