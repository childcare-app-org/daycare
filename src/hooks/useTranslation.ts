import { useRouter } from 'next/router';
import { getDictionary, getTranslation, replaceParams } from '~/lib/i18n';

import type { TranslationDictionary } from "~/lib/i18n";

import type { Locale } from "~/types/i18n";

/**
 * Hook to access translations in components
 * @returns Object with translation functions and current locale
 */
export function useTranslation() {
  const router = useRouter();
  const locale = (router.locale || router.defaultLocale || "en") as Locale;
  const dict = getDictionary(locale);

  /**
   * Get a translated string by path
   * @param path - Dot-separated path (e.g., 'common.loading', 'home.title')
   * @param params - Optional parameters to replace in the string
   * @returns The translated string
   */
  const t = (
    path: string,
    params?: Record<string, string | number>,
  ): string => {
    let translation = getTranslation(dict, path);
    if (params) {
      translation = replaceParams(translation, params);
    }
    return translation;
  };

  return {
    t,
    locale,
    dict,
  };
}
