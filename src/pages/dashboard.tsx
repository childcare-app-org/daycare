import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
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

    // If user is admin (no role assigned yet), redirect to role selection
    if (session.user.role === 'admin') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Please select your role to continue</p>
                    <Link href="/select-role">
                        <Button>Select Role</Button>
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
                    {session.user.role === 'nurse' && <NurseDashboard hospitalId={session.user.hospitalId} />}
                    {session.user.role === 'parent' && <ParentDashboard userId={session.user.id} />}
                </div>
            </main>
        </>
    );
}

function NurseDashboard({ hospitalId }: { hospitalId?: string }) {
    const { data: activeVisits, isLoading } = api.visit.getActiveByHospital.useQuery(
        { hospitalId: hospitalId || '' },
        { enabled: !!hospitalId }
    );

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
                                <div key={visit.id} className="p-4 border rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold">{visit.child?.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                Parent: {visit.parent?.name}
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
                            <p className="text-gray-500">No active visits at your hospital</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function ParentDashboard({ userId }: { userId: string }) {
    const { data: parent } = api.patient.getParentByUserId.useQuery({ userId });
    const { data: children, isLoading } = api.patient.getChildrenByParent.useQuery(
        { parentId: parent?.id || '' },
        { enabled: !!parent?.id }
    );

    if (isLoading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your children...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Your Children</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600">
                            {children?.length || 0}
                        </div>
                        <p className="text-sm text-gray-500">Registered children</p>
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

            {/* Children List */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Children</CardTitle>
                    <CardDescription>
                        Manage your children's profiles and view their activities
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {children && children.length > 0 ? (
                        <div className="space-y-4">
                            {children.map((child) => (
                                <div key={child.id} className="p-4 border rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold">{child.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                Age: {Math.floor(child.age / 12)} years, {child.age % 12} months
                                            </p>
                                            {child.allergies && (
                                                <p className="text-sm text-red-600">
                                                    Allergies: {child.allergies}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <Button variant="outline" size="sm">
                                                View History
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">No children registered yet</p>
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
