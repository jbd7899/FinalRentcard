import { useState } from 'react';
import { useLocation } from 'wouter';
import { User, Home, CreditCard, CheckCircle, ArrowRight, Building2, Loader2 } from 'lucide-react';
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
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";

// Schema for the registration form
const registrationSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function CreateRentCard() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { registerMutation, user } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const form = useForm<InsertRentCard>({
    resolver: zodResolver(insertRentCardSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      hasPets: false,
      currentEmployer: '',
      yearsEmployed: '',
      monthlyIncome: '',
      currentAddress: '',
      currentRent: '',
      moveInDate: '',
      maxRent: '',
      hasRoommates: false,
      creditScore: ''
    }
  });

  const passwordForm = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  // Step field mapping
  const stepFields = {
    1: ['firstName', 'lastName', 'email', 'phone', 'hasPets'],
    2: ['currentAddress', 'currentRent', 'hasRoommates'],
    3: ['currentEmployer', 'yearsEmployed', 'monthlyIncome', 'maxRent', 'moveInDate', 'creditScore']
  } as const;

  const createRentCardMutation = useMutation({
    mutationFn: async (data: InsertRentCard) => {
      const response = await apiRequest('POST', '/api/tenant/rentcard', {
        ...data,
        userId: user?.id
      });
      if (!response.ok) {
        throw new Error('Failed to create RentCard');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your RentCard has been created successfully.",
      });
      setLocation('/tenant/dashboard');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  const handleNextStep = async () => {
    const fields = stepFields[step as keyof typeof stepFields];
    const result = await form.trigger(fields);

    if (result) {
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

  const PersonalInfoStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="Enter first name"
            {...form.register('firstName')}
          />
          {form.formState.errors.firstName && (
            <p className="text-destructive text-sm mt-1">{form.formState.errors.firstName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Enter last name"
            {...form.register('lastName')}
          />
          {form.formState.errors.lastName && (
            <p className="text-destructive text-sm mt-1">{form.formState.errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email"
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-destructive text-sm mt-1">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter phone number"
            {...form.register('phone')}
          />
          {form.formState.errors.phone && (
            <p className="text-destructive text-sm mt-1">{form.formState.errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="hasPets">Do you have pets?</Label>
        <Switch
          id="hasPets"
          checked={form.watch('hasPets')}
          onCheckedChange={(checked) => form.setValue('hasPets', checked)}
        />
        {form.formState.errors.hasPets && (
          <p className="text-destructive text-sm mt-1">{form.formState.errors.hasPets.message}</p>
        )}
      </div>
    </div>
  );

  const RentalHistoryStep = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="currentAddress">Current Address</Label>
        <Input
          id="currentAddress"
          placeholder="Enter your current address"
          {...form.register('currentAddress')}
        />
        {form.formState.errors.currentAddress && (
          <p className="text-destructive text-sm mt-1">{form.formState.errors.currentAddress.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="currentRent">Current Monthly Rent</Label>
          <Input
            id="currentRent"
            type="number"
            placeholder="Enter amount"
            {...form.register('currentRent')}
          />
          {form.formState.errors.currentRent && (
            <p className="text-destructive text-sm mt-1">{form.formState.errors.currentRent.message}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="hasRoommates">Do you have roommates?</Label>
          <Switch
            id="hasRoommates"
            checked={form.watch('hasRoommates')}
            onCheckedChange={(checked) => form.setValue('hasRoommates', checked)}
          />
          {form.formState.errors.hasRoommates && (
            <p className="text-destructive text-sm mt-1">{form.formState.errors.hasRoommates.message}</p>
          )}
        </div>
      </div>
    </div>
  );

  const IncomeStep = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="currentEmployer">Current Employer</Label>
        <Input
          id="currentEmployer"
          placeholder="Enter employer name"
          {...form.register('currentEmployer')}
        />
        {form.formState.errors.currentEmployer && (
          <p className="text-destructive text-sm mt-1">{form.formState.errors.currentEmployer.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="yearsEmployed">Years in Current Job</Label>
          <Input
            id="yearsEmployed"
            placeholder="Enter years"
            {...form.register('yearsEmployed')}
          />
          {form.formState.errors.yearsEmployed && (
            <p className="text-destructive text-sm mt-1">{form.formState.errors.yearsEmployed.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="monthlyIncome">Monthly Income</Label>
          <Input
            id="monthlyIncome"
            type="number"
            placeholder="Enter amount"
            {...form.register('monthlyIncome')}
          />
          {form.formState.errors.monthlyIncome && (
            <p className="text-destructive text-sm mt-1">{form.formState.errors.monthlyIncome.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="maxRent">Maximum Rent Budget</Label>
          <Input
            id="maxRent"
            type="number"
            placeholder="Enter amount"
            {...form.register('maxRent')}
          />
          {form.formState.errors.maxRent && (
            <p className="text-destructive text-sm mt-1">{form.formState.errors.maxRent.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="creditScore">Credit Score</Label>
          <Input
            id="creditScore"
            type="number"
            placeholder="Enter credit score"
            {...form.register('creditScore')}
          />
          {form.formState.errors.creditScore && (
            <p className="text-destructive text-sm mt-1">{form.formState.errors.creditScore.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="moveInDate">Desired Move-in Date</Label>
        <Input
          id="moveInDate"
          type="date"
          {...form.register('moveInDate')}
        />
        {form.formState.errors.moveInDate && (
          <p className="text-destructive text-sm mt-1">{form.formState.errors.moveInDate.message}</p>
        )}
      </div>
    </div>
  );

  const CompletionStep = () => {
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);
    const formData = form.getValues();

    const handleCreateAccount = async () => {
      setShowPasswordForm(true);
    };

    const handlePasswordSubmit = async (passwordData: RegistrationForm) => {
      setIsCreatingAccount(true);
      try {
        // Register the user with the provided password
        await registerMutation.mutateAsync({
          email: formData.email,
          password: passwordData.password,
          userType: 'tenant',
          phone: formData.phone
        });

        // After successful registration, create RentCard
        await createRentCardMutation.mutateAsync(formData);
      } catch (error) {
        console.error('Account creation error:', error);
        toast({
          title: "Error",
          description: "Failed to create account. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsCreatingAccount(false);
        setShowPasswordForm(false);
      }
    };

    if (showPasswordForm) {
      return (
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Create Your Account</h2>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...passwordForm.register('password')}
              />
              {passwordForm.formState.errors.password && (
                <p className="text-destructive text-sm mt-1">
                  {passwordForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...passwordForm.register('confirmPassword')}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-destructive text-sm mt-1">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <div className="flex gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordForm(false)}
                disabled={isCreatingAccount}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isCreatingAccount}
              >
                {isCreatingAccount ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
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
        <p className="text-muted-foreground mb-8">
          You're now ready to streamline your rental search. Your RentCard contains all the
          information landlords need to fast-track your application.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-medium mb-4">Share Now</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start using your RentCard immediately without creating an account. Perfect for one-time use.
            </p>
            <Button
              className="w-full"
              variant="default"
              onClick={() => createRentCardMutation.mutate(formData)}
              disabled={createRentCardMutation.isPending}
            >
              {createRentCardMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sharing...
                </>
              ) : (
                'Share RentCard Now'
              )}
            </Button>
          </div>

          <div className="bg-primary/5 p-6 rounded-lg border">
            <div className="bg-primary/10 text-primary text-sm px-2 py-1 rounded-full w-fit mb-2">
              Recommended
            </div>
            <h3 className="font-medium mb-4">Create Free Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Save your RentCard and access premium features to make your rental search even easier.
            </p>
            <Button
              className="w-full"
              onClick={handleCreateAccount}
              disabled={isCreatingAccount || registerMutation.isPending}
            >
              {isCreatingAccount || registerMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Free Account'
              )}
            </Button>
          </div>
        </div>

        <div className="bg-muted p-6 rounded-lg">
          <h3 className="font-medium mb-4">How to Use Your RentCard</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-primary font-medium mb-2">1</p>
              <p className="text-sm text-muted-foreground">Share your RentCard link with landlords via email or text</p>
            </div>
            <div>
              <p className="text-primary font-medium mb-2">2</p>
              <p className="text-sm text-muted-foreground">Landlords review your complete rental profile instantly</p>
            </div>
            <div>
              <p className="text-primary font-medium mb-2">3</p>
              <p className="text-sm text-muted-foreground">Get pre-approved faster and secure your dream rental</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[User, Home, CreditCard, CheckCircle].map((Icon, index) => (
        <div key={index} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
          step >= index + 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
      ))}
    </div>
  );

  const ProgressBar = () => (
    <div className="mb-8">
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>
      <p className="text-center text-sm text-muted-foreground mt-2">{(step / 4) * 100}% Complete</p>
    </div>
  );

  const ValueProposition = () => {
    const messages = {
      1: "Start your rental journey in minutes. No account needed!",
      2: "Help landlords understand your rental history and reliability.",
      3: "Show landlords you're a qualified tenant with verified income details.",
      4: "Your RentCard is ready to help you secure your next home!"
    };

    return (
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold mb-2">Create My Free RentCard</h1>
        <p className="text-muted-foreground">{messages[step as keyof typeof messages]}</p>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-background p-6">
      <header className="flex items-center justify-between max-w-3xl mx-auto mb-8">
        <div className="flex items-center">
          <Building2 className="w-8 h-8 text-primary mr-2" />
          <span className="text-xl font-semibold">MyRentCard</span>
        </div>
      </header>

      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <ProgressBar />
            <StepIndicator />
            <ValueProposition />

            {step === 1 && <PersonalInfoStep />}
            {step === 2 && <RentalHistoryStep />}
            {step === 3 && <IncomeStep />}
            {step === 4 && <CompletionStep />}

            <div className="flex justify-between mt-8">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={createRentCardMutation.isPending}
                >
                  Back
                </Button>
              )}
              {step < 4 ? (
                <Button
                  type="submit"
                  className="ml-auto"
                  disabled={createRentCardMutation.isPending}
                >
                  {createRentCardMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="ml-auto"
                  disabled={createRentCardMutation.isPending}
                >
                  {createRentCardMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Complete
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}