import { motion } from 'framer-motion';
import { signIn, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { LanguageSwitcher } from '~/components/shared/LanguageSwitcher';
import { CardBody, CardContainer, CardItem } from '~/components/ui/3d-card';
import { BackgroundBeamsWithCollision } from '~/components/ui/background-beams';
import { Button } from '~/components/ui/button';
import { FlipWords } from '~/components/ui/flip-words';
import { Meteors } from '~/components/ui/meteors';

export async function getServerSideProps(context: { locale: string }) {
  return {
    props: {
      messages: (await import(`~/locales/${context.locale}.json`)).default
    }
  };
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations();
  const locale = router.locale || 'en';

  // Redirect authenticated users to appropriate dashboard based on role
  useEffect(() => {
    if (session?.user) {
      router.push('/dashboard');
    }
  }, [session, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-300 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 text-sm">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const flipWordsEn = ["safe", "connected", "informed", "happy"];
  const flipWordsJa = ["安心", "つながり", "安全", "幸せ"];
  const flipWords = locale === 'ja' ? flipWordsJa : flipWordsEn;

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      title: t('home.features.realtime.title'),
      description: t('home.features.realtime.description'),
      gradient: "from-purple-500 to-violet-600",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: t('home.features.health.title'),
      description: t('home.features.health.description'),
      gradient: "from-pink-500 to-rose-600",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: t('home.features.checkin.title'),
      description: t('home.features.checkin.description'),
      gradient: "from-indigo-500 to-purple-600",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t('home.features.history.title'),
      description: t('home.features.history.description'),
      gradient: "from-violet-500 to-fuchsia-600",
    },
  ];

  const steps = [
    {
      number: '01',
      title: t('home.howItWorks.step1.title'),
      description: t('home.howItWorks.step1.description'),
    },
    {
      number: '02',
      title: t('home.howItWorks.step2.title'),
      description: t('home.howItWorks.step2.description'),
    },
    {
      number: '03',
      title: t('home.howItWorks.step3.title'),
      description: t('home.howItWorks.step3.description'),
    },
  ];

  return (
    <>
      <Head>
        <title>{t('home.title')}</title>
        <meta name="description" content={t('home.description')} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-white overflow-hidden">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-purple-100/50">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-purple-700 to-violet-700 bg-clip-text text-transparent">
                Daycare
              </span>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Button
                onClick={() => void signIn()}
                variant="ghost"
                className="text-purple-700 hover:text-purple-900 hover:bg-purple-100/50"
              >
                {t('common.signIn')}
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section with Background Beams */}
        <BackgroundBeamsWithCollision className="pt-16">
          <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100/80 backdrop-blur-sm border border-purple-200/50 mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <span className="text-sm font-medium text-purple-700">
                {locale === 'ja' ? '病児保育の新しいカタチ' : 'Modern sick-child daycare'}
              </span>
            </motion.div>

            {/* Main headline with FlipWords */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6"
            >
              {locale === 'ja' ? (
                <>
                  お子さまを
                  <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    <FlipWords words={flipWords} className="text-inherit" />
                  </span>
                  に
                </>
              ) : (
                <>
                  Keep your child
                  <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    <FlipWords words={flipWords} className="text-inherit" />
                  </span>
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              {t('home.hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={() => void signIn()}
                size="lg"
                className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-2xl shadow-xl shadow-purple-500/30 transition-all hover:shadow-2xl hover:shadow-purple-500/40 hover:-translate-y-1"
              >
                {t('home.hero.cta')}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </motion.div>

            {/* Decorative gradient orbs */}
            <div className="absolute top-1/4 -left-32 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute top-1/3 -right-32 w-64 h-64 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
          </div>
        </BackgroundBeamsWithCollision>

        {/* Features Section with 3D Cards */}
        <section className="py-24 px-6 bg-gradient-to-b from-white via-purple-50/30 to-white">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {t('home.features.title')}
              </h2>
              <p className="text-gray-600 text-lg max-w-xl mx-auto">
                {t('home.features.subtitle')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <CardContainer containerClassName="py-4">
                    <CardBody className="bg-white relative group/card border border-purple-100 w-full h-auto rounded-2xl p-6 hover:shadow-2xl hover:shadow-purple-500/10 transition-shadow">
                      <CardItem
                        translateZ="50"
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-4 shadow-lg`}
                      >
                        {feature.icon}
                      </CardItem>
                      <CardItem
                        translateZ="60"
                        className="text-xl font-bold text-gray-900 mb-2"
                      >
                        {feature.title}
                      </CardItem>
                      <CardItem
                        translateZ="40"
                        className="text-gray-600 text-sm leading-relaxed"
                      >
                        {feature.description}
                      </CardItem>
                    </CardBody>
                  </CardContainer>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 px-6 bg-gradient-to-b from-white to-purple-50/50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {t('home.howItWorks.title')}
              </h2>
              <p className="text-gray-600 text-lg">
                {t('home.howItWorks.subtitle')}
              </p>
            </motion.div>

            <div className="relative">
              {/* Connection line */}
              <div className="hidden md:block absolute top-16 left-[16.666%] right-[16.666%] h-1 bg-gradient-to-r from-purple-200 via-violet-300 to-indigo-200 rounded-full"></div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                    viewport={{ once: true }}
                    className="relative text-center"
                  >
                    <div className="relative z-10 w-32 h-32 rounded-3xl bg-white border-2 border-purple-100 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/10">
                      <span className="text-5xl font-black bg-gradient-to-br from-purple-600 to-violet-600 bg-clip-text text-transparent">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section with Meteors */}
        <section className="relative py-24 px-6 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 overflow-hidden">
          <Meteors number={30} className="opacity-60" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
            >
              {t('home.hero.title')}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-purple-100 text-lg mb-10 max-w-xl mx-auto"
            >
              {t('home.hero.subtitle')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Button
                onClick={() => void signIn()}
                size="lg"
                className="bg-white text-purple-700 hover:bg-purple-50 px-10 py-6 text-lg rounded-2xl shadow-2xl transition-all hover:shadow-3xl hover:-translate-y-1 font-semibold"
              >
                {t('home.hero.cta')}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </motion.div>
          </div>

          {/* Decorative elements */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </section>

        {/* Footer */}
        <footer className="py-10 px-6 bg-gray-900 text-gray-400">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="font-semibold text-white">Daycare</span>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} Daycare Management. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
