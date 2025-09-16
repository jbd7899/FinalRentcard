import { useQuery } from "@tanstack/react-query";
import TenantLayout from "@/components/layouts/TenantLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Clock, MessageCircle, Archive, Eye, Mail, Heart, AlertCircle } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/stores/authStore";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

interface TenantInterest {
  id: number;
  tenantId: number | null;
  propertyId: number | null;
  landlordId: number;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    preferredContact: 'email' | 'phone' | 'text';
  };
  message: string | null;
  status: 'new' | 'contacted' | 'archived';
  createdAt: string;
  viewedAt: string | null;
  property: {
    address: string;
    rent: number;
  } | null;
  isGeneral: boolean;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'contacted':
      return <MessageCircle className="h-4 w-4 text-green-500" />;
    case 'archived':
      return <Archive className="h-4 w-4 text-gray-500" />;
    default:
      return <Clock className="h-4 w-4 text-blue-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'contacted':
      return 'bg-green-100 text-green-800';
    case 'archived':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

function InterestCard({ interest }: { interest: TenantInterest }) {
  return (
    <Card data-testid={`card-interest-${interest.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Heart className="h-5 w-5 text-red-500" />
            <div>
              <CardTitle className="text-lg">
                {interest.isGeneral ? 'General Interest' : (interest.property?.address || 'Property Interest')}
              </CardTitle>
              <CardDescription>
                {interest.property && `$${interest.property.rent}/month`}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(interest.status)}
            <Badge className={getStatusColor(interest.status)}>
              {interest.status.charAt(0).toUpperCase() + interest.status.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-500">
          Interest submitted: {new Date(interest.createdAt).toLocaleDateString()}
        </div>
        
        {interest.message && (
          <div className="text-sm text-gray-600">
            <strong>Message:</strong> {interest.message}
          </div>
        )}
        
        <div className="text-sm text-gray-500">
          Contact preference: <span className="capitalize">{interest.contactInfo.preferredContact}</span>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" data-testid={`button-contact-${interest.id}`}>
            <Mail className="h-4 w-4 mr-2" />
            Contact Landlord
          </Button>
          <Button variant="outline" size="sm" data-testid={`button-view-${interest.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Property
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TenantInterestsPage() {
  const { user } = useAuthStore();

  // Fetch tenant's interests using React Query
  const { data: interests = [], isLoading, error } = useQuery({
    queryKey: ['/api/interests'],
    enabled: !!user // Only fetch if user is authenticated
  });

  // Ensure interests is always an array and perform filtering safely
  const safeInterests = Array.isArray(interests) ? interests : [];
  const newInterests = safeInterests.filter((interest: TenantInterest) => interest.status === 'new');
  const contactedInterests = safeInterests.filter((interest: TenantInterest) => interest.status === 'contacted');
  const archivedInterests = safeInterests.filter((interest: TenantInterest) => interest.status === 'archived');

  // Handle loading state
  if (isLoading) {
    return (
      <TenantLayout activeRoute={ROUTES.TENANT.INTERESTS}>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-page-title">Your Interests</h1>
              <p className="text-gray-500 mt-1">
                View the properties you've expressed interest in and track landlord contact
              </p>
            </div>
          </div>

          {/* Loading Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Skeleton className="h-8 w-8 mr-3" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Loading Interests List */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-96 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </div>
        </div>
      </TenantLayout>
    );
  }

  // Handle error state
  if (error) {
    return (
      <TenantLayout activeRoute={ROUTES.TENANT.INTERESTS}>
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load interests</h3>
              <p className="text-gray-500">
                {error instanceof Error ? error.message : 'An error occurred while fetching your interests'}
              </p>
            </div>
          </div>
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout activeRoute={ROUTES.TENANT.INTERESTS}>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Your Interests</h1>
            <p className="text-gray-500 mt-1">
              View the properties you've expressed interest in and track landlord contact
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Interests</CardTitle>
              <CardDescription>Properties you're interested in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-500 mr-3" />
                <span className="text-3xl font-bold" data-testid="text-total-count">{safeInterests.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">New</CardTitle>
              <CardDescription>Awaiting landlord contact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-500 mr-3" />
                <span className="text-3xl font-bold" data-testid="text-new-count">{newInterests.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Contacted</CardTitle>
              <CardDescription>Landlord has reached out</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-green-500 mr-3" />
                <span className="text-3xl font-bold" data-testid="text-contacted-count">{contactedInterests.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interests List */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold" data-testid="text-interests-title">
              Your Property Interests
            </h2>
            <p className="text-gray-500 mt-1">
              Properties you've expressed interest in and their contact status
            </p>
          </div>

          {safeInterests.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No interests yet</h3>
              <p className="text-gray-500 mt-2">You haven't expressed interest in any properties yet. Browse properties to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {safeInterests.map((interest: TenantInterest) => (
                <InterestCard key={interest.id} interest={interest} />
              ))}
            </div>
          )}
        </div>
      </div>
    </TenantLayout>
  );
}

export default TenantInterestsPage;