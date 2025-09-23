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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Confetti } from "@/components/ui/confetti";
import { MobileStickyActionBar } from "@/components/ui/mobile-sticky-action-bar";
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { 
  Building2, 
  Share2, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Star,
  QrCode,
  Download,
  Link as LinkIcon,
  Users,
  User
} from 'lucide-react';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { ROUTES } from '@/constants';

// Step 1: Property Basics Schema
const propertyBasicsSchema = z.object({
  address: z.string().min(5, "Address is required"),
  rent: z.number().min(100, "Rent must be at least $100"),
  bedrooms: z.number().min(0, "Bedrooms must be 0 or more"),
  bathrooms: z.number().min(0.5, "Bathrooms must be 0.5 or more"),
  propertyType: z.string().min(1, "Property type is required")
});

// Step 2: Share Setup Schema
const shareSetupSchema = z.object({
  enablePublicLink: z.boolean().default(true),
  enableQRCode: z.boolean().default(true),
  customMessage: z.string().optional()
});

// Step 3: Interest Collection Schema
const interestCollectionSchema = z.object({
  enableGeneralScreening: z.boolean().default(true),
  requireRentCard: z.boolean().default(false)
});

type PropertyBasicsForm = z.infer<typeof propertyBasicsSchema>;
type ShareSetupForm = z.infer<typeof shareSetupSchema>;
type InterestCollectionForm = z.infer<typeof interestCollectionSchema>;

interface QuickStartStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

