import { config, collection, singleton, fields } from "@keystatic/core";
import { MEDIA, type MediaSlug } from "@/lib/media";

/* -------------------------------------------------------------------------- */
/*  Storage                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Local storage in development, GitHub storage in production.
 *
 * Set NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO to "owner/repo" to switch the admin UI
 * over to GitHub. With the variable unset (or malformed) we fall back to local
 * files, which is what `next dev` should always be doing.
 */
function resolveStorage() {
  const repo = process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO;
  if (!repo) return { kind: "local" } as const;

  const [owner, name] = repo.split("/");
  if (!owner || !name) return { kind: "local" } as const;

  return { kind: "github", repo: { owner, name } } as const;
}

/* -------------------------------------------------------------------------- */
/*  Bilingual field helpers                                                    */
/* -------------------------------------------------------------------------- */
/*
 * Every editable string on this site exists twice: once in English, once in
 * Arabic. Arabic is a first-class language here, not a fallback, so both halves
 * are required by default and neither can be saved empty by accident.
 *
 * `lib/content.ts` flattens these objects down to a single locale before a page
 * ever sees them, so pages write `zone.name`, not `zone.name.en`.
 */

const EN_LABEL = "English";
const AR_LABEL = "العربية — Arabic";

type BilingualTextOptions = {
  label: string;
  description?: string;
  /** Renders both boxes as textareas and stacks them. */
  multiline?: boolean;
  /** Character cap. Use it on headlines — they get set very large. */
  max?: number;
  /** Placeholder-ish nudge shown under the English box only. */
  hint?: string;
};

/** A required English + Arabic pair of plain-text strings. */
function bilingualText({
  label,
  description,
  multiline = false,
  max,
  hint,
}: BilingualTextOptions) {
  return fields.object(
    {
      en: fields.text({
        label: EN_LABEL,
        multiline,
        description: hint,
        validation: { isRequired: true, length: { max } },
      }),
      ar: fields.text({
        label: AR_LABEL,
        multiline,
        validation: { isRequired: true, length: { max } },
      }),
    },
    {
      label,
      description,
      // Side by side for short strings so drift between the two is obvious.
      layout: multiline ? [12, 12] : [6, 6],
    },
  );
}

/** A required English + Arabic pair of prose blocks. */
function bilingualProse(options: Omit<BilingualTextOptions, "multiline">) {
  return bilingualText({ ...options, multiline: true });
}

/** A list of short bilingual strings — kept paired so translations can't drift. */
function bilingualList({
  label,
  description,
  itemLabel,
}: {
  label: string;
  description?: string;
  itemLabel: string;
}) {
  return fields.array(bilingualText({ label: itemLabel }), {
    label,
    description,
    itemLabel: (props) => props.fields.en.value || itemLabel,
  });
}

/** Order is explicit everywhere. `lib/content.ts` sorts on it. */
const orderField = fields.integer({
  label: "Order",
  description: "Lower numbers come first.",
  defaultValue: 100,
  validation: { isRequired: true, min: 0 },
});

/** Slug field. Never stored in the file — it is the file/folder name. */
function slugField(description: string) {
  return fields.text({
    label: "Slug",
    description,
    validation: {
      isRequired: true,
      pattern: {
        regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        message: "Lowercase letters, numbers and single hyphens only.",
      },
    },
  });
}

/* -------------------------------------------------------------------------- */
/*  Media-slug fields                                                          */
/* -------------------------------------------------------------------------- */
/*
 * Images on this site are not uploaded through Keystatic. They are a flat,
 * pre-optimised set produced by `npm run assets` (see scripts/process-assets.mjs)
 * — each source photo becomes several AVIF/WebP files at fixed widths under
 * `public/media/`, plus a blur placeholder and bilingual alt text, all recorded
 * in `lib/media.ts`. A `fields.image()` picker that uploads into a per-entry
 * directory doesn't match that pipeline: it would create a file the pipeline
 * never processed, with no responsive widths, no blur-up and no alt text.
 *
 * So a photo/logo field here stores the bare slug (e.g. "nawaiseh-portrait"),
 * and components resolve it via `src(slug)` / `srcSet(slug, format)` from
 * `lib/media.ts`. The field is a `fields.select()` built from the slugs that
 * actually exist, which makes a typo or a stale reference impossible to save.
 *
 * Trade-off worth knowing: this means the owner cannot add a brand-new photo
 * from inside the CMS. A new photo still has to go through `npm run assets`
 * first (dropped in the source folder, pipeline re-run) before its slug shows
 * up as an option here. That is the same requirement a hand-typed path would
 * have had — the select just prevents pointing at a slug that was never
 * generated.
 */

