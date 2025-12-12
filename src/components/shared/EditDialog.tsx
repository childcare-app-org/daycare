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
    banner?: ReactNode;
}

export function EditDialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    error,
    banner,
}: EditDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                {banner && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                        {banner}
                    </div>
                )}
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

