import Link from 'next/link';
import { useState } from 'react';
import { VisitForm } from '~/components/forms/VisitForm';
import { ActionMenu } from '~/components/shared/ActionMenu';
import { DeleteDialog } from '~/components/shared/DeleteDialog';
import { EditDialog } from '~/components/shared/EditDialog';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { api } from '~/utils/api';

import type { VisitFormData } from '~/components/forms/VisitForm';

type Visit = {
    id: string;
    dropOffTime: Date;
    pickupTime: Date | null;
    status: string;
    notes: string | null;
    child?: { name?: string | null } | null;
    parent?: { name?: string | null } | null;
};

export function NurseDashboard() {
    const { data: activeVisits, isLoading, refetch } = api.visit.getMyHospitalActiveVisits.useQuery();
    const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
    const [deletingVisit, setDeletingVisit] = useState<Visit | null>(null);
    const [error, setError] = useState('');

    const updateVisitMutation = api.visit.update.useMutation({
        onSuccess: () => {
            setEditingVisit(null);
            setError('');
            refetch();
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const deleteVisitMutation = api.visit.delete.useMutation({
        onSuccess: () => {
            setDeletingVisit(null);
            refetch();
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const handleEdit = (visit: Visit) => {
        setEditingVisit(visit);
        setError('');
    };

    const handleDelete = (visit: Visit) => {
        setDeletingVisit(visit);
        setError('');
    };

    const handleUpdateSubmit = (data: VisitFormData) => {
        if (!editingVisit) return;
        updateVisitMutation.mutate({
            id: editingVisit.id,
            ...data,
        });
    };

    const handleDeleteConfirm = () => {
        if (!deletingVisit) return;
        deleteVisitMutation.mutate({ id: deletingVisit.id });
    };

    if (isLoading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading active visits...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Active Visits List */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Visits</CardTitle>
                    <CardDescription>
                        Children currently at your hospital
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {activeVisits && activeVisits.length > 0 ? (
                        <div className="space-y-4">
                            {activeVisits.map((visit) => (
                                <div key={visit.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <Link href={`/visit/${visit.id}`}>
                                                <h3 className="font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">
                                                    {visit.child?.name}
                                                </h3>
                                            </Link>
                                            <p className="text-sm text-gray-600">
                                                Parent: {visit.parent?.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Dropped off: {new Date(visit.dropOffTime).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2 ml-4">
                                            <div className="text-right">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                                <div className="mt-2">
                                                    <Link href={`/visit/${visit.id}`}>
                                                        <Button size="sm" variant="outline">
                                                            View Timeline
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                            <ActionMenu
                                                onEdit={() => handleEdit(visit)}
                                                onDelete={() => handleDelete(visit)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No active visits at your hospital</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Visit Dialog */}
            <EditDialog
                open={!!editingVisit}
                onOpenChange={() => setEditingVisit(null)}
                title="Edit Visit"
                description={`Update visit information for ${editingVisit?.child?.name}`}
                error={error}
            >
                <VisitForm
                    mode="edit"
                    defaultValues={editingVisit ? {
                        dropOffTime: editingVisit.dropOffTime,
                        pickupTime: editingVisit.pickupTime || undefined,
                        status: editingVisit.status as 'active' | 'completed' | 'cancelled',
                        notes: editingVisit.notes || '',
                    } : undefined}
                    onSubmit={handleUpdateSubmit}
                    onCancel={() => setEditingVisit(null)}
                    isLoading={updateVisitMutation.isPending}
                />
            </EditDialog>

            {/* Delete Visit Confirmation Dialog */}
            <DeleteDialog
                open={!!deletingVisit}
                onOpenChange={() => setDeletingVisit(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Visit"
                description={`Are you sure you want to delete the visit for ${deletingVisit?.child?.name}? This action cannot be undone and will permanently remove this visit record from the database.`}
                isLoading={deleteVisitMutation.isPending}
                error={error}
            />
        </div>
    );
}
