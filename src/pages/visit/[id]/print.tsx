import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { HealthCheck } from '~/components/dashboards/HealthCheck';
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

                    {/* Timeline View */}
                    <div className="space-y-6 bg-white rounded-3xl p-6 shadow-sm">
                        <VisitTimelineView logs={logs || []} />
                    </div>
                </div>
            </main>
        </>
    );
}
