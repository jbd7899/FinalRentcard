import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import {
  Shield,
  ArrowRight,
  DollarSign,
  Star,
  Clock,
  CheckCircle,
  MapPin,
  Building,
  Users,
  X,
  Bed,
  Bath,
  Car,
  CalendarDays,
  LucideIcon,
  Loader2
} from "lucide-react";
import type { RentCard } from "@shared/schema";
import { API_ENDPOINTS, CONFIG } from "@/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Add RentCard query hook with proper error handling and types
const useRentCard = (userId?: number) => {
  return useQuery({
    queryKey: [API_ENDPOINTS.RENTCARDS.BASE, userId],
    queryFn: async () => {
      if (!userId) {
        return null;
      }
      try {
        const response = await apiRequest("GET", `${API_ENDPOINTS.RENTCARDS.BY_ID(userId.toString())}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch RentCard: ${response.statusText}`);
        }
        return response.json();
      } catch (error) {
        console.error('RentCard fetch error:', error);
        return null;
      }
    },
    enabled: !!userId,
    retry: false,
    staleTime: 30000, // Cache for 30 seconds
  });
};

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Shield,
  DollarSign,
  CheckCircle,
  Users,
  Clock
};

// Props type for PropertyDetailsModal
interface PropertyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any; // Will be properly typed once we have the full property type
}

// Custom hooks for data fetching
const usePropertyDetails = (slug: string) => {
  return useQuery({
    queryKey: ["/api/properties/screening", slug],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/properties/screening/${slug}`);
      return response.json();
    },
    enabled: !!slug,
  });
};


// Property Details Modal Component
const PropertyDetailsModal = ({ isOpen, onClose, property }: PropertyDetailsModalProps) => {
  if (!isOpen || !property) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Property Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg">
            {/* Property Image Placeholder */}
            <div className="w-full h-full flex items-center justify-center">
              <Building className="w-12 h-12 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms} Beds</span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms} Baths</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              <span>{property.parking || 'N/A'}</span>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-muted-foreground">{property.description}</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Available From</h3>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <span>{new Date(property.availableFrom).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Component
const ScreeningPage = () => {
  const { slug } = useParams();
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: property, isLoading, error } = usePropertyDetails(slug || '');
  const { 
    data: rentCard, 
    isLoading: rentCardLoading, 
    error: rentCardError 
  } = useRentCard(user?.id);

  const rentCardMutation = useMutation({
    mutationFn: async () => {
      if (!rentCard) {
        throw new Error("Please create your RentCard first");
      }
      if (!property?.id) {
        throw new Error("Property information is missing");
      }
      const response = await apiRequest("POST", API_ENDPOINTS.APPLICATIONS.CREATE, {
        propertyId: property.id,
        tenantId: user?.id,
        status: "pending"
      });
      if (!response.ok) {
        throw new Error("Failed to submit application");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties/screening", slug] });
      toast({
        title: "Success!",
        description: "Your RentCard has been shared with the landlord. They will review it shortly.",
      });
    },
    onError: (error: Error) => {
      console.error('RentCard sharing error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to share RentCard. Please try again.",
        variant: "destructive",
      });
    },
  });

  const preScreeningMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await apiRequest("POST", "/api/prescreening", {
        propertyId: property?.id,
        ...formData,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties/screening", slug] });
      toast({
        title: "Success",
        description: "Your pre-screening form has been submitted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading || rentCardLoading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error loading property details</div>;
  if (!property) return <div className="p-8 text-center">Property not found</div>;

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Property Header */}
      <div className="max-w-3xl mx-auto mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary rounded-lg p-4">
                  <Building className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{property.address}</h1>
                  <p className="text-muted-foreground">
                    {property.bedrooms} Bed • {property.bathrooms} Bath • ${property.rent}/month
                  </p>
                  <Button 
                    variant="link" 
                    className="px-0 h-auto"
                    onClick={() => setShowPropertyDetails(true)}
                  >
                    View full property details
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto">
        <Card>
          {/* RentCard Section */}
          {user?.userType === 'tenant' && (
            <CardContent className="pt-6 bg-primary/5 border-b">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-6 h-6 text-primary fill-current" />
                <h2 className="text-2xl font-semibold">Express Interest with RentCard</h2>
              </div>
              <div className="flex items-center gap-8 mb-6">
                <div className="flex-1">
                  <p className="text-lg text-muted-foreground mb-4">
                    Share your verified rental profile instantly with the landlord - no forms needed
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock className="w-5 h-5 text-primary" />
                      <span>Takes 30 seconds</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Shield className="w-5 h-5 text-primary" />
                      <span>Privacy protected</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>Instant sharing</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Users className="w-5 h-5 text-primary" />
                      <span>Verified profile</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  {rentCardLoading ? (
                    <Button 
                      disabled
                      size="lg"
                      className="px-8 py-6 text-lg h-auto"
                    >
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Loading...
                    </Button>
                  ) : rentCardError ? (
                    <div className="text-center">
                      <p className="text-red-500 mb-2">Error loading RentCard</p>
                      <Button 
                        variant="outline"
                        onClick={() => window.location.href = '/create-rentcard'}
                      >
                        Create RentCard
                      </Button>
                    </div>
                  ) : !rentCard ? (
                    <Button 
                      variant="default"
                      size="lg"
                      className="px-8 py-6 text-lg h-auto"
                      onClick={() => window.location.href = '/create-rentcard'}
                    >
                      Create RentCard
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => rentCardMutation.mutate()}
                      disabled={rentCardMutation.isPending}
                      size="lg"
                      className="px-8 py-6 text-lg h-auto"
                    >
                      {rentCardMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Sharing...
                        </>
                      ) : (
                        <>
                          Share RentCard
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {property?.applications?.length || 0} RentCards shared
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground text-center pt-4 border-t">
                ★★★★★ "Super quick and professional way to share my rental profile!" - Recent tenant
              </div>
            </CardContent>
          )}

          {/* Pre-screening Form */}
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Quick Pre-Screening Form</h2>
            <p className="text-muted-foreground mb-6">
              Share basic details to check if this property matches your needs. 
              Not a full application - just helps us understand if it's a good fit.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Basic Requirements:</h3>
                <div className="space-y-3">
                  {property.requirements?.map((requirement: any, index: number) => {
                    const IconComponent = iconMap[requirement.icon];
                    return (
                      <div key={index} className="flex items-start gap-3">
                        {IconComponent && <IconComponent className="w-5 h-5 text-muted-foreground mt-1" />}
                        <div>
                          <p className="text-muted-foreground">{requirement.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="space-y-4">
                  <div>
                    <Label>Monthly Income</Label>
                    <Input type="number" placeholder="Enter your monthly income" />
                  </div>
                  <div>
                    <Label>Credit Score Range</Label>
                    <Input type="number" placeholder="Enter your credit score" />
                  </div>
                  <Button className="w-full" onClick={() => preScreeningMutation.mutate()}>
                    Submit Pre-Screening
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  30-second form • No credit check • No commitment
                </p>
              </div>
            </div>
          </CardContent>

          {/* Social Proof */}
          <CardContent className="bg-muted/50">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">★★★★★ "Super quick process!"</p>
              <p>Used by thousands of renters to find their perfect home</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Details Modal */}
      <PropertyDetailsModal 
        isOpen={showPropertyDetails}
        onClose={() => setShowPropertyDetails(false)}
        property={property}
      />
    </div>
  );
};

export default ScreeningPage;