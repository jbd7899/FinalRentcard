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
        description: "Complete your standardized rental profile with income, references, and documents.",
        detail: "Use the same professional application format with every landlord."
      },
      {
        icon: Eye,
        title: "Apply Instantly Anywhere",
        description: "Share your RentCard link or QR code. Landlords can review your qualifications before scheduling showings.",
        detail: "Know if it's a match from the beginning - saves time for everyone."
      },
      {
        icon: Zap,
        title: "Get Faster Responses",
        description: "Get faster responses from landlords who can see you're qualified upfront.",
        detail: "Skip unnecessary showings when your profile doesn't match their requirements."
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
        description: "Receive complete applications from pre-qualified tenants before first contact.",
        detail: "Review income, references, and documents upfront - no back-and-forth collection."
      },
      {
        icon: Clock,
        title: "Make Decisions Faster",
        description: "Review complete applications in minutes, not days. Your personal touch with professional efficiency.",
        detail: "Make decisions quickly while maintaining personal service."
      }
    ]
  };

  const benefits = {
    tenant: [
      {
        icon: RefreshCw,
        title: "Standardized Application Format",
        description: "Create your rental profile once, use it with any landlord. Consistent professional presentation every time.",
        reality: "Saves hours of time re-entering the same employment and income information."
      },
      {
        icon: Clock,
        title: "Faster Response Times",
        description: "Landlords can review your qualifications immediately and respond with specific feedback.",
        reality: "Know upfront if you meet requirements instead of waiting for form responses."
      },
      {
        icon: Shield,
        title: "Direct Communication",
        description: "Connect directly with property owners who can make immediate decisions.",
        reality: "Streamlined communication leads to faster rental decisions."
      }
    ],
    landlord: [
      {
        icon: Smartphone,
        title: "No Complex Setup Required",
        description: "Generate QR codes and collect applications without creating accounts or learning new systems.",
        reality: "Focus on finding qualified tenants with minimal administrative overhead."
      },
      {
        icon: UserCheck,
        title: "Complete Applications Upfront",
        description: "Tenants using MyRentCard provide income verification, references, and documents before contact.",
        reality: "Eliminate time spent collecting basic qualification information."
      },
      {
        icon: Zap,
        title: "Professional Tools",
        description: "Access efficient screening tools while maintaining your personal approach to tenant relationships.",
        reality: "Meet tenant expectations for professional service without sacrificing personal connections."
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
            <h1 className="text-3xl sm:text-5xl font-bold mb-6 text-gray-800" data-testid="about-hero-title">
              Standardized Prequalification for Private Rentals
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Save time on both sides with standardized rental applications. Know if it's a match from the beginning 
              and skip unnecessary calls and showings that don't lead anywhere.
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-xl p-2 shadow-lg border max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row">
                <button
                  onClick={() => setSelectedRole('tenant')}
                  className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg transition-all mb-1 sm:mb-0 ${
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
                  className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg transition-all ${
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
                {isLandlordSelected ? "Get Information Upfront" : "Different Formats, Different Requirements"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {isLandlordSelected ? (
                <div className="space-y-6">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    <strong>Get complete tenant information before scheduling showings.</strong> Generate a QR code for your property - 
                    no account required for basic use.
                  </p>
                  <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-400">
                    <h4 className="font-semibold text-green-800 mb-2">What you get:</h4>
                    <ul className="space-y-2 text-green-700">
                      <li>• Pre-qualified tenants with income verification ready to view</li>
                      <li>• Complete rental applications before first contact</li>
                      <li>• Professional tools for efficient tenant screening</li>
                      <li>• Time saved on applicants who aren't a good fit</li>
                    </ul>
                  </div>
                  <p className="text-gray-700">
                    MyRentCard provides standardized prequalification tools that save time for both landlords and tenants. 
                    Focus on qualified applicants who are ready to move forward.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Different landlords require different application formats and information. 
                    Standardized prequalification lets you maintain one complete profile that works everywhere.
                  </p>
                  <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400">
                    <h4 className="font-semibold text-blue-800 mb-2">Common challenges:</h4>
                    <ul className="space-y-2 text-blue-700">
                      <li>• Each property has different application requirements and formats</li>
                      <li>• Re-entering the same employment and income information repeatedly</li>
                      <li>• Private landlords expect professional applications but may lack standardized systems</li>
                      <li>• Difficulty showing qualification before viewing properties</li>
                    </ul>
                  </div>
                  <p className="text-gray-700">
                    MyRentCard provides a standardized format that works with any landlord. 
                    Present professional applications consistently while saving time on repeated data entry.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">How It Works</h2>
            <p className="text-lg text-gray-600">
              {isLandlordSelected 
                ? "Three steps to streamline your rental process"
                : "Three steps to standardized prequalification"
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
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
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">Practical Benefits</h2>
            <p className="text-lg text-gray-600">
              How standardized prequalification saves time for everyone
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
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">Common Questions</h2>
            <p className="text-lg text-gray-600">
              The stuff people actually want to know
            </p>
          </div>

          <Card>
            <CardContent className="p-0">
              <Accordion type="single" collapsible>
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} data-testid={`faq-${index}`}>
                    <AccordionTrigger className="px-4 sm:px-6 py-4 text-left">
                      <div className="flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <span className="font-medium">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 pb-4">
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
                Ready to Try Standardized Prequalification?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-lg text-gray-600 mb-6">
                {isLandlordSelected 
                  ? "Start collecting complete applications from qualified tenants today."
                  : "Create your standardized rental profile and save time on every application."
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