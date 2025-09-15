import { useState, useEffect } from 'react';
import { useContactsStore, RecipientContact } from '@/stores/contactsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Building, 
  UserCheck, 
  Briefcase,
  Mail,
  Phone,
  MapPin,
  FileText,
  Heart,
  Loader2
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';

const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20, 'Phone number is too long'),
  company: z.string().optional(),
  contactType: z.enum(['landlord', 'property_manager', 'real_estate_agent', 'other']),
  propertyAddress: z.string().optional(),
  notes: z.string().optional(),
  isFavorite: z.boolean().default(false),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const CONTACT_TYPES = [
  { value: 'landlord', label: 'Landlord', icon: Building, description: 'Property owners' },
  { value: 'property_manager', label: 'Property Manager', icon: UserCheck, description: 'Property management companies' },
  { value: 'real_estate_agent', label: 'Real Estate Agent', icon: Briefcase, description: 'Real estate professionals' },
  { value: 'other', label: 'Other', icon: User, description: 'Other contacts' },
];

interface ContactFormProps {
  contact?: RecipientContact | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ContactForm = ({ contact, onClose, onSuccess }: ContactFormProps) => {
  const { addContact, updateContact } = useContactsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(contact);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      contactType: 'landlord',
      propertyAddress: '',
      notes: '',
      isFavorite: false,
    },
  });

  useEffect(() => {
    if (contact) {
      form.reset({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company || '',
        contactType: contact.contactType as 'landlord' | 'property_manager' | 'real_estate_agent' | 'other',
        propertyAddress: contact.propertyAddress || '',
        notes: contact.notes || '',
        isFavorite: contact.isFavorite,
      });
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
        company: '',
        contactType: 'landlord',
        propertyAddress: '',
        notes: '',
        isFavorite: false,
      });
    }
  }, [contact, form]);

  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);
    
    try {
      let result;
      if (isEditing && contact) {
        result = await updateContact(contact.id, values);
      } else {
        result = await addContact(values);
      }

      if (result) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (cleaned.length >= 10) {
      const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})(\d*)$/);
      if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}${match[4] ? ` ${match[4]}` : ''}`;
      }
    }
    
    return cleaned;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    form.setValue('phone', formatted);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" data-testid="dialog-contact-form">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? (
              <>
                <User className="h-5 w-5" />
                Edit Contact
              </>
            ) : (
              <>
                <User className="h-5 w-5" />
                Add New Contact
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the contact information below.' 
              : 'Add a new contact to easily share your RentCard in the future.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="John Smith"
                        data-testid="input-contact-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          placeholder="john@example.com"
                          data-testid="input-contact-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          placeholder="(555) 123-4567"
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          data-testid="input-contact-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-contact-type">
                            <SelectValue placeholder="Select contact type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CONTACT_TYPES.map((type) => {
                            const IconComponent = type.icon;
                            return (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <IconComponent className="h-4 w-4" />
                                  <div>
                                    <div className="font-medium">{type.label}</div>
                                    <div className="text-xs text-muted-foreground">{type.description}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Company
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="ABC Property Management"
                          data-testid="input-contact-company"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="propertyAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Property Address
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="123 Main St, City, State 12345"
                        data-testid="input-contact-property-address"
                      />
                    </FormControl>
                    <FormDescription>
                      The property this contact is associated with (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Notes
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field}
                        placeholder="Any additional notes about this contact..."
                        rows={3}
                        data-testid="textarea-contact-notes"
                      />
                    </FormControl>
                    <FormDescription>
                      Add any additional information about this contact
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFavorite"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2">
                        <Heart className={cn("h-4 w-4", field.value && "fill-current text-yellow-500")} />
                        Favorite Contact
                      </FormLabel>
                      <FormDescription>
                        Mark this as a favorite contact for quick access
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-contact-favorite"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                data-testid="button-cancel-contact"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                data-testid="button-save-contact"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    {isEditing ? 'Update Contact' : 'Add Contact'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};