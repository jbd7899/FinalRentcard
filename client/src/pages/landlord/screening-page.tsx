import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  ArrowRight,
  DollarSign,
  Star,
  Clock,
  CheckCircle,
  MapPin,
  Building,
  Building2,
  Users,
  X,
  Bed,
  Bath,
  Car,
  CalendarDays,
  Loader2,
  Share2,
  Phone,
  Mail,
  Info,
} from "lucide-react";
import { API_ENDPOINTS, ROUTES, generateRoute } from "@/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "wouter";
import { PropertyImage, PropertyAmenity } from '@shared/schema';
import LandlordLayout from '@/components/layouts/LandlordLayout';
import { NeighborhoodInsights } from '@/components/shared/NeighborhoodInsights';

// Existing hooks (unchanged)
const useRentCard = (userId?: number) => {
  return useQuery({
    queryKey: [API_ENDPOINTS.RENTCARDS.USER, userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiRequest("GET", API_ENDPOINTS.RENTCARDS.USER);
      return response.json();
    },
    enabled: !!userId,
    retry: 1,
  });
};

const usePropertyDetails = (slug: string) => {
  return useQuery({
    queryKey: [API_ENDPOINTS.PROPERTIES.SCREENING.BY_SLUG(slug)],
    queryFn: async () => {
      const response = await apiRequest("GET", API_ENDPOINTS.PROPERTIES.SCREENING.BY_SLUG(slug));
      return response.json();
    },
    enabled: !!slug,
  });
};

interface PropertyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any; // TODO: Replace with proper property type when available
}

interface PreScreeningFormData {
  monthlyIncome: number;
  creditScore: number;
}

