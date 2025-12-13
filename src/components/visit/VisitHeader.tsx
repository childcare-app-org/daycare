import { AlertTriangle, ArrowLeft, CheckCircle2, Info, Printer, Stethoscope } from 'lucide-react';
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

// Helper function to calculate age in months from birthdate
const calculateAgeInMonths = (birthdate: Date | null | undefined): number => {
    if (!birthdate) return 0;
    const today = new Date();
    const years = today.getFullYear() - birthdate.getFullYear();
    const months = today.getMonth() - birthdate.getMonth();
    return years * 12 + months;
};

export function VisitHeader({
    visit,
    readOnly = false,
    onShowCompleteModal,
    onShowCareInfo,
    onPrint,
}: VisitHeaderProps) {
    const t = useTranslations();
    const child = visit.child;
    const ageMonths = calculateAgeInMonths(child?.birthdate);
    const years = Math.floor(ageMonths / 12);
    const months = ageMonths % 12;

    const hasAllergies = !!child?.allergies;
    const hasConditions = !!child?.preexistingConditions;
    const hasMedicalInfo = hasAllergies || hasConditions;

    return (
        <div className="mb-6">
            {/* Top Navigation and Actions Bar */}
            <div className="flex items-center justify-between mb-6 no-print">
                <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="-ml-2 text-gray-500 hover:text-gray-900">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        {t('common.back')}
                    </Button>
                </Link>

                <div className="flex items-center gap-2">
                    {onShowCareInfo && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                            onClick={onShowCareInfo}
                        >
                            <Info className="w-4 h-4" />
                            {t('visit.careInformation')}
                        </Button>
                    )}

                    {!readOnly && visit.status === 'active' && onShowCompleteModal && (
                        <Button
                            onClick={onShowCompleteModal}
                            className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {t('visit.completeVisit')}
                        </Button>
                    )}

                    {visit.status === 'completed' && onPrint && (
                        <Button
                            onClick={onPrint}
                            variant="outline"
                            className="border-gray-300"
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            {t('visit.print')}
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Header Content - Left Aligned */}
            <div className="flex flex-col gap-4">
                {/* Row 1: Name, Gender, Age */}
                <div className="flex items-baseline gap-3">
                    <div className="flex items-baseline gap-2">
                        {child?.gender && (
                            <span className={`text-2xl font-medium ${child.gender === 'Male' ? 'text-blue-500' : 'text-pink-500'}`}>
                                {child.gender === 'Male' ? '♂' : '♀'}
                            </span>
                        )}
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            {child?.name}
                        </h1>
                    </div>
                    <span className="text-gray-500 text-lg">
                        • {t('dashboard.parent.yearsOld', { years, months })}
                    </span>
                </div>

                {/* Row 2: Badges/Tags */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Reason for Visit */}
                    {visit.reason && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200">
                            <Stethoscope className="w-3.5 h-3.5 text-purple-600" />
                            <span className="text-sm font-medium text-purple-700">{visit.reason}</span>
                        </div>
                    )}

                    {/* Medical Alerts */}
                    {hasMedicalInfo && (
                        <>
                            {hasAllergies && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200">
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                                    <span className="text-sm font-medium text-red-700">
                                        {t('dashboard.parent.allergies')}: {child.allergies}
                                    </span>
                                </div>
                            )}
                            {hasConditions && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200">
                                    <Info className="w-3.5 h-3.5 text-orange-600" />
                                    <span className="text-sm font-medium text-orange-700">
                                        {t('dashboard.parent.conditions')}: {child.preexistingConditions}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

