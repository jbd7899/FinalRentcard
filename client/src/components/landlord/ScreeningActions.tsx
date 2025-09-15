import React, { useState } from 'react';
import { QrCode, Copy, CheckCircle, RefreshCw, Archive, FileText, Settings } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useUIStore } from '@/stores/uiStore';
import { ROUTES, CONFIG, generateRoute } from '@/constants';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { PropertyQRCode, Property } from '@shared/schema';
import QRCodeModal from './QRCodeModal';
import { useToast } from '@/components/ui/use-toast';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Link, useLocation } from "wouter";

/**
 * Component to display Quick QR with trackable URL functionality
 */
interface QuickQRDisplayProps {
  qrCodes: PropertyQRCode[] | undefined;
  screeningLink: string;
  getDefaultQRCode: () => Promise<PropertyQRCode | null>;
  getTrackableQRUrl: (qrCodeId: number) => string;
  isCreatingQR: boolean;
}

const QuickQRDisplay: React.FC<QuickQRDisplayProps> = ({ 
  qrCodes, 
  screeningLink, 
  getDefaultQRCode, 
  getTrackableQRUrl, 
  isCreatingQR 
}) => {
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const initializeQR = async () => {
      setIsLoading(true);
      try {
        // Try to get an existing active QR code
        if (qrCodes && qrCodes.length > 0) {
          const activeQR = qrCodes.find(qr => qr.isActive);
          if (activeQR) {
            setQrCodeUrl(getTrackableQRUrl(activeQR.id));
            setIsLoading(false);
            return;
          }
        }

        // Create a default QR code if none exists
        const defaultQR = await getDefaultQRCode();
        if (defaultQR) {
          setQrCodeUrl(getTrackableQRUrl(defaultQR.id));
        } else {
          // Fallback to direct URL if QR creation fails
          setQrCodeUrl(`${window.location.origin}/screening/${screeningLink}`);
        }
      } catch (error) {
        console.error('Failed to initialize QR code:', error);
        // Fallback to direct URL
        setQrCodeUrl(`${window.location.origin}/screening/${screeningLink}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeQR();
  }, [qrCodes, screeningLink, getDefaultQRCode, getTrackableQRUrl]);

  if (isLoading || isCreatingQR) {
    return (
      <div className="flex items-center justify-center p-4 sm:p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">
            {isCreatingQR ? 'Creating QR code...' : 'Loading QR code...'}
          </p>
        </div>
      </div>
    );
  }

  if (!qrCodeUrl) {
    return (
      <div className="flex items-center justify-center p-4 sm:p-6">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Failed to load QR code</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4 sm:p-6">
      <QRCodeSVG
        value={qrCodeUrl}
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
  );
};

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
  property?: Property;
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
  const [, setLocation] = useLocation();

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

  const handleEditScreeningPage = () => {
    setLocation(generateRoute.editGeneralScreening(screeningLink));
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

      <Button
        variant="default"
        size="sm"
        className="w-full text-xs sm:text-sm h-8 sm:h-9 bg-blue-600 hover:bg-blue-700"
        onClick={handleEditScreeningPage}
      >
        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
        Edit Screening Page
      </Button>

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
  onArchiveToggle,
  property
}) => {
  const { 
    dashboard: { 
      showQRCode, 
      showCopyAlert, 
      setShowQRCode, 
      setShowCopyAlert 
    } 
  } = useUIStore();
  const [, setLocation] = useLocation();
  const [showAdvancedQRModal, setShowAdvancedQRModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch QR codes for this property
  const { data: qrCodes } = useQuery<PropertyQRCode[]>({
    queryKey: ['/api/properties', propertyId, 'qrcodes'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/properties/${propertyId}/qrcodes`);
      return response.json();
    },
    enabled: !!propertyId && !isArchived,
  });

  // Mutation to create a default QR code
  const createDefaultQRMutation = useMutation({
    mutationFn: async (): Promise<PropertyQRCode> => {
      const response = await apiRequest('POST', `/api/properties/${propertyId}/qrcodes`, {
        title: 'Default Property QR',
        description: 'Quick access QR code for property screening',
        qrCodeData: `${window.location.origin}${generateRoute.propertyScreening(screeningLink)}`
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties', propertyId, 'qrcodes'] });
    },
    onError: (error) => {
      console.error('Failed to create default QR code:', error);
      toast({
        title: "Error",
        description: "Failed to create QR code. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Calculate total QR code scans
  const totalQRScans = qrCodes?.reduce((sum, qr) => sum + (qr.scanCount || 0), 0) || 0;

  // Get or create default QR code for Quick QR functionality
  const getDefaultQRCode = async (): Promise<PropertyQRCode | null> => {
    // If we have existing QR codes, use the first active one
    if (qrCodes && qrCodes.length > 0) {
      const activeQR = qrCodes.find(qr => qr.isActive);
      if (activeQR) return activeQR;
    }
    
    // Create a new default QR code
    try {
      return await createDefaultQRMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to create default QR code:', error);
      return null;
    }
  };

  const getTrackableQRUrl = (qrCodeId: number) => {
    return `${window.location.origin}/qr/${qrCodeId}`;
  };

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

  const handleEditScreeningPage = () => {
    setLocation(generateRoute.editPropertyScreening(screeningLink));
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
          data-testid="button-show-qr-quick"
        >
          <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Quick QR
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs sm:text-sm h-8 sm:h-9 relative"
          onClick={handleCopyLink}
          disabled={isArchived}
          data-testid="button-copy-link"
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
        variant="default"
        size="sm"
        className="w-full text-xs sm:text-sm h-8 sm:h-9 bg-primary hover:bg-primary/90"
        onClick={() => setShowAdvancedQRModal(true)}
        disabled={isArchived}
        data-testid="button-manage-qr-codes"
      >
        <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
        QR Manager ({qrCodes?.length || 0})
        {totalQRScans > 0 && (
          <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
            {totalQRScans} scans
          </span>
        )}
      </Button>
      
      <Button
        variant="default"
        size="sm"
        className="w-full text-xs sm:text-sm h-8 sm:h-9 bg-blue-600 hover:bg-blue-700"
        onClick={handleEditScreeningPage}
        disabled={isArchived}
      >
        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
        Edit Screening Page
      </Button>

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
            <DialogTitle className="text-base sm:text-lg">Quick QR Code</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Scan this QR code to access the screening page via trackable URL
            </DialogDescription>
          </DialogHeader>
          <QuickQRDisplay 
            qrCodes={qrCodes} 
            screeningLink={screeningLink}
            getDefaultQRCode={getDefaultQRCode}
            getTrackableQRUrl={getTrackableQRUrl}
            isCreatingQR={createDefaultQRMutation.isPending}
          />
          <div className="text-center text-xs text-muted-foreground mb-4">
            QR codes are trackable • For advanced features, use QR Manager above
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowQRCode(false)}
              className="text-xs sm:text-sm h-8 sm:h-9"
              data-testid="button-close-quick-qr"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Advanced QR Code Modal */}
      {property && (
        <QRCodeModal
          isOpen={showAdvancedQRModal}
          onClose={() => setShowAdvancedQRModal(false)}
          property={property}
          existingQRCodes={qrCodes || []}
        />
      )}
    </div>
  );
};

export default ScreeningActions; 