import React from 'react';
import { User, Building2, DollarSign, Briefcase, MapPin, Mail, Phone, Star } from 'lucide-react';

interface LiveRentCardPreviewProps {
  essentialsData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    city?: string;
    state?: string;
    maxRent?: number;
  };
  employmentData?: {
    employmentStatus?: string;
    employer?: string;
    jobTitle?: string;
    monthlyIncome?: number;
    employmentDuration?: string;
  };
  documentsData?: {
    hasDocuments?: boolean;
    documentTypes?: string[];
  };
  currentStep?: number;
}

const LiveRentCardPreview: React.FC<LiveRentCardPreviewProps> = ({
  essentialsData,
  employmentData,
  documentsData,
  currentStep = 1
}) => {
  const displayName = essentialsData?.firstName && essentialsData?.lastName 
    ? `${essentialsData.firstName} ${essentialsData.lastName}`
    : 'Your Name';

  const displayLocation = essentialsData?.city && essentialsData?.state
    ? `${essentialsData.city}, ${essentialsData.state}`
    : 'Your Location';

  const displayMaxRent = essentialsData?.maxRent 
    ? `$${essentialsData.maxRent.toLocaleString()}/month`
    : '$1,500/month';

  const displayEmployment = employmentData?.employmentStatus || 'Employment Status';
  const displayIncome = employmentData?.monthlyIncome 
    ? `$${employmentData.monthlyIncome.toLocaleString()}/month`
    : 'Monthly Income';

  const completionPercentage = Math.min(((currentStep - 1) / 3) * 100, 100);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-5 h-5" />
          <span className="font-semibold">MyRentCard</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`font-bold text-lg ${displayName === 'Your Name' ? 'text-blue-200' : 'text-white'}`}>
              {displayName}
            </h3>
            <div className="flex items-center gap-1 text-blue-100">
              <MapPin className="w-3 h-3" />
              <span className="text-sm">{displayLocation}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-blue-100 mb-1">
            <span>Profile Completion</span>
            <span>{Math.round(completionPercentage)}%</span>
          </div>
          <div className="w-full bg-blue-400/30 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Contact Info */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800 text-sm">Contact Information</h4>
          <div className="space-y-1 text-sm">
            <div className={`flex items-center gap-2 ${essentialsData?.email ? 'text-gray-700' : 'text-gray-400'}`}>
              <Mail className="w-3 h-3" />
              <span>{essentialsData?.email || 'Email address'}</span>
            </div>
            <div className={`flex items-center gap-2 ${essentialsData?.phone ? 'text-gray-700' : 'text-gray-400'}`}>
              <Phone className="w-3 h-3" />
              <span>{essentialsData?.phone || 'Phone number'}</span>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="font-medium text-gray-800 text-sm">Budget Range</span>
          </div>
          <div className={`text-lg font-bold ${essentialsData?.maxRent ? 'text-green-600' : 'text-gray-400'}`}>
            Up to {displayMaxRent}
          </div>
        </div>

        {/* Employment - Shows when step 2+ */}
        {currentStep >= 2 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800 text-sm">Employment</h4>
            <div className="space-y-1">
              <div className={`flex items-center gap-2 ${employmentData?.employmentStatus ? 'text-gray-700' : 'text-gray-400'}`}>
                <Briefcase className="w-3 h-3" />
                <span className="text-sm">{displayEmployment}</span>
              </div>
              {employmentData?.employer && (
                <div className="text-sm text-gray-600 ml-5">
                  {employmentData.jobTitle ? `${employmentData.jobTitle} at ` : ''}
                  {employmentData.employer}
                </div>
              )}
              {employmentData?.monthlyIncome && (
                <div className="text-sm font-medium text-green-600 ml-5">
                  {displayIncome}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents - Shows when step 3+ */}
        {currentStep >= 3 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800 text-sm">Documents</h4>
            {documentsData?.hasDocuments && documentsData?.documentTypes?.length ? (
              <div className="space-y-1">
                {documentsData.documentTypes.map((docType, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-green-600">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{docType.charAt(0).toUpperCase() + docType.slice(1)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400">
                Documents will be added later
              </div>
            )}
          </div>
        )}

        {/* Preview indicator */}
        <div className="pt-2 border-t border-gray-100 text-center">
          <div className="text-xs text-gray-500">
            🚀 Live Preview - Updates as you type
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveRentCardPreview;