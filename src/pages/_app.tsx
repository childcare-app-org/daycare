import '~/styles/globals.css';

import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';
import { Geist } from 'next/font/google';
import { useRouter } from 'next/router';
import { api } from '~/utils/api';

import type { Session, } from 'next-auth';
import type { AppType, } from 'next/app';
const geist = Geist({
  subsets: ["latin"],
});

const MyApp: AppType<{ session: Session | null; messages?: Record<string, any> }> = ({
  Component,
  pageProps: { session, messages, ...pageProps },
}) => {
  const router = useRouter();

  return (
    <SessionProvider session={session}>
      <NextIntlClientProvider
        locale={router.locale || router.defaultLocale || 'en'}
        messages={messages}
      >
        <div className={geist.className}>
          <Component {...pageProps} />
        </div>
      </NextIntlClientProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
