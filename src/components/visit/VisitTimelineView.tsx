import { Timeline, TimelineItem } from '~/components/ui/timeline';

import type { LogEventData } from '~/server/db/schema';

type VisitLog = {
    id: string;
    timestamp: string | Date;
    eventType: string;
    notes?: string | null;
    eventData?: LogEventData | null;
    nurse?: {
        name?: string | null;
    } | null;
};

export function VisitTimelineView({ logs }: { logs: VisitLog[] }) {
    if (!logs || logs.length === 0) {
        return (
            <div className="py-12 text-center">
                <p className="text-gray-500 mb-2">No events recorded yet</p>
                <p className="text-xs text-gray-400">Use the quick actions above to start logging</p>
            </div>
        );
    }

    return (
        <Timeline>
            {logs.map((log) => (
                <TimelineItem
                    key={log.id}
                    date={new Date(log.timestamp)}
                    title={log.eventType}
                    description={log.notes || undefined}
                    author={log.nurse?.name || undefined}
                    log={log}
                    status="completed"
                />
            ))}
        </Timeline>
    );
}

