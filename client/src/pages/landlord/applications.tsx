import React, { useState } from 'react';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Building2,
  ExternalLink,
  Archive,
  User
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
  INTEREST_STATUS, 
  INTEREST_LABELS, 
  MESSAGES,
  type InterestStatus 
} from '@/constants';
import Navbar from "@/components/shared/navbar";
import LandlordLayout from '@/components/layouts/LandlordLayout';

type StatusFilter = InterestStatus | 'all';

interface Interest {
  id: number;
  tenant: {
    name: string;
    email: string;
    phone: string;
    preferredContact: 'email' | 'phone' | 'text';
    hasRentCard: boolean;
  };
  property?: string; // undefined for general interests
  propertyId?: number;
  message: string;
  status: InterestStatus;
  submittedAt: string;
  isGeneral: boolean; // true for general interests, false for property-specific
}

const InterestInbox = () => {
  const { 
    setLoading, 
    loadingStates, 
    addToast,
    applications: {
      selectedStatus,
      setSelectedStatus,
      setShowReferences
    }
  } = useUIStore();
  const [selectedInterest, setSelectedInterest] = useState<Interest | null>(null);

  const handleStatusChange = (status: InterestStatus | 'all') => {
    setSelectedStatus(status);
  };

  const handleInterestAction = async (applicationId: string, action: 'contact' | 'archive') => {
    setLoading(`interest-${action}-${applicationId}`, true);
    try {
      await apiRequest('POST', `/api/interests/${applicationId}/${action}`);
      addToast({
        title: 'Success',
        description: `Interest ${action === 'contact' ? 'marked as contacted' : 'archived'} successfully`,
        type: 'success'
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process interest',
        type: 'error'
      });
    } finally {
      setLoading(`interest-${action}-${applicationId}`, false);
    }
  };

  // Demo data
  const interests: Interest[] = [
    {
      id: 1,
      tenant: {
        name: "Sarah Anderson",
        email: "sarah@email.com",
        phone: "(555) 123-4567",
        preferredContact: "email",
        hasRentCard: true
      },
      property: "123 Main Street Unit A",
      propertyId: 1,
      message: "Hi! I'm very interested in this 2-bedroom unit. I'm looking to move in around March 1st. I have excellent references and would love to schedule a viewing.",
      status: INTEREST_STATUS.NEW,
      submittedAt: "2025-02-19T10:30:00",
      isGeneral: false
    },
    {
      id: 2,
      tenant: {
        name: "Michael Chen",
        email: "m.chen@email.com",
        phone: "(555) 987-6543",
        preferredContact: "phone",
        hasRentCard: false
      },
      property: "456 Oak Avenue Unit 2B",
      propertyId: 2,
      message: "I saw your listing and it looks perfect for my family. Could we arrange a showing this weekend?",
      status: INTEREST_STATUS.NEW,
      submittedAt: "2025-02-19T14:15:00",
      isGeneral: false
    },
    {
      id: 3,
      tenant: {
        name: "Emily Rodriguez",
        email: "emily.r@email.com",
        phone: "(555) 456-7890",
        preferredContact: "text",
        hasRentCard: true
      },
      message: "I'm looking for a 1-2 bedroom apartment in your portfolio. Flexible on location, budget around $1500-2000. Please let me know what you have available.",
      status: INTEREST_STATUS.CONTACTED,
      submittedAt: "2025-02-18T16:45:00",
      isGeneral: true
    },
    {
      id: 4,
      tenant: {
        name: "David Thompson",
        email: "d.thompson@email.com",
        phone: "(555) 321-0987",
        preferredContact: "email",
        hasRentCard: false
      },
      property: "789 Pine Street Studio",
      propertyId: 3,
      message: "Is this studio still available? I'm a graduate student looking for something close to campus.",
      status: INTEREST_STATUS.ARCHIVED,
      submittedAt: "2025-02-17T09:30:00",
      isGeneral: false
    }
  ];


  return (
    <LandlordLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Interest Inbox</h1>
            <p className="text-gray-500 mt-1">
              Manage tenant interest submissions and contact requests
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedStatus} onValueChange={handleStatusChange} data-testid="select-status-filter">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Interests</SelectItem>
                <SelectItem value={INTEREST_STATUS.NEW}>New</SelectItem>
                <SelectItem value={INTEREST_STATUS.CONTACTED}>Contacted</SelectItem>
                <SelectItem value={INTEREST_STATUS.ARCHIVED}>Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
          {/* Interests List */}
          <Card className="col-span-5">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <CardContent className="pt-6">
                {interests.map((interest) => (
                  <div 
                    key={interest.id}
                    onClick={() => {
                      setSelectedInterest(interest);
                      setShowReferences(false);
                    }}
                    className={`p-4 cursor-pointer hover:bg-accent rounded-lg transition-colors ${
                      selectedInterest?.id === interest.id ? 'bg-accent' : ''
                    }`}
                    data-testid={`interest-item-${interest.id}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{interest.tenant.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {interest.isGeneral ? 'General Interest' : interest.property}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {interest.tenant.hasRentCard ? (
                          <FileText className="w-4 h-4 text-primary" />
                        ) : (
                          <User className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant={interest.status === INTEREST_STATUS.NEW ? 'default' : 'secondary'}>
                          {INTEREST_LABELS.STATUS[interest.status]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {interest.tenant.preferredContact} preferred
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(interest.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </ScrollArea>
          </Card>

          {/* Interest Details */}
          {selectedInterest ? (
            <Card className="col-span-7">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold">{selectedInterest.tenant.name}</h2>
                      {selectedInterest.tenant.hasRentCard && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          <FileText className="w-3 h-3 mr-1" />
                          Has RentCard
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      {selectedInterest.isGeneral ? 'General Portfolio Interest' : selectedInterest.property}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" asChild data-testid="button-email-tenant">
                      <a href={`mailto:${selectedInterest.tenant.email}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </a>
                    </Button>
                    <Button variant="outline" asChild data-testid="button-call-tenant">
                      <a href={`tel:${selectedInterest.tenant.phone}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </a>
                    </Button>
                    <Button variant="outline" asChild data-testid="button-text-tenant">
                      <a href={`sms:${selectedInterest.tenant.phone}`}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Text
                      </a>
                    </Button>
                    {selectedInterest.tenant.hasRentCard && (
                      <Button data-testid="button-view-rentcard">
                        <FileText className="w-4 h-4 mr-2" />
                        View RentCard
                      </Button>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedInterest.tenant.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedInterest.tenant.phone}</span>
                  </div>
                </div>

                {/* Interest Message */}
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <h4 className="font-medium mb-3">Interest Message</h4>
                    <p className="text-muted-foreground">{selectedInterest.message}</p>
                  </CardContent>
                </Card>

                {/* Interest Details */}
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Preferred Contact</p>
                        <div className="flex items-center">
                          {selectedInterest.tenant.preferredContact === 'email' && <Mail className="w-4 h-4 text-primary mr-2" />}
                          {selectedInterest.tenant.preferredContact === 'phone' && <Phone className="w-4 h-4 text-primary mr-2" />}
                          {selectedInterest.tenant.preferredContact === 'text' && <MessageSquare className="w-4 h-4 text-primary mr-2" />}
                          <span className="capitalize">{selectedInterest.tenant.preferredContact}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Submitted</p>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-primary mr-2" />
                          <span>{new Date(selectedInterest.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Interest Actions */}
                <div className="mt-8 flex gap-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleInterestAction(selectedInterest.id.toString(), 'archive')}
                    data-testid="button-archive-interest"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archive Interest
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => handleInterestAction(selectedInterest.id.toString(), 'contact')}
                    data-testid="button-mark-contacted"
                  >
                    Mark as Contacted
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="col-span-7 flex items-center justify-center">
              <CardContent className="pt-12 pb-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Interest Selected</h3>
                <p className="text-muted-foreground">Select an interest from the list to view details and contact options</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

    </LandlordLayout>
  );
};

export default InterestInbox;
