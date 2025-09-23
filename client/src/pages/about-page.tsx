import { useState } from 'react';
import {
  Building2,
  User,
  ArrowRight,
  CheckCircle,
  Users,
  Shield,
  Clock,
  QrCode,
  Zap,
  HelpCircle,
  RefreshCw,
  UserCheck,
  Home,
  Smartphone,
  Eye,
  Sparkles,
  Layers,
  Compass,
  Handshake,
  ListChecks
} from 'lucide-react';
import { Link } from 'wouter';
import Navbar from '@/components/shared/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type UserRole = 'tenant' | 'landlord';

type RoleNarrative = {
  headline: string;
  subheadline: string;
  description: string;
  promise: string;
  highlightStats: { label: string; detail: string }[];
  quote: { text: string; attribution: string };
};

const ROLE_NARRATIVE: Record<UserRole, RoleNarrative> = {
  tenant: {
    headline: 'Built for renters who want momentum',
    subheadline: 'Stop rewriting your story for every landlord. Create one polished RentCard and put it everywhere you apply.',
    description:
      'MyRentCard standardizes the information private landlords need to say yes—income, references, documents, and your story. You look prepared before the first conversation.',
    promise: 'Landlords get the full picture instantly so you spend time touring places that are actually a fit.',
    highlightStats: [
      { label: 'Reusable profile', detail: 'Share one link or QR code anywhere' },
      { label: 'Direct relationships', detail: 'Start conversations with decision makers' },
      { label: 'Faster feedback', detail: 'Know where you stand in hours, not days' }
    ],
    quote: {
      text: 'I stopped filling out one-off forms. Now every landlord already knows I match their requirements before we talk.',
      attribution: 'Celine, relocating renter'
    }
  },
  landlord: {
    headline: 'Created for independent landlords and small portfolios',
    subheadline:
      'Capture interest from serious renters without sacrificing the personal touch that sets you apart. MyRentCard handles the paperwork so you can focus on the conversation.',
    description:
      'Offer renters a professional experience with zero setup. Generate a QR code for your property, collect standardized prequalification, and review applications from anywhere.',
    promise: 'You keep control of your process while renters deliver complete information right away.',
    highlightStats: [
      { label: 'Free QR codes', detail: 'Launch a property toolkit in under a minute' },
      { label: 'Complete context', detail: 'Income, documents, and references upfront' },
      { label: 'Personal follow-through', detail: 'Spend your time with the right renters' }
    ],
    quote: {
      text: 'I post a QR code on my yard sign and only tour with qualified prospects. It feels personal and professional at once.',
      attribution: 'Marco, owner of three rentals'
    }
  }
};

const howItWorksSteps = {
  tenant: [
    {
      icon: UserCheck,
      title: 'Create Your RentCard Once',
      description: 'Complete your standardized rental profile with income, references, and documents.',
      detail: 'Use the same professional prequalification format with every landlord.'
    },
    {
      icon: Eye,
      title: 'Express Interest Instantly Anywhere',
      description:
        'Share your RentCard link or QR code. Landlords can review your qualifications before scheduling showings.',
      detail: "Know if it's a match from the beginning - saves time for everyone."
    },
    {
      icon: Zap,
      title: 'Get Faster Responses',
      description: 'Get faster responses from landlords who can see you\'re qualified upfront.',
      detail: "Skip unnecessary showings when your profile doesn't match their requirements."
    }
  ],
  landlord: [
    {
      icon: QrCode,
      title: 'Post Your Property (Free)',
      description: 'Generate a free QR code for your property. No account required - just create and go.',
      detail: 'Put the QR code on signs, listings, or share the link directly.'
    },
    {
      icon: Users,
      title: 'Get Pre-Qualified Tenants',
      description: 'Receive complete prequalification from pre-qualified tenants before first contact.',
      detail: 'Review income, references, and documents upfront - no back-and-forth collection.'
    },
    {
      icon: Clock,
      title: 'Make Decisions Faster',
      description:
        'Review complete prequalification in minutes, not days. Your personal touch with professional efficiency.',
      detail: 'Make decisions quickly while maintaining personal service.'
    }
  ]
};

