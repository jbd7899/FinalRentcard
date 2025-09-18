import React from 'react';
import { Mail, Phone, Send } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { SOCIAL_PROOF_STATS } from '@shared/network-messaging';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * RequestModal component for requesting RentCards from tenants
 * 
 * This modal allows landlords to send RentCard requests to potential tenants
 * via email or SMS with an optional personalized message.
 * 
 * @component
 */
const RequestModal: React.FC = () => {
  const { modal, closeModal } = useUIStore();
  const showRequestModal = modal?.type === 'requestRentCard';

  return (
    <Dialog open={showRequestModal} onOpenChange={() => closeModal()}>
      <DialogContent className="sm:max-w-md max-w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Invite to Network</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          <div>
            <Label className="text-xs sm:text-sm">Tenant Name</Label>
            <Input placeholder="Enter tenant's name" className="text-xs sm:text-sm h-8 sm:h-9 mt-1" />
          </div>

          <div>
            <Label className="text-xs sm:text-sm">Contact Method</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Button variant="outline" className="justify-start text-xs sm:text-sm h-8 sm:h-9">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Email
              </Button>
              <Button variant="outline" className="justify-start text-xs sm:text-sm h-8 sm:h-9">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                SMS
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs sm:text-sm">Email or Phone Number</Label>
            <Input placeholder="Enter contact information" className="text-xs sm:text-sm h-8 sm:h-9 mt-1" />
          </div>

          <div>
            <Label className="text-xs sm:text-sm">Message (Optional)</Label>
            <Textarea
              rows={3}
              placeholder="Add a personal message..."
              defaultValue={`Hi! Join our trusted network of individual landlords and quality tenants. Complete your RentCard profile to apply for my property and connect with individual property owners who make ${SOCIAL_PROOF_STATS.INDIVIDUAL_LANDLORD_DECISIONS}.`}
              className="text-xs sm:text-sm mt-1"
            />
          </div>

          <Button className="w-full text-xs sm:text-sm h-8 sm:h-9">
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            Send Network Invitation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestModal; 