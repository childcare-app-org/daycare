import Link from 'next/link';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { api } from '~/utils/api';

export function HospitalList() {
    const { data: hospitals, isLoading } = api.hospital.getAll.useQuery();

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Hospitals</CardTitle>
                    <CardDescription>Loading hospitals...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Hospitals</CardTitle>
                        <CardDescription>
                            {hospitals?.length || 0} hospital{hospitals?.length !== 1 ? 's' : ''} in the system
                        </CardDescription>
                    </div>
                    <Link href="/create-hospital">
                        <Button>Add Hospital</Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                {hospitals && hospitals.length > 0 ? (
                    <div className="space-y-4">
                        {hospitals.map((hospital) => (
                            <Link key={hospital.id} href={`/hospital/${hospital.id}`}>
                                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg mb-1">{hospital.name}</h3>
                                            <p className="text-sm text-gray-600 mb-2">{hospital.address}</p>
                                            <div className="flex gap-4 text-sm text-gray-500">
                                                <span>
                                                    <span className="font-medium">Capacity:</span> {hospital.capacity} children
                                                </span>
                                                <span>
                                                    <span className="font-medium">Daily Rate:</span> ${hospital.pricing}
                                                </span>
                                            </div>
                                        </div>
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">No hospitals yet</p>
                        <Link href="/create-hospital">
                            <Button>Create Your First Hospital</Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

