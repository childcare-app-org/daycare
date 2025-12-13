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
}

export function SIDSTimeline({ logs }: SIDSTimelineProps) {
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
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
            {/* Compact View - Mini Timeline Strip */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium text-emerald-800">
                        {t('visit.sidsChecks')} ({logs.length})
                    </span>
                    <div className="flex items-center gap-1">
                        {/* Mini dots for each check (show up to 20) */}
                        {sortedLogs.slice(0, 20).map((log) => (
                            <div
                                key={log.id}
                                className="w-2 h-2 rounded-full bg-emerald-500"
                                title={formatTime(new Date(log.timestamp))}
                            />
                        ))}
                        {sortedLogs.length > 20 && (
                            <span className="text-xs text-emerald-600 ml-1">+{sortedLogs.length - 20}</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {minutesAgo !== null && (
                        <span className="text-sm text-emerald-600">
                            {t('visit.sidsMinutesAgo', { minutes: minutesAgo })}
                        </span>
                    )}
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-emerald-600" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-emerald-600" />
                    )}
                </div>
            </button>

            {/* Expanded View - Full List */}
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-emerald-200">
                    <div className="max-h-48 overflow-y-auto space-y-2">
                        {sortedLogs.map((log) => (
                            <div
                                key={log.id}
                                className="flex items-center justify-between text-sm py-1 px-2 rounded bg-emerald-100/50"
                            >
                                <span className="text-emerald-800 font-medium">
                                    {formatTime(new Date(log.timestamp))}
                                </span>
                                {log.nurse?.name && (
                                    <span className="text-emerald-600">
                                        {log.nurse.name}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