const benefits = {
  tenant: [
    {
      icon: RefreshCw,
      title: 'Standardized Prequalification Format',
      description: 'Create your rental profile once, use it with any landlord. Consistent professional presentation every time.',
      reality: 'Saves hours of time re-entering the same employment and income information.'
    },
    {
      icon: Clock,
      title: 'Faster Response Times',
      description: 'Landlords can review your qualifications immediately and respond with specific feedback.',
      reality: 'Know upfront if you meet requirements instead of waiting for form responses.'
    },
    {
      icon: Shield,
      title: 'Direct Communication',
      description: 'Connect directly with property owners who can make immediate decisions.',
      reality: 'Streamlined communication leads to faster rental decisions.'
    }
  ],
  landlord: [
    {
      icon: Smartphone,
      title: 'No Complex Setup Required',
      description: 'Generate QR codes and collect prequalification without creating accounts or learning new systems.',
      reality: 'Focus on finding qualified tenants with minimal administrative overhead.'
    },
    {
      icon: UserCheck,
      title: 'Complete Prequalification Upfront',
      description: 'Tenants using MyRentCard provide income verification, references, and documents before contact.',
      reality: 'Eliminate time spent collecting basic qualification information.'
    },
    {
      icon: Zap,
      title: 'Professional Tools',
      description: 'Access efficient screening tools while maintaining your personal approach to tenant relationships.',
      reality: 'Meet tenant expectations for professional service without sacrificing personal connections.'
    }
  ]
};

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

const visionPoints = [
  {
    icon: Compass,
    title: 'A standard for private rentals',
    description: 'We\'re building the shared language that helps independent landlords and renters move faster together.'
  },
  {
    icon: Home,
    title: 'Access that travels with you',
    description: 'Your RentCard is portable. Wherever you search, you bring a complete story and verifications along.'
  },
  {
    icon: ListChecks,
    title: 'Confidence in every introduction',
    description: 'When information is consistent and verified, everyone can make decisions with clarity.'
  }
];

const faqs = [
  {
    question: 'Do I have to create an account to use this?',
    answer:
      'Tenants create RentCards to express interest with landlords. Landlords can generate QR codes and collect prequalification without any account - you only sign up if you want to save your properties and view prequalification later.'
  },
  {
    question: "What if the landlord isn't on your platform?",
    answer:
      "That's totally fine! Your RentCard works anywhere. You can share the link directly, send it in emails, or even print the QR code. The landlord just clicks and sees your complete rental information."
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
      "Absolutely! Whether you're responding to Craigslist ads, Facebook Marketplace, or driving around looking at signs - your RentCard makes you look professional and prepared from the first contact."
  }
];

