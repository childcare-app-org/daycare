import { Building2, Check, Clock, DollarSign, MapPin, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { DialogFooter } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '~/components/ui/input-otp';
import { Label } from '~/components/ui/label';
import { useHospitalLocation } from '~/hooks/useHospitalLocation';
import { cn } from '~/lib/utils';
import { api } from '~/utils/api';
import { formatDistance } from '~/utils/geolocation';

export interface RegisterVisitFormData {
    hospitalId: string;
    childId: string;
    accessCode: string;
    pickupTime: Date;
}

type FormStep = 'form' | 'pin' | 'success';

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
    const [selectedHospitalId, setSelectedHospitalId] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [pickupTimeOnly, setPickupTimeOnly] = useState('17:00'); // Default to 5 PM
    const [dropOffTime] = useState(new Date());

    // Multi-step form state
    const [currentStep, setCurrentStep] = useState<FormStep>('form');
    const [formData, setFormData] = useState<{ hospitalId: string; childId: string; pickupTime: Date } | null>(null);
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

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Calculate pickup time from time input
        const [hours, minutes] = pickupTimeOnly.split(':').map(Number);
        const pickupTime = new Date(dropOffTime);
        pickupTime.setHours(hours || 17, minutes || 0, 0, 0);

        setFormData({ hospitalId: selectedHospitalId, childId, pickupTime });
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
        onSubmit({
            hospitalId: formData!.hospitalId,
            childId: formData!.childId,
            accessCode,
            pickupTime: formData!.pickupTime,
        });
    };

    const handleBackToForm = () => {
        setCurrentStep('form');
        setAccessCode('');
        setPinError('');
        setIsValidatingPin(false);
    };

    // Render different steps
    if (currentStep === 'form') {
        return (
            <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-base">Select Hospital</Label>
                        <span className="text-xs text-muted-foreground">
                            Sorted by distance
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
                                                    <DollarSign className="w-3 h-3" />
                                                    {hospital.pricing}/day
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

                <div className="space-y-3">
                    <Label htmlFor="pickupTime" className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Pick-up Time
                    </Label>
                    <Input
                        id="pickupTime"
                        type="time"
                        value={pickupTimeOnly}
                        onChange={(e) => setPickupTimeOnly(e.target.value)}
                        className="text-lg"
                        required
                    />
                    <div className="flex flex-wrap gap-2">
                        {['09:00', '12:00', '15:00', '17:00', '18:00'].map((time) => (
                            <button
                                key={time}
                                type="button"
                                onClick={() => setPickupTimeOnly(time)}
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

                <DialogFooter>
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={isLoading || !selectedHospitalId || !pickupTimeOnly}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Continue
                    </Button>
                </DialogFooter>
            </form>
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
                    <h3 className="text-xl font-semibold text-gray-900">Enter Access Code</h3>
                    <p className="text-gray-500 max-w-[280px] mx-auto text-sm">
                        Please enter the 4-digit code provided by <span className="font-medium text-gray-900">{selectedHospital?.name}</span>
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
                                Validating code...
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="ghost" onClick={handleBackToForm}>
                        Back to Hospital Selection
                    </Button>
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
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
                        <h3 className="text-xl font-semibold text-gray-900">Verification Successful</h3>
                        <p className="text-gray-500 mt-2">
                            The access code has been verified. You can now proceed with the check-in.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSuccessSubmit} className="w-full bg-green-600 hover:bg-green-700 text-lg py-6">
                        Complete Check-in
                    </Button>
                </DialogFooter>
            </div>
        );
    }

    return null;
}

