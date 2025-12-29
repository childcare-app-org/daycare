import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { HealthCheck } from '~/components/dashboards/HealthCheck';
import { Button } from '~/components/ui/button';
import { CompleteVisitModal } from '~/components/visit/CompleteVisitModal';
import { EventType } from '~/components/visit/eventTypes';
import { SIDSTimeline } from '~/components/visit/SIDSTimeline';
import { VisitCareInfoModal } from '~/components/visit/VisitCareInfoModal';
import { VisitEventForm } from '~/components/visit/VisitEventForm';
import { VisitHeader } from '~/components/visit/VisitHeader';
import { VisitQuickAddGrid } from '~/components/visit/VisitQuickAddGrid';
import { VisitTimelineView } from '~/components/visit/VisitTimelineView';
import { api } from '~/utils/api';

import type { VisitEventFormData } from '~/components/visit/VisitEventForm';

export async function getServerSideProps(context: { locale: string }) {
    return {
        props: {
            messages: (await import(`~/locales/${context.locale}.json`)).default
        }
    };
}

// Simple debounce hook implementation if not present
function useDebounceCallback<T extends (...args: any[]) => any>(callback: T, delay: number) {
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    return (...args: Parameters<T>) => {
        if (timeoutId) clearTimeout(timeoutId);
        const id = setTimeout(() => callback(...args), delay);
        setTimeoutId(id);
    };
}

