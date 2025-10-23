import { useSession } from 'next-auth/react';
import { HospitalList } from '~/components/HospitalList';

export function AdminDashboard() {
    const { data: session } = useSession();
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Welcome, {session?.user?.name}
                </h1>
                <p className="text-lg text-gray-600">Admin Dashboard</p>
            </div>

            <HospitalList />
        </div>
    );
}
