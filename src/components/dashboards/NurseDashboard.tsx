import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { CreatePatientFlow } from '~/components/forms/CreatePatientFlow';
import { VisitForm } from '~/components/forms/VisitForm';
import { ActionMenu } from '~/components/shared/ActionMenu';
import { DeleteDialog } from '~/components/shared/DeleteDialog';
import { EditDialog } from '~/components/shared/EditDialog';
import { SearchComponent } from '~/components/shared/SearchComponent';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { api } from '~/utils/api';

import type { VisitFormData } from '~/components/forms/VisitForm';
import type { RouterOutputs } from '~/utils/api';

type Visit = {
    id: string;
    dropOffTime: Date;
    pickupTime: Date | null;
    status: string;
    notes: string | null;
    child?: { name?: string | null } | null;
    parent?: { name?: string | null } | null;
};

type VisitListItemProps = {
    visit: RouterOutputs['visit']['getMyHospitalActiveVisits'][number] | RouterOutputs['visit']['getMyHospitalTodaysCompletedVisits'][number];
    showActions?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
};

function VisitListItem({ visit, showActions = false, onEdit, onDelete }: VisitListItemProps) {
    const isCompleted = visit.status === 'completed';
    const avatarBg = isCompleted ? 'bg-green-100' : 'bg-blue-100';
    const avatarText = isCompleted ? 'text-green-600' : 'text-blue-600';

    return (
        <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <Link href={`/visit/${visit.id}`} className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${avatarBg} flex items-center justify-center ${avatarText} font-bold text-lg shrink-0`}>
                            {visit.child?.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-blue-600 hover:text-blue-800'}`}>
                                {visit.child?.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                                Parent: {visit.parent?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                                Dropped off: {new Date(visit.dropOffTime).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </Link>
                {showActions && (
                    <div className="flex items-center gap-2 ml-4 my-auto shrink-0">
                        <ActionMenu
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export function NurseDashboard() {
    const { data: session } = useSession();
    const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
    const [deletingVisit, setDeletingVisit] = useState<Visit | null>(null);
    const [error, setError] = useState('');
    const [showRegisterVisitModal, setShowRegisterVisitModal] = useState(false);
    const [showCreatePatientModal, setShowCreatePatientModal] = useState(false);
    const [selectedChildForVisit, setSelectedChildForVisit] = useState<any>(null);
    const [showVisitForm, setShowVisitForm] = useState(false);
    const [childSearchQuery, setChildSearchQuery] = useState('');

    const { data: activeVisits, isLoading, refetch } = api.visit.getMyHospitalActiveVisits.useQuery();
    const { data: todaysCompletedVisits, isLoading: isLoadingTodaysVisits, refetch: refetchTodaysVisits } = api.visit.getMyHospitalTodaysCompletedVisits.useQuery();
    const { data: accessCodeData } = api.hospital.getAccessCode.useQuery();
    const { data: nurseProfile } = api.nurse.getMyProfile.useQuery();
    const { data: childSearchResults = [], isLoading: isSearchingChildren } = api.patient.searchChildren.useQuery(
        { query: childSearchQuery },
        { enabled: childSearchQuery.length >= 2 && showRegisterVisitModal }
    );

    const updateVisitMutation = api.visit.update.useMutation({
        onSuccess: () => {
            setEditingVisit(null);
            setError('');
            refetch();
            refetchTodaysVisits();
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

    const createVisitMutation = api.visit.create.useMutation({
        onSuccess: () => {
            setShowVisitForm(false);
            setSelectedChildForVisit(null);
            setError('');
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

    const handleVisitSubmit = (data: VisitFormData) => {
        if (!selectedChildForVisit || !data.pickupTime) return;

        createVisitMutation.mutate({
            childId: selectedChildForVisit.id,
            hospitalId: nurseProfile?.hospitalId || '', // Use nurse's hospital
            dropOffTime: data.dropOffTime,
            pickupTime: data.pickupTime,
            notes: data.notes,
        });
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
            {/* Header with Welcome Message and Access Code */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Welcome, {session?.user?.name}
                    </h1>
                    <p className="text-lg text-gray-600 mb-2">Nurse Dashboard</p>
                    {accessCodeData && (
                        <p className="text-gray-600">Hospital: {accessCodeData.hospitalName}</p>
                    )}
                </div>
                {accessCodeData && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                        <p className="text-sm text-gray-600 mb-1">Access Code</p>
                        <p className="text-2xl font-bold text-blue-600">{accessCodeData.accessCode}</p>
                    </div>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Create a Visit</CardTitle>
                    <CardDescription>
                        Create a visit for a returning or new patient
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Button
                            onClick={() => setShowRegisterVisitModal(true)}
                            className="flex-1"
                        >
                            Returning Patient
                        </Button>
                        <Button
                            onClick={() => setShowCreatePatientModal(true)}
                            variant="outline"
                            className="flex-1"
                        >
                            New Patient
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Active Visits List */}
            <Card className="mb-8">
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
                                <VisitListItem
                                    key={visit.id}
                                    visit={visit}
                                    showActions
                                    onEdit={() => handleEdit(visit)}
                                    onDelete={() => handleDelete(visit)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No active visits at your hospital</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Today's Completed Visits Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Today's Visits</CardTitle>
                    <CardDescription>Completed visits from today</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingTodaysVisits ? (
                        <p className="text-gray-500 text-center py-8">Loading...</p>
                    ) : todaysCompletedVisits && todaysCompletedVisits.length > 0 ? (
                        <div className="space-y-4">
                            {todaysCompletedVisits.map((visit) => (
                                <VisitListItem
                                    key={visit.id}
                                    visit={visit}
                                    showActions
                                    onEdit={() => handleEdit(visit)}
                                    onDelete={() => handleDelete(visit)}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No completed visits today.</p>
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
                description={`Are you sure you want to delete the visit for ${deletingVisit?.child?.name}? This action cannot be undone and will permanently remove this visit record and all associated logs from the database.`}
                isLoading={deleteVisitMutation.isPending}
                error={error}
            />

            {/* Register Visit Modal */}
            <EditDialog
                open={showRegisterVisitModal}
                onOpenChange={() => {
                    setShowRegisterVisitModal(false);
                    setChildSearchQuery('');
                }}
                title="Register Visit"
                description="Search and select a child to register a visit"
                error=""
            >
                <SearchComponent
                    title=""
                    placeholder="Search by child name..."
                    searchQuery={childSearchQuery}
                    onSearchQueryChange={setChildSearchQuery}
                    searchResults={childSearchResults}
                    isLoading={isSearchingChildren}
                    emptyMessage="No children found."
                    renderResult={(child) => (
                        <div className="group space-y-2 py-1">
                            <div className="flex items-start justify-between gap-3">
                                <h3 className="font-semibold text-sm leading-tight">{child.name}</h3>
                                <span className="text-xs text-muted-foreground shrink-0">
                                    {new Date(child.birthdate).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">Parent: {child.parentName}</p>
                        </div>
                    )}
                    onSelect={(child) => {
                        setSelectedChildForVisit(child);
                        setShowRegisterVisitModal(false);
                        setShowVisitForm(true);
                        setChildSearchQuery('');
                    }}
                    onCancel={() => {
                        setShowRegisterVisitModal(false);
                        setChildSearchQuery('');
                    }}
                />
            </EditDialog>

            {/* Create Patient Modal */}
            <EditDialog
                open={showCreatePatientModal}
                onOpenChange={() => setShowCreatePatientModal(false)}
                title="Create New Patient"
                description="Complete the following steps to register a new patient and create a visit"
                error=""
            >
                <CreatePatientFlow
                    onCancel={() => setShowCreatePatientModal(false)}
                    onComplete={() => {
                        setShowCreatePatientModal(false);
                        refetch(); // Refresh the visits list
                    }}
                />
            </EditDialog>

            {/* Visit Form Modal */}
            {showVisitForm && selectedChildForVisit && (
                <EditDialog
                    open={showVisitForm}
                    onOpenChange={() => {
                        setShowVisitForm(false);
                        setSelectedChildForVisit(null);
                    }}
                    title="Register Visit"
                    description={`Register a visit for ${selectedChildForVisit.name}`}
                    error={error}
                >
                    <VisitForm
                        mode="create"
                        defaultValues={{
                            dropOffTime: new Date(),
                            pickupTime: undefined,
                            status: 'active' as const,
                            notes: '',
                        }}
                        onSubmit={handleVisitSubmit}
                        onCancel={() => {
                            setShowVisitForm(false);
                            setSelectedChildForVisit(null);
                        }}
                        isLoading={createVisitMutation.isPending}
                    />
                </EditDialog>
            )}
        </div>
    );
}
