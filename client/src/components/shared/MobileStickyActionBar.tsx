import { Button } from "@/components/ui/button";
import { MessageSquare, Share2, Download, Loader2 } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { ShareToken, InsertShareToken } from '@shared/schema';
import { createRentcardShortlinkRequest, generateShortlinkUrl, determineChannel } from '@shared/url-helpers';
import type { ChannelType, ShortlinkResponse } from '@shared/url-helpers';

interface MobileStickyActionBarProps {
  onContactClick: () => void;
  onDownloadClick: () => void;
  isDownloadLoading?: boolean;
  className?: string;
}

// Platform detection utilities
const detectPlatform = () => {
  const userAgent = navigator.userAgent || '';
  const isMobile = /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|tablet/i.test(userAgent);
  
  if (isMobile && !isTablet) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
};

const supportsWebShare = () => {
  return 'share' in navigator && typeof navigator.share === 'function';
};

export default function MobileStickyActionBar({
  onContactClick,
  onDownloadClick,
  isDownloadLoading = false,
  className = ""
}: MobileStickyActionBarProps) {
  const { addToast } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const platform = detectPlatform();
  const hasWebShare = supportsWebShare();

  // Only fetch share tokens if authenticated to avoid 401 errors
  const { data: shareTokens, isLoading: tokensLoading } = useQuery<ShareToken[]>({
    queryKey: ['/api/share-tokens'],
    staleTime: 30000, // Cache for 30 seconds for performance
    enabled: isAuthenticated, // Only run for authenticated users
  });

  // Create share token mutation
  const createTokenMutation = useMutation<ShareToken, Error, Partial<InsertShareToken>>({
    mutationFn: async (tokenData) => {
      const response = await apiRequest('POST', '/api/share-tokens', tokenData);
      if (!response.ok) {
        throw new Error('Failed to create share token');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/share-tokens'] });
    },
  });

  // Create shortlink mutation
  const createShortlinkMutation = useMutation<ShortlinkResponse, Error, any>({
    mutationFn: async (shortlinkData) => {
      const response = await apiRequest('POST', '/api/shortlinks', shortlinkData);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shortlinks'] });
    },
    onError: (error) => {
      console.error('Shortlink creation failed:', error);
    },
  });

  // Find active token or null (only for authenticated users)
  const getActiveToken = (): ShareToken | null => {
    if (!isAuthenticated || !shareTokens || !Array.isArray(shareTokens)) return null;
    
    return shareTokens.find((token: ShareToken) => 
      !token.revoked && 
      (!token.expiresAt || new Date(token.expiresAt) > new Date())
    ) || null;
  };

  const generateShareUrl = (token: string) => {
    return `${window.location.origin}/rentcard/shared/${token}`;
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      }
    } catch (error) {
      console.error('Copy failed:', error);
      return false;
    }
  };

  const nativeShare = async (shareUrl: string, title: string): Promise<boolean> => {
    try {
      if (hasWebShare) {
        await navigator.share({
          title: title,
          text: 'Check out this rental application profile',
          url: shareUrl,
        });
        return true;
      }
    } catch (error) {
      // User canceled or error occurred
      console.error('Native share failed:', error);
    }
    return false;
  };

  const handleShareClick = async () => {
    try {
      let shareUrl: string;
      let willUseNativeShare = false;

      // For unauthenticated users (public viewers), share current URL directly
      if (!isAuthenticated) {
        shareUrl = window.location.href;
        willUseNativeShare = platform === 'mobile' && hasWebShare;

        if (willUseNativeShare) {
          const shareSuccess = await nativeShare(shareUrl, 'RentCard Profile');
          if (shareSuccess) {
            addToast({
              title: 'Shared Successfully!',
              description: 'RentCard has been shared',
              type: 'success'
            });
            return;
          }
          // If native share fails, fallback to copy
        }

        // Copy to clipboard for public users
        const copySuccess = await copyToClipboard(shareUrl);
        
        if (copySuccess) {
          addToast({
            title: 'Link Copied!',
            description: 'Share link copied to clipboard',
            type: 'success'
          });
        } else {
          throw new Error('Failed to copy link');
        }
        return;
      }

      // Authenticated user logic - existing token/shortlink system
      let activeToken = getActiveToken();

      // Set default expiry to 30 days from now
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      // Create token if none exists or all are expired/revoked
      if (!activeToken && !createTokenMutation.isPending) {
        const newToken = await createTokenMutation.mutateAsync({
          scope: 'rentcard',
          expiresAt: thirtyDaysFromNow,
        });
        
        activeToken = newToken;
      }

      if (!activeToken) {
        throw new Error('Unable to create share token');
      }

      // Determine the channel based on platform and share method
      let channel: ChannelType;

      // Platform-specific behavior
      if (platform === 'mobile' && hasWebShare) {
        channel = determineChannel({ platform: 'mobile', method: 'native_share' });
        willUseNativeShare = true;
      } else {
        channel = determineChannel({ platform: 'desktop', method: 'clipboard' });
      }

      // Use the existing token's expiration or the default for new tokens
      const expirationDate = activeToken.expiresAt ? new Date(activeToken.expiresAt) : thirtyDaysFromNow;

      // Create shortlink with proper channel attribution
      const shortlinkRequest = createRentcardShortlinkRequest(
        activeToken.token,
        channel,
        {
          shareTokenId: activeToken.id,
          tenantName: undefined, // Could be enhanced with tenant name
          expiresAt: expirationDate,
        }
      );

      const shortlink = await createShortlinkMutation.mutateAsync(shortlinkRequest);
      shareUrl = generateShortlinkUrl(shortlink.slug, channel);

      if (willUseNativeShare) {
        // Try native share first
        const shareSuccess = await nativeShare(shareUrl, 'RentCard Profile');
        if (shareSuccess) {
          addToast({
            title: 'Shared Successfully!',
            description: 'RentCard has been shared',
            type: 'success'
          });
          return;
        }
        // If native share fails, fallback to copy
      }

      // Desktop and fallback: Copy to clipboard
      const copySuccess = await copyToClipboard(shareUrl);
      
      if (copySuccess) {
        addToast({
          title: 'Link Copied!',
          description: 'Share link copied to clipboard',
          type: 'success'
        });
      } else {
        throw new Error('Failed to copy link');
      }

    } catch (error) {
      console.error('Share failed:', error);
      addToast({
        title: 'Share Failed',
        description: error instanceof Error ? error.message : 'Unable to share RentCard',
        type: 'destructive'
      });
    }
  };

  // Only show loading for authenticated users since public users don't need API calls
  const isShareLoading = isAuthenticated ? (tokensLoading || createTokenMutation.isPending || createShortlinkMutation.isPending) : false;

  return (
    <div 
      className={`
        fixed bottom-0 left-0 right-0 z-50 
        bg-white border-t border-gray-200 shadow-lg
        pb-safe-area-inset-bottom
        xl:hidden
        ${className}
      `}
      role="toolbar"
      aria-label="Mobile actions for tenant profile"
    >
      {/* Gradient overlay for visual separation */}
      <div className="absolute -top-4 left-0 right-0 h-4 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
      
      <div className="px-4 py-3">
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          {/* Contact Button */}
          <Button 
            onClick={onContactClick}
            className="flex flex-col items-center gap-1 h-14 bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 text-white transition-all duration-200"
            data-testid="mobile-action-contact"
            aria-label="Contact this tenant - opens interest submission form"
            tabIndex={0}
          >
            <MessageSquare className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs font-medium">Contact</span>
          </Button>

          {/* Share Button */}
          <Button 
            onClick={handleShareClick}
            disabled={isShareLoading}
            className="flex flex-col items-center gap-1 h-14 bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-300 focus:ring-offset-2 text-white transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            data-testid="mobile-action-share"
            aria-label={isShareLoading ? "Sharing tenant profile..." : "Share this tenant profile"}
            aria-busy={isShareLoading}
            tabIndex={0}
          >
            {isShareLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            ) : (
              <Share2 className="w-5 h-5" aria-hidden="true" />
            )}
            <span className="text-xs font-medium">
              {isShareLoading ? 'Sharing...' : 'Share'}
            </span>
          </Button>

          {/* Download Button */}
          <Button 
            onClick={onDownloadClick}
            disabled={isDownloadLoading}
            className="flex flex-col items-center gap-1 h-14 bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-purple-300 focus:ring-offset-2 text-white transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            data-testid="mobile-action-download"
            aria-label={isDownloadLoading ? "Downloading PDF..." : "Download tenant profile as PDF"}
            aria-busy={isDownloadLoading}
            tabIndex={0}
          >
            {isDownloadLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="w-5 h-5" aria-hidden="true" />
            )}
            <span className="text-xs font-medium">
              {isDownloadLoading ? 'Saving...' : 'Download'}
            </span>
          </Button>
        </div>

        {/* Contextual hint text based on authentication status */}
        <p className="text-center text-xs text-gray-500 mt-2" role="status" aria-live="polite">
          {isAuthenticated ? 'Quick actions for this tenant profile' : 'Actions for this rental profile'}
        </p>
      </div>
    </div>
  );
}