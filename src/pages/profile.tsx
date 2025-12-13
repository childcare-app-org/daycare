import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { ProfileForm } from '~/components/forms/ProfileForm';
import { DashboardHeader } from '~/components/shared/DashboardHeader';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { api } from '~/utils/api';

import type { ProfileFormData } from '~/components/forms/ProfileForm';

export async function getServerSideProps(context: { locale: string }) {
    return {
        props: {
            messages: (await import(`~/locales/${context.locale}.json`)).default
        }
    };
}

export default function Profile() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const t = useTranslations();
    const [error, setError] = useState('');

    const { data: userProfile, isLoading: isLoadingUser } = api.user.getMe.useQuery();
    const { data: nurseProfile, isLoading: isLoadingNurse } = api.nurse.getMyProfile.useQuery(
        undefined,
        { enabled: session?.user?.role === 'nurse' }
    );
    const { data: parentProfile, isLoading: isLoadingParent } = api.patient.getMyProfile.useQuery(
        undefined,
        { enabled: session?.user?.role === 'parent' }
    );

    const updateUserMutation = api.user.updateMe.useMutation({
        onSuccess: () => {
            setError('');
            // Refresh session to update user data
            router.reload();
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const updateNurseMutation = api.nurse.updateMyProfile.useMutation({
        onSuccess: () => {
            setError('');
            router.reload();
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const updateParentMutation = api.patient.updateParent.useMutation({
        onSuccess: () => {
            setError('');
            router.reload();
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const handleSubmit = (data: ProfileFormData) => {
        setError('');

        if (session?.user?.role === 'nurse') {
            // Update nurse profile
            updateNurseMutation.mutate({ name: data.name });
            // Also update user profile (name only)
            updateUserMutation.mutate({
                name: data.name,
            });
        } else if (session?.user?.role === 'parent') {
            // Update parent profile
            if (parentProfile && data.phoneNumber && data.homeAddress) {
                updateParentMutation.mutate({
                    name: data.name,
                    phoneNumber: data.phoneNumber,
                    homeAddress: data.homeAddress,
                    latitude: data.latitude,
                    longitude: data.longitude,
                });
            }
            // Also update user profile (name only)
            updateUserMutation.mutate({
                name: data.name,
            });
        } else {
            // Admin or other roles - just update user profile
            updateUserMutation.mutate({
                name: data.name,
            });
        }
    };

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

    const isLoading = isLoadingUser || (session.user.role === 'nurse' && isLoadingNurse) || (session.user.role === 'parent' && isLoadingParent);
    const isUpdating = updateUserMutation.isPending || updateNurseMutation.isPending || updateParentMutation.isPending;

    return (
        <>
            <Head>
                <title>{t('profile.title')}</title>
                <meta name="description" content={t('profile.description')} />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                {t('profile.title')}
                            </h1>
                            <p className="text-lg text-gray-600">{t('profile.description')}</p>
                        </div>
                        <DashboardHeader />
                    </div>

                    <div className="max-w-2xl">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('profile.editProfile')}</CardTitle>
                                <CardDescription>{t('profile.editProfileDescription')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                                        <p className="text-gray-600">{t('common.loading')}</p>
                                    </div>
                                ) : (
                                    <>
                                        {error && (
                                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                                <p className="text-sm text-red-600">{error}</p>
                                            </div>
                                        )}
                                        <ProfileForm
                                            defaultValues={{
                                                name: userProfile?.name || '',
                                                phoneNumber: parentProfile?.phoneNumber || '',
                                                homeAddress: parentProfile?.homeAddress || '',
                                                latitude: parentProfile?.latitude ? parseFloat(parentProfile.latitude) : undefined,
                                                longitude: parentProfile?.longitude ? parseFloat(parentProfile.longitude) : undefined,
                                            }}
                                            onSubmit={handleSubmit}
                                            isLoading={isUpdating}
                                            role={session.user.role as 'nurse' | 'parent' | 'admin'}
                                        />
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Additional role-specific information */}
                        {session.user.role === 'nurse' && nurseProfile && (
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>{t('profile.nurseInformation')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="font-semibold">{t('dashboard.nurse.hospital')}: </span>
                                            <span>{nurseProfile.hospitalName}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="mt-6">
                            <Link href="/dashboard">
                                <Button variant="outline">{t('common.backTo', { item: t('dashboard.title') })}</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

