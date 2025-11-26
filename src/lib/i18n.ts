import type { Locale } from "~/types/i18n";

// Import translation files
import en from '~/locales/en.json';
import ja from '~/locales/ja.json';

// Type-safe translation dictionary
export type TranslationDictionary = typeof en;

// Available locales
export const locales = ["en", "ja"] as const;
export type LocaleType = (typeof locales)[number];

// Translation dictionaries
const dictionaries: Record<LocaleType, TranslationDictionary> = {
  en,
  ja,
};

/**
 * Get translation dictionary for a specific locale
 * @param locale - The locale code (e.g., 'en', 'ja')
 * @returns The translation dictionary for the locale
 */
export function getDictionary(
  locale: LocaleType = "en",
): TranslationDictionary {
  return dictionaries[locale] || dictionaries.en;
}

/**
 * Get nested translation value by path
 * @param dict - The translation dictionary
 * @param path - Dot-separated path (e.g., 'common.loading', 'home.title')
 * @returns The translated string or the path if not found
 */
export function getTranslation(
  dict: TranslationDictionary,
  path: string,
): string {
  const keys = path.split(".");
  let value: any = dict;

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key as keyof typeof value];
    } else {
      return path; // Return path if translation not found
    }
  }

  return typeof value === "string" ? value : path;
}

/**
 * Replace placeholders in translation strings
 * @param text - The text with placeholders (e.g., "Welcome, {name}")
 * @param params - Object with replacement values
 * @returns The text with placeholders replaced
 */
export function replaceParams(
  text: string,
  params: Record<string, string | number>,
): string {
  let result = text;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
  }
  return result;
}
