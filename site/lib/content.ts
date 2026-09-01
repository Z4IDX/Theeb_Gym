import "server-only";
import { createReader } from "@keystatic/core/reader";
import Markdoc, { type Node as MarkdocNode } from "@markdoc/markdoc";
import keystaticConfig from "@/keystatic.config";
import type { Locale } from "./i18n";

/**
 * The typed, locale-resolved read side of the CMS.
 *
 * Pages never touch the Keystatic reader directly. They call the getters below
 * with a `Locale` and get back plain objects with the strings already flattened
 * — `zone.name`, not `zone.name.en` — sorted, and with the owner-only rule on
 * coaches already applied.
 */

const reader = createReader(process.cwd(), keystaticConfig);

/* -------------------------------------------------------------------------- */
/*  Locale resolution                                                          */
/* -------------------------------------------------------------------------- */

type Bilingual = { readonly en: string; readonly ar: string };

/**
 * Returns a resolver bound to one locale. Every `{ en, ar }` pair in the schema
 * goes through this, which is why a page can never accidentally render the
 * wrong language or forget to pick one.
 */
function resolver(locale: Locale) {
  return function pick(value: Bilingual): string {
    return value[locale];
  };
}

type Pick = ReturnType<typeof resolver>;

/** Empty optional strings are stored as "" by Keystatic; treat them as absent. */
function orNull(value: string | null | undefined): string | null {
  return value ? value : null;
}

function byOrder<T extends { order: number }>(a: T, b: T): number {
  return a.order - b.order;
}

/**
 * Markdoc body → HTML string, ready for `dangerouslySetInnerHTML`. The content
 * is authored by the owner in the CMS, so there is no untrusted input here.
 *
 * `@keystatic/core` resolves its own nested copy of `@markdoc/markdoc`, so the
 * `Node` it hands back is structurally identical to ours but nominally a
 * different type. The single assertion below keeps that packaging detail out of
 * every call site.
 */
function renderMarkdoc(doc: { node: unknown }): string {
  return Markdoc.renderers.html(Markdoc.transform(doc.node as MarkdocNode));
}

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type Credential = {
  title: string;
  org: string;
  years: string | null;
};

type CoachBase = {
  slug: string;
  name: string;
  photo: string;
  order: number;
  instagram: string | null;
};

/**
 * The owner is the only person on this site with a published biography or a
 * credential list. Every other coach is a name and a face.
 *
 * This is a union rather than a set of optional fields on purpose: a page
 * cannot read `coach.credentials` without first narrowing on `isOwner`, so a
 * non-owner's credentials cannot be rendered even by mistake. `getCoaches`
 * strips the underlying data as well, so nothing leaks through the RSC payload
 * either.
 */
export type OwnerCoach = CoachBase & {
  isOwner: true;
  credentials: Credential[];
  /** Rendered HTML. */
  bio: string;
};

export type StaffCoach = CoachBase & {
  isOwner: false;
};

export type Coach = OwnerCoach | StaffCoach;

export type Zone = {
  slug: string;
  name: string;
  order: number;
  summary: string;
  equipment: string[];
  photo: string | null;
};

export type Brand = {
  slug: string;
  /** Proper noun — identical in both languages. */
  name: string;
  order: number;
  logo: string | null;
};

export type GymClass = {
  slug: string;
  name: string;
  order: number;
  description: string;
  suitsWho: string;
  // No schedule, day, time, duration or capacity. See keystatic.config.ts.
};

export type Amenity = {
  slug: string;
  name: string;
  order: number;
  body: string;
  photo: string | null;
};

export type GalleryImage = {
  slug: string;
  image: string;
  alt: string;
  order: number;
  crop: "4/5" | "3/2" | "1/1";
};

export type WhatsappMessageKey = "home" | "gym" | "coaches" | "visit" | "tour";

export type Settings = {
  whatsapp: string;
  whatsappIntl: string;
  phone: string;
  instagram: string;
  instagramHandle: string;
  ownerInstagram: string;
  mapsUrl: string;
  coordinates: { lat: number; lng: number };
  address: string;
  hours: {
    daily: { open: string; close: string };
    friday: { open: string; close: string };
  };
  whatsappMessages: Record<WhatsappMessageKey, string>;
};

