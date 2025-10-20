import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { api } from '~/utils/api';

export default function VisitDetail() {
    const router = useRouter();
    const { id } = router.query;
    const { data: session, status } = useSession();
    const [showEventForm, setShowEventForm] = useState(false);

    const { data: visit, isLoading: visitLoading } = api.visit.getById.useQuery(
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
            refetchLogs();
        },
    });

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

    const handleCreateEvent = (eventData: { eventType: string; notes?: string }) => {
        createLogMutation.mutate({
            visitId: id as string,
            eventType: eventData.eventType,
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
                <div className="container mx-auto px-4 py-8">
                    {/* Header with back navigation */}
                    <div className="mb-8">
                        <Link href="/dashboard">
                            <Button variant="outline" className="mb-4">
                                ← Back to Dashboard
                            </Button>
                        </Link>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            {visit.child?.name}
                        </h1>
                        <p className="text-lg text-gray-600">
                            Visit Timeline - {visit.hospital?.name}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>Parent: {visit.parent?.name}</span>
                            <span>•</span>
                            <span>Dropped off: {new Date(visit.dropOffTime).toLocaleString()}</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                            </span>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-6">
                        {/* Add Event Button */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-semibold text-gray-900">Timeline</h2>
                            <Button onClick={() => setShowEventForm(true)}>
                                + Add Event
                            </Button>
                        </div>

                        {/* Timeline Component */}
                        <TimelineView logs={logs || []} />

                        {/* Event Creation Form */}
                        {showEventForm && (
                            <EventForm
                                visitId={id as string}
                                onSubmit={handleCreateEvent}
                                onCancel={() => setShowEventForm(false)}
                                isLoading={createLogMutation.isPending}
                            />
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}

// Timeline Component
function TimelineView({ logs }: { logs: any[] }) {
    if (logs.length === 0) {
        return (
            <Card>
                <CardContent className="py-12">
                    <div className="text-center">
                        <p className="text-gray-500 mb-4">No events recorded yet</p>
                        <p className="text-sm text-gray-400">Click "Add Event" to start logging activities</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-6">
                <div className="space-y-6">
                    {logs.map((log, index) => (
                        <div key={log.id} className="flex gap-4">
                            {/* Timeline dot and line */}
                            <div className="flex flex-col items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                                {index < logs.length - 1 && (
                                    <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>
                                )}
                            </div>

                            {/* Event content */}
                            <div className="flex-1 pb-6">
                                <div className="bg-white rounded-lg border p-4 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900">
                                            {log.eventType}
                                        </h3>
                                        <span className="text-sm text-gray-500">
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    {log.notes && (
                                        <p className="text-gray-600 text-sm">{log.notes}</p>
                                    )}
                                    <div className="mt-2 text-xs text-gray-400">
                                        Logged by {log.nurse?.name || 'Unknown'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// Event Form Component
function EventForm({
    visitId,
    onSubmit,
    onCancel,
    isLoading
}: {
    visitId: string;
    onSubmit: (data: { eventType: string; notes?: string }) => void;
    onCancel: () => void;
    isLoading: boolean;
}) {
    const [eventType, setEventType] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (eventType.trim()) {
            onSubmit({ eventType: eventType.trim(), notes: notes.trim() || undefined });
            setEventType('');
            setNotes('');
        }
    };

    const commonEventTypes = [
        'Meal Time',
        'Nap Time',
        'Play Time',
        'Diaper Change',
        'Temperature Check',
        'Medication Given',
        'Health Check',
        'Activity',
        'General Care',
        'Other'
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Event</CardTitle>
                <CardDescription>Log an activity or event for this child</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
                            Event Type
                        </label>
                        <select
                            id="eventType"
                            value={eventType}
                            onChange={(e) => setEventType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select an event type</option>
                            {commonEventTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                            Notes (Optional)
                        </label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Add any additional details..."
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Adding...' : 'Add Event'}
                        </Button>
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
