import Navbar from '@/components/shared/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'wouter';
import { Building2, User, Share2, ClipboardList, Inbox, ArrowRight } from 'lucide-react';

const ROLE_HIGHLIGHTS = [
  {
    id: 'tenant',
    title: 'Tenants',
    icon: User,
    description:
      'Create one RentCard that summarizes income, references, and history. Share it with private landlords in seconds.',
    benefits: [
      'Standardized prequalification format you control',
      'Share links or QR codes with any landlord—even off-platform',
      'Know sooner if a property is a match before scheduling showings',
    ],
    cta: {
      label: 'Create my RentCard',
      href: '/auth?mode=register&type=tenant',
    },
  },
  {
    id: 'landlord',
    title: 'Private landlords',
    icon: Building2,
    description:
      'Collect consistent tenant information before you spend time coordinating tours. Keep the personal conversations that matter.',
    benefits: [
      'One link to gather interest for each property',
      'Prequalification details arrive in a standard format',
      'Decide faster while preserving your personal touch',
    ],
    cta: {
      label: 'Set up landlord tools',
      href: '/auth?mode=register&type=landlord',
    },
  },
] as const;

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

      <main className="max-w-5xl mx-auto px-4 py-16 space-y-16">
        <section className="text-center space-y-4">
          <Badge variant="outline" className="mx-auto w-fit">About MyRentCard</Badge>
          <h1 className="text-3xl sm:text-5xl font-bold text-slate-900">
            Standardized prequalification for private rentals
          </h1>
          <p className="text-slate-600 max-w-3xl mx-auto">
            MyRentCard helps tenants and private landlords decide faster with shared expectations. Tenants reuse one
            professional RentCard. Landlords receive consistent information before they invest time in tours or paperwork.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {ROLE_HIGHLIGHTS.map((role) => (
            <Card key={role.id} className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-slate-100 p-3 text-slate-700">
                    <role.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle>{role.title}</CardTitle>
                    <p className="text-sm text-slate-600">{role.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-slate-600">
                  {role.benefits.map((benefit) => (
                    <li key={benefit}>• {benefit}</li>
                  ))}
                </ul>
                <Button asChild className="w-full">
                  <Link href={role.cta.href}>
                    {role.cta.label}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="bg-white border rounded-2xl p-8 shadow-sm space-y-10">
          <h2 className="text-2xl font-semibold text-slate-900 text-center">How MyRentCard keeps everyone aligned</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-medium text-slate-900">
                <User className="w-5 h-5 text-blue-600" /> Tenants
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {HOW_IT_WORKS.tenant.map((step) => (
                  <li key={step.title} className="rounded-lg border border-blue-100 bg-blue-50/40 p-4">
                    <p className="font-medium text-slate-900">{step.title}</p>
                    <p>{step.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-lg font-medium text-slate-900">
                <Building2 className="w-5 h-5 text-green-600" /> Landlords
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {HOW_IT_WORKS.landlord.map((step) => (
                  <li key={step.title} className="rounded-lg border border-green-100 bg-green-50/40 p-4">
                    <p className="font-medium text-slate-900">{step.title}</p>
                    <p>{step.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white border rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Share2 className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-slate-900">Why standardized prequalification matters</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-6">
              <ClipboardList className="w-6 h-6 text-purple-600 mb-3" />
              <h3 className="font-medium text-slate-900">No duplicate paperwork</h3>
              <p className="text-sm text-slate-600">
                Tenants fill out details once. Landlords receive the same organized view each time, so nothing gets lost.
              </p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-6">
              <Inbox className="w-6 h-6 text-emerald-600 mb-3" />
              <h3 className="font-medium text-slate-900">Faster feedback</h3>
              <p className="text-sm text-slate-600">
                Owners can confirm interest or decline quickly based on consistent information, saving everyone back-and-forth emails.
              </p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-6">
              <ArrowRight className="w-6 h-6 text-blue-600 mb-3" />
              <h3 className="font-medium text-slate-900">Keep the personal touch</h3>
              <p className="text-sm text-slate-600">
                MyRentCard handles the upfront prep so landlords can focus on real conversations and property tours that matter.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 text-center">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="bg-white border rounded-2xl">
            {FAQ_ITEMS.map((faq, index) => (
              <AccordionItem value={`faq-${index}`} key={faq.question}>
                <AccordionTrigger className="text-left px-6">{faq.question}</AccordionTrigger>
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
