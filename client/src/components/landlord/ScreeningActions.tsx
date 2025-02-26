import React from 'react';
import { QrCode, Copy, CheckCircle, RefreshCw, Archive } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useUIStore } from '@/stores/uiStore';
import { ROUTES, CONFIG, generateRoute } from '@/constants';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Link } from "wouter";

/**
 * Props for the ScreeningActions component
 * 
 * @interface ScreeningActionsProps
 * @property {string} screeningLink - The unique slug for the screening page
 * @property {number} propertyId - The ID of the property
 * @property {number} submissionCount - Number of applications submitted
 * @property {number} viewCount - Number of page views
 * @property {boolean} [isArchived=false] - Whether the property is archived
 * @property {() => void} onArchiveToggle - Function to toggle archive status
 */
interface ScreeningActionsProps {
  screeningLink: string;
  propertyId: number;
  submissionCount: number;
  viewCount: number;
  isArchived?: boolean;
  onArchiveToggle: () => void;
}

/**
 * Props for the GeneralScreeningActions component
 * 
 * @interface GeneralScreeningActionsProps
 * @property {string} screeningLink - The unique slug for the general screening page
 * @property {number} submissionCount - Number of applications submitted
 * @property {number} viewCount - Number of page views
 */
interface GeneralScreeningActionsProps {
  screeningLink: string;
  submissionCount: number;
  viewCount: number;
}

/**
 * GeneralScreeningActions component provides actions for the general screening page
 * including QR code generation and link copying
 * 
 * @component
 */
export const GeneralScreeningActions: React.FC<GeneralScreeningActionsProps> = ({ 
  screeningLink, 
  submissionCount, 
  viewCount 
}) => {
  const { 
    dashboard: { 
      showQRCode, 
      showCopyAlert, 
      setShowQRCode, 
      setShowCopyAlert 
    } 
  } = useUIStore();

  const getScreeningPageUrl = (slug: string) => {
    return `${window.location.origin}${generateRoute.generalScreening(slug)}`;
  };

  const handleCopyLink = async () => {
    try {
      const fullUrl = getScreeningPageUrl(screeningLink);
      await navigator.clipboard.writeText(fullUrl);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), CONFIG.TOAST.DEFAULT_DURATION);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs sm:text-sm h-8 sm:h-9"
          onClick={() => setShowQRCode(true)}
        >
          <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Show QR Code
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs sm:text-sm h-8 sm:h-9 relative"
          onClick={handleCopyLink}
        >
          {showCopyAlert ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Copy Link
            </>
          )}
        </Button>
      </div>

      <Link href={ROUTES.LANDLORD.SCREENING}>
        <Button
          variant="secondary"
          size="sm"
          className="w-full text-xs sm:text-sm h-8 sm:h-9"
        >
          <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Edit Screening Page
        </Button>
      </Link>

      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="sm:max-w-md max-w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">General Screening Page QR Code</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Scan this QR code to access your general screening page
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4 sm:p-6">
            <QRCodeSVG
              value={getScreeningPageUrl(screeningLink)}
              size={window.innerWidth < 640 ? 150 : 200}
              level="H"
              includeMargin
              imageSettings={{
                src: "/logo.png",
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowQRCode(false)}
              className="text-xs sm:text-sm h-8 sm:h-9"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/**
 * ScreeningActions component provides actions for property screening pages
 * including QR code generation, link copying, and property archiving
 * 
 * @component
 */
export const ScreeningActions: React.FC<ScreeningActionsProps> = ({ 
  screeningLink, 
  propertyId, 
  submissionCount, 
  viewCount, 
  isArchived = false,
  onArchiveToggle 
}) => {
  const { 
    dashboard: { 
      showQRCode, 
      showCopyAlert, 
      setShowQRCode, 
      setShowCopyAlert 
    } 
  } = useUIStore();

  const getScreeningPageUrl = (slug: string) => {
    return `${window.location.origin}${generateRoute.propertyScreening(slug)}`;
  };

  const handleCopyLink = async () => {
    try {
      const fullUrl = getScreeningPageUrl(screeningLink);
      await navigator.clipboard.writeText(fullUrl);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), CONFIG.TOAST.DEFAULT_DURATION);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs sm:text-sm h-8 sm:h-9"
          onClick={() => setShowQRCode(true)}
          disabled={isArchived}
        >
          <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Show QR Code
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs sm:text-sm h-8 sm:h-9 relative"
          onClick={handleCopyLink}
          disabled={isArchived}
        >
          {showCopyAlert ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Copy Link
            </>
          )}
        </Button>
      </div>

      <Button
        variant={isArchived ? "outline" : "secondary"}
        size="sm"
        className={`w-full text-xs sm:text-sm h-8 sm:h-9 ${isArchived ? "border-green-500 text-green-500 hover:bg-green-50" : "border-amber-500 text-amber-500 hover:bg-amber-50"}`}
        onClick={onArchiveToggle}
      >
        {isArchived ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            Reactivate Property
          </>
        ) : (
          <>
            <Archive className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            Archive Property
          </>
        )}
      </Button>

      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="sm:max-w-md max-w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Screening Page QR Code</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Scan this QR code to access the screening page
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4 sm:p-6">
            <QRCodeSVG
              value={getScreeningPageUrl(screeningLink)}
              size={window.innerWidth < 640 ? 150 : 200}
              level="H"
              includeMargin
              imageSettings={{
                src: "/logo.png",
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowQRCode(false)}
              className="text-xs sm:text-sm h-8 sm:h-9"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScreeningActions; 