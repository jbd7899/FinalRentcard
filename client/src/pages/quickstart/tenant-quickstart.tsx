import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Confetti } from "@/components/ui/confetti";
import { MobileStickyActionBar } from "@/components/ui/mobile-sticky-action-bar";
import { 
  User, 
  Home, 
  FileText, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Star,
  Share2,
  Eye
} from 'lucide-react';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { ROUTES } from '@/constants';
import { US_STATES } from '@/constants/states';

// Step 1: Essentials Schema
const essentialsSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  maxRent: z.number().min(100, "Maximum rent must be at least $100")
});

// Step 2: Employment Schema 
const employmentSchema = z.object({
  employmentStatus: z.string().min(1, "Employment status is required"),
  employer: z.string().optional(),
  jobTitle: z.string().optional(),
  monthlyIncome: z.number().min(0, "Income must be a positive number").optional(),
  employmentDuration: z.string().optional()
});

// Step 3: Documents Schema (optional)
const documentsSchema = z.object({
  hasDocuments: z.boolean().default(false),
  documentTypes: z.array(z.string()).optional()
});

type EssentialsForm = z.infer<typeof essentialsSchema>;
type EmploymentForm = z.infer<typeof employmentSchema>;
type DocumentsForm = z.infer<typeof documentsSchema>;

interface QuickStartStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

