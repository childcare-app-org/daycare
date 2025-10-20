import Link from 'next/link';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { api } from '~/utils/api';

export function ParentDashboard() {
    const { data: activeVisits, isLoading: visitsLoading } = api.visit.getMyChildrenActiveVisits.useQuery();
    const { data: children, isLoading: childrenLoading } = api.patient.getMyChildren.useQuery();

    if (visitsLoading || childrenLoading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your children...</p>
            </div>
        );
    }

    // Helper function to check if a child has an active visit
    const getChildVisitStatus = (childId: string) => {
        return activeVisits?.find(visit => visit.childId === childId);
    };

    return (
        <div className="space-y-6">
            {/* Children List */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>My Children</CardTitle>
                            <CardDescription>
                                Manage your children and their daycare visits
                            </CardDescription>
                        </div>
                        <Link href="/create-child">
                            <Button>
                                + Add Child
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {children && children.length > 0 ? (
                        <div className="space-y-4">
                            {children.map((child) => {
                                const activeVisit = getChildVisitStatus(child.id || '');
                                return (
                                    <div key={child.id} className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg">{child.name}</h3>
                                                <p className="text-sm text-gray-600">
                                                    Age: {Math.floor((child.age || 0) / 12)} years, {(child.age || 0) % 12} months
                                                </p>
                                                {child.allergies && (
                                                    <p className="text-sm text-red-600">
                                                        Allergies: {child.allergies}
                                                    </p>
                                                )}
                                                {child.preexistingConditions && (
                                                    <p className="text-sm text-orange-600">
                                                        Conditions: {child.preexistingConditions}
                                                    </p>
                                                )}
                                                {activeVisit && (
                                                    <div className="mt-2">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Currently at {activeVisit.hospital?.name}
                                                        </span>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Since: {new Date(activeVisit.dropOffTime).toLocaleString()}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                {activeVisit ? (
                                                    <Link href={`/visit/${activeVisit.id}`}>
                                                        <Button variant="outline">
                                                            View Visit
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Link href={`/register-visit?childId=${child.id}`}>
                                                        <Button>
                                                            Register for Visit
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
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
