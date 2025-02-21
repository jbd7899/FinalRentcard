import { useState } from 'react';
import { useLocation } from 'wouter';
import { User, Home, CreditCard, CheckCircle, ArrowRight, Building2, Loader2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Schema definition remains unchanged as it's properly defined
const createRentCardSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  hasPets: z.enum(["yes", "no"]),
  currentEmployer: z.string().min(1, "Current employer is required"),
  yearsEmployed: z.string().min(1, "Years employed is required"),
  monthlyIncome: z.string().min(1, "Monthly income is required"),
  currentAddress: z.string().min(1, "Current address is required"),
  currentRent: z.string().min(1, "Current rent is required"),
  moveInDate: z.string().min(1, "Move-in date is required"),
  maxRent: z.string().min(1, "Maximum rent is required"),
  hasRoommates: z.enum(["yes", "no"]),
  creditScore: z.string().min(1, "Credit score is required")
});

type CreateRentCardForm = z.infer<typeof createRentCardSchema>;

export default function CreateRentCard() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();

  const form = useForm<CreateRentCardForm>({
    resolver: zodResolver(createRentCardSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      hasPets: "no",
      currentEmployer: '',
      yearsEmployed: '',
      monthlyIncome: '',
      currentAddress: '',
      currentRent: '',
      moveInDate: '',
      maxRent: '',
      hasRoommates: "no",
      creditScore: ''
    }
  });

  // Step field mapping
  const stepFields = {
    1: ['firstName', 'lastName', 'email', 'phone', 'hasPets'],
    2: ['currentAddress', 'currentRent', 'hasRoommates'],
    3: ['currentEmployer', 'yearsEmployed', 'monthlyIncome', 'maxRent', 'moveInDate', 'creditScore']
  } as const;

  const handleNextStep = async (data: CreateRentCardForm) => {
    const fields = stepFields[step as keyof typeof stepFields];
    const result = await form.trigger(fields as Array<keyof CreateRentCardForm>, {
      shouldFocus: true,
    });

    if (result) {
      setStep(step + 1);
    }
  };

  const onSubmit = async (data: CreateRentCardForm) => {
    try {
      if (step < 4) {
        await handleNextStep(data);
      } else {
        setIsSubmitting(true);
        // Format data for API submission
        const formattedData = {
          ...data,
          monthlyIncome: Number(data.monthlyIncome),
          currentRent: Number(data.currentRent),
          maxRent: Number(data.maxRent),
          creditScore: Number(data.creditScore)
        };

        const response = await apiRequest('POST', '/api/tenant/rentcard', formattedData);
        if (response.ok) {
          toast({
            title: "Success!",
            description: "Your RentCard has been created successfully.",
          });
          setLocation('/tenant/dashboard');
        } else {
          throw new Error('Failed to create RentCard');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

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
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-center text-sm text-muted-foreground mt-2">{progress}% Complete</p>
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

  const PersonalInfoStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter first name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter last name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter email" type="email" {...field} />
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
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="Enter phone number" type="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="hasPets"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Do you have pets?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="pets-yes" />
                  <Label htmlFor="pets-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="pets-no" />
                  <Label htmlFor="pets-no">No</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const RentalHistoryStep = () => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="currentAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Current Address</FormLabel>
            <FormControl>
              <Input placeholder="Enter your current address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="currentRent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Monthly Rent</FormLabel>
              <FormControl>
                <Input placeholder="Enter amount" type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hasRoommates"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Do you have roommates?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="roommates-yes" />
                    <Label htmlFor="roommates-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="roommates-no" />
                    <Label htmlFor="roommates-no">No</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  const IncomeStep = () => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="currentEmployer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Current Employer</FormLabel>
            <FormControl>
              <Input placeholder="Enter employer name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="yearsEmployed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Years in Current Job</FormLabel>
              <FormControl>
                <Input placeholder="Enter years" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="monthlyIncome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Income</FormLabel>
              <FormControl>
                <Input placeholder="Enter amount" type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="maxRent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Rent Budget</FormLabel>
              <FormControl>
                <Input placeholder="Enter amount" type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="creditScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credit Score</FormLabel>
              <FormControl>
                <Input placeholder="Enter credit score" type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="moveInDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Desired Move-in Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const CompletionStep = () => (
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
          <Button className="w-full" variant="default">
            Share RentCard Now
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
          <Button className="w-full">
            Create Free Account
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
          <Form {...form}>
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
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                )}
                {step < 4 ? (
                  <Button
                    type="submit"
                    className="ml-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
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
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}