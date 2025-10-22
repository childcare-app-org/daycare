import type { ReactNode } from 'react';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '~/components/ui/dialog';

interface EditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
    error?: string;
}

export function EditDialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    error,
}: EditDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                        {error}
                    </div>
                )}
                {children}
            </DialogContent>
        </Dialog>
    );
}

