import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
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
  Building2,
  Users,
  X,
  Bed,
  Bath,
  Car,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { API_ENDPOINTS } from "@/constants";
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
    queryKey: ["/api/properties/screening", slug],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/properties/screening/${slug}`);
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

// PropertyDetailsModal (unchanged)
const PropertyDetailsModal = ({ isOpen, onClose, property }: PropertyDetailsModalProps) => {
  if (!isOpen || !property) return null;

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
          <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
            <Building className="w-12 h-12 text-gray-400" />
          </div>
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
  const { slug } = useParams();
  const { user } = useAuthStore();
  const { modal, openModal, closeModal, setLoading, loadingStates, addToast } = useUIStore();
  const queryClient = useQueryClient();

  const { data: property, isLoading, error } = usePropertyDetails(slug || "");
  const { data: rentCard, isLoading: rentCardLoading } = useRentCard(user?.id);

  const showPropertyDetails = modal?.type === 'propertyDetails';

  // Debugging logs (kept for troubleshooting)
  console.log("User:", user);
  console.log("User Type:", user?.userType);
  console.log("RentCard:", rentCard);

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
    const monthlyIncome = parseInt(
      (document.querySelector('input[placeholder="Enter your monthly income"]') as HTMLInputElement)?.value || "0"
    );
    const creditScore = parseInt(
      (document.querySelector('input[placeholder="Enter your credit score"]') as HTMLInputElement)?.value || "0"
    );
    preScreeningMutation.mutate({ monthlyIncome, creditScore });
  };

  if (isLoading || rentCardLoading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error loading property</div>;
  if (!property) return <div className="p-8 text-center">Property not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-lg p-4">
                  <Building className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{property.address}</h1>
                  <p className="text-blue-100">
                    {property.bedrooms} Bed • {property.bathrooms} Bath • ${property.rent}/month
                  </p>
                  <button
                    className="mt-2 text-white hover:text-blue-200 font-medium flex items-center gap-1"
                    onClick={() => openModal('propertyDetails', { property })}
                  >
                    View full property details
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg rounded-xl overflow-hidden">
          {(!user || user?.userType === "tenant") ? (
            <CardContent className="p-8 bg-blue-50 border-b border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-6 h-6 text-blue-600 fill-current" />
                <h2 className="text-2xl font-bold text-gray-800">Express Interest with RentCard</h2>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                  <p className="text-lg text-gray-700 mb-4">
                    Share your verified rental profile instantly—no forms needed!
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span>Takes 30 seconds</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <span>Privacy protected</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span>Instant sharing</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span>Verified profile</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <Button
                    onClick={() => (!rentCard?.id ? (window.location.href = "/create-rentcard") : rentCardMutation.mutate())}
                    disabled={rentCardMutation.isPending}
                    className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 shadow-lg transform hover:scale-105 transition-transform"
                  >
                    {rentCard?.id ? "Share RentCard" : "Create RentCard"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  {/* Added Login Link */}
                  {!rentCard?.id && (
                    <p className="text-sm text-gray-600 text-center">
                      Already have a RentCard?{" "}
                      <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                        Login
                      </Link>
                    </p>
                  )}
                  <p className="text-sm text-gray-600 text-center">
                    {property?.applications?.length || 0} RentCards shared
                  </p>
                </div>
              </div>
            </CardContent>
          ) : user?.userType === "landlord" ? (
            <CardContent className="p-8 bg-blue-50 border-b border-blue-100 text-center">
              <p className="text-lg text-gray-700">
                You are logged in as a landlord and cannot submit a RentCard.
              </p>
            </CardContent>
          ) : null}

          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Quick Pre-Screening</h2>
            <p className="text-gray-600 mb-6">
              Share basic details to check if this property matches your needs.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-gray-800">Basic Requirements:</h3>
                <div className="space-y-4">
                  {property.requirements?.map((req, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-blue-600 mt-1" />
                      <p className="text-gray-600">{req.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <Label>Monthly Income</Label>
                    <Input type="number" placeholder="Enter your monthly income" />
                  </div>
                  <div>
                    <Label>Credit Score</Label>
                    <Input type="number" placeholder="Enter your credit score" />
                  </div>
                  <Button
                    onClick={handlePreScreeningSubmit}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-transform hover:scale-105"
                  >
                    Submit Pre-Screening
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-3 text-center">
                  30-second form • No commitment
                </p>
              </div>
            </div>
          </CardContent>

          <CardContent className="bg-gray-50 p-6 text-center border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">★★★★★ "Super quick process!"</p>
            <p className="text-sm text-gray-600">Trusted by thousands of renters</p>
          </CardContent>

          <div className="bg-gray-100 p-3 text-center text-sm text-gray-500">
            Last updated: February 22, 2025
          </div>
        </Card>
      </div>

      <PropertyDetailsModal
        isOpen={showPropertyDetails}
        onClose={() => closeModal()}
        property={property}
      />

      <div className="max-w-4xl mx-auto mt-6 text-center">
        <Link href="/">
          <div className="flex items-center justify-center gap-2 cursor-pointer">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">Made with MyRentCard</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ScreeningPage;