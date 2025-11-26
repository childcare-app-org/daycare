/**
 * Translation utility functions for event types and tags
 */

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
