import { Clock, FileText, Stethoscope, Timer } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { cn } from '~/lib/utils';

// Predefined reasons for visit that can be quick-selected
const REASON_OPTIONS = ['fever', 'asthmaRash', 'infectiousDisease', 'undiagnosed', 'other'] as const;
type ReasonOption = typeof REASON_OPTIONS[number];

interface IntakeVisitDetailsProps {
    pickupTimeOnly: string;
    onPickupTimeChange: (time: string) => void;
    notes: string;
    onNotesChange: (notes: string) => void;
    selectedReasons: ReasonOption[];
    onSelectedReasonsChange: (reasons: ReasonOption[]) => void;
    customReason: string;
    onCustomReasonChange: (reason: string) => void;
    quickTimes?: string[];
    showDuration?: boolean;
    dropOffTime?: Date;
}

export function IntakeVisitDetails({
    pickupTimeOnly,
    onPickupTimeChange,
    notes,
    onNotesChange,
    selectedReasons,
    onSelectedReasonsChange,
    customReason,
    onCustomReasonChange,
    quickTimes = ['09:00', '12:00', '15:00', '17:00', '18:00'],
    showDuration = false,
    dropOffTime,
}: IntakeVisitDetailsProps) {
    const t = useTranslations();

    // Calculate duration if needed
    const duration = showDuration && pickupTimeOnly && dropOffTime ? (() => {
        const [hours, minutes] = pickupTimeOnly.split(':').map(Number);
        const pickupDate = new Date(dropOffTime);
        pickupDate.setHours(hours || 0, minutes || 0, 0, 0);
        const diffMs = pickupDate.getTime() - dropOffTime.getTime();
        if (diffMs > 0) {
            const diffHrs = Math.floor(diffMs / 3600000);
            const diffMins = Math.round((diffMs % 3600000) / 60000);
            return `${diffHrs}h ${diffMins > 0 ? `${diffMins}m` : ''}`;
        }
        return '';
    })() : '';

    const toggleReason = (reason: ReasonOption) => {
        if (selectedReasons.includes(reason)) {
            onSelectedReasonsChange(selectedReasons.filter(r => r !== reason));
        } else {
            onSelectedReasonsChange([...selectedReasons, reason]);
        }
    };

    return (
        <>
            {/* Reason for Visit */}
            <div className="space-y-3">
                <Label className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    {t('visit.reasonForVisit')}
                </Label>
                <div className="flex flex-wrap gap-2">
                    {REASON_OPTIONS.map((reason) => (
                        <button
                            key={reason}
                            type="button"
                            onClick={() => toggleReason(reason)}
                            className={cn(
                                "px-3 py-1.5 text-sm rounded-full border transition-colors",
                                selectedReasons.includes(reason)
                                    ? "bg-orange-600 text-white border-orange-600"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                            )}
                        >
                            {t(`visit.reasons.${reason}`)}
                        </button>
                    ))}
                </div>
                {selectedReasons.includes('other') && (
                    <Input
                        type="text"
                        value={customReason}
                        onChange={(e) => onCustomReasonChange(e.target.value)}
                        placeholder={t('visit.customReasonPlaceholder')}
                        className="mt-2"
                        autoFocus
                    />
                )}
            </div>

            {/* Pickup Time */}
            <div className="space-y-3">
                <Label htmlFor="pickupTime" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {t('visit.pickUpTime')}
                    {duration && (
                        <span className="ml-auto text-xs font-normal text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full">
                            <Timer className="w-3 h-3" />
                            {t('visit.duration')}: {duration}
                        </span>
                    )}
                </Label>
                <Input
                    id="pickupTime"
                    type="time"
                    value={pickupTimeOnly}
                    onChange={(e) => onPickupTimeChange(e.target.value)}
                    className="text-lg"
                    required
                />
                <div className="flex flex-wrap gap-2">
                    {quickTimes.map((time) => (
                        <button
                            key={time}
                            type="button"
                            onClick={() => onPickupTimeChange(time)}
                            className={cn(
                                "px-3 py-1 text-sm rounded-full border transition-colors",
                                pickupTimeOnly === time
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                            )}
                        >
                            {time}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {t('visit.notes')}
                </Label>
                <textarea
                    id="notes"
                    name="notes"
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder={t('forms.visit.notesPlaceholder')}
                    rows={3}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
            </div>
        </>
    );
}

// Export the reason options for use in other components
export { REASON_OPTIONS };
export type { ReasonOption };
