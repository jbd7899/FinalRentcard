import React from 'react';
import { Button } from "@/components/ui/button";
import { Share2, Copy, Loader2, CheckCircle, Smartphone } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { ShareToken, InsertShareToken } from '@shared/schema';

interface OneClickShareButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showText?: boolean;
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
  showText = true 
}: OneClickShareButtonProps) {
  const { addToast } = useUIStore();
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
          text: 'Check out my rental application profile',
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

      // Create token if none exists or all are expired/revoked
      if (!activeToken && !createTokenMutation.isPending) {
        // Set default expiry to 30 days
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        const newToken = await createTokenMutation.mutateAsync({
          scope: 'rentcard',
          expiresAt: thirtyDaysFromNow,
        });
        
        activeToken = newToken;
      }

      if (!activeToken) {
        throw new Error('Unable to create share token');
      }

      shareUrl = generateShareUrl(activeToken.token);

      // Platform-specific behavior
      if (platform === 'mobile') {
        // Try native share first, fallback to copy
        const shareSuccess = await nativeShare(shareUrl, 'My RentCard Profile');
        if (shareSuccess) {
          addToast({
            title: 'Shared Successfully!',
            description: 'Your RentCard has been shared',
            type: 'success'
          });
          return;
        }
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

  const isLoading = tokensLoading || createTokenMutation.isPending;
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

  return (
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
  );
}

export default OneClickShareButton;