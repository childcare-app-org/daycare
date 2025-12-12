import { Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { VisitTimeAndNotesFields } from '~/components/forms/VisitTimeAndNotesFields';
import { Button } from '~/components/ui/button';
import { DialogFooter } from '~/components/ui/dialog';

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
    submitButtonText?: string;
}

export function VisitForm({
    mode,
    defaultValues,
    onSubmit,
    onCancel,
    isLoading = false,
    submitButtonText,
}: VisitFormProps) {
    const t = useTranslations();
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


    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Visual Drop-off Time Display */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                        <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-blue-600 font-medium">{t('visit.dropOffTime')}</p>
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

            <VisitTimeAndNotesFields
                pickupTimeOnly={formData.pickupTimeOnly}
                onPickupTimeChange={(time) => setFormData(prev => ({ ...prev, pickupTimeOnly: time }))}
                notes={formData.notes}
                onNotesChange={(notes) => setFormData(prev => ({ ...prev, notes }))}
                quickTimes={['17:00', '18:00', '19:00', '20:00']}
                showDuration={true}
                dropOffTime={formData.dropOffTime}
            />

            <DialogFooter>
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                        {t('common.cancel')}
                    </Button>
                )}
                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                    {isLoading
                        ? mode === 'create'
                            ? t('forms.visit.creating')
                            : t('forms.visit.updating')
                        : submitButtonText || (mode === 'create'
                            ? t('forms.visit.checkInChild')
                            : t('forms.visit.updateVisit'))}
                </Button>
            </DialogFooter>
        </form>
    );
}
