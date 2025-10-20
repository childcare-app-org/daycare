import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { AdminDashboard } from '~/components/dashboards/AdminDashboard';
import { NurseDashboard } from '~/components/dashboards/NurseDashboard';
import { ParentDashboard } from '~/components/dashboards/ParentDashboard';
import { HospitalList } from '~/components/HospitalList';
import { Button } from '~/components/ui/button';

import type { Card, CardHeader, CardTitle, CardContent, CardDescription } from '~/components/ui/card';
import type { api } from '~/utils/api';

export default function Dashboard() {
    const { data: session, status } = useSession();

    // Redirect if not authenticated
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

    if (!session) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Please sign in to access the dashboard</p>
                    <Link href="/">
                        <Button>Go to Home</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Dashboard - Daycare Management</title>
                <meta name="description" content="Your daycare management dashboard" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Welcome, {session.user.name}
                        </h1>
                        <p className="text-lg text-gray-600 capitalize">
                            {session.user.role} Dashboard
                        </p>
                    </div>

                    {/* Role-specific content */}
                    {session.user.role === 'nurse' && <NurseDashboard />}
                    {session.user.role === 'parent' && <ParentDashboard />}
                    {session.user.role === 'admin' && <AdminDashboard />}
                </div>
            </main>
        </>
    );
}
