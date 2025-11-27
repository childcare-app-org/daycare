import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';

import type { Locale } from '~/types/i18n';

const localeConfig: Record<Locale, { flag: string; label: string }> = {
    en: { flag: '🇺🇸', label: 'English' },
    ja: { flag: '🇯🇵', label: '日本語' },
};

const localeOrder: Locale[] = ['en', 'ja'];

function getInitials(name: string | null | undefined): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
        const first = parts[0][0];
        const second = parts[1][0];
        if (first && second) {
            return (first + second).toUpperCase();
        }
    }
    return name.slice(0, 2).toUpperCase();
}

export function DashboardHeader() {
    const { data: session } = useSession();
    const router = useRouter();
    const t = useTranslations();
    const { locale, pathname, query, asPath } = router;

    const switchLocale = (newLocale: Locale) => {
        if (newLocale !== locale) {
            router.push({ pathname, query }, asPath, { locale: newLocale });
        }
    };

    const handleSignOut = () => {
        signOut({ callbackUrl: '/' });
    };

    const userImage = session?.user?.image;
    const userInitials = getInitials(session?.user?.name || session?.user?.email);

    return (
        <div className="flex justify-end items-center mb-6">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className="rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                        aria-label={t('common.openMenu')}
                    >
                        <Avatar>
                            <AvatarImage src={userImage || undefined} alt={session?.user?.name || 'User'} />
                            <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{session?.user?.name || 'User'}</p>
                            {session?.user?.email && (
                                <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                            )}
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                        {t('common.language')}
                    </DropdownMenuLabel>
                    {localeOrder.map((loc) => {
                        const isActive = locale === loc;
                        const config = localeConfig[loc];

                        return (
                            <DropdownMenuItem
                                key={loc}
                                onClick={() => switchLocale(loc)}
                                className={isActive ? 'bg-accent' : ''}
                            >
                                <span className="mr-2 text-lg">{config.flag}</span>
                                <span>{config.label}</span>
                                {isActive && (
                                    <span className="ml-auto text-xs text-muted-foreground">✓</span>
                                )}
                            </DropdownMenuItem>
                        );
                    })}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                        {t('common.signOut')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

