import { useRouter } from 'next/router';
import { Button } from '~/components/ui/button';

import type { Locale } from '~/types/i18n';

const localeNames: Record<Locale, string> = {
    en: 'English',
    ja: '日本語',
};

export function LanguageSwitcher() {
    const router = useRouter();
    const { locale, locales = [], pathname, query, asPath } = router;

    const switchLocale = (newLocale: Locale) => {
        router.push({ pathname, query }, asPath, { locale: newLocale });
    };

    return (
        <div className="flex gap-2">
            {locales.map((loc) => (
                <Button
                    key={loc}
                    variant={locale === loc ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => switchLocale(loc as Locale)}
                >
                    {localeNames[loc as Locale]}
                </Button>
            ))}
        </div>
    );
}

