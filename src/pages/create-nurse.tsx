import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { api } from '~/utils/api';

export default function CreateNurse() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        hospitalId: "",
    });
    const [error, setError] = useState<string>("");

    const { data: hospitals } = api.hospital.getAll.useQuery();

    const createNurseMutation = api.nurse.create.useMutation({
        onSuccess: () => {
            router.push("/dashboard");
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        createNurseMutation.mutate({
            name: formData.name,
            email: formData.email,
            hospitalId: formData.hospitalId,
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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

    return (
        <>
            <Head>
                <title>Create Nurse - Daycare Management</title>
                <meta name="description" content="Create a new nurse for the daycare system" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Create Nurse
                        </h1>
                        <p className="text-lg text-gray-600">
                            Register a new nurse for a hospital
                        </p>
                    </div>

                    {/* Form */}
                    <div className="max-w-2xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>Nurse Information</CardTitle>
                                <CardDescription>
                                    Enter the details for the new nurse
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
                                        <Label htmlFor="name">Nurse Name *</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            placeholder="Enter nurse's full name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address *</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="nurse@hospital.com"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full"
                                        />
                                        <p className="text-sm text-gray-500">
                                            The nurse will use this email to sign in
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="hospitalId">Hospital *</Label>
                                        <select
                                            id="hospitalId"
                                            name="hospitalId"
                                            value={formData.hospitalId}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        >
                                            <option value="">Select a hospital</option>
                                            {hospitals?.map((hospital) => (
                                                <option key={hospital.id} value={hospital.id}>
                                                    {hospital.name}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-sm text-gray-500">
                                            Choose the hospital where this nurse will work
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.push("/")}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={createNurseMutation.isPending}
                                            className="flex-1"
                                        >
                                            {createNurseMutation.isPending ? "Creating..." : "Create Nurse"}
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