type Block = { headline: string; body: string };
type KickerBlock = Block & { kicker: string };
type IntroBlock = Block & { eyebrow: string };

export type HomePage = {
  metaDescription: string;
  hero: { eyebrow: string; headline: string; subhead: string };
  authority: KickerBlock;
  scale: KickerBlock;
  duration: KickerBlock;
  closing: Block & { tourNote: string };
};

export type PricingPlan = {
  term: string;
  price: string;
};

export type PricingInclude = {
  title: string;
  detail: string;
};

export type Pricing = {
  headline: string;
  currency: string;
  plans: PricingPlan[];
  includes: PricingInclude[];
  note: string;
};

export type GymPage = {
  metaDescription: string;
  intro: IntroBlock;
  zonesIntro: Block;
  brandsIntro: Block;
  /** What the membership covers. The fees themselves are in `pricing`. */
  membership: Block;
  /** Published fees, transcribed from the owner's own price list. */
  pricing: Pricing;
  classes: Block & { instagramLine: string };
};

export type VisitPage = {
  metaDescription: string;
  intro: IntroBlock;
  directions: Block;
  parking: Block;
  fridayNote: string;
  tourNote: string;
};

/* -------------------------------------------------------------------------- */
/*  Collections                                                                */
/* -------------------------------------------------------------------------- */

export async function getCoaches(locale: Locale): Promise<Coach[]> {
  const t = resolver(locale);
  const entries = await reader.collections.coaches.all({
    resolveLinkedFiles: true,
  });

  const coaches = entries.map(({ slug, entry }): Coach => {
    const base: CoachBase = {
      slug,
      name: t(entry.name),
      photo: entry.photo,
      order: entry.order,
      instagram: orNull(entry.instagram),
    };

    // The owner-only rule, enforced in exactly one place.
    if (!entry.isOwner) return { ...base, isOwner: false };

    return {
      ...base,
      isOwner: true,
      credentials: entry.credentials.map(
        (credential): Credential => ({
          title: t(credential.title),
          org: credential.org,
          years: orNull(credential.years),
        }),
      ),
      bio: renderMarkdoc(entry.bio[locale]),
    };
  });

  return coaches.sort(byOrder);
}

/** The one person on this site who has a biography. */
export async function getOwner(locale: Locale): Promise<OwnerCoach | null> {
  const coaches = await getCoaches(locale);
  return coaches.find((coach): coach is OwnerCoach => coach.isOwner) ?? null;
}

export async function getZones(locale: Locale): Promise<Zone[]> {
  const t = resolver(locale);
  const entries = await reader.collections.zones.all();

  return entries
    .map(({ slug, entry }): Zone => ({
      slug,
      name: t(entry.name),
      order: entry.order,
      summary: t(entry.summary),
      equipment: entry.equipment.map(t),
      photo: orNull(entry.photo),
    }))
    .sort(byOrder);
}

export async function getBrands(): Promise<Brand[]> {
  const entries = await reader.collections.brands.all();

  return entries
    .map(({ slug, entry }): Brand => ({
      slug,
      name: entry.name,
      order: entry.order,
      logo: orNull(entry.logo),
    }))
    .sort(byOrder);
}

export async function getClasses(locale: Locale): Promise<GymClass[]> {
  const t = resolver(locale);
  const entries = await reader.collections.classes.all();

  return entries
    .map(({ slug, entry }): GymClass => ({
      slug,
      name: t(entry.name),
      order: entry.order,
      description: t(entry.description),
      suitsWho: t(entry.suitsWho),
    }))
    .sort(byOrder);
}

export async function getAmenities(locale: Locale): Promise<Amenity[]> {
  const t = resolver(locale);
  const entries = await reader.collections.amenities.all();

  return entries
    .map(({ slug, entry }): Amenity => ({
      slug,
      name: t(entry.name),
      order: entry.order,
      body: t(entry.body),
      photo: orNull(entry.photo),
    }))
    .sort(byOrder);
}

