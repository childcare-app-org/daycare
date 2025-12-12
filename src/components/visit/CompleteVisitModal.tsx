import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';

interface CompleteVisitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (summary: string) => void;
    isLoading?: boolean;
}

export function CompleteVisitModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
}: CompleteVisitModalProps) {
    const t = useTranslations();
    const [summary, setSummary] = useState('');

    const handleConfirm = () => {
        onConfirm(summary);
        setSummary(''); // Reset on confirm
    };

    const handleClose = () => {
        setSummary(''); // Reset on close
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('visit.completeVisit')}</DialogTitle>
                    <DialogDescription>
                        {t('visit.completeVisitDescription')}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="summary">{t('visit.visitSummary')}</Label>
                        <textarea
                            id="summary"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            placeholder={t('visit.visitSummaryPlaceholder')}
                            rows={6}
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {isLoading ? t('visit.completing') : t('visit.confirmComplete')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
