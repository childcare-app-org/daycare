import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { DialogFooter } from '~/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '~/components/ui/input-otp';
import { Label } from '~/components/ui/label';
import { useHospitalLocation } from '~/hooks/useHospitalLocation';
import { api } from '~/utils/api';
import { formatDistance } from '~/utils/geolocation';

export interface RegisterVisitFormData {
    hospitalId: string;
    childId: string;
    accessCode: string;
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

    // Multi-step form state
    const [currentStep, setCurrentStep] = useState<FormStep>('form');
    const [formData, setFormData] = useState<{ hospitalId: string; childId: string } | null>(null);
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
        setFormData({ hospitalId: selectedHospitalId, childId });
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
            <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label>Child</Label>
                    <div className="p-3 bg-gray-100 rounded-md border border-gray-200">
                        <p className="font-medium">{childName}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="hospitalId">Select Hospital *</Label>
                    <select
                        id="hospitalId"
                        value={selectedHospitalId}
                        onChange={(e) => setSelectedHospitalId(e.target.value)}
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value="">Choose a hospital...</option>
                        {sortedHospitals.map((hospital) => (
                            <option key={hospital.id} value={hospital.id}>
                                {hospital.name} - ${hospital.pricing}/day
                                {hospital.distance !== undefined && ` (${formatDistance(hospital.distance)})`}
                            </option>
                        ))}
                    </select>
                    <p className="text-sm text-gray-500">
                        Hospitals are sorted by distance from you. The nearest hospital is pre-selected.
                    </p>
                </div>

                <DialogFooter>
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading || !selectedHospitalId}>
                        Continue
                    </Button>
                </DialogFooter>
            </form>
        );
    }

    if (currentStep === 'pin') {
        const selectedHospital = sortedHospitals.find(h => h.id === formData?.hospitalId);

        return (
            <div className="space-y-6">
                <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Hospital Access Code</h3>
                    <p className="text-sm text-gray-600">
                        Please ask the hospital staff for today's 4-digit access code.
                    </p>
                    {selectedHospital && (
                        <p className="text-sm text-gray-500">
                            Hospital: <span className="font-medium">{selectedHospital.name}</span>
                        </p>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="flex justify-center">
                        <InputOTP
                            maxLength={4}
                            value={accessCode}
                            onChange={handlePinChange}
                            disabled={isValidatingPin}
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>

                    {pinError && (
                        <div className="text-center">
                            <p className="text-sm text-red-600">{pinError}</p>
                        </div>
                    )}

                    {isValidatingPin && (
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Validating code...</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleBackToForm}>
                        Back
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
            <div className="space-y-6">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-green-800">Access Code Verified!</h3>
                    <p className="text-sm text-gray-600">
                        Your visit registration has been successfully submitted.
                    </p>
                </div>

                <DialogFooter>
                    <Button onClick={handleSuccessSubmit} className="w-full">
                        Complete Registration
                    </Button>
                </DialogFooter>
            </div>
        );
    }

    return null;
}

