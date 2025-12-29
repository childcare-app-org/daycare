import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ImageCapture } from '~/components/shared/ImageCapture';
import { Button } from '~/components/ui/button';
import { DialogFooter } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export interface ChildFormData {
    name: string;
    pronunciation?: string;
    gender: 'Male' | 'Female';
    birthdate: Date;
    allergies?: string;
    preexistingConditions?: string;
    familyDoctorName?: string;
    familyDoctorPhone?: string;
    imageUrl?: string;
}

interface ChildFormProps {
    mode: 'create' | 'edit';
    defaultValues?: Partial<ChildFormData>;
    onSubmit: (data: ChildFormData) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    disabled?: boolean;
}

export function ChildForm({
    mode,
    defaultValues,
    onSubmit,
    onCancel,
    isLoading = false,
    disabled = false,
}: ChildFormProps) {
    const t = useTranslations();
    const [error, setError] = useState('');
    // Helper to format date for input (YYYY-MM-DD)
    const formatDateForInput = (date?: Date) => {
        if (!date) return '';
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toISOString().split('T')[0];
    };

    const [formData, setFormData] = useState({
        name: defaultValues?.name || '',
        pronunciation: defaultValues?.pronunciation || '',
        gender: (defaultValues?.gender as 'Male' | 'Female') || 'Male',
        birthdate: formatDateForInput(defaultValues?.birthdate),
        allergies: defaultValues?.allergies || '',
        preexistingConditions: defaultValues?.preexistingConditions || '',
        familyDoctorName: defaultValues?.familyDoctorName || '',
        familyDoctorPhone: defaultValues?.familyDoctorPhone || '',
        imageUrl: defaultValues?.imageUrl || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (disabled) return; // Prevent submission when disabled

        // Validate required fields
        if (!formData.name.trim()) {
            setError(t('validation.nameRequired'));
            return;
        }
        if (!formData.birthdate) {
            setError(t('validation.pleaseFillOutThisField'));
            return;
        }
        if (!formData.gender) {
            setError(t('validation.pleaseFillOutThisField'));
            return;
        }

        setError('');
        onSubmit({
            name: formData.name,
            pronunciation: formData.pronunciation || undefined,
            gender: formData.gender,
            birthdate: new Date(formData.birthdate),
            allergies: formData.allergies || undefined,
            preexistingConditions: formData.preexistingConditions || undefined,
            familyDoctorName: formData.familyDoctorName || undefined,
            familyDoctorPhone: formData.familyDoctorPhone || undefined,
            imageUrl: formData.imageUrl || undefined,
        });
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            gender: e.target.value as 'Male' | 'Female',
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Top Section: Photo + Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                {/* Left Column: Name & Pronunciation */}
                <div className="space-y-4 w-full">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t('forms.child.name')}</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder={t('forms.child.namePlaceholder')}
                            value={formData.name}
                            onChange={(e) => {
                                handleInputChange(e);
                                if (error) setError('');
                            }}
                            disabled={disabled}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pronunciation">{t('forms.child.pronunciation')}</Label>
                        <Input
                            id="pronunciation"
                            name="pronunciation"
                            type="text"
                            placeholder={t('forms.child.pronunciationPlaceholder')}
                            value={formData.pronunciation}
                            onChange={handleInputChange}
                            disabled={disabled}
                        />
                    </div>
                </div>

                {/* Right Column: Photo */}
                <div className="w-full">
                    <ImageCapture
                        label={t('forms.child.image')}
                        value={formData.imageUrl}
                        onChange={(imageUrl) => setFormData((prev) => ({ ...prev, imageUrl: imageUrl || '' }))}
                        disabled={disabled}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="birthdate">{t('forms.child.birthdate')}</Label>
                    <Input
                        id="birthdate"
                        name="birthdate"
                        type="date"
                        value={formData.birthdate}
                        onChange={(e) => {
                            handleInputChange(e);
                            if (error) setError('');
                        }}
                        max={new Date().toISOString().split('T')[0]}
                        disabled={disabled}
                    />
                </div>

                <div className="space-y-2 flex flex-col">
                    <Label>{t('forms.child.gender')}</Label>
                    <div className="flex gap-6 items-center h-10">
                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id="gender-male"
                                name="gender"
                                value="Male"
                                checked={formData.gender === 'Male'}
                                onChange={(e) => {
                                    handleRadioChange(e);
                                    if (error) setError('');
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                disabled={disabled}
                            />
                            <Label htmlFor="gender-male" className="font-normal cursor-pointer">
                                {t('forms.child.genderMale')}
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id="gender-female"
                                name="gender"
                                value="Female"
                                checked={formData.gender === 'Female'}
                                onChange={(e) => {
                                    handleRadioChange(e);
                                    if (error) setError('');
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                disabled={disabled}
                            />
                            <Label htmlFor="gender-female" className="font-normal cursor-pointer">
                                {t('forms.child.genderFemale')}
                            </Label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="allergies">{t('forms.child.allergies')}</Label>
                <textarea
                    id="allergies"
                    name="allergies"
                    placeholder={t('forms.child.allergiesPlaceholder')}
                    value={formData.allergies}
                    onChange={handleInputChange}
                    rows={2}
                    disabled={disabled}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="preexistingConditions">{t('forms.child.preexistingConditions')}</Label>
                <textarea
                    id="preexistingConditions"
                    name="preexistingConditions"
                    placeholder={t('forms.child.preexistingConditionsPlaceholder')}
                    value={formData.preexistingConditions}
                    onChange={handleInputChange}
                    rows={2}
                    disabled={disabled}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="familyDoctorName">{t('forms.child.familyDoctorName')}</Label>
                    <Input
                        id="familyDoctorName"
                        name="familyDoctorName"
                        type="text"
                        placeholder={t('forms.child.familyDoctorNamePlaceholder')}
                        value={formData.familyDoctorName}
                        onChange={handleInputChange}
                        disabled={disabled}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="familyDoctorPhone">{t('forms.child.familyDoctorPhone')}</Label>
                    <Input
                        id="familyDoctorPhone"
                        name="familyDoctorPhone"
                        type="tel"
                        placeholder={t('forms.child.familyDoctorPhonePlaceholder')}
                        value={formData.familyDoctorPhone}
                        onChange={handleInputChange}
                        disabled={disabled}
                    />
                </div>
            </div>

            <DialogFooter>
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading || disabled}>
                        {t('common.cancel')}
                    </Button>
                )}
                <Button type="submit" disabled={isLoading || disabled}>
                    {isLoading
                        ? mode === 'create'
                            ? t('forms.child.creating')
                            : t('forms.child.updating')
                        : mode === 'create'
                            ? t('forms.child.createChild')
                            : t('forms.child.update')}
                </Button>
            </DialogFooter>
        </form>
    );
}

