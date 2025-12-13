import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '~/components/ui/button';
import {
    Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '~/components/ui/dialog';

import type { RouterOutputs } from '~/utils/api';

type VisitDetail = RouterOutputs['visit']['getById'];

type VisitCareInfoModalProps = {
    isOpen: boolean;
    onClose: () => void;
    visit: VisitDetail;
};

export function VisitCareInfoModal({ isOpen, onClose, visit }: VisitCareInfoModalProps) {
    const t = useTranslations();
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle>{t('visit.careInformation')}</DialogTitle>
                            <DialogDescription>
                                {t('visit.careInformationDescription')}
                            </DialogDescription>
                        </div>
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full"
                                onClick={onClose}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">{t('common.close')}</span>
                            </Button>
                        </DialogClose>
                    </div>
                </DialogHeader>
                <div className="py-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Visit Times - Grid Layout */}
                        <div className="rounded-lg border bg-muted/30 p-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                {t('visit.dropOffTime')}
                            </p>
                            <p className="text-base font-semibold">
                                {new Date(visit.dropOffTime).toLocaleString([], {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                        {visit.pickupTime && (
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                    {t('visit.pickUpTime')}
                                </p>
                                <p className="text-base font-semibold">
                                    {new Date(visit.pickupTime).toLocaleString([], {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Visit Notes */}
                    {visit.notes && (
                        <div className="mt-4 rounded-lg border bg-blue-50/50 p-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                {t('visit.notes')}
                            </p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{visit.notes}</p>
                        </div>
                    )}

                    {/* Parent Contact Information */}
                    {visit.parent && (
                        <div className="mt-4 rounded-lg border bg-muted/30 p-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                {t('visit.parentContact')}
                            </p>
                            <div className="space-y-2">
                                {visit.parent.name && (
                                    <p className="text-base font-semibold">{visit.parent.name}</p>
                                )}
                                {visit.parent.phoneNumber && (
                                    <p className="text-sm">
                                        <a
                                            href={`tel:${visit.parent.phoneNumber}`}
                                            className="text-primary hover:underline transition-colors font-medium"
                                        >
                                            {visit.parent.phoneNumber}
                                        </a>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Hospital Information */}
                    {visit.hospital && (
                        <div className="mt-4 rounded-lg border bg-muted/30 p-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                {t('hospital.hospitalInformation')}
                            </p>
                            <div className="space-y-2">
                                <p className="text-base font-semibold">{visit.hospital.name}</p>
                                {visit.hospital.address && (
                                    <p className="text-sm text-gray-600">{visit.hospital.address}</p>
                                )}
                                {visit.hospital.phoneNumber && (
                                    <p className="text-sm">
                                        <a
                                            href={`tel:${visit.hospital.phoneNumber}`}
                                            className="text-primary hover:underline transition-colors font-medium"
                                        >
                                            {visit.hospital.phoneNumber}
                                        </a>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

