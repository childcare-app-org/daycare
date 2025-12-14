import { signIn } from 'next-auth/react';
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

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password confirmation is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignUp() {
  const router = useRouter();
  const t = useTranslations();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<{ email: string; password: string } | null>(null);

  const registerMutation = api.auth.register.useMutation({
    onSuccess: async () => {
      // Auto-login after successful registration
      if (formData) {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.ok) {
          void router.push('/dashboard');
        } else {
          // If auto-login fails, redirect to signin
          void router.push('/auth/signin?registered=true');
        }
      }
    },
    onError: (error) => {
      setError(error.message || t('auth.signUp.error'));
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setError(null);
    // Store credentials for auto-login after registration
    setFormData({ email: data.email, password: data.password });
    registerMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
    });
  };

  return (
    <>
      <Head>
        <title>{t('auth.signUp.title')}</title>
        <meta name="description" content={t('auth.signUp.description')} />
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.signUp.title')}</h1>
            <p className="text-gray-600">{t('auth.signUp.subtitle')}</p>
          </div>

          {/* Signup Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">{t('auth.signUp.name')}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t('auth.signUp.namePlaceholder')}
                  {...register('name')}
                  aria-invalid={errors.name ? 'true' : 'false'}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.signUp.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.signUp.emailPlaceholder')}
                  {...register('email')}
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.signUp.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('auth.signUp.passwordPlaceholder')}
                  {...register('password')}
                  aria-invalid={errors.password ? 'true' : 'false'}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth.signUp.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t('auth.signUp.confirmPasswordPlaceholder')}
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
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? t('common.loading') : t('auth.signUp.submit')}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t('auth.signUp.haveAccount')}{' '}
                <Link href="/auth/signin" className="text-purple-600 hover:text-purple-700 hover:underline font-medium">
                  {t('auth.signUp.signIn')}
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
