import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Copy, 
  Share2, 
  QrCode, 
  Mail, 
  MessageSquare, 
  ExternalLink,
  RefreshCw,
  Check,
  Link2,
  TrendingUp,
  Eye,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/authStore";
import type { ReferralLink } from "./types";

// Updated interface to work with userId instead of currentLink
interface ReferralLinkGeneratorProps {
  userId?: number;
  onLinkGenerated?: (link: ReferralLink) => void;
  className?: string;
}

interface ShareOptionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline';
}

function ShareOption({ icon, label, description, onClick, disabled, variant = 'outline' }: ShareOptionProps) {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      className="h-auto p-4 flex-col items-start space-y-2 w-full"
      data-testid={`share-option-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center gap-2 w-full">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <span className="text-xs text-gray-500 text-left">{description}</span>
    </Button>
  );
}

function QRCodeDisplay({ url, size = 120 }: { url: string; size?: number }) {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="border rounded-lg p-2 bg-white">
        <img 
          src={qrCodeUrl} 
          alt="Referral QR Code" 
          className="block"
          width={size}
          height={size}
          data-testid="qr-code-image"
        />
      </div>
      <p className="text-xs text-gray-500 text-center">Scan to visit referral link</p>
    </div>
  );
}

export function ReferralLinkGenerator({ 
  userId, 
  onLinkGenerated, 
  className 
}: ReferralLinkGeneratorProps) {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});
  const [showQRCode, setShowQRCode] = useState(false);
  
  // Use userId from props or fallback to current user
  const targetUserId = userId || user?.id;

  // Fetch or generate user's referral link
  const { 
    data: referralLinkData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/referrals/link', targetUserId],
    queryFn: async () => {
      if (!targetUserId) {
        throw new Error('User ID is required');
      }
      
      // First try to get existing referral code from user stats
      const statsResponse = await fetch(`/api/referrals/stats/${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        const recentReferrals = statsData.recentReferrals || [];
        
        if (recentReferrals.length > 0) {
          // Use the most recent referral code to build link
          const referralCode = recentReferrals[0].referralCode;
          return {
            code: referralCode,
            url: `${window.location.origin}/join?ref=${referralCode}`,
            shortUrl: `${window.location.origin}/r/${referralCode.slice(-6)}`,
            createdAt: recentReferrals[0].createdAt,
            clickCount: 0, // We'll need to implement click tracking
            conversionCount: recentReferrals.filter((r: any) => r.status === 'converted').length,
            isActive: true
          };
        }
      }
      
      // If no existing referral code, return null to show generate state
      return null;
    },
    enabled: !!targetUserId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1
  });
  
  const currentLink = referralLinkData;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [label]: true }));
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [label]: false }));
      }, 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const shareViaEmail = () => {
    if (!currentLink) return;
    
    const subject = encodeURIComponent("Join MyRentCard with my referral link!");
    const body = encodeURIComponent(
      `Hi there!\n\nI'd like to invite you to join MyRentCard, the easiest way to create and share rental applications.\n\nUse my referral link to get started:\n${currentLink.url}\n\nBest regards!`
    );
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
  };

  const shareViaSMS = () => {
    if (!currentLink) return;
    
    const message = encodeURIComponent(
      `Join MyRentCard with my referral link and simplify your rental applications: ${currentLink.shortUrl || currentLink.url}`
    );
    const smsUrl = `sms:?body=${message}`;
    window.location.href = smsUrl;
  };

  const shareViaWebShare = async () => {
    if (!currentLink) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join MyRentCard',
          text: 'Simplify your rental applications with MyRentCard',
          url: currentLink.shortUrl || currentLink.url,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Web share cancelled or failed');
      }
    } else {
      // Fallback to copying
      copyToClipboard(currentLink.shortUrl || currentLink.url, 'Referral link');
    }
  };

  const generateLinkMutation = useMutation({
    mutationFn: async () => {
      if (!targetUserId) {
        throw new Error('User ID is required');
      }
      
      // Create a referral entry to get a referral code
      const response = await fetch('/api/referrals/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          referrerUserId: targetUserId,
          referrerType: 'tenant',
          referrerEmail: user?.email || '',
          refereeEmail: 'placeholder@example.com', // This will be replaced when someone actually uses the link
          refereeType: 'tenant',
          referralSource: 'direct_link'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to generate referral link');
      }
      
      const data = await response.json();
      const referralCode = data.referral.referralCode;
      
      return {
        code: referralCode,
        url: `${window.location.origin}/join?ref=${referralCode}`,
        shortUrl: `${window.location.origin}/r/${referralCode.slice(-6)}`,
        createdAt: new Date().toISOString(),
        clickCount: 0,
        conversionCount: 0,
        isActive: true
      };
    },
    onSuccess: (newLink) => {
      toast({
        title: "New Link Generated",
        description: "Your new referral link is ready to share!",
      });
      
      // Update cache and notify parent
      queryClient.setQueryData(['/api/referrals/link', targetUserId], newLink);
      if (onLinkGenerated) {
        onLinkGenerated(newLink);
      }
      
      // Refresh the referral stats to show new data
      queryClient.invalidateQueries({ queryKey: ['/api/referrals/stats', targetUserId] });
    },
    onError: (error) => {
      console.error('Failed to generate referral link:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unable to generate referral link",
        variant: "destructive"
      });
    }
  });
  
  const generateNewLink = () => {
    setIsGenerating(true);
    generateLinkMutation.mutate();
    setIsGenerating(false);
  };

  if (!currentLink) {
    return (
      <Card className={cn("", className)} data-testid="referral-link-generator-empty">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-600" />
            Generate Referral Link
          </CardTitle>
          <CardDescription>
            Create your personalized referral link to start earning rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Active Referral Link</h3>
            <p className="text-gray-500 mb-6">Generate your first referral link to start inviting friends</p>
            <Button 
              onClick={generateNewLink} 
              disabled={isGenerating}
              data-testid="button-generate-first-link"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 mr-2" />
                  Generate Referral Link
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)} data-testid="referral-link-generator">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-600" />
              Share Your Referral Link
            </CardTitle>
            <CardDescription>
              Invite friends and earn rewards for successful referrals
            </CardDescription>
          </div>
          <Badge variant="outline" className="hidden sm:flex">
            <TrendingUp className="w-3 h-3 mr-1" />
            {currentLink.conversionCount > 0 ? (
              `${Math.round((currentLink.conversionCount / Math.max(currentLink.clickCount, 1)) * 100)}% conversion`
            ) : (
              'New link'
            )}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Link Display */}
        <div className="space-y-2">
          <Label htmlFor="referral-url">Your Referral Link</Label>
          <div className="flex gap-2">
            <Input
              id="referral-url"
              value={currentLink.shortUrl || currentLink.url}
              readOnly
              className="font-mono text-sm"
              data-testid="input-referral-url"
            />
            <Button
              onClick={() => copyToClipboard(currentLink.shortUrl || currentLink.url, 'Referral link')}
              variant="outline"
              size="sm"
              data-testid="button-copy-link"
            >
              {copiedStates['Referral link'] ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Link Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
              <Eye className="w-3 h-3" />
              <span className="text-xs">Clicks</span>
            </div>
            <div className="font-semibold" data-testid="link-clicks">{currentLink.clickCount}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
              <Users className="w-3 h-3" />
              <span className="text-xs">Conversions</span>
            </div>
            <div className="font-semibold" data-testid="link-conversions">{currentLink.conversionCount}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs">Rate</span>
            </div>
            <div className="font-semibold" data-testid="link-conversion-rate">
              {currentLink.clickCount > 0 ? 
                `${Math.round((currentLink.conversionCount / currentLink.clickCount) * 100)}%` : 
                '0%'
              }
            </div>
          </div>
        </div>

        {/* Share Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <ShareOption
            icon={<Copy className="w-4 h-4" />}
            label="Copy Link"
            description="Copy to clipboard"
            onClick={() => copyToClipboard(currentLink.shortUrl || currentLink.url, 'Referral link')}
          />
          
          <ShareOption
            icon={<Mail className="w-4 h-4" />}
            label="Email"
            description="Share via email"
            onClick={shareViaEmail}
          />
          
          <ShareOption
            icon={<MessageSquare className="w-4 h-4" />}
            label="SMS"
            description="Send via text"
            onClick={shareViaSMS}
          />
          
          <ShareOption
            icon={<ExternalLink className="w-4 h-4" />}
            label="More"
            description="Native share menu"
            onClick={shareViaWebShare}
          />
        </div>

        {/* QR Code Section */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">QR Code</h3>
              <p className="text-sm text-gray-500">For easy mobile sharing</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQRCode(!showQRCode)}
              data-testid="button-toggle-qr"
            >
              <QrCode className="w-4 h-4 mr-2" />
              {showQRCode ? 'Hide' : 'Show'} QR Code
            </Button>
          </div>
          
          {showQRCode && (
            <div className="flex justify-center">
              <QRCodeDisplay url={currentLink.shortUrl || currentLink.url} />
            </div>
          )}
        </div>

        {/* Link Management */}
        <div className="border-t pt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Created: {new Date(currentLink.createdAt).toLocaleDateString()}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={generateNewLink}
            disabled={generateLinkMutation.isPending}
            data-testid="button-generate-new-link"
          >
            {generateLinkMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate New Link
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}