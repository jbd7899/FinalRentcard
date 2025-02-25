import React from 'react';
import {
  Plus,
  Building,
  Edit,
  Loader2,
  Archive
} from 'lucide-react';
import { Link } from 'wouter';
import { ROUTES, generateRoute } from '@/constants';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScreeningActions } from '@/components/landlord/ScreeningActions';
import { Property } from "@shared/schema";

/**
 * @component PropertiesTab
 * 
 * @description
 * The PropertiesTab component displays and manages all properties owned by the landlord.
 * It provides functionality to view, edit, and toggle the archive status of properties.
 * Properties are divided into active and archived sections for better organization.
 * 
 * The component includes:
 * 1. A header with an "Add Property" button
 * 2. A list of active properties with their details
 * 3. A separate section for archived properties
 * 4. Actions for each property (view screening page, edit, archive/unarchive)
 * 5. Loading and empty states
 * 
 * @example
 * // To add a new property action:
 * // 1. Update the ScreeningActions component to include the new action
 * // 2. Pass any required handlers from the parent component
 * 
 * <PropertiesTab
 *   properties={properties}
 *   propertiesLoading={propertiesLoading}
 *   toggleArchivePropertyPending={toggleArchiveProperty.isPending}
 *   handleArchiveToggle={handleArchiveToggle}
 *   setLocation={setLocation}
 * />
 */

/**
 * Extended Property interface that includes application and view counts
 * as well as archive status for display in the dashboard
 */
interface PropertyWithCount extends Omit<Property, 'isArchived'> {
  /** Number of applications submitted for this property */
  applicationCount: number | null;
  /** Number of times the property's screening page has been viewed */
  viewCount: number | null;
  /** Whether the property is archived */
  isArchived: boolean;
}

/**
 * Props for the PropertiesTab component
 */
interface PropertiesTabProps {
  /** Array of properties with their counts and archive status */
  properties: PropertyWithCount[] | undefined;
  /** Loading state for properties data */
  propertiesLoading: boolean;
  /** Whether an archive toggle operation is in progress */
  toggleArchivePropertyPending: boolean;
  /** Function to toggle a property's archived status */
  handleArchiveToggle: (propertyId: number) => void;
  /** Function to navigate to a different route */
  setLocation: (path: string) => void;
}

/**
 * The PropertiesTab component for the landlord dashboard
 */
const PropertiesTab: React.FC<PropertiesTabProps> = ({
  properties,
  propertiesLoading,
  toggleArchivePropertyPending,
  handleArchiveToggle,
  setLocation,
}) => {
  /**
   * Renders the list of active properties
   * @returns JSX for active properties or null if none exist
   */
  const renderActiveProperties = () => {
    const activeProperties = properties?.filter(p => !p.isArchived) || [];
    
    if (activeProperties.length === 0) return null;
    
    return activeProperties.map((property) => (
      <Card key={property.id} className="shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <div className="flex justify-between items-start mb-4 sm:mb-5">
            <div>
              <h3 className="font-medium text-sm sm:text-base">{property.address}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-1.5">
                {property.bedrooms} bed • {property.bathrooms} bath • ${property.rent}/month
              </p>
            </div>
            <Link href={generateRoute.propertyEdit(property.id)}>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </Link>
          </div>

          <ScreeningActions
            screeningLink={property.screeningPageSlug || `property-${property.id}`}
            propertyId={property.id}
            submissionCount={property.applicationCount || 0}
            viewCount={property.viewCount || 0}
            isArchived={Boolean(property.isArchived)}
            onArchiveToggle={() => handleArchiveToggle(property.id)}
          />
        </CardContent>
      </Card>
    ));
  };

  /**
   * Renders the section of archived properties
   * @returns JSX for archived properties section or null if none exist
   */
  const renderArchivedProperties = () => {
    const archivedProperties = properties?.filter(p => p.isArchived) || [];
    
    if (archivedProperties.length === 0) return null;
    
    return (
      <div className="mt-8">
        <h3 className="text-sm sm:text-base font-medium mb-4 flex items-center">
          <Archive className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-muted-foreground" />
          Archived Properties
        </h3>
        <div className="space-y-4">
          {archivedProperties.map((property) => (
            <Card key={property.id} className="shadow-sm border-dashed border-muted">
              <CardContent className="p-5 sm:p-6">
                <div className="flex justify-between items-start mb-4 sm:mb-5">
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium text-sm sm:text-base text-muted-foreground">{property.address}</h3>
                      <span className="ml-2 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        Archived
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-1.5">
                      {property.bedrooms} bed • {property.bathrooms} bath • ${property.rent}/month
                    </p>
                  </div>
                  <Link href={generateRoute.propertyEdit(property.id)}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                      <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                  </Link>
                </div>

                <ScreeningActions
                  screeningLink={property.screeningPageSlug || `property-${property.id}`}
                  propertyId={property.id}
                  submissionCount={property.applicationCount || 0}
                  viewCount={property.viewCount || 0}
                  isArchived={Boolean(property.isArchived)}
                  onArchiveToggle={() => handleArchiveToggle(property.id)}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 sm:mb-5">
        <h2 className="text-base sm:text-lg font-semibold flex items-center">
          <Building className="w-5 h-5 mr-2 text-primary" />
          Property Screening Pages
        </h2>
        <Button 
          onClick={() => setLocation(ROUTES.LANDLORD.ADD_PROPERTY)} 
          className="text-xs sm:text-sm h-9 sm:h-10"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 sm:mr-3" />
          Add Property
        </Button>
      </div>

      <Card>
        <CardContent className="p-5 sm:p-6">
          {propertiesLoading || toggleArchivePropertyPending ? (
            <div className="flex items-center justify-center p-8 sm:p-10">
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-primary" />
            </div>
          ) : properties && properties.length > 0 ? (
            <div className="space-y-5 sm:space-y-6">
              {/* Active Properties */}
              {renderActiveProperties()}

              {/* Archived Properties Section */}
              {renderArchivedProperties()}
            </div>
          ) : (
            <div className="text-center p-8 sm:p-10">
              <Building className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4 sm:mb-5" />
              <p className="text-muted-foreground text-sm sm:text-base">No properties added yet</p>
              <Button 
                variant="link" 
                className="mt-2 sm:mt-3 text-xs sm:text-sm"
                onClick={() => setLocation(ROUTES.LANDLORD.ADD_PROPERTY)}
              >
                Add your first property
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertiesTab; 