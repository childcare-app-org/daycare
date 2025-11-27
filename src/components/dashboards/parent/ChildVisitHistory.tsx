import { Clock, History, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import { api } from '~/utils/api';

// Helper function to calculate duration between two dates
const calculateDuration = (start: Date, end: Date): { hours: number; minutes: number } => {
    const diffMs = end.getTime() - start.getTime();
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    return {
        hours: Math.floor(totalMinutes / 60),
        minutes: totalMinutes % 60,
    };
};

interface ChildVisitHistoryProps {
    childId: string;
}

export function ChildVisitHistory({ childId }: ChildVisitHistoryProps) {
    const t = useTranslations();
    const [showMore, setShowMore] = useState(false);
    const limit = showMore ? 10 : 3;

    const { data, isLoading } = api.visit.getChildVisitHistory.useQuery({
        childId,
        limit,
    });

    if (isLoading) {
        return (
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <History className="w-4 h-4" />
                    <span>{t('common.loading')}</span>
                </div>
            </div>
        );
    }

    if (!data || data.visits.length === 0) {
        return (
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <History className="w-4 h-4" />
                    <span>{t('dashboard.parent.noVisitsYet')}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-600 mb-3">
                <History className="w-4 h-4 flex-shrink-0" />
                <span>{t('dashboard.parent.visitHistory')}</span>
            </div>
            <div className="space-y-2">
                {data.visits.map((visit) => {
                    const isActive = visit.status === 'active';
                    const dropOff = new Date(visit.dropOffTime);
                    const pickup = visit.pickupTime ? new Date(visit.pickupTime) : null;
                    const duration = pickup && !isActive ? calculateDuration(dropOff, pickup) : null;

                    return (
                        <Link
                            key={visit.id}
                            href={`/visit/parent/${visit.id}`}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group gap-2 sm:gap-3"
                        >
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <MapPin className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-gray-500 flex-shrink-0" />
                                <span className="text-sm sm:text-base font-medium text-gray-700 truncate">
                                    {visit.hospital?.name}
                                </span>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 flex-shrink-0">
                                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                    <span className="whitespace-nowrap">{dropOff.toLocaleDateString()}</span>
                                    {isActive ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 whitespace-nowrap">
                                            {t('dashboard.parent.inProgress')}
                                        </span>
                                    ) : duration && (
                                        <span className="flex items-center gap-1 whitespace-nowrap">
                                            <Clock className="w-3 h-3 flex-shrink-0" />
                                            <span className="hidden sm:inline">
                                                {t('dashboard.parent.duration', { hours: duration.hours, minutes: duration.minutes })}
                                            </span>
                                            <span className="sm:hidden">
                                                {duration.hours}h {duration.minutes}m
                                            </span>
                                        </span>
                                    )}
                                </div>
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 self-center" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    );
                })}
            </div>
            {data.hasMore && !showMore && (
                <button
                    onClick={() => setShowMore(true)}
                    className="mt-3 text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium py-2 sm:py-1"
                >
                    {t('dashboard.parent.seeMore')} <span className="whitespace-nowrap">({data.totalCount - 3} more)</span>
                </button>
            )}
        </div>
    );
}

