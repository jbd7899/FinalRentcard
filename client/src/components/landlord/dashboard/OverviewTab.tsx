import React from 'react';
import {
  Plus,
  Building,
  Users,
  Eye,
  Clock,
  Globe,
  UserPlus,
  ClipboardCheck,
  HelpCircle,
  CheckSquare,
  Loader2
} from 'lucide-react';
import { ComingSoonBadge } from "@/components/ui/coming-soon";
import { Link } from 'wouter';
import { ROUTES } from '@/constants';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StatsCard from '@/components/landlord/StatsCard';
import { GeneralScreeningActions } from '@/components/landlord/ScreeningActions';
import { useAuthStore } from '@/stores/authStore';

/**
 * @component OverviewTab
 * 
 * @description
 * The OverviewTab component displays the main dashboard overview for landlords,
 * including statistics, quick actions, tips, and general screening information.
 * This is typically the first tab users see when accessing the landlord dashboard.
 * 
 * The component is organized into several sections:
 * 1. Landlord Workflow - Step-by-step guidance for landlords
 * 2. Activity Overview - Key statistics (views, submissions, properties)
 * 3. Quick Actions - Buttons for common tasks
 * 4. Landlord Tips - Best practices for property management
 * 5. General Screening Page - Information about the universal screening page
 * 
 * @example
 * // To add a new section to the overview tab:
 * // 1. Create a new section component or JSX structure
 * // 2. Add it to the component's return statement
 * 
 * <OverviewTab
 *   totalViews={totalViews}
 *   totalSubmissions={totalSubmissions}
 *   activeProperties={activeProperties}
 *   generalScreening={generalScreening}
 *   generalScreeningLoading={generalScreeningLoading}
 *   openModal={openModal}
 *   setLocation={setLocation}
 * />
 */
interface OverviewTabProps {
  /** Total number of screening page views across all properties */
  totalViews: number;
  /** Total number of tenant applications submitted */
  totalSubmissions: number;
  /** Number of active (non-archived) properties */
  activeProperties: number;
  /** General screening page data */
  generalScreening: any;
  /** Loading state for general screening data */
  generalScreeningLoading: boolean;
  /** Function to open a modal dialog */
  openModal: (modalType: string) => void;
  /** Function to navigate to a different route */
  setLocation: (path: string) => void;
}

/**
 * The OverviewTab component for the landlord dashboard
 */
