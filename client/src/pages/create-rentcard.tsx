import React, { useMemo } from 'react';
import { useLocation } from 'wouter';
import { User, Home, CreditCard, CheckCircle, ArrowRight, Building2, Loader2, Award, Mail, MessageSquare, Copy, Save, Share2, Star } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertRentCardSchema, type InsertRentCard } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuthStore } from '@/stores/authStore';
import { z } from "zod";
import { VALIDATION, FORM_MESSAGES, MESSAGES, ROUTES } from '@/constants';
import Navbar from '@/components/shared/navbar';
import { useRentCardStore } from '@/stores/rentCardStore';
import { useUIStore } from '@/stores/uiStore';
import { MultiStepForm, StepConfig } from '@/components/ui/multi-step-form';
import { convertFormNumericValues } from '@/utils/form-utils';
import { EnhancedShareModal } from '@/components/shared/EnhancedShareModal';
import OneClickShareButton from '@/components/shared/OneClickShareButton';

// Registration schema (unchanged)
const registrationSchema = z.object({
  password: z.string().min(VALIDATION.PASSWORD.MIN_LENGTH, VALIDATION.PASSWORD.MESSAGE)
    .regex(VALIDATION.PASSWORD.REGEX, VALIDATION.PASSWORD.REGEX_MESSAGE),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: FORM_MESSAGES.PASSWORDS_MUST_MATCH,
  path: ["confirmPassword"],
});

type RegistrationForm = z.infer<typeof registrationSchema>;

type SidebarPreviewProps = {
  formData: Partial<InsertRentCard>;
  onPublish?: () => Promise<void>;
  isPublishing?: boolean;
  isPublished?: boolean;
};

