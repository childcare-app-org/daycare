import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export default function CreateChild() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        age: "",
        allergies: "",
        preexistingConditions: "",
        familyDoctorName: "",
        familyDoctorPhone: "",
        parentId: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // TODO: Replace with actual parents from API
    const parents = [
        { id: "1", name: "John Smith" },
        { id: "2", name: "Sarah Johnson" },
        { id: "3", name: "Mike Davis" },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // TODO: Implement API call to create child
            console.log("Creating child:", formData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Redirect to dashboard
            router.push("/");
        } catch (error) {
            console.error("Error creating child:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <>
            <Head>
                <title>Create Child - Daycare Management</title>
                <meta name="description" content="Create a new child for the daycare system" />
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
                            Create Child
                        </h1>
                        <p className="text-lg text-gray-600">
                            Register a new child for daycare
                        </p>
                    </div>

                    {/* Form */}
                    <div className="max-w-2xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>Child Information</CardTitle>
                                <CardDescription>
                                    Enter the details for the new child
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Child's Name *</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            placeholder="Enter child's full name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="age">Age (in months) *</Label>
                                            <Input
                                                id="age"
                                                name="age"
                                                type="number"
                                                placeholder="36"
                                                value={formData.age}
                                                onChange={handleInputChange}
                                                required
                                                min="3"
                                                max="144"
                                                className="w-full"
                                            />
                                            <p className="text-sm text-gray-500">
                                                Age range: 3 months to 12 years
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="parentId">Parent/Guardian *</Label>
                                            <select
                                                id="parentId"
                                                name="parentId"
                                                value={formData.parentId}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            >
                                                <option value="">Select a parent</option>
                                                {parents.map((parent) => (
                                                    <option key={parent.id} value={parent.id}>
                                                        {parent.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="allergies">Allergies</Label>
                                        <textarea
                                            id="allergies"
                                            name="allergies"
                                            placeholder="List any known allergies (e.g., peanuts, dairy, medication)"
                                            value={formData.allergies}
                                            onChange={handleInputChange}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                        <p className="text-sm text-gray-500">
                                            Leave blank if no known allergies
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="preexistingConditions">Preexisting Conditions</Label>
                                        <textarea
                                            id="preexistingConditions"
                                            name="preexistingConditions"
                                            placeholder="List any preexisting medical conditions (e.g., asthma, epilepsy)"
                                            value={formData.preexistingConditions}
                                            onChange={handleInputChange}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                        <p className="text-sm text-gray-500">
                                            Leave blank if no preexisting conditions
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="familyDoctorName">Family Doctor Name</Label>
                                            <Input
                                                id="familyDoctorName"
                                                name="familyDoctorName"
                                                type="text"
                                                placeholder="Dr. Smith"
                                                value={formData.familyDoctorName}
                                                onChange={handleInputChange}
                                                className="w-full"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="familyDoctorPhone">Family Doctor Phone</Label>
                                            <Input
                                                id="familyDoctorPhone"
                                                name="familyDoctorPhone"
                                                type="tel"
                                                placeholder="(555) 123-4567"
                                                value={formData.familyDoctorPhone}
                                                onChange={handleInputChange}
                                                className="w-full"
                                            />
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
                                            {isSubmitting ? "Creating..." : "Create Child"}
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
