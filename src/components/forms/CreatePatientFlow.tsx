import { Calendar, Check, ChevronRight, User, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ChildForm } from '~/components/forms/ChildForm';
import { GoogleAddressAutocompleteNew } from '~/components/forms/GoogleAddressAutocompleteNew';
import { VisitForm } from '~/components/forms/VisitForm';
import { ImageModal } from '~/components/shared/ImageModal';
import { SearchComponent } from '~/components/shared/SearchComponent';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { cn } from '~/lib/utils';
import { api } from '~/utils/api';

import type { AddressData } from '~/components/forms/GoogleAddressAutocompleteNew';
import type { ChildFormData } from '~/components/forms/ChildForm';
import type { VisitFormData } from '~/components/forms/VisitForm';

type CreatePatientStep = 'search-parent' | 'create-parent' | 'search-child' | 'create-child' | 'create-visit';

interface CreatePatientFlowProps {
    onCancel: () => void;
    onComplete: () => void;
}

interface ParentData {
    id: string;
    name: string;
    phoneNumber: string;
    homeAddress: string;
}

interface ChildData {
    id: string;
    name: string;
    birthdate: Date;
    parentId: string;
    imageUrl?: string | null;
}

export function CreatePatientFlow({ onCancel, onComplete }: CreatePatientFlowProps) {
    const router = useRouter();
    const t = useTranslations();
    const [currentStep, setCurrentStep] = useState<CreatePatientStep>('search-parent');
    const [selectedParent, setSelectedParent] = useState<ParentData | null>(null);
    const [selectedChild, setSelectedChild] = useState<ChildData | null>(null);
    const [error, setError] = useState('');
    const [parentSearchQuery, setParentSearchQuery] = useState('');

    // Parent form state
    const [parentFormData, setParentFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        homeAddress: '',
        latitude: undefined as number | undefined,
        longitude: undefined as number | undefined,
    });


    // API queries
    const { data: nurseProfile } = api.nurse.getMyProfile.useQuery();

    const { data: parentSearchResults = [], isLoading: isSearchingParents } = api.patient.searchParents.useQuery(
        { query: parentSearchQuery },
        { enabled: parentSearchQuery.length >= 2 && currentStep === 'search-parent' }
    );

    const { data: parentChildren = [], isLoading: isLoadingChildren } = api.patient.getChildrenByParentId.useQuery(
        { parentId: selectedParent?.id || '' },
        { enabled: !!selectedParent?.id && currentStep === 'search-child' }
    );

    // API mutations
    const createParentMutation = api.patient.createParent.useMutation({
        onSuccess: (parent) => {
            setSelectedParent(parent);
            setCurrentStep('search-child');
            setError('');
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const createChildMutation = api.patient.createChild.useMutation({
        onSuccess: (child) => {
            setSelectedChild(child);
            setCurrentStep('create-visit');
            setError('');
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const createVisitMutation = api.visit.create.useMutation({
        onSuccess: () => {
            onComplete();
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const handleParentSelect = (parent: ParentData) => {
        setSelectedParent(parent);
        setCurrentStep('search-child');
        setError('');
    };

    const handleParentCreate = () => {
        if (!parentFormData.name.trim()) {
            setError(t('validation.nameRequired'));
            return;
        }
        if (!parentFormData.email.trim()) {
            setError(t('validation.emailRequired'));
            return;
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(parentFormData.email)) {
            setError(t('validation.invalidEmail'));
            return;
        }
        if (!parentFormData.phoneNumber.trim()) {
            setError(t('validation.pleaseFillOutThisField'));
            return;
        }
        if (!parentFormData.homeAddress.trim()) {
            setError(t('validation.pleaseFillOutThisField'));
            return;
        }

        createParentMutation.mutate({
            name: parentFormData.name,
            email: parentFormData.email,
            phoneNumber: parentFormData.phoneNumber,
            homeAddress: parentFormData.homeAddress,
        });
    };

    const handleChildSelect = (child: ChildData) => {
        setSelectedChild(child);
        setCurrentStep('create-visit');
        setError('');
    };

    const handleChildCreate = (childData: ChildFormData) => {
        if (!selectedParent) return;

        createChildMutation.mutate({
            ...childData,
            parentId: selectedParent.id,
        });
    };

    const handleVisitSubmit = (data: VisitFormData) => {
        if (!selectedChild || !nurseProfile?.hospitalId) {
            setError(t('validation.unableToCreateVisit'));
            return;
        }

        createVisitMutation.mutate({
            childId: selectedChild.id,
            hospitalId: nurseProfile.hospitalId,
            dropOffTime: data.dropOffTime,
            pickupTime: data.pickupTime!,
            reason: data.reason,
            notes: data.notes,
        });
    };

    const handleBack = () => {
        switch (currentStep) {
            case 'create-parent':
                setCurrentStep('search-parent');
                break;
            case 'search-child':
                setCurrentStep('search-parent');
                setSelectedParent(null); // Reset parent selection when going back
                break;
            case 'create-child':
                setCurrentStep('search-child');
                break;
            case 'create-visit':
                setCurrentStep('search-child');
                setSelectedChild(null); // Reset child selection when going back
                break;
            default:
                onCancel();
        }
        setError('');
    };

    // Helper to determine active step index (0, 1, or 2)
    const getActiveStepIndex = () => {
        if (currentStep === 'search-parent' || currentStep === 'create-parent') return 0;
        if (currentStep === 'search-child' || currentStep === 'create-child') return 1;
        return 2;
    };

    const steps = [
        { title: t('forms.createPatientFlow.parent'), icon: User },
        { title: t('forms.createPatientFlow.child'), icon: UserPlus },
        { title: t('forms.createPatientFlow.visit'), icon: Calendar },
    ];

    const renderStep = () => {
        switch (currentStep) {
            case 'search-parent':
                return (
                    <SearchComponent
                        title={t('forms.createPatientFlow.findParent')}
                        description={t('forms.createPatientFlow.findParentDescription')}
                        placeholder={t('forms.createPatientFlow.searchParentPlaceholder')}
                        searchQuery={parentSearchQuery}
                        onSearchQueryChange={setParentSearchQuery}
                        searchResults={parentSearchResults}
                        isLoading={isSearchingParents}
                        emptyMessage={t('forms.createPatientFlow.noParentsFound')}
                        renderResult={(parent) => (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{parent.name}</p>
                                    <p className="text-sm text-gray-500">{parent.phoneNumber}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                            </div>
                        )}
                        onSelect={(parent) => handleParentSelect(parent as ParentData)}
                        onCancel={onCancel}
                        additionalActions={
                            <Button onClick={() => setCurrentStep('create-parent')} variant="default" className="flex-1">
                                {t('forms.createPatientFlow.createNewParent')}
                            </Button>
                        }
                    />
                );

            case 'create-parent':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="parent-name">{t('forms.createPatientFlow.parentName')}</Label>
                                <Input
                                    id="parent-name"
                                    type="text"
                                    value={parentFormData.name}
                                    onChange={(e) => {
                                        setParentFormData({ ...parentFormData, name: e.target.value });
                                        if (error) setError('');
                                    }}
                                    placeholder={t('forms.createPatientFlow.parentNamePlaceholder')}
                                />
                            </div>
                            <div>
                                <Label htmlFor="parent-email">{t('forms.createPatientFlow.emailAddress')}</Label>
                                <Input
                                    id="parent-email"
                                    type="email"
                                    value={parentFormData.email}
                                    onChange={(e) => {
                                        setParentFormData({ ...parentFormData, email: e.target.value });
                                        if (error) setError('');
                                    }}
                                    placeholder={t('forms.createPatientFlow.emailAddressPlaceholder')}
                                />
                            </div>
                            <div>
                                <Label htmlFor="parent-phone">{t('forms.createPatientFlow.phoneNumber')}</Label>
                                <Input
                                    id="parent-phone"
                                    type="tel"
                                    value={parentFormData.phoneNumber}
                                    onChange={(e) => {
                                        const input = e.target.value;
                                        const digits = input.replace(/\D/g, '');
                                        const limited = digits.slice(0, 11);
                                        let formatted = limited;

                                        if (limited.length <= 10) {
                                            if (limited.length > 6) {
                                                formatted = `${limited.slice(0, 2)}-${limited.slice(2, 6)}-${limited.slice(6)}`;
                                            } else if (limited.length > 2) {
                                                formatted = `${limited.slice(0, 2)}-${limited.slice(2)}`;
                                            }
                                        } else {
                                            if (limited.length > 7) {
                                                formatted = `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`;
                                            } else if (limited.length > 3) {
                                                formatted = `${limited.slice(0, 3)}-${limited.slice(3)}`;
                                            }
                                        }

                                        setParentFormData({ ...parentFormData, phoneNumber: formatted });
                                        if (error) setError('');
                                    }}
                                    placeholder={t('forms.createPatientFlow.phoneNumberPlaceholder')}
                                />
                            </div>
                            <div>
                                <GoogleAddressAutocompleteNew
                                    id="parent-address"
                                    label={t('forms.createPatientFlow.homeAddress')}
                                    value={parentFormData.homeAddress}
                                    onChange={(data: AddressData) => {
                                        setParentFormData({
                                            ...parentFormData,
                                            homeAddress: data.address,
                                            latitude: data.latitude,
                                            longitude: data.longitude,
                                        });
                                        if (error) setError('');
                                    }}
                                    placeholder={t('forms.createPatientFlow.homeAddressPlaceholder')}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button onClick={handleBack} variant="outline" className="flex-1">
                                {t('common.back')}
                            </Button>
                            <Button
                                onClick={handleParentCreate}
                                disabled={createParentMutation.isPending}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                {createParentMutation.isPending ? t('common.creating') : t('forms.createPatientFlow.createParent')}
                            </Button>
                        </div>
                    </div>
                );

            case 'search-child':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold">{t('forms.createPatientFlow.selectChild')}</h3>
                            <p className="text-sm text-gray-600">{t('forms.createPatientFlow.selectChildDescription', { name: selectedParent?.name || '' })}</p>
                        </div>

                        {isLoadingChildren ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-sm text-gray-500">{t('forms.createPatientFlow.loadingChildren')}</p>
                            </div>
                        ) : parentChildren.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                                {parentChildren.map((child) => (
                                    <div
                                        key={child.id}
                                        onClick={() => handleChildSelect(child as ChildData)}
                                        className="group cursor-pointer border rounded-xl p-4 hover:border-blue-200 hover:bg-blue-50 transition-all flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            {child.imageUrl ? (
                                                <ImageModal
                                                    imageUrl={child.imageUrl}
                                                    alt={child.name}
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-colors"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                                                    <User className="w-5 h-5" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{child.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {t('forms.child.birthdate')}: {new Date(child.birthdate).toLocaleDateString(router.locale || 'en')}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <p className="text-sm text-gray-500">{t('forms.createPatientFlow.noChildrenFound')}</p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button onClick={handleBack} variant="outline" className="flex-1">
                                {t('common.back')}
                            </Button>
                            <Button onClick={() => setCurrentStep('create-child')} variant="default" className="flex-1 bg-blue-600 hover:bg-blue-700">
                                {t('forms.createPatientFlow.addNewChild')}
                            </Button>
                        </div>
                    </div>
                );

            case 'create-child':
                return (
                    <div className="space-y-6">
                        <ChildForm
                            mode="create"
                            defaultValues={{
                                name: '',
                                pronunciation: '',
                                gender: 'Male',
                                allergies: '',
                                preexistingConditions: '',
                                familyDoctorName: '',
                                familyDoctorPhone: '',
                            }}
                            onSubmit={handleChildCreate}
                            onCancel={handleBack}
                            isLoading={createChildMutation.isPending}
                        />
                    </div>
                );

            case 'create-visit':
                return (
                    <div className="space-y-6">
                        <VisitForm
                            mode="create"
                            defaultValues={{
                                dropOffTime: new Date(),
                                status: 'active',
                            }}
                            onSubmit={handleVisitSubmit}
                            onCancel={handleBack}
                            isLoading={createVisitMutation.isPending}
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    const activeStepIndex = getActiveStepIndex();

    return (
        <div className="space-y-6 py-2">
            {/* Visual Progress Stepper */}
            <div className="relative flex items-center justify-between px-2">
                <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2" />
                <div className="absolute left-0 top-1/2 h-0.5 bg-blue-600 -z-10 transform -translate-y-1/2 transition-all duration-300"
                    style={{ width: `${(activeStepIndex / (steps.length - 1)) * 100}%` }} />

                {steps.map((step, index) => {
                    const isActive = index <= activeStepIndex;
                    const isCurrent = index === activeStepIndex;
                    const Icon = step.icon;

                    return (
                        <div key={step.title} className="flex flex-col items-center gap-2 bg-white px-2">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                isActive
                                    ? "bg-blue-600 border-blue-600 text-white shadow-md scale-110"
                                    : "bg-white border-gray-300 text-gray-400"
                            )}>
                                {index < activeStepIndex ? (
                                    <Check className="w-6 h-6" />
                                ) : (
                                    <Icon className="w-5 h-5" />
                                )}
                            </div>
                            <span className={cn(
                                "text-xs font-medium transition-colors duration-300",
                                isActive ? "text-blue-600" : "text-gray-400"
                            )}>
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="animate-in fade-in duration-300">
                {renderStep()}
            </div>
        </div>
    );
}
