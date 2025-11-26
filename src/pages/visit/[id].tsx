import { Info } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { HealthCheck } from '~/components/dashboards/HealthCheck';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Timeline, TimelineItem } from '~/components/ui/timeline';
import { api } from '~/utils/api';

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
    const [selectedEventType, setSelectedEventType] = useState<string | null>(null);

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

    const handleCreateEvent = (eventData: { eventType: string; notes?: string; tags?: string[]; temperature?: number }) => {
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
                            <Button variant="outline" size="icon" className="rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            </Button>
                        </div>

                        <div className="flex items-center justify-center gap-3 mb-6">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {visit.child?.name}
                            </h1>
                            {(visit.child?.allergies || visit.child?.preexistingConditions) && (
                                <div className="relative group">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-full border-blue-100 text-blue-600 bg-white shadow-sm hover:bg-blue-50"
                                        aria-label="View care information"
                                    >
                                        <Info className="w-4 h-4" />
                                    </Button>
                                    <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 hidden min-w-[220px] max-w-xs rounded-2xl bg-white px-4 py-3 text-left text-sm text-gray-700 shadow-lg ring-1 ring-black/5 group-hover:block">
                                        <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-white ring-1 ring-black/5" />
                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Care information
                                        </p>
                                        {visit.child?.allergies && (
                                            <div className="mb-1">
                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                    Allergies
                                                </span>
                                                <div>{visit.child.allergies}</div>
                                            </div>
                                        )}
                                        {visit.child?.preexistingConditions && (
                                            <div>
                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                    Conditions
                                                </span>
                                                <div>{visit.child.preexistingConditions}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
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
                        <QuickAddGrid
                            onSelect={(eventType) => {
                                setSelectedEventType(eventType);
                                setShowEventForm(true);
                            }}
                        />

                        {/* Timeline Component */}
                        <TimelineView logs={logs || []} />
                    </div>
                </div>

                {/* Event Creation Modal */}
                {showEventForm && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
                        onClick={() => {
                            setShowEventForm(false);
                            setSelectedEventType(null);
                        }}
                    >
                        <div
                            className="w-full max-w-md"
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <EventForm
                                visitId={id as string}
                                onSubmit={handleCreateEvent}
                                onCancel={() => {
                                    setShowEventForm(false);
                                    setSelectedEventType(null);
                                }}
                                isLoading={createLogMutation.isPending}
                                initialEventType={selectedEventType || undefined}
                                autoFocusNotes
                            />
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}

// Timeline Component
function TimelineView({ logs }: { logs: any[] }) {
    if (logs.length === 0) {
        return (
            <div className="py-12 text-center">
                <p className="text-gray-500 mb-2">No events recorded yet</p>
                <p className="text-xs text-gray-400">Click "+ Add" to start logging</p>
            </div>
        );
    }

    return (
        <Timeline>
            {logs.map((log) => (
                <TimelineItem
                    key={log.id}
                    date={new Date(log.timestamp)}
                    title={log.eventType}
                    description={typeof log.notes === 'string' ? log.notes : undefined}
                    author={log.nurse?.name}
                    log={log}
                    // You could dynamically assign icons based on eventType here
                    status="completed"
                />
            ))}
        </Timeline>
    );
}


// Event Form Component
function EventForm({
    visitId,
    onSubmit,
    onCancel,
    isLoading,
    initialEventType,
    autoFocusNotes = false,
}: {
    visitId: string;
    onSubmit: (data: { eventType: string; notes?: string; tags?: string[]; temperature?: number }) => void;
    onCancel: () => void;
    isLoading: boolean;
    initialEventType?: string;
    autoFocusNotes?: boolean;
}) {
    const [eventType, setEventType] = useState(initialEventType || '');
    const [notes, setNotes] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [temperature, setTemperature] = useState<string>('');
    const notesRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        setEventType(initialEventType || '');
    }, [initialEventType]);

    useEffect(() => {
        if (autoFocusNotes && notesRef.current) {
            notesRef.current.focus();
        }
    }, [autoFocusNotes]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (eventType.trim()) {
            const trimmedType = eventType.trim();

            const tagsFromTemperature =
                trimmedType === 'Temperature' && temperature.trim()
                    ? [`${temperature.trim()}°C`]
                    : [];

            const allTags = [...selectedTags, ...tagsFromTemperature];

            onSubmit({
                eventType: trimmedType,
                notes: notes.trim() || undefined,
                tags: allTags.length > 0 ? allTags : undefined,
                temperature:
                    trimmedType === 'Temperature' && temperature.trim()
                        ? Number.parseFloat(temperature)
                        : undefined,
            });
            setEventType('');
            setNotes('');
            setSelectedTags([]);
            setTemperature('');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {eventType ? `Add ${eventType} Event` : 'Add Event'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {eventType && eventType !== 'Note' && (
                        <TagSelector
                            eventType={eventType}
                            selectedTags={selectedTags}
                            onToggleTag={(tag) => {
                                setSelectedTags((prev) =>
                                    prev.includes(tag)
                                        ? prev.filter((t) => t !== tag)
                                        : [...prev, tag]
                                );
                            }}
                            temperature={temperature}
                            onTemperatureChange={setTemperature}
                        />
                    )}
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                        </label>
                        <textarea
                            id="notes"
                            ref={notesRef}
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

// Tag selector + temperature input for events
function TagSelector({
    eventType,
    selectedTags,
    onToggleTag,
    temperature,
    onTemperatureChange,
}: {
    eventType: string;
    selectedTags: string[];
    onToggleTag: (tag: string) => void;
    temperature: string;
    onTemperatureChange: (value: string) => void;
}) {
    const lower = eventType.toLowerCase();

    let suggestions: string[] = [];

    if (lower === 'pee') {
        suggestions = ['clear', 'yellow'];
    } else if (lower === 'poo') {
        suggestions = ['diarrhea', 'constipation', 'bloody'];
    } else if (lower === 'puke') {
        suggestions = ['after meal', 'projectile', 'mucus', 'with fever'];
    } else if (lower === 'eat') {
        suggestions = ['solid', 'bottle', 'hot', 'cold', 'finished all', 'ate a little'];
    } else if (lower === 'drink') {
        suggestions = ['hot', 'cold', 'water', 'juice', 'milk'];
    } else if (lower === 'medication') {
        suggestions = ['fever', 'pain', 'antibiotic', 'inhaler'];
    } else if (lower === 'slept') {
        suggestions = ['easy to sleep', 'restless', 'short nap', 'long nap'];
    } else if (lower === 'woke-up' || lower === 'woke up') {
        suggestions = ['happy', 'cranky', 'from nap', 'from night sleep'];
    }

    const showTemperatureInput = lower === 'temperature';

    if (suggestions.length === 0 && !showTemperatureInput) {
        return null;
    }

    return (
        <div className="space-y-3">
            {showTemperatureInput && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Temperature (°C)
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            step="0.1"
                            inputMode="decimal"
                            className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            value={temperature}
                            onChange={(e) => onTemperatureChange(e.target.value)}
                            placeholder="37.0"
                        />
                    </div>
                </div>
            )}

            {suggestions.length > 0 && (
                <div>
                    <div className="mb-2 text-xs font-medium text-gray-600">
                        Tags
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((tag) => {
                            const selected = selectedTags.includes(tag);
                            return (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => onToggleTag(tag)}
                                    className={`rounded-full px-3 py-1 text-xs border transition ${selected
                                        ? 'bg-purple-600 text-white border-purple-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {tag}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// Inline Quick Add Grid (above timeline)
function QuickAddGrid({
    onSelect,
}: {
    onSelect: (eventType: string) => void;
}) {
    const quickAddEvents: { label: string; category: 'Output' | 'Input' | 'State' | 'Other'; icon: string }[] = [
        { label: 'Pee', category: 'Output', icon: '💧' },
        { label: 'Poo', category: 'Output', icon: '💩' },
        { label: 'Puke', category: 'Output', icon: '🤢' },
        { label: 'Eat', category: 'Input', icon: '🍽️' },
        { label: 'Drink', category: 'Input', icon: '🥤' },
        { label: 'Medication', category: 'Input', icon: '💊' },
        { label: 'Slept', category: 'State', icon: '😴' },
        { label: 'Woke-up', category: 'State', icon: '🌅' },
        { label: 'Temperature', category: 'Other', icon: '🌡️' },
        { label: 'Note', category: 'Other', icon: '📝' },
    ];

    const getBadgeClasses = (category: 'Output' | 'Input' | 'State' | 'Other') => {
        switch (category) {
            case 'Output':
                return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
            case 'Input':
                return 'bg-sky-50 text-sky-700 border border-sky-100';
            case 'State':
                return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
            default:
                return 'bg-amber-50 text-amber-700 border border-amber-100';
        }
    };

    return (
        <div className="mb-4">
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                {quickAddEvents.map((item) => (
                    <button
                        key={item.label}
                        type="button"
                        className="flex flex-col items-center rounded-2xl bg-gray-50 px-2 py-2 text-[11px] font-medium text-gray-800 hover:bg-gray-100 active:scale-[0.97] transition"
                        onClick={() => onSelect(item.label)}
                    >
                        <div
                            className={`mb-1 flex h-9 w-9 items-center justify-center rounded-2xl text-[15px] ${getBadgeClasses(item.category)}`}
                        >
                            {item.icon}
                        </div>
                        <span className="truncate">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

