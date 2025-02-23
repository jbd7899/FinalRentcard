import React, { useMemo } from 'react';
import { useLocation } from 'wouter';
import { User, Home, CreditCard, CheckCircle, ArrowRight, Building2, Loader2, Award, Mail, MessageSquare, Copy, Save } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertRentCardSchema, type InsertRentCard } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuthStore } from '@/stores/authStore';
import { z } from "zod";
import { VALIDATION, FORM_MESSAGES, MESSAGES, ROUTES } from '@/constants';
import Navbar from '@/components/shared/navbar';
import { useRentCardStore } from '@/stores/rentCardStore';
import { useUIStore } from '@/stores/uiStore';

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
};

const SidebarPreview = React.memo(({ formData }: SidebarPreviewProps) => {
  const completedFields = Object.keys(formData).filter(key => formData[key as keyof InsertRentCard] && formData[key as keyof InsertRentCard] !== '0').length;
  const totalFields = Object.keys(formData).length;
  const strength = Math.round((completedFields / totalFields) * 100);

  return (
    <div className="p-4 bg-muted rounded-lg sticky top-4">
      <h3 className="font-semibold mb-2">Your RentCard Preview</h3>
      <p><strong>Name:</strong> {formData.firstName} {formData.lastName || '—'}</p>
      <p><strong>Rent Budget:</strong> ${formData.maxRent || '—'}</p>
      <p><strong>Credit Score:</strong> {formData.creditScore || '—'}</p>
      <div className="mt-4">
        <p className="text-sm">Profile Strength: <span className="font-medium">{strength}%</span></p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full" style={{ width: `${strength}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">Fill more fields to boost your chances!</p>
      </div>
    </div>
  );
});
SidebarPreview.displayName = 'SidebarPreview';

