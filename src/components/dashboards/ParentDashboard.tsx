import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ChildForm } from '~/components/forms/ChildForm';
import { RegisterVisitForm } from '~/components/forms/RegisterVisitForm';
import { DeleteDialog } from '~/components/shared/DeleteDialog';
import { EditDialog } from '~/components/shared/EditDialog';
import { LanguageSwitcher } from '~/components/shared/LanguageSwitcher';
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
                <LanguageSwitcher />
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
            >
                <ChildForm
                    mode="edit"
                    defaultValues={editingChild ? {
                        name: editingChild.name || '',
                        birthdate: editingChild.birthdate || new Date(new Date().setFullYear(new Date().getFullYear() - 3)),
                        allergies: editingChild.allergies || '',
                        preexistingConditions: editingChild.preexistingConditions || '',
                        familyDoctorName: editingChild.familyDoctorName || '',
                        familyDoctorPhone: editingChild.familyDoctorPhone || '',
                    } : undefined}
                    onSubmit={handleUpdateSubmit}
                    onCancel={() => setEditingChild(null)}
                    isLoading={updateChildMutation.isPending}
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
