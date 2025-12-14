import type { InferSelectModel } from 'drizzle-orm';
import { AlertTriangle, Info, Stethoscope, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ActionMenu } from '~/components/shared/ActionMenu';
import { ImageModal } from '~/components/shared/ImageModal';
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
    imageUrl?: string | null;
};

export type Visit = InferSelectModel<typeof visits> & {
    parent?: { name: string | null; phoneNumber: string; id: string };
    hospital?: { name: string; phoneNumber?: string | null; id: string; address?: string };
};

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
                    <div className="flex items-start gap-3">
                        {child.imageUrl ? (
                            <ImageModal
                                imageUrl={child.imageUrl}
                                alt={child.name || ''}
                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                                <User className="w-8 h-8" />
                            </div>
                        )}
                        <div className="flex-1">
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
                    </div>

                    {/* Tags Section: Reason, Allergies, Conditions */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        {/* Reason for Visit */}
                        {activeVisit?.reason && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200">
                                <Stethoscope className="w-3.5 h-3.5 text-purple-600" />
                                <span className="text-xs font-medium text-purple-700">{activeVisit.reason}</span>
                            </div>
                        )}

                        {/* Medical Information */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                            <span className="text-xs font-medium text-red-700">
                                {t('dashboard.parent.allergies')}: {child.allergies || t('common.none')}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200">
                            <Info className="w-3.5 h-3.5 text-orange-600" />
                            <span className="text-xs font-medium text-orange-700">
                                {t('dashboard.parent.conditions')}: {child.preexistingConditions || t('common.none')}
                            </span>
                        </div>
                    </div>

                    {/* Contact Info (Context-dependent) */}
                    {activeVisit && (
                        <div className="mt-3 text-sm text-gray-600">
                            {isNurseView && activeVisit.parent ? (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{t('dashboard.nurse.parent')}:</span>
                                    <span>{activeVisit.parent.name}</span>
                                    {activeVisit.parent.phoneNumber && (
                                        <>
                                            <span className="text-gray-300">•</span>
                                            <a href={`tel:${activeVisit.parent.phoneNumber}`} className="text-blue-600 hover:underline">
                                                {activeVisit.parent.phoneNumber}
                                            </a>
                                        </>
                                    )}
                                </div>
                            ) : !isNurseView && activeVisit.hospital ? (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{t('dashboard.nurse.hospital')}:</span>
                                    <span>{activeVisit.hospital.name}</span>
                                    {activeVisit.hospital.phoneNumber && (
                                        <>
                                            <span className="text-gray-300">•</span>
                                            <a href={`tel:${activeVisit.hospital.phoneNumber}`} className="text-blue-600 hover:underline">
                                                {activeVisit.hospital.phoneNumber}
                                            </a>
                                        </>
                                    )}
                                </div>
                            ) : null}
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

