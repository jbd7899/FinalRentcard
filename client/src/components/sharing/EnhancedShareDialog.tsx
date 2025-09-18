import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useContactsStore, RecipientContact } from '@/stores/contactsStore';
import { useMessageTemplatesStore, TenantMessageTemplate } from '@/stores/messageTemplatesStore';
import { ContactSelector } from './ContactSelector';
import { TemplateSelector } from './TemplateSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send,
  User,
  Mail,
  FileText,
  Share2,
  Copy,
  Loader2,
  CheckCircle,
  AlertCircle,
  Link as LinkIcon,
  Eye,
  ArrowLeft,
  Users,
  MessageCircle,
  Building
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ShareToken, InsertShareToken } from '@shared/schema';
import { createRentcardShortlinkRequest, generateShortlinkUrl, determineChannel } from '@shared/url-helpers';
import type { ChannelType, ShortlinkResponse } from '@shared/url-helpers';
import { cn } from '@/lib/utils';

interface EnhancedShareDialogProps {
  open: boolean;
  onClose: () => void;
  variant?: 'full' | 'simple';
}

interface ProcessedMessage {
  subject: string;
  body: string;
  variables: { [key: string]: string };
}

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

export const EnhancedShareDialog = ({ 
  open, 
  onClose, 
  variant = 'full' 
}: EnhancedShareDialogProps) => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const platform = detectPlatform();
  const hasWebShare = supportsWebShare();

  // Component state
  const [activeStep, setActiveStep] = useState<'contact' | 'template' | 'preview' | 'send'>('contact');
  const [selectedContact, setSelectedContact] = useState<RecipientContact | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TenantMessageTemplate | null>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [rentCardLink, setRentCardLink] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState<{
    success: boolean;
    shareUrl?: string;
    method?: string;
  } | null>(null);

  // API queries and mutations - same as OneClickShareButton
  const { data: shareTokens, isLoading: tokensLoading } = useQuery<ShareToken[]>({
    queryKey: ['/api/share-tokens'],
    staleTime: 30000,
  });

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

  const createShortlinkMutation = useMutation<ShortlinkResponse, Error, any>({
    mutationFn: async (shortlinkData) => {
      const response = await apiRequest('POST', '/api/shortlinks', shortlinkData);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        if (errorData.errors && Array.isArray(errorData.errors)) {
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

  // Track sharing history
  const trackSharingMutation = useMutation({
    mutationFn: async (shareData: {
      contactId: number;
      shareTokenId: number;
      templateId?: number;
      messageUsed: string;
      method: string;
    }) => {
      const response = await apiRequest('POST', '/api/tenant/contact-sharing-history', shareData);
      if (!response.ok) {
        throw new Error('Failed to track sharing history');
      }
      return response.json();
    },
  });

  // Get active share token
  const getActiveToken = (): ShareToken | null => {
    if (!shareTokens || !Array.isArray(shareTokens)) return null;
    
    return shareTokens.find((token: ShareToken) => 
      !token.revoked && 
      (!token.expiresAt || new Date(token.expiresAt) > new Date())
    ) || null;
  };

  // Generate RentCard link when token is available
  useEffect(() => {
    const generateRentCardLink = async () => {
      try {
        let activeToken = getActiveToken();

        if (!activeToken && !createTokenMutation.isPending) {
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

          const newToken = await createTokenMutation.mutateAsync({
            scope: 'rentcard',
            expiresAt: thirtyDaysFromNow,
          });
          
          activeToken = newToken;
        }

        if (activeToken) {
          const link = `${window.location.origin}/rentcard/shared/${activeToken.token}`;
          setRentCardLink(link);
        }
      } catch (error) {
        console.error('Error generating RentCard link:', error);
      }
    };

    if (open) {
      generateRentCardLink();
    }
  }, [open, shareTokens, createTokenMutation]);

  // Process message with variable replacement
  const processMessage = (subject: string, body: string, contact: RecipientContact | null): ProcessedMessage => {
    const variables = {
      '{tenant_name}': user?.email || 'Your Name',
      '{contact_name}': contact?.name || '[Contact Name]',
      '{property_address}': contact?.propertyAddress || '[Property Address]',
      '{company_name}': contact?.company || '[Company Name]',
      '{rentcard_link}': rentCardLink,
    };

    let processedSubject = subject;
    let processedBody = body;

    Object.entries(variables).forEach(([variable, value]) => {
      processedSubject = processedSubject.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
      processedBody = processedBody.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    return {
      subject: processedSubject,
      body: processedBody,
      variables,
    };
  };

  const processedMessage = processMessage(messageSubject, messageBody, selectedContact);

  // Handle navigation between steps
  const handleNextStep = () => {
    if (activeStep === 'contact' && selectedContact) {
      setActiveStep('template');
    } else if (activeStep === 'template' && (messageSubject || messageBody)) {
      setActiveStep('preview');
    } else if (activeStep === 'preview') {
      setActiveStep('send');
      handleShare();
    }
  };

  const handleBackStep = () => {
    if (activeStep === 'template') {
      setActiveStep('contact');
    } else if (activeStep === 'preview') {
      setActiveStep('template');
    } else if (activeStep === 'send') {
      setActiveStep('preview');
    }
  };

  // Handle contact selection
  const handleContactSelect = (contact: RecipientContact | null) => {
    setSelectedContact(contact);
  };

  // Handle template selection and message changes
  const handleTemplateSelect = (template: TenantMessageTemplate | null) => {
    setSelectedTemplate(template);
  };

  const handleMessageChange = (subject: string, body: string) => {
    setMessageSubject(subject);
    setMessageBody(body);
  };

  // Sharing logic - adapted from OneClickShareButton
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
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
          text: processedMessage.body.substring(0, 100) + '...',
          url: shareUrl,
        });
        return true;
      }
    } catch (error) {
      console.error('Native share failed:', error);
    }
    return false;
  };

  const handleShare = async () => {
    if (!selectedContact) {
      toast({
        title: 'Contact Required',
        description: 'Please select a contact to share with.',
        variant: 'destructive',
      });
      return;
    }

    setIsSharing(true);
    
    try {
      let activeToken = getActiveToken();
      
      if (!activeToken) {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        activeToken = await createTokenMutation.mutateAsync({
          scope: 'rentcard',
          expiresAt: thirtyDaysFromNow,
        });
      }

      if (!activeToken) {
        throw new Error('Unable to create share token');
      }

      // Determine sharing method and channel
      let channel: ChannelType;
      let shareMethod: string;
      let willUseNativeShare = false;

      if (platform === 'mobile' && hasWebShare) {
        channel = determineChannel({ platform: 'mobile', method: 'native_share' });
        shareMethod = 'native_share';
        willUseNativeShare = true;
      } else {
        channel = determineChannel({ platform: 'desktop', method: 'clipboard' });
        shareMethod = 'clipboard';
      }

      // Create shortlink
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const shortlinkRequest = createRentcardShortlinkRequest(
        activeToken.token,
        channel,
        {
          shareTokenId: activeToken.id,
          tenantName: user?.email,
          expiresAt: thirtyDaysFromNow,
        }
      );

      const shortlink = await createShortlinkMutation.mutateAsync(shortlinkRequest);
      const shareUrl = generateShortlinkUrl(shortlink.slug, channel);

      let shareSuccess = false;
      let shareMethodUsed = shareMethod;

      if (willUseNativeShare) {
        shareSuccess = await nativeShare(shareUrl, `${user?.email}'s RentCard`);
        if (!shareSuccess) {
          // Fallback to clipboard
          shareSuccess = await copyToClipboard(shareUrl);
          shareMethodUsed = 'clipboard_fallback';
        }
      } else {
        shareSuccess = await copyToClipboard(shareUrl);
      }

      if (shareSuccess) {
        // Track sharing history
        if (selectedContact) {
          await trackSharingMutation.mutateAsync({
            contactId: selectedContact.id,
            shareTokenId: activeToken.id,
            templateId: selectedTemplate?.id,
            messageUsed: `${processedMessage.subject}\n\n${processedMessage.body}`,
            method: shareMethodUsed,
          });
        }

        setShareResult({
          success: true,
          shareUrl,
          method: shareMethodUsed,
        });

        toast({
          title: 'RentCard Shared!',
          description: shareMethodUsed === 'native_share' 
            ? 'RentCard shared successfully'
            : 'Share link copied to clipboard',
        });
      } else {
        throw new Error('Failed to share RentCard');
      }

    } catch (error) {
      console.error('Share failed:', error);
      setShareResult({
        success: false,
      });

      toast({
        title: 'Share Failed',
        description: error instanceof Error ? error.message : 'Unable to share RentCard',
        variant: 'destructive',
      });
    } finally {
      setIsSharing(false);
    }
  };

  // Reset dialog state when closed
  const handleClose = () => {
    setActiveStep('contact');
    setSelectedContact(null);
    setSelectedTemplate(null);
    setMessageSubject('');
    setMessageBody('');
    setShareResult(null);
    onClose();
  };

  // Get step title and description
  const getStepInfo = () => {
    switch (activeStep) {
      case 'contact':
        return {
          title: 'Select Contact',
          description: 'Choose who you want to share your RentCard with'
        };
      case 'template':
        return {
          title: 'Compose Message',
          description: 'Choose a template or write a custom message'
        };
      case 'preview':
        return {
          title: 'Preview & Send',
          description: 'Review your message before sharing'
        };
      case 'send':
        return {
          title: 'Sharing Complete',
          description: 'Your RentCard has been shared'
        };
      default:
        return { title: 'Share RentCard', description: '' };
    }
  };

  const stepInfo = getStepInfo();

  const getContactInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const canProceed = () => {
    if (activeStep === 'contact') return !!selectedContact;
    if (activeStep === 'template') return !!(messageSubject || messageBody);
    if (activeStep === 'preview') return !!(selectedContact && (messageSubject || messageBody));
    return false;
  };

  const isLoading = tokensLoading || createTokenMutation.isPending || createShortlinkMutation.isPending || isSharing;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="enhanced-share-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            {stepInfo.title}
          </DialogTitle>
          <DialogDescription>
            {stepInfo.description}
          </DialogDescription>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center mt-4">
            <div className="flex items-center space-x-2">
              {['contact', 'template', 'preview', 'send'].map((step, index) => {
                const isActive = activeStep === step;
                const isCompleted = ['contact', 'template', 'preview', 'send'].indexOf(activeStep) > index;
                
                return (
                  <div key={step} className="flex items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                        isActive && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
                        isCompleted && "bg-primary text-primary-foreground",
                        !isActive && !isCompleted && "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    {index < 3 && (
                      <div className={cn(
                        "h-0.5 w-8 mx-2 transition-all",
                        isCompleted ? "bg-primary" : "bg-muted"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </DialogHeader>

        {/* Step Content */}
        <div className="mt-6">
          {activeStep === 'contact' && (
            <div className="space-y-4">
              <ContactSelector
                value={selectedContact}
                onSelect={handleContactSelect}
                placeholder="Choose a contact from your address book..."
                data-testid="share-contact-selector"
              />
              
              {selectedContact && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {getContactInitials(selectedContact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedContact.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedContact.email}</p>
                        {selectedContact.company && (
                          <p className="text-sm text-muted-foreground">{selectedContact.company}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeStep === 'template' && (
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onTemplateSelect={handleTemplateSelect}
              onMessageChange={handleMessageChange}
              contact={selectedContact}
              rentCardLink={rentCardLink}
              data-testid="share-template-selector"
            />
          )}

          {activeStep === 'preview' && (
            <div className="space-y-6">
              {/* Contact Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Sharing With
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {selectedContact ? getContactInitials(selectedContact.name) : 'NA'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{selectedContact?.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedContact?.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Message Preview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Message Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div>
                    <Label className="text-xs font-medium">Subject:</Label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">{processedMessage.subject || 'No subject'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium">Message:</Label>
                    <div className="mt-1 p-3 bg-muted rounded-md max-h-48 overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap">
                        {processedMessage.body || 'No message content'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium">RentCard Link:</Label>
                    <div className="mt-1 p-2 bg-muted rounded-md flex items-center gap-2">
                      <LinkIcon className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs font-mono text-muted-foreground flex-1 truncate">
                        {rentCardLink}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeStep === 'send' && (
            <div className="text-center space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Preparing your RentCard share...</p>
                </div>
              ) : shareResult ? (
                <div className="flex flex-col items-center gap-4">
                  {shareResult.success ? (
                    <>
                      <CheckCircle className="h-12 w-12 text-green-500" />
                      <div>
                        <p className="font-medium">RentCard Shared Successfully!</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {shareResult.method === 'native_share' 
                            ? 'Your RentCard has been shared'
                            : 'Share link copied to clipboard'}
                        </p>
                      </div>
                      {shareResult.shareUrl && shareResult.method?.includes('clipboard') && (
                        <div className="p-3 bg-muted rounded-md w-full">
                          <p className="text-xs font-mono text-center break-all">
                            {shareResult.shareUrl}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-12 w-12 text-red-500" />
                      <div>
                        <p className="font-medium">Share Failed</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Please try again or contact support
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <DialogFooter className="mt-6 gap-2">
          {activeStep !== 'contact' && activeStep !== 'send' && (
            <Button
              variant="outline"
              onClick={handleBackStep}
              disabled={isLoading}
              data-testid="button-back-step"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}

          {activeStep === 'send' ? (
            <Button
              onClick={handleClose}
              data-testid="button-close-dialog"
            >
              Done
            </Button>
          ) : (
            <Button
              onClick={handleNextStep}
              disabled={!canProceed() || isLoading}
              data-testid="button-next-step"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {activeStep === 'preview' ? 'Sharing...' : 'Loading...'}
                </>
              ) : (
                <>
                  {activeStep === 'preview' ? 'Share RentCard' : 'Continue'}
                  {activeStep !== 'preview' && <Share2 className="h-4 w-4 ml-2" />}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};