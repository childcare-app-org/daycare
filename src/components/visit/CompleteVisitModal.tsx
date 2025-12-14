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
    onGenerateSummary?: () => Promise<string>;
    isLoading?: boolean;
    isGeneratingSummary?: boolean;
}

export function CompleteVisitModal({
    isOpen,
    onClose,
    onConfirm,
    onGenerateSummary,
    isLoading = false,
    isGeneratingSummary = false,
}: CompleteVisitModalProps) {
    const t = useTranslations();
    const [summary, setSummary] = useState('');

    const handleGenerateSummary = async () => {
        if (onGenerateSummary) {
            const generated = await onGenerateSummary();
            setSummary(generated);
        }
    };

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
                        <div className="flex items-center justify-between">
                            <Label htmlFor="summary">{t('visit.visitSummary')}</Label>
                            {onGenerateSummary && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGenerateSummary}
                                    disabled={isLoading || isGeneratingSummary}
                                    className="h-7 text-xs"
                                >
                                    {isGeneratingSummary ? (
                                        <>
                                            <span className="animate-spin mr-2">⏳</span>
                                            {t('common.generating')}
                                        </>
                                    ) : (
                                        <>✨ {t('visit.generateSummary')}</>
                                    )}
                                </Button>
                            )}
                        </div>
                        <textarea
                            id="summary"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            placeholder={t('visit.visitSummaryPlaceholder')}
                            rows={6}
                            disabled={isLoading || isGeneratingSummary}
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                </div>
                <DialogFooter className="flex items-center gap-2">
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
