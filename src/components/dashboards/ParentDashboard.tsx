import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ChildForm } from '~/components/forms/ChildForm';
import { RegisterVisitForm } from '~/components/forms/RegisterVisitForm';
import { DashboardHeader } from '~/components/shared/DashboardHeader';
import { DeleteDialog } from '~/components/shared/DeleteDialog';
import { EditDialog } from '~/components/shared/EditDialog';
import { api } from '~/utils/api';

import { ChildrenList } from './parent/ChildrenList';

import type { ChildFormData } from '~/components/forms/ChildForm';
import type { RegisterVisitFormData } from '~/components/forms/RegisterVisitForm';
import type { Child } from './parent/ChildItem';

export function ParentDashboard() {
    const { data: session } = useSession();
    const t = useTranslations();
    const { data: activeVisits, isLoading: visitsLoading, refetch: refetchVisits } = api.visit.getMyChildrenActiveVisits.useQuery();
    const { data: children, isLoading: childrenLoading, refetch } = api.patient.getMyChildren.useQuery();
    const { data: hospitals } = api.hospital.getAllPublic.useQuery();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [registeringVisitForChild, setRegisteringVisitForChild] = useState<Child | null>(null);
    const [editingChild, setEditingChild] = useState<Child | null>(null);
    const [deletingChild, setDeletingChild] = useState<Child | null>(null);
    const [error, setError] = useState('');

    const createChildMutation = api.patient.createChild.useMutation({
        onSuccess: () => {
            setShowCreateModal(false);
            setError('');
            refetch();
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const updateChildMutation = api.patient.updateChild.useMutation({
        onSuccess: () => {
            setEditingChild(null);
            setError('');
            refetch();
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const deleteChildMutation = api.patient.deleteChild.useMutation({
        onSuccess: () => {
            setDeletingChild(null);
            refetch();
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const createVisitMutation = api.visit.create.useMutation({
        onSuccess: () => {
            setRegisteringVisitForChild(null);
            setError('');
            refetchVisits();
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const handleCreate = () => {
        setShowCreateModal(true);
        setError('');
    };

    const handleEdit = (child: Child) => {
        setEditingChild(child);
        setError('');
    };

    // Helper function to check if a child has an active visit
    const getChildActiveVisit = (childId: string | null | undefined) => {
        if (!childId) return null;
        return activeVisits?.find(visit => visit.childId === childId) || null;
    };

    const handleDelete = (child: Child) => {
        setDeletingChild(child);
        setError('');
    };

    const handleCreateSubmit = (data: ChildFormData) => {
        createChildMutation.mutate(data);
    };

    const handleUpdateSubmit = (data: ChildFormData) => {
        if (!editingChild?.id) return;
        updateChildMutation.mutate({
            id: editingChild.id,
            ...data,
        });
    };

    const handleDeleteConfirm = () => {
        if (!deletingChild?.id) return;
        deleteChildMutation.mutate({ id: deletingChild.id });
    };

    const handleRegisterVisit = (child: Child) => {
        setRegisteringVisitForChild(child);
        setError('');
    };

    const handleRegisterVisitSubmit = (data: RegisterVisitFormData) => {
        const dropOffTime = new Date();
        createVisitMutation.mutate({
            childId: data.childId,
            hospitalId: data.hospitalId,
            dropOffTime,
            pickupTime: data.pickupTime,
            accessCode: data.accessCode,
            notes: data.notes,
        });
    };

    if (visitsLoading || childrenLoading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{t('common.loading')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        {t('common.welcome', { name: session?.user?.name || '' })}
                    </h1>
                    <p className="text-lg text-gray-600">{t('dashboard.parent.title')}</p>
                </div>
                <DashboardHeader />
            </div>

            {/* Children List */}
            <ChildrenList
                children={children || []}
                activeVisits={activeVisits || []}
                onAddChild={handleCreate}
                onEditChild={handleEdit}
                onDeleteChild={handleDelete}
                onRegisterVisit={handleRegisterVisit}
            />

            {/* Create Child Dialog */}
            <EditDialog
                open={showCreateModal}
                onOpenChange={() => setShowCreateModal(false)}
                title={t('dashboard.parent.createChild')}
                description={t('dashboard.parent.createChildDescription')}
                error={error}
            >
                <ChildForm
                    mode="create"
                    onSubmit={handleCreateSubmit}
                    onCancel={() => setShowCreateModal(false)}
                    isLoading={createChildMutation.isPending}
                />
            </EditDialog>

            {/* Edit Child Dialog */}
            <EditDialog
                open={!!editingChild}
                onOpenChange={() => setEditingChild(null)}
                title={t('dashboard.parent.editChild')}
                description={t('dashboard.parent.editChildDescription', { name: editingChild?.name || '' })}
                error={error}
                banner={editingChild && getChildActiveVisit(editingChild.id) ? (
                    <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="font-semibold">{t('dashboard.parent.activeVisitWarning')}</p>
                            <p className="mt-1">{t('dashboard.parent.activeVisitWarningDescription')}</p>
                        </div>
                    </div>
                ) : undefined}
            >
                <ChildForm
                    mode="edit"
                    defaultValues={editingChild ? {
                        name: editingChild.name || '',
                        pronunciation: editingChild.pronunciation || '',
                        gender: (editingChild.gender as 'Male' | 'Female') || 'Male',
                        birthdate: editingChild.birthdate || new Date(new Date().setFullYear(new Date().getFullYear() - 3)),
                        allergies: editingChild.allergies || '',
                        preexistingConditions: editingChild.preexistingConditions || '',
                        familyDoctorName: editingChild.familyDoctorName || '',
                        familyDoctorPhone: editingChild.familyDoctorPhone || '',
                    } : undefined}
                    onSubmit={handleUpdateSubmit}
                    onCancel={() => setEditingChild(null)}
                    isLoading={updateChildMutation.isPending}
                    disabled={!!(editingChild && getChildActiveVisit(editingChild.id))}
                />
            </EditDialog>

            {/* Delete Child Confirmation Dialog */}
            <DeleteDialog
                open={!!deletingChild}
                onOpenChange={() => setDeletingChild(null)}
                onConfirm={handleDeleteConfirm}
                title={t('dashboard.parent.deleteChild')}
                description={t('dashboard.parent.deleteChildDescription', { name: deletingChild?.name || '' })}
                isLoading={deleteChildMutation.isPending}
                error={error}
            />

            {/* Register Visit Dialog */}
            <EditDialog
                open={!!registeringVisitForChild}
                onOpenChange={() => setRegisteringVisitForChild(null)}
                title={t('dashboard.parent.registerVisit')}
                description={t('dashboard.parent.registerVisitDescription', { name: registeringVisitForChild?.name || '' })}
                error={error}
            >
                <RegisterVisitForm
                    childId={registeringVisitForChild?.id || ''}
                    childName={registeringVisitForChild?.name || ''}
                    hospitals={hospitals?.map(h => ({
                        id: h.id,
                        name: h.name,
                        pricing: h.pricing
                    })) || []}
                    onSubmit={handleRegisterVisitSubmit}
                    onCancel={() => setRegisteringVisitForChild(null)}
                    isLoading={createVisitMutation.isPending}
                />
            </EditDialog>
        </div>
    );
}