// PropertyDetailsModal (enhanced with better styling)
const PropertyDetailsModal = ({ isOpen, onClose, property }: PropertyDetailsModalProps) => {
  if (!isOpen || !property) return null;

  // Find primary image or use the first image
  const primaryImage = property.images?.find((img: PropertyImage) => img.isPrimary) || property.images?.[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{property.address}</DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </DialogHeader>
        <div className="space-y-6">
          {primaryImage ? (
            <div className="bg-gray-100 h-64 rounded-lg overflow-hidden">
              <img 
                src={primaryImage.imageUrl} 
                alt={property.address} 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
              <Building className="w-12 h-12 text-gray-400" />
            </div>
          )}
          
          {/* Property images gallery */}
          {property.images && property.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {property.images.slice(0, 4).map((image: PropertyImage, index: number) => (
                <div key={image.id} className="aspect-square rounded-md overflow-hidden">
                  <img 
                    src={image.imageUrl} 
                    alt={`Property image ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Bed className="w-5 h-5 text-blue-600" />
              <span>{property.bedrooms} Beds</span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="w-5 h-5 text-blue-600" />
              <span>{property.bathrooms} Baths</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-600" />
              <span>{property.parking || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              <span>{new Date(property.availableFrom).toLocaleDateString()}</span>
            </div>
          </div>
          
          {/* Amenities section */}
          {property.amenities && property.amenities.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity: PropertyAmenity) => (
                  <div key={amenity.id} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {amenity.amenityType}
                    {amenity.description && ` - ${amenity.description}`}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{property.description}</p>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-5 h-5" />
            <span>{property.address}</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-b-lg">
            <p className="text-2xl font-bold">${property.rent}/month</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main ScreeningPage Component
const ScreeningPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { modal, openModal, closeModal, setLoading, loadingStates, addToast } = useUIStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [preScreeningData, setPreScreeningData] = useState<PreScreeningFormData>({
    monthlyIncome: 0,
    creditScore: 0,
  });

  const { data: property, isLoading: propertyLoading, error } = usePropertyDetails(slug || "");
  const { data: rentCard, isLoading: rentCardLoading } = useRentCard(user?.id);

  // Redirect to archived property page if property is archived
  useEffect(() => {
    if (property && property.isArchived) {
      setLocation(generateRoute.archivedProperty(slug || ""));
    }
  }, [property, slug, setLocation]);

  const showPropertyDetailsModal = modal?.type === 'propertyDetails';
  const isLandlord = user?.userType === 'landlord';

  const rentCardMutation = useMutation({
    mutationFn: async () => {
      if (!rentCard) throw new Error("Please create your RentCard first");
      if (!property?.id) throw new Error("Property information is missing");
      
      setLoading('submitRentCard', true);
      try {
        const response = await apiRequest("POST", API_ENDPOINTS.APPLICATIONS.CREATE, {
          propertyId: property.id,
          tenantId: user?.id,
          status: "pending",
        });
        if (!response.ok) throw new Error("Failed to submit application");
        return response.json();
      } finally {
        setLoading('submitRentCard', false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties/screening", slug] });
      addToast({
        title: "Success!",
        description: "RentCard shared with landlord.",
        type: "success"
      });
    },
    onError: (error) => {
      addToast({
        title: "Error",
        description: error.message,
        type: "error"
      });
    },
  });

  const preScreeningMutation = useMutation({
    mutationFn: async (formData: PreScreeningFormData) => {
      setLoading('preScreening', true);
      try {
        const response = await apiRequest("POST", "/api/prescreening", {
          monthlyIncome: formData.monthlyIncome,
          creditScore: formData.creditScore,
          propertyId: property?.id,
        });
        return response.json();
      } finally {
        setLoading('preScreening', false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties/screening", slug] });
      addToast({
        title: "Success",
        description: "Pre-screening submitted.",
        type: "success"
      });
    },
    onError: (error) => {
      addToast({
        title: "Error",
        description: error.message,
        type: "error"
      });
    },
  });

  const handlePreScreeningSubmit = () => {
    preScreeningMutation.mutate(preScreeningData);
  };

  const handleSubmitRentCard = () => {
    rentCardMutation.mutate();
  };

  const pageContent = (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Demo Banner for Landlords */}
      {isLandlord && (
        <div className="max-w-4xl mx-auto mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold mb-2 flex items-center">
                <Info className="w-5 h-5 text-blue-600 mr-2" />
                Your Property Screening Page
              </h1>
              <p className="text-gray-600">
                This is your property screening page for tenant applications. Tenants can submit their RentCard or complete a quick pre-screening form.
              </p>
            </div>
            <Button 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-transform hover:scale-105 w-full md:w-auto"
              onClick={() => setLocation(ROUTES.LANDLORD.SCREENING)}
            >
              Manage Screening Pages
            </Button>
          </div>
        </div>
      )}

      {propertyLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-500">Loading property details...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-gray-50 max-w-4xl mx-auto">
          <Building className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Property Not Found</h3>
          <p className="text-gray-500 text-center mb-6 max-w-md">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <Button 
            onClick={() => setLocation(ROUTES.HOME)}
            size="sm"
            className="h-9 text-sm"
          >
            Return Home
          </Button>
        </div>
      ) : property ? (
        <div className="max-w-4xl mx-auto">
          {/* Property Header with Contact Info */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="p-6 sm:p-4 text-white relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                {/* Contact Info */}
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl font-semibold text-white">Property Manager: {property.landlordName || "Property Manager"}</h2>
                  <div className="flex flex-col sm:flex-row sm:gap-4 text-blue-100 text-sm">
                    {property.landlordPhone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>Contact: {property.landlordPhone}</span>
                      </div>
                    )}
                    {property.landlordEmail && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>Email: {property.landlordEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Property Info */}
                <div className="flex flex-col items-center md:flex-row md:items-center">
                  <div className="bg-white rounded-lg p-4">
                    <Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="ml-0 md:ml-4 mt-4 md:mt-0 text-center md:text-left">
                    <h1 className="text-2xl font-bold text-white">{property.title || property.address}</h1>
                    <p className="text-blue-100">{property.bedrooms} Bed • {property.bathrooms} Bath • ${property.rent}/month</p>
                    <button 
                      className="mt-2 text-white hover:text-blue-200 font-medium flex items-center gap-1 mx-auto md:mx-0"
                      onClick={() => openModal('propertyDetails')}
                    >
                      View full property details
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* RentCard Integration Section */}
            <div className="p-8 bg-blue-50 border-b border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-6 h-6 text-blue-600 fill-current" />
                <h2 className="text-2xl font-bold text-gray-800">Apply Easily with Your RentCard</h2>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                  <p className="text-lg text-gray-700 mb-4">
                    Stand out from other applicants with your verified RentCard – get faster approvals and skip repetitive paperwork!
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-gray-700 justify-center md:justify-start">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span>Apply in seconds</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700 justify-center md:justify-start">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <span>Increase approval odds</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {user ? (
                    rentCard ? (
                      <Button 
                        className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 shadow-lg transform hover:scale-105 transition-transform"
                        onClick={handleSubmitRentCard}
                        disabled={loadingStates.submitRentCard}
                      >
                        <Share2 className="w-5 h-5" />
                        {loadingStates.submitRentCard ? 'Sharing...' : 'Share Your RentCard'}
                      </Button>
                    ) : (
                      <Button 
                        className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 shadow-lg transform hover:scale-105 transition-transform"
                        onClick={() => setLocation('/create-rentcard')}
                      >
                        <Share2 className="w-5 h-5" />
                        Create Your RentCard
                      </Button>
                    )
                  ) : (
                    <Button 
                      className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 shadow-lg transform hover:scale-105 transition-transform"
                      onClick={() => setLocation('/auth')}
                    >
                      <Share2 className="w-5 h-5" />
                      Sign In to Apply
                    </Button>
                  )}
                  {!user && (
                    <p className="text-sm text-gray-600 text-center">
                      No account?{' '}
                      <button 
                        className="text-blue-600 hover:text-blue-800 font-medium"
                        onClick={() => setLocation('/auth?tab=register')}
                      >
                        Create an Account
                      </button>
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Neighborhood Insights Section */}
            <div className="p-8 bg-white border-t border-gray-100">
              <NeighborhoodInsights propertyId={property?.id} />
            </div>

            {/* Quick Pre-Screening Form */}
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Check If You Qualify</h2>
              <p className="text-gray-600 mb-6">
                See if you qualify for this property in seconds! Enter your information below to check if you meet the requirements.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-gray-800">Property Requirements:</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-gray-600">Minimum Income: ${property.minIncome || property.rent * 3}/month</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-gray-600">Max Occupants: {property.maxOccupants || property.bedrooms * 2} people</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                      <div>
                        <p className="text-gray-600">Move-in: {new Date(property.availableFrom).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="monthlyIncome">Monthly Income</Label>
                      <Input 
                        id="monthlyIncome"
                        type="number" 
                        placeholder="Enter your monthly income" 
                        value={preScreeningData.monthlyIncome || ''}
                        onChange={(e) => setPreScreeningData({
                          ...preScreeningData,
                          monthlyIncome: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="creditScore">Credit Score</Label>
                      <Input 
                        id="creditScore"
                        type="number" 
                        placeholder="Enter your credit score" 
                        value={preScreeningData.creditScore || ''}
                        onChange={(e) => setPreScreeningData({
                          ...preScreeningData,
                          creditScore: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                    <Button 
                      onClick={handlePreScreeningSubmit}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2 transition-transform hover:scale-105"
                      disabled={loadingStates.preScreening}
                    >
                      {loadingStates.preScreening ? 'Checking...' : 'Check My Eligibility'}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    Quick check • 100% free • No credit check required
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Section */}
            <div className="bg-gray-50 p-6 text-center border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">★★★★★ "Found my perfect apartment in just a few clicks!"</p>
              <p className="text-sm text-gray-600">Join thousands of successful renters who found their dream home</p>
            </div>

            {/* Last Updated Footer */}
            <div className="bg-gray-100 p-3 text-center text-sm text-gray-500">
              Property information last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      ) : null}

      {/* Property Details Modal */}
      {property && (
        <PropertyDetailsModal
          isOpen={showPropertyDetailsModal}
          onClose={closeModal}
          property={property}
        />
      )}
    </div>
  );

  return isLandlord ? (
    <LandlordLayout>
      {pageContent}
    </LandlordLayout>
  ) : (
    <div className="min-h-screen bg-background">
      {pageContent}
    </div>
  );
};

export default ScreeningPage;