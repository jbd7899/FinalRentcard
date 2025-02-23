import React, { useState } from 'react';
import {
  Star,
  CheckCircle,
  AlertCircle,
  Clock,
  Mail,
  Phone,
  DollarSign,
  FileText,
  Building2,
  ExternalLink,
  Archive
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { apiRequest } from '@/lib/queryClient';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  APPLICATION_STATUS, 
  APPLICATION_LABELS, 
  MESSAGES,
  type ApplicationStatus 
} from '@/constants';
import { Dialog, DialogContent } from "@/components/ui/dialog";

type StatusFilter = ApplicationStatus | 'all';

interface Application {
  id: number;
  tenant: {
    name: string;
    email: string;
    phone: string;
    creditScore: string;
    income: string;
    score: number;
    references: Array<{
      name: string;
      property: string;
      dates: string;
      rating: number;
      payment: keyof typeof APPLICATION_LABELS.PAYMENT_HISTORY;
      propertyCondition: keyof typeof APPLICATION_LABELS.PROPERTY_CONDITION;
      comments: string;
      verified: boolean;
    }>;
    employment: string;
    moveIn: string;
  };
  property: string;
  status: ApplicationStatus;
  submittedAt: string;
  matchScore: number;
}

const ApplicationManagement = () => {
  const { 
    modal, 
    openModal, 
    closeModal, 
    setLoading, 
    loadingStates, 
    addToast,
    applications: {
      selectedProperty,
      selectedStatus,
      showReferences,
      setSelectedProperty,
      setSelectedStatus,
      setShowReferences
    }
  } = useUIStore();
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const handleStatusChange = (status: ApplicationStatus | 'all') => {
    setSelectedStatus(status);
  };

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject') => {
    setLoading(`application-${action}-${applicationId}`, true);
    try {
      await apiRequest('POST', `/api/applications/${applicationId}/${action}`);
      addToast({
        title: 'Success',
        description: `Application ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
        type: 'success'
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process application',
        type: 'error'
      });
    } finally {
      setLoading(`application-${action}-${applicationId}`, false);
    }
  };

  // Demo data
  const applications: Application[] = [
    {
      id: 1,
      tenant: {
        name: "Sarah Anderson",
        email: "sarah@email.com",
        phone: "(555) 123-4567",
        creditScore: "720-750",
        income: "85,000",
        score: 4.9,
        references: [
          {
            name: "Robert Wilson",
            property: "Parkview Apartments",
            dates: "Jan 2023 - Dec 2024",
            rating: 5,
            payment: "ON_TIME",
            propertyCondition: "EXCELLENT",
            comments: "Excellent tenant, kept property in pristine condition.",
            verified: true
          },
          {
            name: "Emily Davis",
            property: "Riverfront Residences",
            dates: "Mar 2020 - Dec 2022",
            rating: 4.8,
            payment: "ON_TIME",
            propertyCondition: "GOOD",
            comments: "Very responsible tenant, would rent to again.",
            verified: true
          }
        ],
        employment: "Full-time (3+ years)",
        moveIn: "March 1, 2025"
      },
      property: "123 Main Street Unit A",
      status: APPLICATION_STATUS.NEW,
      submittedAt: "2025-02-19T10:30:00",
      matchScore: 95
    }
  ];

  const ReferencesSection = ({ references }: { references: any[] }) => (
    <div className="space-y-4">
      {references.map((ref, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium">{ref.name}</h4>
                <p className="text-sm text-muted-foreground">{ref.property}</p>
                <p className="text-sm text-muted-foreground">{ref.dates}</p>
              </div>
              <div className="flex items-center">
                {ref.verified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-sm text-muted-foreground">Payment History</p>
                <p className="font-medium">{ref.payment}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Property Condition</p>
                <p className="font-medium">{ref.propertyCondition}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Landlord Comments</p>
              <p className="text-sm mt-1">{ref.comments}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Application Management</h1>
            <p className="text-muted-foreground">Review and process RentCard applications</p>
          </div>
          <div className="flex gap-4">
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="123-main">123 Main Street Unit A</SelectItem>
                <SelectItem value="456-oak">456 Oak Avenue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {(Object.values(APPLICATION_STATUS) as ApplicationStatus[]).map((status) => (
                  <SelectItem key={status} value={status}>
                    {APPLICATION_LABELS.STATUS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        {/* Applications List */}
        <Card className="col-span-5">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <CardContent className="pt-6">
              {applications.map((app) => (
                <div 
                  key={app.id}
                  onClick={() => {
                    setSelectedApplication(app);
                    setShowReferences(false);
                  }}
                  className={`p-4 cursor-pointer hover:bg-accent rounded-lg transition-colors ${
                    selectedApplication?.id === app.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{app.tenant.name}</h3>
                      <p className="text-sm text-muted-foreground">{app.property}</p>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1">{app.tenant.score}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant={app.status === APPLICATION_STATUS.NEW ? 'default' : 'secondary'}>
                        {APPLICATION_LABELS.STATUS[app.status]}
                      </Badge>
                      {app.tenant.references?.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {app.tenant.references.length} references
                        </span>
                      )}
                    </div>
                    <span className="text-sm">
                      <span className="text-primary font-medium">{app.matchScore}%</span>
                      <span className="text-muted-foreground ml-1">match</span>
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </ScrollArea>
        </Card>

        {/* Application Details */}
        {selectedApplication ? (
          <Card className="col-span-7">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold">{selectedApplication.tenant.name}</h2>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Verified Profile
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{selectedApplication.property}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <a href={`mailto:${selectedApplication.tenant.email}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </a>
                  </Button>
                  <Button>
                    <FileText className="w-4 h-4 mr-2" />
                    View RentCard
                  </Button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedApplication.tenant.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedApplication.tenant.phone}</span>
                </div>
              </div>

              {/* Qualifications Summary */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Credit Score</p>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>{selectedApplication.tenant.creditScore}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Annual Income</p>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-primary mr-1" />
                        <span>${selectedApplication.tenant.income}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Employment</p>
                      <span>{selectedApplication.tenant.employment}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* References or Details */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">
                    {showReferences ? 'Landlord References' : 'Application Details'}
                  </h3>
                  {selectedApplication.tenant.references?.length > 0 && (
                    <Button 
                      variant="link"
                      onClick={() => setShowReferences(!showReferences)}
                    >
                      {showReferences ? 'View Details' : 'View References'}
                    </Button>
                  )}
                </div>

                {showReferences ? (
                  <ReferencesSection references={selectedApplication.tenant.references} />
                ) : (
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>Desired Move-in Date</span>
                          </div>
                          <span>{selectedApplication.tenant.moveIn}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span>Rental Score</span>
                          </div>
                          <span>{selectedApplication.tenant.score} / 5.0</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-primary" />
                            <span>Verified References</span>
                          </div>
                          <span>{selectedApplication.tenant.references?.length || 0} references</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="mt-8 flex gap-4">
                  <Button variant="outline" className="flex-1">
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </Button>
                  <Button className="flex-1">
                    Approve Application
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="col-span-7 flex items-center justify-center">
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Application Selected</h3>
              <p className="text-muted-foreground">Select an application from the list to view details</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog 
        open={modal?.type === 'applicationDetails'} 
        onOpenChange={() => closeModal()}
      >
        <DialogContent className="max-w-3xl">
          {/* ... existing dialog content ... */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationManagement;
