import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { ChildForm } from '~/components/forms/ChildForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { api } from '~/utils/api';

import type { ChildFormData } from '~/components/forms/ChildForm';
export default function CreateChild() {
    const router = useRouter();
    const [error, setError] = useState<string>("");

    const createChildMutation = api.patient.createChild.useMutation({
        onSuccess: () => {
            router.push("/dashboard");
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const handleSubmit = (data: ChildFormData) => {
        setError("");
        createChildMutation.mutate({
            ...data,
            relationshipType: "Parent",
        });
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
                                {error && (
                                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                        {error}
                                    </div>
                                )}
                                <ChildForm
                                    mode="create"
                                    onSubmit={handleSubmit}
                                    onCancel={() => router.push("/")}
                                    isLoading={createChildMutation.isPending}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </>
    );
}
