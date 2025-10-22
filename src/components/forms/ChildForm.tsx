import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { DialogFooter } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export interface ChildFormData {
    name: string;
    age: number;
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
    const [formData, setFormData] = useState({
        name: defaultValues?.name || '',
        age: defaultValues?.age?.toString() || '36',
        allergies: defaultValues?.allergies || '',
        preexistingConditions: defaultValues?.preexistingConditions || '',
        familyDoctorName: defaultValues?.familyDoctorName || '',
        familyDoctorPhone: defaultValues?.familyDoctorPhone || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        onSubmit({
            name: formData.name,
            age: parseInt(formData.age),
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
                    <Label htmlFor="name">Child's Name *</Label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter child's full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="age">Age (in months) *</Label>
                    <Input
                        id="age"
                        name="age"
                        type="number"
                        placeholder="36"
                        value={formData.age}
                        onChange={handleInputChange}
                        required
                        min="3"
                        max="144"
                    />
                    <p className="text-sm text-gray-500">Age range: 3-144 months</p>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <textarea
                    id="allergies"
                    name="allergies"
                    placeholder="List any known allergies (e.g., peanuts, dairy)"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    rows={2}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="preexistingConditions">Preexisting Conditions</Label>
                <textarea
                    id="preexistingConditions"
                    name="preexistingConditions"
                    placeholder="List any preexisting medical conditions"
                    value={formData.preexistingConditions}
                    onChange={handleInputChange}
                    rows={2}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="familyDoctorName">Family Doctor Name</Label>
                    <Input
                        id="familyDoctorName"
                        name="familyDoctorName"
                        type="text"
                        placeholder="Dr. Smith"
                        value={formData.familyDoctorName}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="familyDoctorPhone">Family Doctor Phone</Label>
                    <Input
                        id="familyDoctorPhone"
                        name="familyDoctorPhone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={formData.familyDoctorPhone}
                        onChange={handleInputChange}
                    />
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
                            ? 'Create Child'
                            : 'Update'}
                </Button>
            </DialogFooter>
        </form>
    );
}

