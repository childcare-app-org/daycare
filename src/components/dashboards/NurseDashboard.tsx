import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ChildItem } from '~/components/dashboards/parent/ChildItem';
import { ChildForm } from '~/components/forms/ChildForm';
import { CreatePatientFlow } from '~/components/forms/CreatePatientFlow';
import { VisitForm } from '~/components/forms/VisitForm';
import { DashboardHeader } from '~/components/shared/DashboardHeader';
import { DeleteDialog } from '~/components/shared/DeleteDialog';
import { EditDialog } from '~/components/shared/EditDialog';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { api } from '~/utils/api';

import type { ChildFormData } from '~/components/forms/ChildForm';
import type { VisitFormData } from '~/components/forms/VisitForm';
import type { RouterOutputs } from '~/utils/api';

type Visit = RouterOutputs['visit']['getMyHospitalActiveVisits'][number];

export function NurseDashboard() {
    const { data: session } = useSession();
    const t = useTranslations();
    const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
    const [deletingVisit, setDeletingVisit] = useState<Visit | null>(null);
    const [error, setError] = useState('');
    const [showCreatePatientModal, setShowCreatePatientModal] = useState(false);

    const { data: activeVisits, isLoading, refetch } = api.visit.getMyHospitalActiveVisits.useQuery();
    const { data: todaysCompletedVisits, isLoading: isLoadingTodaysVisits, refetch: refetchTodaysVisits } = api.visit.getMyHospitalTodaysCompletedVisits.useQuery();
    const { data: accessCodeData } = api.hospital.getAccessCode.useQuery();

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

    const updateChildMutation = api.patient.updateChild.useMutation({
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

    const handleChildUpdateSubmit = (data: ChildFormData) => {
        if (!editingVisit || !editingVisit.childId) return;
        updateChildMutation.mutate({
            id: editingVisit.childId,
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
                <p className="text-gray-600">{t('dashboard.nurse.loadingActiveVisits')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Welcome Message and Access Code */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        {t('common.welcome', { name: session?.user?.name || '' })}
                    </h1>
                    <p className="text-lg text-gray-600 mb-2">{t('dashboard.nurse.title')}</p>
                    {accessCodeData && (
                        <p className="text-gray-600">{t('dashboard.nurse.hospital')}: {accessCodeData.hospitalName}</p>
                    )}
                </div>
                <div className="flex flex-col items-end gap-4">
                    <DashboardHeader />
                    {accessCodeData && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                            <p className="text-sm text-gray-600 mb-1">{t('dashboard.nurse.accessCode')}</p>
                            <p className="text-2xl font-bold text-blue-600">{accessCodeData.accessCode}</p>
                        </div>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboard.nurse.createVisit')}</CardTitle>
                    <CardDescription>
                        {t('dashboard.nurse.createVisitDescription')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={() => setShowCreatePatientModal(true)}
                        className="w-full"
                    >
                        {t('dashboard.nurse.registerVisit')}
                    </Button>
                </CardContent>
            </Card>

            {/* Active Visits List */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>{t('dashboard.nurse.activeVisits')}</CardTitle>
                    <CardDescription>
                        {t('dashboard.nurse.activeVisitsDescription')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {activeVisits && activeVisits.length > 0 ? (
                        <div className="space-y-4">
                            {activeVisits.map((visit) => (
                                <ChildItem
                                    key={visit.id}
                                    variant="nurse"
                                    child={visit.child || {}}
                                    activeVisit={visit}
                                    onEditVisit={() => handleEdit(visit)}
                                    onDeleteVisit={() => handleDelete(visit)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">{t('dashboard.nurse.noActiveVisits')}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Today's Completed Visits Section */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboard.nurse.todaysVisits')}</CardTitle>
                    <CardDescription>{t('dashboard.nurse.todaysVisitsDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingTodaysVisits ? (
                        <p className="text-gray-500 text-center py-8">{t('common.loading')}</p>
                    ) : todaysCompletedVisits && todaysCompletedVisits.length > 0 ? (
                        <div className="space-y-4">
                            {todaysCompletedVisits.map((visit) => (
                                <ChildItem
                                    key={visit.id}
                                    variant="nurse"
                                    child={visit.child || {}}
                                    activeVisit={visit}
                                    onEditVisit={() => handleEdit(visit)}
                                    onDeleteVisit={() => handleDelete(visit)}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">{t('dashboard.nurse.noCompletedVisits')}</p>
                    )}
                </CardContent>
            </Card>

            {/* Edit Visit Dialog */}
            <EditDialog
                open={!!editingVisit}
                onOpenChange={() => setEditingVisit(null)}
                title={t('dashboard.nurse.editVisit')}
                description={t('dashboard.nurse.editVisitDescription', { name: editingVisit?.child?.name || '' })}
                error={error}
            >
                <Tabs defaultValue="visit" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="visit">{t('dashboard.nurse.visitDetails')}</TabsTrigger>
                        <TabsTrigger value="child">{t('dashboard.nurse.childInfo')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="visit">
                        <VisitForm
                            mode="edit"
                            defaultValues={editingVisit ? {
                                dropOffTime: editingVisit.dropOffTime,
                                pickupTime: editingVisit.pickupTime || undefined,
                                status: editingVisit.status as 'active' | 'completed' | 'cancelled',
                                reason: editingVisit.reason || '',
                                notes: editingVisit.notes || '',
                            } : undefined}
                            onSubmit={handleUpdateSubmit}
                            onCancel={() => setEditingVisit(null)}
                            isLoading={updateVisitMutation.isPending}
                        />
                    </TabsContent>
                    <TabsContent value="child">
                        {editingVisit?.child && (
                            <ChildForm
                                mode="edit"
                                defaultValues={{
                                    name: editingVisit.child.name || '',
                                    pronunciation: editingVisit.child.pronunciation || '',
                                    gender: (editingVisit.child.gender as 'Male' | 'Female') || 'Male',
                                    birthdate: editingVisit.child.birthdate || new Date(),
                                    allergies: editingVisit.child.allergies || '',
                                    preexistingConditions: editingVisit.child.preexistingConditions || '',
                                    familyDoctorName: editingVisit.child.familyDoctorName || '',
                                    familyDoctorPhone: editingVisit.child.familyDoctorPhone || '',
                                }}
                                onSubmit={handleChildUpdateSubmit}
                                onCancel={() => setEditingVisit(null)}
                                isLoading={updateChildMutation.isPending}
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </EditDialog>

            {/* Delete Visit Confirmation Dialog */}
            <DeleteDialog
                open={!!deletingVisit}
                onOpenChange={() => setDeletingVisit(null)}
                onConfirm={handleDeleteConfirm}
                title={t('dashboard.nurse.deleteVisit')}
                description={t('dashboard.nurse.deleteVisitDescription', { name: deletingVisit?.child?.name || '' })}
                isLoading={deleteVisitMutation.isPending}
                error={error}
            />

            {/* Create Patient Modal */}
            <EditDialog
                open={showCreatePatientModal}
                onOpenChange={() => setShowCreatePatientModal(false)}
                title={t('dashboard.nurse.registerVisit')}
                description={t('dashboard.nurse.registerVisitDescription')}
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

        </div>
    );
}
