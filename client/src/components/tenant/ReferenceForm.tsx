import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TenantReference, useReferencesStore } from '@/stores/referencesStore';
import { useAuthStore } from '@/stores/authStore';

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const referenceFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship type is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  notes: z.string().nullable().optional(),
});

type ReferenceFormValues = z.infer<typeof referenceFormSchema>;

interface ReferenceFormProps {
  isOpen: boolean;
  onClose: () => void;
  reference?: TenantReference;
  tenantId: number;
}

const RELATIONSHIP_TYPES = [
  { value: 'previous_landlord', label: 'Previous Landlord' },
  { value: 'current_landlord', label: 'Current Landlord' },
  { value: 'employer', label: 'Employer' },
  { value: 'personal', label: 'Personal Reference' },
  { value: 'professional', label: 'Professional Reference' },
  { value: 'roommate', label: 'Roommate' },
  { value: 'family', label: 'Family Member' },
];

export function ReferenceForm({ isOpen, onClose, reference, tenantId }: ReferenceFormProps) {
  const { addReference, updateReference } = useReferencesStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!reference;
  
  const form = useForm<ReferenceFormValues>({
    resolver: zodResolver(referenceFormSchema),
    defaultValues: {
      name: reference?.name || '',
      relationship: reference?.relationship || '',
      email: reference?.email || '',
      phone: reference?.phone || '',
      notes: reference?.notes || null,
    },
  });
  
  const onSubmit = async (values: ReferenceFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (isEditMode && reference) {
        await updateReference(reference.id, {
          ...values,
          notes: values.notes || null
        });
      } else {
        await addReference({
          ...values,
          notes: values.notes || null,
          tenantId,
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting reference:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Reference' : 'Add New Reference'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update the details of your reference.' 
              : 'Add a new reference to strengthen your prequalification profile.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RELATIONSHIP_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="(123) 456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional information about this reference..."
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Update Reference' : 'Add Reference'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 