import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { api } from '~/utils/api';

export default function SelectHospital() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: hospitals, isLoading } = api.hospital.getAll.useQuery();
    const createNurseMutation = api.nurse.create.useMutation();

    // Redirect if not authenticated
    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (!session) {
        router.push('/');
        return null;
    }

    // If user already has a role, redirect to dashboard
    if (session.user.role !== 'admin') {
        router.push('/dashboard');
        return null;
    }

    const handleHospitalSelection = async () => {
        if (!selectedHospitalId || !session?.user?.id) return;

        setIsSubmitting(true);
        try {
            await createNurseMutation.mutateAsync({
                name: session.user.name || '',
                hospitalId: selectedHospitalId,
                userId: session.user.id,
            });
            router.push('/dashboard');
        } catch (error) {
            console.error('Error creating nurse profile:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading hospitals...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Select Hospital - Daycare Management</title>
                <meta name="description" content="Choose your hospital assignment" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Select Your Hospital
                        </h1>
                        <p className="text-lg text-gray-600">
                            Choose the hospital where you will be working as a nurse
                        </p>
                    </div>

                    {/* Hospital Selection */}
                    <div className="max-w-2xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>Available Hospitals</CardTitle>
                                <CardDescription>
                                    Select the hospital where you will be managing visits and logging health events
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {hospitals && hospitals.length > 0 ? (
                                    <div className="space-y-4">
                                        {hospitals.map((hospital) => (
                                            <div
                                                key={hospital.id}
                                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedHospitalId === hospital.id
                                                        ? 'border-purple-500 bg-purple-50'
                                                        : 'border-gray-200 hover:border-purple-300'
                                                    }`}
                                                onClick={() => setSelectedHospitalId(hospital.id)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{hospital.name}</h3>
                                                        <p className="text-gray-600">{hospital.address}</p>
                                                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                                            <span>Capacity: {hospital.capacity} children</span>
                                                            <span>Daily Rate: ${hospital.pricing}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="hospital"
                                                            value={hospital.id}
                                                            checked={selectedHospitalId === hospital.id}
                                                            onChange={() => setSelectedHospitalId(hospital.id)}
                                                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 mb-4">No hospitals available</p>
                                        <p className="text-sm text-gray-400">
                                            Please contact an administrator to create hospitals first
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push('/select-role')}
                                        className="flex-1"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleHospitalSelection}
                                        disabled={!selectedHospitalId || isSubmitting}
                                        className="flex-1"
                                    >
                                        {isSubmitting ? 'Creating...' : 'Continue as Nurse'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </>
    );
}
