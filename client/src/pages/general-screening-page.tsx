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
  Building2,
  Users,
  X,
  Loader2,
  Globe,
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
import LandlordLayout from '@/components/layouts/LandlordLayout';
import InterestSubmissionForm from "@/components/shared/InterestSubmissionForm";

interface PreScreeningFormData {
  monthlyIncome: number;
  creditScore: number;
}

// Main GeneralScreeningPage Component
const GeneralScreeningPage = () => {
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

  const { data: screeningPage, isLoading: screeningPageLoading, error } = useQuery({
    queryKey: ['/api/screening/general', slug],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/screening/general/${slug}`);
      return response.json();
    },
    enabled: !!slug,
  });

  const { data: rentCard, isLoading: rentCardLoading } = useQuery({
    queryKey: [API_ENDPOINTS.RENTCARDS.USER, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await apiRequest("GET", API_ENDPOINTS.RENTCARDS.USER);
      return response.json();
    },
    enabled: !!user?.id,
    retry: 1,
  });

  const isLandlord = user?.userType === 'landlord';

  const rentCardMutation = useMutation({
    mutationFn: async () => {
      if (!rentCard) throw new Error("Please create your RentCard first");
      if (!screeningPage?.id) throw new Error("Screening page information is missing");
      
      setLoading('submitRentCard', true);
      try {
        const response = await apiRequest("POST", "/api/applications/general", {
          screeningPageId: screeningPage.id,
          tenantId: user?.id,
          status: "pending",
        });
        if (!response.ok) throw new Error("Failed to submit prequalification");
        return response.json();
      } finally {
        setLoading('submitRentCard', false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/screening/general", slug] });
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
        const response = await apiRequest("POST", "/api/prescreening/general", {
          monthlyIncome: formData.monthlyIncome,
          creditScore: formData.creditScore,
          screeningPageId: screeningPage?.id,
        });
        return response.json();
      } finally {
        setLoading('preScreening', false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/screening/general", slug] });
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
                Your General Screening Page
              </h1>
              <p className="text-gray-600">
                This is your general screening page for tenant prequalification. Tenants can submit their RentCard or complete a quick pre-screening form.
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

      {screeningPageLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-500">Loading screening page...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-gray-50 max-w-4xl mx-auto">
          <Globe className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Screening Page Not Found</h3>
          <p className="text-gray-500 text-center mb-6 max-w-md">
            The screening page you're looking for doesn't exist or has been removed.
          </p>
          <Button 
            onClick={() => setLocation(ROUTES.HOME)}
            size="sm"
            className="h-9 text-sm"
          >
            Return Home
          </Button>
        </div>
      ) : screeningPage ? (
        <div className="max-w-4xl mx-auto">
          {/* Property Header with Company Info */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="p-6 sm:p-4 text-white relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                {/* Company Info */}
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl font-semibold text-white">{screeningPage.businessName}</h2>
                  <div className="flex flex-col sm:flex-row sm:gap-4 text-blue-100 text-sm">
                    {screeningPage.contactName && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Property Manager: {screeningPage.contactName}</span>
                      </div>
                    )}
                    {screeningPage.businessEmail && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>Contact: {screeningPage.businessEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Screening Info */}
                <div className="flex flex-col items-center md:flex-row md:items-center">
                  <div className="bg-white rounded-lg p-4">
                    <Globe className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="ml-0 md:ml-4 mt-4 md:mt-0 text-center md:text-left">
                    <h1 className="text-2xl font-bold text-white">Multiple Properties Available</h1>
                    <p className="text-blue-100">Express interest for all properties</p>
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
                <h2 className="text-2xl font-bold text-gray-800">Fast-Track Your Prequalification with RentCard</h2>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                  <p className="text-lg text-gray-700 mb-4">
                    Save time and stand out! Share your RentCard for quick approval on your dream rental.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-gray-700 justify-center md:justify-start">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span>Express interest in seconds</span>
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
                      Sign In to Express Interest
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

            {/* General Interest Submission Section */}
            <div className="p-8 bg-gray-50 border-t border-gray-100">
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2 text-gray-800">Interested in These Properties?</h2>
                  <p className="text-gray-600">
                    Submit your interest and we'll contact you about available properties that match your needs.
                  </p>
                </div>
                <InterestSubmissionForm
                  landlordId={screeningPage?.landlordId}
                  propertyAddress="Multiple Properties Available"
                />
              </div>
            </div>

            {/* Quick Pre-Screening Form */}
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Check Your Qualification</h2>
              <p className="text-gray-600 mb-6">
                Check if you qualify for these properties in just seconds! Enter your information below to see if you meet the basic requirements.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-gray-800">Requirements:</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-gray-600">Minimum Income: ${screeningPage.screeningCriteria?.minMonthlyIncome}/month</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-gray-600">Minimum Credit Score: {screeningPage.screeningCriteria?.minCreditScore}</p>
                      </div>
                    </div>
                    {screeningPage.screeningCriteria?.noEvictions && (
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                        <div>
                          <p className="text-gray-600">No prior evictions</p>
                        </div>
                      </div>
                    )}
                    {screeningPage.screeningCriteria?.cleanRentalHistory && (
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                        <div>
                          <p className="text-gray-600">Clean rental payment history</p>
                        </div>
                      </div>
                    )}
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
                    Quick check • Completely free • No credit check required
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Section */}
            <div className="bg-gray-50 p-6 text-center border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">★★★★★ "Found my dream apartment in minutes!"</p>
              <p className="text-sm text-gray-600">Join thousands of happy renters who found their perfect home</p>
            </div>

            {/* Last Updated Footer */}
            <div className="bg-gray-100 p-3 text-center text-sm text-gray-500">
              Property listings last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      ) : null}
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

export default GeneralScreeningPage; 