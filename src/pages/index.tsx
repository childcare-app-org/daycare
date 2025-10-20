import { signIn, signOut, useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect authenticated users to appropriate dashboard based on role
  useEffect(() => {
    if (session?.user) {
      // All authenticated users go to dashboard (role-specific content shown there)
      router.push('/dashboard');
    }
  }, [session, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Daycare Management</title>
        <meta name="description" content="Hospital daycare management system" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Daycare Management
            </h1>
            <p className="text-lg text-gray-600">
              Manage hospitals, staff, parents, and children
            </p>
          </div>

          {/* Auth Section */}
          <div className="mb-8">
            <AuthShowcase />
          </div>

          {/* Admin Form Buttons Grid - Only show for admins */}
          {session?.user?.role === 'admin' && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                    <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <CardTitle className="text-lg">Hospital</CardTitle>
                  <CardDescription>
                    Create and manage hospital locations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/create-hospital">
                    <Button className="w-full" size="lg">
                      Create Hospital
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                    <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <CardTitle className="text-lg">Nurse</CardTitle>
                  <CardDescription>
                    Register nurses for hospitals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/create-nurse">
                    <Button className="w-full" size="lg">
                      Create Nurse
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                    <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <CardTitle className="text-lg">Parent</CardTitle>
                  <CardDescription>
                    Register parents and guardians
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/create-parent">
                    <Button className="w-full" size="lg">
                      Create Parent
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                    <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <CardTitle className="text-lg">Child</CardTitle>
                  <CardDescription>
                    Register children for daycare
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/create-child">
                    <Button className="w-full" size="lg">
                      Create Child
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-lg text-gray-700">
        {sessionData && <span>Welcome, {sessionData.user?.name}</span>}
        {!sessionData && <span>Please sign in to manage the daycare system</span>}
      </p>
      <Button
        onClick={sessionData ? () => void signOut() : () => void signIn()}
        variant={sessionData ? "outline" : "default"}
        size="lg"
      >
        {sessionData ? "Sign out" : "Sign in"}
      </Button>
    </div>
  );
}