const mediaSlugs = Object.keys(MEDIA) as MediaSlug[];
const mediaSlugOptions = mediaSlugs.map((slug) => ({ label: slug, value: slug }));
const NO_PHOTO = "" as const;

/** Required photo — must be one of the real, generated media slugs. */
function mediaSlugField({
  label,
  description,
  defaultValue,
}: {
  label: string;
  description: string;
  defaultValue: MediaSlug;
}) {
  return fields.select({
    label,
    description,
    options: mediaSlugOptions,
    defaultValue,
  });
}

/** Optional photo — same, plus a "no photo" option. Components handle empty. */
function optionalMediaSlugField({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return fields.select({
    label,
    description,
    options: [{ label: "— No photo —", value: NO_PHOTO }, ...mediaSlugOptions],
    defaultValue: NO_PHOTO,
  });
}

/* -------------------------------------------------------------------------- */
/*  Config                                                                     */
/* -------------------------------------------------------------------------- */

export default config({
  storage: resolveStorage(),

  ui: {
    brand: { name: "Theeb Gym" },
    navigation: {
      Pages: ["home", "gym", "visit"],
      Floor: ["zones", "brands", "amenities"],
      People: ["coaches"],
      Programme: ["classes"],
      Media: ["gallery"],
      Settings: ["settings"],
    },
  },

  collections: {
    /* ---------------------------------------------------------------------- */
    coaches: collection({
      label: "Coaches",
      slugField: "slug",
      path: "content/coaches/*/",
      columns: ["slug"],
      schema: {
        slug: slugField("Used in the URL, e.g. ahmad-al-nawaiseh."),
        name: bilingualText({ label: "Name", max: 60 }),
        photo: mediaSlugField({
          label: "Photo",
          description: "Bare slug from lib/media.ts, e.g. nawaiseh-portrait. Portrait crop, 4:5.",
          defaultValue: "coach-aladaileh",
        }),
        order: orderField,
        isOwner: fields.checkbox({
          label: "This is the owner",
          defaultValue: false,
          description:
            "Only Ahmad Al-Nawaiseh. The credentials list and the biography below are published for the owner and for nobody else — the site strips them from every other coach.",
        }),
        instagram: fields.url({
          label: "Instagram",
          description: "Optional. Full profile URL.",
        }),

        // OWNER ONLY. `lib/content.ts` deletes this for any coach whose
        // isOwner is false, so filling it in for someone else publishes
        // nothing. Other coaches are name and photo only, by decision:
        // the site makes no coaching or personal-training offer for them.
        credentials: fields.array(
          fields.object(
            {
              title: bilingualText({ label: "Credential", max: 80 }),
              org: fields.text({
                label: "Organisation",
                description: "Proper noun — not translated.",
                validation: { isRequired: true },
              }),
              years: fields.text({
                label: "Years",
                description: "Optional, e.g. 2019–2022. Leave blank if ongoing.",
              }),
            },
            { layout: [12, 8, 4] },
          ),
          {
            label: "Credentials (owner only)",
            description:
              "OWNER ONLY. Ignored and never rendered unless 'This is the owner' is ticked.",
            itemLabel: (props) => props.fields.title.fields.en.value || "Credential",
          },
        ),

        // OWNER ONLY — same rule as credentials above.
        bio: fields.object(
          {
            en: fields.markdoc({
              label: EN_LABEL,
              options: {
                bold: true,
                italic: true,
                link: true,
                unorderedList: true,
                heading: false,
                image: false,
                table: false,
                code: false,
                codeBlock: false,
                divider: false,
                blockquote: false,
                orderedList: false,
                strikethrough: false,
              },
            }),
            ar: fields.markdoc({
              label: AR_LABEL,
              options: {
                bold: true,
                italic: true,
                link: true,
                unorderedList: true,
                heading: false,
                image: false,
                table: false,
                code: false,
                codeBlock: false,
                divider: false,
                blockquote: false,
                orderedList: false,
                strikethrough: false,
              },
            }),
          },
          {
            label: "Biography (owner only)",
            description:
              "OWNER ONLY. Ignored and never rendered unless 'This is the owner' is ticked.",
          },
        ),
      },
    }),

    /* ---------------------------------------------------------------------- */
    zones: collection({
      label: "Training zones",
      slugField: "slug",
      path: "content/zones/*",
      columns: ["slug"],
      schema: {
        slug: slugField("Used in the URL, e.g. free-weights."),
        name: bilingualText({ label: "Zone name", max: 48 }),
        order: orderField,
        summary: bilingualProse({
          label: "Summary",
          description: "Two or three sentences. Concrete nouns, no adjectives you can't measure.",
        }),
        equipment: bilingualList({
          label: "Equipment",
          itemLabel: "Item",
          description: "Short items — three to six words each.",
        }),
        photo: optionalMediaSlugField({
          label: "Photo",
          description:
            "Optional. Bare slug from lib/media.ts. Only set this when a real photo genuinely depicts this zone — leave empty otherwise.",
        }),
      },
    }),

    /* ---------------------------------------------------------------------- */
    brands: collection({
      label: "Equipment brands",
      slugField: "slug",
      path: "content/brands/*",
      columns: ["slug", "name"],
      schema: {
        slug: slugField("Used as the file name, e.g. hammer-strength."),
        // Brand names are proper nouns. They are the same in both languages
        // and there is deliberately no Arabic variant field.
        name: fields.text({
          label: "Brand name",
          description: "Proper noun — identical in English and Arabic.",
          validation: { isRequired: true },
        }),
        order: orderField,
        logo: fields.image({
          label: "Logo",
          directory: "public/media/brands",
          publicPath: "/media/brands",
          description: "Optional. Monochrome SVG or PNG on a transparent ground.",
        }),
      },
    }),

    /* ---------------------------------------------------------------------- */
    classes: collection({
      label: "Group classes",
      slugField: "slug",
      path: "content/classes/*",
      columns: ["slug"],
      schema: {
        slug: slugField("Used in the URL, e.g. hiit."),
        name: bilingualText({ label: "Class name", max: 48 }),
        order: orderField,
        description: bilingualProse({
          label: "What it is",
          description: "What the class does. Never when it runs.",
        }),
        suitsWho: bilingualProse({
          label: "Who it suits",
          description: "One or two sentences naming the person this is for.",
        }),

        // There is deliberately NO schedule, day, time, duration or capacity
        // field on this collection, and none should ever be added.
        //
        // The timetable changes too often to publish: a fixed grid on the site
        // would be wrong within a fortnight, and a wrong timetable costs more
        // trust than no timetable buys. The current week is posted to Instagram
        // instead, which is the one place it is always right — and which sends
        // people to the account rather than away from it.
        //
        // If you are here to add "Mondays 7pm", update Instagram instead.
      },
    }),

    /* ---------------------------------------------------------------------- */
    amenities: collection({
      label: "Amenities",
      slugField: "slug",
      path: "content/amenities/*",
      columns: ["slug"],
      schema: {
        slug: slugField("Used in the URL, e.g. coffee-house."),
        name: bilingualText({ label: "Name", max: 48 }),
        order: orderField,
        body: bilingualProse({
          label: "Body",
          description: "Two or three sentences.",
        }),
        photo: optionalMediaSlugField({
          label: "Photo",
          description:
            "Optional. Bare slug from lib/media.ts. Only set this when a real photo genuinely depicts this amenity — leave empty otherwise.",
        }),
      },
    }),

    /* ---------------------------------------------------------------------- */
    gallery: collection({
      label: "Gallery",
      slugField: "slug",
      path: "content/gallery/*",
      columns: ["slug"],
      schema: {
        slug: slugField("Used as the file name, e.g. gallery-01."),
        image: mediaSlugField({
          label: "Image",
          description: "Bare slug from lib/media.ts, e.g. gallery-01.",
          defaultValue: "gallery-01",
        }),
        alt: bilingualText({
          label: "Alt text",
          description: "Describe what is in the frame. Not a caption, not a slogan.",
          max: 160,
        }),
        order: orderField,
        crop: fields.select({
          label: "Crop",
          options: [
            { label: "Portrait 4:5", value: "4/5" },
            { label: "Landscape 3:2", value: "3/2" },
            { label: "Square 1:1", value: "1/1" },
          ],
          defaultValue: "3/2",
        }),
      },
    }),
  },

  singletons: {
    /* ---------------------------------------------------------------------- */
    settings: singleton({
      label: "Settings",
      path: "content/settings",
      schema: {
        whatsapp: fields.text({
          label: "WhatsApp number (local)",
          description: "As people dial it in Jordan, e.g. 0778000946.",
          validation: { isRequired: true },
        }),
        whatsappIntl: fields.text({
          label: "WhatsApp number (international)",
          description: "Digits only, country code first. Used to build wa.me links.",
          validation: { isRequired: true },
        }),
        phone: fields.text({
          label: "Voice number",
          description: "Calls only — this line does not take WhatsApp.",
          validation: { isRequired: true },
        }),
        instagram: fields.url({
          label: "Instagram — the gym",
          validation: { isRequired: true },
        }),
        instagramHandle: fields.text({
          label: "Instagram handle",
          validation: { isRequired: true },
        }),
        ownerInstagram: fields.url({
          label: "Instagram — the owner",
          validation: { isRequired: true },
        }),
        mapsUrl: fields.url({
          label: "Google Maps link",
          validation: { isRequired: true },
        }),
        coordinates: fields.object(
          {
            lat: fields.number({ label: "Latitude", validation: { isRequired: true } }),
            lng: fields.number({ label: "Longitude", validation: { isRequired: true } }),
          },
          { label: "Coordinates", layout: [6, 6] },
        ),
        address: bilingualText({ label: "Address" }),
        hours: fields.object(
          {
            daily: fields.object(
              {
                open: fields.text({ label: "Opens", validation: { isRequired: true } }),
                close: fields.text({ label: "Closes", validation: { isRequired: true } }),
              },
              { label: "Saturday – Thursday", layout: [6, 6] },
            ),
            friday: fields.object(
              {
                open: fields.text({ label: "Opens", validation: { isRequired: true } }),
                close: fields.text({ label: "Closes", validation: { isRequired: true } }),
              },
              { label: "Friday", layout: [6, 6] },
            ),
          },
          {
            label: "Opening hours",
            description: "24-hour clock. The site formats these for display.",
          },
        ),

        // Every call to action on this site is a WhatsApp deep link. There is
        // no contact form, no booking flow and no online payment — on purpose.
        whatsappMessages: fields.object(
          {
            home: bilingualText({ label: "From the home page" }),
            gym: bilingualText({ label: "From the gym page" }),
            coaches: bilingualText({ label: "From the coaches page" }),
            visit: bilingualText({ label: "From the visit page" }),
            tour: bilingualText({
              label: "From the tour link",
              description:
                "The tour is a secondary link only. It is never the headline and never the primary button.",
            }),
          },
          {
            label: "Pre-filled WhatsApp messages",
            description:
              "What the visitor's message box already says when WhatsApp opens. Keep them short and in the visitor's own voice.",
          },
        ),
      },
    }),

    /* ---------------------------------------------------------------------- */
    home: singleton({
      label: "Home page",
      path: "content/pages/home",
      schema: {
        metaDescription: bilingualText({
          label: "Meta description",
          description: "Search results and link previews. Around 150 characters.",
          max: 200,
        }),
        hero: fields.object(
          {
            eyebrow: bilingualText({ label: "Eyebrow", max: 40 }),
            headline: bilingualText({
              label: "Headline",
              max: 48,
              hint: "This is set very large. Keep it under six words.",
            }),
            subhead: bilingualProse({ label: "Subhead" }),
          },
          { label: "Hero" },
        ),

        // The argument runs in this order and the order is the point:
        // authority first, then scale, then duration.
        authority: fields.object(
          {
            kicker: bilingualText({ label: "Kicker", max: 40 }),
            headline: bilingualText({ label: "Headline", max: 90 }),
            body: bilingualProse({ label: "Body" }),
          },
          { label: "1 — Authority" },
        ),
        scale: fields.object(
          {
            kicker: bilingualText({ label: "Kicker", max: 40 }),
            headline: bilingualText({ label: "Headline", max: 90 }),
            body: bilingualProse({ label: "Body" }),
          },
          { label: "2 — Scale" },
        ),
        duration: fields.object(
          {
            kicker: bilingualText({ label: "Kicker", max: 40 }),
            headline: bilingualText({ label: "Headline", max: 90 }),
            body: bilingualProse({ label: "Body" }),
          },
          { label: "3 — Duration" },
        ),
        closing: fields.object(
          {
            headline: bilingualText({ label: "Headline", max: 60 }),
            body: bilingualProse({ label: "Body" }),
            tourNote: bilingualText({
              label: "Tour note",
              multiline: true,
              description:
                "Secondary line under the WhatsApp button. Never promote this above the WhatsApp call to action.",
            }),
          },
          { label: "Closing" },
        ),
      },
    }),

    /* ---------------------------------------------------------------------- */
    gym: singleton({
      label: "Gym page",
      path: "content/pages/gym",
      schema: {
        metaDescription: bilingualText({
          label: "Meta description",
          max: 200,
        }),
        intro: fields.object(
          {
            eyebrow: bilingualText({ label: "Eyebrow", max: 40 }),
            headline: bilingualText({ label: "Headline", max: 60 }),
            body: bilingualProse({ label: "Body" }),
          },
          { label: "Intro" },
        ),
        zonesIntro: fields.object(
          {
            headline: bilingualText({ label: "Headline", max: 60 }),
            body: bilingualProse({ label: "Body" }),
          },
          { label: "Zones section" },
        ),
        brandsIntro: fields.object(
          {
            headline: bilingualText({ label: "Headline", max: 60 }),
            body: bilingualProse({ label: "Body" }),
          },
          { label: "Brands section" },
        ),

        // Prices ARE published, as of the owner's own price-list graphic
        // (media/gallery/Memberships.jpeg, supplied 2026-09-01). This reverses
        // the earlier "no fees anywhere" rule — see LAUNCH-BLOCKERS.md.
        // They live here as real text, not as that JPEG, so they are editable,
        // translatable and readable by a screen reader.
        membership: fields.object(
          {
            headline: bilingualText({ label: "Headline", max: 60 }),
            body: bilingualProse({
              label: "Body",
              description:
                "What the membership covers. The fees themselves live in the Price list below.",
            }),
          },
          { label: "What membership covers" },
        ),

        pricing: fields.object(
          {
            headline: bilingualText({ label: "Headline", max: 60 }),
            currency: bilingualText({
              label: "Currency",
              max: 12,
              hint: "Shown after every price. 'JD' on the owner's own price list.",
            }),
            plans: fields.array(
              fields.object({
                term: bilingualText({ label: "Term", max: 30 }),
                price: fields.text({
                  label: "Price",
                  description: "The number only — no currency, no symbol.",
                  validation: { isRequired: true, length: { max: 10 } },
                }),
              }),
              {
                label: "Terms",
                description:
                  "Shortest first. The longest term is highlighted as the best value.",
                itemLabel: (props) =>
                  `${props.fields.term.fields.en.value || "Term"} — ${props.fields.price.value}`,
              },
            ),
            includes: fields.array(
              fields.object({
                title: bilingualText({ label: "Title", max: 40 }),
                detail: bilingualText({ label: "Detail", max: 60 }),
              }),
              {
                label: "Included with every membership",
                itemLabel: (props) => props.fields.title.fields.en.value || "Included",
              },
            ),
            note: bilingualProse({
              label: "Note",
              description:
                "The line under the table. Say what the price does and does not settle.",
            }),
          },
          { label: "Price list" },
        ),

        classes: fields.object(
          {
            headline: bilingualText({ label: "Headline", max: 60 }),
            body: bilingualProse({
              label: "Body",
              description: "What the classes are. Never which day or hour they run.",
            }),
            instagramLine: bilingualText({
              label: "Instagram hand-off",
              multiline: true,
              description:
                "The line that sends people to Instagram for the current week's timetable.",
            }),
          },
          { label: "Classes section" },
        ),
      },
    }),

    /* ---------------------------------------------------------------------- */
    visit: singleton({
      label: "Visit page",
      path: "content/pages/visit",
      schema: {
        metaDescription: bilingualText({ label: "Meta description", max: 200 }),
        intro: fields.object(
          {
            eyebrow: bilingualText({ label: "Eyebrow", max: 40 }),
            headline: bilingualText({ label: "Headline", max: 60 }),
            body: bilingualProse({ label: "Body" }),
          },
          { label: "Intro" },
        ),
        directions: fields.object(
          {
            headline: bilingualText({ label: "Headline", max: 60 }),
            body: bilingualProse({ label: "Body" }),
          },
          { label: "Getting here" },
        ),
        parking: fields.object(
          {
            headline: bilingualText({ label: "Headline", max: 60 }),
            body: bilingualProse({ label: "Body" }),
          },
          { label: "Parking" },
        ),
        fridayNote: bilingualProse({
          label: "Friday hours note",
          description:
            "Friday is the one day that breaks the pattern. Say so plainly — people turn up at 9am and find the door shut.",
        }),
        tourNote: bilingualProse({
          label: "Tour note",
          description:
            "Secondary only. The free tour is never the headline and never the primary button.",
        }),
      },
    }),
  },
});
