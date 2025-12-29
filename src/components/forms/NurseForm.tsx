import { useTranslations } from 'next-intl';
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
    const t = useTranslations();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: defaultValues?.name || '',
        email: defaultValues?.email || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.name.trim()) {
            setError(t('validation.nameRequired'));
            return;
        }
        if (!formData.email.trim()) {
            setError(t('validation.emailRequired'));
            return;
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError(t('validation.invalidEmail'));
            return;
        }

        setError('');
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
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="name">{t('forms.nurse.name')}</Label>
                <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={t('forms.nurse.namePlaceholder')}
                    value={formData.name}
                    onChange={(e) => {
                        handleInputChange(e);
                        if (error) setError('');
                    }}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">{t('forms.nurse.email')}</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t('forms.nurse.emailPlaceholder')}
                    value={formData.email}
                    onChange={(e) => {
                        handleInputChange(e);
                        if (error) setError('');
                    }}
                    disabled={emailDisabled}
                />
                {emailDisabledMessage && (
                    <p className="text-sm text-yellow-600">{emailDisabledMessage}</p>
                )}
                {!emailDisabled && (
                    <p className="text-sm text-gray-500">
                        {t('forms.nurse.emailHelperText')}
                    </p>
                )}
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
                            ? t('forms.nurse.createNurse')
                            : t('forms.nurse.update')}
                </Button>
            </DialogFooter>
        </form>
    );
}

