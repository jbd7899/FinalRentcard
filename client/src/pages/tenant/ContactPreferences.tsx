import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  Clock, 
  Calendar,
  Shield,
  Trash2,
  Plus,
  Settings,
  Bell,
  UserX,
  Save,
  Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import TenantLayout from '@/components/layouts/TenantLayout';
import { ROUTES } from "@/constants/routes";
import type { TenantContactPreferences, TenantBlockedContact } from '@shared/schema';

interface ContactPreferenceFormData {
  preferredMethods: string[];
  emailEnabled: boolean;
  phoneEnabled: boolean;
  smsEnabled: boolean;
  timePreferences: {
    startTime?: string;
    endTime?: string;
    weekdays?: string[];
    timezone?: string;
  };
  frequencyPreferences: {
    propertyInquiries?: string;
    applicationUpdates?: string;
    generalNotifications?: string;
    marketingEmails?: string;
  };
  topicPreferences: {
    propertyInquiries?: boolean;
    applicationUpdates?: boolean;
    maintenanceRequests?: boolean;
    leaseInformation?: boolean;
    marketingOffers?: boolean;
  };
  doNotContactHours?: string;
  emergencyContactAllowed?: boolean;
  notes?: string;
}

interface BlockedContactForm {
  contactType: 'landlord' | 'email' | 'phone';
  landlordId?: number;
  email?: string;
  phone?: string;
  reason?: string;
}

