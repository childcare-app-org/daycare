import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { ChildForm } from '~/components/forms/ChildForm';
import { RegisterVisitForm } from '~/components/forms/RegisterVisitForm';
import { ActionMenu } from '~/components/shared/ActionMenu';
import { DeleteDialog } from '~/components/shared/DeleteDialog';
import { EditDialog } from '~/components/shared/EditDialog';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { api } from '~/utils/api';

import type { ChildFormData } from '~/components/forms/ChildForm';
import type { RegisterVisitFormData } from '~/components/forms/RegisterVisitForm';

type Child = {
    id?: string | null;
    name?: string | null;
    birthdate?: Date | null;
    allergies?: string | null;
    preexistingConditions?: string | null;
    familyDoctorName?: string | null;
    familyDoctorPhone?: string | null;
};

// Helper function to calculate age in months from birthdate
const calculateAgeInMonths = (birthdate: Date | null | undefined): number => {
    if (!birthdate) return 0;
    const today = new Date();
    const years = today.getFullYear() - birthdate.getFullYear();
    const months = today.getMonth() - birthdate.getMonth();
    return years * 12 + months;
};

export function ParentDashboard() {
    const { data: session } = useSession();
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
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Welcome, {session?.user?.name}
                </h1>
                <p className="text-lg text-gray-600">Parent Dashboard</p>
            </div>

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
                                const ageMonths = calculateAgeInMonths(child.birthdate);
                                return (
                                    <div key={child.id} className="p-4 sm:p-6 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                            <div className="flex-1 space-y-3 sm:space-y-4">
                                                {/* Name - Primary Hierarchy */}
                                                <div>
                                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{child.name}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {Math.floor(ageMonths / 12)} years, {ageMonths % 12} months old
                                                    </p>
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
                                                                    Allergies: {child.allergies}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {child.preexistingConditions && (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                                                                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                                    </svg>
                                                                    Conditions: {child.preexistingConditions}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right Side - Visit Details & Actions */}
                                            <div className="flex flex-col items-stretch sm:items-end gap-3 flex-shrink-0 w-full sm:w-auto">
                                                {/* Active Visit Status */}
                                                {activeVisit && (
                                                    <div className="text-left sm:text-right">
                                                        <div className="flex items-center sm:justify-end gap-2 mb-1.5">
                                                            <span className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-green-50 text-green-800 border border-green-200 break-words">
                                                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                                </svg>
                                                                <span className="break-words">Currently at {activeVisit.hospital?.name}</span>
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 font-medium">
                                                            Dropped off: {new Date(activeVisit.dropOffTime).toLocaleString()}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="flex items-stretch sm:items-start gap-2 w-full sm:w-auto">
                                                    {activeVisit ? (
                                                        <Link href={`/visit/parent/${activeVisit.id}`} className="flex-1 sm:flex-initial">
                                                            <Button variant="outline" className="w-full sm:w-auto whitespace-nowrap">
                                                                View Visit
                                                            </Button>
                                                        </Link>
                                                    ) : (
                                                        <Button onClick={() => handleRegisterVisit(child)} className="flex-1 sm:flex-initial whitespace-nowrap">
                                                            Register for Visit
                                                        </Button>
                                                    )}
                                                    <ActionMenu
                                                        onEdit={() => handleEdit(child)}
                                                        onDelete={() => handleDelete(child)}
                                                    />
                                                </div>
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
                title="Delete Child"
                description={`Are you sure you want to delete ${deletingChild?.name}? This action cannot be undone and will permanently remove all records associated with this child.`}
                isLoading={deleteChildMutation.isPending}
                error={error}
            />

            {/* Register Visit Dialog */}
            <EditDialog
                open={!!registeringVisitForChild}
                onOpenChange={() => setRegisteringVisitForChild(null)}
                title="Register Visit"
                description={`Register ${registeringVisitForChild?.name} for a daycare visit`}
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
