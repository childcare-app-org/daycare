import { useTranslations } from 'next-intl';
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
    phoneNumber: string;
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
    const t = useTranslations();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: defaultValues?.name || '',
        address: defaultValues?.address || '',
        phoneNumber: defaultValues?.phoneNumber || '',
        latitude: defaultValues?.latitude,
        longitude: defaultValues?.longitude,
        capacity: defaultValues?.capacity?.toString() || '20',
        pricing: defaultValues?.pricing?.toString() || '0',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.name.trim()) {
            setError(t('validation.nameRequired'));
            return;
        }
        if (!formData.address.trim()) {
            setError(t('validation.pleaseFillOutThisField'));
            return;
        }
        if (!formData.phoneNumber.trim()) {
            setError(t('validation.pleaseFillOutThisField'));
            return;
        }
        if (!formData.capacity || parseInt(formData.capacity) < 1) {
            setError(t('validation.pleaseFillOutThisField'));
            return;
        }
        if (!formData.pricing || parseFloat(formData.pricing) < 0) {
            setError(t('validation.pleaseFillOutThisField'));
            return;
        }

        setError('');
        onSubmit({
            name: formData.name,
            address: formData.address,
            phoneNumber: formData.phoneNumber,
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
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="name">{t('forms.hospital.name')}</Label>
                <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={t('forms.hospital.namePlaceholder')}
                    value={formData.name}
                    onChange={(e) => {
                        handleInputChange(e);
                        if (error) setError('');
                    }}
                />
            </div>

            <GoogleAddressAutocompleteNew
                id="address"
                label={t('forms.hospital.address')}
                value={formData.address}
                onChange={(data) => {
                    handleAddressChange(data);
                    if (error) setError('');
                }}
                placeholder={t('forms.hospital.addressPlaceholder')}
                helperText={t('forms.hospital.addressHelperText')}
                country="JP"
            />

            <div className="space-y-2">
                <Label htmlFor="phoneNumber">{t('forms.hospital.phoneNumber')}</Label>
                <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder={t('forms.hospital.phoneNumberPlaceholder')}
                    value={formData.phoneNumber}
                    onChange={(e) => {
                        handleInputChange(e);
                        if (error) setError('');
                    }}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="capacity">{t('forms.hospital.capacity')}</Label>
                    <Input
                        id="capacity"
                        name="capacity"
                        type="number"
                        placeholder={t('forms.hospital.capacityPlaceholder')}
                        value={formData.capacity}
                        onChange={(e) => {
                            handleInputChange(e);
                            if (error) setError('');
                        }}
                        min="1"
                    />
                    <p className="text-sm text-gray-500">{t('forms.hospital.capacityHelperText')}</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="pricing">{t('forms.hospital.pricing')}</Label>
                    <Input
                        id="pricing"
                        name="pricing"
                        type="number"
                        step="0.01"
                        placeholder={t('forms.hospital.pricingPlaceholder')}
                        value={formData.pricing}
                        onChange={(e) => {
                            handleInputChange(e);
                            if (error) setError('');
                        }}
                        min="0"
                    />
                    <p className="text-sm text-gray-500">{t('forms.hospital.pricingHelperText')}</p>
                </div>
            </div>

            <DialogFooter>
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                        {t('common.cancel')}
                    </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                    {isLoading
                        ? mode === 'create'
                            ? t('common.creating')
                            : t('common.updating')
                        : mode === 'create'
                            ? t('forms.hospital.createHospital')
                            : t('forms.hospital.update')}
                </Button>
            </DialogFooter>
        </form>
    );
}

