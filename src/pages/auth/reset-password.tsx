import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { LanguageSwitcher } from '~/components/shared/LanguageSwitcher';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { api } from '~/utils/api';

import { zodResolver } from '@hookform/resolvers/zod';

export async function getServerSideProps(context: { locale: string }) {
  return {
    props: {
      messages: (await import(`~/locales/${context.locale}.json`)).default,
    },
  };
}

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password confirmation is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const router = useRouter();
  const t = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const { token: queryToken, email: queryEmail } = router.query;
    if (queryToken && typeof queryToken === 'string') {
      setToken(queryToken);
    }
    if (queryEmail && typeof queryEmail === 'string') {
      setEmail(decodeURIComponent(queryEmail));
    }
  }, [router.query]);

  const resetPasswordMutation = api.auth.resetPassword.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        void router.push('/auth/signin?passwordReset=true');
      }, 2000);
    },
    onError: (error) => {
      setError(error.message || t('auth.resetPassword.error'));
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token || !email) {
      setError(t('auth.resetPassword.missingParams'));
      return;
    }

    setError(null);
    resetPasswordMutation.mutate({
      email,
      token,
      newPassword: data.password,
    });
  };

  if (!token || !email) {
    return (
      <>
        <Head>
          <title>{t('auth.resetPassword.title')}</title>
          <meta name="description" content={t('auth.resetPassword.description')} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                {t('auth.resetPassword.missingParams')}
              </div>
              <Link href="/auth/forgot-password">
                <Button variant="outline" className="w-full">
                  {t('auth.resetPassword.backToForgotPassword')}
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{t('auth.resetPassword.title')}</title>
        <meta name="description" content={t('auth.resetPassword.description')} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-purple-700 to-violet-700 bg-clip-text text-transparent">
                Daycare
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.resetPassword.title')}</h1>
            <p className="text-gray-600">{t('auth.resetPassword.subtitle')}</p>
          </div>

          {/* Reset Password Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
            {success ? (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {t('auth.resetPassword.success')}
                </div>
                <p className="text-sm text-gray-600 text-center">
                  {t('auth.resetPassword.redirecting')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.resetPassword.password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('auth.resetPassword.passwordPlaceholder')}
                    {...register('password')}
                    aria-invalid={errors.password ? 'true' : 'false'}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('auth.resetPassword.confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                    {...register('confirmPassword')}
                    aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? t('common.loading') : t('auth.resetPassword.submit')}
                </Button>

                <div className="text-center">
                  <Link
                    href="/auth/signin"
                    className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
                  >
                    {t('auth.resetPassword.backToSignIn')}
                  </Link>
                </div>
              </form>
            )}
          </div>

          {/* Language Switcher */}
          <div className="mt-6 flex justify-center">
            <LanguageSwitcher />
          </div>
        </div>
      </main>
    </>
  );
}