const ContactPreferences = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ContactPreferenceFormData>({
    preferredMethods: [],
    emailEnabled: true,
    phoneEnabled: true,
    smsEnabled: false,
    timePreferences: {
      startTime: '09:00',
      endTime: '18:00',
      weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timezone: 'America/New_York'
    },
    frequencyPreferences: {
      propertyInquiries: 'immediate',
      applicationUpdates: 'immediate',
      generalNotifications: 'daily',
      marketingEmails: 'weekly'
    },
    topicPreferences: {
      propertyInquiries: true,
      applicationUpdates: true,
      maintenanceRequests: false,
      leaseInformation: true,
      marketingOffers: false
    },
    doNotContactHours: '',
    emergencyContactAllowed: true,
    notes: ''
  });

  const [newBlockedContact, setNewBlockedContact] = useState<BlockedContactForm>({
    contactType: 'email',
    email: '',
    reason: ''
  });

  const [showAddBlocked, setShowAddBlocked] = useState(false);

  // Fetch current contact preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['/api/tenant/contact-preferences'],
    select: (data: TenantContactPreferences) => data
  });

  // Fetch blocked contacts
  const { data: blockedContacts, isLoading: blockedLoading } = useQuery({
    queryKey: ['/api/tenant/blocked-contacts'],
    select: (data: TenantBlockedContact[]) => data || []
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: ContactPreferenceFormData) => {
      const response = await fetch('/api/tenant/contact-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenant/contact-preferences'] });
      toast({
        title: "Success",
        description: "Contact preferences updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update contact preferences.",
        variant: "destructive",
      });
    }
  });

  // Add blocked contact mutation
  const addBlockedContactMutation = useMutation({
    mutationFn: async (data: BlockedContactForm) => {
      const response = await fetch('/api/tenant/blocked-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to add blocked contact');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenant/blocked-contacts'] });
      setNewBlockedContact({ contactType: 'email', email: '', reason: '' });
      setShowAddBlocked(false);
      toast({
        title: "Success",
        description: "Contact blocked successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to block contact.",
        variant: "destructive",
      });
    }
  });

  // Remove blocked contact mutation
  const removeBlockedContactMutation = useMutation({
    mutationFn: async (contactId: number) => {
      const response = await fetch(`/api/tenant/blocked-contacts/${contactId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to remove blocked contact');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenant/blocked-contacts'] });
      toast({
        title: "Success",
        description: "Contact unblocked successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to unblock contact.",
        variant: "destructive",
      });
    }
  });

  // Load existing preferences into form
  useEffect(() => {
    if (preferences) {
      setFormData({
        preferredMethods: preferences.preferredMethods || [],
        emailEnabled: preferences.emailEnabled ?? true,
        phoneEnabled: preferences.phoneEnabled ?? true,
        smsEnabled: preferences.smsEnabled ?? false,
        timePreferences: preferences.timePreferences || formData.timePreferences,
        frequencyPreferences: preferences.frequencyPreferences || formData.frequencyPreferences,
        topicPreferences: preferences.topicPreferences || formData.topicPreferences,
        doNotContactHours: preferences.doNotContactHours || '',
        emergencyContactAllowed: preferences.emergencyContactAllowed ?? true,
        notes: preferences.notes || ''
      });
    }
  }, [preferences]);

  const handleSavePreferences = () => {
    // Update preferred methods based on enabled toggles
    const methods = [];
    if (formData.emailEnabled) methods.push('email');
    if (formData.phoneEnabled) methods.push('phone');
    if (formData.smsEnabled) methods.push('sms');
    
    const updatedData = {
      ...formData,
      preferredMethods: methods
    };
    
    updatePreferencesMutation.mutate(updatedData);
  };

  const handleMethodToggle = (method: string, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      [`${method}Enabled`]: enabled
    }));
  };

  const handleTimePreferenceChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      timePreferences: {
        ...prev.timePreferences,
        [field]: value
      }
    }));
  };

  const handleFrequencyChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      frequencyPreferences: {
        ...prev.frequencyPreferences,
        [field]: value
      }
    }));
  };

  const handleTopicToggle = (field: string, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      topicPreferences: {
        ...prev.topicPreferences,
        [field]: enabled
      }
    }));
  };

  const handleWeekdayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      timePreferences: {
        ...prev.timePreferences,
        weekdays: prev.timePreferences.weekdays?.includes(day)
          ? prev.timePreferences.weekdays.filter(d => d !== day)
          : [...(prev.timePreferences.weekdays || []), day]
      }
    }));
  };

  const handleAddBlockedContact = () => {
    if (!newBlockedContact.email && !newBlockedContact.phone && !newBlockedContact.landlordId) {
      toast({
        title: "Error",
        description: "Please provide contact information to block.",
        variant: "destructive",
      });
      return;
    }
    addBlockedContactMutation.mutate(newBlockedContact);
  };

  const weekdays = [
    { id: 'monday', label: 'Mon' },
    { id: 'tuesday', label: 'Tue' },
    { id: 'wednesday', label: 'Wed' },
    { id: 'thursday', label: 'Thu' },
    { id: 'friday', label: 'Fri' },
    { id: 'saturday', label: 'Sat' },
    { id: 'sunday', label: 'Sun' }
  ];

  if (preferencesLoading) {
    return (
      <TenantLayout activeRoute={ROUTES.TENANT.CONTACT_PREFERENCES}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout activeRoute={ROUTES.TENANT.CONTACT_PREFERENCES}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold tracking-tight">Contact Preferences</h1>
          </div>
          <p className="text-gray-600">
            Manage how landlords can contact you and set your communication preferences.
          </p>
        </header>

        <div className="space-y-6">
          {/* Contact Methods */}
          <Card data-testid="card-contact-methods">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Contact Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <Label className="font-medium">Email</Label>
                      <p className="text-sm text-gray-500">Receive emails</p>
                    </div>
                  </div>
                  <Switch
                    data-testid="switch-email-enabled"
                    checked={formData.emailEnabled}
                    onCheckedChange={(checked) => handleMethodToggle('email', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <Label className="font-medium">Phone</Label>
                      <p className="text-sm text-gray-500">Voice calls</p>
                    </div>
                  </div>
                  <Switch
                    data-testid="switch-phone-enabled"
                    checked={formData.phoneEnabled}
                    onCheckedChange={(checked) => handleMethodToggle('phone', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                    <div>
                      <Label className="font-medium">SMS/Text</Label>
                      <p className="text-sm text-gray-500">Text messages</p>
                    </div>
                  </div>
                  <Switch
                    data-testid="switch-sms-enabled"
                    checked={formData.smsEnabled}
                    onCheckedChange={(checked) => handleMethodToggle('sms', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Preferences */}
          <Card data-testid="card-time-preferences">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time">Preferred Contact Hours</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      data-testid="input-start-time"
                      id="start-time"
                      type="time"
                      value={formData.timePreferences.startTime}
                      onChange={(e) => handleTimePreferenceChange('startTime', e.target.value)}
                    />
                    <span className="flex items-center text-gray-500">to</span>
                    <Input
                      data-testid="input-end-time"
                      type="time"
                      value={formData.timePreferences.endTime}
                      onChange={(e) => handleTimePreferenceChange('endTime', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Preferred Days</Label>
                  <div className="flex gap-1 mt-1">
                    {weekdays.map((day) => (
                      <Button
                        key={day.id}
                        data-testid={`button-weekday-${day.id}`}
                        variant={formData.timePreferences.weekdays?.includes(day.id) ? "default" : "outline"}
                        size="sm"
                        className="w-12 h-8 p-0"
                        onClick={() => handleWeekdayToggle(day.id)}
                      >
                        {day.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Communication Frequency */}
          <Card data-testid="card-frequency-preferences">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Communication Frequency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries({
                  propertyInquiries: 'Property Inquiries',
                  applicationUpdates: 'Application Updates',
                  generalNotifications: 'General Notifications',
                  marketingEmails: 'Marketing Emails'
                }).map(([field, label]) => (
                  <div key={field} className="flex items-center justify-between p-3 border rounded-lg">
                    <Label className="font-medium">{label}</Label>
                    <select
                      data-testid={`select-frequency-${field}`}
                      value={formData.frequencyPreferences[field as keyof typeof formData.frequencyPreferences]}
                      onChange={(e) => handleFrequencyChange(field, e.target.value)}
                      className="border rounded px-3 py-1 bg-white"
                    >
                      <option value="immediate">Immediate</option>
                      <option value="daily">Daily digest</option>
                      <option value="weekly">Weekly summary</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Topic Preferences */}
          <Card data-testid="card-topic-preferences">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Topic Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries({
                  propertyInquiries: 'Property Inquiries',
                  applicationUpdates: 'Application Updates',
                  maintenanceRequests: 'Maintenance Requests',
                  leaseInformation: 'Lease Information',
                  marketingOffers: 'Marketing Offers'
                }).map(([field, label]) => (
                  <div key={field} className="flex items-center justify-between p-3 border rounded-lg">
                    <Label className="font-medium">{label}</Label>
                    <Switch
                      data-testid={`switch-topic-${field}`}
                      checked={formData.topicPreferences[field as keyof typeof formData.topicPreferences] ?? false}
                      onCheckedChange={(checked) => handleTopicToggle(field, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Blocked Contacts */}
          <Card data-testid="card-blocked-contacts">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserX className="h-5 w-5" />
                  Blocked Contacts
                </div>
                <Button
                  data-testid="button-add-blocked-contact"
                  size="sm"
                  onClick={() => setShowAddBlocked(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Block Contact
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showAddBlocked && (
                <div className="p-4 border rounded-lg mb-4 bg-gray-50">
                  <h4 className="font-medium mb-3">Add Blocked Contact</h4>
                  <div className="space-y-3">
                    <div>
                      <Label>Contact Type</Label>
                      <select
                        data-testid="select-blocked-contact-type"
                        value={newBlockedContact.contactType}
                        onChange={(e) => setNewBlockedContact(prev => ({ 
                          ...prev, 
                          contactType: e.target.value as 'landlord' | 'email' | 'phone' 
                        }))}
                        className="w-full border rounded px-3 py-2 bg-white mt-1"
                      >
                        <option value="email">Email Address</option>
                        <option value="phone">Phone Number</option>
                        <option value="landlord">Specific Landlord</option>
                      </select>
                    </div>
                    
                    {newBlockedContact.contactType === 'email' && (
                      <Input
                        data-testid="input-blocked-email"
                        placeholder="Email to block"
                        value={newBlockedContact.email || ''}
                        onChange={(e) => setNewBlockedContact(prev => ({ ...prev, email: e.target.value }))}
                      />
                    )}
                    
                    {newBlockedContact.contactType === 'phone' && (
                      <Input
                        data-testid="input-blocked-phone"
                        placeholder="Phone number to block"
                        value={newBlockedContact.phone || ''}
                        onChange={(e) => setNewBlockedContact(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    )}
                    
                    <Textarea
                      data-testid="textarea-blocked-reason"
                      placeholder="Reason for blocking (optional)"
                      value={newBlockedContact.reason || ''}
                      onChange={(e) => setNewBlockedContact(prev => ({ ...prev, reason: e.target.value }))}
                    />
                    
                    <div className="flex gap-2">
                      <Button
                        data-testid="button-save-blocked-contact"
                        size="sm"
                        onClick={handleAddBlockedContact}
                        disabled={addBlockedContactMutation.isPending}
                      >
                        {addBlockedContactMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                        Block
                      </Button>
                      <Button
                        data-testid="button-cancel-blocked-contact"
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAddBlocked(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {blockedLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {blockedContacts && blockedContacts.length > 0 ? (
                    blockedContacts.map((contact: TenantBlockedContact) => (
                      <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {contact.contactType}
                            </Badge>
                            <span className="font-medium">
                              {contact.email || contact.phone || `Landlord ID: ${contact.landlordId}`}
                            </span>
                          </div>
                          {contact.reason && (
                            <p className="text-sm text-gray-500 mt-1">{contact.reason}</p>
                          )}
                        </div>
                        <Button
                          data-testid={`button-unblock-${contact.id}`}
                          size="sm"
                          variant="ghost"
                          onClick={() => removeBlockedContactMutation.mutate(contact.id)}
                          disabled={removeBlockedContactMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No blocked contacts</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card data-testid="card-additional-settings">
            <CardHeader>
              <CardTitle>Additional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">Emergency Contact</Label>
                  <p className="text-sm text-gray-500">Allow contact outside preferred hours for emergencies</p>
                </div>
                <Switch
                  data-testid="switch-emergency-contact"
                  checked={formData.emergencyContactAllowed}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emergencyContactAllowed: checked }))}
                />
              </div>
              
              <div>
                <Label htmlFor="do-not-contact">Do Not Contact Hours</Label>
                <Input
                  data-testid="input-do-not-contact"
                  id="do-not-contact"
                  placeholder="e.g., 10:00 PM - 8:00 AM"
                  value={formData.doNotContactHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, doNotContactHours: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  data-testid="textarea-preference-notes"
                  id="notes"
                  placeholder="Any additional communication preferences or instructions..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              data-testid="button-save-preferences"
              onClick={handleSavePreferences}
              disabled={updatePreferencesMutation.isPending}
              className="min-w-32"
            >
              {updatePreferencesMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </TenantLayout>
  );
};

export default ContactPreferences;