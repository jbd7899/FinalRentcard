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
  ClipboardCheck,
  Layers,
  Handshake,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  Clock,
  Zap,
  RefreshCw,
  UserCheck,
  Smartphone
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/shared/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DERIVED_MESSAGING } from '@shared/value-propositions';

type UserRole = 'tenant' | 'landlord';

// Mission pillars for trust building
const missionPillars = [
  {
    icon: Sparkles,
    title: 'Look prepared everywhere',
    description:
      'MyRentCard was born from the frustration of sending the same documents to landlord after landlord. We built one polished format that shows you mean business.'
  },
  {
    icon: Layers,
    title: 'Bridge every platform',
    description:
      'Whether the conversation starts on Craigslist, a yard sign, or text message, RentCards and QR codes connect the dots so no opportunity is missed.'
  },
  {
    icon: Handshake,
    title: 'Respect both sides',
    description:
      'Private landlords want efficiency without feeling corporate. Renters want transparency without endless portals. MyRentCard honors the relationship.'
  }
];

// FAQ data for conversion optimization
const faqs = [
  {
    question: 'Do I have to create an account to use this?',
    answer:
      'Tenants create RentCards to express interest with landlords. Landlords can generate QR codes and collect prequalification without any account — you only sign up if you want to save your properties and view prequalification later.'
  },
  {
    question: "What if the landlord isn't on your platform?",
    answer:
      "That's totally fine! Your RentCard works anywhere. Share the link directly, send it in emails, or even print the QR code. The landlord just clicks and sees your complete rental information."
  },
  {
    question: 'How is this different from other rental platforms?',
    answer:
      'Most platforms lock you into their ecosystem. We focus on private landlords and direct relationships. Your RentCard works everywhere, whether the landlord uses our tools or not.'
  },
  {
    question: 'Is my information secure?',
    answer:
      'Yes. Your information is encrypted and you control exactly what gets shared with each landlord. You can revoke access anytime, and landlords only see what you choose to share.'
  },
  {
    question: 'What does it cost?',
    answer:
      'RentCards are free for tenants. Landlords can use basic QR code generation for free, and pay only if they want advanced tools for managing multiple properties.'
  },
  {
    question: "Can I use this if I'm just looking at places online?",
    answer:
      "Absolutely! Whether you're responding to Craigslist ads, Facebook Marketplace, or driving around looking at signs — your RentCard makes you look professional and prepared from the first contact."
  }
];

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
  testimonial: {
    text: string;
    attribution: string;
  };
};

const ROLE_CONTENT: Record<UserRole, RoleContent> = {
  tenant: {
    hero: DERIVED_MESSAGING.TENANT.HERO,
    secondary: DERIVED_MESSAGING.TENANT.SECONDARY,
    description:
      'Build your RentCard once, keep it updated in minutes, and hand private landlords the information they ask for—no extra forms.',
    primaryCTA: DERIVED_MESSAGING.TENANT.CALL_TO_ACTION,
    secondaryCTA: 'View Sample RentCard',
    primaryLink: '/auth',
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
    ],
    testimonial: {
      text: 'I stopped filling out one-off forms. Now every landlord already knows I match their requirements before we talk.',
      attribution: 'Celine, relocating renter'
    }
  },
  landlord: {
    hero: 'Spend your time with pre-qualified tenants.',
    secondary: 'Easily collect and organize tenant interest.',
    description:
      'Create a RentCard landlord profile for each property. Tenants submit interest with one click, and you keep every lead organized.',
    primaryCTA: DERIVED_MESSAGING.LANDLORD.CALL_TO_ACTION,
    secondaryCTA: 'View Screening Tools',
    primaryLink: '/auth',
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
    ],
    testimonial: {
      text: 'I post a QR code on my yard sign and only tour with qualified prospects. It feels personal and professional at once.',
      attribution: 'Marco, owner of three rentals'
    }
  }
};

