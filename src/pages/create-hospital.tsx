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

export default function CreateHospital() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        capacity: "",
        pricing: "",
    });
    const [error, setError] = useState<string>("");

    const createHospitalMutation = api.hospital.create.useMutation({
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

        const capacity = parseInt(formData.capacity);
        const pricing = parseFloat(formData.pricing);

        if (isNaN(capacity) || capacity < 1) {
            setError("Capacity must be a valid number greater than 0");
            return;
        }

        if (isNaN(pricing) || pricing < 0) {
            setError("Pricing must be a valid number");
            return;
        }

        createHospitalMutation.mutate({
            name: formData.name,
            address: formData.address,
            capacity,
            pricing,
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                <title>Create Hospital - Daycare Management</title>
                <meta name="description" content="Create a new hospital for the daycare system" />
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
                            Create Hospital
                        </h1>
                        <p className="text-lg text-gray-600">
                            Add a new hospital location to the daycare system
                        </p>
                    </div>

                    {/* Form */}
                    <div className="max-w-2xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>Hospital Information</CardTitle>
                                <CardDescription>
                                    Enter the details for the new hospital location
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
                                        <Label htmlFor="name">Hospital Name *</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            placeholder="Enter hospital name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address *</Label>
                                        <Input
                                            id="address"
                                            name="address"
                                            type="text"
                                            placeholder="Enter full address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="capacity">Capacity *</Label>
                                            <Input
                                                id="capacity"
                                                name="capacity"
                                                type="number"
                                                placeholder="20"
                                                value={formData.capacity}
                                                onChange={handleInputChange}
                                                required
                                                min="1"
                                                className="w-full"
                                            />
                                            <p className="text-sm text-gray-500">
                                                Maximum number of children
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="pricing">Daily Pricing *</Label>
                                            <Input
                                                id="pricing"
                                                name="pricing"
                                                type="number"
                                                step="0.01"
                                                placeholder="150.00"
                                                value={formData.pricing}
                                                onChange={handleInputChange}
                                                required
                                                min="0"
                                                className="w-full"
                                            />
                                            <p className="text-sm text-gray-500">
                                                Cost per day in dollars
                                            </p>
                                        </div>
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
                                            disabled={createHospitalMutation.isPending}
                                            className="flex-1"
                                        >
                                            {createHospitalMutation.isPending ? "Creating..." : "Create Hospital"}
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