const OverviewTab: React.FC<OverviewTabProps> = ({
  totalViews,
  totalSubmissions,
  activeProperties,
  generalScreening,
  generalScreeningLoading,
  openModal,
  setLocation,
}) => {
  const { user } = useAuthStore();

  return (
    <>
      {/* Landlord Workflow Section */}
      <div className="mb-8">
        <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center">
          <ClipboardCheck className="w-5 h-5 mr-2 text-primary" />
          Landlord Workflow
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-sm sm:text-base text-blue-800">1. List Properties</h3>
                  <p className="text-xs sm:text-sm text-blue-700 mt-1">
                    Add your properties and create screening pages
                  </p>
                  <Button 
                    variant="link" 
                    className="text-xs sm:text-sm text-blue-600 p-0 h-auto mt-2"
                    onClick={() => setLocation(ROUTES.LANDLORD.ADD_PROPERTY)}
                  >
                    Add a property →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-sm sm:text-base text-green-800">2. Screen Tenants</h3>
                  <p className="text-xs sm:text-sm text-green-700 mt-1">
                    Share your screening page or request RentCards
                  </p>
                  <Button 
                    variant="link" 
                    className="text-xs sm:text-sm text-green-600 p-0 h-auto mt-2"
                    onClick={() => openModal('requestRentCard')}
                  >
                    Request a RentCard →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-2 rounded-full">
                  <CheckSquare className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-sm sm:text-base text-purple-800">3. Review Applications</h3>
                  <p className="text-xs sm:text-sm text-purple-700 mt-1">
                    Verify documents and select qualified tenants
                  </p>
                  <Button 
                    variant="link" 
                    className="text-xs sm:text-sm text-purple-600 p-0 h-auto mt-2"
                    onClick={() => setLocation(ROUTES.LANDLORD.APPLICATIONS)}
                  >
                    View applications →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-8 mb-8 md:mb-10">
        <StatsCard
          title="Page Views"
          value={totalViews}
          description="Total screening page views"
          icon={<Eye className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />}
          type="views"
        />

        <StatsCard
          title="Total Submissions"
          value={totalSubmissions}
          description="From all properties"
          icon={<Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />}
          type="submissions"
        />

        <Card className="sm:col-span-2 md:col-span-1">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm sm:text-base">Active Properties</p>
                <p className="text-xl sm:text-2xl font-semibold mt-1 sm:mt-2">{activeProperties}</p>
                <Link href={ROUTES.LANDLORD.ADD_PROPERTY} className="text-xs sm:text-sm text-primary hover:underline cursor-pointer">
                  + Add Property
                </Link>
              </div>
              <Building className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 md:mb-10">
        <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-primary" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Button 
            variant="outline" 
            className="h-auto py-3 flex flex-col items-center justify-center gap-2 text-xs sm:text-sm"
            onClick={() => setLocation(ROUTES.LANDLORD.ADD_PROPERTY)}
          >
            <Plus className="h-5 w-5 text-blue-500" />
            Add Property
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto py-3 flex flex-col items-center justify-center gap-2 text-xs sm:text-sm"
            onClick={() => openModal('requestRentCard')}
          >
            <Plus className="h-5 w-5 text-green-500" />
            Request RentCard
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto py-3 flex flex-col items-center justify-center gap-2 text-xs sm:text-sm"
            onClick={() => setLocation(ROUTES.LANDLORD.APPLICATIONS)}
          >
            <Users className="h-5 w-5 text-amber-500" />
            View Applications
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto py-3 flex flex-col items-center justify-center gap-2 text-xs sm:text-sm relative"
            onClick={() => setLocation(ROUTES.LANDLORD.VERIFY_DOCUMENTS)}
          >
            <CheckSquare className="h-5 w-5 text-purple-500" />
            <div className="flex items-center gap-1">
              <span>Verify Documents</span>
              <ComingSoonBadge type="feature" size="sm" title="Beta" />
            </div>
          </Button>
        </div>
      </div>

      {/* Landlord Tips */}
      <Card className="bg-primary/5 mb-8 md:mb-10">
        <CardContent className="p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-5 flex items-center">
            <HelpCircle className="w-5 h-5 mr-2 text-primary" />
            Landlord Tips & Best Practices
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
            <div>
              <h3 className="font-medium text-sm sm:text-base mb-2 sm:mb-3">Effective Screening</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Set clear requirements and use RentCards to get verified tenant information. This reduces fraud and saves time.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-sm sm:text-base mb-2 sm:mb-3">Document Verification</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Always verify income documents and identification. Our system helps automate this process for accuracy.
              </p>
            </div>
            <div className="sm:col-span-2 md:col-span-1">
              <h3 className="font-medium text-sm sm:text-base mb-2 sm:mb-3">Fair Housing Compliance</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Apply the same screening criteria to all applicants to ensure fair housing compliance and avoid discrimination claims.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Screening Page Section */}
      <div className="mb-8 md:mb-10">
        <div className="flex justify-between items-center mb-4 sm:mb-5">
          <h2 className="text-base sm:text-lg font-semibold flex items-center">
            <Globe className="w-5 h-5 mr-2 text-primary" />
            General Screening Page
          </h2>
          <Button 
            onClick={() => openModal('requestRentCard')} 
            className="text-xs sm:text-sm h-9 sm:h-10"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 sm:mr-3" />
            Request RentCard
          </Button>
        </div>

        <Card>
          <CardContent className="p-5 sm:p-6">
            {generalScreeningLoading ? (
              <div className="flex items-center justify-center p-8 sm:p-10">
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-primary" />
              </div>
            ) : generalScreening ? (
              <Card className="shadow-sm">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex justify-between items-start mb-4 sm:mb-5">
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium text-sm sm:text-base">General Screening Page</h3>
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          Universal
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-1.5">
                        {generalScreening.businessName}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                        <span>{generalScreening.viewCount || 0}</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                        <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                        <span>{generalScreening.applicationCount || 0}</span>
                      </div>
                    </div>
                  </div>

                  <GeneralScreeningActions
                    screeningLink={generalScreening.slug || `landlord-${user?.id || '1'}-screening`}
                    submissionCount={generalScreening.applicationCount || 0}
                    viewCount={generalScreening.viewCount || 0}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="text-center p-8 sm:p-10">
                <Globe className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4 sm:mb-5" />
                <p className="text-muted-foreground text-sm sm:text-base">No general screening page set up yet</p>
                <Button 
                  variant="link" 
                  className="mt-2 sm:mt-3 text-xs sm:text-sm"
                  onClick={() => setLocation(ROUTES.LANDLORD.SCREENING)}
                >
                  Create your general screening page
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default OverviewTab; 