import { Building2, Clock, Shield, CheckCircle, ArrowRight, Users, Zap, ArrowUpRight, CreditCard, TrendingUp, Star, Award, Target, User } from 'lucide-react';
import { Link } from 'wouter';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useState } from 'react';
import Navbar from '@/components/shared/navbar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SUCCESS_STORIES, NETWORK_CTA, NETWORK_VALUE_PROPS, INDIVIDUAL_LANDLORD_STATS } from '@shared/network-messaging';

export default function HomePage() {
  const { user } = useAuthStore();
  const { loadingStates, setLoading, addToast } = useUIStore();
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'landlord'>('tenant');

  const handleDashboardClick = () => {
    setLoading('dashboard', true);
    addToast({
      title: "Welcome back!",
      description: "Redirecting to your dashboard...",
      type: "info",
      duration: 3000
    });
    setTimeout(() => setLoading('dashboard', false), 1000);
  };

  const handleHover = (key: string, isHovered: boolean) => {
    setLoading(`hover_${key}`, isHovered);
  };

  const roleContent = {
    tenant: {
      title: "Join the Network to Create Your Standardized RentCard",
      subtitle: "Connect with Individual Landlords Who Own 70-75% of US Rentals", 
      description: "Join the network to create your standardized RentCard once, then easily share your prequalification information with individual landlords. Skip corporate application fees and bureaucracy.",
      benefits: [
        {
          icon: Users,
          title: "Standardized Network Access", 
          desc: "Join the network to create your standardized RentCard once",
          stat: "One profile, many landlords"
        },
        {
          icon: Clock,
          title: "2-3x Faster Responses",
          desc: "Individual landlords respond faster and build personal relationships",
          stat: "Personal connections"
        },
        {
          icon: Shield,
          title: "Skip Corporate Bureaucracy",
          desc: "Skip corporate application fees and rigid policies", 
          stat: "Direct communication"
        }
      ],
      cta: {
        primary: "Join Individual Landlord Network",
        secondary: "View Sample RentCard",
        primaryHref: "/auth?type=tenant&mode=register",
        secondaryHref: "/samples/rentcard"
      }
    },
    landlord: {
      title: "Join the Network to Streamline Tenant Connections",
      subtitle: "Maintain Your Individual Landlord Competitive Edge",
      description: "Join the network to streamline how tenants connect with your properties while maintaining your competitive edge. Allow qualified tenants to submit interest with one click using standardized RentCards.",
      benefits: [
        {
          icon: Users,
          title: "One-Click Tenant Submissions",
          desc: "Allow qualified tenants to submit interest with standardized RentCards",
          stat: "Streamlined connections"
        },
        {
          icon: Clock,
          title: "Review Before Showings",
          desc: "Review prequalification details before showings and cross-sell properties",
          stat: "Efficient screening"
        },
        {
          icon: Shield,
          title: "QR Code Marketing Tools",
          desc: "Generate marketing flyers with scannable QR codes with one click",
          stat: "Professional marketing"
        }
      ],
      cta: {
        primary: "Join Individual Landlord Network",
        secondary: "View Screening Tools", 
        primaryHref: "/auth?type=landlord&mode=register",
        secondaryHref: "/samples/screening-page"
      }
    }
  };

  const currentContent = roleContent[selectedRole];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <div className="absolute inset-0 bg-[url('/api/placeholder/20/20')] opacity-5 z-0"></div>

      <div className="relative z-10">
        <Navbar />
      </div>

      <main className="relative z-1 max-w-7xl mx-auto px-4 py-16">
        {/* Role Toggle */}
        {!user && (
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-xl p-2 shadow-lg border">
              <div className="flex">
                <Button
                  variant={selectedRole === 'tenant' ? 'default' : 'ghost'}
                  onClick={() => setSelectedRole('tenant')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                    selectedRole === 'tenant' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  data-testid="toggle-tenant"
                >
                  <User className="w-4 h-4" />
                  I'm Looking for a Place
                </Button>
                <Button
                  variant={selectedRole === 'landlord' ? 'default' : 'ghost'}
                  onClick={() => setSelectedRole('landlord')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                    selectedRole === 'landlord' 
                      ? 'bg-green-600 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  data-testid="toggle-landlord"
                >
                  <Building2 className="w-4 h-4" />
                  I Own/Manage Properties
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-16 relative">
          {/* Value Badge */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="inline-block bg-purple-100 text-purple-600 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow">
              <span className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Prequalification network</span>
              </span>
            </div>
          </div>

          {/* Hero Section with Dynamic Content */}
          <div className="relative">
            <h1 className="text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
                MyRentCard
              </span>
              <div className="absolute -right-4 top-0 text-yellow-400 text-xl">✨</div>
              <span className={`block text-3xl mt-4 text-gray-800 transition-all duration-300`}>
                {currentContent.title}
              </span>
              <span className={`block text-2xl mt-2 transition-all duration-300 ${
                selectedRole === 'tenant' ? 'text-blue-600' : 'text-green-600'
              }`}>
                {currentContent.subtitle}
              </span>
            </h1>
          </div>

          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed transition-all duration-300">
            {currentContent.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
            {user ? (
              <Link 
                href={user.userType === 'landlord' ? '/landlord/dashboard' : '/tenant/dashboard'}
                className="group bg-blue-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-blue-700 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 transition-all"
                onClick={handleDashboardClick}
                data-testid="button-dashboard"
              >
                View Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link 
                  href={currentContent.cta.primaryHref}
                  className={`group px-8 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-3 transition-all text-white ${
                    selectedRole === 'tenant' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                  data-testid="button-primary-cta"
                >
                  {currentContent.cta.primary}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href={currentContent.cta.secondaryHref}
                  className={`group border-2 px-8 py-4 rounded-xl font-medium flex items-center justify-center gap-3 transition-all ${
                    selectedRole === 'tenant'
                      ? 'border-blue-600 text-blue-600 hover:bg-blue-50'
                      : 'border-green-600 text-green-600 hover:bg-green-50'
                  }`}
                  data-testid="button-secondary-cta"
                >
                  {currentContent.cta.secondary}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Network Benefits Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {currentContent.benefits.map((benefit, index) => (
              <div 
                key={index}
                className="relative bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
                onMouseEnter={() => handleHover(`benefit${index}`, true)}
                onMouseLeave={() => handleHover(`benefit${index}`, false)}
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r transition-all duration-300 ${
                  selectedRole === 'tenant' ? 'from-blue-400 to-blue-600' : 'from-green-400 to-green-600'
                }`}></div>
                <div className={`p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 transition-all duration-300 ${
                  selectedRole === 'tenant' 
                    ? 'bg-blue-100' 
                    : 'bg-green-100'
                } ${loadingStates[`hover_benefit${index}`] ? 'scale-110' : ''}`}>
                  <benefit.icon className={`w-8 h-8 transition-colors duration-300 ${
                    selectedRole === 'tenant' ? 'text-blue-600' : 'text-green-600'
                  }`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-gray-600 mb-4">{benefit.desc}</p>
                <Badge variant="outline" className={`transition-colors duration-300 ${
                  selectedRole === 'tenant' 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-green-600 border-green-600'
                }`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {benefit.stat}
                </Badge>
              </div>
            ))}
          </div>

          {/* Network Effects Section */}
          <div className="bg-white p-12 rounded-xl shadow-lg relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-full opacity-50 transition-all duration-300 ${
              selectedRole === 'tenant' 
                ? 'bg-gradient-to-b from-blue-50 to-transparent' 
                : 'bg-gradient-to-b from-green-50 to-transparent'
            }`}></div>

            <div className="relative">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className={`h-1 w-16 rounded transition-colors duration-300 ${
                  selectedRole === 'tenant' ? 'bg-blue-200' : 'bg-green-200'
                }`}></div>
                <p className={`text-2xl font-semibold transition-colors duration-300 ${
                  selectedRole === 'tenant' ? 'text-blue-800' : 'text-green-800'
                }`}>
                  The Network Gets Stronger with Every Connection
                </p>
                <div className={`h-1 w-16 rounded transition-colors duration-300 ${
                  selectedRole === 'tenant' ? 'bg-blue-200' : 'bg-green-200'
                }`}></div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-4 transition-colors duration-300 ${
                    selectedRole === 'tenant' ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    {selectedRole === 'tenant' ? 'More Individual Landlords' : 'More Tenants Preferring Individual Landlords'}
                  </div>
                  <p className="text-gray-600">
                    {selectedRole === 'tenant' 
                      ? 'Joining means more individual property owner options and faster personal connections'
                      : 'Joining means access to tenants who specifically prefer individual landlords'
                    }
                  </p>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-4 transition-colors duration-300 ${
                    selectedRole === 'tenant' ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    Better Matching
                  </div>
                  <p className="text-gray-600">
                    More data points create smarter connections and higher success rates for everyone
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-lg font-semibold mb-2">
                  {selectedRole === 'tenant' 
                    ? 'Connect with verified landlords instantly'
                    : 'Access prequalified tenants immediately'
                  }
                </p>
                <p className="text-gray-600 mb-4">
                  No applications • No wasted time • Network-powered matching
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline">Prequalified connections</Badge>
                  <Badge variant="outline">Instant compatibility check</Badge>
                  <Badge variant="outline">Network-based matching</Badge>
                  <Badge variant="outline">Quality over quantity</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}