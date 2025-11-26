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
    const [formData, setFormData] = useState({
        name: defaultValues?.name || '',
        email: defaultValues?.email || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
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
                <Label htmlFor="name">{t('forms.nurse.name')}</Label>
                <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={t('forms.nurse.namePlaceholder')}
                    value={formData.name}
                    onChange={handleInputChange}
                    required
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
                    onChange={handleInputChange}
                    required
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

