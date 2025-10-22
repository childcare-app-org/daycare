import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { DialogFooter } from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';

export interface RegisterVisitFormData {
    hospitalId: string;
    childId: string;
}

interface RegisterVisitFormProps {
    childId: string;
    childName: string;
    hospitals: Array<{ id: string; name: string; pricing: string }>;
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            hospitalId: selectedHospitalId,
            childId,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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
                    {hospitals.map((hospital) => (
                        <option key={hospital.id} value={hospital.id}>
                            {hospital.name} - ${hospital.pricing}/day
                        </option>
                    ))}
                </select>
                <p className="text-sm text-gray-500">
                    Choose the hospital where your child will stay
                </p>
            </div>

            <DialogFooter>
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Registering...' : 'Register Visit'}
                </Button>
            </DialogFooter>
        </form>
    );
}

