import { useState } from 'react';
import { useLocation } from "wouter";
import {
  Building2,
  X,
  DollarSign,
  Calendar,
  CheckCircle,
  Info,
  ArrowRight,
  Send,
  Mail,
  Phone
} from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/shared/navbar";
import { z } from "zod";

// Add before the AddPropertyForm component
const propertyFormSchema = z.object({
  // Property Details
  name: z.string().min(1, "Property name is required"),
  type: z.string().min(1, "Property type is required"),
  address: z.string().min(1, "Address is required"),
  unit: z.string().optional(),
  rent: z.string().min(1, "Rent amount is required"),
  availableDate: z.string().min(1, "Available date is required"),
  description: z.string().optional(),

  // Requirements
  creditScore: z.string(),
  incomeMultiplier: z.string(),
  noEvictions: z.boolean(),
  cleanHistory: z.boolean(),

  // Additional Settings
  petPolicy: z.string(),
  petDeposit: z.string().optional(),
  leaseLength: z.string(),
  securityDeposit: z.string().min(1, "Security deposit is required")
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

// Main page component wrapper
const AddProperty = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6">
        <AddPropertyForm onClose={() => setLocation("/landlord/dashboard")} />
      </div>
    </div>
  );
};

// Form component
const AddPropertyForm = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      // Property Details
      name: '',
      type: '',
      address: '',
      unit: '',
      rent: '',
      availableDate: '',
      description: '',

      // Requirements
      creditScore: '650',
      incomeMultiplier: '3',
      noEvictions: true,
      cleanHistory: true,

      // Additional Settings
      petPolicy: 'no',
      petDeposit: '',
      leaseLength: '12',
      securityDeposit: ''
    },
  });

  const onSubmit = async (data: PropertyFormValues) => {
    try {
      await apiRequest('POST', '/api/landlord/properties', data);
      queryClient.invalidateQueries({ queryKey: ['/api/landlord/properties'] });
      toast({
        title: "Success",
        description: "Property has been created successfully.",
      });
      onClose();
      setLocation('/landlord/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create property. Please try again.",
        variant: "destructive",
      });
    }
  };

  const totalSteps = 3;

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((num) => (
        <div key={num} className="flex items-center">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center
            ${step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
          `}>
            {num}
          </div>
          {num < totalSteps && (
            <div className={`w-16 h-1 ${step > num ? 'bg-blue-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  const PropertyDetails = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Property Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Oak Ridge Apartments" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Property Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="condo">Condo</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street Address</FormLabel>
            <FormControl>
              <Input placeholder="Enter street address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Apt 4B" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Rent</FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input type="number" className="pl-9" placeholder="Enter amount" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="availableDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Available Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Property Description</FormLabel>
            <FormControl>
              <Textarea
                rows={3}
                placeholder="Enter property description..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const RequirementsSection = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
        <div className="flex gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
          <p className="text-sm text-gray-600">
            Set your screening requirements. These will be used to automatically pre-qualify applicants.
          </p>
        </div>
      </div>
      <FormField
        control={form.control}
        name="creditScore"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Minimum Credit Score</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="600">600+</SelectItem>
                <SelectItem value="650">650+</SelectItem>
                <SelectItem value="700">700+</SelectItem>
                <SelectItem value="750">750+</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="incomeMultiplier"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Minimum Income Requirement</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="2.5">2.5× monthly rent</SelectItem>
                <SelectItem value="3">3× monthly rent</SelectItem>
                <SelectItem value="3.5">3.5× monthly rent</SelectItem>
                <SelectItem value="4">4× monthly rent</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="space-y-3">
        <FormField
          control={form.control}
          name="noEvictions"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0">No prior evictions</FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cleanHistory"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0">Clean rental payment history</FormLabel>
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  const AdditionalSettings = () => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="petPolicy"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pet Policy</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="no">No pets allowed</SelectItem>
                <SelectItem value="cats">Cats only</SelectItem>
                <SelectItem value="dogs">Dogs only</SelectItem>
                <SelectItem value="both">Both cats and dogs allowed</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      {form.watch("petPolicy") !== "no" && (
        <FormField
          control={form.control}
          name="petDeposit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pet Deposit</FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input type="number" className="pl-9" placeholder="Enter amount" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      <FormField
        control={form.control}
        name="leaseLength"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Minimum Lease Length (months)</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="18">18 months</SelectItem>
                <SelectItem value="24">24 months</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="securityDeposit"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Security Deposit</FormLabel>
            <FormControl>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input type="number" className="pl-9" placeholder="Enter amount" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl">
        <div className="p-6 bg-blue-50 border-b border-blue-100">
          <div className="flex items-start gap-3 mb-4">
            <Info className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h2 className="text-lg font-semibold mb-1">Create a Property Screening Page</h2>
              <p className="text-gray-600">Set up your property details and requirements to start receiving qualified RentCard applications.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                1
              </div>
              <p className="text-sm">Enter property details and requirements</p>
            </div>
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                2
              </div>
              <p className="text-sm">Customize your screening criteria</p>
            </div>
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                3
              </div>
              <p className="text-sm">Get your unique screening page link</p>
            </div>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex justify-between items-center p-6 border-b">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Add New Property</h2>
              </div>
              <button onClick={onClose} type="button">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <StepIndicator />
              {step === 1 && (
                <>
                  <h3 className="font-medium mb-4">Property Details</h3>
                  <PropertyDetails />
                </>
              )}
              {step === 2 && (
                <>
                  <h3 className="font-medium mb-4">Screening Requirements</h3>
                  <RequirementsSection />
                </>
              )}
              {step === 3 && (
                <>
                  <h3 className="font-medium mb-4">Additional Settings</h3>
                  <AdditionalSettings />
                </>
              )}
            </div>
            <div className="flex justify-between p-6 border-t bg-gray-50">
              <div className="flex gap-3">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                  >
                    Back
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                {step < totalSteps ? (
                  <Button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="gap-2"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="gap-2"
                  >
                    Create Property
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddProperty;