import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import { HospitalForm } from '~/components/forms/HospitalForm';
import { ActionMenu } from '~/components/shared/ActionMenu';
import { DeleteDialog } from '~/components/shared/DeleteDialog';
import { EditDialog } from '~/components/shared/EditDialog';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { api } from '~/utils/api';

import type { HospitalFormData } from '~/components/forms/HospitalForm';

type Hospital = {
    id: string;
    name: string;
    address: string;
    capacity: number;
    pricing: string;
};

export function HospitalList() {
    const t = useTranslations();
    const { data: hospitals, isLoading, refetch } = api.hospital.getAll.useQuery();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
    const [deletingHospital, setDeletingHospital] = useState<Hospital | null>(null);
    const [error, setError] = useState('');

    const createHospitalMutation = api.hospital.create.useMutation({
        onSuccess: () => {
            setShowCreateModal(false);
            setError('');
            refetch();
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const updateHospitalMutation = api.hospital.update.useMutation({
        onSuccess: () => {
            setEditingHospital(null);
            setError('');
            refetch();
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const deleteHospitalMutation = api.hospital.delete.useMutation({
        onSuccess: () => {
            setDeletingHospital(null);
            refetch();
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const handleCreate = () => {
        setShowCreateModal(true);
        setError('');
    };

    const handleEdit = (hospital: Hospital, e: React.MouseEvent) => {
        setEditingHospital(hospital);
        setError('');
    };

    const handleDelete = (hospital: Hospital, e: React.MouseEvent) => {
        setDeletingHospital(hospital);
        setError('');
    };

    const handleCreateSubmit = (data: HospitalFormData) => {
        createHospitalMutation.mutate(data);
    };

    const handleUpdateSubmit = (data: HospitalFormData) => {
        if (!editingHospital) return;
        updateHospitalMutation.mutate({
            id: editingHospital.id,
            ...data,
        });
    };

    const handleDeleteConfirm = () => {
        if (!deletingHospital) return;
        deleteHospitalMutation.mutate({ id: deletingHospital.id });
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('hospital.hospitals')}</CardTitle>
                    <CardDescription>{t('hospital.loadingHospitals')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const hospitalCount = hospitals?.length || 0;
    const hospitalPlural = hospitalCount !== 1 ? 's' : '';

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>{t('hospital.hospitals')}</CardTitle>
                        <CardDescription>
                            {t('hospital.hospitalsInSystem', { count: hospitalCount, hospitals: hospitalPlural })}
                        </CardDescription>
                    </div>
                    <Button onClick={handleCreate}>{t('hospital.addHospital')}</Button>
                </div>
            </CardHeader>
            <CardContent>
                {hospitals && hospitals.length > 0 ? (
                    <div className="space-y-4">
                        {hospitals.map((hospital) => (
                            <div key={hospital.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <Link href={`/hospital/${hospital.id}`} className="flex-1">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg mb-1">{hospital.name}</h3>
                                            <p className="text-sm text-gray-600 mb-2">{hospital.address}</p>
                                            <div className="flex gap-4 text-sm text-gray-500">
                                                <span>
                                                    <span className="font-medium">{t('hospital.capacity')}:</span> {hospital.capacity} {t('hospital.children')}
                                                </span>
                                                <span>
                                                    <span className="font-medium">{t('hospital.dailyRate')}:</span> {t('common.currencySymbol')}{Math.round(parseFloat(hospital.pricing))}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                    <ActionMenu
                                        onEdit={() => handleEdit(hospital, {} as React.MouseEvent)}
                                        onDelete={() => handleDelete(hospital, {} as React.MouseEvent)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">{t('hospital.noHospitalsYet')}</p>
                        <Button onClick={handleCreate}>{t('hospital.createFirstHospital')}</Button>
                    </div>
                )}
            </CardContent>

            {/* Create Hospital Dialog */}
            <EditDialog
                open={showCreateModal}
                onOpenChange={() => setShowCreateModal(false)}
                title={t('hospital.createHospital')}
                description={t('hospital.createHospitalDescription')}
                error={error}
            >
                <HospitalForm
                    mode="create"
                    onSubmit={handleCreateSubmit}
                    onCancel={() => setShowCreateModal(false)}
                    isLoading={createHospitalMutation.isPending}
                />
            </EditDialog>

            {/* Edit Hospital Dialog */}
            <EditDialog
                open={!!editingHospital}
                onOpenChange={() => setEditingHospital(null)}
                title={t('hospital.editHospital')}
                description={t('hospital.editHospitalDescription')}
                error={error}
            >
                <HospitalForm
                    mode="edit"
                    defaultValues={editingHospital ? {
                        name: editingHospital.name,
                        address: editingHospital.address,
                        capacity: editingHospital.capacity,
                        pricing: parseFloat(editingHospital.pricing),
                    } : undefined}
                    onSubmit={handleUpdateSubmit}
                    onCancel={() => setEditingHospital(null)}
                    isLoading={updateHospitalMutation.isPending}
                />
            </EditDialog>

            {/* Delete Hospital Confirmation Dialog */}
            <DeleteDialog
                open={!!deletingHospital}
                onOpenChange={() => setDeletingHospital(null)}
                onConfirm={handleDeleteConfirm}
                title={t('hospital.deleteHospital')}
                description={t('hospital.deleteHospitalDescription', { name: deletingHospital?.name || '' })}
                isLoading={deleteHospitalMutation.isPending}
                error={error}
            />
        </Card>
    );
}

