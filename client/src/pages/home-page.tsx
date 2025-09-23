import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Building2, User, ArrowRight, Eye, QrCode, Sparkles, ClipboardCheck, Users } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/shared/navbar';
import { DERIVED_MESSAGING } from '@shared/value-propositions';

type UserRole = 'tenant' | 'landlord';

type RoleContent = {
  hero: string;
  tagline: string;
  summary: string;
  primaryCTA: string;
  secondaryCTA: string;
  primaryLink: string;
  secondaryLink: string;
  quickFacts: {
    icon: LucideIcon;
    title: string;
    description: string;
  }[];
  tip: string;
  stepsIntro: string;
  steps: {
    title: string;
    description: string;
  }[];
};

const ROLE_CONTENT: Record<UserRole, RoleContent> = {
  tenant: {
    hero: DERIVED_MESSAGING.TENANT.HERO,
    tagline: 'Create once, update easily, share with one click.',
    summary:
      'Private landlords own 68.7% of rentals in America. Share your RentCard link or QR code with them in seconds.',
    primaryCTA: DERIVED_MESSAGING.TENANT.CALL_TO_ACTION,
    secondaryCTA: 'View Sample RentCard',
    primaryLink: '/api/login',
    secondaryLink: '/samples/rentcard',
    quickFacts: [
      {
        icon: QrCode,
        title: 'Link and QR included',
        description: 'Share with private landlords anywhere in a couple of taps.'
      },
      {
        icon: ClipboardCheck,
        title: 'Prequalification ready',
        description: 'Show income, employment, and rental history without extra forms.'
      },
      {
        icon: Sparkles,
        title: 'Update in minutes',
        description: 'Edit once before the next listing and resend immediately.'
      }
    ],
    tip: 'Pin your RentCard link so you can send it the moment you spot a match.',
    stepsIntro: 'Stay ready to share polished renter details without rebuilding anything.',
    steps: [
      {
        title: 'Add renter basics',
        description: 'Fill in income, employment, and rental history once.'
      },
      {
        title: 'Share the RentCard',
        description: 'Send the link or display the QR code in any conversation.'
      },
      {
        title: 'Keep it current',
        description: 'Update when something changes and reuse it instantly.'
      }
    ]
  },
  landlord: {
    hero: 'Spend your time with pre-qualified tenants.',
    tagline: 'Collect and organize tenant interest in one place.',
    summary:
      'Create a RentCard landlord profile for each property, offer one-click interest, and reuse QR codes anywhere you promote it.',
    primaryCTA: DERIVED_MESSAGING.LANDLORD.CALL_TO_ACTION,
    secondaryCTA: 'View Sample Property Profile',
    primaryLink: '/api/login',
    secondaryLink: '/samples/screening-page',
    quickFacts: [
      {
        icon: ClipboardCheck,
        title: 'One property hub',
        description: 'Keep every lead and their RentCard context together.'
      },
      {
        icon: Users,
        title: 'One-click interest',
        description: 'Tenants raise their hand with details already filled in.'
      },
      {
        icon: QrCode,
        title: 'Reusable QR codes',
        description: 'Print once for signage or reuse digitally across listings.'
      }
    ],
    tip: 'Duplicate a profile to cross-sell another property without starting over.',
    stepsIntro: 'Keep property interest organized from the first inquiry.',
    steps: [
      {
        title: 'Create the property profile',
        description: 'Add the basics and set how renters should reach you.'
      },
      {
        title: 'Share the link or QR code',
        description: 'Place it on listings, messages, or printed signs.'
      },
      {
        title: 'Review organized leads',
        description: 'Spend time connecting with renters who already fit.'
      }
    ]
  }
};

