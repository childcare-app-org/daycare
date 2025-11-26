import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { DialogFooter } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export interface ChildFormData {
    name: string;
    birthdate: Date;
    allergies?: string;
    preexistingConditions?: string;
    familyDoctorName?: string;
    familyDoctorPhone?: string;
}

interface ChildFormProps {
    mode: 'create' | 'edit';
    defaultValues?: Partial<ChildFormData>;
    onSubmit: (data: ChildFormData) => void;
    onCancel?: () => void;
    isLoading?: boolean;
}

export function ChildForm({
    mode,
    defaultValues,
    onSubmit,
    onCancel,
    isLoading = false,
}: ChildFormProps) {
    const t = useTranslations();
    // Helper to format date for input (YYYY-MM-DD)
    const formatDateForInput = (date?: Date) => {
        if (!date) return '';
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toISOString().split('T')[0];
    };

    // Default to 3 years ago if no birthdate provided
    const getDefaultBirthdate = () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 3);
        return date;
    };

    const [formData, setFormData] = useState({
        name: defaultValues?.name || '',
        birthdate: formatDateForInput(defaultValues?.birthdate) || formatDateForInput(getDefaultBirthdate()),
        allergies: defaultValues?.allergies || '',
        preexistingConditions: defaultValues?.preexistingConditions || '',
        familyDoctorName: defaultValues?.familyDoctorName || '',
        familyDoctorPhone: defaultValues?.familyDoctorPhone || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.birthdate) {
            return; // Birthdate is required
        }
        onSubmit({
            name: formData.name,
            birthdate: new Date(formData.birthdate),
            allergies: formData.allergies || undefined,
            preexistingConditions: formData.preexistingConditions || undefined,
            familyDoctorName: formData.familyDoctorName || undefined,
            familyDoctorPhone: formData.familyDoctorPhone || undefined,
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

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">{t('forms.child.name')}</Label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder={t('forms.child.namePlaceholder')}
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="birthdate">{t('forms.child.birthdate')}</Label>
                    <Input
                        id="birthdate"
                        name="birthdate"
                        type="date"
                        value={formData.birthdate}
                        onChange={handleInputChange}
                        required
                        max={new Date().toISOString().split('T')[0]}
                    />
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
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                    />
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

