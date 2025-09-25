import { useState } from 'react';
import { useSearch } from 'wouter';
import { ShieldCheck, Clock, UserCheck, Code, Sparkles } from 'lucide-react';
import Navbar from '@/components/shared/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ENV } from '@/constants';

const DEV_ACCOUNTS = [
  {
    role: 'Tenant',
    email: 'test-tenant@myrentcard.com',
    password: 'test123',
    description: 'Loads a fully prepared RentCard for previewing tenant tooling.',
  },
  {
    role: 'Landlord',
    email: 'test-landlord@myrentcard.com',
    password: 'test123',
    description: 'Opens property interest tracking and screening flows for landlords.',
  },
];

export default function AuthPage() {
  const searchParams = new URLSearchParams(useSearch());
  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [email, setEmail] = useState(DEV_ACCOUNTS[0].email);
  const [password, setPassword] = useState('test123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<null | { type: 'success' | 'error'; message: string }>(null);

  const heading =
    mode === 'register'
      ? 'Create your MyRentCard account'
      : 'Sign in to continue';
  const description = 'Access MyRentCard to manage your rental network - whether you\'re sharing your rental profile or reviewing tenant information.';

  const handleReplitRedirect = () => {
    window.location.href = '/api/login';
  };

  const handleDevLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/dev/test-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({ success: false }));

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Login failed');
      }

      setStatus({ type: 'success', message: 'Signed in. Redirecting…' });
      setTimeout(() => {
        // Let the auth system handle the redirection based on user state
        window.location.href = data.user?.userType ? 
          (data.user.userType === 'landlord' ? '/landlord/dashboard' : '/tenant/dashboard') : 
          '/role-selection';
      }, 300);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Login failed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const showDevAuth = ENV.FEATURES.ENABLE_DEV_AUTH;

  const onboardingSteps = [
    {
      icon: ShieldCheck,
      title: 'Use secure sign-in',
      detail: 'MyRentCard relies on Replit Auth for production accounts. It handles both login and account creation.',
    },
    {
      icon: Clock,
      title: 'Standardize quickly',
      detail: 'Tenants complete one RentCard and reuse it everywhere. Landlords receive consistent prequalification details.',
    },
    {
      icon: UserCheck,
      title: 'Share with confidence',
      detail: 'Decide what to share and revoke access any time. Private landlords see the information they need up front.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-16">
        <section className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            {mode === 'register' ? 'Create account' : 'Sign in'}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            {heading}
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">{description}</p>
        </section>

        <div className="grid gap-6 md:grid-cols-2 mb-12">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Sparkles className="w-5 h-5" />
                Continue with Replit Auth
              </CardTitle>
              <CardDescription>
                Replit manages secure authentication for MyRentCard. You can sign in or create an account in the same flow.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm text-slate-600">
                <li>• Works for both new and returning users.</li>
                <li>• Sets up your dashboard in a few seconds after sign-in.</li>
                <li>• Keeps your session secure with HTTP-only cookies.</li>
              </ul>
              <Button className="w-full" onClick={handleReplitRedirect} data-testid="auth-replit-button">
                Continue with Replit
              </Button>
            </CardContent>
          </Card>

          {showDevAuth && (
            <Card className="border-emerald-200" data-testid="auth-dev-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700">
                  <Code className="w-5 h-5" />
                  Development login
                </CardTitle>
                <CardDescription>
                  Use seeded test accounts when you need to explore the product locally without Replit Auth.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleDevLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="dev-email">Email</Label>
                    <Input
                      id="dev-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dev-password">Password</Label>
                    <Input
                      id="dev-password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Signing in…' : 'Sign in with test account'}
                  </Button>
                </form>

                <div className="mt-6 space-y-3 text-sm text-slate-600">
                  {DEV_ACCOUNTS.map((account) => (
                    <div key={account.email} className="rounded-lg border border-emerald-100 p-3">
                      <p className="font-medium text-emerald-700">{account.role} demo</p>
                      <p className="font-mono text-xs">{account.email} / {account.password}</p>
                      <p className="text-xs mt-1">{account.description}</p>
                    </div>
                  ))}
                </div>

                {status && (
                  <Alert className={`mt-6 ${status.type === 'error' ? 'border-red-300 text-red-700' : 'border-emerald-300 text-emerald-700'}`}>
                    <AlertTitle>{status.type === 'error' ? 'Login failed' : 'Success'}</AlertTitle>
                    <AlertDescription>{status.message}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <section className="bg-white border rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 text-slate-900">What happens next?</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {onboardingSteps.map((step) => (
              <div key={step.title} className="space-y-3">
                <div className="inline-flex items-center justify-center rounded-full bg-slate-100 p-3 text-slate-700">
                  <step.icon className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-600">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
