import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
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

type ForgotPasswordFormData = {
  email: string;
};

export default function ForgotPassword() {
  const router = useRouter();
  const t = useTranslations();

  const forgotPasswordSchema = z.object({
    email: z.string().email(t('validation.invalidEmail')),
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const requestResetMutation = api.auth.requestPasswordReset.useMutation({
    onSuccess: (data) => {
      setSuccess(true);
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    },
    onError: (error) => {
      setError(error.message || t('auth.forgotPassword.error'));
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    setSuccess(false);
    requestResetMutation.mutate({
      email: data.email,
    });
  };

  return (
    <>
      <Head>
        <title>{t('auth.forgotPassword.title')}</title>
        <meta name="description" content={t('auth.forgotPassword.description')} />
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.forgotPassword.title')}</h1>
            <p className="text-gray-600">{t('auth.forgotPassword.subtitle')}</p>
          </div>

          {/* Forgot Password Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
            {success ? (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {t('auth.forgotPassword.success')}
                </div>
                {resetUrl && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{t('auth.forgotPassword.devMode')}</p>
                    <Link href={resetUrl}>
                      <Button className="w-full">
                        {t('auth.forgotPassword.resetLink')}
                      </Button>
                    </Link>
                  </div>
                )}
                <Link href="/auth/signin">
                  <Button variant="outline" className="w-full">
                    {t('auth.forgotPassword.backToSignIn')}
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.forgotPassword.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.forgotPassword.emailPlaceholder')}
                    {...register('email')}
                    aria-invalid={errors.email ? 'true' : 'false'}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700"
                  disabled={requestResetMutation.isPending}
                >
                  {requestResetMutation.isPending ? t('common.loading') : t('auth.forgotPassword.submit')}
                </Button>

                <div className="text-center">
                  <Link
                    href="/auth/signin"
                    className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
                  >
                    {t('auth.forgotPassword.backToSignIn')}
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
