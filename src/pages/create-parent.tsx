import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export default function CreateParent() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        phoneNumber: "",
        homeAddress: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // TODO: Implement API call to create parent
            console.log("Creating parent:", formData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Redirect to dashboard
            router.push("/");
        } catch (error) {
            console.error("Error creating parent:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <>
            <Head>
                <title>Create Parent - Daycare Management</title>
                <meta name="description" content="Create a new parent for the daycare system" />
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
                            Create Parent
                        </h1>
                        <p className="text-lg text-gray-600">
                            Register a new parent or guardian
                        </p>
                    </div>

                    {/* Form */}
                    <div className="max-w-2xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>Parent Information</CardTitle>
                                <CardDescription>
                                    Enter the details for the new parent or guardian
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            placeholder="Enter parent's full name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phoneNumber">Phone Number *</Label>
                                        <Input
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            type="tel"
                                            placeholder="(555) 123-4567"
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full"
                                        />
                                        <p className="text-sm text-gray-500">
                                            Include area code for contact purposes
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="homeAddress">Home Address *</Label>
                                        <textarea
                                            id="homeAddress"
                                            name="homeAddress"
                                            placeholder="Enter complete home address"
                                            value={formData.homeAddress}
                                            onChange={handleInputChange}
                                            required
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                        <p className="text-sm text-gray-500">
                                            Street address, city, state, and ZIP code
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
                                            disabled={isSubmitting}
                                            className="flex-1"
                                        >
                                            {isSubmitting ? "Creating..." : "Create Parent"}
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
