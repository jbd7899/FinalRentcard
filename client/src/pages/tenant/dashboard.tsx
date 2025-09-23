import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ComingSoonBadge } from "@/components/ui/coming-soon";
import { MoreSection } from "@/components/ui/more-section";
import { 
  FileText, 
  Star, 
  Clock, 
  Building2,
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
import type { TenantProfile } from '@shared/schema';
import { TenantDashboardInterests, type DashboardInterest } from '@/components/tenant/DashboardInterests';
import { ENV } from '@/constants/env';


const parseCreatedAt = (value: string) => {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const normalizeInterests = (data: unknown): DashboardInterest[] => {
  if (!Array.isArray(data)) {
    return [];
  }

  const normalized: DashboardInterest[] = [];

  for (const item of data) {
    if (!item || typeof item !== 'object') {
      continue;
    }

    const record = item as Record<string, unknown>;
    if (typeof record.id !== 'number') {
      continue;
    }

    const propertySource = record.property;
    let property: DashboardInterest['property'] = null;

    if (propertySource && typeof propertySource === 'object') {
      const propertyRecord = propertySource as Record<string, unknown>;
      property = {
        address:
          typeof propertyRecord.address === 'string'
            ? propertyRecord.address
            : undefined,
        rent:
          typeof propertyRecord.rent === 'number'
            ? propertyRecord.rent
            : undefined,
      };
    }

    normalized.push({
      id: record.id,
      status: typeof record.status === 'string' ? record.status : 'new',
      createdAt: typeof record.createdAt === 'string' ? record.createdAt : '',
      property,
      isGeneral: Boolean(record.isGeneral),
    });
  }

  return normalized.sort(
    (a, b) => parseCreatedAt(b.createdAt) - parseCreatedAt(a.createdAt)
  );
};

const TenantDashboard = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { logout } = useAuthStore();
  const { setLoading, loadingStates, addToast } = useUIStore();
  const [, setLocation] = useLocation();
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  
  // Tenant profile and sharing logic
  const tenantProfile = user?.profiles?.tenant || null;
  const isTenantProfileLoading = isAuthLoading;
  const SHARE_PREREQUISITES_MESSAGE = "Complete your profile to enable sharing";
  const shareRequirementsMissing = !tenantProfile || !tenantProfile.firstName || !tenantProfile.lastName;
  const canShareRentCard = !shareRequirementsMissing;
  
  // RentCard status variables
  const rentCardHasData = Boolean(tenantProfile);
  const profileCompletion = rentCardHasData ? 75 : 0; // Default completion percentage
  const isRentCardLoading = isAuthLoading;
  const tenantProfileError = null; // No error handling needed for now
  const lastUpdated = tenantProfile?.updatedAt ? new Date(tenantProfile.updatedAt).toLocaleDateString() : null;
  const verifiedReferencesCount = 0; // Default to 0 verified references
  const tenantReferences = []; // Default to empty array of references
  const tenantReferencesError = null; // Default to no error

  const shouldFetchInterests = Boolean(user);
  const {
    data: interestsData = [],
    isLoading: isInterestsLoading,
    isFetching: isInterestsFetching,
    error: interestsError,
    refetch: refetchInterests,
  } = useQuery<unknown, Error, DashboardInterest[]>({
    queryKey: ['/api/interests'],
    enabled: shouldFetchInterests,
    select: normalizeInterests,
  });

  const tenantInterests = shouldFetchInterests ? interestsData : [];
  const visibleInterests = tenantInterests.slice(0, 3);
  const isInterestsInFlight =
    (isInterestsLoading || isInterestsFetching) && tenantInterests.length === 0;
  const interestsErrorToShow = !isInterestsInFlight ? interestsError ?? null : null;

  const handleRetryInterests = () => {
    if (!shouldFetchInterests) return;
    void refetchInterests();
  };

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


  return (
    <TenantLayout activeRoute={ROUTES.TENANT.DASHBOARD}>
      <header className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">
              Manage your rental profile and interests
            </p>
          </div>
          
          {/* Simplified Header - Primary CTA only */}
          <div className="flex gap-2">
            {canShareRentCard ? (
              <OneClickShareButton
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                showText={true}
                data-testid="button-share-rentcard-header"
              />
            ) : (
              <div className="flex flex-col items-start gap-1">
                <Button
                  variant="default"
                  size="sm"
                  className={`${tenantProfile ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-600 hover:bg-green-700'} text-white`}
                  onClick={() => setLocation('/create-rentcard')}
                  data-testid={tenantProfile ? 'button-complete-rentcard-share' : 'button-create-rentcard-header'}
                >
                  {tenantProfile ? 'Finish RentCard to Share' : 'Create RentCard'}
                </Button>

                {shareRequirementsMissing && (
                  <p className="text-xs text-gray-500">{SHARE_PREREQUISITES_MESSAGE}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Simplified Onboarding - Optional and Dismissible, only show if profile exists */}
      {!onboardingDismissed && tenantProfile && (
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900">
                  {shareRequirementsMissing ? 'Finish setting up your RentCard' : 'Want to optimize your RentCard?'}
                </h3>
                <p className="text-sm text-blue-700">
                  {shareRequirementsMissing
                    ? SHARE_PREREQUISITES_MESSAGE
                    : 'Add references and details to get faster landlord responses'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation(shareRequirementsMissing ? '/create-rentcard' : ROUTES.TENANT.RENTCARD)}
                className="text-blue-600 border-blue-300 hover:bg-blue-100"
                data-testid="button-optimize-rentcard"
              >
                {shareRequirementsMissing ? 'Finish Setup' : 'Optimize'}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setOnboardingDismissed(true)}
                className="text-gray-400 hover:text-gray-600"
                data-testid="button-dismiss-optimization"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
        
      {/* Primary Actions - Only 2 CTAs above the fold */}
      <section className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card className="hover:shadow-md transition-shadow border-2 border-blue-200">
            <CardContent className="p-6 text-center">
              <Share2 className="h-10 w-10 text-blue-500 mb-3 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Share RentCard</h3>
              <p className="text-sm text-gray-600 mb-4">
                {canShareRentCard
                  ? 'One-click sharing available in header'
                  : 'Complete your RentCard to unlock one-click sharing'}
              </p>
              <p
                className={`text-xs font-medium ${canShareRentCard ? 'text-blue-600' : 'text-amber-600'}`}
              >
                {canShareRentCard
                  ? 'Use "Share My RentCard" button above ↗'
                  : SHARE_PREREQUISITES_MESSAGE}
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              {isTenantProfileLoading ? (
                <>
                  <Skeleton className="h-10 w-10 rounded-full mx-auto mb-3" />
                  <Skeleton className="h-6 w-32 mx-auto mb-2" />
                  <Skeleton className="h-4 w-48 mx-auto mb-4" />
                  <Skeleton className="h-8 w-full" />
                </>
              ) : !tenantProfile ? (
                <>
                  <FileText className="h-10 w-10 text-green-500 mb-3 mx-auto" />
                  <h3 className="font-semibold text-lg mb-2">Create Your RentCard</h3>
                  <p className="text-sm text-gray-600 mb-4">Build your rental profile to share with landlords</p>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setLocation("/create-rentcard")}
                    data-testid="button-create-rentcard-primary"
                  >
                    Get Started
                  </Button>
                </>
              ) : (
                <>
                  <Star className="h-10 w-10 text-blue-500 mb-3 mx-auto" />
                  <h3 className="font-semibold text-lg mb-2">View & Edit RentCard</h3>
                  <p className="text-sm text-gray-600 mb-4">Update your profile and information</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => setLocation(ROUTES.TENANT.RENTCARD)}
                    data-testid="button-view-rentcard-primary"
                  >
                    Open RentCard
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Advanced Features - Progressive Disclosure */}
        <MoreSection 
          title="More Tools & Features" 
          persistKey="tenant-dashboard-tools"
          testId="dashboard-tools"
          className="mb-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation(ROUTES.TENANT.DOCUMENTS)}
              className="flex flex-col items-center p-4 h-auto"
              data-testid="button-documents-more"
            >
              <Upload className="h-5 w-5 text-green-500 mb-2" />
              <span className="text-xs">Upload Documents</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation(ROUTES.TENANT.REFERENCES)}
              className="flex flex-col items-center p-4 h-auto"
              data-testid="button-references-more"
            >
              <UserCheck className="h-5 w-5 text-purple-500 mb-2" />
              <span className="text-xs">Manage References</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation(ROUTES.TENANT.INTERESTS)}
              className="flex flex-col items-center p-4 h-auto"
              data-testid="button-interests-more"
            >
              <Building2 className="h-5 w-5 text-amber-500 mb-2" />
              <span className="text-xs">Shared RentCards</span>
            </Button>
          </div>
        </MoreSection>
      </section>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
        {/* RentCard Status */}
        <Card>
          <CardContent className="p-5 sm:p-6">
            <div className="flex justify-between items-start mb-4 sm:mb-5">
              <div>
                <h2 className="text-base sm:text-lg font-medium">Your RentCard</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-1.5" data-testid="text-rentcard-last-updated">
                  {lastUpdated ? `Last updated: ${lastUpdated}` : 'No updates yet'}
                </p>
              </div>
              {rentCardHasData && (
                <Badge variant="outline" className="px-2 py-1 text-xs font-medium" data-testid="badge-rentcard-completion">
                  {profileCompletion}% Complete
                </Badge>
              )}
            </div>

            {isRentCardLoading ? (
              <>
                <Skeleton className="h-10 w-10 rounded-full mb-4" />
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-48 mb-6" />
                <Skeleton className="h-8 w-full" />
              </>
            ) : tenantProfileError ? (
              <div className="text-center py-6">
                <h3 className="text-sm font-medium text-red-600 mb-2">Unable to load your RentCard</h3>
                <p className="text-sm text-gray-500">Please refresh the page and try again.</p>
              </div>
            ) : !rentCardHasData ? (
              <div className="text-center">
                <div className="flex flex-col items-center mb-4">
                  <FileText className="h-10 w-10 text-blue-500 mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Build your RentCard</h3>
                  <p className="text-sm text-gray-600">
                    Add your employment details, rental history, and references to unlock sharing tools.
                  </p>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setLocation(ROUTES.TENANT.RENTCARD)}
                  data-testid="button-complete-rentcard"
                >
                  Complete My RentCard
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 flex items-center justify-center">
                      <Star className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-medium">Credit Score</p>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-lg sm:text-xl font-semibold" data-testid="text-credit-score">
                          {tenantProfile?.creditScore ?? '--'}
                        </span>
                        {tenantProfile?.creditScore ? (
                          <span className="text-xs sm:text-sm text-gray-500">FICO</span>
                        ) : (
                          <span className="text-xs sm:text-sm text-gray-400">Not provided</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm sm:text-base font-medium">References</p>
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <span className="text-lg sm:text-xl font-semibold" data-testid="text-verified-references">
                        {verifiedReferencesCount}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {tenantReferences.length ? `verified / ${tenantReferences.length} total` : 'verified'}
                      </span>
                    </div>
                  </div>
                </div>

                {tenantReferencesError && (
                  <p className="text-xs text-red-500 mb-3" data-testid="text-references-error">
                    There was an issue loading your references. Showing the latest available data.
                  </p>
                )}

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
              </>
            )}
          </CardContent>
        </Card>
        
        <section>
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-medium">Active Interests</h2>
              {!ENV.IS_PRODUCTION && (
                <ComingSoonBadge type="feature" size="sm" title="Beta" />
              )}
            </div>
            <Link href={ROUTES.TENANT.INTERESTS}>
              <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs sm:text-sm">View All</Button>
            </Link>
          </div>

          <TenantDashboardInterests
            interests={visibleInterests}
            totalCount={tenantInterests.length}
            isLoading={isInterestsInFlight}
            error={interestsErrorToShow}
            onBrowseProperties={() => setLocation(ROUTES.TENANT.INTERESTS)}
            onRetry={handleRetryInterests}
          />
        </section>
      </div>
      
      
      {/* Advanced Analytics - Progressive Disclosure */}
      <MoreSection 
        title="Analytics & Insights" 
        persistKey="tenant-dashboard-analytics"
        testId="dashboard-analytics"
        className="mb-6"
      >
        <div className="mt-4">
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
      </MoreSection>
      
    </TenantLayout>
  );
};

export default TenantDashboard;