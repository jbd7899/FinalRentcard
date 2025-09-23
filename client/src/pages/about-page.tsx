import Navbar from '@/components/shared/navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'wouter';
import { Building2, User, ClipboardList, Inbox, Share2, ArrowRight, CheckCircle } from 'lucide-react';

const HOW_IT_WORKS = {
  tenant: [
    {
      title: 'Build once',
      detail: 'Add employment, income, and reference details to your RentCard. You control what landlords can view.',
    },
    {
      title: 'Share anywhere',
      detail: 'Send a link, text a QR code, or embed it in listings. Landlords review before reaching out.',
    },
    {
      title: 'Track responses',
      detail: 'See when landlords open your RentCard and follow up directly with the right information.',
    },
  ],
  landlord: [
    {
      title: 'Publish interest pages',
      detail: 'Create simple pages or QR codes for each property so prospects can share their RentCard or basic details.',
    },
    {
      title: 'Review consistently',
      detail: 'Every RentCard arrives in the same structure, reducing time spent asking for missing documents.',
    },
    {
      title: 'Respond with clarity',
      detail: 'Let tenants know quickly if they qualify or what else you need before scheduling a showing.',
    },
  ],
};

const PRIMARY_PROOF_POINTS = [
  'Standardized prequalification tenants control and landlords trust.',
  'Reusable RentCards and property interest pages keep details aligned.',
  'Faster yes/no answers while preserving direct conversations.',
];

const ROLE_DETAILS = [
  {
    id: 'tenant',
    title: 'Renters',
    icon: User,
    summary:
      'Create one RentCard that summarizes income, references, and history. Share it with private landlords in seconds.',
    highlights: [
      'Standardized prequalification format you control',
      'Share links or QR codes with any landlord—even off-platform',
      'Know sooner if a property is a match before scheduling showings',
    ],
    steps: HOW_IT_WORKS.tenant,
    cta: {
      label: 'Create my RentCard',
      href: '/auth?mode=register&type=tenant',
    },
    resources: [{ label: 'Preview a RentCard', href: '/samples/rentcard' }],
  },
  {
    id: 'landlord',
    title: 'Private landlords',
    icon: Building2,
    summary:
      'Collect consistent tenant information before you spend time coordinating tours. Keep the personal conversations that matter.',
    highlights: [
      'One link to gather interest for each property',
      'Prequalification details arrive in a standard format',
      'Decide faster while preserving your personal touch',
    ],
    steps: HOW_IT_WORKS.landlord,
    cta: {
      label: 'Set up landlord tools',
      href: '/auth?mode=register&type=landlord',
    },
    resources: [{ label: 'Preview landlord tools', href: '/samples/screening-page' }],
  },
] as const;

const STANDARDIZED_REASONS = [
  {
    icon: ClipboardList,
    title: 'No duplicate paperwork',
    description:
      'Tenants reuse the same RentCard while landlords receive the full story in a familiar structure.',
  },
  {
    icon: Inbox,
    title: 'Faster feedback',
    description:
      'Owners can decide quickly because standardized details answer questions before a tour is scheduled.',
  },
  {
    icon: Share2,
    title: 'Keep the personal touch',
    description:
      'Automation handles the prep, so conversations stay focused on whether a property is the right fit.',
  },
] as const;

