import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { HospitalList } from '~/components/HospitalList';
import { DashboardHeader } from '~/components/shared/DashboardHeader';

export function AdminDashboard() {
    const { data: session } = useSession();
    const t = useTranslations();
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        {t('common.welcome', { name: session?.user?.name || '' })}
                    </h1>
                    <p className="text-lg text-gray-600">{t('dashboard.admin.title')}</p>
                </div>
                <DashboardHeader />
            </div>

            <HospitalList />
        </div>
    );
}
