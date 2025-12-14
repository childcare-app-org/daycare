/**
 * Translation utility functions for event types and tags
 */
import en from "../locales/en.json";
import ja from "../locales/ja.json";

type TranslationFunction = (
  key: string,
  params?: Record<string, string | number | Date>,
) => string;

/**
 * Translates an event type to the current locale
 * @param t - The translation function from useTranslations()
 * @param eventType - The event type to translate (e.g., "Pee", "Eat")
 * @returns The translated event type, or the original if translation not found
 */
export function getTranslatedEventType(
  t: TranslationFunction,
  eventType: string,
): string {
  const translationKey = `eventTypes.${eventType}`;
  const translated = t(translationKey as any);
  // If translation not found, return original
  return translated !== translationKey ? translated : eventType;
}

/**
 * Translates a tag to the current locale
 * @param t - The translation function from useTranslations()
 * @param tag - The tag to translate (e.g., "clear", "yellow", "normal")
 * @returns The translated tag, or the original if translation not found
 */
export function getTranslatedTag(t: TranslationFunction, tag: string): string {
  // Try multiple variations to find the translation
  const variations = [
    tag, // Original
    tag.toLowerCase(), // Lowercase
    tag.toLowerCase().trim(), // Lowercase trimmed
  ];

  for (const variation of variations) {
    const translationKey = `tags.${variation}`;
    const translated = t(translationKey as any);
    if (translated !== translationKey) {
      return translated;
    }
  }

  // If no translation found, return original
  return tag;
}

/**
 * Maps a health check numeric value to its localized string representation.
 * Can be used on both client and server (does not require hooks).
 */
export function getHealthCheckLabel(
  key: string,
  value: number,
  locale: string,
): string | undefined {
  const messages = locale === "ja" ? ja : en;
  const t = messages.healthCheck as Record<string, string>;

  const isMoodOrAppetite = key === "mood" || key === "appetite";

  if (isMoodOrAppetite) {
    switch (value) {
      case -1:
        return t.terrible;
      case 0:
        return t.normal;
      case 1:
        return t.excellent;
      default:
        return locale === "ja" ? "不明" : "Unknown";
    }
  } else {
    // cough, nasal, wheezing
    switch (value) {
      case 0:
        return t.normal;
      case 1:
        return t.mild;
      case 2:
        return t.severe;
      default:
        return locale === "ja" ? "不明" : "Unknown";
    }
  }
}

/**
 * Gets the localized label for a health check key (e.g. "cough" -> "Cough" / "咳")
 */
export function getHealthCheckKey(key: string, locale: string): string {
  const messages = locale === "ja" ? ja : en;
  const t = messages.healthCheck as Record<string, string>;

  // Direct lookup in healthCheck object
  return t[key] || key;
}
