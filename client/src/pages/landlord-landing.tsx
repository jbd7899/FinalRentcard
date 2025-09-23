import { Link, useSearch } from 'wouter';
import { ArrowRight, ClipboardList, Users, ShieldCheck, QrCode, Timer, Mail } from 'lucide-react';
import Navbar from '@/components/shared/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import RoleSwitcher, { RoleCrossLink } from '@/components/shared/RoleSwitcher';

const BENEFITS = [
  {
    title: 'Consistent insights',
    description: 'Review standardized RentCards with income, references, and documents before you schedule a tour.',
    icon: ClipboardList,
  },
  {
    title: 'Better conversations',
    description: 'Respond quickly with context. Tenants already shared what you need, so follow-up is personal and specific.',
    icon: Users,
  },
  {
    title: 'Controlled sharing',
    description: 'You decide what information you request for each property. Tenants only see the details you publish.',
    icon: ShieldCheck,
  },
];

const WORKFLOW = [
  {
    title: 'Create a property interest page',
    detail: 'Generate a link or QR code for each property. Prospective tenants can send their RentCard or leave basic information.',
    icon: QrCode,
  },
  {
    title: 'Review and respond faster',
    detail: 'Every RentCard arrives in the same layout so you spend less time chasing missing details and more time on fit.',
    icon: Timer,
  },
  {
    title: 'Follow up with context',
    detail: 'Use MyRentCard to reply with next steps. Tenants already know if they match your criteria, so conversations move quickly.',
    icon: Mail,
  },
];

export default function LandlordLanding() {
  const searchParams = new URLSearchParams(useSearch());
  const preservedParams = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const authLink = `/auth${preservedParams ? preservedParams + '&' : '?'}mode=register&type=landlord`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-100">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-16 space-y-16">
        <section className="text-center space-y-6">
          <Badge variant="outline" className="mx-auto w-fit text-emerald-600 border-emerald-200">
            Tools for individual landlords
          </Badge>
          <RoleSwitcher currentRole="landlord" variant="toggle" showStats={false} />
          <h1 className="text-3xl sm:text-5xl font-bold text-slate-900">
            Review tenant prequalification before you reply
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            MyRentCard helps private landlords gather consistent information without losing the personal touch. See who is ready
            to rent and spend your time on serious prospects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="px-8 bg-emerald-600 hover:bg-emerald-700">
              <Link href={authLink}>
                Set up landlord tools
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8">
              <Link href="/samples/screening-page">Preview a screening page</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {BENEFITS.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <div className="rounded-full bg-emerald-100 text-emerald-600 w-12 h-12 flex items-center justify-center mb-4">
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
            A consistent process for every property
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {WORKFLOW.map((step) => (
              <div key={step.title} className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 font-medium">
                  <step.icon className="w-5 h-5" />
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
              <CardTitle className="text-slate-900">Stay personal while you scale</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Use standardized RentCards to qualify tenants without losing the relationships that set you apart from large
                management companies.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900">Invite interest from any channel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Put QR codes on signs, include links in listings, or text them directly. Prospects share their details in the
                same format, so you always know what to expect.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="text-center bg-emerald-600 text-white rounded-2xl p-10 space-y-4">
          <h2 className="text-2xl font-semibold">Give tenants clarity before the tour</h2>
          <p className="text-emerald-100 max-w-2xl mx-auto">
            Start using MyRentCard to receive consistent prequalification information. Save time, stay organized, and keep every
            conversation personal.
          </p>
          <Button asChild variant="secondary" size="lg" className="text-emerald-700">
            <Link href={authLink}>
              Set up landlord tools
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </section>

        <RoleCrossLink currentRole="landlord" className="max-w-xl mx-auto" />
      </main>
    </div>
  );
}
