import { Check, Circle, X } from 'lucide-react';
import * as React from 'react';
import { cn } from '~/lib/utils';

import type { LogEventData } from '~/server/db/schema';
export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
    items?: TimelineItemProps[]
}

export interface TimelineItemProps {
    date: Date | string
    title: string
    description?: string
    icon?: React.ReactNode
    status?: "completed" | "in-progress" | "pending" | "error"
    notes?: string
    author?: string
    log?: {
        eventData?: LogEventData | null;
        [key: string]: unknown;
    }
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
>(({ className, date, title, description, icon, status = "completed", notes, author, log, ...props }, ref) => {
    const eventData = log?.eventData as LogEventData | undefined | null;
    const tags = eventData?.tags ?? [];
    const temperature =
        typeof eventData?.temperature === 'number'
            ? eventData.temperature
            : undefined;
    return (
        <div
            ref={ref}
            className={cn("relative flex gap-6 pb-8 last:pb-0", className)}
            {...props}
        >
            {/* Line */}
            <div className="absolute left-[19px] top-10 bottom-0 w-px bg-border last:hidden" />

            {/* Icon/Dot */}
            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm">
                {icon ? (
                    <div className="text-primary">{icon}</div>
                ) : status === "completed" ? (
                    <Check className="h-5 w-5 text-primary" />
                ) : status === "in-progress" ? (
                    <Circle className="h-5 w-5 fill-primary text-primary" />
                ) : status === "error" ? (
                    <X className="h-5 w-5 text-destructive" />
                ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-2 pt-1.5">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold leading-none tracking-tight">
                            {title}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                            {typeof date === 'string' ? date : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    {description && (
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {description}
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

                {(notes || author) && (
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-3 mt-1">
                        {notes && <p className="text-sm mb-2">{notes}</p>}
                        {author && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Logged by {author}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
})
TimelineItem.displayName = "TimelineItem"

export { Timeline, TimelineItem }

