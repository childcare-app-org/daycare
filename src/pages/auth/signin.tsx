import { getProviders, signIn } from 'next-auth/react';
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

import { zodResolver } from '@hookform/resolvers/zod';

export async function getServerSideProps(context: { locale: string }) {
  return {
    props: {
      messages: (await import(`~/locales/${context.locale}.json`)).default,
    },
  };
}

type LoginFormData = {
  email: string;
  password: string;
};

export default function SignIn() {
  const router = useRouter();
  const t = useTranslations();

  const loginSchema = z.object({
    email: z.string().email(t('validation.invalidEmail')),
    password: z.string().min(6, t('validation.passwordMinLength')),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [providers, setProviders] = useState<Awaited<ReturnType<typeof getProviders>>>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Fetch providers on mount and check for success messages
  useEffect(() => {
    void getProviders().then(setProviders);

    // Check for success messages in query params
    if (router.query.registered === 'true') {
      setSuccessMessage(t('auth.signIn.registrationSuccess'));
    }
    if (router.query.passwordReset === 'true') {
      setSuccessMessage(t('auth.signIn.passwordResetSuccess'));
    }
  }, [router.query, t]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('auth.signIn.error'));
      } else if (result?.ok) {
        // Redirect to dashboard or return URL
        const returnUrl = (router.query.callbackUrl as string) || '/dashboard';
        void router.push(returnUrl);
      } else {
        // Fallback error if result is not ok and no error message
        setError(t('auth.signIn.error'));
      }
    } catch (err) {
      setError(t('auth.signIn.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = (providerId: string) => {
    void signIn(providerId, { callbackUrl: (router.query.callbackUrl as string) || '/dashboard' });
  };

  return (
    <>
      <Head>
        <title>{t('auth.signIn.title')}</title>
        <meta name="description" content={t('auth.signIn.description')} />
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.signIn.title')}</h1>
            <p className="text-gray-600">{t('auth.signIn.subtitle')}</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
            {/* Email/Password Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-6">
              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {successMessage}
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.signIn.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.signIn.emailPlaceholder')}
                  {...register('email')}
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.signIn.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('auth.signIn.passwordPlaceholder')}
                  {...register('password')}
                  aria-invalid={errors.password ? 'true' : 'false'}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? t('common.loading') : t('auth.signIn.submit')}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('auth.signIn.orContinueWith')}</span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              {providers?.google && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthSignIn('google')}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {t('common.signInWith', { provider: t('common.providers.google') })}
                </Button>
              )}

              {providers?.line && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthSignIn('line')}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.27l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.63.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766-.028 1.08l-.164.48c-.197.579-.7 1.543-1.278 2.12-.732.73-1.58 1.11-2.388 1.11-.27 0-.539-.062-.784-.174-1.254-.59-2.497-1.378-3.622-2.31a.706.706 0 0 1-.207-.399c-.05-.25.122-.51.36-.64 1.72-1.08 2.878-2.37 3.397-3.6.24-.57.36-1.16.36-1.75 0-.84-.22-1.7-.64-2.48C2.833 14.887 1.5 12.7 1.5 10.314c0-4.97 4.596-9.014 10.5-9.014s10.5 4.043 10.5 9.014z" />
                  </svg>
                  {t('common.signInWith', { provider: t('common.providers.line') })}
                </Button>
              )}
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t('auth.signIn.noAccount')}{' '}
                <Link href="/auth/signup" className="text-purple-600 hover:text-purple-700 hover:underline font-medium">
                  {t('auth.signIn.signUp')}
                </Link>
              </p>
            </div>
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
