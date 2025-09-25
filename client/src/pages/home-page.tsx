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
        {/* Demo-First Hero Section */}
        <section className="mb-12 sm:mb-16">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6" data-testid="homepage-title">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent block mb-3">
                MyRentCard
              </span>
              <span className="text-xl sm:text-2xl lg:text-3xl text-slate-700">
                The pre-qualification standard for private landlords
              </span>
            </h1>
            
            {/* Simple Value Prop */}
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              One rental profile that works everywhere. Tenants build it once, landlords get organized leads. 
              <strong className="text-slate-800"> See it in action →</strong>
            </p>

            {/* Role Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
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
                      <p className="text-sm text-slate-600">Get organized tenant leads</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Primary Demo CTA */}
            <div className="mb-6">
              <Link
                href={isLandlordSelected ? '/landlord-demo' : '/demo'}
                className={`w-full inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-5 text-xl font-bold text-white transition-all shadow-2xl transform hover:scale-105 ${
                  isLandlordSelected
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-emerald-600/40'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-600/40'
                }`}
                data-testid="button-demo-cta"
              >
                <Sparkles className="h-6 w-6" />
                {isLandlordSelected ? 'See How Landlords Get Better Leads' : 'See How Tenants Look Professional'}
                <ArrowRight className="h-6 w-6" />
              </Link>
              <p className="text-sm text-slate-500 mt-3">
                ✨ Interactive demo • No signup required • 2 minutes
              </p>
            </div>

            {/* Secondary Signup CTA */}
            <div className="mb-8">
              <button
                onClick={() => {
                  localStorage.setItem('selectedRole', selectedRole);
                  const quickStartRoute = isLandlordSelected ? '/quickstart/landlord' : '/quickstart/tenant';
                  setLocation(quickStartRoute);
                }}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 px-6 py-3 text-base font-semibold transition-all ${
                  isLandlordSelected
                    ? 'border-emerald-600 text-emerald-700 hover:bg-emerald-50'
                    : 'border-blue-600 text-blue-700 hover:bg-blue-50'
                }`}
                data-testid="button-proceed-cta"
              >
                {isLandlordSelected ? 'Add Your Property' : 'Create Your RentCard'}
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            {/* Key Benefits - Simplified */}
            <div className={`text-center p-6 rounded-2xl border ${
              isLandlordSelected 
                ? 'bg-emerald-50/70 border-emerald-200' 
                : 'bg-blue-50/70 border-blue-200'
            }`}>
              <div className={`flex items-center justify-center gap-6 text-sm font-medium ${
                isLandlordSelected ? 'text-emerald-800' : 'text-blue-800'
              }`}>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {isLandlordSelected ? 'Free QR codes' : 'Free forever'}
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {isLandlordSelected ? 'Organized leads' : 'Works anywhere'}
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {isLandlordSelected ? 'Better tenants' : 'Look prepared'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Explainer */}
        <section className="mb-12 sm:mb-16">
          <Card className="border border-slate-200 bg-white/95 shadow-lg">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Why the demo is worth 2 minutes of your time
              </h2>
              <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
                Instead of explaining how MyRentCard works, we'll show you the exact experience. Build a real {isLandlordSelected ? 'property listing' : 'rental profile'}, 
                see how {isLandlordSelected ? 'tenants discover and respond to it' : 'you share it with landlords'}, and watch both sides of the conversation.
              </p>
              <div className="grid gap-4 sm:grid-cols-3 text-center">
                <div className="p-4">
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                    isLandlordSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {isLandlordSelected ? 'Build your property' : 'Build your profile'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {isLandlordSelected 
                      ? 'See how easy it is to create professional property listings'
                      : 'Experience building a complete rental profile that looks professional'
                    }
                  </p>
                </div>
                <div className="p-4">
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                    isLandlordSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {isLandlordSelected ? 'Choose your strategy' : 'Pick your approach'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {isLandlordSelected 
                      ? 'QR codes, online listings, or direct sharing - see all your options'
                      : 'Text messages, emails, or QR codes - see how each works'
                    }
                  </p>
                </div>
                <div className="p-4">
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                    isLandlordSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">See both perspectives</h3>
                  <p className="text-sm text-slate-600">
                    {isLandlordSelected 
                      ? 'Watch how tenants respond and what you receive in your dashboard'
                      : 'See what landlords get and how they view your information'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Essential FAQ Section */}
        <section className="mb-12 sm:mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Quick questions</h2>
            <p className="text-lg text-slate-600">
              The demo shows how it works. Here are the practical details.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.slice(0, 4).map((faq, index) => (
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

        {/* Final CTA Section */}
        <section className="mb-12">
          <Card className="overflow-hidden border border-slate-100 bg-slate-900 text-white shadow-2xl">
            <div className="absolute h-80 w-80 -right-32 top-10 rounded-full bg-blue-500/40 blur-3xl" aria-hidden />
            <CardContent className="relative p-8 sm:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Ready to {isLandlordSelected ? 'get better tenant leads' : 'look professional everywhere'}?
              </h2>
              <p className="text-lg text-slate-200 mb-8 max-w-2xl mx-auto">
                {isLandlordSelected 
                  ? 'Join landlords who save hours per application with organized, complete tenant information upfront.'
                  : 'Join tenants who never fill out the same pre-qualification form twice and always look prepared.'
                }
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
                  {isLandlordSelected ? 'Add Your Property' : 'Create Your RentCard'}
                  <ArrowRight className="h-5 w-5" />
                </button>
                <Link
                  href={isLandlordSelected ? '/landlord-demo' : '/demo'}
                  className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/40 px-7 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
                >
                  <Sparkles className="h-5 w-5" />
                  Try the Demo First
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