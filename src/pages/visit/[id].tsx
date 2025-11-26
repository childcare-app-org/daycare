import { Info } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { HealthCheck } from '~/components/dashboards/HealthCheck';
import { Button } from '~/components/ui/button';
import { VisitCareInfoModal } from '~/components/visit/VisitCareInfoModal';
import { VisitEventForm } from '~/components/visit/VisitEventForm';
import { VisitQuickAddGrid } from '~/components/visit/VisitQuickAddGrid';
import { VisitTimelineView } from '~/components/visit/VisitTimelineView';
import { api } from '~/utils/api';

import type { EventType } from '~/components/visit/eventTypes';
import type { VisitEventFormData } from '~/components/visit/VisitEventForm';
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
    const [showEventForm, setShowEventForm] = useState(false);
    const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
    const [showCareInfo, setShowCareInfo] = useState(false);

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

    const updateVisitMutation = api.visit.update.useMutation({
        onSuccess: () => {
            // Optional: show toast or success indicator
        },
    });

    // Auto-save handler for health check
    const handleHealthCheckUpdate = useDebounceCallback((data: Record<string, any>) => {
        if (!id) return;
        updateVisitMutation.mutate({
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
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session || session.user.role !== 'nurse') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Access denied. Nurse access required.</p>
                    <Link href="/dashboard">
                        <Button>Go to Dashboard</Button>
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
                <title>{visit.child?.name} - Visit Details</title>
                <meta name="description" content="Visit timeline and details" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
                <div className="container mx-auto px-4 py-8 max-w-3xl">
                    {/* Header with back navigation */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm" className="-ml-2">
                                    ← Back
                                </Button>
                            </Link>
                        </div>

                        <div className="flex items-center justify-center gap-3 mb-6">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {visit.child?.name}
                            </h1>
                            {(visit.child?.allergies || visit.child?.preexistingConditions) && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full border-blue-100 text-blue-600 bg-white shadow-sm hover:bg-blue-50"
                                    aria-label="View care information"
                                    onClick={() => setShowCareInfo(true)}
                                >
                                    <Info className="w-4 h-4" />
                                </Button>
                            )}
                        </div>


                        {/* Health Check Section */}
                        <div className="mb-8">
                            <HealthCheck
                                initialData={(visit.healthCheck as Record<string, any>) || {}}
                                onUpdate={handleHealthCheckUpdate}
                            />
                        </div>
                    </div>

                    {/* Timeline + Quick Add */}
                    <div className="space-y-6 bg-white rounded-3xl p-6 shadow-sm">
                        {/* Quick Add Grid */}
                        <VisitQuickAddGrid
                            onSelect={(eventType) => {
                                setSelectedEventType(eventType);
                                setShowEventForm(true);
                            }}
                        />

                        {/* Timeline Component */}
                        <VisitTimelineView logs={logs || []} />
                    </div>
                </div>

                {/* Event Creation Modal */}
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

