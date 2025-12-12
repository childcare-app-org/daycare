import { Building2, Check, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { VisitForm } from '~/components/forms/VisitForm';
import { Button } from '~/components/ui/button';
import { DialogFooter } from '~/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '~/components/ui/input-otp';
import { Label } from '~/components/ui/label';
import { useHospitalLocation } from '~/hooks/useHospitalLocation';
import { cn } from '~/lib/utils';
import { api } from '~/utils/api';
import { formatDistance } from '~/utils/geolocation';

import type { VisitFormData } from '~/components/forms/VisitForm';

export interface RegisterVisitFormData {
    hospitalId: string;
    childId: string;
    accessCode: string;
    pickupTime: Date;
    notes?: string;
}

type FormStep = 'hospital' | 'visit-details' | 'pin' | 'success';

interface Hospital {
    id: string;
    name: string;
    pricing: string;
    latitude?: string | null;
    longitude?: string | null;
}

interface HospitalWithDistance extends Hospital {
    distance?: number;
}

interface RegisterVisitFormProps {
    childId: string;
    childName: string;
    hospitals: Hospital[];
    onSubmit: (data: RegisterVisitFormData) => void;
    onCancel?: () => void;
    isLoading?: boolean;
}

export function RegisterVisitForm({
    childId,
    childName,
    hospitals,
    onSubmit,
    onCancel,
    isLoading = false,
}: RegisterVisitFormProps) {
    const t = useTranslations();
    const [selectedHospitalId, setSelectedHospitalId] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [dropOffTime] = useState(new Date());

    // Multi-step form state
    const [currentStep, setCurrentStep] = useState<FormStep>('hospital');
    const [formData, setFormData] = useState<{ hospitalId: string; childId: string; pickupTime: Date; notes?: string } | null>(null);
    const [visitFormData, setVisitFormData] = useState<{ pickupTime: Date; notes?: string } | null>(null);
    const [pinError, setPinError] = useState('');
    const [isValidatingPin, setIsValidatingPin] = useState(false);

    // Use the hospital location hook
    const { sortedHospitals, nearestHospitalId } = useHospitalLocation(hospitals);

    // Auto-select nearest hospital when available
    useEffect(() => {
        if (nearestHospitalId && !selectedHospitalId) {
            setSelectedHospitalId(nearestHospitalId);
        }
    }, [nearestHospitalId, selectedHospitalId]);

    // API mutation for validating access code
    const validateAccessCodeMutation = api.hospital.validateAccessCode.useMutation({
        onSuccess: () => {
            setCurrentStep('success');
            setPinError('');
        },
        onError: (error) => {
            setPinError(error.message);
            setAccessCode('');
        },
        onSettled: () => {
            setIsValidatingPin(false);
        },
    });

    const handleHospitalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHospitalId) return;
        setFormData({ hospitalId: selectedHospitalId, childId, pickupTime: new Date(), notes: undefined });
        setCurrentStep('visit-details');
    };

    const handleVisitFormSubmit = (data: { dropOffTime: Date; pickupTime?: Date; status: 'active' | 'completed' | 'cancelled'; notes?: string }) => {
        if (!formData) return;
        const pickupTime = data.pickupTime || new Date();
        setVisitFormData({ pickupTime, notes: data.notes });
        setFormData({ ...formData, pickupTime, notes: data.notes });
        setCurrentStep('pin');
        setPinError('');
    };

    const handlePinChange = (value: string) => {
        setAccessCode(value);
        setPinError('');

        // Auto-submit when 4 digits are entered
        if (value.length === 4) {
            setIsValidatingPin(true);
            validateAccessCodeMutation.mutate({
                hospitalId: formData!.hospitalId,
                accessCode: value,
            });
        }
    };

    const handleSuccessSubmit = () => {
        if (!formData || !visitFormData) return;
        onSubmit({
            hospitalId: formData.hospitalId,
            childId: formData.childId,
            accessCode,
            pickupTime: visitFormData.pickupTime,
            notes: visitFormData.notes,
        });
    };

    const handleBackToHospital = () => {
        setCurrentStep('hospital');
        setAccessCode('');
        setPinError('');
        setIsValidatingPin(false);
    };

    const handleBackToVisitDetails = () => {
        setCurrentStep('visit-details');
        setAccessCode('');
        setPinError('');
        setIsValidatingPin(false);
    };

    // Render different steps
    if (currentStep === 'hospital') {
        return (
            <form onSubmit={handleHospitalSubmit} className="space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-base">{t('forms.registerVisit.selectHospital')}</Label>
                        <span className="text-xs text-muted-foreground">
                            {t('forms.registerVisit.sortedByDistance')}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2">
                        {sortedHospitals.map((hospital) => {
                            const isSelected = selectedHospitalId === hospital.id;
                            return (
                                <div
                                    key={hospital.id}
                                    onClick={() => setSelectedHospitalId(hospital.id)}
                                    className={cn(
                                        "relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:border-blue-200 hover:bg-blue-50/50",
                                        isSelected
                                            ? "border-blue-600 bg-blue-50 shadow-sm"
                                            : "border-gray-200 bg-white"
                                    )}
                                >
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 text-blue-600">
                                            <Check className="w-5 h-5" />
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3">
                                        <div className={cn(
                                            "mt-1 p-2 rounded-lg",
                                            isSelected ? "bg-blue-200 text-blue-700" : "bg-gray-100 text-gray-500"
                                        )}>
                                            <Building2 className="w-5 h-5" />
                                        </div>

                                        <div className="space-y-1">
                                            <h4 className={cn("font-semibold", isSelected ? "text-blue-900" : "text-gray-900")}>
                                                {hospital.name}
                                            </h4>

                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    {t('common.currencySymbol')}{Math.round(parseFloat(hospital.pricing))}{t('forms.registerVisit.perDay')}
                                                </span>
                                                {hospital.distance !== undefined && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {formatDistance(hospital.distance)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <DialogFooter>
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                            {t('common.cancel')}
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={isLoading || !selectedHospitalId}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {t('common.continue')}
                    </Button>
                </DialogFooter>
            </form>
        );
    }

    if (currentStep === 'visit-details') {
        return (
            <div className="space-y-6">
                <VisitForm
                    mode="create"
                    defaultValues={{
                        dropOffTime: dropOffTime,
                        status: 'active',
                    }}
                    onSubmit={handleVisitFormSubmit}
                    onCancel={handleBackToHospital}
                    isLoading={false}
                    submitButtonText={t('common.continue')}
                />
            </div>
        );
    }

    if (currentStep === 'pin') {
        const selectedHospital = sortedHospitals.find(h => h.id === formData?.hospitalId);

        return (
            <div className="space-y-8 py-4">
                <div className="text-center space-y-3">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{t('forms.registerVisit.enterAccessCode')}</h3>
                    <p className="text-gray-500 max-w-[280px] mx-auto text-sm">
                        {t('forms.registerVisit.enterAccessCodeDescription', { hospital: selectedHospital?.name || '' })}
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-center">
                        <InputOTP
                            maxLength={4}
                            value={accessCode}
                            onChange={handlePinChange}
                            disabled={isValidatingPin}
                            autoFocus
                        >
                            <InputOTPGroup className="gap-2">
                                {[0, 1, 2, 3].map((index) => (
                                    <InputOTPSlot
                                        key={index}
                                        index={index}
                                        className="w-14 h-16 text-2xl border-2 rounded-lg data-[active=true]:border-blue-600 data-[active=true]:ring-blue-200"
                                    />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>
                    </div>

                    <div className="min-h-[24px] text-center">
                        {pinError && (
                            <p className="text-sm text-red-600 font-medium animate-in fade-in slide-in-from-top-1">
                                {pinError}
                            </p>
                        )}
                        {isValidatingPin && (
                            <p className="text-sm text-blue-600 animate-pulse">
                                {t('forms.registerVisit.validatingCode')}
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="ghost" onClick={handleBackToVisitDetails}>
                        {t('forms.registerVisit.backToVisitDetails')}
                    </Button>
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            {t('common.cancel')}
                        </Button>
                    )}
                </DialogFooter>
            </div>
        );
    }

    if (currentStep === 'success') {
        return (
            <div className="py-8 space-y-8">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-300">
                        <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">{t('forms.registerVisit.verificationSuccessful')}</h3>
                        <p className="text-gray-500 mt-2">
                            {t('forms.registerVisit.verificationSuccessfulDescription')}
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSuccessSubmit} className="w-full bg-green-600 hover:bg-green-700 text-lg py-6">
                        {t('forms.registerVisit.completeCheckIn')}
                    </Button>
                </DialogFooter>
            </div>
        );
    }

    return null;
}

