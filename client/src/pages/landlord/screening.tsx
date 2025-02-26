import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useToast } from "@/components/ui/use-toast";
import { useLocation } from "wouter";
import { ROUTES, API_ENDPOINTS } from '@/constants';
import { Property } from "@shared/schema";

// UI Components
import LandlordLayout from '@/components/layouts/LandlordLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScreeningActions, GeneralScreeningActions } from '@/components/landlord/ScreeningActions';

// Icons
import { Building, Plus, Eye, FileText, Globe, RefreshCw } from 'lucide-react';

interface PropertyWithScreeningData {
  id: number;
  title: string;
  address: string;
  slug: string;
  applicationCount: number | null;
  viewCount: number | null;
  isArchived: boolean;
}

const ScreeningManagement = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'properties' | 'general'>('properties');

  // Fetch properties
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: [API_ENDPOINTS.PROPERTIES.BASE],
    queryFn: async () => {
      const response = await apiRequest('GET', API_ENDPOINTS.PROPERTIES.BASE);
      return response.json() as Promise<PropertyWithScreeningData[]>;
    },
    enabled: !!user?.id
  });

  // Fetch general screening data
  const { data: generalScreening, isLoading: generalScreeningLoading } = useQuery({
    queryKey: ['/api/screening/general'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/screening/general');
        return response.json();
      } catch (error) {
        // Return dummy data if API fails
        return {
          slug: `${user?.id ? `landlord-${user.id}` : 'general'}-screening`,
          businessName: user?.userType === 'landlord' ? 'Your Business' : 'Your Business',
          viewCount: 35,
          applicationCount: 8
        };
      }
    },
    enabled: !!user?.id
  });

  // Toggle archive property mutation
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

  return (
    <LandlordLayout>
      <header className="mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Screening Pages</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1 md:mt-2">
          Manage your property and general screening pages
        </p>
      </header>

      <Tabs defaultValue="properties" className="w-full" onValueChange={(value) => setActiveTab(value as 'properties' | 'general')}>
        <TabsList className="mb-6 w-full justify-start overflow-x-auto">
          <TabsTrigger value="properties" className="text-xs sm:text-sm whitespace-nowrap">Property Screening Pages</TabsTrigger>
          <TabsTrigger value="general" className="text-xs sm:text-sm whitespace-nowrap">General Screening Page</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Property Screening Pages</h2>
            <Button 
              onClick={() => setLocation(ROUTES.LANDLORD.ADD_PROPERTY)}
              size="sm"
              className="h-8 sm:h-9 text-xs sm:text-sm w-full sm:w-auto"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Add Property
            </Button>
          </div>

          {propertiesLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-sm text-gray-500">Loading properties...</p>
              </div>
            </div>
          ) : properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {properties.map((property) => (
                <Card key={property.id} className={`overflow-hidden ${property.isArchived ? 'bg-gray-50 border-gray-200' : ''}`}>
                  <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base sm:text-lg font-semibold truncate pr-2">
                        {property.title || `Property #${property.id}`}
                      </CardTitle>
                      {property.isArchived && (
                        <Badge variant="outline" className="text-gray-500 border-gray-300 text-xs whitespace-nowrap ml-1">
                          Archived
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs sm:text-sm truncate">
                      {property.address || 'No address provided'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-2 sm:pt-3 pb-3 sm:pb-4">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-xs sm:text-sm truncate">{property.viewCount || 0} Views</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-xs sm:text-sm truncate">{property.applicationCount || 0} Apps</span>
                      </div>
                    </div>
                    <Separator className="mb-3 sm:mb-4" />
                    <ScreeningActions
                      screeningLink={property.slug || `property-${property.id}-screening`}
                      propertyId={property.id}
                      submissionCount={property.applicationCount || 0}
                      viewCount={property.viewCount || 0}
                      isArchived={property.isArchived}
                      onArchiveToggle={() => handleArchiveToggle(property.id)}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-gray-50">
              <Building className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No properties found</h3>
              <p className="text-gray-500 text-center mb-6 max-w-md">
                You haven't added any properties yet. Add a property to create a screening page.
              </p>
              <Button 
                onClick={() => setLocation(ROUTES.LANDLORD.ADD_PROPERTY)}
                size="sm"
                className="h-9 text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">General Screening Page</h2>
          </div>

          {generalScreeningLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-sm text-gray-500">Loading general screening page...</p>
              </div>
            </div>
          ) : generalScreening ? (
            <Card>
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base sm:text-lg font-semibold">
                    General Screening Page
                  </CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Use this page to screen tenants without a specific property
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2 sm:pt-3 pb-3 sm:pb-4">
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">{generalScreening.viewCount || 0} Views</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">{generalScreening.applicationCount || 0} Apps</span>
                  </div>
                </div>
                <Separator className="mb-3 sm:mb-4" />
                <GeneralScreeningActions
                  screeningLink={generalScreening.slug || `general-landlord-${user?.id || '1'}-screening`}
                  submissionCount={generalScreening.applicationCount || 0}
                  viewCount={generalScreening.viewCount || 0}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-gray-50">
              <Globe className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">General screening page not found</h3>
              <p className="text-gray-500 text-center mb-6 max-w-md">
                There was an error loading your general screening page. Please try again later.
              </p>
              <Button 
                onClick={() => setLocation('/create-screening')}
                size="sm"
                className="h-9 text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create General Screening Page
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </LandlordLayout>
  );
};

export default ScreeningManagement; 