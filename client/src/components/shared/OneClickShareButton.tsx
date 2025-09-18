import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Share2, Copy, Loader2, CheckCircle, Smartphone, Users, ChevronDown } from 'lucide-react';
import { SOCIAL_PROOF_STATS } from '@/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUIStore } from '@/stores/uiStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { ShareToken, InsertShareToken } from '@shared/schema';
import { createRentcardShortlinkRequest, generateShortlinkUrl, determineChannel } from '@shared/url-helpers';
import type { ChannelType, ShortlinkResponse } from '@shared/url-helpers';
import { EnhancedShareDialog } from '../sharing/EnhancedShareDialog';

interface OneClickShareButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showText?: boolean;
  mode?: 'simple' | 'enhanced' | 'dropdown';
  showEnhancedOption?: boolean;
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
  return 'share' in navigator && navigator.share;
};

export function OneClickShareButton({ 
  variant = 'default', 
  size = 'default', 
  className = '', 
  showText = true,
  mode = 'simple',
  showEnhancedOption = true,
}: OneClickShareButtonProps) {
  const { addToast } = useUIStore();
  const [showEnhancedDialog, setShowEnhancedDialog] = useState(false);
  const queryClient = useQueryClient();
  const platform = detectPlatform();
  const hasWebShare = supportsWebShare();

  // Fetch existing share tokens to find active one
  const { data: shareTokens, isLoading: tokensLoading } = useQuery<ShareToken[]>({
    queryKey: ['/api/share-tokens'],
    staleTime: 30000, // Cache for 30 seconds for performance
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

  // Find active token or null
  const getActiveToken = (): ShareToken | null => {
    if (!shareTokens || !Array.isArray(shareTokens)) return null;
    
    return shareTokens.find((token: ShareToken) => 
      !token.revoked && 
      (!token.expiresAt || new Date(token.expiresAt) > new Date())
    ) || null;
  };

  const generateShareUrl = (token: string) => {
    return `${window.location.origin}/rentcard/shared/${token}`;
  };

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
          text: `Join ${SOCIAL_PROOF_STATS.VERIFIED_RENTERS} verified renters! Check out my trusted network profile:`,
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

  const handleOneClickShare = async () => {
    try {
      let activeToken = getActiveToken();
      let shareUrl: string;

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
      let willUseNativeShare = false;

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
        const shareSuccess = await nativeShare(shareUrl, 'My RentCard Profile');
        if (shareSuccess) {
          addToast({
            title: 'Network Profile Shared!',
            description: 'Your trusted network profile has been shared - helping grow our community!',
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
          title: 'Network Link Copied!',
          description: 'Your trusted network profile link copied to clipboard - ready to share!',
          type: 'success'
        });
      } else {
        throw new Error('Failed to copy link');
      }

    } catch (error) {
      console.error('Share failed:', error);
      let errorMessage = 'Unable to share RentCard';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid shortlink data')) {
          errorMessage = 'Failed to create share link - invalid data format';
        } else if (error.message.includes('Forbidden')) {
          errorMessage = 'Permission denied - please refresh and try again';
        } else if (error.message.includes('Unable to create share token')) {
          errorMessage = 'Failed to create secure sharing token';
        } else if (error.message.includes('Failed to create shortlink')) {
          errorMessage = 'Share link generation failed - please try again';
        } else if (error.message.includes('Failed to copy')) {
          errorMessage = 'Link copied but clipboard access failed';
        } else {
          errorMessage = error.message;
        }
      }
      
      addToast({
        title: 'Share Failed',
        description: errorMessage,
        type: 'destructive'
      });
    }
  };

  const isLoading = tokensLoading || createTokenMutation.isPending || createShortlinkMutation.isPending;
  const hasActiveToken = !!getActiveToken();

  // Dynamic icon based on platform and state
  const getIcon = () => {
    if (isLoading) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (hasActiveToken && platform === 'desktop') return <Copy className="w-4 h-4" />;
    if (platform === 'mobile') return <Share2 className="w-4 h-4" />;
    return <Share2 className="w-4 h-4" />;
  };

  // Dynamic text based on platform and state
  const getText = () => {
    if (!showText) return null;
    if (isLoading) return 'Preparing...';
    if (hasActiveToken && platform === 'desktop') return 'Copy Link';
    if (platform === 'mobile') return 'Share';
    return 'Share RentCard';
  };

  // Handle enhanced sharing
  const handleEnhancedShare = () => {
    setShowEnhancedDialog(true);
  };

  // Render based on mode
  if (mode === 'enhanced') {
    return (
      <>
        <Button
          variant={variant}
          size={size}
          className={`${className} transition-all duration-200`}
          onClick={handleEnhancedShare}
          disabled={isLoading}
          data-testid="button-enhanced-share"
        >
          <Users className="w-4 h-4" />
          {showText && <span className="ml-2">Share with Contact</span>}
        </Button>
        
        <EnhancedShareDialog
          open={showEnhancedDialog}
          onClose={() => setShowEnhancedDialog(false)}
        />
      </>
    );
  }

  if (mode === 'dropdown' && showEnhancedOption) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={variant}
              size={size}
              className={`${className} transition-all duration-200`}
              disabled={isLoading}
              data-testid="button-share-dropdown"
            >
              {getIcon()}
              {getText() && <span className="ml-2">{getText()}</span>}
              <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleOneClickShare}
              disabled={isLoading}
              data-testid="option-quick-share"
            >
              {getIcon()}
              <span className="ml-2">
                {platform === 'mobile' && hasWebShare ? 'Quick Share' : 'Copy Link'}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleEnhancedShare}
              disabled={isLoading}
              data-testid="option-enhanced-share"
            >
              <Users className="w-4 h-4" />
              <span className="ml-2">Share with Contact</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <EnhancedShareDialog
          open={showEnhancedDialog}
          onClose={() => setShowEnhancedDialog(false)}
        />
      </>
    );
  }

  // Default simple mode
  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`${className} transition-all duration-200`}
        onClick={handleOneClickShare}
        disabled={isLoading}
        data-testid="button-one-click-share"
      >
        {getIcon()}
        {getText() && <span className="ml-2">{getText()}</span>}
      </Button>

      {showEnhancedOption && (
        <EnhancedShareDialog
          open={showEnhancedDialog}
          onClose={() => setShowEnhancedDialog(false)}
        />
      )}
    </>
  );
}

export default OneClickShareButton;