export default function CreateRentCard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user, login } = useAuthStore();
  const { step, setStep, formData, setFormData, updateField, reset } = useRentCardStore();
  const { setLoading } = useUIStore();
  const [showPasswordForm, setShowPasswordForm] = React.useState(false);

  const form = useForm<InsertRentCard>({
    resolver: zodResolver(insertRentCardSchema),
    defaultValues: formData
  });

  const passwordForm = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const stepFields = {
    1: ['firstName', 'lastName', 'email', 'phone', 'hasPets'],
    2: ['currentAddress', 'currentRent', 'hasRoommates'],
    3: ['currentEmployer', 'yearsEmployed', 'monthlyIncome', 'maxRent', 'moveInDate', 'creditScore']
  } as const;

  const createRentCardMutation = useMutation({
    mutationFn: async (data: InsertRentCard) => {
      setLoading(true);
      try {
        const response = await apiRequest('POST', '/api/tenant/rentcard', {
          ...data,
          userId: user?.id
        });
        if (!response.ok) throw new Error(MESSAGES.ERRORS.GENERAL);
        return response.json();
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: MESSAGES.TOAST.RENTCARD.CREATE_SUCCESS.TITLE,
        description: MESSAGES.TOAST.RENTCARD.CREATE_SUCCESS.DESCRIPTION,
      });
      reset();
      setLocation(ROUTES.TENANT.DASHBOARD);
    },
    onError: (error) => {
      toast({
        title: MESSAGES.ERRORS.GENERAL,
        description: error instanceof Error ? error.message : MESSAGES.ERRORS.GENERAL,
        variant: "destructive",
      });
    }
  });

  const handleNextStep = async () => {
    const fields = stepFields[step as keyof typeof stepFields];
    const result = await form.trigger(fields);
    if (result) {
      const formData = form.getValues();
      setFormData(formData);
      const milestoneMessages = {
        1: { title: "Profile Starter Earned!", desc: "You've kicked off your RentCard!" },
        2: { title: "Rental Historian Earned!", desc: "Your rental history is impressing landlords!" },
        3: { title: "Income Champ Earned!", desc: "You're ready to shine—RentCard complete!" }
      };
      toast({
        title: milestoneMessages[step as keyof typeof milestoneMessages].title,
        description: (
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-500" />
            {milestoneMessages[step as keyof typeof milestoneMessages].desc}
          </div>
        ),
      });
      setStep(step + 1);
    }
  };

  const onSubmit = async (data: InsertRentCard) => {
    if (step < 4) {
      await handleNextStep();
      return;
    }
    createRentCardMutation.mutate(data);
  };

  const PersonalInfoStep = useMemo(() => () => (
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

  const RentalHistoryStep = useMemo(() => () => (
    <div className="space-y-6">
      <div><Label htmlFor="currentAddress">Current Address</Label><Input id="currentAddress" placeholder="Enter your current address" {...form.register('currentAddress')} />{form.formState.errors.currentAddress && <p className="text-destructive text-sm mt-1">{form.formState.errors.currentAddress.message}</p>}</div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label htmlFor="currentRent">Current Monthly Rent</Label><Input id="currentRent" type="number" placeholder="Enter amount" {...form.register('currentRent')} />{form.formState.errors.currentRent && <p className="text-destructive text-sm mt-1">{form.formState.errors.currentRent.message}</p>}</div>
        <div className="flex items-center justify-between"><Label htmlFor="hasRoommates">Do you have roommates?</Label><Switch id="hasRoommates" checked={form.watch('hasRoommates')} onCheckedChange={(checked) => form.setValue('hasRoommates', checked)} />{form.formState.errors.hasRoommates && <p className="text-destructive text-sm mt-1">{form.formState.errors.hasRoommates.message}</p>}</div>
      </div>
    </div>
  ), [form]);

  const IncomeStep = useMemo(() => () => (
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
        const token = btoa(JSON.stringify({
          email: formData.email,
          password: passwordData.password,
          userType: 'tenant',
          phone: formData.phone
        }));
        await login(token);
        await createRentCardMutation.mutateAsync(formData);
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

  const StepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[User, Home, CreditCard, CheckCircle].map((Icon, index) => (
        <div key={index} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${step >= index + 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          <Icon className="w-5 h-5" />
        </div>
      ))}
    </div>
  );

  const ProgressBar = () => (
    <div className="mb-8">
      <div className="w-full bg-muted rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
      </div>
      <p className="text-center text-sm text-muted-foreground mt-2">{(step / 4) * 100}% Complete</p>
    </div>
  );

  const ValueProposition = () => {
    const messages = {
      1: "Landlords love complete profiles—start yours in minutes!",
      2: "Show landlords your rental track record instantly.",
      3: "Prove you're a top tenant with income and credit details.",
      4: "Landlords can pre-approve you faster with your RentCard!"
    };
    return (
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold mb-2">Create My Free RentCard</h1>
        <p className="text-muted-foreground">{messages[step as keyof typeof messages]}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="p-6">
        <Card className="max-w-5xl mx-auto">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-[2fr,1fr] gap-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <ProgressBar />
                <StepIndicator />
                <ValueProposition />
                {step === 1 && <PersonalInfoStep />}
                {step === 2 && <RentalHistoryStep />}
                {step === 3 && <IncomeStep />}
                {step === 4 && <CompletionStep />}
                <div className="flex justify-between mt-8">
                  {step > 1 && <Button type="button" variant="outline" onClick={() => setStep(step - 1)} disabled={createRentCardMutation.isPending}>Back</Button>}
                  {step < 4 ? (
                    <Button type="submit" className="ml-auto" disabled={createRentCardMutation.isPending}>
                      {createRentCardMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : <>Next <ArrowRight className="w-4 h-4 ml-2" /></>}
                    </Button>
                  ) : (
                    <Button type="submit" className="ml-auto" disabled={createRentCardMutation.isPending}>
                      {createRentCardMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : <>Complete <CheckCircle className="w-4 h-4 ml-2" /></>}
                    </Button>
                  )}
                </div>
              </form>
              {step < 4 && <SidebarPreview formData={formData} />}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}