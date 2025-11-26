import { Calendar, Clock, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { DialogFooter } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { cn } from '~/lib/utils';

export interface VisitFormData {
    dropOffTime: Date;
    pickupTime?: Date;
    status: 'active' | 'completed' | 'cancelled';
    notes?: string;
}

interface VisitFormProps {
    mode: 'create' | 'edit';
    defaultValues?: Partial<VisitFormData>;
    onSubmit: (data: VisitFormData) => void;
    onCancel?: () => void;
    isLoading?: boolean;
}

export function VisitForm({
    mode,
    defaultValues,
    onSubmit,
    onCancel,
    isLoading = false,
}: VisitFormProps) {
    // Helper to handle timezone offset for datetime-local inputs
    const toLocalISOString = (date: Date) => {
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().slice(0, 16);
    };

    // Extract just the time part (HH:mm) from a date string or Date object
    const getTimeString = (dateValue?: Date | string) => {
        if (!dateValue) return '';
        const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const [formData, setFormData] = useState({
        dropOffTime: defaultValues?.dropOffTime
            ? new Date(defaultValues.dropOffTime)
            : new Date(),
        pickupTimeOnly: defaultValues?.pickupTime
            ? getTimeString(defaultValues.pickupTime)
            : '',
        status: defaultValues?.status || 'active',
        notes: defaultValues?.notes || '',
    });

    const [duration, setDuration] = useState<string>('');

    useEffect(() => {
        if (formData.pickupTimeOnly && formData.dropOffTime) {
            const [hours, minutes] = formData.pickupTimeOnly.split(':').map(Number);
            const pickupDate = new Date(formData.dropOffTime);
            pickupDate.setHours(hours || 0, minutes || 0, 0, 0);

            const diffMs = pickupDate.getTime() - formData.dropOffTime.getTime();
            if (diffMs > 0) {
                const diffHrs = Math.floor(diffMs / 3600000);
                const diffMins = Math.round((diffMs % 3600000) / 60000);
                setDuration(`${diffHrs}h ${diffMins > 0 ? `${diffMins}m` : ''}`);
            } else {
                setDuration('');
            }
        } else {
            setDuration('');
        }
    }, [formData.pickupTimeOnly, formData.dropOffTime]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // For drop-off, we use the existing date (from create or edit)
        const dropOffTime = formData.dropOffTime;

        // For pickup, we combine the drop-off date with the new time
        let pickupTime: Date | undefined;
        if (formData.pickupTimeOnly) {
            const [hours, minutes] = formData.pickupTimeOnly.split(':').map(Number);
            // Use the same date as drop-off for the pickup
            pickupTime = new Date(dropOffTime);
            pickupTime.setHours(hours || 0, minutes || 0, 0, 0);
        }

        onSubmit({
            dropOffTime,
            pickupTime,
            status: formData.status as 'active' | 'completed' | 'cancelled',
            notes: formData.notes || undefined,
        });
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const setQuickTime = (timeStr: string) => {
        setFormData(prev => ({
            ...prev,
            pickupTimeOnly: timeStr
        }));
    };

    const quickTimes = ['17:00', '18:00', '19:00', '20:00'];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Visual Drop-off Time Display */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                        <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-blue-600 font-medium">Drop-off Time</p>
                        <p className="text-lg font-bold text-gray-900">
                            {formData.dropOffTime.toLocaleTimeString(undefined, {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                        <p className="text-xs text-gray-500">
                            {formData.dropOffTime.toLocaleDateString(undefined, {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

            </div>

            <div className="space-y-3">
                <Label htmlFor="pickupTime" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pick-up Time
                    {duration && (
                        <span className="ml-auto text-xs font-normal text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full">
                            <Timer className="w-3 h-3" />
                            Duration: {duration}
                        </span>
                    )}
                </Label>
                <Input
                    id="pickupTimeOnly"
                    name="pickupTimeOnly"
                    type="time"
                    value={formData.pickupTimeOnly}
                    onChange={handleInputChange}
                    className="text-lg"
                />

                {/* Quick Select Chips */}
                <div className="flex flex-wrap gap-2">
                    {quickTimes.map((time) => (
                        <button
                            key={time}
                            type="button"
                            onClick={() => setQuickTime(time)}
                            className={cn(
                                "px-3 py-1 text-sm rounded-full border transition-colors",
                                formData.pickupTimeOnly === time
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                            )}
                        >
                            {time}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add any allergies, special instructions, or notes..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
            </div>

            <DialogFooter>
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                    {isLoading
                        ? mode === 'create'
                            ? 'Creating...'
                            : 'Updating...'
                        : mode === 'create'
                            ? 'Check In Child'
                            : 'Update Visit'}
                </Button>
            </DialogFooter>
        </form>
    );
}
