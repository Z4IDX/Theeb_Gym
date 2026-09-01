import "server-only";
import type { Locale } from "./i18n";

/**
 * UI chrome strings only — nav, labels, buttons. Page copy lives in Keystatic
 * so the owner can edit it without touching code.
 */
const dictionaries = {
  en: () => import("@/content/dictionaries/en.json").then((m) => m.default),
  ar: () => import("@/content/dictionaries/ar.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["en"]>>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
