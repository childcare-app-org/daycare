import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { api } from '~/utils/api';

export default function SelectRole() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if already authenticated and has a role
    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (!session) {
        router.push('/');
        return null;
    }

    // If user already has a role, redirect to appropriate dashboard
    if (session.user.role !== 'admin') {
        router.push('/dashboard');
        return null;
    }

    const handleParentSelection = async () => {
        if (!session?.user?.id) return;

        setIsSubmitting(true);
        try {
            // For parents, we need to collect more information
            // For now, just redirect to a form to fill out parent details
            router.push('/create-parent');
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Head>
                <title>Welcome - Daycare Management</title>
                <meta name="description" content="Welcome to the daycare system" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Welcome to Daycare Management
                        </h1>
                        <p className="text-lg text-gray-600">
                            Let's get you started
                        </p>
                    </div>

                    {/* Info Card */}
                    <div className="max-w-2xl mx-auto">
                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl">Are you a parent?</CardTitle>
                                <CardDescription className="text-base mt-2">
                                    If you're a nurse, you should have already been set up by your hospital administrator.
                                    If you're signing in for the first time as a nurse, you'll be automatically recognized.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">For Parents:</h3>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• Create and manage child profiles</li>
                                        <li>• View visit history across hospitals</li>
                                        <li>• Receive health event notifications</li>
                                        <li>• Check-in/out your children</li>
                                    </ul>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">For Nurses:</h3>
                                    <p className="text-sm text-gray-600">
                                        If your hospital administrator has added you to the system,
                                        you'll be automatically recognized when you sign in.
                                        If you don't see your nurse dashboard, please contact your administrator.
                                    </p>
                                </div>

                                <Button
                                    onClick={handleParentSelection}
                                    disabled={isSubmitting}
                                    className="w-full"
                                    size="lg"
                                >
                                    {isSubmitting ? 'Loading...' : 'I am a Parent - Continue'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </>
    );
}
