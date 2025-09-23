import { useState, useEffect } from 'react';
import {
  Building2,
  User,
  ArrowRight,
  CheckCircle,
  Users,
  TrendingUp,
  Eye,
  QrCode,
  Sparkles,
  ClipboardCheck
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/shared/navbar';
import { DERIVED_MESSAGING } from '@shared/value-propositions';

type UserRole = 'tenant' | 'landlord';

type RoleContent = {
  hero: string;
  secondary: string;
  description: string;
  primaryCTA: string;
  secondaryCTA: string;
  primaryLink: string;
  secondaryLink: string;
  heroBullets: string[];
  spotlight: {
    title: string;
    points: string[];
    footer: string;
  };
  benefits: {
    icon: typeof Users;
    title: string;
    description: string;
    badge: string;
  }[];
  journey: {
    title: string;
    description: string;
  }[];
};

const ROLE_CONTENT: Record<UserRole, RoleContent> = {
  tenant: {
    hero: DERIVED_MESSAGING.TENANT.HERO,
    secondary: DERIVED_MESSAGING.TENANT.SECONDARY,
    description:
      'Build your RentCard once, keep it updated in minutes, and hand private landlords the information they ask for—no extra forms.',
    primaryCTA: DERIVED_MESSAGING.TENANT.CALL_TO_ACTION,
    secondaryCTA: 'View Sample RentCard',
    primaryLink: '/api/login',
    secondaryLink: '/samples/rentcard',
    heroBullets: [
      'Reusable RentCard link and QR code for any property',
      'Know if you are a fit before booking a showing',
      'Looks polished to every private landlord'
    ],
    spotlight: {
      title: 'What landlords see instantly',
      points: [
        'Income and employment summary',
        'Rental history and references',
        'Supporting documents you choose to share'
      ],
      footer: 'Update once, share everywhere.'
    },
    benefits: [
      {
        icon: Users,
        title: 'One profile, endless shares',
        description: 'Send the same RentCard link or QR code to every private landlord.',
        badge: 'Share once'
      },
      {
        icon: ClipboardCheck,
        title: 'Clear renter details',
        description: 'Present income, employment, and rental history exactly how landlords expect.',
        badge: 'Context first'
      },
      {
        icon: Sparkles,
        title: 'Update in minutes',
        description: 'Edit your RentCard anytime before you share it again.',
        badge: 'Stay ready'
      }
    ],
    journey: [
      {
        title: 'Create your RentCard',
        description: 'Add your renter details and supporting documents once.'
      },
      {
        title: 'Share it anywhere',
        description: 'Send a link, show a QR code, or drop it into any listing conversation.'
      },
      {
        title: 'Hear back with context',
        description: 'Landlords review your prequalification details upfront.'
      }
    ]
  },
  landlord: {
    hero: 'Spend your time with pre-qualified tenants.',
    secondary: 'Easily collect and organize tenant interest.',
    description:
      'Create a RentCard landlord profile for each property. Tenants submit interest with one click, and you keep every lead organized.',
    primaryCTA: DERIVED_MESSAGING.LANDLORD.CALL_TO_ACTION,
    secondaryCTA: 'View Screening Tools',
    primaryLink: '/api/login',
    secondaryLink: '/samples/screening-page',
    heroBullets: [
      'Create a RentCard landlord profile for each property',
      'Tenants submit interest with one click',
      'Generate QR codes for every listing'
    ],
    spotlight: {
      title: 'What you capture instantly',
      points: [
        'Property QR codes ready for signs and listings',
        'One-click interest submissions from tenants',
        'RentCard context and contact details in one place'
      ],
      footer: 'Keep leads organized without extra tools.'
    },
    benefits: [
      {
        icon: QrCode,
        title: 'Easy QR code generation',
        description: 'Print or share property QR codes in seconds.',
        badge: 'Instant flyers'
      },
      {
        icon: Users,
        title: 'Organized tenant interest',
        description: 'See every interested renter with their RentCard context.',
        badge: 'One dashboard'
      },
      {
        icon: ClipboardCheck,
        title: 'Focus on strong matches',
        description: 'Spend time on renters who share the details you need upfront.',
        badge: 'Pre-qualified focus'
      }
    ],
    journey: [
      {
        title: 'Create a property profile',
        description: 'Add property details and share your RentCard link or QR code.'
      },
      {
        title: 'Collect one-click interest',
        description: 'Tenants submit their details without chasing extra paperwork.'
      },
      {
        title: 'Follow up with the best fit',
        description: 'Review organized context and connect with the matches you prefer.'
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
    <div className="min-h-screen bg-slate-950/5">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute top-40 -left-32 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <section className="relative overflow-hidden rounded-3xl bg-white/80 shadow-2xl backdrop-blur border border-white/60 mb-20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-white/40 to-emerald-500/10" aria-hidden />
          <div className="relative grid gap-12 lg:grid-cols-[1.05fr_minmax(0,0.95fr)] p-8 sm:p-12">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Private rental prequalification
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
                  Create once • Share everywhere
                </span>
              </div>

              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Choose who you are
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2" role="tablist" aria-label="Choose tenant or landlord view">
                  <button
                    onClick={() => setSelectedRole('tenant')}
                    className={`group relative flex flex-col gap-2 rounded-2xl border-2 p-5 text-left transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      !isLandlordSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-lg shadow-blue-600/20'
                        : 'border-transparent bg-white/70 hover:border-blue-200'
                    }`}
                    data-testid="toggle-tenant"
                    role="tab"
                    aria-selected={!isLandlordSelected}
                    tabIndex={!isLandlordSelected ? 0 : -1}
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                      <User className="h-4 w-4" /> Tenant
                    </div>
                    <p className="text-lg font-semibold text-slate-900">Create once, share easily.</p>
                    <p className="text-sm text-slate-600">
                      Keep a polished RentCard ready for the 68.7% of rentals owned by private landlords.
                    </p>
                  </button>
                  <button
                    onClick={() => setSelectedRole('landlord')}
                    className={`group relative flex flex-col gap-2 rounded-2xl border-2 p-5 text-left transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                      isLandlordSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-lg shadow-emerald-600/20'
                        : 'border-transparent bg-white/70 hover:border-emerald-200'
                    }`}
                    data-testid="toggle-landlord"
                    role="tab"
                    aria-selected={isLandlordSelected}
                    tabIndex={isLandlordSelected ? 0 : -1}
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                      <Building2 className="h-4 w-4" /> Landlord
                    </div>
                    <p className="text-lg font-semibold text-slate-900">Spend your time with pre-qualified tenants.</p>
                    <p className="text-sm text-slate-600">
                      Collect organized interest and reuse QR codes across every property.
                    </p>
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900" data-testid="homepage-title">
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent">
                    MyRentCard
                  </span>
                  <span className="mt-4 block text-2xl sm:text-3xl text-slate-800 transition-colors duration-300">
                    {content.hero}
                  </span>
                </h1>
                <p
                  className={`mt-4 text-lg sm:text-xl font-semibold transition-colors duration-300 ${
                    isLandlordSelected ? 'text-emerald-600' : 'text-blue-600'
                  }`}
                >
                  {content.secondary}
                </p>
                <p className="mt-6 text-lg text-slate-600 leading-relaxed">{content.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                <button
                  onClick={() => {
                    localStorage.setItem('selectedRole', selectedRole);
                    window.location.href = content.primaryLink;
                  }}
                  className={`group inline-flex items-center justify-center gap-3 rounded-2xl px-6 sm:px-8 py-4 text-base font-semibold text-white transition-all shadow-xl ${
                    isLandlordSelected
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/40'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/40'
                  }`}
                  data-testid="button-primary-cta"
                >
                  {content.primaryCTA}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
                <Link
                  href={content.secondaryLink}
                  className={`group inline-flex items-center justify-center gap-3 rounded-2xl border px-6 sm:px-8 py-4 text-base font-semibold transition-all ${
                    isLandlordSelected
                      ? 'border-emerald-600 text-emerald-700 hover:bg-emerald-50'
                      : 'border-blue-600 text-blue-700 hover:bg-blue-50'
                  }`}
                  data-testid="button-secondary-cta"
                >
                  {content.secondaryCTA}
                  <Eye className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="mt-10 grid gap-3">
                {content.heroBullets.map((bullet, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm sm:text-base text-slate-600">
                    <CheckCircle
                      className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                        isLandlordSelected ? 'text-emerald-500' : 'text-blue-500'
                      }`}
                    />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div
                className={`absolute -top-20 right-10 h-36 w-36 rounded-full blur-3xl ${
                  isLandlordSelected ? 'bg-emerald-200/60' : 'bg-blue-200/60'
                }`}
              />
              <div className="relative h-full rounded-2xl bg-white/90 border shadow-xl p-8 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                      isLandlordSelected ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    <ClipboardCheck className="h-4 w-4" />
                    {isLandlordSelected ? 'Property interest summary' : 'RentCard preview'}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Live preview</span>
                </div>
                <div className="mt-8 space-y-5">
                  <h2 className="text-xl font-semibold text-slate-900">{content.spotlight.title}</h2>
                  <ul className="space-y-3">
                    {content.spotlight.points.map((point, index) => (
                      <li key={index} className="flex items-center gap-3 text-sm text-slate-600">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            isLandlordSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                          }`}
                        >
                          <ClipboardCheck className="h-4 w-4" />
                        </div>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div
                  className={`mt-10 rounded-xl px-5 py-4 text-sm font-medium ${
                    isLandlordSelected ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  {content.spotlight.footer}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {content.benefits.map((benefit, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white/90 p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl"
                data-testid={`benefit-card-${index}`}
              >
                <div className="absolute inset-x-4 top-0 h-1 rounded-b-full bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400" />
                <div
                  className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl transition-colors ${
                    isLandlordSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  <benefit.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{benefit.title}</h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
                <div
                  className={`mt-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    isLandlordSelected ? 'border-emerald-500 text-emerald-600' : 'border-blue-500 text-blue-600'
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  {benefit.badge}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20 rounded-3xl border border-slate-100 bg-white/70 p-8 sm:p-12 shadow-xl">
          <div className="mb-10 text-center sm:text-left">
            <span className="inline-flex items-center rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              How it works
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900">Your steps in minutes</h2>
            <p className="mt-3 text-lg text-slate-600 max-w-2xl">
              Every step keeps the focus on sharing clear information quickly.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {content.journey.map((step, index) => (
              <div key={index} className="relative rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
                <div
                  className={`absolute -top-4 left-6 inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white ${
                    isLandlordSelected ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}
                >
                  {index + 1}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-400">Standardizing private rentals</p>
          <div className="mt-4 flex flex-wrap justify-center gap-5 text-sm text-slate-600" data-testid="social-proof-list">
            <span className="inline-flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" /> No prequalification fees
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" /> Keep your personal approach
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" /> Responses in hours, not days
            </span>
          </div>
        </section>

        <section className="mb-24 overflow-hidden rounded-3xl border border-slate-100 bg-slate-900 text-white shadow-2xl">
          <div className="absolute h-80 w-80 -right-32 top-10 rounded-full bg-blue-500/40 blur-3xl" aria-hidden />
          <div className="relative grid gap-10 p-10 sm:p-14 lg:grid-cols-[1.1fr_minmax(0,0.9fr)]">
            <div>
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                Ready when you are
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold">Look prepared before the first conversation</h2>
              <p className="mt-4 text-lg text-slate-200">
                Whether you’re searching for a rental or filling one, MyRentCard keeps the focus on real details instead of extra forms.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:gap-5">
                <button
                  onClick={() => {
                    localStorage.setItem('selectedRole', selectedRole);
                    window.location.href = content.primaryLink;
                  }}
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 text-base font-semibold text-slate-900 transition-all hover:bg-slate-100"
                >
                  {content.primaryCTA}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
                <Link
                  href={content.secondaryLink}
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl border border-white/40 px-7 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
                >
                  {content.secondaryCTA}
                  <Eye className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
            <div className="space-y-5">
              <div className="rounded-2xl bg-white/10 p-6">
                <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
                  <Sparkles className="h-5 w-5" /> Private rental advantage
                </div>
                <p className="mt-4 text-base text-slate-100">
                  Share a clean RentCard or property profile that keeps conversations moving forward.
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-6">
                <p className="text-sm font-semibold text-white/70">What users tell us:</p>
                <p className="mt-3 text-lg text-white">
                  “Every landlord I talk to mentions how prepared I look. The QR code on my for-rent sign fills my inbox with qualified inquiries.”
                </p>
                <p className="mt-4 text-sm font-medium text-white/70">— Real MyRentCard tenant & landlord feedback</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="pb-12 text-center text-xs font-medium uppercase tracking-[0.4em] text-slate-400">
          © 2025 MyRentCard — Making rental connections better
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