const LandlordQuickStart = () => {
  const { user } = useAuth();
  const { addToast } = useUIStore();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [propertyData, setPropertyData] = useState<any>(null);
  const [shareData, setShareData] = useState<any>(null);

  // Form data storage
  const [propertyBasicsData, setPropertyBasicsData] = useState<PropertyBasicsForm | null>(null);
  const [shareSetupData, setShareSetupData] = useState<ShareSetupForm | null>(null);
  const [interestCollectionData, setInterestCollectionData] = useState<InterestCollectionForm | null>(null);

  const steps: QuickStartStep[] = [
    {
      id: 1,
      title: "Property Details",
      description: "Address, rent, and basic info",
      icon: <Building2 className="w-5 h-5" />,
      completed: !!propertyBasicsData
    },
    {
      id: 2,
      title: "Share & Promote",
      description: "QR codes and sharing tools",
      icon: <Share2 className="w-5 h-5" />,
      completed: !!shareSetupData
    },
    {
      id: 3,
      title: "Collect Interest",
      description: "Enable tenant applications",
      icon: <Users className="w-5 h-5" />,
      completed: !!interestCollectionData
    },
    ...(user ? [] : [{
      id: 4,
      title: "Create Account",
      description: "Save your property",
      icon: <User className="w-5 h-5" />,
      completed: false
    }])
  ];

  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/landlord/property/quickstart', {
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      setPropertyData(data);
      queryClient.invalidateQueries({ queryKey: ['landlord-properties'] });
      addToast({
        title: "🏠 Property Created!",
        description: "Your property is ready to share with tenants",
        type: "success"
      });
    }
  });

  // Generate share tools mutation
  const generateShareToolsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/landlord/property/share-tools', {
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      setShareData(data);
      addToast({
        title: "🔗 Share Tools Ready!",
        description: "QR code and sharing links generated",
        type: "success"
      });
    }
  });

  // Forms
  const propertyBasicsForm = useForm<PropertyBasicsForm>({
    resolver: zodResolver(propertyBasicsSchema),
    defaultValues: propertyBasicsData || {
      address: '',
      rent: 1500,
      bedrooms: 2,
      bathrooms: 1,
      propertyType: ''
    }
  });

  const shareSetupForm = useForm<ShareSetupForm>({
    resolver: zodResolver(shareSetupSchema),
    defaultValues: shareSetupData || {
      enablePublicLink: true,
      enableQRCode: true,
      customMessage: ''
    }
  });

  const interestCollectionForm = useForm<InterestCollectionForm>({
    resolver: zodResolver(interestCollectionSchema),
    defaultValues: interestCollectionData || {
      enableGeneralScreening: true,
      requireRentCard: false
    }
  });

  // Auto-save to localStorage
  useEffect(() => {
    const draftData = {
      propertyBasics: propertyBasicsData,
      shareSetup: shareSetupData,
      interestCollection: interestCollectionData,
      currentStep,
      timestamp: Date.now()
    };
    localStorage.setItem('landlordQuickStartDraft', JSON.stringify(draftData));
  }, [propertyBasicsData, shareSetupData, interestCollectionData, currentStep]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('landlordQuickStartDraft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.propertyBasics) setPropertyBasicsData(parsed.propertyBasics);
        if (parsed.shareSetup) setShareSetupData(parsed.shareSetup);
        if (parsed.interestCollection) setInterestCollectionData(parsed.interestCollection);
        if (parsed.currentStep && parsed.currentStep > 1) setCurrentStep(parsed.currentStep);
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  const handlePropertyBasicsSubmit = async (data: PropertyBasicsForm) => {
    setPropertyBasicsData(data);
    
    // IMMEDIATE VALUE: Create local property and share tools instantly - no backend dependency!
    const tempSlug = `property-${Date.now()}`;
    const localProperty = {
      id: 'preview',
      slug: tempSlug,
      address: data.address,
      rent: data.rent,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      propertyType: data.propertyType,
      created: new Date().toISOString()
    };
    setPropertyData(localProperty);
    
    // Immediate share tools
    const localShareUrl = `${window.location.origin}/property/${tempSlug}`;
    setShareData({
      shareUrl: localShareUrl,
      qrGenerated: true
    });
    
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
    setCurrentStep(2);
    
    // Background: Try to persist to backend (non-blocking)
    createPropertyMutation.mutate({
      ...data,
      step: 'basics'
    });
  };

  const handleShareSetupSubmit = async (data: ShareSetupForm) => {
    setShareSetupData(data);
    
    // Share tools already generated in step 1 - just proceed
    addToast({
      title: "🔗 Sharing Ready!",
      description: "Your property QR code and link are ready to share",
      type: "success"
    });
    
    setCurrentStep(3);
    
    // Background: Try to persist share settings (non-blocking)
    if (user) {
      generateShareToolsMutation.mutate({
        propertyId: propertyData?.id,
        ...data,
        step: 'share'
      });
    }
  };

  const handleInterestCollectionSubmit = (data: InterestCollectionForm) => {
    setInterestCollectionData(data);
    
    addToast({
      title: "🎉 Property Created!",
      description: user ? "Your property is saved and ready to attract tenants" : "Create an account to save and manage your property",
      type: "success"
    });
    
    // Show account creation prompt if not authenticated
    if (!user) {
      setCurrentStep(4); // New step for account creation
    } else {
      // Redirect to dashboard if already authenticated
      setTimeout(() => {
        setLocation(ROUTES.LANDLORD.DASHBOARD + '?welcome=true');
      }, 2000);
    }
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  // Property URL available immediately after step 1
  const propertyUrl = propertyData ? `${window.location.origin}/property/${propertyData.slug}` : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-4">
      {showCelebration && <Confetti />}
      
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Property Listing
          </h1>
          <p className="text-gray-600">
            Get your property ready to attract tenants in under 3 minutes
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
                className={`flex flex-col items-center ${step.id <= currentStep ? 'text-emerald-600' : 'text-gray-400'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step.completed ? 'bg-green-500 border-green-500 text-white' :
                  step.id === currentStep ? 'bg-emerald-600 border-emerald-600 text-white' :
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
            {/* Step 1: Property Basics */}
            {currentStep === 1 && (
              <Form {...propertyBasicsForm}>
                <form onSubmit={propertyBasicsForm.handleSubmit(handlePropertyBasicsSubmit)} className="space-y-4">
                  <FormField
                    control={propertyBasicsForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123 Main St, Austin, TX 78701" 
                            {...field} 
                            data-testid="input-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={propertyBasicsForm.control}
                      name="rent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Rent ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1500" 
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value) || 0)}
                              data-testid="input-rent"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={propertyBasicsForm.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-property-type">
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={propertyBasicsForm.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="2" 
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value) || 0)}
                              data-testid="input-bedrooms"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={propertyBasicsForm.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.5"
                              placeholder="1" 
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value) || 0)}
                              data-testid="input-bathrooms"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-emerald-700 mb-2">
                      <Star className="w-5 h-5" />
                      <span className="font-medium">What happens next?</span>
                    </div>
                    <p className="text-emerald-600 text-sm">
                      Your property will get an instant shareable link and QR code for marketing!
                    </p>
                  </div>
                </form>
              </Form>
            )}

            {/* Step 2: Share Setup */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Property Created Success */}
                {propertyData && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Property Created!</span>
                    </div>
                    <p className="text-green-600 text-sm mb-3">
                      Your property is live and ready to share with tenants.
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {propertyBasicsData?.address}
                      </Badge>
                      <Badge variant="outline">
                        ${propertyBasicsData?.rent}/month
                      </Badge>
                    </div>
                  </div>
                )}

                {/* QR Code Display */}
                {propertyUrl && (
                  <div className="bg-white p-6 rounded-lg border text-center">
                    <h3 className="font-semibold mb-4">Your Property QR Code</h3>
                    <div className="flex justify-center mb-4">
                      <QRCode 
                        value={propertyUrl} 
                        size={150}
                        level="H"
                        data-testid="qr-code"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Scan to view property details and submit interest
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" size="sm" data-testid="button-download-qr">
                        <Download className="w-4 h-4 mr-2" />
                        Download QR
                      </Button>
                      <Button variant="outline" size="sm" data-testid="button-copy-link">
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Copy Link
                      </Button>
                    </div>
                  </div>
                )}

                <Form {...shareSetupForm}>
                  <form onSubmit={shareSetupForm.handleSubmit(handleShareSetupSubmit)} className="space-y-4">
                    <FormField
                      control={shareSetupForm.control}
                      name="customMessage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Message for Tenants (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Great location, pet-friendly, available immediately!"
                              {...field}
                              data-testid="input-custom-message"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </div>
            )}

            {/* Step 3: Interest Collection */}
            {currentStep === 3 && (
              <Form {...interestCollectionForm}>
                <form onSubmit={interestCollectionForm.handleSubmit(handleInterestCollectionSubmit)} className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Almost Done! 🎉
                    </h3>
                    <p className="text-gray-600">
                      Set up how tenants can show interest in your property.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Your property is ready!</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>✅ Property details complete</p>
                      <p>✅ QR code generated</p>
                      <p>✅ Shareable link created</p>
                      <p>✅ Ready to collect tenant interest</p>
                    </div>
                    
                    <div className="flex gap-3 mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.open(propertyUrl, '_blank')}
                        data-testid="button-preview-property"
                      >
                        <Building2 className="w-4 h-4 mr-2" />
                        Preview Property
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setLocation(ROUTES.LANDLORD.DASHBOARD)}
                        data-testid="button-view-dashboard"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        View Dashboard
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
                    Save Your Property! 🎉
                  </h3>
                  <p className="text-gray-600">
                    Create a free account to save your property and start attracting tenants.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">Your property is ready!</h4>
                  <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <p>✅ Property: {propertyBasicsData?.address}</p>
                    <p>✅ Rent: ${propertyBasicsData?.rent}/month</p>
                    <p>✅ QR Code: Generated and ready to share</p>
                    <p>✅ Public Link: Available for marketing</p>
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
                if (currentStep === 1) propertyBasicsForm.handleSubmit(handlePropertyBasicsSubmit)();
                else if (currentStep === 2) shareSetupForm.handleSubmit(handleShareSetupSubmit)();
                else interestCollectionForm.handleSubmit(handleInterestCollectionSubmit)();
              }}
              disabled={createPropertyMutation.isPending || generateShareToolsMutation.isPending}
              className="flex-1"
              data-testid="button-continue"
            >
              {(createPropertyMutation.isPending || generateShareToolsMutation.isPending) ? (
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
              if (currentStep === 1) propertyBasicsForm.handleSubmit(handlePropertyBasicsSubmit)();
              else if (currentStep === 2) shareSetupForm.handleSubmit(handleShareSetupSubmit)();
              else interestCollectionForm.handleSubmit(handleInterestCollectionSubmit)();
            }}
            disabled={createPropertyMutation.isPending || generateShareToolsMutation.isPending}
            className="ml-auto"
            data-testid="button-continue-desktop"
          >
            {(createPropertyMutation.isPending || generateShareToolsMutation.isPending) ? (
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

export default LandlordQuickStart;