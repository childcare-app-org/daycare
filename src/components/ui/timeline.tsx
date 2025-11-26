import * as React from 'react';
import { getEventEmoji } from '~/components/visit/eventTypes';
import { cn } from '~/lib/utils';

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

const TimelineItem = React.forwardRef<
    HTMLDivElement,
    TimelineItemProps & React.HTMLAttributes<HTMLDivElement>
>(({ className, log, icon, ...props }, ref) => {
    const eventData = log.eventData as LogEventData | null | undefined;
    const tags = eventData?.tags ?? [];
    const temperature =
        typeof eventData?.temperature === 'number'
            ? eventData.temperature
            : undefined;

    const timestamp = typeof log.timestamp === 'string'
        ? new Date(log.timestamp)
        : log.timestamp;
    const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div
            ref={ref}
            className={cn("relative flex gap-6 pb-8 last:pb-0", className)}
            {...props}
        >
            {/* Line */}
            <div className="absolute left-[19px] top-10 bottom-0 w-px bg-border last:hidden" />

            {/* Icon/Dot */}
            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm text-lg">
                {icon ? (
                    <div className="text-primary">{icon}</div>
                ) : (
                    <span>{getEventEmoji(log.eventType)}</span>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-2 pt-1.5">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold leading-none tracking-tight">
                                {log.eventType}
                            </h3>
                            {log.nurse?.name && (
                                <span className="text-sm text-muted-foreground font-normal">
                                    by {log.nurse.name}
                                </span>
                            )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {timeString}
                        </span>
                    </div>
                    {log.notes && (
                        <p className="text-sm text-muted-foreground/70 whitespace-pre-line">
                            {log.notes}
                        </p>
                    )}
                    {(tags.length > 0 || typeof temperature === 'number') && (
                        <div className="mt-1 flex flex-wrap gap-2">
                            {tags.map((tag: string) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700 border border-purple-100"
                                >
                                    {tag}
                                </span>
                            ))}
                            {typeof temperature === 'number' && (
                                <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-100">
                                    <span className="mr-1 text-xs">🌡️</span>
                                    {temperature.toFixed(1)}°C
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
})
TimelineItem.displayName = "TimelineItem"

export { Timeline, TimelineItem }