export async function getGallery(locale: Locale): Promise<GalleryImage[]> {
  const t = resolver(locale);
  const entries = await reader.collections.gallery.all();

  return entries
    .map(({ slug, entry }): GalleryImage => ({
      slug,
      image: entry.image,
      alt: t(entry.alt),
      order: entry.order,
      crop: entry.crop,
    }))
    .sort(byOrder);
}

/* -------------------------------------------------------------------------- */
/*  Singletons                                                                 */
/* -------------------------------------------------------------------------- */

export async function getSettings(locale: Locale): Promise<Settings> {
  const t = resolver(locale);
  const entry = await reader.singletons.settings.readOrThrow();
  const messages = entry.whatsappMessages;

  return {
    whatsapp: entry.whatsapp,
    whatsappIntl: entry.whatsappIntl,
    phone: entry.phone,
    instagram: entry.instagram,
    instagramHandle: entry.instagramHandle,
    ownerInstagram: entry.ownerInstagram,
    mapsUrl: entry.mapsUrl,
    coordinates: {
      lat: entry.coordinates.lat,
      lng: entry.coordinates.lng,
    },
    address: t(entry.address),
    hours: {
      daily: { open: entry.hours.daily.open, close: entry.hours.daily.close },
      friday: { open: entry.hours.friday.open, close: entry.hours.friday.close },
    },
    whatsappMessages: {
      home: t(messages.home),
      gym: t(messages.gym),
      coaches: t(messages.coaches),
      visit: t(messages.visit),
      tour: t(messages.tour),
    },
  };
}

function block(t: Pick, value: { headline: Bilingual; body: Bilingual }): Block {
  return { headline: t(value.headline), body: t(value.body) };
}

export async function getHome(locale: Locale): Promise<HomePage> {
  const t = resolver(locale);
  const entry = await reader.singletons.home.readOrThrow();

  return {
    metaDescription: t(entry.metaDescription),
    hero: {
      eyebrow: t(entry.hero.eyebrow),
      headline: t(entry.hero.headline),
      subhead: t(entry.hero.subhead),
    },
    authority: { kicker: t(entry.authority.kicker), ...block(t, entry.authority) },
    scale: { kicker: t(entry.scale.kicker), ...block(t, entry.scale) },
    duration: { kicker: t(entry.duration.kicker), ...block(t, entry.duration) },
    closing: {
      ...block(t, entry.closing),
      tourNote: t(entry.closing.tourNote),
    },
  };
}

export async function getGymPage(locale: Locale): Promise<GymPage> {
  const t = resolver(locale);
  const entry = await reader.singletons.gym.readOrThrow();

  return {
    metaDescription: t(entry.metaDescription),
    intro: { eyebrow: t(entry.intro.eyebrow), ...block(t, entry.intro) },
    zonesIntro: block(t, entry.zonesIntro),
    brandsIntro: block(t, entry.brandsIntro),
    membership: block(t, entry.membership),
    pricing: {
      headline: t(entry.pricing.headline),
      currency: t(entry.pricing.currency),
      plans: entry.pricing.plans.map((plan) => ({
        term: t(plan.term),
        price: plan.price,
      })),
      includes: entry.pricing.includes.map((item) => ({
        title: t(item.title),
        detail: t(item.detail),
      })),
      note: t(entry.pricing.note),
    },
    classes: {
      ...block(t, entry.classes),
      instagramLine: t(entry.classes.instagramLine),
    },
  };
}

export async function getVisitPage(locale: Locale): Promise<VisitPage> {
  const t = resolver(locale);
  const entry = await reader.singletons.visit.readOrThrow();

  return {
    metaDescription: t(entry.metaDescription),
    intro: { eyebrow: t(entry.intro.eyebrow), ...block(t, entry.intro) },
    directions: block(t, entry.directions),
    parking: block(t, entry.parking),
    fridayNote: t(entry.fridayNote),
    tourNote: t(entry.tourNote),
  };
}
