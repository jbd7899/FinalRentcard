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
import { useQuery, useMutation } from '@tanstack/react-query';
import { useUIStore } from '@/stores/uiStore';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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
import { Skeleton } from "@/components/ui/skeleton";

type StatusFilter = InterestStatus | 'all';

interface EnrichedInterest {
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
  status: InterestStatus;
  createdAt: string;
  viewedAt: string | null;
  property: {
    id: number;
    address: string;
    rent: number;
    bedrooms: number;
    bathrooms: number;
  } | null;
  isGeneral: boolean;
}

const InterestInbox = () => {
  const { 
    applications: {
      selectedStatus,
      setSelectedStatus,
      setShowReferences
    }
  } = useUIStore();
  const { toast } = useToast();
  const [selectedInterest, setSelectedInterest] = useState<EnrichedInterest | null>(null);

  // Fetch interests using React Query
  const { data: interests = [], isLoading, error } = useQuery({
    queryKey: ['/api/interests', { status: selectedStatus !== 'all' ? selectedStatus : undefined }],
    queryFn: () => apiRequest('GET', `/api/interests${selectedStatus !== 'all' ? `?status=${selectedStatus}` : ''}`)
  });

  const handleStatusChange = (status: InterestStatus | 'all') => {
    setSelectedStatus(status);
  };

  // Mutation for updating interest status
  const updateInterestMutation = useMutation({
    mutationFn: ({ id, action }: { id: number, action: 'contact' | 'archive' }) => {
      return apiRequest('POST', `/api/interests/${id}/${action}`);
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Success',
        description: `Interest ${variables.action === 'contact' ? 'marked as contacted' : 'archived'} successfully`,
      });
      // Invalidate and refetch interests
      queryClient.invalidateQueries({ queryKey: ['/api/interests'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process interest',
        variant: 'destructive',
      });
    }
  });

  const handleInterestAction = (applicationId: number, action: 'contact' | 'archive') => {
    updateInterestMutation.mutate({ id: applicationId, action });
  };

  // Handle loading and error states
  if (isLoading) {
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
            <Skeleton className="h-10 w-[180px]" />
          </div>
          <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
            <Card className="col-span-5">
              <CardContent className="pt-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </CardContent>
            </Card>
            <Card className="col-span-7">
              <CardContent className="pt-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </LandlordLayout>
    );
  }

  if (error) {
    return (
      <LandlordLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load interests</h3>
            <p className="text-gray-500">
              {error instanceof Error ? error.message : 'An error occurred while fetching interests'}
            </p>
          </div>
        </div>
      </LandlordLayout>
    );
  }


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
                        <h3 className="font-medium">{interest.contactInfo.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {interest.isGeneral ? 'General Interest' : interest.property?.address || 'Property Interest'}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {interest.tenantId ? (
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
                          {interest.contactInfo.preferredContact} preferred
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(interest.createdAt).toLocaleDateString()}
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
                      <h2 className="text-xl font-semibold">{selectedInterest.contactInfo.name}</h2>
                      {selectedInterest.tenantId && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          <FileText className="w-3 h-3 mr-1" />
                          Registered User
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      {selectedInterest.isGeneral ? 'General Portfolio Interest' : selectedInterest.property?.address || 'Property Interest'}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" asChild data-testid="button-email-tenant">
                      <a href={`mailto:${selectedInterest.contactInfo.email}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </a>
                    </Button>
                    <Button variant="outline" asChild data-testid="button-call-tenant">
                      <a href={`tel:${selectedInterest.contactInfo.phone}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </a>
                    </Button>
                    <Button variant="outline" asChild data-testid="button-text-tenant">
                      <a href={`sms:${selectedInterest.contactInfo.phone}`}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Text
                      </a>
                    </Button>
                    {selectedInterest.tenantId && (
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
                    <span>{selectedInterest.contactInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedInterest.contactInfo.phone}</span>
                  </div>
                </div>

                {/* Interest Message */}
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <h4 className="font-medium mb-3">Interest Message</h4>
                    <p className="text-muted-foreground">{selectedInterest.message || 'No message provided'}</p>
                  </CardContent>
                </Card>

                {/* Interest Details */}
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Preferred Contact</p>
                        <div className="flex items-center">
                          {selectedInterest.contactInfo.preferredContact === 'email' && <Mail className="w-4 h-4 text-primary mr-2" />}
                          {selectedInterest.contactInfo.preferredContact === 'phone' && <Phone className="w-4 h-4 text-primary mr-2" />}
                          {selectedInterest.contactInfo.preferredContact === 'text' && <MessageSquare className="w-4 h-4 text-primary mr-2" />}
                          <span className="capitalize">{selectedInterest.contactInfo.preferredContact}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Submitted</p>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-primary mr-2" />
                          <span>{new Date(selectedInterest.createdAt).toLocaleDateString()}</span>
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
                    onClick={() => handleInterestAction(selectedInterest.id, 'archive')}
                    disabled={updateInterestMutation.isPending}
                    data-testid="button-archive-interest"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archive Interest
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => handleInterestAction(selectedInterest.id, 'contact')}
                    disabled={updateInterestMutation.isPending}
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
