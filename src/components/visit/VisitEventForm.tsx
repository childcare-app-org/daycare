import { useEffect, useRef, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

import { VisitTagSelector } from './VisitTagSelector';

export type VisitEventFormData = {
    eventType: string;
    notes?: string;
    tags?: string[];
    temperature?: number;
};

type VisitEventFormProps = {
    visitId: string;
    initialEventType?: string;
    isLoading: boolean;
    autoFocusNotes?: boolean;
    onSubmit: (data: VisitEventFormData) => void;
    onCancel: () => void;
};

export function VisitEventForm({
    visitId,
    onSubmit,
    onCancel,
    isLoading,
    initialEventType,
    autoFocusNotes = false,
}: VisitEventFormProps) {
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

            onSubmit({
                eventType: trimmedType,
                notes: notes.trim() || undefined,
                tags: selectedTags.length > 0 ? selectedTags : undefined,
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
                        <VisitTagSelector
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


