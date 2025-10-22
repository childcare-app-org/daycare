import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { NurseForm } from '~/components/forms/NurseForm';
import { ActionMenu } from '~/components/shared/ActionMenu';
import { DeleteDialog } from '~/components/shared/DeleteDialog';
import { EditDialog } from '~/components/shared/EditDialog';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { api } from '~/utils/api';

import type { NurseFormData } from '~/components/forms/NurseForm';

type Nurse = {
    id: string;
    name: string;
    email: string;
    hospitalId: string;
    userId: string | null;
};

export default function HospitalDetail() {
    const router = useRouter();
    const { data: session, status: authStatus } = useSession();
    const { id } = router.query;
    const hospitalId = typeof id === 'string' ? id : '';

    const { data: hospital, isLoading: hospitalLoading } = api.hospital.getById.useQuery(
        { id: hospitalId },
        { enabled: !!hospitalId }
    );

    const { data: nurses, isLoading: nursesLoading, refetch: refetchNurses } = api.nurse.getByHospital.useQuery(
        { hospitalId },
        { enabled: !!hospitalId }
    );

    const [showAddNurse, setShowAddNurse] = useState(false);
    const [editingNurse, setEditingNurse] = useState<Nurse | null>(null);
    const [deletingNurse, setDeletingNurse] = useState<Nurse | null>(null);
    const [error, setError] = useState('');

    const createNurseMutation = api.nurse.create.useMutation({
        onSuccess: () => {
            setShowAddNurse(false);
            setError('');
            refetchNurses();
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const updateNurseMutation = api.nurse.update.useMutation({
        onSuccess: () => {
            setEditingNurse(null);
            setError('');
            refetchNurses();
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const deleteNurseMutation = api.nurse.delete.useMutation({
        onSuccess: () => {
            setDeletingNurse(null);
            refetchNurses();
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const handleSubmit = (data: NurseFormData) => {
        setError('');
        if (!data.hospitalId) {
            setError('Hospital ID is required');
            return;
        }
        createNurseMutation.mutate({
            name: data.name,
            email: data.email,
            hospitalId: data.hospitalId,
        });
    };

    const handleEdit = (nurse: Nurse) => {
        setEditingNurse(nurse);
        setError('');
    };

    const handleDelete = (nurse: Nurse) => {
        setDeletingNurse(nurse);
        setError('');
    };

    const handleUpdateSubmit = (data: NurseFormData) => {
        if (!editingNurse) return;
        updateNurseMutation.mutate({
            id: editingNurse.id,
            name: data.name,
            email: data.email,
        });
    };

    const handleDeleteConfirm = () => {
        if (!deletingNurse) return;
        deleteNurseMutation.mutate({ id: deletingNurse.id });
    };

    // Check authentication
    if (authStatus === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session || session.user.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">You must be an admin to access this page</p>
                    <Link href="/dashboard">
                        <Button>Go to Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (hospitalLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading hospital...</p>
                </div>
            </div>
        );
    }

    if (!hospital) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Hospital not found</p>
                    <Link href="/dashboard">
                        <Button>Back to Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{hospital.name} - Daycare Management</title>
                <meta name="description" content={`Manage nurses for ${hospital.name}`} />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href="/dashboard" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{hospital.name}</h1>
                        <p className="text-lg text-gray-600">{hospital.address}</p>
                    </div>

                    <div className="space-y-6">
                        {/* Hospital Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Hospital Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Capacity</p>
                                    <p className="text-lg font-semibold">{hospital.capacity} children</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Daily Rate</p>
                                    <p className="text-lg font-semibold">${hospital.pricing}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Nurses List */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Nurses</CardTitle>
                                        <CardDescription>
                                            {nurses?.length || 0} nurse{nurses?.length !== 1 ? 's' : ''} assigned to this hospital
                                        </CardDescription>
                                    </div>
                                    {!showAddNurse && (
                                        <Button onClick={() => setShowAddNurse(true)}>Add Nurse</Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {showAddNurse && (
                                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                        <h3 className="font-semibold mb-4">Add New Nurse</h3>
                                        {error && (
                                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                                                {error}
                                            </div>
                                        )}
                                        <NurseForm
                                            mode="create"
                                            hospitalId={hospitalId}
                                            hospitalName={hospital?.name || ''}
                                            onSubmit={handleSubmit}
                                            onCancel={() => {
                                                setShowAddNurse(false);
                                                setError('');
                                            }}
                                            isLoading={createNurseMutation.isPending}
                                        />
                                    </div>
                                )}

                                {nursesLoading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                    </div>
                                ) : nurses && nurses.length > 0 ? (
                                    <div className="space-y-3">
                                        {nurses.map((nurse) => (
                                            <div key={nurse.id} className="p-4 border rounded-lg">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold">{nurse.name}</h4>
                                                        <p className="text-sm text-gray-600">{nurse.email}</p>
                                                        {nurse.userId ? (
                                                            <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                                Active
                                                            </div>
                                                        ) : (
                                                            <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                                </svg>
                                                                Pending Sign-In
                                                            </div>
                                                        )}
                                                    </div>
                                                    <ActionMenu
                                                        onEdit={() => handleEdit(nurse)}
                                                        onDelete={() => handleDelete(nurse)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 mb-4">No nurses assigned to this hospital yet</p>
                                        {!showAddNurse && (
                                            <Button onClick={() => setShowAddNurse(true)}>Add First Nurse</Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Edit Nurse Dialog */}
                    <EditDialog
                        open={!!editingNurse}
                        onOpenChange={() => setEditingNurse(null)}
                        title="Edit Nurse"
                        description="Update nurse information"
                        error={error}
                    >
                        <NurseForm
                            mode="edit"
                            hospitalId={hospitalId}
                            hospitalName={hospital?.name || ''}
                            defaultValues={editingNurse ? {
                                name: editingNurse.name,
                                email: editingNurse.email,
                            } : undefined}
                            onSubmit={handleUpdateSubmit}
                            onCancel={() => setEditingNurse(null)}
                            isLoading={updateNurseMutation.isPending}
                            emailDisabled={!!editingNurse?.userId}
                            emailDisabledMessage={editingNurse?.userId ? "Note: Cannot change email for active nurses" : undefined}
                        />
                    </EditDialog>

                    {/* Delete Nurse Confirmation Dialog */}
                    <DeleteDialog
                        open={!!deletingNurse}
                        onOpenChange={() => setDeletingNurse(null)}
                        onConfirm={handleDeleteConfirm}
                        title="Delete Nurse"
                        description={`Are you sure you want to delete ${deletingNurse?.name}? This action cannot be undone.`}
                        isLoading={deleteNurseMutation.isPending}
                        error={error}
                    />
                </div>
            </main>
        </>
    );
}

