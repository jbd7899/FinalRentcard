import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  User,
  ArrowRight,
  Eye,
  QrCode,
  Sparkles,
  ClipboardCheck,
  Users,
} from 'lucide-react';
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
  selector: {
    label: string;
    description: string;
    icon: LucideIcon;
  };
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
    tagline: 'Update easily and share prequalification details with private landlords.',
    summary:
      'Private landlords own 68.7% of rentals in America. Keep everything in one RentCard link or QR code—no verification hoops, just the facts you control.',
    primaryCTA: DERIVED_MESSAGING.TENANT.CALL_TO_ACTION,
    secondaryCTA: 'View Sample RentCard',
    primaryLink: '/api/login',
    secondaryLink: '/samples/rentcard',
    selector: {
      label: "I'm a renter",
      description: 'Create once, share easily with private landlords.',
      icon: User,
    },
    quickFacts: [
      {
        icon: QrCode,
        title: 'Link and QR included',
        description: 'Send your RentCard anywhere private landlords promote rentals.',
      },
      {
        icon: ClipboardCheck,
        title: 'Prequalification ready',
        description: 'Show income, history, and references without rewriting forms.',
      },
      {
        icon: Sparkles,
        title: 'No verification hoops',
        description: 'Share information directly and update it any time.',
      },
    ],
    tip: 'Save your RentCard link as a ready reply for new listings.',
    stepsIntro: 'Share the full picture without rewriting details.',
    steps: [
      {
        title: 'Build your RentCard once',
        description: 'Add income, employment, and rental history in one session.',
      },
      {
        title: 'Share the link or QR code',
        description: 'Send it to private landlords the moment you see a fit.',
      },
      {
        title: 'Keep it current',
        description: 'Update details before your next round of outreach.',
      },
    ],
  },
  landlord: {
    hero: 'Spend your time with pre-qualified tenants.',
    tagline: 'Collect and organize tenant interest in one place.',
    summary:
      'Create a RentCard profile for each property, let tenants submit interest with one click, and reuse QR codes wherever you advertise.',
    primaryCTA: DERIVED_MESSAGING.LANDLORD.CALL_TO_ACTION,
    secondaryCTA: 'View Sample Property Profile',
    primaryLink: '/api/login',
    secondaryLink: '/samples/screening-page',
    selector: {
      label: "I'm a landlord",
      description: 'Collect organized interest and reuse QR codes everywhere.',
      icon: Building2,
    },
    quickFacts: [
      {
        icon: ClipboardCheck,
        title: 'Organized interest',
        description: 'Keep every inquiry and RentCard context in one view.',
      },
      {
        icon: Users,
        title: 'One-click interest',
        description: 'Tenants raise their hand with complete details attached.',
      },
      {
        icon: QrCode,
        title: 'Reusable QR codes',
        description: 'Use the same code for signage, showings, and cross-selling.',
      },
    ],
    tip: 'Duplicate a profile to cross-sell another property instantly.',
    stepsIntro: 'Keep every property conversation tidy from the first click.',
    steps: [
      {
        title: 'Create the property profile',
        description: 'Add the basics and note how renters should contact you.',
      },
      {
        title: 'Share the link or QR code',
        description: 'Place it on listings, messages, or printed signs.',
      },
      {
        title: 'Review organized leads',
        description: 'Focus on tenants who already match your criteria.',
      },
    ],
  },
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
  const roleOrder: UserRole[] = ['tenant', 'landlord'];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 sm:p-10 shadow-xl">
          <div className="flex flex-col gap-10">
            <div className="space-y-4" data-testid="homepage-title">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                <Sparkles className="h-4 w-4" /> Private rental toolkit
              </span>
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

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Choose your view</p>
              <div className="grid gap-3 sm:grid-cols-2" role="tablist" aria-label="Choose tenant or landlord view">
                {roleOrder.map((role) => {
                  const roleContent = ROLE_CONTENT[role];
                  const isActive = selectedRole === role;
                  const Icon = roleContent.selector.icon;
                  const activeBorder =
                    role === 'landlord'
                      ? isActive
                        ? 'border-emerald-500 bg-emerald-50 shadow-sm focus-visible:ring-emerald-500'
                        : 'border-slate-200 hover:border-emerald-400 focus-visible:ring-emerald-300'
                      : isActive
                      ? 'border-blue-500 bg-blue-50 shadow-sm focus-visible:ring-blue-500'
                      : 'border-slate-200 hover:border-blue-400 focus-visible:ring-blue-300';

                  const iconColor =
                    role === 'landlord'
                      ? isActive
                        ? 'text-emerald-600'
                        : 'text-emerald-500'
                      : isActive
                      ? 'text-blue-600'
                      : 'text-blue-500';

                  return (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`flex h-full items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${activeBorder}`}
                      data-testid={`toggle-${role}`}
                      role="tab"
                      aria-selected={isActive}
                      tabIndex={isActive ? 0 : -1}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white text-lg font-semibold ${iconColor}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                          {roleContent.selector.label}
                        </p>
                        <p className="text-base text-slate-700">{roleContent.selector.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
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
