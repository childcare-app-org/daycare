import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { AdminDashboard } from '~/components/dashboards/AdminDashboard';
import { NurseDashboard } from '~/components/dashboards/NurseDashboard';
import { ParentDashboard } from '~/components/dashboards/ParentDashboard';
import { HospitalList } from '~/components/HospitalList';
import { Button } from '~/components/ui/button';

import type { Card, CardHeader, CardTitle, CardContent, CardDescription } from '~/components/ui/card';
import type { api } from '~/utils/api';

export async function getServerSideProps(context: { locale: string }) {
  return {
    props: {
      messages: (await import(`~/locales/${context.locale}.json`)).default
    }
  };
}

export default function Dashboard() {
    const { data: session, status } = useSession();
    const t = useTranslations();

    // Redirect if not authenticated
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">{t('dashboard.pleaseSignIn')}</p>
                    <Link href="/">
                        <Button>{t('common.goToHome')}</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{t('dashboard.title')}</title>
                <meta name="description" content={t('dashboard.description')} />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
                <div className="container mx-auto px-4 py-8">
                    {/* Role-specific content */}
                    {session.user.role === 'nurse' && <NurseDashboard />}
                    {session.user.role === 'parent' && <ParentDashboard />}
                    {session.user.role === 'admin' && <AdminDashboard />}
                </div>
            </main>
        </>
    );
}
