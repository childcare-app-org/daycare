import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { DialogFooter } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export interface VisitFormData {
    dropOffTime: Date;
    pickupTime?: Date;
    status: 'active' | 'completed' | 'cancelled';
    notes?: string;
}

interface VisitFormProps {
    mode: 'create' | 'edit';
    defaultValues?: Partial<VisitFormData>;
    onSubmit: (data: VisitFormData) => void;
    onCancel?: () => void;
    isLoading?: boolean;
}

export function VisitForm({
    mode,
    defaultValues,
    onSubmit,
    onCancel,
    isLoading = false,
}: VisitFormProps) {
    const [formData, setFormData] = useState({
        dropOffTime: defaultValues?.dropOffTime
            ? new Date(defaultValues.dropOffTime).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
        pickupTime: defaultValues?.pickupTime
            ? new Date(defaultValues.pickupTime).toISOString().slice(0, 16)
            : '',
        status: defaultValues?.status || 'active',
        notes: defaultValues?.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {

        onSubmit({
            dropOffTime: new Date(formData.dropOffTime),
            pickupTime: formData.pickupTime ? new Date(formData.pickupTime) : undefined,
            status: formData.status as 'active' | 'completed' | 'cancelled',
            notes: formData.notes || undefined,
        });
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
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
                    <Label htmlFor="dropOffTime">Drop-off Time *</Label>
                    <Input
                        id="dropOffTime"
                        name="dropOffTime"
                        type="datetime-local"
                        value={formData.dropOffTime}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="pickupTime">Pick-up Time</Label>
                    <Input
                        id="pickupTime"
                        name="pickupTime"
                        type="datetime-local"
                        value={formData.pickupTime}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add any notes about the visit..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
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
                            ? 'Create Visit'
                            : 'Update'}
                </Button>
            </DialogFooter>
        </form>
    );
}

