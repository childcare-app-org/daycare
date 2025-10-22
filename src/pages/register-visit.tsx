import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { api } from '~/utils/api';

export default function RegisterVisit() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { childId } = router.query;
    const [selectedHospitalId, setSelectedHospitalId] = useState('');
    const [error, setError] = useState<string>('');

    const { data: hospitals } = api.hospital.getAll.useQuery();
    const { data: children } = api.patient.getMyChildren.useQuery();

    const createVisitMutation = api.visit.create.useMutation({
        onSuccess: () => {
            router.push('/dashboard');
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        setError('');

        if (!childId || !selectedHospitalId) {
            setError('Please select a child and hospital');
            return;
        }

        createVisitMutation.mutate({
            childId: childId as string,
            hospitalId: selectedHospitalId,
            dropOffTime: new Date(),
        });
    };

    // Check authentication
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session || session.user.role !== 'parent') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">You must be a parent to access this page</p>
                    <Link href="/dashboard">
                        <Button>Go to Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const selectedChild = children?.find(child => child.id === childId);

    return (
        <>
            <Head>
                <title>Register Visit - Daycare Management</title>
                <meta name="description" content="Register your child for a daycare visit" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href="/dashboard">
                            <Button variant="outline" className="mb-4">
                                ← Back to Dashboard
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Register Visit
                        </h1>
                        <p className="text-lg text-gray-600">
                            Register {selectedChild?.name} for a daycare visit
                        </p>
                    </div>

                    {/* Form */}
                    <div className="max-w-2xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>Visit Registration</CardTitle>
                                <CardDescription>
                                    Select a hospital for your child's visit
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {error && (
                                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                        {error}
                                    </div>
                                )}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Child
                                        </label>
                                        <div className="p-3 bg-gray-50 border rounded-md">
                                            <p className="font-semibold">{selectedChild?.name}</p>
                                            <p className="text-sm text-gray-600">
                                                Age: {Math.floor((selectedChild?.age || 0) / 12)} years, {(selectedChild?.age || 0) % 12} months
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="hospitalId" className="block text-sm font-medium text-gray-700">
                                            Hospital *
                                        </label>
                                        <select
                                            id="hospitalId"
                                            value={selectedHospitalId}
                                            onChange={(e) => setSelectedHospitalId(e.target.value)}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        >
                                            <option value="">Select a hospital</option>
                                            {hospitals?.map((hospital) => (
                                                <option key={hospital.id} value={hospital.id}>
                                                    {hospital.name} - ${hospital.pricing}/day
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-sm text-gray-500">
                                            Choose the hospital where your child will stay
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.push("/dashboard")}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={createVisitMutation.isPending}
                                            className="flex-1"
                                        >
                                            {createVisitMutation.isPending ? "Registering..." : "Register Visit"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </>
    );
}
