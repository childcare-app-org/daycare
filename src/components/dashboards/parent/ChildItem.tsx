import type { InferSelectModel } from 'drizzle-orm';
import { Stethoscope } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ActionMenu } from '~/components/shared/ActionMenu';
import { Button } from '~/components/ui/button';

import { ChildVisitHistory } from './ChildVisitHistory';

import type { visits } from '~/server/db/schema';

export type Child = {
    id?: string | null;
    name?: string | null;
    pronunciation?: string | null;
    gender?: string | null;
    birthdate?: Date | null;
    allergies?: string | null;
    preexistingConditions?: string | null;
    familyDoctorName?: string | null;
    familyDoctorPhone?: string | null;
};

export type Visit = InferSelectModel<typeof visits>;

// Helper function to calculate age in months from birthdate
const calculateAgeInMonths = (birthdate: Date | null | undefined): number => {
    if (!birthdate) return 0;
    const today = new Date();
    const years = today.getFullYear() - birthdate.getFullYear();
    const months = today.getMonth() - birthdate.getMonth();
    return years * 12 + months;
};

interface ChildItemBaseProps {
    child: Child;
    activeVisit?: Visit;
}

interface ParentViewProps extends ChildItemBaseProps {
    variant?: 'parent';
    onEdit: (child: Child) => void;
    onDelete: (child: Child) => void;
    onRegisterVisit: (child: Child) => void;
}

interface NurseViewProps extends ChildItemBaseProps {
    variant: 'nurse';
    onEditVisit?: () => void;
    onDeleteVisit?: () => void;
}

type ChildItemProps = ParentViewProps | NurseViewProps;

export function ChildItem(props: ChildItemProps) {
    const { child, activeVisit, variant = 'parent' } = props;
    const isNurseView = variant === 'nurse';
    const t = useTranslations();
    const ageMonths = calculateAgeInMonths(child.birthdate);

    return (
        <div className="p-4 sm:p-6 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex-1 space-y-3 sm:space-y-4">
                    {/* Name - Primary Hierarchy */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{child.name}</h3>
                            {child.pronunciation && (
                                <span className="text-sm text-gray-500 italic">({child.pronunciation})</span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>
                                {t('dashboard.parent.yearsOld', { years: Math.floor(ageMonths / 12), months: ageMonths % 12 })}
                            </span>
                            {child.gender && (
                                <>
                                    <span>•</span>
                                    <span>{t('dashboard.parent.gender')}: {child.gender === 'Male' ? t('forms.child.genderMale') : t('forms.child.genderFemale')}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Medical Information - Secondary Hierarchy */}
                    {(child.allergies || child.preexistingConditions) && (
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {child.allergies && (
                                <div className="flex items-center gap-1.5">
                                    <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {t('dashboard.parent.allergies')}: {child.allergies}
                                    </span>
                                </div>
                            )}
                            {child.preexistingConditions && (
                                <div className="flex items-center gap-1.5">
                                    <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        {t('dashboard.parent.conditions')}: {child.preexistingConditions}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reason for Visit */}
                    {activeVisit?.reason && (
                        <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                                {activeVisit.reason}
                            </span>
                        </div>
                    )}
                </div>

                {/* Right Side - Visit Details & Actions */}
                <div className="flex flex-col items-stretch sm:items-end gap-3 flex-shrink-0 w-full sm:w-auto">
                    {/* Action Buttons */}
                    <div className="flex items-stretch sm:items-start gap-2 w-full sm:w-auto">
                        {isNurseView ? (
                            // Nurse view actions
                            <>
                                {activeVisit && (
                                    <Link href={`/visit/${activeVisit.id}`} className="flex-1 sm:flex-initial">
                                        <Button variant="outline" className="w-full sm:w-auto whitespace-nowrap">
                                            {t('dashboard.nurse.viewVisit')}
                                        </Button>
                                    </Link>
                                )}
                                {(props as NurseViewProps).onEditVisit && (props as NurseViewProps).onDeleteVisit && (
                                    <ActionMenu
                                        onEdit={(props as NurseViewProps).onEditVisit}
                                        onDelete={(props as NurseViewProps).onDeleteVisit}
                                    />
                                )}
                            </>
                        ) : (
                            // Parent view actions
                            <>
                                {activeVisit ? (
                                    <Link href={`/visit/parent/${activeVisit.id}`} className="flex-1 sm:flex-initial">
                                        <Button variant="outline" className="w-full sm:w-auto whitespace-nowrap">
                                            {t('dashboard.parent.viewVisit')}
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button onClick={() => (props as ParentViewProps).onRegisterVisit(child)} className="flex-1 sm:flex-initial whitespace-nowrap">
                                        {t('dashboard.parent.registerForVisit')}
                                    </Button>
                                )}
                                <ActionMenu
                                    onEdit={() => (props as ParentViewProps).onEdit(child)}
                                    onDelete={() => (props as ParentViewProps).onDelete(child)}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Visit History */}
            <ChildVisitHistory childId={child.id || ''} variant={variant} />
        </div>
    );
}

