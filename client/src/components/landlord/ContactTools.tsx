import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Shield,
  Send,
  History,
  Template,
  Loader2,
  UserX,
  Settings
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import type { TenantContactPreferences, CommunicationLog, CommunicationTemplate } from '@shared/schema';

interface ContactToolsProps {
  tenantId: number;
  tenantInfo: {
    name: string;
    email: string;
    phone: string;
  };
  interestId?: number;
  propertyId?: number;
  onContactComplete?: () => void;
}

interface ContactRequest {
  tenantId: number;
  communicationType: 'email' | 'phone' | 'sms';
  subject?: string;
  message: string;
  templateId?: number;
  interestId?: number;
  propertyId?: number;
}

const ContactTools = ({ tenantId, tenantInfo, interestId, propertyId, onContactComplete }: ContactToolsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showContactModal, setShowContactModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [contactType, setContactType] = useState<'email' | 'phone' | 'sms'>('email');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Check if landlord can contact tenant
  const { data: contactPermission, isLoading: permissionLoading } = useQuery({
    queryKey: ['/api/landlord/can-contact-tenant', tenantId, contactType],
    queryFn: async () => {
      const response = await fetch('/api/landlord/can-contact-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, communicationType: contactType })
      });
      if (!response.ok) throw new Error('Failed to check contact permission');
      return response.json();
    }
  });

  // Fetch tenant contact preferences
  const { data: preferences } = useQuery({
    queryKey: ['/api/landlord/tenant/contact-preferences', tenantId],
    queryFn: async () => {
      const response = await fetch(`/api/landlord/tenant/${tenantId}/contact-preferences`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.preferences as TenantContactPreferences;
    }
  });

  // Fetch communication templates
  const { data: templates } = useQuery({
    queryKey: ['/api/landlord/communication-templates'],
    queryFn: async () => {
      const response = await fetch('/api/landlord/communication-templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json() as CommunicationTemplate[];
    }
  });

  // Fetch communication history
  const { data: communicationHistory } = useQuery({
    queryKey: ['/api/communication-logs', tenantId],
    queryFn: async () => {
      const response = await fetch(`/api/communication-logs?tenantId=${tenantId}`);
      if (!response.ok) throw new Error('Failed to fetch communication history');
      return response.json() as CommunicationLog[];
    }
  });

  // Send communication mutation
  const sendCommunicationMutation = useMutation({
    mutationFn: async (contactRequest: ContactRequest) => {
      const response = await fetch('/api/communication-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: contactRequest.tenantId,
          communicationType: contactRequest.communicationType,
          subject: contactRequest.subject,
          message: contactRequest.message,
          templateId: contactRequest.templateId,
          interestId: contactRequest.interestId,
          propertyId: contactRequest.propertyId,
          status: 'sent',
          metadata: {
            timestamp: new Date().toISOString(),
            recipientName: tenantInfo.name,
            recipientEmail: tenantInfo.email,
            recipientPhone: tenantInfo.phone
          }
        })
      });
      if (!response.ok) throw new Error('Failed to send communication');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communication-logs'] });
      setShowContactModal(false);
      setMessage('');
      setSubject('');
      setSelectedTemplate('');
      toast({
        title: "Success",
        description: "Communication sent successfully.",
      });
      onContactComplete?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send communication.",
        variant: "destructive",
      });
    }
  });

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = templates?.find(t => t.id.toString() === templateId);
    if (template) {
      setSubject(template.subject || '');
      setMessage(template.body);
      setSelectedTemplate(templateId);
    }
  };

  // Handle sending communication
  const handleSendCommunication = () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message.",
        variant: "destructive",
      });
      return;
    }

    sendCommunicationMutation.mutate({
      tenantId,
      communicationType: contactType,
      subject: contactType === 'email' ? subject : undefined,
      message,
      templateId: selectedTemplate ? parseInt(selectedTemplate) : undefined,
      interestId,
      propertyId
    });
  };

  const getPreferredMethods = () => {
    if (!preferences) return ['email', 'phone', 'sms'];
    return preferences.preferredMethods || ['email'];
  };

  const getContactMethodIcon = (method: string) => {
    switch (method) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const getContactMethodLabel = (method: string) => {
    switch (method) {
      case 'email': return 'Email';
      case 'phone': return 'Phone';
      case 'sms': return 'SMS/Text';
      default: return method;
    }
  };

  const isContactAllowed = () => {
    return contactPermission?.canContact !== false;
  };

  const getContactRestrictionReason = () => {
    if (!contactPermission?.canContact && contactPermission?.reason) {
      return contactPermission.reason;
    }
    return null;
  };

  const preferredMethods = getPreferredMethods();
  const restrictionReason = getContactRestrictionReason();

  return (
    <div className="space-y-3">
      {/* Contact Preference Indicators */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="text-xs">
          <Settings className="h-3 w-3 mr-1" />
          Preferences Set
        </Badge>
        {preferredMethods.map((method) => (
          <Badge key={method} variant="outline" className="text-xs">
            {getContactMethodIcon(method)}
            <span className="ml-1">{getContactMethodLabel(method)}</span>
          </Badge>
        ))}
        {preferences?.timePreferences?.startTime && (
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {preferences.timePreferences.startTime} - {preferences.timePreferences.endTime}
          </Badge>
        )}
      </div>

      {/* Contact Buttons */}
      <div className="flex gap-2">
        {!isContactAllowed() ? (
          <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
            <UserX className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">{restrictionReason}</span>
          </div>
        ) : (
          <>
            <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
              <DialogTrigger asChild>
                <Button
                  data-testid="button-contact-tenant"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Contact {tenantInfo.name}</DialogTitle>
                  <DialogDescription>
                    Send a message respecting their contact preferences
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Contact Method Selection */}
                  <div>
                    <Label>Contact Method</Label>
                    <Select value={contactType} onValueChange={setContactType}>
                      <SelectTrigger data-testid="select-contact-method">
                        <SelectValue placeholder="Select contact method" />
                      </SelectTrigger>
                      <SelectContent>
                        {preferredMethods.map((method) => (
                          <SelectItem key={method} value={method}>
                            <div className="flex items-center gap-2">
                              {getContactMethodIcon(method)}
                              <span>{getContactMethodLabel(method)}</span>
                              {method === preferredMethods[0] && (
                                <Badge variant="secondary" className="text-xs ml-2">Preferred</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Template Selection */}
                  {templates && templates.length > 0 && (
                    <div>
                      <Label>Message Template (Optional)</Label>
                      <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                        <SelectTrigger data-testid="select-template">
                          <SelectValue placeholder="Choose a template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No template</SelectItem>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id.toString()}>
                              <div className="flex items-center gap-2">
                                <Template className="h-4 w-4" />
                                <span>{template.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Subject (for email) */}
                  {contactType === 'email' && (
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        data-testid="input-email-subject"
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Email subject"
                      />
                    </div>
                  )}

                  {/* Message */}
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      data-testid="textarea-message"
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Your message..."
                      rows={5}
                    />
                  </div>

                  {/* Preference Hints */}
                  {preferences && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Contact Preferences:</h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        {preferences.timePreferences?.startTime && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            Preferred hours: {preferences.timePreferences.startTime} - {preferences.timePreferences.endTime}
                          </div>
                        )}
                        {preferences.frequencyPreferences?.propertyInquiries && (
                          <div>
                            Property inquiry frequency: {preferences.frequencyPreferences.propertyInquiries}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      data-testid="button-cancel-contact"
                      variant="outline"
                      onClick={() => setShowContactModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      data-testid="button-send-contact"
                      onClick={handleSendCommunication}
                      disabled={sendCommunicationMutation.isPending}
                    >
                      {sendCommunicationMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send {getContactMethodLabel(contactType)}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
              <DialogTrigger asChild>
                <Button
                  data-testid="button-contact-history"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <History className="h-4 w-4" />
                  History
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Communication History</DialogTitle>
                  <DialogDescription>
                    Previous communications with {tenantInfo.name}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {communicationHistory && communicationHistory.length > 0 ? (
                    communicationHistory.map((log) => (
                      <Card key={log.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {getContactMethodIcon(log.communicationType)}
                            <span className="font-medium">
                              {getContactMethodLabel(log.communicationType)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {log.status}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {log.subject && (
                          <div className="font-medium text-sm mb-1">
                            Subject: {log.subject}
                          </div>
                        )}
                        <div className="text-sm text-gray-600">
                          {log.message}
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No communication history found
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>

      {/* Status Indicators */}
      {restrictionReason && (
        <div className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {restrictionReason}
        </div>
      )}
    </div>
  );
};

export default ContactTools;