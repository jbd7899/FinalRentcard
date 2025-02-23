import { useState } from 'react';
import { useLocation } from "wouter";
import { useAuthStore } from '@/stores/authStore';
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
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ROUTES, API_ENDPOINTS, MESSAGES } from '@/constants';
import { useUIStore } from '@/stores/uiStore';

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
import React from "react";

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

const STEPS = ['property_details', 'requirements', 'additional_settings'] as const;
type Step = typeof STEPS[number];

// Main page component wrapper
const AddProperty = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6">
        <AddPropertyForm onClose={() => setLocation("/landlord/dashboard")} />
      </div>
    </div>
  );
};

// Move step components outside main component to prevent recreation
const PropertyDetails = React.memo(({ control }: { control: any }) => (
  <div className="space-y-4">
    <FormField
      control={control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Property Name</FormLabel>
          <FormControl>
            <Input 
              {...field}
              placeholder="e.g., Oak Ridge Apartments"
              onChange={(e) => field.onChange(e)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Property Type</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
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
      control={control}
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
        control={control}
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
        control={control}
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
      control={control}
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
      control={control}
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
));

const RequirementsSection = React.memo(({ control }: { control: any }) => (
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
      control={control}
      name="creditScore"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Minimum Credit Score</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
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
      control={control}
      name="incomeMultiplier"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Minimum Income Requirement</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
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
        control={control}
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
        control={control}
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
));

const AdditionalSettings = React.memo(({ control }: { control: any }) => {
  const petPolicy = useWatch({
    control,
    name: "petPolicy"
  });

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="petPolicy"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pet Policy</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
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
      {petPolicy !== "no" && (
        <FormField
          control={control}
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
        control={control}
        name="leaseLength"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Minimum Lease Length (months)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
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
        control={control}
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
});

// Form component
const AddPropertyForm = ({ onClose }: { onClose: () => void }) => {
  const [currentStep, setCurrentStep] = useState<Step>('property_details');
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { setLoading, addToast, loadingStates } = useUIStore();
  const isLoading = loadingStates['createProperty'];

  // Create stable form instance
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    mode: "onChange",
    criteriaMode: "all",
    shouldUnregister: false, // Prevent field unregistering
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

  // Memoize step content
  const stepContent = React.useMemo(() => ({
    'property_details': <PropertyDetails control={form.control} />,
    'requirements': <RequirementsSection control={form.control} />,
    'additional_settings': <AdditionalSettings control={form.control} />
  }), [form.control]);

  // Add form state debugging
  const formState = form.formState;
  console.log('Form State:', {
    isDirty: formState.isDirty,
    dirtyFields: formState.dirtyFields,
    isValid: formState.isValid,
    errors: formState.errors
  });

  const currentStepIndex = STEPS.indexOf(currentStep);

  const handleNextStep = async () => {
    const fields = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fields);
    console.log('Next step validation:', { fields, isValid, errors: form.formState.errors });
    
    if (isValid) {
      setCurrentStep(prevStep => {
        const currentIndex = STEPS.indexOf(prevStep);
        return STEPS[currentIndex + 1];
      });
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prevStep => {
      const currentIndex = STEPS.indexOf(prevStep);
      return STEPS[currentIndex - 1];
    });
  };

  const onSubmit = async (data: PropertyFormValues) => {
    console.log('Form submission data:', data);
    try {
      if (!user?.id) {
        throw new Error('You must be logged in to create a property');
      }

      setLoading('createProperty', true);

      // Transform the data to match API expectations
      const transformedData = {
        ...data,
        rent: parseFloat(data.rent),
        securityDeposit: parseFloat(data.securityDeposit),
        petDeposit: data.petDeposit ? parseFloat(data.petDeposit) : undefined,
        leaseLength: parseInt(data.leaseLength),
        userId: user.id
      };
      
      console.log('Transformed data:', transformedData);
      
      // Make the API request
      const response = await apiRequest('POST', API_ENDPOINTS.PROPERTIES.CREATE, transformedData);
      const responseData = await response.json();
      console.log('API Response:', responseData);
      
      // Update UI and redirect
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PROPERTIES.BASE] });
      addToast({
        title: MESSAGES.TOAST.PROPERTY.CREATE_SUCCESS.TITLE,
        description: MESSAGES.TOAST.PROPERTY.CREATE_SUCCESS.DESCRIPTION,
        type: 'success'
      });
      onClose();
      setLocation(ROUTES.LANDLORD.DASHBOARD);
    } catch (error) {
      console.error('Form submission error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: data,
        user: user
      });
      
      // Show error toast with more details
      addToast({
        title: MESSAGES.ERRORS.GENERAL,
        description: error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while creating the property. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading('createProperty', false);
    }
  };

  // Helper to get fields for current step
  const getFieldsForStep = (step: Step): (keyof PropertyFormValues)[] => {
    switch (step) {
      case 'property_details':
        return ['name', 'type', 'address', 'rent', 'availableDate'];
      case 'requirements':
        return ['creditScore', 'incomeMultiplier', 'noEvictions', 'cleanHistory'];
      case 'additional_settings':
        return ['petPolicy', 'leaseLength', 'securityDeposit'];
      default:
        return [];
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((stepId, index) => (
        <div key={stepId} className="flex items-center">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center
            ${currentStepIndex >= index ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
          `}>
            {index + 1}
          </div>
          {index < STEPS.length - 1 && (
            <div className={`w-16 h-1 ${currentStepIndex > index ? 'bg-blue-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-3xl my-4">
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
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
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
              {stepContent[currentStep]}
            </div>
            <div className="flex justify-between p-6 border-t bg-gray-50 sticky bottom-0">
              <div className="flex gap-3">
                {currentStepIndex > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreviousStep}
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
                {currentStepIndex < STEPS.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="gap-2"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Creating Property...
                      </>
                    ) : (
                      <>
                        Create Property
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
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