export default function AboutPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('tenant');
  const isLandlordSelected = selectedRole === 'landlord';
  const narrative = ROLE_NARRATIVE[selectedRole];

  return (
    <div className="min-h-screen bg-slate-950/5">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 left-0 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute top-24 right-0 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-20">
        <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-2xl backdrop-blur">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-white/40 to-emerald-500/10" aria-hidden />
          <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.05fr_minmax(0,0.9fr)]">
            <div>
              <Badge variant="outline" className="mb-6 text-blue-600 border-blue-200 bg-white/60" data-testid="about-badge">
                About MyRentCard
              </Badge>

              <h1 className="text-3xl sm:text-5xl font-bold text-slate-900" data-testid="about-hero-title">
                Standardized Prequalification for Private Rentals
              </h1>
              <p className="mt-4 text-lg text-slate-600 leading-relaxed">{narrative.subheadline}</p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setSelectedRole('tenant')}
                  className={`flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                    !isLandlordSelected
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-white/70 text-slate-600 hover:bg-white'
                  }`}
                  data-testid="about-toggle-tenant"
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
                  data-testid="about-toggle-landlord"
                >
                  <Building2 className="h-4 w-4" /> I Own/Manage Properties
                </button>
              </div>

              <div className="mt-10 space-y-5 text-slate-600">
                <p className="text-lg leading-relaxed">{narrative.description}</p>
                <p className="text-base font-medium text-slate-700">{narrative.promise}</p>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {narrative.highlightStats.map((stat, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{stat.label}</p>
                    <p className="mt-2 text-sm font-medium text-slate-700">{stat.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div
                className={`absolute -top-12 right-6 h-32 w-32 rounded-full blur-3xl ${
                  isLandlordSelected ? 'bg-emerald-200/60' : 'bg-blue-200/60'
                }`}
              />
              <Card className="relative h-full border-none bg-white/90 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-slate-900">
                    {narrative.headline}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-3 rounded-xl bg-slate-900 text-white px-4 py-3 text-sm font-medium">
                    <Sparkles className="h-5 w-5" />
                    Designed for private rentals
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{narrative.description}</p>
                  <div className="rounded-xl bg-slate-100/80 p-5">
                    <p className="text-sm text-slate-500 italic">“{narrative.quote.text}”</p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      — {narrative.quote.attribution}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
              <Layers className="h-4 w-4" /> Why we built MyRentCard
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900">A better starting point for every rental conversation</h2>
            <p className="mt-3 text-lg text-slate-600 max-w-3xl mx-auto">
              Private rentals thrive on trust and speed. We help both sides show up prepared so decisions happen faster without losing the personal connection.
            </p>
          </div>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {missionPillars.map((pillar, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-lg"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <pillar.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{pillar.title}</h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <Card className="overflow-hidden border-none bg-white/80 shadow-xl">
            <CardHeader className={`text-center ${isLandlordSelected ? 'bg-emerald-50' : 'bg-blue-50'}`}>
              <CardTitle className={`text-2xl ${isLandlordSelected ? 'text-emerald-800' : 'text-blue-800'}`}>
                {isLandlordSelected ? 'Get Information Upfront' : 'Different Formats, Different Requirements'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6 text-slate-700">
              {isLandlordSelected ? (
                <>
                  <p className="text-lg leading-relaxed">
                    <strong>Get complete tenant information before scheduling showings.</strong> Generate a QR code for your property — no account required for basic use.
                  </p>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
                    <h4 className="font-semibold text-emerald-800 mb-2">What you get:</h4>
                    <ul className="space-y-2 text-emerald-700">
                      <li>• Pre-qualified tenants with income verification ready to view</li>
                      <li>• Complete prequalification before first contact</li>
                      <li>• Professional tools for efficient tenant screening</li>
                      <li>• Time saved on applicants who aren't a good fit</li>
                    </ul>
                  </div>
                  <p>
                    MyRentCard provides standardized prequalification tools that save time for both landlords and tenants. Focus on qualified applicants who are ready to move forward.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg leading-relaxed">
                    Different landlords require different prequalification formats and information. Standardized prequalification lets you maintain one complete profile that works everywhere.
                  </p>
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
                    <h4 className="font-semibold text-blue-800 mb-2">Common challenges:</h4>
                    <ul className="space-y-2 text-blue-700">
                      <li>• Each property has different prequalification requirements and formats</li>
                      <li>• Re-entering the same employment and income information repeatedly</li>
                      <li>• Private landlords expect professional prequalification but may lack standardized systems</li>
                      <li>• Difficulty showing qualification before viewing properties</li>
                    </ul>
                  </div>
                  <p>
                    MyRentCard provides a standardized format that works with any landlord. Present professional prequalification consistently while saving time on repeated data entry.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-10">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
              <Compass className="h-4 w-4" /> How it comes together
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900">From first impression to confident decision</h2>
            <p className="mt-3 text-lg text-slate-600 max-w-3xl mx-auto">
              MyRentCard guides every conversation through three simple stages so nobody wastes time guessing what comes next.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {howItWorksSteps[selectedRole].map((step, index) => (
              <Card
                key={index}
                className="relative overflow-hidden border border-slate-100 bg-white/90 shadow-lg"
                data-testid={`how-it-works-step-${index}`}
              >
                <CardHeader className="text-center pb-4">
                  <div
                    className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                      isLandlordSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    <step.icon className="h-8 w-8" />
                  </div>
                  <Badge
                    className={`mb-3 ${
                      isLandlordSelected ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    Step {index + 1}
                  </Badge>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                  <p className="text-xs text-slate-500 italic">{step.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-12">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
              <ListChecks className="h-4 w-4" /> Practical benefits
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900">How standardized prequalification saves everyone time</h2>
          </div>
          <div className="grid gap-6">
            {benefits[selectedRole].map((benefit, index) => (
              <Card key={index} className="border border-slate-100 bg-white/90 shadow-lg" data-testid={`benefit-${index}`}>
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      isLandlordSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    <benefit.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-semibold text-slate-900">{benefit.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
                    <div className="rounded-lg border-l-4 border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs text-slate-500 italic">{benefit.reality}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
              <Shield className="h-4 w-4" /> Our north star
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900">The future of private rental introductions</h2>
            <p className="mt-3 text-lg text-slate-600 max-w-3xl mx-auto">
              Every improvement we ship keeps renters in control of their story and equips landlords with context before they drive across town.
            </p>
          </div>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {visionPoints.map((point, index) => (
              <div key={index} className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-lg">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <point.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{point.title}</h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-10">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
              <HelpCircle className="h-4 w-4" /> Common questions
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900">The stuff people actually want to know</h2>
            <p className="mt-3 text-lg text-slate-600">
              Transparency builds trust. Here are the answers renters and landlords ask before they dive in.
            </p>
          </div>
          <Card className="border border-slate-100 bg-white/90 shadow-xl">
            <CardContent className="p-0">
              <Accordion type="single" collapsible>
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} data-testid={`faq-${index}`}>
                    <AccordionTrigger className="px-4 sm:px-6 py-4 text-left">
                      <div className="flex items-center gap-3">
                        <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <span className="font-medium text-slate-800">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 pb-4">
                      <p className="text-slate-600 leading-relaxed ml-8">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-100 bg-slate-900 text-white shadow-2xl">
          <div className="absolute h-72 w-72 -right-24 top-10 rounded-full bg-blue-500/40 blur-3xl" aria-hidden />
          <div className="relative grid gap-10 p-10 sm:p-14 lg:grid-cols-[1.05fr_minmax(0,0.9fr)]">
            <div>
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                Ready when you are
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold">Bring confidence to your next rental conversation</h2>
              <p className="mt-4 text-lg text-slate-200">
                Whether you\'re prequalifying for your dream place or prepping your next vacancy, MyRentCard makes the introduction feel effortless.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href={isLandlordSelected ? '/samples/screening-page' : '/api/login'}
                  onClick={() => {
                    if (!isLandlordSelected) {
                      localStorage.setItem('selectedRole', selectedRole);
                    }
                  }}
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 text-base font-semibold text-slate-900 transition-all hover:bg-slate-100"
                  data-testid="about-cta-primary"
                >
                  {isLandlordSelected ? 'Try Free Demo Tools' : 'Create My RentCard'}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href={isLandlordSelected ? '/samples/screening-page' : '/samples/rentcard'}
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl border border-white/40 px-7 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
                  data-testid="about-cta-secondary"
                >
                  {isLandlordSelected ? 'See Sample Tools' : 'See Sample RentCard'}
                  <Eye className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
            <div className="space-y-5">
              <div className="rounded-2xl bg-white/10 p-6">
                <p className="text-sm font-semibold text-white/70">Why it works:</p>
                <p className="mt-3 text-lg text-white">
                  “Every introduction starts with context, so every next step is faster. It feels like a head start for both sides.”
                </p>
                <p className="mt-4 text-sm font-medium text-white/70">— Feedback from private landlords in the MyRentCard network</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-6">
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-blue-200">
                  <CheckCircle className="h-4 w-4" /> Standardized • Secure • Portable
                </div>
                <p className="mt-4 text-sm text-slate-100">
                  Keep control of your information. Share it intentionally. And take it with you wherever your next opportunity appears.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="pb-12 text-center text-xs font-medium uppercase tracking-[0.4em] text-slate-400">
          © 2025 MyRentCard — Making rental connections better
        </footer>
      </main>
    </div>
  );
}
