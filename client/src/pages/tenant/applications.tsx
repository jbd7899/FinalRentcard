import { useQuery } from "@tanstack/react-query";
import TenantLayout from "@/components/layouts/TenantLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Clock, CheckCircle, AlertCircle, Eye, FileText } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/stores/authStore";

interface Application {
  id: number;
  property: string;
  landlord: string;
  status: string;
  submittedAt: string;
  requirements: {
    creditScore: string;
    income: string;
    employment: string;
    references: string;
  };
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'reviewing':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'rejected':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'reviewing':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

function ApplicationCard({ application }: { application: Application }) {
  return (
    <Card data-testid={`card-application-${application.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="h-5 w-5 text-gray-500" />
            <div>
              <CardTitle className="text-lg">{application.property}</CardTitle>
              <CardDescription>Landlord: {application.landlord}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(application.status)}
            <Badge className={getStatusColor(application.status)}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-500">
          Submitted: {new Date(application.submittedAt).toLocaleDateString()}
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Requirements Status:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>{application.requirements.creditScore}</div>
            <div>{application.requirements.income}</div>
            <div>{application.requirements.employment}</div>
            <div>{application.requirements.references}</div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" data-testid={`button-view-${application.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm" data-testid={`button-documents-${application.id}`}>
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TenantApplicationsPage() {
  const { user } = useAuthStore();

  // Mock data for now - in a real app this would fetch from the API
  const applications: Application[] = [
    {
      id: 1,
      property: "123 Main Street Unit A",
      landlord: "John Smith",
      status: "reviewing",
      submittedAt: "2025-02-18T10:30:00",
      requirements: {
        creditScore: "✓ Meets requirement",
        income: "✓ 3.5x monthly rent",
        employment: "✓ Verified",
        references: "✓ 2 verified references"
      }
    },
    {
      id: 2,
      property: "456 Oak Avenue Unit 2B",
      landlord: "Sarah Johnson",
      status: "approved",
      submittedAt: "2025-02-15T14:20:00",
      requirements: {
        creditScore: "✓ Excellent score",
        income: "✓ 4x monthly rent",
        employment: "✓ Verified",
        references: "✓ 3 verified references"
      }
    },
    {
      id: 3,
      property: "789 Pine Street Apartment 3",
      landlord: "Mike Chen",
      status: "rejected",
      submittedAt: "2025-02-10T09:15:00",
      requirements: {
        creditScore: "✗ Below requirement",
        income: "✓ Meets requirement",
        employment: "✓ Verified",
        references: "✓ 2 verified references"
      }
    }
  ];

  const activeApplications = applications.filter(app => app.status === 'reviewing');
  const approvedApplications = applications.filter(app => app.status === 'approved');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

  return (
    <TenantLayout activeRoute={ROUTES.TENANT.INTERESTS}>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Applications</h1>
            <p className="text-gray-500 mt-1">
              Track your rental applications and their status
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Applications</CardTitle>
              <CardDescription>All submitted applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-500 mr-3" />
                <span className="text-3xl font-bold" data-testid="text-total-count">{applications.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Under Review</CardTitle>
              <CardDescription>Applications being processed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500 mr-3" />
                <span className="text-3xl font-bold" data-testid="text-reviewing-count">{activeApplications.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Approved</CardTitle>
              <CardDescription>Successful applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                <span className="text-3xl font-bold" data-testid="text-approved-count">{approvedApplications.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Rejected</CardTitle>
              <CardDescription>Declined applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
                <span className="text-3xl font-bold" data-testid="text-rejected-count">{rejectedApplications.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Tabs */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all" data-testid="tab-all">
                All Applications
                <Badge variant="secondary" className="ml-2">{applications.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="reviewing" data-testid="tab-reviewing">
                Under Review
                <Badge variant="secondary" className="ml-2">{activeApplications.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="approved" data-testid="tab-approved">
                Approved
                <Badge variant="secondary" className="ml-2">{approvedApplications.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="rejected" data-testid="tab-rejected">
                Rejected
                <Badge variant="secondary" className="ml-2">{rejectedApplications.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No applications found</h3>
                  <p className="text-gray-500 mt-2">You haven't submitted any rental applications yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {applications.map(application => (
                    <ApplicationCard key={application.id} application={application} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviewing" className="mt-0">
              {activeApplications.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No applications under review</h3>
                  <p className="text-gray-500 mt-2">You don't have any applications currently being reviewed.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {activeApplications.map(application => (
                    <ApplicationCard key={application.id} application={application} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved" className="mt-0">
              {approvedApplications.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No approved applications</h3>
                  <p className="text-gray-500 mt-2">You don't have any approved applications yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {approvedApplications.map(application => (
                    <ApplicationCard key={application.id} application={application} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="mt-0">
              {rejectedApplications.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No rejected applications</h3>
                  <p className="text-gray-500 mt-2">You don't have any rejected applications.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {rejectedApplications.map(application => (
                    <ApplicationCard key={application.id} application={application} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TenantLayout>
  );
}

export default TenantApplicationsPage;