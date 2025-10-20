import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export default function CreateHospital() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        capacity: "",
        pricing: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // TODO: Implement API call to create hospital
            console.log("Creating hospital:", formData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Redirect to dashboard
            router.push("/");
        } catch (error) {
            console.error("Error creating hospital:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

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
                                            disabled={isSubmitting}
                                            className="flex-1"
                                        >
                                            {isSubmitting ? "Creating..." : "Create Hospital"}
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
