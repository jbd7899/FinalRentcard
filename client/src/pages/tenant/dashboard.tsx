import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ComingSoonBadge, ComingSoonCard, ComingSoonWithMockData } from "@/components/ui/coming-soon";
import { 
  FileText, 
  Star, 
  Clock, 
  Building2, 
  ArrowRight,
  CheckCircle,
  LogOut,
  Loader2,
  Share2,
  Upload,
  Home,
  UserCheck,
  Menu,
  X,
  User,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { ROUTES, CONFIG, MESSAGES, APPLICATION_STATUS, type ApplicationStatus, APPLICATION_LABELS } from "@/constants";
import { NETWORK_VALUE_PROPS, PRIVATE_LANDLORD_STATS, SOCIAL_PROOF_STATS } from '@shared/network-messaging';
import { Link, useLocation } from "wouter";
import TenantLayout from '@/components/layouts/TenantLayout';
import { EnhancedShareModal } from '@/components/shared/EnhancedShareModal';
import OneClickShareButton from '@/components/shared/OneClickShareButton';
import TenantAnalyticsDashboard from '@/components/tenant/AnalyticsDashboard';
import OnboardingChecklist from '@/components/tenant/OnboardingChecklist';
import { apiRequest } from '@/lib/queryClient';

const generateRoute = {
  application: (id: string) => `/tenant/applications/${id}`
};

const TenantDashboard = () => {
  const { logout, user } = useAuthStore();
  const { setLoading, loadingStates, addToast } = useUIStore();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics'>('dashboard');
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [onboardingCollapsed, setOnboardingCollapsed] = useState(false);

  // Fetch the authenticated user's tenant profile
  const { data: tenantProfile, isLoading: isTenantProfileLoading, error: tenantProfileError } = useQuery({
    queryKey: ['tenant-profile'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/tenant/profile');
      return response.json();
    },
    enabled: !!user // Only fetch if user is authenticated
  });

  // Demo data
  const rentCardStatus = {
    score: 4.8,
    verifiedReferences: 2,
    completionStatus: 85,
    lastUpdated: "Feb 15, 2025"
  };

  const applications = [
    {
      id: 1,
      property: "123 Main Street Unit A",
      landlord: "John Smith",
      status: APPLICATION_STATUS.CONTACTED as ApplicationStatus,
      submittedAt: "2025-02-18T10:30:00",
      requirements: {
        creditScore: "✓ Meets requirement",
        income: "✓ 3.5x monthly rent",
        employment: "✓ Verified",
        references: "✓ 2 verified references"
      }
    }
  ];

  const handleLogout = async () => {
    try {
      setLoading('logout', true);
      await logout();
      addToast({
        title: 'Success',
        description: 'You have been logged out successfully.',
        type: 'success'
      });
      setLocation(ROUTES.AUTH);
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        type: 'destructive'
      });
    } finally {
      setLoading('logout', false);
    }
  };

  const navigationItems = [
    { icon: <Home className="w-5 h-5" />, label: "Dashboard", route: ROUTES.TENANT.DASHBOARD, active: true },
    { icon: <Star className="w-5 h-5" />, label: "My RentCard", route: ROUTES.TENANT.RENTCARD },
    { icon: <FileText className="w-5 h-5" />, label: "Documents", route: ROUTES.TENANT.DOCUMENTS },
    { icon: <UserCheck className="w-5 h-5" />, label: "References", route: ROUTES.TENANT.REFERENCES },
    { icon: <Building2 className="w-5 h-5" />, label: "Applications", route: ROUTES.TENANT.INTERESTS }
  ];

  return (
    <TenantLayout activeRoute={ROUTES.TENANT.DASHBOARD}>
      <header className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">
              Manage your rental profile and applications
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={activeTab === 'dashboard' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('dashboard')}
              data-testid="tab-dashboard"
            >
              Overview
            </Button>
            <Button 
              variant={activeTab === 'analytics' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('analytics')}
              data-testid="tab-analytics"
            >
              Analytics
            </Button>
            <OneClickShareButton 
              variant="default" 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              showText={false}
            />
          </div>
        </div>
      </header>
      
      {/* Conditional Content Based on Active Tab */}
      {activeTab === 'dashboard' ? (
        <>
        {/* Onboarding Checklist */}
        {!onboardingDismissed && !onboardingCollapsed && (
          <OnboardingChecklist 
            onDismiss={() => setOnboardingDismissed(true)}
            collapsed={true}
            onToggleCollapse={() => setOnboardingCollapsed(!onboardingCollapsed)}
          />
        )}
        
        {/* Quick Actions */}
        <section className="mb-8">
        <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center">
              <Star className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mb-1 sm:mb-2" />
              <h3 className="font-medium text-sm sm:text-base">View RentCard</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-1 sm:mt-2 text-xs sm:text-sm h-7 sm:h-8"
                onClick={() => setLocation(ROUTES.TENANT.RENTCARD)}
              >
                Open
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center">
              <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mb-1 sm:mb-2" />
              <h3 className="font-medium text-sm sm:text-base">Upload Document</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-1 sm:mt-2 text-xs sm:text-sm h-7 sm:h-8"
                onClick={() => setLocation(ROUTES.TENANT.DOCUMENTS)}
              >
                Upload
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center">
              <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 mb-1 sm:mb-2" />
              <h3 className="font-medium text-sm sm:text-base">References</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-1 sm:mt-2 text-xs sm:text-sm h-7 sm:h-8"
                onClick={() => setLocation(ROUTES.TENANT.REFERENCES)}
              >
                Manage
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500 mb-1 sm:mb-2" />
              <h3 className="font-medium text-sm sm:text-base">Applications</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-1 sm:mt-2 text-xs sm:text-sm h-7 sm:h-8"
                onClick={() => setLocation(ROUTES.TENANT.INTERESTS)}
              >
                View
              </Button>
            </CardContent>
          </Card>
        </div>

      </section>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
        {/* RentCard Status */}
        <Card>
          <CardContent className="p-5 sm:p-6">
            <div className="flex justify-between items-start mb-4 sm:mb-5">
              <div>
                <h2 className="text-base sm:text-lg font-medium">Your RentCard</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-1.5">
                  Last updated: {rentCardStatus.lastUpdated}
                </p>
              </div>
              <Badge variant="outline" className="px-2 py-1 text-xs font-medium">
                {rentCardStatus.completionStatus}% Complete
              </Badge>
            </div>
            
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-medium">Tenant Score</p>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-lg sm:text-xl font-semibold">{rentCardStatus.score}</span>
                    <span className="text-xs sm:text-sm text-gray-500">/ 5.0</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm sm:text-base font-medium">References</p>
                <div className="flex items-center justify-end gap-1 sm:gap-2">
                  <span className="text-lg sm:text-xl font-semibold">{rentCardStatus.verifiedReferences}</span>
                  <span className="text-xs sm:text-sm text-gray-500">verified</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-6 flex gap-2">
              <Button 
                variant="default" 
                className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                onClick={() => setLocation(ROUTES.TENANT.REFERENCES)}
              >
                Manage References
              </Button>
              <OneClickShareButton 
                variant="outline" 
                size="sm"
                className="text-xs sm:text-sm h-8 sm:h-9 px-3"
                showText={false}
              />
            </div>
          </CardContent>
        </Card>
        
        <section>
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-medium">Active Applications</h2>
              <ComingSoonBadge type="feature" size="sm" title="Beta" />
            </div>
            <Link href={ROUTES.TENANT.INTERESTS}>
              <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs sm:text-sm">View All</Button>
            </Link>
          </div>
          
          {applications.length > 0 ? (
            <ComingSoonWithMockData
              type="feature"
              title="Application Tracking"
              description="Real-time application tracking with landlord communications is coming soon. Currently showing demo data."
              overlay={false}
              mockDataComponent={
                <Card>
                  <CardContent className="p-5 sm:p-6">
                    {applications.map((application) => (
                      <div key={application.id} className="border-b pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                        <div className="flex justify-between items-start mb-2 sm:mb-3">
                          <div>
                            <h3 className="font-medium text-sm sm:text-base">{application.property}</h3>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                              Landlord: {application.landlord}
                            </p>
                          </div>
                          <Badge 
                            className={`px-2 py-1 text-xs font-medium ${
                              application.status === APPLICATION_STATUS.CONTACTED 
                                ? 'bg-green-100 text-green-800' 
                                : application.status === APPLICATION_STATUS.ARCHIVED
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {APPLICATION_LABELS.STATUS[application.status]}
                          </Badge>
                        </div>
                        
                        <div className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>Submitted {new Date(application.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <Link href={generateRoute.application(application.id.toString())}>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs sm:text-sm h-7 sm:h-8 flex items-center justify-center gap-1 sm:gap-2"
                          >
                            <span>View Details</span>
                            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              }
            />
          ) : (
            <Card>
              <CardContent className="p-5 sm:p-6 text-center">
                <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4">No active applications</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs sm:text-sm h-8 sm:h-9"
                  onClick={() => setLocation(ROUTES.TENANT.INTERESTS)}
                >
                  Browse Properties
                </Button>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
      
      
      {/* Enhanced Share Modal */}
      <EnhancedShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        resourceType="rentcard"
        title="Share Your RentCard"
        description="Share your rental profile with landlords and property managers"
      />
        </>
      ) : (
        /* Analytics Content */
        <div className="mt-6">
          {isTenantProfileLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : tenantProfileError ? (
            <Card className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-red-600 mb-2">Profile Error</h3>
                <p className="text-gray-500">Unable to load tenant profile. Please try refreshing the page.</p>
              </div>
            </Card>
          ) : tenantProfile?.id ? (
            <TenantAnalyticsDashboard tenantId={tenantProfile.id} />
          ) : (
            <Card className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-600 mb-2">Profile Incomplete</h3>
                <p className="text-gray-500 mb-4">Please complete your tenant profile to view analytics.</p>
                <Button 
                  onClick={() => setLocation(ROUTES.TENANT.RENTCARD)}
                  data-testid="button-complete-profile"
                >
                  Complete Profile
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </TenantLayout>
  );
};

export default TenantDashboard;