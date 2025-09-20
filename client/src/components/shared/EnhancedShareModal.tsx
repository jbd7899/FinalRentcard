import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Copy,
  Mail,
  Phone,
  Share2,
  Link2,
  Clock,
  Eye,
  Trash2,
  Plus,
  CheckCircle,
  Loader2,
  Calendar,
  AlertCircle,
  Settings,
  ExternalLink
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { ShareToken, InsertShareToken } from '@shared/schema';
import { format, formatDistanceToNow } from 'date-fns';
import { createRentcardShortlinkRequest, generateShortlinkUrl, determineChannel } from '@shared/url-helpers';
import type { ChannelType, ShortlinkResponse } from '@shared/url-helpers';

interface EnhancedShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceType?: 'rentcard' | 'property';
  resourceId?: string;
  title?: string;
  description?: string;
  enableReferralTracking?: boolean;
  referralCampaign?: string;
}

const shareTokenSettingsSchema = z.object({
  expiresAt: z.string().optional(),
  scope: z.enum(['rentcard']).default('rentcard'),
});

type ShareTokenSettings = z.infer<typeof shareTokenSettingsSchema>;

export function EnhancedShareModal({
  open,
  onOpenChange,
  resourceType = 'rentcard',
  resourceId,
  title = 'Share Your RentCard',
  description = 'Share your rental profile with landlords and property managers',
  enableReferralTracking = false,
  referralCampaign = 'rentcard_share'
}: EnhancedShareModalProps) {
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('share');
  const [revokeTokenId, setRevokeTokenId] = useState<number | null>(null);
  const [newShareToken, setNewShareToken] = useState<ShareToken | null>(null);
  const [activeShortlinks, setActiveShortlinks] = useState<{[key: string]: ShortlinkResponse}>({});

  // Form for share token settings
  const form = useForm<ShareTokenSettings>({
    resolver: zodResolver(shareTokenSettingsSchema),
    defaultValues: {
      scope: 'rentcard',
      expiresAt: '7days',
    },
  });

  // Fetch existing share tokens
  const { data: shareTokens, isLoading: tokensLoading, refetch: refetchTokens } = useQuery<ShareToken[]>({
    queryKey: ['/api/share-tokens'],
    enabled: open,
  });

  // Create shortlink mutation
  const createShortlinkMutation = useMutation<ShortlinkResponse, Error, any>({
    mutationFn: async (shortlinkData) => {
      const response = await apiRequest('POST', '/api/shortlinks', shortlinkData);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Include validation errors if available
          const validationErrors = errorData.errors.map((err: any) => err.message).join(', ');
          throw new Error(`${errorMessage}: ${validationErrors}`);
        }
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

  // Create share token mutation
  const createTokenMutation = useMutation<ShareToken, Error, ShareTokenSettings>({
    mutationFn: async (settings: ShareTokenSettings) => {
      const payload: Partial<InsertShareToken> = {
        scope: settings.scope,
      };

      // Set expiration based on selection
      if (settings.expiresAt && settings.expiresAt !== 'never') {
        const now = new Date();
        switch (settings.expiresAt) {
          case '1day':
            payload.expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            break;
          case '7days':
            payload.expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            break;
          case '30days':
            payload.expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            break;
        }
      }

      const response = await apiRequest('POST', '/api/share-tokens', payload);
      if (!response.ok) {
        throw new Error('Failed to create share token');
      }
      return response.json();
    },
    onSuccess: (newToken: ShareToken) => {
      addToast({
        title: 'Share Link Created',
        description: 'Your secure sharing link has been generated.',
        type: 'success'
      });
      setNewShareToken(newToken);
      setActiveTab('share');
      queryClient.invalidateQueries({ queryKey: ['/api/share-tokens'] });
    },
    onError: (error) => {
      addToast({
        title: 'Error Creating Share Link',
        description: error instanceof Error ? error.message : 'Failed to create share link',
        type: 'destructive'
      });
    },
  });

  // Revoke share token mutation
  const revokeTokenMutation = useMutation<ShareToken, Error, number>({
    mutationFn: async (tokenId: number) => {
      const response = await apiRequest('PATCH', `/api/share-tokens/${tokenId}/revoke`);
      if (!response.ok) {
        throw new Error('Failed to revoke share token');
      }
      return response.json();
    },
    onSuccess: () => {
      addToast({
        title: 'Share Link Revoked',
        description: 'The share link has been permanently disabled.',
        type: 'success'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/share-tokens'] });
      setRevokeTokenId(null);
      if (newShareToken && newShareToken.id === revokeTokenId) {
        setNewShareToken(null);
      }
    },
    onError: (error) => {
      addToast({
        title: 'Error Revoking Link',
        description: error instanceof Error ? error.message : 'Failed to revoke share link',
        type: 'destructive'
      });
      setRevokeTokenId(null);
    },
  });

  // Get the active share token for sharing (newest or manually created)
  const activeToken = newShareToken || (shareTokens && Array.isArray(shareTokens) && shareTokens.length > 0 
    ? shareTokens.find((token: ShareToken) => !token.revoked && (!token.expiresAt || new Date(token.expiresAt) > new Date()))
      || shareTokens[0]
    : null);

  const generateShareUrl = (token: string) => {
    return `${window.location.origin}/rentcard/shared/${token}`;
  };

  // Create shortlink with specific channel attribution
  const createShortlinkWithChannel = async (channel: ChannelType): Promise<string> => {
    if (!activeToken) {
      throw new Error('No active share token available');
    }

    // Check if we already have a shortlink for this channel
    const existingKey = `${activeToken.token}-${channel}`;
    if (activeShortlinks[existingKey]) {
      return generateShortlinkUrl(activeShortlinks[existingKey].slug, channel);
    }

    // Create new shortlink with referral tracking
    const shortlinkRequest = createRentcardShortlinkRequest(
      activeToken.token,
      channel,
      {
        shareTokenId: activeToken.id,
        tenantName: undefined, // Could be enhanced with tenant name
        expiresAt: activeToken.expiresAt ? new Date(activeToken.expiresAt) : undefined,
      }
    );

    // Add referral campaign tracking if enabled
    if (enableReferralTracking) {
      shortlinkRequest.title = `${shortlinkRequest.title} - ${referralCampaign}`;
      // Add UTM parameters for referral tracking
      const urlWithUTM = new URL(shortlinkRequest.targetUrl);
      urlWithUTM.searchParams.set('utm_source', 'referral');
      urlWithUTM.searchParams.set('utm_medium', channel);
      urlWithUTM.searchParams.set('utm_campaign', referralCampaign);
      shortlinkRequest.targetUrl = urlWithUTM.toString();
    }

    const shortlink = await createShortlinkMutation.mutateAsync(shortlinkRequest);
    
    // Cache the shortlink
    setActiveShortlinks(prev => ({
      ...prev,
      [existingKey]: shortlink
    }));

    return generateShortlinkUrl(shortlink.slug, channel);
  };

  const copyToClipboard = async (token?: ShareToken) => {
    try {
      const shareUrl = await createShortlinkWithChannel('copy');
      await navigator.clipboard.writeText(shareUrl);
      addToast({
        title: 'Copied to Clipboard',
        description: 'Share link copied successfully.',
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to copy shortlink:', error);
      // Fallback to direct share URL
      const fallbackUrl = token ? generateShareUrl(token.token) : (activeToken ? generateShareUrl(activeToken.token) : '');
      if (fallbackUrl) {
        try {
          await navigator.clipboard.writeText(fallbackUrl);
          addToast({
            title: 'Copied to Clipboard',
            description: 'Share link copied successfully.',
            type: 'success'
          });
        } catch (fallbackError) {
          // Final fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = fallbackUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          
          addToast({
            title: 'Copied to Clipboard',
            description: 'Share link copied successfully.',
            type: 'success'
          });
        }
      } else {
        addToast({
          title: 'Copy Failed',
          description: 'Unable to copy share link',
          type: 'destructive'
        });
      }
    }
  };

  const shareViaEmail = async () => {
    try {
      const shareUrl = await createShortlinkWithChannel('email');
      const subject = encodeURIComponent('My RentCard Profile - Prequalification');
      const body = encodeURIComponent(
        `Hi there,

I'd like to share my prequalification profile with you. Please take a look at my RentCard:

${shareUrl}

This secure link contains my verified rental history, references, and all the information you need for my prequalification.

Best regards`
      );
      const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
      window.location.href = mailtoUrl;
    } catch (error) {
      console.error('Failed to create email shortlink:', error);
      addToast({
        title: 'Email Share Failed',
        description: 'Unable to prepare email share link',
        type: 'destructive'
      });
    }
  };

  const shareViaSMS = async () => {
    try {
      const shareUrl = await createShortlinkWithChannel('sms');
      const message = encodeURIComponent(
        `Here's my RentCard for your prequalification review: ${shareUrl}`
      );
      const smsUrl = `sms:?body=${message}`;
      window.location.href = smsUrl;
    } catch (error) {
      console.error('Failed to create SMS shortlink:', error);
      addToast({
        title: 'SMS Share Failed',
        description: 'Unable to prepare SMS share link',
        type: 'destructive'
      });
    }
  };

  const handleRevokeToken = (tokenId: number) => {
    setRevokeTokenId(tokenId);
  };

  const confirmRevoke = () => {
    if (revokeTokenId) {
      revokeTokenMutation.mutate(revokeTokenId);
    }
  };

  const onSubmit = (data: ShareTokenSettings) => {
    createTokenMutation.mutate(data);
  };

  const getTokenStatus = (token: ShareToken) => {
    if (token.revoked) return { label: 'Revoked', color: 'destructive' };
    if (token.expiresAt && new Date(token.expiresAt) < new Date()) {
      return { label: 'Expired', color: 'secondary' };
    }
    return { label: 'Active', color: 'default' };
  };

  const isTokenValid = (token: ShareToken) => {
    return !token.revoked && (!token.expiresAt || new Date(token.expiresAt) > new Date());
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              {title}
            </DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="share" data-testid="tab-share">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </TabsTrigger>
              <TabsTrigger value="create" data-testid="tab-create">
                <Plus className="w-4 h-4 mr-2" />
                New Link
              </TabsTrigger>
              <TabsTrigger value="manage" data-testid="tab-manage">
                <Settings className="w-4 h-4 mr-2" />
                Manage
              </TabsTrigger>
            </TabsList>

            {/* Share Tab */}
            <TabsContent value="share" className="space-y-6">
              {activeToken && isTokenValid(activeToken) ? (
                <div className="space-y-4">
                  {/* Share URL Display */}
                  <div className="space-y-2">
                    <Label htmlFor="share-url">Your Share Link</Label>
                    <div className="flex gap-2">
                      <Input
                        id="share-url"
                        value={generateShareUrl(activeToken.token)}
                        readOnly
                        className="font-mono text-sm"
                        data-testid="input-share-url"
                      />
                      <Button
                        onClick={() => copyToClipboard(activeToken)}
                        variant="outline"
                        size="sm"
                        data-testid="button-copy-link"
                        disabled={createShortlinkMutation.isPending}
                      >
                        {createShortlinkMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Share Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      onClick={() => copyToClipboard(activeToken)}
                      variant="outline"
                      className="justify-start"
                      data-testid="button-copy-link-large"
                      disabled={createShortlinkMutation.isPending}
                    >
                      {createShortlinkMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Copy className="w-4 h-4 mr-2" />}
                      Copy Link
                    </Button>
                    
                    <Button
                      onClick={() => shareViaEmail()}
                      variant="outline"
                      className="justify-start"
                      data-testid="button-share-email"
                      disabled={createShortlinkMutation.isPending}
                    >
                      {createShortlinkMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                      Share via Email
                    </Button>
                    
                    <Button
                      onClick={() => shareViaSMS()}
                      variant="outline"
                      className="justify-start"
                      data-testid="button-share-sms"
                      disabled={createShortlinkMutation.isPending}
                    >
                      {createShortlinkMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Phone className="w-4 h-4 mr-2" />}
                      Share via SMS
                    </Button>
                    
                    <Button
                      onClick={() => window.open(generateShareUrl(activeToken.token), '_blank')}
                      variant="outline"
                      className="justify-start"
                      data-testid="button-open-link"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Link
                    </Button>
                  </div>

                  {/* Token Info */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Link Status</span>
                        <Badge variant="default">Active</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-600">
                            Created: {format(new Date(activeToken.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-600">
                            Views: {activeToken.viewCount}
                          </span>
                        </div>
                        
                        {activeToken.expiresAt && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-600">
                              Expires: {formatDistanceToNow(new Date(activeToken.expiresAt), { addSuffix: true })}
                            </span>
                          </div>
                        )}
                        
                        {activeToken.lastViewedAt && (
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-600">
                              Last viewed: {formatDistanceToNow(new Date(activeToken.lastViewedAt), { addSuffix: true })}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="p-6 text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-amber-600 mx-auto" />
                    <div>
                      <h3 className="font-medium text-amber-800">No Active Share Link</h3>
                      <p className="text-sm text-amber-700 mt-1">
                        Create a new share link to start sharing your RentCard with landlords.
                      </p>
                    </div>
                    <Button
                      onClick={() => setActiveTab('create')}
                      variant="outline"
                      className="border-amber-300 text-amber-700 hover:bg-amber-100"
                      data-testid="button-create-first-link"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Share Link
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Create New Link Tab */}
            <TabsContent value="create" className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="expiresAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link Expiration</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-expiration">
                              <SelectValue placeholder="Select expiration time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1day">24 Hours</SelectItem>
                            <SelectItem value="7days">7 Days</SelectItem>
                            <SelectItem value="30days">30 Days</SelectItem>
                            <SelectItem value="never">Never Expires</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose how long this share link will remain active.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="scope"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Share Scope</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-scope">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="rentcard">Complete RentCard</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose what information to include in the share link.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={createTokenMutation.isPending}
                    className="w-full"
                    data-testid="button-create-token"
                  >
                    {createTokenMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Link...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Share Link
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {/* Manage Links Tab */}
            <TabsContent value="manage" className="space-y-4">
              {tokensLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : shareTokens && Array.isArray(shareTokens) && shareTokens.length > 0 ? (
                <div className="space-y-3">
                  {shareTokens.map((token: ShareToken) => {
                    const status = getTokenStatus(token);
                    
                    return (
                      <Card key={token.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <Link2 className="w-4 h-4 text-gray-500 shrink-0" />
                                <span className="text-sm font-medium truncate">
                                  {token.scope.charAt(0).toUpperCase() + token.scope.slice(1)} Share
                                </span>
                                <Badge variant={status.color as any}>{status.label}</Badge>
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Created: {format(new Date(token.createdAt), 'MMM d, yyyy')}</span>
                                <span>{token.viewCount} views</span>
                                {token.expiresAt && (
                                  <span>
                                    Expires: {format(new Date(token.expiresAt), 'MMM d, yyyy')}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              {isTokenValid(token) && (
                                <Button
                                  onClick={() => copyToClipboard(token)}
                                  variant="ghost"
                                  size="sm"
                                  data-testid={`button-copy-token-${token.id}`}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              )}
                              
                              {!token.revoked && (
                                <Button
                                  onClick={() => handleRevokeToken(token.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  data-testid={`button-revoke-token-${token.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="border-gray-200">
                  <CardContent className="p-6 text-center space-y-4">
                    <Link2 className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <h3 className="font-medium text-gray-800">No Share Links Created</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Create your first share link to start sharing your RentCard.
                      </p>
                    </div>
                    <Button
                      onClick={() => setActiveTab('create')}
                      variant="outline"
                      data-testid="button-create-first-link-manage"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Share Link
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={Boolean(revokeTokenId)} onOpenChange={() => setRevokeTokenId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Share Link?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The share link will be permanently disabled and will no longer work for anyone who has it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-revoke">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRevoke}
              className="bg-red-600 hover:bg-red-700"
              disabled={revokeTokenMutation.isPending}
              data-testid="button-confirm-revoke"
            >
              {revokeTokenMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Revoking...
                </>
              ) : (
                'Revoke Link'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}