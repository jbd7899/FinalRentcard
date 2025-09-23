import { useState, useEffect } from 'react';
import { Building2, User, ArrowRight, CheckCircle, Users, Shield, TrendingUp, Star, Zap, Eye, QrCode } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/shared/navbar';
import { Button } from '@/components/ui/button';
import { DERIVED_MESSAGING } from '@shared/value-propositions';
import { NETWORK_VALUE_PROPS } from '@shared/network-messaging';

type UserRole = 'tenant' | 'landlord';

export default function HomePage() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('tenant');
  const [, setLocation] = useLocation();

  // Automatically redirect authenticated users to their dashboard
  useEffect(() => {
    if (user) {
      const dashboardPath = user && 'userType' in user && user.userType === 'landlord' 
        ? '/landlord/dashboard' 
        : '/tenant/dashboard';
      setLocation(dashboardPath);
    }
  }, [user, setLocation]);

  // If user is authenticated, don't render the homepage content
  // The useEffect will handle the redirect
  if (user) {
    return null;
  }

  // Dynamic content based on selected role
  const roleContent = {
    tenant: {
      hero: DERIVED_MESSAGING.TENANT.HERO,
      secondary: DERIVED_MESSAGING.TENANT.SECONDARY,
      description: "Create once. Share anywhere—even off‑platform.",
      primaryCTA: DERIVED_MESSAGING.TENANT.CALL_TO_ACTION,
      secondaryCTA: "View Sample RentCard",
      primaryLink: "/auth?mode=register&type=tenant",
      secondaryLink: "/samples/rentcard",
      benefits: [
        {
          icon: Users,
          title: "Standardized Network Access",
          description: "Join the network to create your standardized RentCard once",
          badge: "One profile, many landlords"
        },
        {
          icon: Shield,
          title: "Direct Landlord Communication",
          description: "Connect directly with private property owners",
          badge: "Personal relationships"
        },
        {
          icon: Zap,
          title: "Faster Response Times",
          description: "Private landlords provide faster, more personal responses",
          badge: "Same-day responses"
        }
      ],
      networkEffects: NETWORK_VALUE_PROPS.NETWORK_EFFECTS.TENANT
    },
    landlord: {
      hero: "Get qualified tenants for your Private Rentals.",
      secondary: "Free QR codes • One‑click interest.",
      description: "Keep your personal approach while receiving consistent prequalification details.",
      primaryCTA: DERIVED_MESSAGING.LANDLORD.CALL_TO_ACTION,
      secondaryCTA: "View Screening Tools",
      primaryLink: "/auth?mode=register&type=landlord",
      secondaryLink: "/samples/screening-page",
      benefits: [
        {
          icon: QrCode,
          title: "Free QR Code Generation",
          description: "Generate QR codes for signs and marketing materials",
          badge: "Direct property links"
        },
        {
          icon: Users,
          title: "Quality Tenant Pool",
          description: "Attract tenants who prefer private landlords",
          badge: "Better tenant fit"
        },
        {
          icon: TrendingUp,
          title: "Competitive Tools",
          description: "Professional screening with personal service",
          badge: "Professional efficiency"
        }
      ],
      networkEffects: NETWORK_VALUE_PROPS.NETWORK_EFFECTS.LANDLORD
    }
  };

  const content = roleContent[selectedRole];
  const isLandlordSelected = selectedRole === 'landlord';

  // For unauthenticated users, show dynamic homepage
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(59,130,246,0.12)_1px,transparent_1px)] [background-size:20px_20px] opacity-5 z-0"></div>
      
      <div className="relative z-10">
        <Navbar />
      </div>

      <main className="relative z-1 max-w-7xl mx-auto px-4 py-16">
        {/* Dynamic Toggle System */}
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
                data-testid="toggle-tenant"
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
                data-testid="toggle-landlord"
              >
                <Building2 className="w-4 h-4" />
                I Own/Manage Properties
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          {/* Professional badge */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="inline-block bg-purple-100 text-purple-600 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow" data-testid="badge-prequalification">
              <span className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Prequalification network</span>
              </span>
            </div>
          </div>

          {/* Main title with sparkle */}
          <div className="relative">
            <h1 className="text-4xl sm:text-6xl font-bold mb-6" data-testid="homepage-title">
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
                MyRentCard
              </span>
              <div className="absolute -right-4 top-0 text-yellow-400 text-xl">✨</div>
              
              {/* Dynamic headlines */}
              <span className="block text-xl sm:text-3xl mt-4 text-gray-800 transition-all duration-300">
                {content.hero}
              </span>
              <span className={`block text-lg sm:text-2xl mt-2 transition-all duration-300 ${
                isLandlordSelected ? 'text-green-600' : 'text-blue-600'
              }`}>
                {content.secondary}
              </span>
            </h1>
          </div>

          {/* Professional tagline */}
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed transition-all duration-300">
            {content.description}
          </p>

          {/* CTA Buttons Section */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-12">
            <button
              onClick={() => {
                localStorage.setItem("selectedRole", selectedRole);
                setLocation(`/auth?mode=register&type=${selectedRole}`);
              }}
              className={`group px-6 sm:px-8 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-3 transition-all text-white text-sm sm:text-base ${
                isLandlordSelected
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              data-testid="button-primary-cta"
            >
              {content.primaryCTA}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link
              href={content.secondaryLink}
              className={`group border-2 px-6 sm:px-8 py-4 rounded-xl font-medium flex items-center justify-center gap-3 transition-all text-sm sm:text-base ${
                isLandlordSelected
                  ? 'border-green-600 text-green-600 hover:bg-green-50'
                  : 'border-blue-600 text-blue-600 hover:bg-blue-50'
              }`}
              data-testid="button-secondary-cta"
            >
              {content.secondaryCTA}
              <Eye className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Benefits Grid (3 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16">
            {content.benefits.map((benefit, index) => (
              <div
                key={index}
                className="relative bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
                data-testid={`benefit-card-${index}`}
              >
                {/* Gradient top border */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r transition-all duration-300 ${
                  isLandlordSelected
                    ? 'from-green-400 to-green-600'
                    : 'from-blue-400 to-blue-600'
                }`}></div>
                
                {/* Icon with colored circle */}
                <div className={`p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 transition-all duration-300 ${
                  isLandlordSelected ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  <benefit.icon className={`w-8 h-8 transition-colors duration-300 ${
                    isLandlordSelected ? 'text-green-600' : 'text-blue-600'
                  }`} />
                </div>
                
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-gray-600 mb-4">{benefit.description}</p>
                
                {/* Professional badge */}
                <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors duration-300 ${
                  isLandlordSelected
                    ? 'text-green-600 border-green-600'
                    : 'text-blue-600 border-blue-600'
                }`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {benefit.badge}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Network Effects Section */}
        <div className="relative">
          <div className="bg-gray-50 rounded-3xl p-8 sm:p-12 shadow-lg border">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-4xl font-bold mb-4 text-gray-800">
                The Network Gets Stronger with Every Connection
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Join a growing community of private landlords and quality tenants building better rental relationships
              </p>
            </div>

            {/* Two-column dynamic stats layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-12">
              {content.networkEffects.slice(0, 4).map((effect, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
                  data-testid={`network-effect-${index}`}
                >
                  <div className={`p-2 rounded-full ${
                    isLandlordSelected ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <Star className={`w-5 h-5 ${
                      isLandlordSelected ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{effect}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Professional badges at bottom */}
            <div className="flex flex-wrap justify-center gap-4">
              <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Growing Network</span>
              </div>
              <div className="inline-flex items-center bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
                <Shield className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Verified Connections</span>
              </div>
              <div className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full shadow-lg">
                <Zap className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Faster Response Times</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom social proof */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Join the network that's standardizing prequalification for private rentals
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500" data-testid="social-proof-list">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              No prequalification fees
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Personal relationships
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Faster response times
            </span>
          </div>
        </div>

        {/* Simple Footer */}
        <footer className="mt-20 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-gray-500">
            <Link href="/about" className="hover:text-gray-700 transition-colors" data-testid="footer-about-link">
              About MyRentCard
            </Link>
            <span className="hidden sm:block">•</span>
            <span>© 2025 MyRentCard. Making rental connections better.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}