import React, { useState, useEffect } from 'react';
import { LogOut, BarChart3 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Property } from "@shared/schema";
import { ComingSoonBadge, ComingSoonCard } from "@/components/ui/coming-soon";
import { 
  ROUTES, 
  API_ENDPOINTS, 
} from '@/constants';
import { NETWORK_VALUE_PROPS, INDIVIDUAL_LANDLORD_STATS } from '@shared/network-messaging';

// Import tab components
import OverviewTab from '@/components/landlord/dashboard/OverviewTab';
import PropertiesTab from '@/components/landlord/dashboard/PropertiesTab';
import InterestsTab from '@/components/landlord/dashboard/ApplicationsTab';
import LandlordAnalyticsDashboard from '@/components/landlord/AnalyticsDashboard';

// Import other components
import RequestModal from '@/components/landlord/RequestModal';
import { useLocation, useSearch } from "wouter";
import { useUIStore } from '@/stores/uiStore';
import LandlordLayout from '@/components/layouts/LandlordLayout';
import { useToast } from "@/components/ui/use-toast";

type TimeFilter = '7days' | '30days' | '90days' | 'all';
type TabType = 'overview' | 'properties' | 'interests' | 'analytics';

interface PropertyWithCount extends Omit<Property, 'isArchived'> {
  applicationCount: number | null;
  viewCount: number | null;
  isArchived: boolean;
}

const LandlordDashboard = () => {
  const { user, logout } = useAuthStore();
  const { modal, openModal, closeModal, loadingStates, setLoading } = useUIStore();
  const [location, setLocation] = useLocation();
  const searchString = useSearch();
  const [showMockNotice, setShowMockNotice] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Check for tab query parameter with proper error handling
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(searchString || '');
      const tabParam = searchParams.get('tab') as TabType | null;
      
      if (tabParam && ['overview', 'properties', 'interests', 'analytics'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    } catch (error) {
      console.warn('Error parsing search parameters:', error);
      // Fallback to default tab if parsing fails
    }
  }, [searchString]);

  // Fetch the authenticated user's landlord profile
  const { data: landlordProfile, isLoading: isLandlordProfileLoading, error: landlordProfileError } = useQuery({
    queryKey: ['landlord-profile'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/landlord/profile');
      return response.json();
    },
    enabled: !!user // Only fetch if user is authenticated
  });

  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: [API_ENDPOINTS.PROPERTIES.BASE],
    queryFn: async () => {
      const response = await apiRequest('GET', API_ENDPOINTS.PROPERTIES.BASE);
      return response.json() as Promise<PropertyWithCount[]>;
    },
    enabled: !!user?.id
  });

  const { data: generalScreening, isLoading: generalScreeningLoading } = useQuery({
    queryKey: ['/api/screening/general'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/screening/general');
        return response.json();
      } catch (error) {
        // Return dummy data if API fails
        return {
          slug: 'general-screening',
          businessName: user?.userType === 'landlord' ? 'Your Business' : 'Your Business',
          viewCount: 35,
          applicationCount: 8
        };
      }
    },
    enabled: !!user?.id
  });

  const toggleArchiveProperty = useMutation({
    mutationFn: async (propertyId: number) => {
      const property = properties?.find(p => p.id === propertyId);
      if (!property) return;
      
      const isCurrentlyArchived = Boolean(property.isArchived);
      const response = await apiRequest(
        'PATCH', 
        API_ENDPOINTS.PROPERTIES.UPDATE(propertyId), 
        { isArchived: !isCurrentlyArchived }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PROPERTIES.BASE] });
      toast({
        title: "Success",
        description: "Property status updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating property:', error);
      toast({
        title: "Error",
        description: "Failed to update property status. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleArchiveToggle = (propertyId: number) => {
    toggleArchiveProperty.mutate(propertyId);
  };

  const totalSubmissions = properties?.reduce((sum, property) => {
    return sum + (property.applicationCount || 0);
  }, 0) || 0;
  const activeProperties = properties?.filter(p => !p.isArchived)?.length || 0;
  const totalViews = properties?.reduce((sum, property) => {
    return sum + (property.viewCount || 0);
  }, 0) || 0;

  const handleLogout = async () => {
    try {
      setLoading('loggingOut', true);
      await logout();
      setLocation(ROUTES.HOME);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading('loggingOut', false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Update URL with tab parameter without full page reload
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
  };

  const showRequestModal = modal?.type === 'requestRentCard';

  return (
    <LandlordLayout>
      <header className="mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Individual Landlord Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1 md:mt-2">
          Professional tools to compete with corporate efficiency while maintaining your personal touch
        </p>
      </header>

      {/* Dashboard Tabs */}
      <div className="flex border-b mb-6 overflow-x-auto">
        <button
          className={`px-4 py-2 font-medium text-sm sm:text-base whitespace-nowrap ${
            activeTab === 'overview' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => handleTabChange('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm sm:text-base whitespace-nowrap ${
            activeTab === 'properties' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => handleTabChange('properties')}
        >
          Properties
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm sm:text-base whitespace-nowrap ${
            activeTab === 'interests' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => handleTabChange('interests')}
        >
          Interests
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm sm:text-base whitespace-nowrap ${
            activeTab === 'analytics' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => handleTabChange('analytics')}
          data-testid="tab-analytics"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
            <ComingSoonBadge type="analytics" size="sm" title="Beta" />
          </div>
        </button>
      </div>

      {activeTab === 'overview' && (
        <OverviewTab
          totalViews={totalViews}
          totalSubmissions={totalSubmissions}
          activeProperties={activeProperties}
          generalScreening={generalScreening}
          generalScreeningLoading={generalScreeningLoading}
          openModal={openModal}
          setLocation={setLocation}
        />
      )}

      {activeTab === 'properties' && (
        <PropertiesTab
          properties={properties}
          propertiesLoading={propertiesLoading}
          toggleArchivePropertyPending={toggleArchiveProperty.isPending}
          handleArchiveToggle={handleArchiveToggle}
          setLocation={setLocation}
        />
      )}

      {activeTab === 'interests' && (
        <InterestsTab
          openModal={openModal}
          setLocation={setLocation}
        />
      )}

      {activeTab === 'analytics' && (
        <div className="mt-6">
          {isLandlordProfileLoading ? (
            <div className="space-y-4">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-32 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-32 w-full bg-gray-200 rounded animate-pulse" />
            </div>
          ) : landlordProfileError ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-red-600 mb-2">Profile Error</h3>
                <p className="text-gray-500">Unable to load landlord profile. Please try refreshing the page.</p>
              </div>
            </div>
          ) : landlordProfile?.id ? (
            <LandlordAnalyticsDashboard landlordId={landlordProfile.id} />
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-600 mb-2">Profile Incomplete</h3>
                <p className="text-gray-500 mb-4">Please complete your landlord profile to view analytics.</p>
                <button 
                  onClick={() => setLocation('/landlord/profile')}
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                  data-testid="button-complete-profile"
                >
                  Complete Profile
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <RequestModal />
    </LandlordLayout>
  );
};

export default LandlordDashboard;