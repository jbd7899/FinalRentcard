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

const ApplicationManagement = () => {
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showReferences, setShowReferences] = useState(false);

  // Demo data
  const applications = [
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
            payment: "Always on time",
            propertyCondition: "Excellent",
            comments: "Excellent tenant, kept property in pristine condition.",
            verified: true
          },
          {
            name: "Emily Davis",
            property: "Riverfront Residences",
            dates: "Mar 2020 - Dec 2022",
            rating: 4.8,
            payment: "Always on time",
            propertyCondition: "Good",
            comments: "Very responsible tenant, would rent to again.",
            verified: true
          }
        ],
        employment: "Full-time (3+ years)",
        moveIn: "March 1, 2025"
      },
      property: "123 Main Street Unit A",
      status: "new",
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
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewing">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
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
                      <Badge variant={app.status === 'new' ? 'default' : 'secondary'}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
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
    </div>
  );
};

export default ApplicationManagement;
