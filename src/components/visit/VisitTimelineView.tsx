import type { TimelineLog } from '~/components/ui/timeline';
import { Timeline, TimelineItem } from '~/components/ui/timeline';

export function VisitTimelineView({ logs }: { logs: TimelineLog[] }) {
    if (!logs || logs.length === 0) {
        return (
            <div className="py-12 text-center">
                <p className="text-gray-500 mb-2">No events recorded yet</p>
            </div>
        );
    }

    return (
        <Timeline>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>
            {logs.map((log) => (
                <TimelineItem
                    key={log.id}
                    log={log}
                />
            ))}
        </Timeline>
    );
}

