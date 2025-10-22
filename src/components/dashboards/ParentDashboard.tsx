import Link from 'next/link';
import { useState } from 'react';
import { ChildForm } from '~/components/forms/ChildForm';
import { ActionMenu } from '~/components/shared/ActionMenu';
import { DeleteDialog } from '~/components/shared/DeleteDialog';
import { EditDialog } from '~/components/shared/EditDialog';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { api } from '~/utils/api';

import type { ChildFormData } from '~/components/forms/ChildForm';

type Child = {
    id?: string | null;
    name?: string | null;
    age?: number | null;
    allergies?: string | null;
    preexistingConditions?: string | null;
    familyDoctorName?: string | null;
    familyDoctorPhone?: string | null;
};

export function ParentDashboard() {
    const { data: activeVisits, isLoading: visitsLoading } = api.visit.getMyChildrenActiveVisits.useQuery();
    const { data: children, isLoading: childrenLoading, refetch } = api.patient.getMyChildren.useQuery();
    const [showCreateModal, setShowCreateModal] = useState(false);
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
        createChildMutation.mutate({
            ...data,
            relationshipType: 'Parent',
        });
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

    if (visitsLoading || childrenLoading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your children...</p>
            </div>
        );
    }

    // Helper function to check if a child has an active visit
    const getChildVisitStatus = (childId: string) => {
        return activeVisits?.find(visit => visit.childId === childId);
    };

    return (
        <div className="space-y-6">
            {/* Children List */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>My Children</CardTitle>
                            <CardDescription>
                                Manage your children and their daycare visits
                            </CardDescription>
                        </div>
                        <Button onClick={handleCreate}>+ Add Child</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {children && children.length > 0 ? (
                        <div className="space-y-4">
                            {children.map((child) => {
                                const activeVisit = getChildVisitStatus(child.id || '');
                                return (
                                    <div key={child.id} className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg">{child.name}</h3>
                                                <p className="text-sm text-gray-600">
                                                    Age: {Math.floor((child.age || 0) / 12)} years, {(child.age || 0) % 12} months
                                                </p>
                                                {child.allergies && (
                                                    <p className="text-sm text-red-600">
                                                        Allergies: {child.allergies}
                                                    </p>
                                                )}
                                                {child.preexistingConditions && (
                                                    <p className="text-sm text-orange-600">
                                                        Conditions: {child.preexistingConditions}
                                                    </p>
                                                )}
                                                {activeVisit && (
                                                    <div className="mt-2">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Currently at {activeVisit.hospital?.name}
                                                        </span>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Since: {new Date(activeVisit.dropOffTime).toLocaleString()}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-start gap-2 ml-4">
                                                {activeVisit ? (
                                                    <Link href={`/visit/${activeVisit.id}`}>
                                                        <Button variant="outline">
                                                            View Visit
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Link href={`/register-visit?childId=${child.id}`}>
                                                        <Button>
                                                            Register for Visit
                                                        </Button>
                                                    </Link>
                                                )}
                                                <ActionMenu
                                                    onEdit={() => handleEdit(child)}
                                                    onDelete={() => handleDelete(child)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">No children registered yet</p>
                            <Button onClick={handleCreate}>Add Your First Child</Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Child Dialog */}
            <EditDialog
                open={showCreateModal}
                onOpenChange={() => setShowCreateModal(false)}
                title="Create Child"
                description="Register a new child for daycare"
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
                title="Edit Child"
                description={`Update ${editingChild?.name}'s information`}
                error={error}
            >
                <ChildForm
                    mode="edit"
                    defaultValues={editingChild ? {
                        name: editingChild.name || '',
                        age: editingChild.age || 36,
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
                title="Delete Child"
                description={`Are you sure you want to delete ${deletingChild?.name}? This action cannot be undone and will permanently remove all records associated with this child.`}
                isLoading={deleteChildMutation.isPending}
                error={error}
            />
        </div>
    );
}
