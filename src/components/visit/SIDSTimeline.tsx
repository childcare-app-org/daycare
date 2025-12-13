import { ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface SIDSLog {
    id: string;
    timestamp: Date;
    nurse?: {
        name: string;
    } | null;
}

interface SIDSTimelineProps {
    logs: SIDSLog[];
    showMinutesAgo?: boolean;
}

export function SIDSTimeline({ logs, showMinutesAgo = true }: SIDSTimelineProps) {
    const t = useTranslations();
    const [isExpanded, setIsExpanded] = useState(false);

    // Don't render if no SIDS logs
    if (logs.length === 0) {
        return null;
    }

    // Sort logs by timestamp descending (most recent first)
    const sortedLogs = [...logs].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const lastCheck = sortedLogs[0];
    const lastCheckTime = lastCheck ? new Date(lastCheck.timestamp) : null;

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getMinutesAgo = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        return Math.floor(diffMs / (1000 * 60));
    };

    const minutesAgo = lastCheckTime ? getMinutesAgo(lastCheckTime) : null;

    return (
        <div className="bg-white rounded-xl border border-gray-300 p-6 shadow-lg mb-6">
            {/* Header with Expand/Collapse */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">
                        {t('visit.sidsChecks')} ({logs.length})
                    </span>
                    {showMinutesAgo && minutesAgo !== null && (
                        <span className="text-sm text-gray-500 print:hidden">
                            · {t('visit.sidsMinutesAgo', { minutes: minutesAgo })}
                        </span>
                    )}
                </div>
                <div className="flex items-center print:hidden">
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                </div>
            </div>

            {/* Expanded View - Full List (always show in print) */}
            <div className={`mt-4 pt-4 border-t border-gray-200 ${isExpanded ? 'block' : 'hidden print:block'}`}>
                <div className="max-h-48 overflow-y-auto space-y-2 print:max-h-none">
                    {sortedLogs.map((log) => (
                        <div
                            key={log.id}
                            className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-gray-50"
                        >
                            <span className="text-gray-800 font-medium">
                                {formatTime(new Date(log.timestamp))}
                            </span>
                            {log.nurse?.name && (
                                <span className="text-gray-500">
                                    {log.nurse.name}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
