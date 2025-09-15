import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Building2,
  Briefcase,
  DollarSign,
  CreditCard,
  CheckCircle,
  Share2,
  Download,
  Loader2,
  Info,
  User,
  MessageSquare,
  Phone,
  Calendar,
  Clock,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MESSAGES, APPLICATION_LABELS, ROUTES } from '@/constants';
import { useAuthStore } from '@/stores/authStore';
import { useParams } from 'wouter';
import TenantLayout from '@/components/layouts/TenantLayout';
import { EnhancedShareModal } from '@/components/shared/EnhancedShareModal';


const RentCard = () => {
  const { setLoading, loadingStates, addToast } = useUIStore();
  const { user } = useAuthStore();
  const { slug } = useParams();
  const isPublicView = Boolean(slug);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Demo data
  const rentCardData = {
    tenant: {
      name: "Sarah Johnson",
      email: "sarah@email.com",
      phone: "(555) 123-4567",
      since: "January 2025"
    },
    score: {
      overall: 4.8,
      payment: 5.0,
      maintenance: 4.7,
      communication: 4.8
    },
    employment: {
      status: "Full-time",
      employer: "Tech Company Inc.",
      position: "Software Developer",
      income: "85,000",
      duration: "3+ years"
    },
    creditInfo: {
      score: "720-750",
      history: "Good standing"
    },
    references: [
      {
        name: "Robert Wilson",
        property: "Parkview Apartments",
        dates: "Jan 2023 - Dec 2024",
        rating: 5,
        payment: APPLICATION_LABELS.PAYMENT_HISTORY.ON_TIME,
        propertyCondition: APPLICATION_LABELS.PROPERTY_CONDITION.EXCELLENT,
        highlights: ["Always paid on time", "Excellent property maintenance", "Quiet and respectful"],
        verified: true
      },
      {
        name: "Emily Davis",
        property: "Riverfront Residences",
        dates: "Mar 2020 - Dec 2022",
        rating: 4.8,
        payment: APPLICATION_LABELS.PAYMENT_HISTORY.ON_TIME,
        propertyCondition: APPLICATION_LABELS.PROPERTY_CONDITION.GOOD,
        highlights: ["Consistent payment history", "Good communication", "Followed all rules"],
        verified: true
      }
    ]
  };

  const handleShare = () => {
    setShareModalOpen(true);
  };

  const handleDownloadPDF = async () => {
    try {
      setLoading('downloadPDF', true);
      const element = document.getElementById('rentcard-content');
      if (!element) {
        throw new Error(MESSAGES.ERRORS.GENERAL);
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
      pdf.save(`${rentCardData.tenant.name.replace(' ', '_')}_RentCard.pdf`);

      addToast({
        title: MESSAGES.SUCCESS.SAVED,
        description: "RentCard downloaded successfully",
        type: 'success'
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      addToast({
        title: MESSAGES.ERRORS.GENERAL,
        description: MESSAGES.ERRORS.GENERAL,
        type: 'destructive'
      });
    } finally {
      setLoading('downloadPDF', false);
    }
  };

  // Generate the rentcard URL based on whether we're in public or private view
  const rentCardUrl = isPublicView 
    ? window.location.href 
    : user 
      ? `${window.location.origin}/rentcard/${user.email.split('@')[0]}-${user.id}`
      : window.location.href;

  return (
    <TenantLayout activeRoute={ROUTES.TENANT.RENTCARD}>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden" id="rentcard-content">
          {/* Header with Logo and Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-4 sm:p-6 lg:p-8 text-white relative">
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              {(!isPublicView || (user && slug === `${user.email.split('@')[0]}-${user.id}`)) && (
                <Button 
                  variant="outline"
                  onClick={handleShare}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  disabled={loadingStates.downloadPDF}
                  data-testid="button-share-rentcard"
                >
                  <Share2 className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={handleDownloadPDF}
                className="bg-white text-blue-600 hover:bg-blue-50"
                disabled={loadingStates.downloadPDF}
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
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">{rentCardData.tenant.name}</h2>
                    <p className="text-blue-100">Member since {rentCardData.tenant.since}</p>
                  </div>
                </div>

                {/* Verification and Score */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <span className="bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                    Verified Profile
                  </span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Star className="w-6 h-6 text-yellow-300 fill-current" />
                      <span className="text-xl font-bold text-white">{rentCardData.score.overall}</span>
                      <span className="text-blue-100 whitespace-nowrap">Profile Completeness</span>
                    </div>
                    <p className="text-sm text-blue-100 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-8 bg-gray-50">
            <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-800">
              Key Information
              <span className="ml-2 cursor-help" title="Overview of tenant's profile">
                <Info className="w-4 h-4 text-gray-500" />
              </span>
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center mb-2">
                  <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-700">Income</span>
                </div>
                <p className="text-gray-600">${rentCardData.employment.income}/year</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center mb-2">
                  <Briefcase className="w-6 h-6 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-700">Employment</span>
                </div>
                <p className="text-gray-600">{rentCardData.employment.status} ({rentCardData.employment.duration})</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center mb-2">
                  <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-700">Credit Score</span>
                </div>
                <p className="text-gray-600">{rentCardData.creditInfo.score}</p>
              </div>
            </div>
          </div>

          {/* Rental History */}
          <div className="p-8 border-t border-gray-200">
            <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-800">
              Rental History
              <span className="ml-2 cursor-help" title="Previous rental experiences">
                <Info className="w-4 h-4 text-gray-500" />
              </span>
            </h3>
            <div className="space-y-6">
              {rentCardData.references.map((ref, index) => (
                <div key={index} className="flex items-start pb-4 border-b last:border-b-0">
                  <Building2 className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <p className="font-medium text-gray-800">{ref.property}</p>
                    <p className="text-gray-600">{ref.dates}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {ref.highlights.map((highlight, i) => (
                        <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center mr-4">
                        {[...Array(Math.floor(ref.rating))].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">{ref.rating}</span>
                      </div>
                      {ref.verified && (
                        <span className="flex items-center text-sm text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Landlord References */}
          <div className="p-8 bg-gray-50 border-t border-gray-200">
            <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-800">
              Landlord References
              <span className="ml-2 cursor-help" title="References from previous landlords">
                <Info className="w-4 h-4 text-gray-500" />
              </span>
            </h3>
            <div className="space-y-6">
              {rentCardData.references.map((ref, index) => (
                <div key={index} className="flex items-start pb-4 border-b last:border-b-0">
                  <MessageSquare className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <p className="font-medium text-gray-800">{ref.name}</p>
                    <p className="text-gray-600">{ref.property}</p>
                    <p className="text-gray-600">Rental Period: {ref.dates}</p>
                    <div className="mt-2">
                      <Badge variant="outline" className="mr-2">
                        Payment: {ref.payment}
                      </Badge>
                      <Badge variant="outline">
                        Property Condition: {ref.propertyCondition}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Share Modal */}
        <EnhancedShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          resourceType="rentcard"
          title="Share Your RentCard"
          description="Share your rental profile with landlords and property managers"
        />
      </div>
    </TenantLayout>
  );
};

export default RentCard;