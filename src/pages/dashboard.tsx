import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { HospitalList } from '~/components/HospitalList';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { api } from '~/utils/api';

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

function NurseDashboard() {
    const { data: activeVisits, isLoading } = api.visit.getMyHospitalActiveVisits.useQuery();

    if (isLoading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading active visits...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Active Visits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600">
                            {activeVisits?.length || 0}
                        </div>
                        <p className="text-sm text-gray-500">Children currently at your hospital</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button className="w-full" size="sm">
                            Log Health Event
                        </Button>
                        <Button variant="outline" className="w-full" size="sm">
                            Update Visit Status
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">0</div>
                        <p className="text-sm text-gray-500">Pending notifications</p>
                    </CardContent>
                </Card>
            </div>

            {/* Active Visits List */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Visits</CardTitle>
                    <CardDescription>
                        Children currently at your hospital
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {activeVisits && activeVisits.length > 0 ? (
                        <div className="space-y-4">
                            {activeVisits.map((visit) => (
                                <div key={visit.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <Link href={`/visit/${visit.id}`}>
                                                <h3 className="font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">
                                                    {visit.child?.name}
                                                </h3>
                                            </Link>
                                            <p className="text-sm text-gray-600">
                                                Parent: {visit.parent?.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Dropped off: {new Date(visit.dropOffTime).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right ml-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                            <div className="mt-2">
                                                <Link href={`/visit/${visit.id}`}>
                                                    <Button size="sm" variant="outline">
                                                        View Timeline
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No active visits at your hospital</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function ParentDashboard() {
    const { data: activeVisits, isLoading } = api.visit.getMyChildrenActiveVisits.useQuery();

    if (isLoading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your visits...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Active Visits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600">
                            {activeVisits?.length || 0}
                        </div>
                        <p className="text-sm text-gray-500">Children currently at daycare</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Link href="/create-child">
                            <Button className="w-full" size="sm">
                                Add Child
                            </Button>
                        </Link>
                        <Button variant="outline" className="w-full" size="sm">
                            Check In Child
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">0</div>
                        <p className="text-sm text-gray-500">Health events today</p>
                    </CardContent>
                </Card>
            </div>

            {/* Active Visits List */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Visits</CardTitle>
                    <CardDescription>
                        Your children currently at daycare
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {activeVisits && activeVisits.length > 0 ? (
                        <div className="space-y-4">
                            {activeVisits.map((visit) => (
                                <div key={visit.id} className="p-4 border rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold">{visit.child?.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                Hospital: {visit.hospital?.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Dropped off: {new Date(visit.dropOffTime).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">No active visits</p>
                            <Link href="/create-child">
                                <Button>Add Your First Child</Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function AdminDashboard() {
    return (
        <div className="space-y-6">
            <HospitalList />
        </div>
    );
}
