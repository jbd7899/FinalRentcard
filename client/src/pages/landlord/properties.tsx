import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS } from '@/constants/api';
import LandlordLayout from '@/components/layouts/LandlordLayout';
import PropertiesTab from '@/components/landlord/dashboard/PropertiesTab';
import { Property } from '@shared/schema';
import { useLocation } from 'wouter';

interface PropertyWithCount extends Omit<Property, 'isArchived'> {
  /** Number of applications submitted for this property */
  applicationCount: number | null;
  /** Number of times the property's screening page has been viewed */
  viewCount: number | null;
  /** Whether the property is archived */
  isArchived: boolean;
}

const LandlordPropertiesPage = () => {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: [API_ENDPOINTS.PROPERTIES.BASE],
    queryFn: async () => {
      const response = await apiRequest('GET', API_ENDPOINTS.PROPERTIES.BASE);
      return response.json() as Promise<PropertyWithCount[]>;
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (propertyId: number) => {
      const response = await apiRequest('PATCH', API_ENDPOINTS.PROPERTIES.UPDATE(propertyId), {
        isArchived: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PROPERTIES.BASE] });
    },
  });

  const handleArchiveToggle = (propertyId: number) => {
    archiveMutation.mutate(propertyId);
  };

  if (propertiesLoading) {
    return (
      <LandlordLayout>
        <div className="p-6">
          <div className="flex items-center justify-center min-h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </LandlordLayout>
    );
  }

  return (
    <LandlordLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Properties</h1>
          <p className="text-gray-600">Manage your rental properties and listings</p>
        </div>

        <PropertiesTab 
          properties={properties}
          propertiesLoading={propertiesLoading}
          toggleArchivePropertyPending={archiveMutation.isPending}
          handleArchiveToggle={handleArchiveToggle}
          setLocation={setLocation}
        />
      </div>
    </LandlordLayout>
  );
};

export default LandlordPropertiesPage;