export default function HomePage() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('tenant');
  const [showDetailedBenefits, setShowDetailedBenefits] = useState(false);
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

  // Save role selection for auth flow
  useEffect(() => {
    localStorage.setItem('selectedRole', selectedRole);
  }, [selectedRole]);

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

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Mobile-First Hero Section */}
        <section className="mb-12 sm:mb-16">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6" data-testid="homepage-title">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent block mb-3">
                MyRentCard
              </span>
              <span className="text-xl sm:text-2xl lg:text-3xl text-slate-700">
                The pre-qualification form for private landlords
              </span>
            </h1>
            
            {/* Clear Explanation */}
            <div className="max-w-3xl mx-auto mb-10">
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
A standardized pre-qualification profile that saves time for everyone. Tenants create one profile and share it with any private landlord. landlords get organized property interest in one place.
              </p>
              <div className="grid gap-4 sm:grid-cols-3 text-center">
                <div className="flex flex-col items-center">
                  <div className="bg-blue-100 p-3 rounded-xl mb-2">
                    <UserCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">One profile</p>
                  <p className="text-xs text-slate-500">Create once, share with anyone (even if they don't have an account)</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-emerald-100 p-3 rounded-xl mb-2">
                    <QrCode className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">One-Click Sharing</p>
                  <p className="text-xs text-slate-500">Links, QR codes, any platform</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-slate-100 p-3 rounded-xl mb-2">
                    <Handshake className="h-6 w-6 text-slate-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Set Expectations</p>
                  <p className="text-xs text-slate-500">Know there is a potential match before investing time in a call/showing</p>
                </div>
              </div>
            </div>

            {/* Clear Role Choice */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-6 text-center">
                Are you renting or do you own property?
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
                <button
                  onClick={() => setSelectedRole('tenant')}
                  className={`group relative flex flex-col gap-3 rounded-2xl border-2 p-6 text-left transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    !isLandlordSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-lg shadow-blue-600/20'
                      : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                  data-testid="choice-tenant"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-900">I'm looking to rent</p>
                      <p className="text-sm text-slate-600">Create a reusable rental profile</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setSelectedRole('landlord')}
                  className={`group relative flex flex-col gap-3 rounded-2xl border-2 p-6 text-left transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    isLandlordSelected
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-lg shadow-emerald-600/20'
                      : 'border-slate-200 bg-white hover:border-emerald-300'
                  }`}
                  data-testid="choice-landlord"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <Building2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-900">I own rental property</p>
                      <p className="text-sm text-slate-600">Collect tenant interest efficiently</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Role-Specific Next Steps */}
            <div className="mb-8">
              {selectedRole === 'tenant' ? (
                <div className="text-center p-6 bg-blue-50/70 rounded-2xl border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Create your RentCard in 2 minutes
                  </h3>
                  <p className="text-sm text-blue-700 mb-4">
                    Build your rental profile once and share it with any private landlord. No more filling out forms for every pre-qualification.
                  </p>
                  <div className="flex items-center justify-center gap-1 text-xs text-blue-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>Free forever</span>
                    <span className="mx-2">•</span>
                    <CheckCircle className="h-3 w-3" />
                    <span>Works everywhere</span>
                    <span className="mx-2">•</span>
                    <CheckCircle className="h-3 w-3" />
                    <span>2 minute setup</span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-2">
                    Create property profiles and QR codes
                  </h3>
                  <p className="text-sm text-emerald-700 mb-4">
                    Generate QR codes for your properties. Tenants submit interest with one click, and you keep every lead organized.
                  </p>
                  <div className="flex items-center justify-center gap-1 text-xs text-emerald-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>Free QR codes</span>
                    <span className="mx-2">•</span>
                    <CheckCircle className="h-3 w-3" />
                    <span>Organized leads</span>
                    <span className="mx-2">•</span>
                    <CheckCircle className="h-3 w-3" />
                    <span>2 minute setup</span>
                  </div>
                </div>
              )}
            </div>

            {/* Role-Specific CTAs */}
            <div className="flex flex-col gap-4 mb-8">
              <button
                onClick={() => {
                  localStorage.setItem('selectedRole', selectedRole);
                  const quickStartRoute = isLandlordSelected ? '/quickstart/landlord' : '/quickstart/tenant';
                  setLocation(quickStartRoute);
                }}
                className={`w-full inline-flex items-center justify-center gap-3 rounded-2xl px-6 py-4 text-base font-semibold text-white transition-all shadow-xl ${
                  isLandlordSelected
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/40'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/40'
                }`}
                data-testid="button-proceed-cta"
              >
                {isLandlordSelected ? 'Add your property' : 'Create your RentCard'}
                <ArrowRight className="h-5 w-5" />
              </button>
              
              {/* Secondary CTA */}
              <Link
                href={isLandlordSelected ? '/samples/screening-page' : '/samples/rentcard'}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                  isLandlordSelected
                    ? 'border-emerald-600 text-emerald-700 hover:bg-emerald-50'
                    : 'border-blue-600 text-blue-700 hover:bg-blue-50'
                }`}
                data-testid="button-sample-cta"
              >
                {isLandlordSelected ? (
                  <><QrCode className="h-4 w-4" />See sample QR code & tools</>
                ) : (
                  <><User className="h-4 w-4" />See sample RentCard</>
                )}
              </Link>

              {/* Interactive Demo CTA */}
              <Link
                href="/demo"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-3 text-sm font-semibold transition-all shadow-lg"
                data-testid="button-demo-cta"
              >
                <Sparkles className="h-4 w-4" />
                Try Interactive Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

          </div>
        </section>

        {/* Spotlight Preview - Mobile Optimized */}
        <section className="mb-12 sm:mb-16">
          <Card className="border shadow-xl bg-white/90">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <Badge
                  className={`text-xs font-semibold ${
                    isLandlordSelected ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  <ClipboardCheck className="h-3 w-3 mr-1" />
                  {isLandlordSelected ? 'Property interest summary' : 'RentCard preview'}
                </Badge>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Live preview</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4">{content.spotlight.title}</h3>
              <ul className="space-y-3 mb-6">
                {content.spotlight.points.map((point, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm text-slate-600">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${
                        isLandlordSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      <ClipboardCheck className="h-3 w-3" />
                    </div>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div
                className={`rounded-xl px-4 py-3 text-sm font-medium ${
                  isLandlordSelected ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                }`}
              >
                {content.spotlight.footer}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Benefits Cards - Mobile Stacked */}
        <section className="mb-12 sm:mb-16">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {content.benefits.map((benefit, index) => (
              <Card
                key={index}
                className="border border-slate-100 bg-white/90 shadow-lg hover:shadow-xl transition-all"
                data-testid={`benefit-card-${index}`}
              >
                <CardContent className="p-6">
                  <div className="absolute inset-x-4 top-0 h-1 rounded-b-full bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400" />
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${
                      isLandlordSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    <benefit.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{benefit.description}</p>
                  <Badge
                    variant="outline"
                    className={`text-xs font-semibold ${
                      isLandlordSelected ? 'border-emerald-500 text-emerald-600' : 'border-blue-500 text-blue-600'
                    }`}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {benefit.badge}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Progressive Disclosure for More Details */}
          <div className="mt-8 text-center">
            <Button
              variant="ghost"
              onClick={() => setShowDetailedBenefits(!showDetailedBenefits)}
              className="text-slate-600 hover:text-slate-900"
            >
              {showDetailedBenefits ? (
                <>
                  Show Less Details <ChevronUp className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  See More Details <ChevronDown className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>

          {showDetailedBenefits && (
            <div className="mt-8 space-y-4 animate-in slide-in-from-top duration-300">
              <Card className="border border-slate-100 bg-white/90">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-slate-900 mb-4">Why standardized prequalification matters:</h4>
                  <div className="space-y-3 text-sm text-slate-600">
                    <p>
                      <strong>{isLandlordSelected ? 'For landlords:' : 'For tenants:'}</strong>{' '}
                      {isLandlordSelected 
                        ? 'Get complete tenant information before scheduling showings. No more back-and-forth collecting documents.'
                        : 'Stop re-entering the same information for every pre-qualification. Present yourself professionally from the first contact.'
                      }
                    </p>
                    <p className="italic text-slate-500">
                      "{content.testimonial.text}"
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      — {content.testimonial.attribution}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </section>

        {/* Trust Building Section */}
        <section className="mb-12 sm:mb-16">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
              <Layers className="h-4 w-4 mr-1" /> Why we built MyRentCard
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
              A better starting point for every rental conversation
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Private rentals thrive on trust and speed. We help both sides show up prepared so decisions happen faster without losing the personal connection.
            </p>
          </div>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {missionPillars.map((pillar, index) => (
              <Card key={index} className="border border-slate-100 bg-white/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <pillar.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">{pillar.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{pillar.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12 sm:mb-16">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-slate-900 text-white hover:bg-slate-900">
              How it works
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">Your steps in minutes</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Every step keeps the focus on sharing clear information quickly.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {content.journey.map((step, index) => (
              <Card key={index} className="relative border border-slate-200 bg-white/90 shadow-sm">
                <CardContent className="p-6">
                  <div
                    className={`absolute -top-4 left-6 inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white ${
                      isLandlordSelected ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section - Critical for Conversion */}
        <section className="mb-12 sm:mb-16">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-slate-100 text-slate-700 hover:bg-slate-100">
              <HelpCircle className="h-4 w-4 mr-1" /> Frequently Asked Questions
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">Common questions</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Quick answers to help you get started with confidence.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-slate-200 rounded-2xl bg-white/90 shadow-sm px-6"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="text-base font-semibold text-slate-900">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Social Proof */}
        <section className="mb-12 sm:mb-16">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-4">Standardizing private rentals</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600" data-testid="social-proof-list">
              <span className="inline-flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> Works without requiring tenant accounts
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> Saves time on unqualified leads
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> One organized place for all interest
              </span>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="mb-12">
          <Card className="overflow-hidden border border-slate-100 bg-slate-900 text-white shadow-2xl">
            <div className="absolute h-80 w-80 -right-32 top-10 rounded-full bg-blue-500/40 blur-3xl" aria-hidden />
            <CardContent className="relative p-8 sm:p-12 text-center">
              <Badge className="mb-4 bg-white/10 text-white hover:bg-white/10">
                Ready when you are
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Look prepared before the first conversation</h2>
              <p className="text-lg text-slate-200 mb-8 max-w-2xl mx-auto">
                Whether you're searching for a rental or filling one, MyRentCard keeps the focus on real details instead of extra forms.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    localStorage.setItem('selectedRole', selectedRole);
                    const quickStartRoute = isLandlordSelected ? '/quickstart/landlord' : '/quickstart/tenant';
                    setLocation(quickStartRoute);
                  }}
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 text-base font-semibold text-slate-900 transition-all hover:bg-slate-100"
                >
                  {content.primaryCTA}
                  <ArrowRight className="h-5 w-5" />
                </button>
                <Link
                  href={content.secondaryLink}
                  className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/40 px-7 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
                >
                  {content.secondaryCTA}
                  <Eye className="h-5 w-5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="pb-8 text-center text-xs font-medium uppercase tracking-wide text-slate-400">
          © 2025 MyRentCard — Making rental connections better
        </footer>
      </main>
    </div>
  );
}