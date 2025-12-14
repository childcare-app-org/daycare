import {
    AlertTriangle, ArrowLeft, CheckCircle2, Info, Printer, Stethoscope, User
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ImageModal } from '~/components/shared/ImageModal';
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
        <div className="mb-8 relative z-10">
            {/* Top Navigation and Actions Bar */}
            <div className="flex items-center justify-between mb-8 no-print">
                <Link href="/dashboard">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        {t('common.back')}
                    </Button>
                </Link>

                <div className="flex items-center gap-3">
                    {onShowCareInfo && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-white/60 hover:bg-white/80 backdrop-blur-sm text-gray-700 shadow-sm border border-white/20"
                            onClick={onShowCareInfo}
                        >
                            <Info className="w-4 h-4 mr-2" />
                            {t('visit.careInformation')}
                        </Button>
                    )}

                    {!readOnly && visit.status === 'active' && onShowCompleteModal && (
                        <Button
                            onClick={onShowCompleteModal}
                            className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all"
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {t('visit.completeVisit')}
                        </Button>
                    )}

                    {visit.status === 'completed' && onPrint && (
                        <Button
                            onClick={onPrint}
                            variant="outline"
                            className="bg-white/60 hover:bg-white/80 backdrop-blur-sm border-white/20 shadow-sm"
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            {t('visit.print')}
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Header Content */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                {/* Child Image - Hero Style */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full opacity-50 blur group-hover:opacity-75 transition duration-200"></div>
                    <div className="relative">
                        {child?.imageUrl ? (
                            <ImageModal
                                imageUrl={child.imageUrl}
                                alt={child.name || ''}
                                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-[5px] border-white shadow-xl flex-shrink-0 cursor-zoom-in transition-transform hover:scale-105 duration-200"
                            />
                        ) : (
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white flex-shrink-0 border-[5px] border-white shadow-xl">
                                <User className="w-12 h-12" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Stack */}
                <div className="flex-1 space-y-3">
                    {/* Name & Meta Row */}
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-none">
                                {child?.name}
                            </h1>
                            {child?.gender && (
                                <span className={`text-2xl ${child.gender === 'Male' ? 'text-blue-500' : 'text-pink-500'}`} title={child.gender}>
                                    {child.gender === 'Male' ? '♂' : '♀'}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 text-lg font-medium flex items-center gap-2">
                            <span>{t('dashboard.parent.yearsOld', { years, months })}</span>
                        </p>
                    </div>

                    {/* Tags Row */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Reason for Visit */}
                        {visit.reason && (
                            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 border border-purple-100 shadow-sm text-purple-700 backdrop-blur-sm">
                                <Stethoscope className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-semibold">{visit.reason}</span>
                            </div>
                        )}

                        {/* Medical Alerts */}
                        {hasMedicalInfo && (
                            <>
                                {hasAllergies && (
                                    <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 border border-red-100 shadow-sm text-red-700 backdrop-blur-sm">
                                        <AlertTriangle className="w-4 h-4 text-red-600" />
                                        <span className="text-sm font-semibold">
                                            {t('dashboard.parent.allergies')}: {child.allergies}
                                        </span>
                                    </div>
                                )}
                                {hasConditions && (
                                    <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 border border-orange-100 shadow-sm text-orange-700 backdrop-blur-sm">
                                        <Info className="w-4 h-4 text-orange-600" />
                                        <span className="text-sm font-semibold">
                                            {t('dashboard.parent.conditions')}: {child.preexistingConditions}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

