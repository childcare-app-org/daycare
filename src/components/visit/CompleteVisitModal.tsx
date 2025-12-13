import { Printer, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import {
    Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';

interface CompleteVisitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (summary: string) => void;
    onPrint?: () => void;
    isLoading?: boolean;
}

export function CompleteVisitModal({
    isOpen,
    onClose,
    onConfirm,
    onPrint,
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
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle>{t('visit.completeVisit')}</DialogTitle>
                            <DialogDescription>
                                {t('visit.completeVisitDescription')}
                            </DialogDescription>
                        </div>
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full"
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">{t('common.close')}</span>
                            </Button>
                        </DialogClose>
                    </div>
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
                <DialogFooter className="flex items-center gap-2">
                    {onPrint && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onPrint}
                            disabled={isLoading}
                            className="flex items-center gap-2"
                        >
                            <Printer className="w-4 h-4" />
                            {t('visit.printVisit')}
                        </Button>
                    )}
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
