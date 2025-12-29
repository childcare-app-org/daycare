import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import * as React from 'react';
import { Card } from '~/components/ui/card';
import { EVENT_TYPES, getEventEmoji } from '~/components/visit/eventTypes';
import { cn } from '~/lib/utils';
import { getTranslatedEventType, getTranslatedTag } from '~/utils/translations';

import type { EventCategory } from '~/components/visit/eventTypes';

import type { RouterOutputs } from '~/utils/api';
import type { LogEventData } from '~/server/db/schema';
export type TimelineLog = RouterOutputs['logs']['getByVisit'][number];

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
    items?: TimelineItemProps[]
}

export interface TimelineItemProps {
    log: TimelineLog;
    icon?: React.ReactNode;
}

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("flex flex-col space-y-0", className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)
Timeline.displayName = "Timeline"

// Helper to get category color classes
const getCategoryStyles = (category: EventCategory) => {
    switch (category) {
        case 'Output':
            return {
                iconBg: 'bg-emerald-50 dark:bg-emerald-950/30',
                iconBorder: 'border-emerald-200 dark:border-emerald-800',
                iconText: 'text-emerald-700 dark:text-emerald-400',
            };
        case 'Intake':
            return {
                iconBg: 'bg-sky-50 dark:bg-sky-950/30',
                iconBorder: 'border-sky-200 dark:border-sky-800',
                iconText: 'text-sky-700 dark:text-sky-400',
            };
        case 'Activity':
            return {
                iconBg: 'bg-indigo-50 dark:bg-indigo-950/30',
                iconBorder: 'border-indigo-200 dark:border-indigo-800',
                iconText: 'text-indigo-700 dark:text-indigo-400',
            };
        default:
            return {
                iconBg: 'bg-amber-50 dark:bg-amber-950/30',
                iconBorder: 'border-amber-200 dark:border-amber-800',
                iconText: 'text-amber-700 dark:text-amber-400',
            };
    }
};

const TimelineItem = React.forwardRef<
    HTMLDivElement,
    TimelineItemProps & React.HTMLAttributes<HTMLDivElement>
>(({ className, log, icon, ...props }, ref) => {
    const router = useRouter();
    const t = useTranslations();
    const locale = router.locale || 'en';
    const eventData = log.eventData as LogEventData | null | undefined;
    const tags = eventData?.tags ?? [];
    const temperature =
        typeof eventData?.temperature === 'number'
            ? eventData.temperature
            : undefined;

    const timestamp = typeof log.timestamp === 'string'
        ? new Date(log.timestamp)
        : log.timestamp;
    const timeString = timestamp.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

    // Get event category for styling
    const eventDefinition = EVENT_TYPES.find((e) => e.label === log.eventType);
    const category = eventDefinition?.category || 'Other';
    const categoryStyles = getCategoryStyles(category);

    return (
        <div
            ref={ref}
            className={cn("relative flex gap-4 pb-4 last:pb-0", className)}
            {...props}
        >
            {/* Line */}
            <div className="absolute left-[19px] top-10 bottom-0 w-px bg-border last:hidden" />

            {/* Icon/Dot */}
            <div className={cn(
                "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 shadow-sm text-lg transition-all",
                categoryStyles.iconBg,
                categoryStyles.iconBorder
            )}>
                {icon ? (
                    <div className={categoryStyles.iconText}>{icon}</div>
                ) : (
                    <span className="text-base leading-none">{getEventEmoji(log.eventType)}</span>
                )}
            </div>

            {/* Content Card */}
            <Card className="flex-1 border-l-0 shadow-xs hover:shadow-sm transition-shadow py-2">
                <div className="flex flex-col gap-2 py-2 px-3">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-semibold leading-tight">
                                    {getTranslatedEventType(t, log.eventType)}
                                </h3>
                                {log.nurse?.name && (
                                    <span className="text-xs text-muted-foreground font-normal">
                                        {t('timeline.by', { name: log.nurse.name })}
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium shrink-0">
                            {timeString}
                        </span>
                    </div>

                    {log.notes && (
                        <p className="text-sm text-muted-foreground/80 whitespace-pre-line leading-normal">
                            {log.notes}
                        </p>
                    )}

                    {(tags.length > 0 || typeof temperature === 'number') && (
                        <div className="flex flex-wrap gap-1.5">
                            {tags.map((tag: string) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium border border-primary/20"
                                >
                                    {getTranslatedTag(t, tag)}
                                </span>
                            ))}
                            {typeof temperature === 'number' && (
                                <span className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 text-xs font-medium border border-amber-200 dark:border-amber-800">
                                    {temperature.toFixed(1)}°C
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
})
TimelineItem.displayName = "TimelineItem"

export { Timeline, TimelineItem }

