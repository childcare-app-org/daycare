import Link from 'next/link';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { api } from '~/utils/api';

export function NurseDashboard() {
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