export default function VisitDetail() {
    const router = useRouter();
    const { id } = router.query;
    const { data: session, status } = useSession();
    const t = useTranslations();
    const [showEventForm, setShowEventForm] = useState(false);
    const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
    const [showCareInfo, setShowCareInfo] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);

    const { data: visit, isLoading: visitLoading, refetch: refetchVisit } = api.visit.getById.useQuery(
        { id: id as string },
        { enabled: !!id }
    );

    const { data: logs, isLoading: logsLoading, refetch: refetchLogs } = api.logs.getByVisit.useQuery(
        { visitId: id as string },
        { enabled: !!id }
    );

    const createLogMutation = api.logs.create.useMutation({
        onSuccess: () => {
            setShowEventForm(false);
            setSelectedEventType(null);
            refetchLogs();
        },
    });

    // SIDS auto-log handler
    const handleSIDSLog = () => {
        if (!id) return;
        createLogMutation.mutate({
            visitId: id as string,
            eventType: EventType.SIDS,
            eventData: {},
            notes: undefined,
        });
    };

    const updateHealthCheckMutation = api.visit.update.useMutation({
        onSuccess: () => {
            refetchVisit();
        },
    });

    const completeVisitMutation = api.visit.update.useMutation({
        onSuccess: () => {
            setShowCompleteModal(false);
            refetchVisit();
        },
    });

    const generateSummaryMutation = api.visit.generateSummary.useMutation();

    const handleGenerateSummary = async () => {
        if (!id) return '';
        try {
            const result = await generateSummaryMutation.mutateAsync({
                id: id as string,
                locale: router.locale || 'en'
            });
            return result.summary;
        } catch (error) {
            console.error('Failed to generate summary:', error);
            return '';
        }
    };

    const handleCompleteVisit = (summary: string) => {
        if (!id) return;
        completeVisitMutation.mutate({
            id: id as string,
            status: 'completed',
            notes: summary || undefined,
        });
    };

    const handlePrint = () => {
        // Open print view in a new window with locale preserved
        if (!id) return;
        const locale = router.locale || 'en';
        window.open(`/${locale}/visit/${id}/print`, '_blank');
    };

    // Auto-save handler for health check
    const handleHealthCheckUpdate = useDebounceCallback((data: Record<string, any>) => {
        if (!id) return;
        updateHealthCheckMutation.mutate({
            id: id as string,
            healthCheck: data,
        });
    }, 1000); // 1 second debounce

    // Redirect if not authenticated or not a nurse
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (!session || session.user.role !== 'nurse') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">{t('visit.accessDenied')}</p>
                    <Link href="/dashboard">
                        <Button>{t('common.goToDashboard')}</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (visitLoading || logsLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('visit.loadingVisitDetails')}</p>
                </div>
            </div>
        );
    }

    if (!visit) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">{t('visit.visitNotFound')}</p>
                    <Link href="/dashboard">
                        <Button>{t('common.goToDashboard')}</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const handleCreateEvent = (eventData: VisitEventFormData) => {
        const eventDataPayload: Record<string, any> = {};
        if (eventData.tags && eventData.tags.length > 0) {
            eventDataPayload.tags = eventData.tags;
        }
        if (typeof eventData.temperature === 'number') {
            eventDataPayload.temperature = eventData.temperature;
        }

        createLogMutation.mutate({
            visitId: id as string,
            eventType: eventData.eventType,
            eventData: eventDataPayload,
            notes: eventData.notes,
        });
    };

    return (
        <>
            <Head>
                <title>{visit.child?.name} - {t('visit.visitDetails')}</title>
                <meta name="description" content={t('visit.visitTimelineDescription')} />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
                <div className="container mx-auto px-4 py-8 max-w-3xl">
                    {/* Header with back navigation */}
                    <VisitHeader
                        visit={visit}
                        readOnly={visit.status === 'completed'}
                        onShowCompleteModal={() => setShowCompleteModal(true)}
                        onShowCareInfo={() => setShowCareInfo(true)}
                        onPrint={handlePrint}
                    />

                    {/* Health Check Section */}
                    <div className="mb-8">
                        <HealthCheck
                            initialData={(visit.healthCheck as Record<string, any>) || {}}
                            onUpdate={handleHealthCheckUpdate}
                            readOnly={visit.status === 'completed'}
                        />
                    </div>

                    {/* SIDS Timeline - Only show if there are SIDS logs */}
                    {(() => {
                        const sidsLogs = (logs || []).filter(log => log.eventType === EventType.SIDS);
                        return sidsLogs.length > 0 ? (
                            <SIDSTimeline
                                logs={sidsLogs}
                                showMinutesAgo={visit.status === 'active'}
                            />
                        ) : null;
                    })()}

                    {/* Timeline + Quick Add */}
                    <div className="space-y-6 bg-white rounded-3xl p-6 shadow-sm">
                        {/* Quick Add Grid */}
                        {visit.status === 'active' && (
                            <VisitQuickAddGrid
                                onSelect={(eventType) => {
                                    setSelectedEventType(eventType);
                                    setShowEventForm(true);
                                }}
                                onSIDSLog={handleSIDSLog}
                            />
                        )}

                        {/* Timeline Component - Filter out SIDS events */}
                        <VisitTimelineView logs={(logs || []).filter(log => log.eventType !== EventType.SIDS)} />
                    </div>
                </div>

                {/* Event Creation Modal - Only show for active visits */}
                {visit.status === 'active' && (
                    <VisitEventForm
                        visitId={id as string}
                        isOpen={showEventForm}
                        onSubmit={handleCreateEvent}
                        onCancel={() => {
                            setShowEventForm(false);
                            setSelectedEventType(null);
                        }}
                        isLoading={createLogMutation.isPending}
                        initialEventType={selectedEventType || undefined}
                        autoFocusNotes
                    />
                )}

                {/* Care Information Modal */}
                <VisitCareInfoModal
                    isOpen={showCareInfo}
                    onClose={() => setShowCareInfo(false)}
                    visit={visit}
                />

                {/* Complete Visit Modal */}
                <CompleteVisitModal
                    isOpen={showCompleteModal}
                    onClose={() => setShowCompleteModal(false)}
                    onConfirm={handleCompleteVisit}
                    isLoading={completeVisitMutation.isPending}
                    onGenerateSummary={handleGenerateSummary}
                    isGeneratingSummary={generateSummaryMutation.isPending}
                />
            </main>
        </>
    );
}

