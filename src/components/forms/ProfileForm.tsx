import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

import { GoogleAddressAutocompleteNew } from './GoogleAddressAutocompleteNew';

import type { AddressData } from './GoogleAddressAutocompleteNew';

export interface ProfileFormData {
    name: string;
    image?: string | null;
    phoneNumber?: string;
    homeAddress?: string;
    latitude?: number;
    longitude?: number;
}

interface ProfileFormProps {
    defaultValues?: Partial<ProfileFormData>;
    onSubmit: (data: ProfileFormData) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    role?: 'nurse' | 'parent' | 'admin';
}

export function ProfileForm({
    defaultValues,
    onSubmit,
    onCancel,
    isLoading = false,
    role,
}: ProfileFormProps) {
    const t = useTranslations();
    const { data: session } = useSession();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: defaultValues?.name || session?.user?.name || '',
        phoneNumber: defaultValues?.phoneNumber || '',
        homeAddress: defaultValues?.homeAddress || '',
        latitude: defaultValues?.latitude,
        longitude: defaultValues?.longitude,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.name.trim()) {
            setError(t('validation.nameRequired'));
            return;
        }
        if (role === 'parent' && !formData.phoneNumber?.trim()) {
            setError(t('validation.pleaseFillOutThisField'));
            return;
        }

        setError('');
        onSubmit({
            name: formData.name,
            phoneNumber: role === 'parent' ? formData.phoneNumber : undefined,
            homeAddress: role === 'parent' ? formData.homeAddress : undefined,
            latitude: role === 'parent' ? formData.latitude : undefined,
            longitude: role === 'parent' ? formData.longitude : undefined,
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
            homeAddress: addressData.address,
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
                <Label htmlFor="email">{t('profile.email')}</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    value={session?.user?.email || ''}
                    disabled
                    className="bg-gray-50"
                />
                <p className="text-sm text-gray-500">{t('profile.emailCannotChange')}</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">{t('profile.name')}</Label>
                <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={t('profile.namePlaceholder')}
                    value={formData.name}
                    onChange={(e) => {
                        handleInputChange(e);
                        if (error) setError('');
                    }}
                />
            </div>

            {role === 'parent' && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">{t('profile.phoneNumber')}</Label>
                        <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            placeholder={t('profile.phoneNumberPlaceholder')}
                            value={formData.phoneNumber}
                            onChange={(e) => {
                                handleInputChange(e);
                                if (error) setError('');
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <GoogleAddressAutocompleteNew
                            id="homeAddress"
                            label={t('profile.homeAddress')}
                            value={formData.homeAddress}
                            onChange={(data) => {
                                handleAddressChange(data);
                                if (error) setError('');
                            }}
                            placeholder={t('profile.homeAddressPlaceholder')}
                            helperText={t('profile.homeAddressHelper')}
                        />
                    </div>
                </>
            )}

            <div className="flex gap-2 pt-4">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                        {t('common.cancel')}
                    </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? t('common.updating') : t('common.save')}
                </Button>
            </div>
        </form>
    );
}

