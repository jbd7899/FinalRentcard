import { useQuery } from "@tanstack/react-query";
import TenantLayout from "@/components/layouts/TenantLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Clock, MessageCircle, Archive, Eye, Mail, Heart } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/stores/authStore";

interface Interest {
  id: number;
  property: string;
  landlord: string;
  landlordEmail: string;
  status: 'new' | 'contacted' | 'archived';
  submittedAt: string;
  notes?: string;
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

function InterestCard({ interest }: { interest: Interest }) {
  return (
    <Card data-testid={`card-interest-${interest.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Heart className="h-5 w-5 text-red-500" />
            <div>
              <CardTitle className="text-lg">{interest.property}</CardTitle>
              <CardDescription>Landlord: {interest.landlord}</CardDescription>
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
          Interest submitted: {new Date(interest.submittedAt).toLocaleDateString()}
        </div>
        
        {interest.notes && (
          <div className="text-sm text-gray-600">
            <strong>Notes:</strong> {interest.notes}
          </div>
        )}
        
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

  // Mock data for now - in a real app this would fetch from the API
  const interests: Interest[] = [
    {
      id: 1,
      property: "123 Main Street Unit A",
      landlord: "John Smith",
      landlordEmail: "john.smith@email.com",
      status: "new",
      submittedAt: "2025-02-18T10:30:00",
      notes: "Interested in this beautiful apartment with great location"
    },
    {
      id: 2,
      property: "456 Oak Avenue Unit 2B",
      landlord: "Sarah Johnson",
      landlordEmail: "sarah.johnson@email.com",
      status: "contacted",
      submittedAt: "2025-02-15T14:20:00"
    },
    {
      id: 3,
      property: "789 Pine Street Apartment 3",
      landlord: "Mike Chen",
      landlordEmail: "mike.chen@email.com",
      status: "archived",
      submittedAt: "2025-02-10T09:15:00",
      notes: "Property no longer available"
    }
  ];

  const newInterests = interests.filter(interest => interest.status === 'new');
  const contactedInterests = interests.filter(interest => interest.status === 'contacted');
  const archivedInterests = interests.filter(interest => interest.status === 'archived');

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
                <span className="text-3xl font-bold" data-testid="text-total-count">{interests.length}</span>
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

          {interests.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No interests yet</h3>
              <p className="text-gray-500 mt-2">You haven't expressed interest in any properties yet. Browse properties to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {interests.map(interest => (
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