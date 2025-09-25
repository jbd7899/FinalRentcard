import { useState, useEffect } from 'react';
import {
  Building2,
  User,
  ArrowRight,
  CheckCircle,
  Users,
  QrCode,
  Sparkles,
  ClipboardCheck,
  Star,
  Play
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/shared/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type UserRole = 'tenant' | 'landlord';

// How it works steps
const tenantSteps = [
  {
    number: 1,
    title: 'Build your profile',
    description: 'Create your rental profile once with all your documents and details'
  },
  {
    number: 2,
    title: 'Share instantly',
    description: 'Send your RentCard link to any landlord with one click'
  },
  {
    number: 3,
    title: 'Look professional',
    description: 'Stand out with a polished presentation that shows you mean business'
  }
];

const landlordSteps = [
  {
    number: 1,
    title: 'Add your property',
    description: 'Create your property listing with screening criteria'
  },
  {
    number: 2,
    title: 'Generate QR codes',
    description: 'Get QR codes for signs, listings, and marketing materials'
  },
  {
    number: 3,
    title: 'Receive qualified leads',
    description: 'Get complete tenant information and organized applications'
  }
];

// Testimonials
const testimonials = [
  {
    text: "I stopped filling out one-off forms. Now every landlord already knows I match their requirements before we talk.",
    author: "Celine, relocating renter",
    role: "tenant"
  },
  {
    text: "I post a QR code on my yard sign and only tour with qualified prospects. It feels personal and professional at once.",
    author: "Marco, owner of three rentals", 
    role: "landlord"
  }
];

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

  // Save role selection for auth flow
  useEffect(() => {
    localStorage.setItem('selectedRole', selectedRole);
  }, [selectedRole]);

  if (user) return null;

  const isLandlord = selectedRole === 'landlord';
  const steps = isLandlord ? landlordSteps : tenantSteps;
  const testimonial = testimonials.find(t => t.role === selectedRole);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="text-center">
          {/* Small role toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1 mb-8">
            <button
              onClick={() => setSelectedRole('tenant')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !isLandlord
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              data-testid="toggle-tenant"
            >
              I'm renting
            </button>
            <button
              onClick={() => setSelectedRole('landlord')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isLandlord
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              data-testid="toggle-landlord"
            >
              I own property
            </button>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6" data-testid="homepage-title">
            The rental profile that works everywhere
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {isLandlord 
              ? 'Get organized tenant leads with QR codes and streamlined applications. No more chasing paperwork.'
              : 'Create your RentCard once and share it with any landlord. Skip the endless forms and look professional everywhere.'
            }
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href={isLandlord ? '/landlord-demo' : '/demo'}
              className="inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
              data-testid="button-see-demo"
            >
              <Play className="h-5 w-5" />
              See how it works
            </Link>
            <Button
              onClick={() => {
                localStorage.setItem('selectedRole', selectedRole);
                setLocation('/auth');
              }}
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 h-auto"
              data-testid="button-get-started"
            >
              {isLandlord ? 'Add your property' : 'Create your RentCard'}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Free forever
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              No signup required to try
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Works anywhere
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-lg text-gray-600">
              {isLandlord 
                ? 'Get qualified tenant applications in minutes, not days'
                : 'Build once, share everywhere, and always look prepared'
              }
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Loved by renters and landlords
            </h2>
          </div>

          {testimonial && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <blockquote className="text-xl text-gray-700 mb-6">
                  "{testimonial.text}"
                </blockquote>
                <cite className="text-gray-600 font-medium">
                  — {testimonial.author}
                </cite>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-12 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">2M+</div>
              <div className="text-gray-600">Applications sent</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">95%</div>
              <div className="text-gray-600">Faster approvals</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">50K+</div>
              <div className="text-gray-600">Happy users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            {isLandlord 
              ? 'Ready to get better tenant leads?'
              : 'Ready to look professional everywhere?'
            }
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {isLandlord
              ? 'Join thousands of landlords who save hours with organized, complete tenant information.'
              : 'Join thousands of renters who never fill out the same form twice.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => {
                localStorage.setItem('selectedRole', selectedRole);
                setLocation('/auth');
              }}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 h-auto"
              data-testid="button-final-cta"
            >
              {isLandlord ? 'Add your property' : 'Create your RentCard'}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Link
              href={isLandlord ? '/landlord-demo' : '/demo'}
              className="inline-flex items-center justify-center gap-3 border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all"
            >
              <Play className="h-5 w-5" />
              Watch demo first
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}