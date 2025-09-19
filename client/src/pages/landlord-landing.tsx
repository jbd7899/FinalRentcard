import { Building2, User, Clock, Shield, CheckCircle, ArrowRight, Users, Star, Award, TrendingUp, Search, FileText, UserCheck, Zap } from 'lucide-react';
import { Link, useSearch } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/shared/navbar';
import RoleSwitcher, { RoleCrossLink } from '@/components/shared/RoleSwitcher';
import { 
  SUCCESS_STORIES, 
  NETWORK_CTA,
  TRUST_SIGNALS,
  SOCIAL_PROOF_STATS,
  PRIVATE_LANDLORD_STATS,
  NETWORK_VALUE_PROPS
} from '@shared/network-messaging';

export default function LandlordLanding() {
  const searchParams = new URLSearchParams(useSearch());
  const preservedParams = searchParams.toString() ? `?${searchParams.toString()}` : '';

  // Explicit color mappings to prevent Tailwind purging
  const colorClasses = {
    blue: {
      bg500: 'bg-blue-500',
      bg100: 'bg-blue-100',
      text600: 'text-blue-600',
      border600: 'border-blue-600'
    },
    green: {
      bg500: 'bg-green-500',
      bg100: 'bg-green-100',
      text600: 'text-green-600',
      border600: 'border-green-600'
    },
    purple: {
      bg500: 'bg-purple-500',
      bg100: 'bg-purple-100',
      text600: 'text-purple-600',
      border600: 'border-purple-600'
    },
    orange: {
      bg500: 'bg-orange-500',
      bg100: 'bg-orange-100',
      text600: 'text-orange-600',
      border600: 'border-orange-600'
    }
  };

  const landlordBenefits = [
    {
      icon: Clock,
      title: 'Reduce Review Time',
      description: `Complete documentation provides ${SOCIAL_PROOF_STATS.INDIVIDUAL_LANDLORD_RESPONSE_TIME} through efficient screening`,
      badge: SOCIAL_PROOF_STATS.INDIVIDUAL_LANDLORD_RESPONSE_TIME,
      color: 'blue' as keyof typeof colorClasses
    },
    {
      icon: Users,
      title: 'Skip Reference Verification',
      description: `Pre-verified tenant references enable ${SOCIAL_PROOF_STATS.FASTER_SCREENING}`,
      badge: SOCIAL_PROOF_STATS.FASTER_SCREENING,
      color: 'green' as keyof typeof colorClasses
    },
    {
      icon: Shield,
      title: 'Eliminate Follow-up Emails',
      description: `Standardized tenant profiles enable ${SOCIAL_PROOF_STATS.PERSONAL_RELATIONSHIPS}`,
      badge: 'Direct Communication',
      color: 'purple' as keyof typeof colorClasses
    },
    {
      icon: TrendingUp,
      title: 'Skip Phone Interviews',
      description: `Pre-answered screening questions enable ${SOCIAL_PROOF_STATS.INDIVIDUAL_LANDLORD_DECISIONS}`,
      badge: SOCIAL_PROOF_STATS.INDIVIDUAL_LANDLORD_DECISIONS,
      color: 'orange' as keyof typeof colorClasses
    }
  ];

  const quickActions = [
    {
      icon: Search,
      title: 'Start Screening Tenants',
      description: 'Access pre-verified applicants',
      href: `/auth${preservedParams ? preservedParams + '&' : '?'}mode=register&type=landlord`,
      primary: true
    },
    {
      icon: FileText,
      title: 'View Sample Screening',
      description: 'See tenant profiles',
      href: '/samples/screening-page',
      primary: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      <div className="relative z-10">
        <Navbar />
      </div>

      <main className="relative z-1 max-w-7xl mx-auto px-4 py-12">
        {/* Role Switcher Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Badge variant="outline" className="text-green-600 border-green-600 mb-4">
              <TrendingUp className="w-3 h-3 mr-1" />
              {SOCIAL_PROOF_STATS.INDIVIDUAL_LANDLORDS_JOINING}
            </Badge>
          </div>
          
          <RoleSwitcher 
            currentRole="landlord" 
            size="lg" 
            variant="toggle"
            showStats={true}
            data-testid="landlord-landing-role-switcher"
          />
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-600 to-green-400 text-transparent bg-clip-text">
              For Landlords
            </span>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-3xl text-gray-800">Join {SOCIAL_PROOF_STATS.NETWORK_QUALITY}</span>
              <div className="flex items-center gap-1">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <span className="text-2xl text-gray-600">Trusted Landlords</span>
              </div>
            </div>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            {NETWORK_VALUE_PROPS.LANDLORD.HERO}. Complete upfront documentation 
            enables {SOCIAL_PROOF_STATS.INDIVIDUAL_LANDLORD_DECISIONS}.
          </p>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{SOCIAL_PROOF_STATS.INDIVIDUAL_LANDLORD_RESPONSE_TIME}</div>
              <div className="text-sm text-gray-600">Response Speed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{SOCIAL_PROOF_STATS.TENANT_APPLICATION_TIME_SAVED}</div>
              <div className="text-sm text-gray-600">Application Processing Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">Direct Communication</div>
              <div className="text-sm text-gray-600">Individual Landlord Connection</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{PRIVATE_LANDLORD_STATS.MARKET_SHARE}</div>
              <div className="text-sm text-gray-600">Market Share</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
            {quickActions.map((action, index) => (
              <Link 
                key={index}
                href={action.href}
                className={`group flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all ${
                  action.primary 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'border-2 border-green-600 text-green-600 hover:bg-green-50'
                }`}
                data-testid={`landlord-action-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <action.icon className="w-5 h-5" />
                <div className="text-left">
                  <div>{action.title}</div>
                  <div className="text-sm opacity-80">{action.description}</div>
                </div>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {landlordBenefits.map((benefit, index) => (
            <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`absolute top-0 left-0 w-full h-1 ${colorClasses[benefit.color].bg500}`} />
              <CardHeader className="pb-2">
                <div className={`${colorClasses[benefit.color].bg100} p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-3`}>
                  <benefit.icon className={`w-6 h-6 ${colorClasses[benefit.color].text600}`} />
                </div>
                <CardTitle className="text-lg">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-3">{benefit.description}</CardDescription>
                <Badge variant="outline" className={`${colorClasses[benefit.color].text600} ${colorClasses[benefit.color].border600}`}>
                  {benefit.badge}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Network Value Proposition */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">How MyRentCard Saves You Time</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Specific workflow improvements eliminate repetitive screening tasks through individual landlord efficiency tools.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {NETWORK_VALUE_PROPS.LANDLORD.BENEFITS.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-gray-700">{benefit}</p>
              </div>
            ))}
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {TRUST_SIGNALS.NETWORK_GROWTH_INDICATORS.slice(0, 3).map((signal, index) => (
              <Badge key={index} variant="outline" className="text-green-600 border-green-600">
                <Zap className="w-3 h-3 mr-1" />
                {signal}
              </Badge>
            ))}
          </div>
        </div>

        {/* Success Stories */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-xl mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">What Landlords Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {SUCCESS_STORIES.LANDLORD_TESTIMONIALS.map((story, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-yellow-400 flex gap-1">
                    {"★★★★★"}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    {story.metric}
                  </Badge>
                </div>
                <p className="text-gray-700 font-medium mb-3">"{story.quote}"</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">{story.name}</div>
                    <div className="text-xs">{story.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Network Effects */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-8 rounded-xl mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">The Network Effect</h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {NETWORK_VALUE_PROPS.NETWORK_EFFECTS.LANDLORD.map((effect, index) => (
              <div key={index}>
                <div className="bg-white/20 p-4 rounded-lg mb-3">
                  <div className="text-2xl font-bold">{index + 1}</div>
                </div>
                <p className="text-sm">{effect}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cross-Role Discovery */}
        <div className="mb-12">
          <RoleCrossLink 
            currentRole="landlord" 
            className="max-w-2xl mx-auto"
            data-testid="landlord-cross-link"
          />
        </div>

        {/* Final CTA */}
        <div className="text-center bg-green-600 text-white p-12 rounded-xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Get {SOCIAL_PROOF_STATS.INDIVIDUAL_LANDLORD_RESPONSE_TIME}?</h2>
          <p className="text-xl text-green-100 mb-8">
            Skip reference verification, eliminate follow-up emails, and review applications in 15 minutes instead of 45.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href={`/auth${preservedParams ? preservedParams + '&' : '?'}mode=register&type=landlord`}
              className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              data-testid="landlord-final-cta"
            >
              <Search className="w-5 h-5" />
              {NETWORK_CTA.PRIMARY.LANDLORD.MAIN}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/samples/screening-page"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-green-600 transition-colors flex items-center justify-center gap-2"
              data-testid="landlord-sample-link"
            >
              <FileText className="w-5 h-5" />
              View Sample Screening
            </Link>
          </div>
          
          <div className="flex justify-center gap-6 mt-8 text-green-200">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>Free to join</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>Verified tenants</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>Growing network</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}