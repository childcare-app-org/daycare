import { useRouter } from 'next/router';

import type { Locale } from '~/types/i18n';

const localeConfig: Record<Locale, { flag: string; label: string }> = {
    en: { flag: '🇺🇸', label: 'English' },
    ja: { flag: '🇯🇵', label: '日本語' },
};

const localeOrder: Locale[] = ['en', 'ja'];

export function LanguageSwitcher() {
    const router = useRouter();
    const { locale, pathname, query, asPath } = router;

    const switchLocale = (newLocale: Locale) => {
        if (newLocale !== locale) {
            router.push({ pathname, query }, asPath, { locale: newLocale });
        }
    };

    const activeIndex = localeOrder.indexOf(locale as Locale);

    return (
        <div className="relative flex items-center rounded-full bg-muted/60 p-1 shadow-sm border border-border/50 backdrop-blur-sm">
            {/* Animated sliding indicator */}
            <div
                className="absolute h-8 w-8 rounded-full bg-white shadow-md transition-all duration-300 ease-out"
                style={{
                    left: '4px',
                    transform: `translateX(${activeIndex * 32}px)`,
                }}
            />

            {/* Flag buttons */}
            {localeOrder.map((loc) => {
                const isActive = locale === loc;
                const config = localeConfig[loc];

                return (
                    <button
                        key={loc}
                        onClick={() => switchLocale(loc)}
                        className={`
                            relative z-10 flex h-8 w-8 items-center justify-center rounded-full
                            text-lg transition-all duration-200
                            hover:scale-110 active:scale-95
                            ${isActive ? 'drop-shadow-sm' : 'opacity-60 hover:opacity-100'}
                        `}
                        title={config.label}
                        aria-label={`Switch to ${config.label}`}
                    >
                        <span className="leading-none">{config.flag}</span>
                    </button>
                );
            })}
        </div>
    );
}