const FAQ_ITEMS = [
  {
    question: 'Is this a rental application?',
    answer:
      'No. MyRentCard standardizes prequalification so both sides can decide if it is worth moving forward. Tenants keep ownership of their information and share it selectively.',
  },
  {
    question: 'Do landlords need an account?',
    answer:
      'Landlords can generate QR codes or interest pages for free. Creating an account lets them save properties, track interest, and revisit shared RentCards.',
  },
  {
    question: 'Can I use this with landlords who are not on MyRentCard?',
    answer:
      'Yes. Your RentCard link works anywhere. Share it by email, text, or QR code and the landlord can review it securely in their browser.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <Navbar />

      <main className="mx-auto max-w-5xl space-y-16 px-4 py-16">
        <section className="space-y-6 text-center">
          <Badge variant="outline" className="mx-auto w-fit">
            About MyRentCard
          </Badge>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-5xl">
            Standardized prequalification for private rentals
          </h1>
          <p className="mx-auto max-w-3xl text-slate-600">
            MyRentCard helps tenants and private landlords decide faster with shared expectations. Tenants reuse one professional
            RentCard. Landlords receive consistent information before they invest time in tours or paperwork.
          </p>
          <ul className="mx-auto max-w-3xl space-y-3 text-left text-sm text-slate-700 sm:text-base">
            {PRIMARY_PROOF_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <CheckCircle className="mt-1 h-5 w-5 text-emerald-600" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-center">
            <Button asChild className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
              <Link href="/auth?mode=register&type=tenant">
                Get started with MyRentCard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="text-sm text-slate-500">
            Private landlord?{' '}
            <Link href="/auth?mode=register&type=landlord" className="font-medium text-emerald-600 hover:text-emerald-700">
              Set up landlord tools
            </Link>
          </p>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-center text-2xl font-semibold text-slate-900">
            Learn more about the MyRentCard network
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Open a topic to explore how standardized prequalification supports each role.
          </p>
          <Accordion type="multiple" className="mt-6 space-y-2">
            {ROLE_DETAILS.map((role) => (
              <AccordionItem key={role.id} value={role.id} className="rounded-2xl border border-slate-100 px-2">
                <AccordionTrigger className="text-left text-base font-semibold text-slate-900">
                  <span className="flex items-center gap-3">
                    <role.icon className="h-5 w-5 text-slate-500" />
                    {role.title}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-2 text-sm text-slate-600">
                  <div className="space-y-4">
                    <p>{role.summary}</p>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Highlights</h3>
                        <ul className="mt-2 space-y-2">
                          {role.highlights.map((highlight) => (
                            <li key={highlight} className="flex items-start gap-2">
                              <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-600" />
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">How it works</h3>
                        <ul className="mt-2 space-y-3">
                          {role.steps.map((step) => (
                            <li key={step.title} className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
                              <p className="font-medium text-slate-900">{step.title}</p>
                              <p>{step.detail}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button
                        asChild
                        variant="outline"
                        className="inline-flex items-center gap-2 border-slate-200 text-slate-800"
                      >
                        <Link href={role.cta.href}>
                          {role.cta.label}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      {role.resources.map((resource) => (
                        <Link
                          key={resource.href}
                          href={resource.href}
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
                        >
                          {resource.label}
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
            <AccordionItem value="standardized" className="rounded-2xl border border-slate-100 px-2">
              <AccordionTrigger className="text-left text-base font-semibold text-slate-900">
                Why standardized prequalification matters
              </AccordionTrigger>
              <AccordionContent className="px-2 text-sm text-slate-600">
                <div className="grid gap-4 md:grid-cols-3">
                  {STANDARDIZED_REASONS.map((reason) => (
                    <div
                      key={reason.title}
                      className="rounded-xl border border-slate-100 bg-slate-50/60 p-5 text-left"
                    >
                      <reason.icon className="mb-3 h-6 w-6 text-emerald-600" />
                      <p className="font-medium text-slate-900">{reason.title}</p>
                      <p className="mt-2 text-sm">{reason.description}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section className="space-y-4">
          <h2 className="text-center text-2xl font-semibold text-slate-900">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="rounded-2xl border border-slate-100 bg-white">
            {FAQ_ITEMS.map((faq, index) => (
              <AccordionItem value={`faq-${index}`} key={faq.question} className="border-slate-100">
                <AccordionTrigger className="px-6 text-left text-base font-medium text-slate-900">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-sm text-slate-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
    </div>
  );
}
