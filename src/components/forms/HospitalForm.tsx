import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { DialogFooter } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

import { GoogleAddressAutocompleteNew } from './GoogleAddressAutocompleteNew';

import type { AddressData } from './GoogleAddressAutocompleteNew';
export interface HospitalFormData {
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
    capacity: number;
    pricing: number;
}

interface HospitalFormProps {
    mode: 'create' | 'edit';
    defaultValues?: Partial<HospitalFormData>;
    onSubmit: (data: HospitalFormData) => void;
    onCancel?: () => void;
    isLoading?: boolean;
}

export function HospitalForm({
    mode,
    defaultValues,
    onSubmit,
    onCancel,
    isLoading = false,
}: HospitalFormProps) {
    const [formData, setFormData] = useState({
        name: defaultValues?.name || '',
        address: defaultValues?.address || '',
        latitude: defaultValues?.latitude,
        longitude: defaultValues?.longitude,
        capacity: defaultValues?.capacity?.toString() || '20',
        pricing: defaultValues?.pricing?.toString() || '0',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name: formData.name,
            address: formData.address,
            latitude: formData.latitude,
            longitude: formData.longitude,
            capacity: parseInt(formData.capacity),
            pricing: parseFloat(formData.pricing),
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddressChange = (addressData: AddressData) => {
        setFormData((prev) => ({
            ...prev,
            address: addressData.address,
            latitude: addressData.latitude,
            longitude: addressData.longitude,
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Hospital Name *</Label>
                <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter hospital name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <GoogleAddressAutocompleteNew
                id="address"
                label="Address / 住所"
                value={formData.address}
                onChange={handleAddressChange}
                required
                placeholder="Enter the hospital address"
                helperText="Suggestions will appear as you type the address"
                country="JP"
            />

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity *</Label>
                    <Input
                        id="capacity"
                        name="capacity"
                        type="number"
                        placeholder="20"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        required
                        min="1"
                    />
                    <p className="text-sm text-gray-500">Maximum number of children</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="pricing">Daily Pricing *</Label>
                    <Input
                        id="pricing"
                        name="pricing"
                        type="number"
                        step="0.01"
                        placeholder="150.00"
                        value={formData.pricing}
                        onChange={handleInputChange}
                        required
                        min="0"
                    />
                    <p className="text-sm text-gray-500">Cost per day in dollars</p>
                </div>
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
                            ? 'Create Hospital'
                            : 'Update'}
                </Button>
            </DialogFooter>
        </form>
    );
}

