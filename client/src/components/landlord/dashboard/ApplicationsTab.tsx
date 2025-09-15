import React from 'react';
import {
  Inbox,
  ExternalLink,
  FileText,
  AlertCircle
} from 'lucide-react';
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
        <h2 className="text-base sm:text-lg font-semibold flex items-center">
          <Inbox className="w-5 h-5 mr-2 text-primary" />
          Recent Interests
        </h2>
        <Button 
          onClick={() => setLocation(ROUTES.LANDLORD.INTERESTS)} 
          className="text-xs sm:text-sm h-9 sm:h-10"
        >
          <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 sm:mr-3" />
          View All Interests
        </Button>
      </div>

      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="text-center p-8 sm:p-10">
            <Inbox className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4 sm:mb-5" />
            <p className="text-muted-foreground text-sm sm:text-base">Interests will appear here</p>
            <Button 
              variant="link" 
              className="mt-2 sm:mt-3 text-xs sm:text-sm"
              onClick={() => openModal('requestRentCard')}
            >
              Request a RentCard to get started
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-amber-500" />
          Documents Needing Verification
        </h2>
        <Card>
          <CardContent className="p-5 sm:p-6">
            <div className="text-center p-8 sm:p-10">
              <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4 sm:mb-5" />
              <p className="text-muted-foreground text-sm sm:text-base">No documents pending verification</p>
              <Button 
                variant="link" 
                className="mt-2 sm:mt-3 text-xs sm:text-sm"
                onClick={() => setLocation(ROUTES.LANDLORD.VERIFY_DOCUMENTS)}
              >
                Go to document verification
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InterestsTab; 