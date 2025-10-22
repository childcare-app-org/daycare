import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { DialogFooter } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export interface NurseFormData {
    name: string;
    email: string;
    hospitalId: string;
}

interface NurseFormProps {
    mode: 'create' | 'edit';
    hospitalId: string;
    hospitalName: string;
    defaultValues?: Partial<Omit<NurseFormData, 'hospitalId'>>;
    onSubmit: (data: NurseFormData) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    emailDisabled?: boolean;
    emailDisabledMessage?: string;
}

export function NurseForm({
    mode,
    hospitalId,
    hospitalName,
    defaultValues,
    onSubmit,
    onCancel,
    isLoading = false,
    emailDisabled = false,
    emailDisabledMessage,
}: NurseFormProps) {
    const [formData, setFormData] = useState({
        name: defaultValues?.name || '',
        email: defaultValues?.email || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name: formData.name,
            email: formData.email,
            hospitalId,
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nurse Name *</Label>
                <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter nurse's full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nurse@hospital.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={emailDisabled}
                />
                {emailDisabledMessage && (
                    <p className="text-sm text-yellow-600">{emailDisabledMessage}</p>
                )}
                {!emailDisabled && (
                    <p className="text-sm text-gray-500">
                        The nurse will use this email to sign in
                    </p>
                )}
            </div>

            <DialogFooter>
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                    {isLoading
                        ? mode === 'create'
                            ? 'Creating...'
                            : 'Updating...'
                        : mode === 'create'
                            ? 'Create Nurse'
                            : 'Update'}
                </Button>
            </DialogFooter>
        </form>
    );
}

