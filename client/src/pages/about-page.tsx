import { useState } from 'react';
import { 
  Building2, 
  User, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Shield, 
  Clock, 
  FileText, 
  QrCode,
  Zap,
  HelpCircle,
  RefreshCw,
  UserCheck,
  Home,
  Smartphone,
  Eye
} from 'lucide-react';
import { Link } from 'wouter';
import Navbar from '@/components/shared/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type UserRole = 'tenant' | 'landlord';

export default function AboutPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('tenant');
  const isLandlordSelected = selectedRole === 'landlord';

  const howItWorksSteps = {
    tenant: [
      {
        icon: UserCheck,
        title: "Create Your RentCard Once",
        description: "Fill out your rental information one time. Income, references, documents - everything landlords need.",
        detail: "No more copying the same info from application to application."
      },
      {
        icon: Eye,
        title: "Apply Instantly Anywhere",
        description: "Share your RentCard link or QR code. Landlords can view your complete profile immediately.",
        detail: "Works with private landlords whether they're on the platform or not."
      },
      {
        icon: Zap,
        title: "Get Faster Responses",
        description: "Private landlords respond 2-3x faster than corporate properties. Personal relationships matter.",
        detail: "Skip the corporate bureaucracy and connect directly with property owners."
      }
    ],
    landlord: [
      {
        icon: QrCode,
        title: "Post Your Property (Free)",
        description: "Generate a free QR code for your property. No account required - just create and go.",
        detail: "Put the QR code on signs, listings, or share the link directly."
      },
      {
        icon: Users,
        title: "Get Pre-Qualified Tenants",
        description: "Tenants who find you already have their rental information ready to view.",
        detail: "See income, references, and documents upfront - no back-and-forth."
      },
      {
        icon: Clock,
        title: "Make Decisions Faster",
        description: "Review complete applications in minutes, not days. Your personal touch with professional efficiency.",
        detail: "Compete with corporate speed while maintaining personal relationships."
      }
    ]
  };

  const benefits = {
    tenant: [
      {
        icon: RefreshCw,
        title: "Stop Repeating Yourself",
        description: "Create your rental profile once, use it everywhere. No more filling out the same forms over and over.",
        reality: "Reality: You've probably filled out your employment info 10+ times already."
      },
      {
        icon: Clock,
        title: "Get Responses That Actually Matter",
        description: "Private landlords respond faster and give real feedback, not automated rejections.",
        reality: "Reality: Corporate properties send form letters. Private landlords actually talk to you."
      },
      {
        icon: Shield,
        title: "Skip the Corporate Maze",
        description: "Apply directly to property owners who make their own decisions.",
        reality: "Reality: No more waiting weeks for some algorithm to reject you."
      }
    ],
    landlord: [
      {
        icon: Smartphone,
        title: "You Don't Need Another Account",
        description: "Generate QR codes and collect applications without signing up for anything.",
        reality: "Reality: You just want qualified tenants, not another login to remember."
      },
      {
        icon: UserCheck,
        title: "Pre-Qualified Tenants Find You",
        description: "Tenants using MyRentCard already have their income, references, and documents ready.",
        reality: "Reality: No more chasing people for basic information you need anyway."
      },
      {
        icon: Zap,
        title: "Compete with Corporate Efficiency",
        description: "Get the professional tools you need while keeping your personal approach.",
        reality: "Reality: Tenants expect fast, professional service from everyone now."
      }
    ]
  };

  const faqs = [
    {
      question: "Do I have to create an account to use this?",
      answer: "Tenants create RentCards to apply places. Landlords can generate QR codes and collect applications without any account - you only sign up if you want to save your properties and view applications later."
    },
    {
      question: "What if the landlord isn't on your platform?",
      answer: "That's totally fine! Your RentCard works anywhere. You can share the link directly, send it in emails, or even print the QR code. The landlord just clicks and sees your complete rental information."
    },
    {
      question: "How is this different from other rental platforms?",
      answer: "Most platforms lock you into their ecosystem. We focus on private landlords and direct relationships. Your RentCard works everywhere, whether the landlord uses our tools or not."
    },
    {
      question: "Is my information secure?",
      answer: "Yes. Your information is encrypted and you control exactly what gets shared with each landlord. You can revoke access anytime, and landlords only see what you choose to share."
    },
    {
      question: "What does it cost?",
      answer: "RentCards are free for tenants. Landlords can use basic QR code generation for free, and pay only if they want advanced tools for managing multiple properties."
    },
    {
      question: "Can I use this if I'm just looking at places online?",
      answer: "Absolutely! Whether you're responding to Craigslist ads, Facebook Marketplace, or driving around looking at signs - your RentCard makes you look professional and prepared from the first contact."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <div className="absolute inset-0 bg-[url('/api/placeholder/20/20')] opacity-5 z-0"></div>
      
      <div className="relative z-10">
        <Navbar />
      </div>

      <main className="relative z-1 max-w-4xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <Badge variant="outline" className="mb-4 text-blue-600 border-blue-600" data-testid="about-badge">
              About MyRentCard
            </Badge>
            <h1 className="text-5xl font-bold mb-6 text-gray-800" data-testid="about-hero-title">
              Stop Filling Out the Same Rental Info Over and Over
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We get it. The rental process is broken. You're tired of copying your employment info for the hundredth time, 
              and landlords are tired of chasing people for basic documents. Let's fix this together.
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-xl p-2 shadow-lg border">
              <div className="flex">
                <button
                  onClick={() => setSelectedRole('tenant')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                    !isLandlordSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  data-testid="about-toggle-tenant"
                >
                  <User className="w-4 h-4" />
                  I'm Looking for a Place
                </button>
                <button
                  onClick={() => setSelectedRole('landlord')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                    isLandlordSelected
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  data-testid="about-toggle-landlord"
                >
                  <Building2 className="w-4 h-4" />
                  I Own/Manage Properties
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Problem Section */}
        <div className="mb-16">
          <Card className="overflow-hidden">
            <CardHeader className={`text-center ${isLandlordSelected ? 'bg-green-50' : 'bg-blue-50'}`}>
              <CardTitle className={`text-2xl ${isLandlordSelected ? 'text-green-800' : 'text-blue-800'}`}>
                {isLandlordSelected ? "Why Should I Sign Up for Another Thing?" : "We Get It, This is Exhausting"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {isLandlordSelected ? (
                <div className="space-y-6">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    <strong>You don't have to sign up for anything.</strong> Generate a QR code for your property right now, for free. 
                    No account required.
                  </p>
                  <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-400">
                    <h4 className="font-semibold text-green-800 mb-2">Here's the reality:</h4>
                    <ul className="space-y-2 text-green-700">
                      <li>• You just want qualified tenants who can actually afford your place</li>
                      <li>• You're tired of people applying who clearly didn't read your listing</li>
                      <li>• You want to compete with corporate properties but keep your personal touch</li>
                      <li>• You don't need another platform taking a cut or making you jump through hoops</li>
                    </ul>
                  </div>
                  <p className="text-gray-700">
                    We built MyRentCard so you can get the tools you need without the commitment you don't want. 
                    Your tenants create RentCards, you get better applications. That's it.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    You're probably here because you're tired. Tired of filling out the same employment information. 
                    Tired of uploading the same pay stubs. Tired of getting rejected by algorithms.
                  </p>
                  <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400">
                    <h4 className="font-semibold text-blue-800 mb-2">Sound familiar?</h4>
                    <ul className="space-y-2 text-blue-700">
                      <li>• You've filled out your employment info at least 10 times this month</li>
                      <li>• You keep uploading the same documents over and over</li>
                      <li>• Corporate properties send you form rejection letters</li>
                      <li>• You want to apply to private landlords but they expect professional applications</li>
                    </ul>
                  </div>
                  <p className="text-gray-700">
                    We built MyRentCard so you can create your rental profile once and use it everywhere. 
                    Apply to private landlords with the same professional presentation that corporate properties expect.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">How It Actually Works</h2>
            <p className="text-lg text-gray-600">
              {isLandlordSelected 
                ? "Three steps to get better tenant applications"
                : "Three steps to stop repeating yourself"
              }
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorksSteps[selectedRole].map((step, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow" data-testid={`how-it-works-step-${index}`}>
                <CardHeader className="text-center pb-4">
                  <div className={`p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 ${
                    isLandlordSelected ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <step.icon className={`w-8 h-8 ${
                      isLandlordSelected ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <Badge className={`mb-2 ${
                    isLandlordSelected 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}>
                    Step {index + 1}
                  </Badge>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-700 mb-3">{step.description}</p>
                  <p className="text-sm text-gray-500 italic">{step.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Real Benefits */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Real Benefits, Not Marketing Fluff</h2>
            <p className="text-lg text-gray-600">
              Here's what actually changes when you use MyRentCard
            </p>
          </div>

          <div className="space-y-6">
            {benefits[selectedRole].map((benefit, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow" data-testid={`benefit-${index}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${
                    isLandlordSelected ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <benefit.icon className={`w-6 h-6 ${
                      isLandlordSelected ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-gray-700 mb-3">{benefit.description}</p>
                    <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-gray-400">
                      <p className="text-sm text-gray-600 italic">{benefit.reality}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Common Questions</h2>
            <p className="text-lg text-gray-600">
              The stuff people actually want to know
            </p>
          </div>

          <Card>
            <CardContent className="p-0">
              <Accordion type="single" collapsible>
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} data-testid={`faq-${index}`}>
                    <AccordionTrigger className="px-6 py-4 text-left">
                      <div className="flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <span className="font-medium">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <p className="text-gray-700 leading-relaxed ml-8">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="overflow-hidden">
            <CardHeader className={`text-center ${isLandlordSelected ? 'bg-green-50' : 'bg-blue-50'}`}>
              <CardTitle className="text-2xl text-gray-800">
                Ready to Stop the Rental Insanity?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-lg text-gray-600 mb-6">
                {isLandlordSelected 
                  ? "Generate your first QR code in under 2 minutes. No signup required."
                  : "Create your RentCard once and use it everywhere. Free forever."
                }
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href={isLandlordSelected ? "/samples/screening-page" : "/api/login"}
                  onClick={() => {
                    if (!isLandlordSelected) {
                      localStorage.setItem("selectedRole", selectedRole);
                    }
                  }}
                  className={`px-8 py-4 text-white flex items-center justify-center gap-3 rounded-lg font-medium transition-all ${
                    isLandlordSelected
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  data-testid="about-cta-primary"
                >
                  {isLandlordSelected ? "Try Free Demo Tools" : "Create My RentCard"}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                
                <Link
                  href={isLandlordSelected ? "/samples/screening-page" : "/samples/rentcard"}
                  className={`border-2 px-8 py-4 rounded-lg font-medium flex items-center justify-center gap-3 transition-all ${
                    isLandlordSelected
                      ? 'border-green-600 text-green-600 hover:bg-green-50'
                      : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                  }`}
                  data-testid="about-cta-secondary"
                >
                  {isLandlordSelected ? "See Sample Tools" : "See Sample RentCard"}
                  <Eye className="w-5 h-5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}