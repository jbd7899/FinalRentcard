import { Building2, Clock, Shield, CheckCircle, ArrowRight, Users, Zap, ArrowUpRight, CreditCard, TrendingUp, Star, Award, Target, User } from 'lucide-react';
import { Link } from 'wouter';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import Navbar from '@/components/shared/navbar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { SOCIAL_PROOF_STATS, NETWORK_VALUE_PROPS, SUCCESS_STORIES, NETWORK_CTA } from '@/constants';
import React from 'react';

export default function HomePage() {
  const { user } = useAuthStore();
  const { loadingStates, setLoading, addToast } = useUIStore();

  const handleDashboardClick = () => {
    setLoading('dashboard', true);
    addToast({
      title: "Welcome back!",
      description: "Redirecting to your dashboard...",
      type: "info",
      duration: 3000
    });
    // Simulate loading for demo
    setTimeout(() => setLoading('dashboard', false), 1000);
  };

  const handleCreateRentCard = () => {
    setLoading('createRentCard', true);
    addToast({
      title: "Let's get started!",
      description: "Creating your RentCard profile...",
      type: "success",
      duration: 3000
    });
    // Simulate loading for demo
    setTimeout(() => setLoading('createRentCard', false), 1000);
  };

  const handleRequestScreening = () => {
    setLoading('requestScreening', true);
    addToast({
      title: "Tenant Screening",
      description: "Setting up tenant screening request...",
      type: "info",
      duration: 3000
    });
    // Simulate loading for demo
    setTimeout(() => setLoading('requestScreening', false), 1000);
  };

  const handleHover = (key: string, isHovered: boolean) => {
    setLoading(`hover_${key}`, isHovered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <div className="absolute inset-0 bg-[url('/api/placeholder/20/20')] opacity-5 z-0"></div>

      <div className="relative z-10">
        <Navbar />
      </div>

      <main className="relative z-1 max-w-7xl mx-auto px-4 py-16">
        {/* Decorative speed lines */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <div className="absolute transform rotate-45 h-1 w-32 bg-blue-600"></div>
          <div className="absolute transform rotate-45 h-1 w-24 bg-blue-600 translate-x-8"></div>
          <div className="absolute transform rotate-45 h-1 w-16 bg-blue-600 translate-x-16"></div>
        </div>

        <div className="text-center mb-16 relative">
          {/* Floating speed indicators */}
          <div className="absolute -top-8 left-1/4 bg-blue-600 text-white px-3 py-1 rounded-full transform -rotate-12 opacity-80">
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4" /> Fast
            </span>
          </div>
          <div className="absolute top-0 right-1/4 bg-green-500 text-white px-3 py-1 rounded-full transform rotate-12 opacity-80">
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" /> Easy
            </span>
          </div>

          {/* Network Growth Badge */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Users className="w-4 h-4" />
                <span>{SOCIAL_PROOF_STATS.TOTAL_USERS} trusted users</span>
              </span>
            </div>
            <div className="inline-block bg-green-100 text-green-600 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow">
              <span className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                <span>{SOCIAL_PROOF_STATS.NEW_USERS_DAILY} joining daily</span>
              </span>
            </div>
            <div className="inline-block bg-purple-100 text-purple-600 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow">
              <span className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>No credit card required</span>
              </span>
            </div>
          </div>

          {/* Hero Section with Network Value */}
          <div className="relative">
            <h1 className="text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
                MyRentCard
              </span>
              <div className="absolute -right-4 top-0 text-yellow-400 text-xl">✨</div>
              <span className="block text-3xl mt-4 text-gray-800">
                Save {SOCIAL_PROOF_STATS.TENANT_APPLICATION_TIME_SAVED} Per Application
              </span>
              <span className="block text-2xl mt-2 text-blue-600">
                Complete Profiles Enable Same-Day Review
              </span>
            </h1>
          </div>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            One-time profile setup eliminates {SOCIAL_PROOF_STATS.TENANT_APPLICATION_TIME_SAVED} of repetitive work per application. 
            Complete documentation enables same-day landlord review instead of weeks of back-and-forth.
          </p>
          
          {/* Network Value Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{SOCIAL_PROOF_STATS.VERIFIED_RENTERS}</div>
              <div className="text-sm text-gray-600">Verified Renters</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{SOCIAL_PROOF_STATS.LANDLORD_TIME_SAVED_WEEKLY}</div>
              <div className="text-sm text-gray-600">Landlord Time Saved Weekly</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{SOCIAL_PROOF_STATS.REFERENCE_VERIFICATION_TIME_SAVED}</div>
              <div className="text-sm text-gray-600">Reference Verification Skipped</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{SOCIAL_PROOF_STATS.CITIES_SERVED}</div>
              <div className="text-sm text-gray-600">Cities Served</div>
            </div>
          </div>

          {/* Role Selection - Choose Your Path */}
          {!user && (
            <div className="mb-16">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Choose Your Path</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">Get targeted information and tools designed specifically for your needs</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 max-w-4xl mx-auto">
                <Link 
                  href="/tenant"
                  className="group flex-1 bg-white border-2 border-blue-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-xl transition-all duration-200"
                  onMouseEnter={() => handleHover('tenantPath', true)}
                  onMouseLeave={() => handleHover('tenantPath', false)}
                  data-testid="button-tenant-path"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg transition-colors ${loadingStates.hover_tenantPath ? 'bg-blue-600' : 'bg-blue-100'}`}>
                        <User className={`w-6 h-6 transition-colors ${loadingStates.hover_tenantPath ? 'text-white' : 'text-blue-600'}`} />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                          I'm Looking for an Apartment
                        </h3>
                        <p className="text-gray-600 mt-1">Save {SOCIAL_PROOF_STATS.TENANT_APPLICATION_TIME_SAVED} per application with pre-verified profiles</p>
                        <div className="mt-2">
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            <Users className="w-3 h-3 mr-1" />
                            {SOCIAL_PROOF_STATS.VERIFIED_RENTERS} verified renters
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className={`w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-all ${loadingStates.hover_tenantPath ? 'translate-x-1' : ''}`} />
                  </div>
                </Link>

                <Link 
                  href="/landlord"
                  className="group flex-1 bg-white border-2 border-green-200 rounded-xl p-6 hover:border-green-400 hover:shadow-xl transition-all duration-200"
                  onMouseEnter={() => handleHover('landlordPath', true)}
                  onMouseLeave={() => handleHover('landlordPath', false)}
                  data-testid="button-landlord-path"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg transition-colors ${loadingStates.hover_landlordPath ? 'bg-green-600' : 'bg-green-100'}`}>
                        <Building2 className={`w-6 h-6 transition-colors ${loadingStates.hover_landlordPath ? 'text-white' : 'text-green-600'}`} />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                          I'm a Property Owner/Manager
                        </h3>
                        <p className="text-gray-600 mt-1">Save {SOCIAL_PROOF_STATS.LANDLORD_TIME_SAVED_WEEKLY} with pre-verified tenant profiles</p>
                        <div className="mt-2">
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            <Building2 className="w-3 h-3 mr-1" />
                            {SOCIAL_PROOF_STATS.VERIFIED_LANDLORDS} trusted landlords
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className={`w-6 h-6 text-gray-400 group-hover:text-green-600 transition-all ${loadingStates.hover_landlordPath ? 'translate-x-1' : ''}`} />
                  </div>
                </Link>
              </div>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-500">
                  Not sure? <Link href="/samples/rentcard" className="text-blue-600 hover:text-blue-800 underline">View a sample RentCard</Link> to see how it works
                </p>
              </div>
            </div>
          )}

          {/* CTA Buttons with conditional rendering based on auth state */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
            {user ? (
              <Link 
                href={user.userType === 'landlord' ? '/landlord/dashboard' : '/tenant/dashboard'}
                className="group bg-blue-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-blue-700 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                onClick={handleDashboardClick}
                onMouseEnter={() => handleHover('dashboard', true)}
                onMouseLeave={() => handleHover('dashboard', false)}
              >
                {loadingStates.dashboard ? (
                  <Skeleton className="w-24 h-6" />
                ) : (
                  <>
                    View Dashboard
                    <ArrowRight className={`w-5 h-5 transition-transform ${loadingStates.hover_dashboard ? 'translate-x-1' : ''}`} />
                  </>
                )}
              </Link>
            ) : (
              <>
                <Link 
                  href="/create-rentcard" 
                  className="group bg-blue-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-blue-700 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                  onClick={handleCreateRentCard}
                  onMouseEnter={() => handleHover('createRentCard', true)}
                  onMouseLeave={() => handleHover('createRentCard', false)}
                >
                  {loadingStates.createRentCard ? (
                    <Skeleton className="w-32 h-6" />
                  ) : (
                    <>
                      {NETWORK_CTA.PRIMARY.TENANT.MAIN}
                      <ArrowRight className={`w-5 h-5 transition-transform ${loadingStates.hover_createRentCard ? 'translate-x-1' : ''}`} />
                    </>
                  )}
                </Link>
                <Link 
                  href="/create-screening" 
                  className="group border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-medium hover:bg-blue-50 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                  onClick={handleRequestScreening}
                  onMouseEnter={() => handleHover('requestScreening', true)}
                  onMouseLeave={() => handleHover('requestScreening', false)}
                >
                  {loadingStates.requestScreening ? (
                    <Skeleton className="w-32 h-6" />
                  ) : (
                    <>
                      {NETWORK_CTA.PRIMARY.LANDLORD.SECONDARY}
                      <ArrowRight className={`w-5 h-5 transition-transform ${loadingStates.hover_requestScreening ? 'translate-x-1' : ''}`} />
                    </>
                  )}
                </Link>
              </>
            )}
          </div>

          {/* Sample Links */}
          <div className="flex flex-wrap justify-center gap-8 text-blue-600 mb-16">
            <Link 
              href="/samples/rentcard" 
              className="group flex items-center gap-2 hover:text-blue-800 transition-colors"
              onMouseEnter={() => handleHover('sampleRentCard', true)}
              onMouseLeave={() => handleHover('sampleRentCard', false)}
            >
              <span>View Sample RentCard</span>
              <ArrowRight className={`w-4 h-4 transition-transform ${loadingStates.hover_sampleRentCard ? 'translate-x-1' : ''}`} />
            </Link>
            <Link 
              href="/samples/screening-page" 
              className="group flex items-center gap-2 hover:text-blue-800 transition-colors"
              onMouseEnter={() => handleHover('sampleScreening', true)}
              onMouseLeave={() => handleHover('sampleScreening', false)}
            >
              <span>View Sample Screening Page</span>
              <ArrowRight className={`w-4 h-4 transition-transform ${loadingStates.hover_sampleScreening ? 'translate-x-1' : ''}`} />
            </Link>
          </div>

          {/* Network Benefits Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { 
                icon: Users, 
                title: "Complete Documentation", 
                desc: "All tenant information verified upfront eliminates {SOCIAL_PROOF_STATS.EMAIL_REDUCTION_PER_APPLICATION} per application.",
                stat: "{SOCIAL_PROOF_STATS.EMAIL_REDUCTION_PER_APPLICATION} eliminated"
              },
              { 
                icon: Clock, 
                title: "Faster Processing", 
                desc: "Reduce application processing from {SOCIAL_PROOF_STATS.APPLICATION_PROCESSING_IMPROVEMENT} through complete upfront documentation.",
                stat: "{SOCIAL_PROOF_STATS.APPLICATION_PROCESSING_IMPROVEMENT}"
              },
              { 
                icon: Shield, 
                title: "Pre-Verified References", 
                desc: "Skip {SOCIAL_PROOF_STATS.REFERENCE_VERIFICATION_TIME_SAVED} of reference checking with pre-verified tenant profiles.",
                stat: "{SOCIAL_PROOF_STATS.REFERENCE_VERIFICATION_TIME_SAVED} saved"
              }
            ].map((benefit, index) => (
              <div 
                key={index}
                className="relative bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
                onMouseEnter={() => handleHover(`benefit${index}`, true)}
                onMouseLeave={() => handleHover(`benefit${index}`, false)}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                <div className={`bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 transition-transform ${loadingStates[`hover_benefit${index}`] ? 'scale-110' : ''}`}>
                  <benefit.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-gray-600 mb-4">{benefit.desc.replace(/{[^}]+}/g, (match) => {
                  const key = match.slice(1, -1) as keyof typeof SOCIAL_PROOF_STATS;
                  return SOCIAL_PROOF_STATS[key] || match;
                })}</p>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {benefit.stat.replace(/{[^}]+}/g, (match) => {
                    const key = match.slice(1, -1) as keyof typeof SOCIAL_PROOF_STATS;
                    return SOCIAL_PROOF_STATS[key] || match;
                  })}
                </Badge>
              </div>
            ))}
          </div>

          {/* Enhanced Social Proof with Real Success Stories */}
          <div className="bg-white p-12 rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50 to-transparent opacity-50"></div>

            <div className="relative">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-1 w-16 bg-blue-200 rounded"></div>
                <p className="text-2xl font-semibold text-blue-800">Workflow Improvements That Save Real Time</p>
                <div className="h-1 w-16 bg-blue-200 rounded"></div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                {SUCCESS_STORIES.TENANT_TESTIMONIALS.map((story, index) => (
                  <div 
                    key={index}
                    className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all"
                    onMouseEnter={() => handleHover(`story${index}`, true)}
                    onMouseLeave={() => handleHover(`story${index}`, false)}
                  >
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
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{story.name}</div>
                        <div className="text-xs">{story.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Network Growth Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{SOCIAL_PROOF_STATS.SUCCESSFUL_MATCHES}</div>
                  <div className="text-sm text-gray-600">Successful Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{SOCIAL_PROOF_STATS.SATISFACTION_SCORE}/5</div>
                  <div className="text-sm text-gray-600">User Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{SOCIAL_PROOF_STATS.PROPERTIES_LISTED}</div>
                  <div className="text-sm text-gray-600">Properties Listed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{SOCIAL_PROOF_STATS.NEW_USERS_DAILY}</div>
                  <div className="text-sm text-gray-600">New Users Daily</div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-lg font-semibold mb-2">Eliminate repetitive tasks, save real time</p>
                <p className="text-gray-600 mb-4">Free to join • {SOCIAL_PROOF_STATS.CITIES_SERVED} cities served • Realistic time savings</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline">Pre-verified references</Badge>
                  <Badge variant="outline">Complete documentation upfront</Badge>
                  <Badge variant="outline">Same-day application review</Badge>
                  <Badge variant="outline">Eliminate follow-up emails</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}