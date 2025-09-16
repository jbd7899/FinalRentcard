import React from 'react';
import {
  Inbox,
  ExternalLink,
  FileText,
  AlertCircle
} from 'lucide-react';
import { ComingSoonCard, ComingSoonBadge } from "@/components/ui/coming-soon";
import { ROUTES } from '@/constants';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * InterestsTab component displays recent interests and documents
 * that need verification for the landlord
 */
interface InterestsTabProps {
  openModal: (modalType: string) => void;
  setLocation: (path: string) => void;
}

const InterestsTab: React.FC<InterestsTabProps> = ({
  openModal,
  setLocation,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4 sm:mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-semibold flex items-center">
            <Inbox className="w-5 h-5 mr-2 text-primary" />
            Recent Interests
          </h2>
          <ComingSoonBadge type="feature" size="sm" title="Beta" />
        </div>
        <Button 
          onClick={() => setLocation(ROUTES.LANDLORD.INTERESTS)} 
          className="text-xs sm:text-sm h-9 sm:h-10"
        >
          <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 sm:mr-3" />
          View All Interests
        </Button>
      </div>

      <ComingSoonCard
        type="feature"
        title="Interest Tracking"
        description="Real-time interest tracking and automated lead management coming soon. This will help you manage all tenant inquiries in one place."
        estimatedDate="Q2 2025"
      >
        <Button 
          variant="outline"
          className="mt-2 text-xs sm:text-sm"
          onClick={() => openModal('requestRentCard')}
        >
          Request a RentCard to get started
        </Button>
      </ComingSoonCard>

      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base sm:text-lg font-semibold flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-amber-500" />
            Documents Needing Verification
          </h2>
          <ComingSoonBadge type="feature" size="sm" title="Beta" />
        </div>
        <ComingSoonCard
          type="feature"
          title="Automated Document Verification"
          description="AI-powered document verification and automated tenant screening coming soon. This will streamline your verification process significantly."
          estimatedDate="Q2 2025"
        >
          <Button 
            variant="outline" 
            className="mt-2 text-xs sm:text-sm"
            onClick={() => setLocation(ROUTES.LANDLORD.VERIFY_DOCUMENTS)}
          >
            Preview document verification
          </Button>
        </ComingSoonCard>
      </div>
    </div>
  );
};

export default InterestsTab; 