import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertScreeningPageSchema, type InsertScreeningPage } from "@shared/schema";
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Building2,
  Clock,
  Shield,
  BarChart,
  CheckCircle,
  ArrowRight,
  Copy,
} from "lucide-react";
import { MESSAGES, VALIDATION, ROUTES } from '@/constants';
import { MultiStepForm, StepConfig } from '@/components/ui/multi-step-form';
import { convertNestedNumericValues } from '@/utils/form-utils';

export default function ScreeningPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { screening: { currentStep, screeningPageUrl, setScreeningStep, setScreeningUrl } } = useUIStore();
  const { toast } = useToast();

  const form = useForm<InsertScreeningPage>({
    resolver: zodResolver(insertScreeningPageSchema),
    defaultValues: {
      businessName: "",
      contactName: "",
      businessEmail: "",
      screeningCriteria: {
        minCreditScore: VALIDATION.SCREENING.CREDIT_SCORE.MIN,
        minMonthlyIncome: VALIDATION.SCREENING.MONTHLY_INCOME.MIN,
        noEvictions: true,
        cleanRentalHistory: true,
      },
    },
  });

  const createScreeningPage = useMutation({
    mutationFn: async (data: InsertScreeningPage) => {
      // Process numeric fields in nested objects
      const processedData = convertNestedNumericValues(data, {
        screeningCriteria: ['minCreditScore', 'minMonthlyIncome']
      });
      
      const res = await apiRequest("POST", "/api/screening", processedData);
      if (!res.ok) {
        throw new Error(MESSAGES.ERRORS.GENERAL);
      }
      return res.json();
    },
    onSuccess: (data) => {
      setScreeningStep(3);
      setScreeningUrl(data.url);
      queryClient.invalidateQueries({ queryKey: ["/api/screening"] });
      toast({
        title: MESSAGES.TOAST.PROPERTY.CREATE_SUCCESS.TITLE,
        description: MESSAGES.TOAST.PROPERTY.CREATE_SUCCESS.DESCRIPTION,
      });
    },
    onError: (error: Error) => {
      toast({
        title: MESSAGES.ERRORS.GENERAL,
        description: error.message || MESSAGES.ERRORS.GENERAL,
        variant: "destructive",
      });
    },
  });

  const handleStepChange = (step: number) => {
    setScreeningStep(step);
  };

  const handleFormSubmit = (data: InsertScreeningPage) => {
    if (currentStep === 3) return; // Already on success step
    
    if (currentStep === 2) {
      createScreeningPage.mutate(data);
    }
  };

  const BusinessInfoStep = (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="businessName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business/Property Management Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter business name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="contactName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="businessEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="Enter email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const ScreeningCriteriaStep = (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="screeningCriteria.minCreditScore"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Minimum Credit Score</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="e.g., 650" 
                {...field}
                onChange={(e) => field.onChange(e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="screeningCriteria.minMonthlyIncome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Minimum Monthly Income</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="e.g., 3000" 
                {...field}
                onChange={(e) => field.onChange(e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="screeningCriteria.noEvictions"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>No prior evictions</FormLabel>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="screeningCriteria.cleanRentalHistory"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Clean rental payment history</FormLabel>
            </div>
          </FormItem>
        )}
      />
    </div>
  );

  const SuccessStep = (
    <div className="text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-green-500" />
      </div>

      <h2 className="text-2xl font-semibold mb-4">Pre-Screening Page Created!</h2>
      <p className="text-gray-600 mb-8">
        Your screening page is ready to receive prequalification submissions
      </p>

      <div className="bg-gray-50 p-4 rounded-lg mb-8">
        <div className="flex items-center justify-between bg-white p-2 rounded border">
          <span className="text-gray-600 truncate">{screeningPageUrl || 'Loading...'}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-blue-50"
            onClick={() => {
              if (screeningPageUrl) {
                navigator.clipboard.writeText(screeningPageUrl);
                toast({
                  description: MESSAGES.SUCCESS.COPIED,
                });
              }
            }}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Button
        onClick={() => setLocation(ROUTES.LANDLORD.DASHBOARD)}
        className="w-full"
      >
        Go to Dashboard
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  // Define step configurations for the multi-step form
  const formSteps: StepConfig[] = [
    {
      fields: ['businessName', 'contactName', 'businessEmail'],
      component: BusinessInfoStep,
      title: "Business Information",
      description: "Set up your general screening page to start receiving qualified applicants"
    },
    {
      fields: ['screeningCriteria.minCreditScore', 'screeningCriteria.minMonthlyIncome'],
      component: ScreeningCriteriaStep,
      title: "Tenant Requirements",
      description: "Set your screening criteria to automatically filter applicants"
    },
    {
      fields: [],
      component: SuccessStep
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex items-center justify-between max-w-3xl mx-auto mb-8">
        <div className="flex items-center">
          <Building2 className="w-8 h-8 text-blue-600 mr-2" />
          <span className="text-xl font-semibold">MyRentCard</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            {
              icon: Clock,
              title: "Save Time",
              description: "Receive complete RentCards instantly. No more phone tag or incomplete forms.",
            },
            {
              icon: Shield,
              title: "Pre-Qualified Leads",
              description: "Only meet with tenants who meet your requirements. Track all inquiries easily.",
            },
            {
              icon: BarChart,
              title: "Track Performance",
              description: "Monitor views, conversion rates, and where your best leads come from.",
            },
          ].map(({ icon: Icon, title, description }, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <Icon className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-medium mb-2">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          ))}
        </div>

        <Form {...form}>
          <div className="bg-white rounded-lg shadow p-8">
            <MultiStepForm
              steps={formSteps}
              form={form}
              onStepChange={handleStepChange}
              onSubmit={handleFormSubmit}
              isSubmitting={createScreeningPage.isPending}
              submitButtonText="Create Screening Page"
            />
          </div>
        </Form>
      </div>
    </div>
  );
}