export default function HomePage() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('tenant');
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      const dashboardPath =
        'userType' in user && user.userType === 'landlord'
          ? '/landlord/dashboard'
          : '/tenant/dashboard';
      setLocation(dashboardPath);
    }
  }, [user, setLocation]);

  if (user) return null;

  const content = ROLE_CONTENT[selectedRole];
  const isLandlordSelected = selectedRole === 'landlord';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 sm:p-10 shadow-xl">
          <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                <Sparkles className="h-4 w-4" /> Private rental prequalification
              </span>
              <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1" role="tablist" aria-label="Choose tenant or landlord view">
                <button
                  onClick={() => setSelectedRole('tenant')}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus:outline-none ${
                    !isLandlordSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  data-testid="toggle-tenant"
                  role="tab"
                  aria-selected={!isLandlordSelected}
                  tabIndex={!isLandlordSelected ? 0 : -1}
                >
                  <User className="h-4 w-4" /> Tenant
                </button>
                <button
                  onClick={() => setSelectedRole('landlord')}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus:outline-none ${
                    isLandlordSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  data-testid="toggle-landlord"
                  role="tab"
                  aria-selected={isLandlordSelected}
                  tabIndex={isLandlordSelected ? 0 : -1}
                >
                  <Building2 className="h-4 w-4" /> Landlord
                </button>
              </div>
            </div>

            <div className="space-y-3" data-testid="homepage-title">
              <span className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-400">MyRentCard</span>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{content.hero}</h1>
              <p
                className={`text-lg font-semibold ${
                  isLandlordSelected ? 'text-emerald-600' : 'text-blue-600'
                }`}
              >
                {content.tagline}
              </p>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl">{content.summary}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <button
                onClick={() => {
                  localStorage.setItem('selectedRole', selectedRole);
                  window.location.href = content.primaryLink;
                }}
                className={`group inline-flex items-center justify-center gap-3 rounded-2xl px-6 sm:px-7 py-3 text-base font-semibold text-white transition-colors ${
                  isLandlordSelected ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
                data-testid="button-primary-cta"
              >
                {content.primaryCTA}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <Link
                href={content.secondaryLink}
                className={`group inline-flex items-center justify-center gap-3 rounded-2xl border px-6 sm:px-7 py-3 text-base font-semibold transition-colors ${
                  isLandlordSelected
                    ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-50'
                    : 'border-blue-500 text-blue-600 hover:bg-blue-50'
                }`}
                data-testid="button-secondary-cta"
              >
                {content.secondaryCTA}
                <Eye className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.quickFacts.map((fact, index) => (
                <div
                  key={fact.title}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm"
                  data-testid={`quick-fact-${index}`}
                >
                  <fact.icon
                    className={`h-6 w-6 ${isLandlordSelected ? 'text-emerald-500' : 'text-blue-500'}`}
                  />
                  <h3 className="mt-3 text-base font-semibold text-slate-900">{fact.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{fact.description}</p>
                </div>
              ))}
            </div>

            <div
              className={`flex items-start gap-3 rounded-2xl border px-4 py-4 text-sm sm:text-base ${
                isLandlordSelected
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-blue-200 bg-blue-50 text-blue-700'
              }`}
            >
              <Sparkles className="mt-1 h-5 w-5 flex-shrink-0" />
              <p>{content.tip}</p>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-slate-200 bg-white/90 p-6 sm:p-10 shadow-xl">
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">How it works</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {isLandlordSelected ? 'For landlords' : 'For tenants'}
              </h2>
              <p className="text-sm sm:text-base text-slate-600">{content.stepsIntro}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {content.steps.map((step, index) => (
                <div key={step.title} className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white ${
                      isLandlordSelected ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="mt-12 pb-12 text-center text-xs font-medium uppercase tracking-[0.4em] text-slate-400">
          © 2025 MyRentCard
          <span className="mx-3">•</span>
          <Link
            href="/about"
            className="text-slate-500 underline-offset-4 hover:text-slate-700 hover:underline"
            data-testid="footer-about-link"
          >
            About
          </Link>
        </footer>
      </main>
    </div>
  );
}
