import React, { useState } from 'react';
import {
  Plus,
  Building,
  Users,
  Eye,
  Edit,
  Send,
  Mail,
  Phone,
  ExternalLink,
  Info,
  LogOut,
  Loader2,
  QrCode,
  Copy,
  CheckCircle
} from 'lucide-react';
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/shared/navbar";
import { QRCodeSVG } from 'qrcode.react';
import { Property, Application } from "@shared/schema";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";

interface ScreeningActionsProps {
  screeningLink: string;
  propertyId: number;
  submissionCount: number;
}

// ScreeningActions Component
const ScreeningActions: React.FC<ScreeningActionsProps> = ({ screeningLink, propertyId, submissionCount }) => {
  const [showQRCode, setShowQRCode] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  const getScreeningPageUrl = (slug: string) => {
    return `${window.location.origin}/landlord/screening/${slug}`;
  };

  const handleCopyLink = async () => {
    try {
      const fullUrl = getScreeningPageUrl(screeningLink);
      await navigator.clipboard.writeText(fullUrl);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <span className="text-muted-foreground">
        {submissionCount} submissions
      </span>

      {/* Copy Link Button */}
      <Button
        variant="link"
        className="p-0 h-auto flex items-center"
        onClick={handleCopyLink}
      >
        {showCopyAlert ? (
          <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
        ) : (
          <Copy className="w-4 h-4 mr-1" />
        )}
        Copy Screening Link
      </Button>

      {/* View Submissions Link */}
      <Button variant="link" className="p-0 h-auto">
        <Link
          href={`/landlord/property/${propertyId}/submissions`}
          className="flex items-center"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          View Submissions
        </Link>
      </Button>

      {/* QR Code Button */}
      <Button
        variant="link"
        className="p-0 h-auto"
        onClick={() => setShowQRCode(true)}
      >
        <QrCode className="w-4 h-4 mr-1" />
        View QR Code
      </Button>

      {/* QR Code Dialog */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Screening Page QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 p-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG
                value={getScreeningPageUrl(screeningLink)}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Scan this QR code to access the screening page
            </p>
            <Button
              className="w-full"
              onClick={handleCopyLink}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Copy Success Alert */}
      {showCopyAlert && (
        <Alert className="fixed bottom-4 right-4 w-auto bg-green-50">
          <AlertDescription className="text-green-600">
            Link copied to clipboard!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

const LandlordDashboard = () => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const { logoutMutation, user } = useAuth();

  // Fetch properties data
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['/api/landlord/properties'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/landlord/properties');
      return response.json() as Promise<Property[]>;
    },
    enabled: !!user?.id
  });

  // Get aggregate stats
  const totalSubmissions = properties?.reduce((sum, property) => {
    return sum + (property.applications?.length || 0);
  }, 0) || 0;
  const activeProperties = properties?.length || 0;

  // Request RentCard Modal
  const RequestModal = () => (
    <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request RentCard</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Tenant Name</Label>
            <Input placeholder="Enter tenant's name" />
          </div>

          <div>
            <Label>Contact Method</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="justify-start">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" className="justify-start">
                <Phone className="w-4 h-4 mr-2" />
                SMS
              </Button>
            </div>
          </div>

          <div>
            <Label>Email or Phone Number</Label>
            <Input placeholder="Enter contact information" />
          </div>

          <div>
            <Label>Message (Optional)</Label>
            <Textarea
              rows={3}
              placeholder="Add a personal message..."
              defaultValue="Hi! Please complete your RentCard profile to apply for my property."
            />
          </div>

          <Button className="w-full">
            <Send className="w-4 h-4 mr-2" />
            Send Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="p-6">
        {/* Header */}
        <div className="max-w-6xl mx-auto flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Landlord Dashboard</h1>
            <p className="text-muted-foreground">Manage your screening pages and applications</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => setShowRequestModal(true)}>
              <Send className="w-4 h-4 mr-2" />
              Request RentCard
            </Button>
            <Button
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4 mr-2" />
              )}
              Logout
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">Page Views</p>
                  <p className="text-2xl font-semibold mt-1">-</p>
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </div>
                <Eye className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-semibold mt-1">{totalSubmissions}</p>
                  <p className="text-sm text-muted-foreground">From all properties</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">Active Properties</p>
                  <p className="text-2xl font-semibold mt-1">{activeProperties}</p>
                  <Link href="/landlord/add-property" className="text-sm text-primary hover:underline cursor-pointer">
                    + Add Property
                  </Link>
                </div>
                <Building className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Guide */}
        <div className="max-w-6xl mx-auto mb-8">
          <Card className="bg-primary/5">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2 text-primary" />
                How to Use Your Screening Pages
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium mb-2">1. Share Your Links</h3>
                  <p className="text-sm text-muted-foreground">
                    Add your screening page link to listings or share directly with potential tenants.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">2. Request RentCards</h3>
                  <p className="text-sm text-muted-foreground">
                    Send requests to prospects via email or SMS to get their completed RentCard.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">3. Review Applications</h3>
                  <p className="text-sm text-muted-foreground">
                    Get instant access to verified tenant profiles that match your requirements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Property Screening Pages */}
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Property Screening Pages</h2>
            <Link href="/landlord/add-property">
              <Button variant="link" className="p-0 h-auto">
                <Plus className="w-4 h-4 mr-1" />
                Add Property
              </Button>
            </Link>
          </div>

          <Card>
            <CardContent className="pt-6">
              {propertiesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : properties && properties.length > 0 ? (
                <div className="space-y-6">
                  {properties.map((property) => (
                    <Card key={property.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-medium">{property.address}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {property.bedrooms} bed • {property.bathrooms} bath • ${property.rent}/month
                            </p>
                          </div>
                          <Link href={`/landlord/property/${property.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>

                        <ScreeningActions
                          screeningLink={property.screeningPageSlug || `property-${property.id}`}
                          propertyId={property.id}
                          submissionCount={0} // We'll update this once we implement the applications query
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8">
                  <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No properties added yet</p>
                  <Link href="/landlord/add-property">
                    <Button variant="link" className="mt-2">
                      Add your first property
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Request RentCard Modal */}
        <RequestModal />
      </div>
    </div>
  );
};

export default LandlordDashboard;