const SidebarPreview = React.memo(({ formData, onPublish, isPublishing = false, isPublished = false }: SidebarPreviewProps) => {
  const [shareModalOpen, setShareModalOpen] = React.useState(false);
  const { toast } = useToast();
  
  const completedFields = Object.keys(formData).filter(
    key => formData[key as keyof InsertRentCard] && formData[key as keyof InsertRentCard] !== '0'
  ).length;
  const totalFields = Object.keys(insertRentCardSchema.shape).length; // Use schema for total fields
  const profileStrength = Math.round((completedFields / totalFields) * 100);

  const handleSharePreview = () => {
    const previewData = JSON.stringify(formData);
    const previewUrl = `${window.location.origin}/rentcard/preview/${btoa(previewData)}`;
    navigator.clipboard.writeText(previewUrl);
    toast({
      title: "Preview link copied!",
      description: "Note: This is a preview only and not saved yet.",
    });
  };

  const handlePublish = async () => {
    if (onPublish) {
      try {
        await onPublish();
        setShareModalOpen(true);
        toast({
          title: "RentCard published!",
          description: "Your RentCard is now ready to share with landlords.",
        });
      } catch (error) {
        console.error('Publish error:', error);
        toast({
          title: "Publishing failed",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="sticky top-4">
      <Card className="bg-muted">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">
                {formData.firstName && formData.lastName 
                  ? `${formData.firstName} ${formData.lastName}'s RentCard` 
                  : "Your RentCard Preview"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isPublished ? "Published and ready to share!" : `Profile in progress (${profileStrength}%)`}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {!isPublished ? (
                <>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handlePublish}
                    disabled={isPublishing || !onPublish}
                    className="flex items-center gap-1"
                    data-testid="button-publish-rentcard"
                  >
                    {isPublishing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />Publishing...</>
                    ) : (
                      <><Share2 className="w-4 h-4" />Publish RentCard</>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSharePreview}
                    className="flex items-center gap-1 text-xs"
                  >
                    Preview Only
                  </Button>
                </>
              ) : (
                <>
                  <OneClickShareButton 
                    className="flex items-center gap-1"
                    size="sm"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShareModalOpen(true)}
                    className="flex items-center gap-1 text-xs"
                  >
                    Manage Links
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Profile Strength */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold">{Math.round(profileStrength / 20)}</div>
                  <Star className="w-4 h-4 text-yellow-400 mx-auto" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Profile Strength</p>
                <Badge variant="secondary" className="mt-1">
                  {profileStrength}% Complete
                </Badge>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          {(formData.firstName || formData.email || formData.phone) && (
            <div className="mb-4">
              <p className="text-sm font-medium">Tenant Info</p>
              <div className="text-sm text-muted-foreground mt-1 space-y-1">
                <p>{formData.firstName} {formData.lastName || ''}</p>
                <p>{formData.email || '—'}</p>
                <p>{formData.phone || '—'}</p>
              </div>
            </div>
          )}

          {/* Financial Overview */}
          {(formData.maxRent || formData.creditScore || formData.monthlyIncome) && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium">Financial Overview</p>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Max Rent: ${formData.maxRent || '—'}</p>
                <p>Credit Score: {formData.creditScore || '—'}</p>
                <p>Monthly Income: ${formData.monthlyIncome || '—'}</p>
              </div>
            </div>
          )}

          {/* Prompt to Complete */}
          {!isPublished && (
            <p className="text-xs text-muted-foreground italic">
              Fill out more details to make your RentCard stand out!
            </p>
          )}
          
          {/* Enhanced Share Modal */}
          <EnhancedShareModal
            open={shareModalOpen}
            onOpenChange={setShareModalOpen}
            resourceType="rentcard"
            title="Share Your RentCard"
            description="Share this link with landlords to let them view your rental profile"
          />
        </CardContent>
      </Card>
    </div>
  );
});

SidebarPreview.displayName = 'SidebarPreview';

export default function CreateRentCard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user, login } = useAuthStore();
  const { step, setStep, formData, setFormData, reset } = useRentCardStore();
  const { setLoading } = useUIStore();
  const [showPasswordForm, setShowPasswordForm] = React.useState(false);
  const [isPublished, setIsPublished] = React.useState(false);

  const form = useForm<InsertRentCard>({
    resolver: zodResolver(insertRentCardSchema),
    defaultValues: {
      ...formData,
      hasPets: formData.hasPets !== undefined ? formData.hasPets : false,
      hasRoommates: formData.hasRoommates !== undefined ? formData.hasRoommates : false
    }
  });

  const passwordForm = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  // Define numeric fields for conversion
  const numericFields = ['monthlyIncome', 'currentRent', 'maxRent', 'creditScore'];

  const createRentCardMutation = useMutation({
    mutationFn: async (data: InsertRentCard) => {
      setLoading('createRentCard', true);
      try {
        // Convert numeric fields
        const processedData = convertFormNumericValues(data, numericFields);
        
        const response = await apiRequest('POST', '/api/tenant/rentcard', {
          ...processedData,
          userId: user?.id
        });
        if (!response.ok) throw new Error(MESSAGES.ERRORS.GENERAL);
        return response.json();
      } finally {
        setLoading('createRentCard', false);
      }
    },
    onSuccess: (data) => {
      console.log('RentCard created successfully:', data);
      
      setIsPublished(true);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['tenant-profile'] });
      queryClient.invalidateQueries({ queryKey: ['share-tokens'] });
      
      toast({
        title: MESSAGES.SUCCESS.CREATED,
        description: "Your RentCard has been created successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: MESSAGES.ERRORS.GENERAL,
        description: error instanceof Error ? error.message : MESSAGES.ERRORS.GENERAL,
        variant: "destructive",
      });
    }
  });

  const handleStepChange = (newStep: number) => {
    setStep(newStep);
    
    // Show milestone toast when advancing to next step
    if (newStep > step) {
      const milestoneMessages = {
        2: { title: "Profile Starter Earned!", desc: "You've kicked off your RentCard!" },
        3: { title: "Rental Historian Earned!", desc: "Your rental history is impressing landlords!" },
        4: { title: "Income Champ Earned!", desc: "You're ready to shine—RentCard complete!" }
      };
      
      if (milestoneMessages[newStep as keyof typeof milestoneMessages]) {
        toast({
          title: milestoneMessages[newStep as keyof typeof milestoneMessages].title,
          description: (
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              {milestoneMessages[newStep as keyof typeof milestoneMessages].desc}
            </div>
          ),
        });
      }
    }
    
    // Update form data in store when changing steps
    const formData = form.getValues();
    const processedData = convertFormNumericValues(formData, numericFields);
    setFormData(processedData);
  };

  const handleFormSubmit = (data: InsertRentCard) => {
    // If we're on the final step, submit the form
    if (step === 4) {
      const processedData = convertFormNumericValues(data, numericFields);
      createRentCardMutation.mutate(processedData);
    }
  };

  // Handler for publishing from preview
  const handlePublishFromPreview = async () => {
    const currentFormData = form.getValues();
    const processedData = convertFormNumericValues(currentFormData, numericFields);
    
    // Update the store with current form data
    setFormData(processedData);
    
    // Create the RentCard
    await createRentCardMutation.mutateAsync(processedData);
  };

  const PersonalInfoStep = useMemo(() => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div><Label htmlFor="firstName">First Name</Label><Input id="firstName" placeholder="Enter first name" {...form.register('firstName')} />{form.formState.errors.firstName && <p className="text-destructive text-sm mt-1">{form.formState.errors.firstName.message}</p>}</div>
        <div><Label htmlFor="lastName">Last Name</Label><Input id="lastName" placeholder="Enter last name" {...form.register('lastName')} />{form.formState.errors.lastName && <p className="text-destructive text-sm mt-1">{form.formState.errors.lastName.message}</p>}</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="Enter email" {...form.register('email')} />{form.formState.errors.email && <p className="text-destructive text-sm mt-1">{form.formState.errors.email.message}</p>}</div>
        <div><Label htmlFor="phone">Phone</Label><Input id="phone" type="tel" placeholder="Enter phone number" {...form.register('phone')} />{form.formState.errors.phone && <p className="text-destructive text-sm mt-1">{form.formState.errors.phone.message}</p>}</div>
      </div>
      <div className="flex items-center justify-between"><Label htmlFor="hasPets">Do you have pets?</Label><Switch id="hasPets" checked={form.watch('hasPets')} onCheckedChange={(checked) => form.setValue('hasPets', checked)} />{form.formState.errors.hasPets && <p className="text-destructive text-sm mt-1">{form.formState.errors.hasPets.message}</p>}</div>
    </div>
  ), [form]);

  const RentalHistoryStep = useMemo(() => (
    <div className="space-y-6">
      <div><Label htmlFor="currentAddress">Current Address</Label><Input id="currentAddress" placeholder="Enter your current address" {...form.register('currentAddress')} />{form.formState.errors.currentAddress && <p className="text-destructive text-sm mt-1">{form.formState.errors.currentAddress.message}</p>}</div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label htmlFor="currentRent">Current Monthly Rent</Label><Input id="currentRent" type="number" placeholder="Enter amount" {...form.register('currentRent')} />{form.formState.errors.currentRent && <p className="text-destructive text-sm mt-1">{form.formState.errors.currentRent.message}</p>}</div>
        <div className="flex items-center justify-between"><Label htmlFor="hasRoommates">Do you have roommates?</Label><Switch id="hasRoommates" checked={form.watch('hasRoommates')} onCheckedChange={(checked) => form.setValue('hasRoommates', checked)} />{form.formState.errors.hasRoommates && <p className="text-destructive text-sm mt-1">{form.formState.errors.hasRoommates.message}</p>}</div>
      </div>
    </div>
  ), [form]);

  const IncomeStep = useMemo(() => (
    <div className="space-y-6">
      <div><Label htmlFor="currentEmployer">Current Employer</Label><Input id="currentEmployer" placeholder="Enter employer name" {...form.register('currentEmployer')} />{form.formState.errors.currentEmployer && <p className="text-destructive text-sm mt-1">{form.formState.errors.currentEmployer.message}</p>}</div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label htmlFor="yearsEmployed">Years in Current Job</Label><Input id="yearsEmployed" placeholder="Enter years" {...form.register('yearsEmployed')} />{form.formState.errors.yearsEmployed && <p className="text-destructive text-sm mt-1">{form.formState.errors.yearsEmployed.message}</p>}</div>
        <div><Label htmlFor="monthlyIncome">Monthly Income</Label><Input id="monthlyIncome" type="number" placeholder="Enter amount" {...form.register('monthlyIncome')} />{form.formState.errors.monthlyIncome && <p className="text-destructive text-sm mt-1">{form.formState.errors.monthlyIncome.message}</p>}</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label htmlFor="maxRent">Maximum Rent Budget</Label><Input id="maxRent" type="number" placeholder="Enter amount" {...form.register('maxRent')} />{form.formState.errors.maxRent && <p className="text-destructive text-sm mt-1">{form.formState.errors.maxRent.message}</p>}</div>
        <div><Label htmlFor="creditScore">Credit Score</Label><Input id="creditScore" type="number" placeholder="Enter credit score" {...form.register('creditScore')} />{form.formState.errors.creditScore && <p className="text-destructive text-sm mt-1">{form.formState.errors.creditScore.message}</p>}</div>
      </div>
      <div><Label htmlFor="moveInDate">Desired Move-in Date</Label><Input id="moveInDate" type="date" {...form.register('moveInDate')} />{form.formState.errors.moveInDate && <p className="text-destructive text-sm mt-1">{form.formState.errors.moveInDate.message}</p>}</div>
    </div>
  ), [form]);

  const CompletionStep = () => {
    const [isCreatingAccount, setIsCreatingAccount] = React.useState(false);
    const formData = form.getValues();

    const handleCreateAccount = async () => setShowPasswordForm(true);

    const handlePasswordSubmit = async (passwordData: RegistrationForm) => {
      setIsCreatingAccount(true);
      try {
        const loginData = {
          email: formData.email,
          password: passwordData.password
        };
        // Handle login after account creation
        // Note: This will be updated when we implement simplified creation
        
        // Convert numeric fields before submitting
        const processedData = convertFormNumericValues(formData, numericFields);
        await createRentCardMutation.mutateAsync(processedData);
      } catch (error) {
        console.error('Account creation error:', error);
        toast({
          title: MESSAGES.ERRORS.GENERAL,
          description: "Failed to create account. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsCreatingAccount(false);
        setShowPasswordForm(false);
      }
    };

    const handleShare = (method: 'email' | 'text' | 'link') => {
      const shareLink = `${window.location.origin}/rentcard/${formData.email.split('@')[0]}-${Date.now()}`;
      if (method === 'email') {
        window.location.href = `mailto:?subject=My%20RentCard&body=Check%20out%20my%20RentCard:%20${shareLink}`;
      } else if (method === 'text') {
        window.location.href = `sms:?body=Here's%20my%20RentCard:%20${shareLink}`;
      } else {
        navigator.clipboard.writeText(shareLink);
        toast({ title: "Link Copied!", description: "Share it with your landlord!" });
      }
      toast({ title: "Shared!", description: "Landlords typically respond within 24-48 hours. Keep an eye out!" });
    };

    if (showPasswordForm) {
      return (
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Create Your Account</h2>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
            <div><Label htmlFor="password">Password</Label><Input id="password" type="password" {...passwordForm.register('password')} />{passwordForm.formState.errors.password && <p className="text-destructive text-sm mt-1">{passwordForm.formState.errors.password.message}</p>}</div>
            <div><Label htmlFor="confirmPassword">Confirm Password</Label><Input id="confirmPassword" type="password" {...passwordForm.register('confirmPassword')} />{passwordForm.formState.errors.confirmPassword && <p className="text-destructive text-sm mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>}</div>
            <div className="flex gap-4 mt-6">
              <Button type="button" variant="outline" onClick={() => setShowPasswordForm(false)} disabled={isCreatingAccount}>Back</Button>
              <Button type="submit" className="flex-1" disabled={isCreatingAccount}>
                {isCreatingAccount ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Account...</> : 'Create Account'}
              </Button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-semibold mb-4">Your RentCard is Ready!</h2>
        <p className="text-muted-foreground mb-8">Landlords can pre-approve you faster with this—share it now or save it for later!</p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-medium mb-4">Share Now</h3>
            <p className="text-sm text-muted-foreground mb-4">Send your RentCard to a landlord instantly.</p>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => handleShare('email')}
                disabled={createRentCardMutation.isPending}
              >
                <Mail className="w-4 h-4" /> Email
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => handleShare('text')}
                disabled={createRentCardMutation.isPending}
              >
                <MessageSquare className="w-4 h-4" /> Text
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => handleShare('link')}
                disabled={createRentCardMutation.isPending}
              >
                <Copy className="w-4 h-4" /> Copy Link
              </Button>
            </div>
          </div>
          <div className="bg-primary/5 p-6 rounded-lg border">
            <div className="bg-primary/10 text-primary text-sm px-2 py-1 rounded-full w-fit mb-2">Recommended</div>
            <h3 className="font-medium mb-4">Create Free Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              <strong>Save & Edit Anytime:</strong> Keep your RentCard safe and update it whenever you need—perfect for your next rental search!
            </p>
            <Button
              className="w-full flex items-center gap-2"
              onClick={handleCreateAccount}
              disabled={isCreatingAccount || createRentCardMutation.isPending}
            >
              {isCreatingAccount || createRentCardMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Account...</>
              ) : (
                <><Save className="w-4 h-4" /> Create Free Account</>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Define step configurations for the multi-step form
  const formSteps: StepConfig[] = [
    {
      fields: ['firstName', 'lastName', 'email', 'phone', 'hasPets'],
      component: PersonalInfoStep,
      title: "Personal Information",
      description: "Landlords love complete profiles—start yours in minutes!"
    },
    {
      fields: ['currentAddress', 'currentRent', 'hasRoommates'],
      component: RentalHistoryStep,
      title: "Rental History",
      description: "Show landlords your rental track record instantly."
    },
    {
      fields: ['currentEmployer', 'yearsEmployed', 'monthlyIncome', 'maxRent', 'moveInDate', 'creditScore'],
      component: IncomeStep,
      title: "Income & Preferences",
      description: "Prove you're a top tenant with income and credit details."
    },
    {
      fields: [],
      component: <CompletionStep />,
      title: "Complete Your RentCard",
      description: "Landlords can pre-approve you faster with your RentCard!"
    }
  ];

  const StepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[User, Home, CreditCard, CheckCircle].map((Icon, index) => (
        <div key={index} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${step >= index + 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          <Icon className="w-5 h-5" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="p-6">
        <Card className="max-w-5xl mx-auto">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-[2fr,1fr] gap-8">
              <div className="space-y-8">
                <StepIndicator />
                
                <MultiStepForm
                  steps={formSteps}
                  form={form}
                  onStepChange={handleStepChange}
                  onSubmit={handleFormSubmit}
                  isSubmitting={createRentCardMutation.isPending}
                  submitButtonText="Complete"
                  showProgressBar={false}
                  className="space-y-8"
                />
              </div>
              
              {step < 4 && (
                <SidebarPreview 
                  formData={form.getValues()} 
                  onPublish={handlePublishFromPreview}
                  isPublishing={createRentCardMutation.isPending}
                  isPublished={isPublished}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}