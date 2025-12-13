import { ArrowLeft, CheckCircle2, Info, Printer } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '~/components/ui/button';

import type { RouterOutputs } from '~/utils/api';

type VisitDetail = RouterOutputs['visit']['getById'] | RouterOutputs['visit']['getByIdForParent'];

type VisitHeaderProps = {
    visit: VisitDetail;
    readOnly?: boolean;
    onShowCompleteModal?: () => void;
    onShowCareInfo?: () => void;
    onPrint?: () => void;
};

export function VisitHeader({
    visit,
    readOnly = false,
    onShowCompleteModal,
    onShowCareInfo,
    onPrint,
}: VisitHeaderProps) {
    const t = useTranslations();
    return (
        <div className="mb-6">
            {/* Back button and Complete Visit / Print button */}
            <div className="flex items-center justify-between mb-4 no-print">
                <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="-ml-2">
                        <ArrowLeft className="w-4 h-4" />
                        {t('common.back')}
                    </Button>
                </Link>
                {!readOnly && visit.status === 'active' && onShowCompleteModal && (
                    <Button
                        onClick={onShowCompleteModal}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        {t('visit.completeVisit')}
                    </Button>
                )}
                {visit.status === 'completed' && onPrint && (
                    <Button
                        onClick={onPrint}
                        variant="outline"
                        className="border-gray-300"
                    >
                        <Printer className="w-4 h-4" />
                        {t('visit.print')}
                    </Button>
                )}
            </div>

            {/* Name and Info button */}
            <div className="flex items-center justify-center gap-3 mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    {visit.child?.name}
                </h1>
                {onShowCareInfo && (
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full border-blue-100 text-blue-600 bg-white shadow-sm hover:bg-blue-50 no-print"
                        aria-label={t('visit.viewCareInformation')}
                        onClick={onShowCareInfo}
                    >
                        <Info className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

