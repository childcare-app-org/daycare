import type { TimelineLog } from '~/components/ui/timeline';
import { Timeline, TimelineItem } from '~/components/ui/timeline';

export function VisitTimelineView({ logs }: { logs: TimelineLog[] }) {
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
                    log={log}
                />
            ))}
        </Timeline>
    );
}

