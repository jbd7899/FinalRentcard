import React, { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Star,
  Building2,
  Briefcase,
  DollarSign,
  CreditCard,
  CheckCircle,
  Download,
  Loader2,
  Info,
  User,
  MessageSquare,
  Phone,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  UserPlus,
  ArrowRight,
  Shield,
  Eye,
  Mail
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { APPLICATION_LABELS, MESSAGES } from '@/constants';
import InterestSubmissionForm from '@/components/shared/InterestSubmissionForm';
import { apiRequest } from '@/lib/queryClient';
import type { RentCard } from '@shared/schema';
// Standalone public page - no layout wrapper needed

interface SharedRentCardProps {}

const SharedRentCard: React.FC<SharedRentCardProps> = () => {
  const { token } = useParams() as { token: string };
  const { setLoading, loadingStates, addToast } = useUIStore();
  const [showInterestForm, setShowInterestForm] = useState(false);

  // Fetch shared RentCard data
  const {
    data: rentCardData,
    isLoading,
    error,
    isError
  } = useQuery({
    queryKey: [`/api/rentcard/shared/${token}`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/rentcard/shared/${token}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch RentCard');
      }
      return response.json() as Promise<RentCard>;
    },
    retry: false, // Don't retry for invalid tokens
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleDownloadPDF = async () => {
    try {
      setLoading('downloadPDF', true);
      const element = document.getElementById('shared-rentcard-content');
      if (!element) {
        throw new Error('RentCard content not found');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const fileName = rentCardData ? 
        `${rentCardData.firstName}_${rentCardData.lastName}_RentCard.pdf` : 
        'RentCard.pdf';
      
      pdf.save(fileName);

      addToast({
        title: 'Success',
        description: "RentCard downloaded successfully",
        type: 'success'
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      addToast({
        title: 'Error',
        description: 'Failed to download PDF. Please try again.',
        type: 'destructive'
      });
    } finally {
      setLoading('downloadPDF', false);
    }
  };

  const handleSignupAsLandlord = () => {
    window.location.href = '/auth?mode=register&type=landlord';
  };

  const handleShowInterest = () => {
    setShowInterestForm(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold" data-testid="text-loading-title">
                    Loading RentCard...
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Please wait while we retrieve the tenant's rental profile.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>
    );
  }

  // Error states
  if (isError) {
    const errorMessage = error?.message || 'Unknown error';
    
    let errorContent;
    if (errorMessage.includes('Invalid or expired')) {
      errorContent = {
        title: 'Link Not Found',
        description: 'This RentCard link is invalid or has expired. Please ask the tenant for a new link.',
        icon: <AlertCircle className="w-16 h-16 text-red-500" />,
        statusCode: '404'
      };
    } else if (errorMessage.includes('revoked')) {
      errorContent = {
        title: 'Link Revoked',
        description: 'This RentCard link has been revoked by the tenant. Please contact them for a new link.',
        icon: <Shield className="w-16 h-16 text-orange-500" />,
        statusCode: '403'
      };
    } else if (errorMessage.includes('expired')) {
      errorContent = {
        title: 'Link Expired',
        description: 'This RentCard link has expired. Please ask the tenant for a new link.',
        icon: <Clock className="w-16 h-16 text-amber-500" />,
        statusCode: '410'
      };
    } else {
      errorContent = {
        title: 'Unable to Load RentCard',
        description: 'There was an error loading this RentCard. Please try again later or contact the tenant.',
        icon: <AlertCircle className="w-16 h-16 text-red-500" />,
        statusCode: 'Error'
      };
    }

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  {errorContent.icon}
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-2" data-testid="text-error-code">
                    Error {errorContent.statusCode}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2" data-testid="text-error-title">
                    {errorContent.title}
                  </h3>
                  <p className="text-gray-600" data-testid="text-error-description">
                    {errorContent.description}
                  </p>
                </div>
                
                {/* Landlord signup encouragement even on error */}
                <div className="border-t pt-6 space-y-4">
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Are you a landlord?
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Join MyRentCard to access tenant profiles, manage applications, and streamline your rental process.
                    </p>
                    <Button 
                      onClick={handleSignupAsLandlord}
                      className="w-full"
                      data-testid="button-signup-landlord-error"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Sign Up as Landlord
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>
    );
  }

  // Main RentCard display
  if (!rentCardData) {
    return null;
  }

  // Calculate profile score (simplified for demo - would be more complex in real app)
  const profileScore = 4.8;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Landlord Signup Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              <span className="text-sm font-medium">
                Viewing a tenant's MyRentCard profile
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSignupAsLandlord}
              className="bg-white text-blue-600 hover:bg-blue-50 border-white shrink-0"
              data-testid="button-signup-landlord-banner"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Sign Up as Landlord
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* Main RentCard */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8" id="shared-rentcard-content">
              {/* Header with Logo and Gradient */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-4 sm:p-6 lg:p-8 text-white relative">
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <Button 
                    variant="outline"
                    onClick={handleDownloadPDF}
                    className="bg-white text-blue-600 hover:bg-blue-50"
                    disabled={loadingStates.downloadPDF}
                    data-testid="button-download-shared-pdf"
                  >
                    {loadingStates.downloadPDF ? (
                      <Loader2 className="w-4 h-4 sm:mr-2" />
                    ) : (
                      <Download className="w-4 h-4 sm:mr-2" />
                    )}
                    <span className="hidden sm:inline">
                      {loadingStates.downloadPDF ? 'Downloading...' : 'Download PDF'}
                    </span>
                  </Button>
                </div>

                <div className="flex flex-col space-y-6">
                  {/* Logo */}
                  <div className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-white" />
                    <span className="text-xl font-semibold text-white">MyRentCard</span>
                  </div>

                  {/* Main Content Area */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                    {/* Tenant Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shrink-0">
                        <User className="w-10 h-10 text-gray-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white" data-testid="text-tenant-name">
                          {rentCardData.firstName} {rentCardData.lastName}
                        </h2>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4 text-blue-100" />
                            <span className="text-blue-100" data-testid="text-tenant-email">
                              {rentCardData.email}
                            </span>
                          </div>
                          {rentCardData.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4 text-blue-100" />
                              <span className="text-blue-100" data-testid="text-tenant-phone">
                                {rentCardData.phone}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Verification and Score */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-300" />
                        <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                          Verified Profile
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Star className="w-6 h-6 text-yellow-300 fill-current" />
                          <span className="text-xl font-bold text-white">{profileScore}</span>
                          <span className="text-blue-100 whitespace-nowrap">Profile Score</span>
                        </div>
                        <p className="text-sm text-blue-100 mt-1">
                          Last updated: {new Date(rentCardData.updatedAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Information Grid */}
              <div className="p-8 bg-gray-50">
                <h3 className="font-semibold text-lg mb-6 flex items-center text-gray-800">
                  <Info className="w-5 h-5 mr-2 text-blue-600" />
                  Key Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Employment Info */}
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-700">Employment</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="text-gray-500">Status:</span>{' '}
                          <span className="font-medium" data-testid="text-employment-status">
                            Full-time
                          </span>
                        </p>
                        {rentCardData.currentEmployer && (
                          <p className="text-sm">
                            <span className="text-gray-500">Employer:</span>{' '}
                            <span className="font-medium" data-testid="text-employer">
                              {rentCardData.currentEmployer}
                            </span>
                          </p>
                        )}
                        {rentCardData.monthlyIncome && (
                          <p className="text-sm">
                            <span className="text-gray-500">Monthly Income:</span>{' '}
                            <span className="font-medium text-green-600" data-testid="text-monthly-income">
                              ${rentCardData.monthlyIncome.toLocaleString()}
                            </span>
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Credit Information */}
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-700">Credit</span>
                      </div>
                      <div className="space-y-2">
                        {rentCardData.creditScore && (
                          <p className="text-sm">
                            <span className="text-gray-500">Score:</span>{' '}
                            <span className="font-medium text-green-600" data-testid="text-credit-score">
                              {rentCardData.creditScore}
                            </span>
                          </p>
                        )}
                        <p className="text-sm">
                          <span className="text-gray-500">History:</span>{' '}
                          <span className="font-medium">Good standing</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rental Preferences */}
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-700">Preferences</span>
                      </div>
                      <div className="space-y-2">
                        {rentCardData.maxRent && (
                          <p className="text-sm">
                            <span className="text-gray-500">Max Rent:</span>{' '}
                            <span className="font-medium text-green-600" data-testid="text-max-rent">
                              ${rentCardData.maxRent}
                            </span>
                          </p>
                        )}
                        <p className="text-sm">
                          <span className="text-gray-500">Current Address:</span>{' '}
                          <span className="font-medium" data-testid="text-current-address">
                            {rentCardData.currentAddress}
                          </span>
                        </p>
                        {rentCardData.moveInDate && (
                          <p className="text-sm">
                            <span className="text-gray-500">Move-in:</span>{' '}
                            <span className="font-medium" data-testid="text-move-in-date">
                              {new Date(rentCardData.moveInDate).toLocaleDateString()}
                            </span>
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-700">Contact</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="text-gray-500">Email:</span>{' '}
                          <span className="font-medium break-all" data-testid="text-contact-email">
                            {rentCardData.email}
                          </span>
                        </p>
                        {rentCardData.phone && (
                          <p className="text-sm">
                            <span className="text-gray-500">Phone:</span>{' '}
                            <span className="font-medium" data-testid="text-contact-phone">
                              {rentCardData.phone}
                            </span>
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Additional Information */}
              <div className="p-8 border-t">
                <h3 className="font-semibold text-lg mb-6 flex items-center text-gray-800">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Rental Preferences</h4>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="text-gray-500">Has Pets:</span>{' '}
                        <span className="font-medium" data-testid="text-has-pets">
                          {rentCardData.hasPets ? 'Yes' : 'No'}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-500">Has Roommates:</span>{' '}
                        <span className="font-medium" data-testid="text-has-roommates">
                          {rentCardData.hasRoommates ? 'Yes' : 'No'}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-500">Years Employed:</span>{' '}
                        <span className="font-medium" data-testid="text-years-employed">
                          {rentCardData.yearsEmployed}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Current Situation</h4>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="text-gray-500">Current Rent:</span>{' '}
                        <span className="font-medium" data-testid="text-current-rent">
                          ${rentCardData.currentRent.toLocaleString()}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-500">Move-in Date:</span>{' '}
                        <span className="font-medium" data-testid="text-move-in-date">
                          {rentCardData.moveInDate}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-column layout for sidebar content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main content area - Interest Form or CTA */}
              <div className="lg:col-span-2">
                {showInterestForm ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold">Express Interest</h3>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowInterestForm(false)}
                        data-testid="button-hide-interest-form"
                      >
                        Cancel
                      </Button>
                    </div>
                    <InterestSubmissionForm
                      landlordId={1}
                      onSuccess={() => {
                        setShowInterestForm(false);
                        addToast({
                          title: 'Interest Submitted!',
                          description: 'Your interest has been sent to the tenant.',
                          type: 'success'
                        });
                      }}
                    />
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="max-w-md mx-auto space-y-6">
                        <div>
                          <h3 className="text-xl font-semibold mb-3">Interested in this tenant?</h3>
                          <p className="text-gray-600">
                            Express your interest and connect with this qualified tenant for your rental property.
                          </p>
                        </div>
                        <Button 
                          onClick={handleShowInterest}
                          className="w-full"
                          size="lg"
                          data-testid="button-show-interest-form"
                        >
                          <MessageSquare className="w-5 h-5 mr-2" />
                          Express Interest
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar - Landlord signup encouragement */}
              <div className="space-y-6">
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="bg-blue-600 p-3 rounded-full">
                          <UserPlus className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-2">
                          Join MyRentCard as a Landlord
                        </h3>
                        <p className="text-blue-800 text-sm leading-relaxed">
                          Get access to verified tenant profiles, streamlined application management, and powerful screening tools.
                        </p>
                      </div>
                      <div className="space-y-2 text-left">
                        <div className="flex items-center gap-2 text-blue-800 text-sm">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                          Access verified tenant profiles
                        </div>
                        <div className="flex items-center gap-2 text-blue-800 text-sm">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                          Manage applications efficiently
                        </div>
                        <div className="flex items-center gap-2 text-blue-800 text-sm">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                          Connect with quality tenants
                        </div>
                        <div className="flex items-center gap-2 text-blue-800 text-sm">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                          Streamlined screening process
                        </div>
                      </div>
                      <Button 
                        onClick={handleSignupAsLandlord}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        data-testid="button-signup-landlord-sidebar"
                      >
                        Sign Up Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* View Stats */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Profile Views</p>
                        <p className="text-xs text-gray-500">This RentCard is being viewed securely</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedRentCard;