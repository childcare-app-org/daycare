import { Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { IntakeVisitDetails, REASON_OPTIONS } from '~/components/forms/IntakeVisitDetails';
import { Button } from '~/components/ui/button';
import { DialogFooter } from '~/components/ui/dialog';

import type {
    ReasonOption
} from '~/components/forms/IntakeVisitDetails';
export interface VisitFormData {
    dropOffTime: Date;
    pickupTime?: Date;
    status: 'active' | 'completed' | 'cancelled';
    reason?: string;
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

// Helper to parse reason string back into selected reasons and custom reason
function parseReasonString(reason?: string): { selectedReasons: ReasonOption[]; customReason: string } {
    if (!reason) {
        return { selectedReasons: [], customReason: '' };
    }

    const parts = reason.split(', ').map(s => s.trim()).filter(Boolean);
    const selectedReasons: ReasonOption[] = [];
    const customParts: string[] = [];

    // Known reason options (excluding 'other' which is just a UI trigger)
    const knownReasons = ['fever', 'asthmaRash', 'infectiousDisease', 'undiagnosed'];

    for (const part of parts) {
        if (knownReasons.includes(part)) {
            selectedReasons.push(part as ReasonOption);
        } else {
            customParts.push(part);
        }
    }

    const customReason = customParts.join(', ');
    // If there's a custom reason, add 'other' to show the textbox
    if (customReason) {
        selectedReasons.push('other');
    }

    return { selectedReasons, customReason };
}

// Helper to combine selected reasons and custom reason into a single string
function buildReasonString(selectedReasons: ReasonOption[], customReason: string): string {
    // Filter out 'other' as it's just a UI trigger, not a stored value
    const parts: string[] = selectedReasons.filter(r => r !== 'other');
    if (customReason.trim()) {
        parts.push(customReason.trim());
    }
    return parts.join(', ');
}

export function VisitForm({
    mode,
    defaultValues,
    onSubmit,
    onCancel,
    isLoading = false,
    submitButtonText,
}: VisitFormProps) {
    const router = useRouter();
    const t = useTranslations();
    const locale = router.locale || 'en';
    const [error, setError] = useState('');
    // Extract just the time part (HH:mm) from a date string or Date object
    const getTimeString = (dateValue?: Date | string) => {
        if (!dateValue) return '';
        const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const parsedReason = parseReasonString(defaultValues?.reason);

    const [formData, setFormData] = useState({
        dropOffTime: defaultValues?.dropOffTime
            ? new Date(defaultValues.dropOffTime)
            : new Date(),
        pickupTimeOnly: defaultValues?.pickupTime
            ? getTimeString(defaultValues.pickupTime)
            : '',
        status: defaultValues?.status || 'active',
        notes: defaultValues?.notes || '',
        selectedReasons: parsedReason.selectedReasons,
        customReason: parsedReason.customReason,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate pickup time is required
        if (!formData.pickupTimeOnly || !formData.pickupTimeOnly.trim()) {
            setError(t('validation.pleaseFillOutThisField'));
            return;
        }

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

        // Build reason string from selected reasons and custom reason
        const reason = buildReasonString(formData.selectedReasons, formData.customReason);

        setError('');
        onSubmit({
            dropOffTime,
            pickupTime,
            status: formData.status as 'active' | 'completed' | 'cancelled',
            reason: reason || undefined,
            notes: formData.notes || undefined,
        });
    };


    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Visual Drop-off Time Display */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                        <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-blue-600 font-medium">{t('visit.dropOffTime')}</p>
                        <p className="text-lg font-bold text-gray-900">
                            {formData.dropOffTime.toLocaleTimeString(locale, {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                        <p className="text-xs text-gray-500">
                            {formData.dropOffTime.toLocaleDateString(locale, {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                </div>
            </div>

            <IntakeVisitDetails
                pickupTimeOnly={formData.pickupTimeOnly}
                onPickupTimeChange={(time) => {
                    setFormData(prev => ({ ...prev, pickupTimeOnly: time }));
                    if (error) setError('');
                }}
                notes={formData.notes}
                onNotesChange={(notes) => setFormData(prev => ({ ...prev, notes }))}
                selectedReasons={formData.selectedReasons}
                onSelectedReasonsChange={(reasons) => setFormData(prev => ({ ...prev, selectedReasons: reasons }))}
                customReason={formData.customReason}
                onCustomReasonChange={(reason) => setFormData(prev => ({ ...prev, customReason: reason }))}
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
