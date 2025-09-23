import { useState, useEffect } from 'react';
import {
  Building2,
  User,
  ArrowRight,
  CheckCircle,
  Users,
  Shield,
  TrendingUp,
  Star,
  Zap,
  Eye,
  QrCode,
  Sparkles,
  ClipboardCheck,
  MessageCircle
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/shared/navbar';
import { DERIVED_MESSAGING } from '@shared/value-propositions';
import { NETWORK_VALUE_PROPS } from '@shared/network-messaging';

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
  networkEffects: string[];
};

const ROLE_CONTENT: Record<UserRole, RoleContent> = {
  tenant: {
    hero: DERIVED_MESSAGING.TENANT.HERO,
    secondary: DERIVED_MESSAGING.TENANT.SECONDARY,
    description: 'Create once. Share anywhere—even off-platform.',
    primaryCTA: DERIVED_MESSAGING.TENANT.CALL_TO_ACTION,
    secondaryCTA: 'View Sample RentCard',
    primaryLink: '/api/login',
    secondaryLink: '/samples/rentcard',
    heroBullets: [
      'Reusable RentCard link and QR code for any property',
      'Know if it is a fit before booking showings',
      'Looks professional to every private landlord'
    ],
    spotlight: {
      title: 'What landlords see instantly',
      points: [
        'Income & employment verification',
        'Rental history & references',
        'Supporting documents in one place'
      ],
      footer: 'Share once. Update anytime.'
    },
    benefits: [
      {
        icon: Users,
        title: 'Standardized Network Access',
        description: 'Join the network to create your standardized RentCard once',
        badge: 'One profile, many landlords'
      },
      {
        icon: Shield,
        title: 'Direct Landlord Communication',
        description: 'Connect directly with private property owners',
        badge: 'Personal relationships'
      },
      {
        icon: Zap,
        title: 'Faster Response Times',
        description: 'Private landlords provide faster, more personal responses',
        badge: 'Same-day responses'
      }
    ],
    journey: [
      {
        title: 'Create your RentCard',
        description: 'Complete a polished profile with documents that travels with you.'
      },
      {
        title: 'Share anywhere',
        description: 'Send a link, show a QR code, or drop it into any listing conversation.'
      },
      {
        title: 'Hear back faster',
        description: 'Landlords already know you’re qualified before the first call.'
      }
    ],
    networkEffects: NETWORK_VALUE_PROPS.NETWORK_EFFECTS.TENANT
  },
  landlord: {
    hero: 'Get qualified tenants for your Private Rentals.',
    secondary: 'Free QR codes • One-click interest.',
    description: 'Professional efficiency with personal service.',
    primaryCTA: DERIVED_MESSAGING.LANDLORD.CALL_TO_ACTION,
    secondaryCTA: 'View Screening Tools',
    primaryLink: '/api/login',
    secondaryLink: '/samples/screening-page',
    heroBullets: [
      'Collect complete applications without chasing documents',
      'Instant QR code flyers for every vacancy',
      'Keep the personal touch with professional tools'
    ],
    spotlight: {
      title: 'Your property toolkit',
      points: [
        'Free branded QR codes & links',
        'Pre-qualified applicants delivered',
        'Track interest from one dashboard'
      ],
      footer: 'Built for independent landlords.'
    },
    benefits: [
      {
        icon: QrCode,
        title: 'Free QR Code Generation',
        description: 'Generate QR codes for signs and marketing materials',
        badge: 'Direct property links'
      },
      {
        icon: Users,
        title: 'Quality Tenant Pool',
        description: 'Attract tenants who prefer private landlords',
        badge: 'Better tenant fit'
      },
      {
        icon: TrendingUp,
        title: 'Competitive Tools',
        description: 'Professional screening with personal service',
        badge: 'Professional efficiency'
      }
    ],
    journey: [
      {
        title: 'Publish instantly',
        description: 'Spin up a QR code and digital flyer for every property—free.'
      },
      {
        title: 'Review full context',
        description: 'See income, references, and documents before you reply.'
      },
      {
        title: 'Choose confidently',
        description: 'Spend time with the right applicants and fill units faster.'
      }
    ],
    networkEffects: NETWORK_VALUE_PROPS.NETWORK_EFFECTS.LANDLORD
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
                  Prequalification network
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
                  Share once • Use everywhere
                </span>
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

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-10">
                <button
                  onClick={() => setSelectedRole('tenant')}
                  className={`flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                    !isLandlordSelected
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-white/70 text-slate-600 hover:bg-white'
                  }`}
                  data-testid="toggle-tenant"
                >
                  <User className="h-4 w-4" /> I'm Looking for a Place
                </button>
                <button
                  onClick={() => setSelectedRole('landlord')}
                  className={`flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                    isLandlordSelected
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-white/70 text-slate-600 hover:bg-white'
                  }`}
                  data-testid="toggle-landlord"
                >
                  <Building2 className="h-4 w-4" /> I Own/Manage Properties
                </button>
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
                    {isLandlordSelected ? 'Instant property toolkit' : 'Professional tenant preview'}
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
                          <MessageCircle className="h-4 w-4" />
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
              Built for momentum
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900">Your path through MyRentCard</h2>
            <p className="mt-3 text-lg text-slate-600 max-w-2xl">
              Follow a clear journey designed to respect everyone’s time and get qualified renters and landlords working together faster.
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

        <section className="mb-20">
          <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white via-white to-blue-50/80 p-8 sm:p-12 shadow-xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                The Network Gets Stronger with Every Connection
              </h2>
            <p className="mt-3 text-lg text-slate-600 max-w-3xl mx-auto">
                Join a growing community of private landlords and quality tenants building faster, more personal rental relationships.
              </p>
            </div>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {content.networkEffects.slice(0, 4).map((effect, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm"
                  data-testid={`network-effect-${index}`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      isLandlordSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    <Star className="h-5 w-5" />
                  </div>
                  <p className="text-sm sm:text-base font-medium text-slate-700">{effect}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
                <TrendingUp className="h-4 w-4" /> Growing Network
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
                <Shield className="h-4 w-4" /> Verified Connections
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
                <Zap className="h-4 w-4" /> Faster Response Times
              </span>
            </div>
          </div>
        </section>

        <section className="mb-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-400">Standardizing private rentals</p>
          <div className="mt-4 flex flex-wrap justify-center gap-5 text-sm text-slate-600" data-testid="social-proof-list">
            <span className="inline-flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" /> No prequalification fees
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" /> Personal relationships preserved
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
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold">Be the first conversation that feels prepared</h2>
              <p className="mt-4 text-lg text-slate-200">
                Whether you’re walking properties this weekend or prepping a new vacancy, MyRentCard makes you look buttoned-up before the first call.
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
                  Build trust instantly. Share a professional profile or property toolkit that keeps conversations moving forward.
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
