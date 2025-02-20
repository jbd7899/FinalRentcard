import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertScreeningPageSchema, type InsertScreeningPage } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
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

export default function ScreeningPage() {
  const [step, setStep] = useState(1);
  const [screeningPageUrl, setScreeningPageUrl] = useState<string>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const form = useForm<InsertScreeningPage>({
    resolver: zodResolver(insertScreeningPageSchema),
    defaultValues: {
      businessName: "",
      contactName: "",
      businessEmail: "",
      screeningCriteria: {
        minCreditScore: 650,
        minMonthlyIncome: 3000,
        noEvictions: true,
        cleanRentalHistory: true,
      },
    },
  });

  const createScreeningPage = useMutation({
    mutationFn: async (data: InsertScreeningPage) => {
      const res = await apiRequest("POST", "/api/screening", data);
      return res.json();
    },
    onSuccess: (data) => {
      setStep(3);
      setScreeningPageUrl(data.url);
      queryClient.invalidateQueries({ queryKey: ["/api/screening"] });
      toast({
        title: "Success!",
        description: "Your screening page has been created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (step === 2) {
      createScreeningPage.mutate(data);
    } else {
      setStep(step + 1);
    }
  });

  const StepIndicator = () => (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${(step / 3) * 100}%` }}
      />
    </div>
  );

  const Step1 = () => (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Business Information</h2>
        <p className="text-gray-600">Set up your general screening page to start receiving qualified applicants</p>
      </div>

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

  const Step2 = () => (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Tenant Requirements</h2>
        <p className="text-gray-600">Set your screening criteria to automatically filter applicants</p>
      </div>

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
                onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                onChange={(e) => field.onChange(parseInt(e.target.value))}
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

  const Step3 = () => (
    <div className="text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-green-500" />
      </div>

      <h2 className="text-2xl font-semibold mb-4">Pre-Screening Page Created!</h2>
      <p className="text-gray-600 mb-8">
        Your screening page is ready to receive applications
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
                  description: "URL copied to clipboard",
                });
              }
            }}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!user && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mb-8">
          <div className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full w-fit mx-auto mb-2">
            Recommended Next Step
          </div>
          <h3 className="font-medium mb-2">Create a Free Account</h3>
          <p className="text-sm text-gray-600 mb-4">
            Sign up to access additional features and manage your screening page more effectively.
          </p>
          <div className="text-left space-y-2 mb-6">
            {[
              "Track and manage applicant responses",
              "Create multiple screening pages",
              "Customize screening criteria",
              "Access detailed analytics",
            ].map((text, i) => (
              <div key={i} className="flex items-center">
                <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                <span>{text}</span>
              </div>
            ))}
          </div>
          <Button className="w-full" onClick={() => setLocation("/auth")}>
            Create Account
          </Button>
          <p className="text-xs text-center text-gray-500 mt-3">
            No credit card required
          </p>
        </div>
      )}
    </div>
  );

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
              description: "Receive complete applications instantly. No more phone tag or incomplete forms.",
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
          <form onSubmit={onSubmit} className="bg-white rounded-lg shadow p-8">
            <StepIndicator />

            {step === 1 && <Step1 />}
            {step === 2 && <Step2 />}
            {step === 3 && <Step3 />}

            <div className="flex justify-between mt-8">
              {step > 1 && step < 3 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </Button>
              )}
              {step < 3 && (
                <Button
                  type="submit"
                  className={step === 1 ? "ml-auto" : ""}
                >
                  {step === 2 ? "Create Screening Page" : "Next"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}