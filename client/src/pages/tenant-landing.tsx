import { Link, useSearch } from 'wouter';
import { ArrowRight, ClipboardList, Share2, ShieldCheck, CheckCircle2, MessageSquare, Smartphone } from 'lucide-react';
import Navbar from '@/components/shared/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import RoleSwitcher, { RoleCrossLink } from '@/components/shared/RoleSwitcher';

const HIGHLIGHTS = [
  {
    title: 'Standardize once',
    description: 'Complete a professional RentCard with employment, references, and documents you choose to share.',
    icon: ClipboardList,
  },
  {
    title: 'Share anywhere',
    description: 'Send a link or QR code to any landlord. They review your prequalification before setting up a tour.',
    icon: Share2,
  },
  {
    title: 'Stay in control',
    description: 'Revoke access or update your RentCard instantly. Landlords see the latest information every time.',
    icon: ShieldCheck,
  },
];

const WORKFLOW = [
  {
    title: 'Create your RentCard',
    detail: 'Fill out income, employment, rental history, and references once. Add documents when you are ready.',
  },
  {
    title: 'Share with private landlords',
    detail: 'Use a link or QR code wherever you find listings—Craigslist, yard signs, or referrals.',
  },
  {
    title: 'Get clear responses',
    detail: 'Landlords see your information upfront, so you spend less time on back-and-forth messages.',
  },
];

export default function TenantLanding() {
  const searchParams = new URLSearchParams(useSearch());
  const preservedParams = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const authLink = `/auth${preservedParams ? preservedParams + '&' : '?'}mode=register&type=tenant`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-100">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-16 space-y-16">
        <section className="text-center space-y-6">
          <Badge variant="outline" className="mx-auto w-fit text-blue-600 border-blue-200">
            For renters who work with private landlords
          </Badge>
          <RoleSwitcher currentRole="tenant" variant="toggle" showStats={false} />
          <h1 className="text-3xl sm:text-5xl font-bold text-slate-900">
            Share one RentCard and skip repeating your story
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            MyRentCard standardizes prequalification so landlords can review your information quickly. You keep ownership of the
            details and decide what to send with each share.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="px-8">
              <Link href={authLink}>
                Create my RentCard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8">
              <Link href="/samples/rentcard">Preview a RentCard</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <div className="rounded-full bg-blue-100 text-blue-600 w-12 h-12 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5" />
                </div>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="bg-white border rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900 text-center mb-8">
            How MyRentCard keeps you moving forward
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {WORKFLOW.map((step) => (
              <div key={step.title} className="space-y-3">
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  {step.title}
                </div>
                <p className="text-sm text-slate-600">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Less chasing, more clarity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Landlords see your readiness immediately—income, references, and documents are in one place. If you are not a
                match, you hear sooner and can keep searching without delays.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Smartphone className="w-5 h-5 text-blue-600" />
                Works wherever you find listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Share your RentCard through email, text messages, or QR codes on property flyers. Private landlords get the
                information they need without asking you to fill out another form.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="text-center bg-blue-600 text-white rounded-2xl p-10 space-y-4">
          <h2 className="text-2xl font-semibold">Ready to stop rewriting your story?</h2>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Join MyRentCard and keep your rental qualifications in one place. Share once, reuse everywhere.
          </p>
          <Button asChild variant="secondary" size="lg" className="text-blue-600">
            <Link href={authLink}>
              Create my RentCard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </section>

        <RoleCrossLink currentRole="tenant" className="max-w-xl mx-auto" />
      </main>
    </div>
  );
}
