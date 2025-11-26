import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { HealthCheck } from '~/components/dashboards/HealthCheck';
import { Button } from '~/components/ui/button';
import { TemperatureChart } from '~/components/visit/TemperatureChart';
import { VisitCareInfoModal } from '~/components/visit/VisitCareInfoModal';
import { VisitHeader } from '~/components/visit/VisitHeader';
import { VisitTimelineView } from '~/components/visit/VisitTimelineView';
import { api } from '~/utils/api';

export default function ParentVisitDetail() {
    const router = useRouter();
    const { id } = router.query;
    const { data: session, status } = useSession();
    const [showCareInfo, setShowCareInfo] = useState(false);

    const { data: visit, isLoading: visitLoading } = api.visit.getByIdForParent.useQuery(
        { id: id as string },
        { enabled: !!id }
    );

    // Redirect if not authenticated or not a parent
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session || session.user.role !== 'parent') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Access denied. Parent access required.</p>
                    <Link href="/dashboard">
                        <Button>Go to Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (visitLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading visit details...</p>
                </div>
            </div>
        );
    }

    if (!visit) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Visit not found</p>
                    <Link href="/dashboard">
                        <Button>Go to Dashboard</Button>
                    </Link>
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
                <title>{visit.child?.name} - Visit Details</title>
                <meta name="description" content="Visit timeline and details" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
                <div className="container mx-auto px-4 py-8 max-w-3xl">
                    {/* Header with back navigation */}
                    <VisitHeader
                        visit={visit}
                        readOnly={true}
                        onShowCareInfo={() => setShowCareInfo(true)}
                    />

                    {/* Temperature Chart */}
                    <div className="mb-8">
                        <TemperatureChart logs={visit.logs || []} />
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
                        <VisitTimelineView logs={visit.logs || []} />
                    </div>
                </div>

                {/* Care Information Modal */}
                <VisitCareInfoModal
                    isOpen={showCareInfo}
                    onClose={() => setShowCareInfo(false)}
                    visit={visit}
                />
            </main>
        </>
    );
}

