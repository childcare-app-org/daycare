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
                    <CardTitle>Hospitals</CardTitle>
                    <CardDescription>Loading hospitals...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Hospitals</CardTitle>
                        <CardDescription>
                            {hospitals?.length || 0} hospital{hospitals?.length !== 1 ? 's' : ''} in the system
                        </CardDescription>
                    </div>
                    <Button onClick={handleCreate}>Add Hospital</Button>
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
                                                    <span className="font-medium">Capacity:</span> {hospital.capacity} children
                                                </span>
                                                <span>
                                                    <span className="font-medium">Daily Rate:</span> ${hospital.pricing}
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
                        <p className="text-gray-500 mb-4">No hospitals yet</p>
                        <Button onClick={handleCreate}>Create Your First Hospital</Button>
                    </div>
                )}
            </CardContent>

            {/* Create Hospital Dialog */}
            <EditDialog
                open={showCreateModal}
                onOpenChange={() => setShowCreateModal(false)}
                title="Create Hospital"
                description="Add a new hospital to the system"
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
                title="Edit Hospital"
                description="Update hospital information"
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
                title="Delete Hospital"
                description={`Are you sure you want to delete ${deletingHospital?.name}? This action cannot be undone.`}
                isLoading={deleteHospitalMutation.isPending}
                error={error}
            />
        </Card>
    );
}

