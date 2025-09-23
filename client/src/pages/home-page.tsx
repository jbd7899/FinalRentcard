import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Building2, User, ArrowRight, CheckCircle, TrendingUp } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/shared/navbar';
import { DERIVED_MESSAGING } from '@shared/value-propositions';
import { NETWORK_VALUE_PROPS } from '@shared/network-messaging';

type UserRole = 'tenant' | 'landlord';

export default function HomePage() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('tenant');
  const [, setLocation] = useLocation();

  // Automatically redirect authenticated users to their dashboard
  useEffect(() => {
    if (user) {
      const dashboardPath = user && 'userType' in user && user.userType === 'landlord' 
        ? '/landlord/dashboard' 
        : '/tenant/dashboard';
      setLocation(dashboardPath);
    }
  }, [user, setLocation]);

  // If user is authenticated, don't render the homepage content
  // The useEffect will handle the redirect
  if (user) {
    return null;
  }

  // Dynamic content based on selected role
  const roleContent = {
    tenant: {
      hero: DERIVED_MESSAGING.TENANT.HERO,
      secondary: DERIVED_MESSAGING.TENANT.SECONDARY,
      description:
        'Stay in control of standardized prequalification. Create once and share anywhere—even off-platform.',
      primaryCTA: DERIVED_MESSAGING.TENANT.CALL_TO_ACTION,
      primaryLink: '/auth?mode=register&type=tenant',
      proofPoints: [
        'Standardized RentCard private landlords recognize',
        'Share one secure link or QR code anywhere',
        'Hear sooner if a property is the right fit',
      ],
      learnMore: {
        summary: 'Reuse a professional RentCard while keeping ownership of your data and presentation.',
        highlights: NETWORK_VALUE_PROPS.TENANT.BENEFITS,
        networkEffects: NETWORK_VALUE_PROPS.NETWORK_EFFECTS.TENANT,
        resources: [{ label: 'Preview a RentCard', href: '/samples/rentcard' }],
      },
    },
    landlord: {
      hero: DERIVED_MESSAGING.LANDLORD.HERO,
      secondary: DERIVED_MESSAGING.LANDLORD.SECONDARY,
      description:
        'Collect standardized prequalification before tours while keeping your personal approach.',
      primaryCTA: DERIVED_MESSAGING.LANDLORD.CALL_TO_ACTION,
      primaryLink: '/auth?mode=register&type=landlord',
      proofPoints: [
        'Invite prospects through property links or QR codes',
        'Receive consistent RentCards before you coordinate tours',
        'Respond quickly while keeping conversations personal',
      ],
      learnMore: {
        summary: 'Stay organized across properties with consistent, no-cost prequalification tools.',
        highlights: NETWORK_VALUE_PROPS.LANDLORD.BENEFITS,
        networkEffects: NETWORK_VALUE_PROPS.NETWORK_EFFECTS.LANDLORD,
        resources: [{ label: 'Preview landlord tools', href: '/samples/screening-page' }],
      },
    },
  } satisfies Record<
    UserRole,
    {
      hero: string;
      secondary: string;
      description: string;
      primaryCTA: string;
      primaryLink: string;
      proofPoints: string[];
      learnMore: {
        summary: string;
        highlights: readonly string[];
        networkEffects: readonly string[];
        resources: { label: string; href: string }[];
      };
    }
  >;

  const roleMeta: Record<UserRole, { label: string; icon: typeof User }> = {
    tenant: { label: 'For renters using MyRentCard', icon: User },
    landlord: { label: 'For private landlords', icon: Building2 },
  };

  const STANDARDIZED_DETAILS = [
    'Standardized prequalification keeps expectations aligned before tours begin.',
    'Shared formats mean fewer missing documents and faster answers.',
    'Both sides save time while keeping direct, personal conversations front and center.',
  ];
  const content = roleContent[selectedRole];
  const isLandlordSelected = selectedRole === 'landlord';

  // For unauthenticated users, show dynamic homepage
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Subtle pattern overlay */}
      <div className="relative z-10">
        <Navbar />
      </div>

      <main className="relative z-1 mx-auto max-w-7xl px-4 py-16">
        {/* Dynamic Toggle System */}
        <div className="mb-12 flex justify-center">
          <div className="mx-auto max-w-md rounded-xl border bg-white p-2 shadow-lg">
            <div className="flex flex-col sm:flex-row">
              <button
                onClick={() => setSelectedRole('tenant')}
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 transition-all sm:px-6 ${
                  !isLandlordSelected
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                data-testid="toggle-tenant"
              >
                <User className="h-4 w-4" />
                I'm Looking for a Place
              </button>
              <button
                onClick={() => setSelectedRole('landlord')}
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 transition-all sm:px-6 ${
                  isLandlordSelected
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                data-testid="toggle-landlord"
              >
                <Building2 className="h-4 w-4" />
                I Own/Manage Properties
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="mb-16 space-y-8 text-center">
          <div className="flex justify-center">
            <div
              className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-600 shadow-md"
              data-testid="badge-prequalification"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Standardized prequalification network</span>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold sm:text-6xl" data-testid="homepage-title">
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">MyRentCard</span>
              <span className="mt-4 block text-xl text-gray-800 transition-all sm:text-3xl">{content.hero}</span>
              <span
                className={`mt-2 block text-lg transition-all sm:text-2xl ${
                  isLandlordSelected ? 'text-green-600' : 'text-blue-600'
                }`}
              >
                {content.secondary}
              </span>
            </h1>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600">{content.description}</p>
          </div>
          <ul className="mx-auto max-w-2xl space-y-3 text-left text-base text-gray-700">
            {content.proofPoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <CheckCircle
                  className={`mt-1 h-5 w-5 flex-shrink-0 ${
                    isLandlordSelected ? 'text-green-600' : 'text-blue-600'
                  }`}
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-center">
            <button
              onClick={() => {
                localStorage.setItem('selectedRole', selectedRole);
                setLocation(`/auth?mode=register&type=${selectedRole}`);
              }}
              className={`group inline-flex items-center gap-3 rounded-xl px-7 py-4 text-sm font-semibold text-white shadow-lg transition-colors ${
                isLandlordSelected ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              data-testid="button-primary-cta"
            >
              {content.primaryCTA}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Prefer to preview first?{' '}
            <Link
              href={content.learnMore.resources[0]?.href ?? '#'}
              className={`${
                isLandlordSelected ? 'text-green-600 hover:text-green-700' : 'text-blue-600 hover:text-blue-700'
              } font-medium`}
            >
              {content.learnMore.resources[0]?.label}
            </Link>
          </p>
        </section>

        {/* Learn more accordions */}
        <section className="mb-16">
          <div className="mx-auto max-w-4xl rounded-3xl border border-gray-100 bg-white p-6 shadow-lg sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                Learn how standardized prequalification keeps the network aligned
              </h2>
              <TrendingUp className={`h-6 w-6 ${isLandlordSelected ? 'text-green-500' : 'text-blue-500'}`} />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Explore role-specific highlights and network advantages without leaving the hero.
            </p>
            <Accordion type="multiple" className="mt-6 space-y-3">
              {(['tenant', 'landlord'] as UserRole[]).map((role) => {
                const { label, icon: RoleIcon } = roleMeta[role];
                const roleDetails = roleContent[role];
                const accentText = role === 'landlord' ? 'text-green-600' : 'text-blue-600';
                const accentSoft = role === 'landlord' ? 'text-green-500' : 'text-blue-500';
                return (
                  <AccordionItem key={role} value={role} className="rounded-2xl border border-gray-100 px-2">
                    <AccordionTrigger className="text-left text-base font-semibold text-gray-900">
                      <span className="flex items-center gap-3">
                        <RoleIcon className={`h-5 w-5 ${accentText}`} />
                        {label}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-2 text-sm text-gray-600">
                      <div className="space-y-4">
                        <p>{roleDetails.learnMore.summary}</p>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">Highlights</h3>
                            <ul className="mt-2 space-y-2">
                              {roleDetails.learnMore.highlights.map((highlight) => (
                                <li key={highlight} className="flex items-start gap-2">
                                  <CheckCircle className={`mt-0.5 h-4 w-4 ${accentSoft}`} />
                                  <span>{highlight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">Network benefits</h3>
                            <ul className="mt-2 space-y-2">
                              {roleDetails.learnMore.networkEffects.map((effect) => (
                                <li key={effect} className="flex items-start gap-2">
                                  <TrendingUp className={`mt-0.5 h-4 w-4 ${accentSoft}`} />
                                  <span>{effect}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 pt-2 text-sm">
                          <Link
                            href={roleDetails.primaryLink}
                            className={`${accentText} inline-flex items-center gap-1 font-semibold`}
                          >
                            {roleDetails.primaryCTA}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            {roleDetails.learnMore.resources.map((resource) => (
                              <Link
                                key={resource.href}
                                href={resource.href}
                                className="inline-flex items-center gap-1 font-medium text-gray-600 hover:text-gray-800"
                              >
                                {resource.label}
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
              <AccordionItem value="standardized" className="rounded-2xl border border-gray-100 px-2">
                <AccordionTrigger className="text-left text-base font-semibold text-gray-900">
                  Why standardized prequalification matters
                </AccordionTrigger>
                <AccordionContent className="px-2 text-sm text-gray-600">
                  <ul className="space-y-3">
                    {STANDARDIZED_DETAILS.map((detail) => (
                      <li key={detail} className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 text-blue-500" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Social proof */}
        <section className="space-y-3 text-center text-gray-600">
          <p className="text-sm sm:text-base">
            Join the network that standardizes prequalification while keeping private rentals personal.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500 sm:text-sm" data-testid="social-proof-list">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              No prequalification fees
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Personal relationships
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Faster response times
            </span>
          </div>
        </section>

        <footer className="mt-20 border-t border-gray-200 pt-8">
          <div className="flex flex-col items-center justify-center gap-6 text-sm text-gray-500 sm:flex-row">
            <Link href="/about" className="transition-colors hover:text-gray-700" data-testid="footer-about-link">
              About MyRentCard
            </Link>
            <span className="hidden sm:block">•</span>
            <span>© 2025 MyRentCard. Making rental connections better.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
