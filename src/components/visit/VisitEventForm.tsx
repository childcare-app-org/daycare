import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '~/components/ui/button';
import {
    Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';
import { cn } from '~/lib/utils';

import { VisitTagSelector } from './VisitTagSelector';

import type { EventType } from './eventTypes';
export type VisitEventFormData = {
    eventType: EventType | string;
    notes?: string;
    tags?: string[];
    temperature?: number;
};

type VisitEventFormProps = {
    visitId: string;
    isOpen: boolean;
    initialEventType?: EventType | string;
    isLoading: boolean;
    autoFocusNotes?: boolean;
    onSubmit: (data: VisitEventFormData) => void;
    onCancel: () => void;
};

export function VisitEventForm({
    visitId,
    isOpen,
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
        if (autoFocusNotes && notesRef.current && isOpen) {
            // Small delay to ensure dialog is fully rendered
            setTimeout(() => {
                notesRef.current?.focus();
            }, 100);
        }
    }, [autoFocusNotes, isOpen]);

    // Reset form when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setNotes('');
            setSelectedTags([]);
            setTemperature('');
        }
    }, [isOpen]);

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
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onCancel}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle>
                                {eventType ? `Add ${eventType} Event` : 'Add Event'}
                            </DialogTitle>
                        </div>
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full"
                                onClick={onCancel}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </Button>
                        </DialogClose>
                    </div>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 pb-4">
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
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <textarea
                                id="notes"
                                ref={notesRef}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className={cn(
                                    "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                )}
                                placeholder="Add any additional details..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Adding...' : 'Add Event'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