const TenantQuickStart = () => {
  const { user } = useAuth();
  const { addToast } = useUIStore();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [rentCardPreview, setRentCardPreview] = useState<any>(null);
  const [hasLoadedFromLocalStorage, setHasLoadedFromLocalStorage] = useState(false);

  // Form data storage
  const [essentialsData, setEssentialsData] = useState<EssentialsForm | null>(null);
  const [employmentData, setEmploymentData] = useState<EmploymentForm | null>(null);
  const [documentsData, setDocumentsData] = useState<DocumentsForm | null>(null);

  const steps: QuickStartStep[] = [
    {
      id: 1,
      title: "Basic Information",
      description: "Your name and location preferences",
      icon: <User className="w-5 h-5" />,
      completed: !!essentialsData
    },
    {
      id: 2,
      title: "Employment Details",
      description: "Income and work information",
      icon: <Home className="w-5 h-5" />,
      completed: !!employmentData
    },
    {
      id: 3,
      title: "Documents & References",
      description: "Supporting materials (optional)",
      icon: <FileText className="w-5 h-5" />,
      completed: !!documentsData
    },
    ...(user ? [] : [{
      id: 4,
      title: "Create Account",
      description: "Save your RentCard",
      icon: <User className="w-5 h-5" />,
      completed: false
    }])
  ];

  // Create RentCard mutation
  const createRentCardMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/tenant/profile/quickstart', {
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      setRentCardPreview(data);
      queryClient.invalidateQueries({ queryKey: ['tenant-profile'] });
      addToast({
        title: "🎉 RentCard Created!",
        description: "You can now preview and share your RentCard",
        type: "success"
      });
    }
  });

  // Step 1 Form
  const essentialsForm = useForm<EssentialsForm>({
    resolver: zodResolver(essentialsSchema),
    defaultValues: essentialsData || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      city: '',
      state: '',
      maxRent: 1500
    }
  });

  // Step 2 Form
  const employmentForm = useForm<EmploymentForm>({
    resolver: zodResolver(employmentSchema),
    defaultValues: employmentData || {
      employmentStatus: '',
      employer: '',
      jobTitle: '',
      monthlyIncome: undefined,
      employmentDuration: ''
    }
  });

  // Step 3 Form
  const documentsForm = useForm<DocumentsForm>({
    resolver: zodResolver(documentsSchema),
    defaultValues: documentsData || {
      hasDocuments: false,
      documentTypes: []
    }
  });

  // Auto-save to localStorage (only after initial load)
  useEffect(() => {
    if (!hasLoadedFromLocalStorage) return; // Don't save until we've loaded first
    
    const draftData = {
      essentials: essentialsData,
      employment: employmentData,
      documents: documentsData,
      currentStep,
      timestamp: Date.now()
    };
    console.log('Saving draft to localStorage:', draftData);
    localStorage.setItem('tenantQuickStartDraft', JSON.stringify(draftData));
  }, [essentialsData, employmentData, documentsData, currentStep, hasLoadedFromLocalStorage]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('tenantQuickStartDraft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        console.log('Loading draft from localStorage:', parsed);
        if (parsed.essentials) {
          setEssentialsData(parsed.essentials);
          essentialsForm.reset(parsed.essentials);
        }
        if (parsed.employment) {
          setEmploymentData(parsed.employment);
          employmentForm.reset(parsed.employment);
        }
        if (parsed.documents) {
          setDocumentsData(parsed.documents);
          documentsForm.reset(parsed.documents);
        }
        if (parsed.currentStep && parsed.currentStep > 1) setCurrentStep(parsed.currentStep);
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
    // Always set this flag to enable auto-saving after load attempt
    setHasLoadedFromLocalStorage(true);
  }, []);

  const handleEssentialsSubmit = async (data: EssentialsForm) => {
    setEssentialsData(data);
    
    // IMMEDIATE VALUE: Create local RentCard preview instantly - no backend dependency!
    const localPreview = {
      id: 'preview',
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      location: `${data.city}, ${data.state}`,
      maxRent: data.maxRent,
      shareUrl: `${window.location.origin}/rentcard/preview-${Date.now()}`,
      created: new Date().toISOString()
    };
    setRentCardPreview(localPreview);
    
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
    setCurrentStep(2);
    
    // Background: Try to persist to backend (non-blocking)
    createRentCardMutation.mutate({
      ...data,
      step: 'essentials'
    });
  };

  const handleEmploymentSubmit = (data: EmploymentForm) => {
    setEmploymentData(data);
    setCurrentStep(3);
    
    // Background: Update RentCard with employment data (non-blocking)
    if (user) {
      createRentCardMutation.mutate({
        ...essentialsData,
        ...data,
        step: 'employment'
      });
    }
  };

  const handleDocumentsSubmit = (data: DocumentsForm) => {
    setDocumentsData(data);
    
    // Final RentCard update (if authenticated)
    if (user) {
      createRentCardMutation.mutate({
        ...essentialsData,
        ...employmentData,
        ...data,
        step: 'complete'
      });
    }
    
    addToast({
      title: "🎉 RentCard Created!",
      description: user ? "Your RentCard is saved and ready to share" : "Create an account to save and share your RentCard",
      type: "success"
    });
    
    // Show account creation prompt if not authenticated
    if (!user) {
      setCurrentStep(4); // New step for account creation
    } else {
      // Redirect to dashboard if already authenticated
      setTimeout(() => {
        setLocation(ROUTES.TENANT.DASHBOARD + '?welcome=true');
      }, 2000);
    }
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {showCelebration && <Confetti />}
      
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your RentCard
          </h1>
          <p className="text-gray-600">
            Get your profile ready in under 3 minutes
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progressPercentage)}% complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          
          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {steps.map((step) => (
              <div 
                key={step.id} 
                className={`flex flex-col items-center ${step.id <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step.completed ? 'bg-green-500 border-green-500 text-white' :
                  step.id === currentStep ? 'bg-blue-600 border-blue-600 text-white' :
                  'border-gray-300'
                }`}>
                  {step.completed ? <CheckCircle className="w-5 h-5" /> : step.icon}
                </div>
                <span className="text-xs mt-1 text-center max-w-20">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {steps[currentStep - 1].icon}
              {steps[currentStep - 1].title}
            </CardTitle>
            <p className="text-gray-600">{steps[currentStep - 1].description}</p>
          </CardHeader>
          <CardContent>
            {/* Step 1: Essentials */}
            {currentStep === 1 && (
              <Form {...essentialsForm}>
                <form onSubmit={essentialsForm.handleSubmit(handleEssentialsSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={essentialsForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} data-testid="input-first-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={essentialsForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} data-testid="input-last-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={essentialsForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={essentialsForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="(555) 123-4567" {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={essentialsForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Austin" {...field} data-testid="input-city" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={essentialsForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-state">
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {US_STATES.map((state) => (
                                <SelectItem key={state.value} value={state.value}>
                                  {state.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={essentialsForm.control}
                    name="maxRent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Monthly Rent</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="1500" 
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value) || 0)}
                            data-testid="input-max-rent"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                      <Star className="w-5 h-5" />
                      <span className="font-medium">What happens next?</span>
                    </div>
                    <p className="text-blue-600 text-sm">
                      After this step, you'll get an instant RentCard preview that you can share with landlords!
                    </p>
                  </div>
                </form>
              </Form>
            )}

            {/* Step 2: Employment */}
            {currentStep === 2 && (
              <Form {...employmentForm}>
                <form onSubmit={employmentForm.handleSubmit(handleEmploymentSubmit)} className="space-y-4">
                  <FormField
                    control={employmentForm.control}
                    name="employmentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-employment-status">
                              <SelectValue placeholder="Select employment status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="employed">Employed</SelectItem>
                            <SelectItem value="self-employed">Self-Employed</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="unemployed">Unemployed</SelectItem>
                            <SelectItem value="retired">Retired</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={employmentForm.control}
                      name="employer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employer (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Company name" {...field} data-testid="input-employer" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={employmentForm.control}
                      name="jobTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Software Engineer" {...field} data-testid="input-job-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={employmentForm.control}
                    name="monthlyIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Income (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="5000" 
                            {...field}
                            onChange={e => {
                              const val = e.target.value;
                              field.onChange(val === '' ? undefined : Number(val));
                            }}
                            data-testid="input-monthly-income"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Preview Button */}
                  {rentCardPreview && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-700">
                          <Eye className="w-5 h-5" />
                          <span className="font-medium">Your RentCard is ready!</span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(ROUTES.TENANT.RENTCARD)}
                          data-testid="button-preview-rentcard"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </Form>
            )}

            {/* Step 3: Documents */}
            {currentStep === 3 && (
              <Form {...documentsForm}>
                <form onSubmit={documentsForm.handleSubmit(handleDocumentsSubmit)} className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Almost Done! 🎉
                    </h3>
                    <p className="text-gray-600">
                      Documents and references can be added later. Your RentCard is already shareable!
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Ready to share your RentCard?</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>✅ Basic information complete</p>
                      <p>✅ Employment details added</p>
                      <p>✅ Shareable link generated</p>
                    </div>
                    
                    <div className="flex gap-3 mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          // Create a preview URL using local data
                          const previewUrl = `${window.location.origin}/rentcard/preview?name=${encodeURIComponent(`${essentialsData?.firstName} ${essentialsData?.lastName}`)}&city=${encodeURIComponent(essentialsData?.city || '')}`;
                          window.open(previewUrl, '_blank');
                        }}
                        data-testid="button-preview-final"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview RentCard
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            )}

            {/* Step 4: Account Creation (for anonymous users) */}
            {currentStep === 4 && !user && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Save Your RentCard! 🎉
                  </h3>
                  <p className="text-gray-600">
                    Create a free account to save your RentCard and start sharing it with landlords.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">Your RentCard is ready!</h4>
                  <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <p>✅ Profile: {essentialsData?.firstName} {essentialsData?.lastName}</p>
                    <p>✅ Location: {essentialsData?.city}, {essentialsData?.state}</p>
                    <p>✅ Budget: Up to ${essentialsData?.maxRent}/month</p>
                    <p>✅ Employment: {employmentData?.employmentStatus}</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setLocation('/auth?action=register')}
                      className="flex-1"
                      data-testid="button-create-account"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Create Free Account
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setLocation('/auth?action=login')}
                      data-testid="button-sign-in"
                    >
                      Sign In
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    No credit card required • Create account in 30 seconds
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mobile Sticky Action Bar */}
        <MobileStickyActionBar className="md:hidden">
          <div className="flex gap-3 w-full">
            {currentStep > 1 && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button
              size="lg"
              onClick={() => {
                if (currentStep === 1) essentialsForm.handleSubmit(handleEssentialsSubmit)();
                else if (currentStep === 2) employmentForm.handleSubmit(handleEmploymentSubmit)();
                else documentsForm.handleSubmit(handleDocumentsSubmit)();
              }}
              disabled={createRentCardMutation.isPending}
              className="flex-1"
              data-testid="button-continue"
            >
              {createRentCardMutation.isPending ? (
                "Saving..."
              ) : currentStep === 3 ? (
                <>
                  Complete Setup
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </MobileStickyActionBar>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex justify-between">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              data-testid="button-back-desktop"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <Button
            onClick={() => {
              if (currentStep === 1) essentialsForm.handleSubmit(handleEssentialsSubmit)();
              else if (currentStep === 2) employmentForm.handleSubmit(handleEmploymentSubmit)();
              else documentsForm.handleSubmit(handleDocumentsSubmit)();
            }}
            disabled={createRentCardMutation.isPending}
            className="ml-auto"
            data-testid="button-continue-desktop"
          >
            {createRentCardMutation.isPending ? (
              "Saving..."
            ) : currentStep === 3 ? (
              <>
                Complete Setup
                <CheckCircle className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TenantQuickStart;