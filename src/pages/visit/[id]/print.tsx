import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { HealthCheck } from '~/components/dashboards/HealthCheck';
import { EventType } from '~/components/visit/eventTypes';
import { SIDSTimeline } from '~/components/visit/SIDSTimeline';
import { TemperatureChart } from '~/components/visit/TemperatureChart';
import { VisitHeader } from '~/components/visit/VisitHeader';
import { VisitTimelineView } from '~/components/visit/VisitTimelineView';
import { api } from '~/utils/api';

export async function getServerSideProps(context: { locale: string }) {
    return {
        props: {
            messages: (await import(`~/locales/${context.locale}.json`)).default
        }
    };
}

export default function VisitPrint() {
    const router = useRouter();
    const { id } = router.query;
    const { data: session, status } = useSession();
    const t = useTranslations();
    const locale = router.locale || 'en';

    const { data: visit, isLoading: visitLoading } = api.visit.getById.useQuery(
        { id: id as string },
        { enabled: !!id }
    );

    const { data: logs, isLoading: logsLoading } = api.logs.getByVisit.useQuery(
        { visitId: id as string },
        { enabled: !!id }
    );

    // Auto-trigger print when page loads
    useEffect(() => {
        if (visit && logs && !visitLoading && !logsLoading) {
            // Small delay to ensure page is fully rendered
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [visit, logs, visitLoading, logsLoading]);

    // Redirect if not authenticated
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
                </div>
            </div>
        );
    }

    // Dummy handler for read-only mode (won't be called)
    const handleHealthCheckUpdate = () => {
        // No-op in read-only mode
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
                    {/* Header */}
                    <VisitHeader
                        visit={visit}
                        readOnly={true}
                    />

                    {/* Child Details - Print Only */}
                    <div className="mb-8 hidden print:block">
                        <div className="bg-white rounded-xl border border-gray-300 p-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('visit.childDetails')}</h2>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                {/* Child Name & Pronunciation */}
                                <div>
                                    <span className="text-gray-500">{t('common.name')}:</span>{' '}
                                    <span className="font-medium">{visit.child?.name}</span>
                                    {visit.child?.pronunciation && (
                                        <span className="text-gray-500 italic"> ({visit.child.pronunciation})</span>
                                    )}
                                </div>

                                {/* Gender */}
                                {visit.child?.gender && (
                                    <div>
                                        <span className="text-gray-500">{t('dashboard.parent.gender')}:</span>{' '}
                                        <span className="font-medium">{visit.child.gender}</span>
                                    </div>
                                )}

                                {/* Hospital */}
                                {visit.hospital?.name && (
                                    <div>
                                        <span className="text-gray-500">{t('visit.hospital')}:</span>{' '}
                                        <span className="font-medium">{visit.hospital.name}</span>
                                    </div>
                                )}

                                {/* Drop-off Time */}
                                <div>
                                    <span className="text-gray-500">{t('visit.dropOffTime')}:</span>{' '}
                                    <span className="font-medium">
                                        {new Date(visit.dropOffTime).toLocaleString(locale, {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>

                                {/* Pick-up Time */}
                                {visit.pickupTime && (
                                    <div>
                                        <span className="text-gray-500">{t('visit.pickUpTime')}:</span>{' '}
                                        <span className="font-medium">
                                            {new Date(visit.pickupTime).toLocaleString(locale, {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                )}

                                {/* Parent Contact */}
                                {visit.parent && (
                                    <div>
                                        <span className="text-gray-500">{t('visit.parentContact')}:</span>{' '}
                                        <span className="font-medium">
                                            {visit.parent.name} {visit.parent.phoneNumber && `(${visit.parent.phoneNumber})`}
                                        </span>
                                    </div>
                                )}

                                {/* Family Doctor */}
                                {visit.child?.familyDoctorName && (
                                    <div>
                                        <span className="text-gray-500">{t('forms.child.familyDoctorName')}:</span>{' '}
                                        <span className="font-medium">
                                            {visit.child.familyDoctorName} {visit.child.familyDoctorPhone && `(${visit.child.familyDoctorPhone})`}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Visit Notes / Summary */}
                            {visit.notes && (
                                <div className="mt-4 pt-3 border-t border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-1">{t('visit.notes')}:</h3>
                                    <p className="text-gray-800 whitespace-pre-wrap">{visit.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Temperature Chart */}
                    <div className="mb-8">
                        <TemperatureChart logs={logs || []} />
                    </div>

                    {/* Health Check Section - Read Only */}
                    <div className="mb-8">
                        <HealthCheck
                            initialData={(visit.healthCheck as Record<string, any>) || {}}
                            onUpdate={handleHealthCheckUpdate}
                            readOnly={true}
                        />
                    </div>

                    {/* SIDS Timeline - Only show if there are SIDS logs */}
                    {(() => {
                        const sidsLogs = (logs || []).filter(log => log.eventType === EventType.SIDS);
                        return sidsLogs.length > 0 ? (
                            <SIDSTimeline logs={sidsLogs} showMinutesAgo={false} />
                        ) : null;
                    })()}

                    {/* Timeline View - Filter out SIDS events */}
                    <div className="space-y-6 bg-white rounded-3xl p-6 shadow-sm">
                        <VisitTimelineView logs={(logs || []).filter(log => log.eventType !== EventType.SIDS)} />
                    </div>
                </div>
            </main>
        </>
    );
}
