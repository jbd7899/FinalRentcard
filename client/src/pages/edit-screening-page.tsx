import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useParams } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  Save,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { MESSAGES, VALIDATION, ROUTES } from '@/constants';
import { convertNestedNumericValues } from '@/utils/form-utils';
import LandlordLayout from "@/components/layouts/LandlordLayout";

export default function EditScreeningPage() {
  const [location, setLocation] = useLocation();
  const params = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if we're editing a property or general screening page
  const slugMatch = location.match(/\/screening\/(property|general)\/([^\/]+)(\/edit)?/);
  const pageType = slugMatch?.[1] || 'general';
  const pageSlug = slugMatch?.[2] || '';
  
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
      slug: pageSlug,
    },
  });

  // Fetch the screening page data
  const { data: screeningPage } = useQuery({
    queryKey: ['/api/screening', pageSlug],
    queryFn: async () => {
      setIsLoading(true);
      try {
        const res = await apiRequest("GET", `/api/screening/${pageSlug}`);
        if (!res.ok) throw new Error("Failed to fetch screening page data");
        return res.json();
      } catch (error) {
        toast({
          title: "Error loading data",
          description: "Could not load the screening page information. Please try again.",
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    enabled: !!pageSlug
  });

  // Update form with fetched data
  useEffect(() => {
    if (screeningPage) {
      form.reset({
        ...screeningPage,
        screeningCriteria: {
          minCreditScore: screeningPage.screeningCriteria?.minCreditScore || VALIDATION.SCREENING.CREDIT_SCORE.MIN,
          minMonthlyIncome: screeningPage.screeningCriteria?.minMonthlyIncome || VALIDATION.SCREENING.MONTHLY_INCOME.MIN,
          noEvictions: screeningPage.screeningCriteria?.noEvictions ?? true,
          cleanRentalHistory: screeningPage.screeningCriteria?.cleanRentalHistory ?? true,
        }
      });
      setIsLoading(false);
    }
  }, [screeningPage, form]);

  // Update the screening page
  const updateScreeningPage = useMutation({
    mutationFn: async (data: InsertScreeningPage) => {
      // Process numeric fields in nested objects
      const processedData = convertNestedNumericValues(data, {
        screeningCriteria: ['minCreditScore', 'minMonthlyIncome']
      });
      
      const res = await apiRequest("PATCH", `/api/screening/${pageSlug}`, processedData);
      if (!res.ok) {
        throw new Error(MESSAGES.ERRORS.GENERAL);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/screening'] });
      toast({
        title: "Changes saved",
        description: "Your screening page has been updated successfully.",
      });
      
      // Redirect back to the screening management page
      setLocation(ROUTES.LANDLORD.SCREENING);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || MESSAGES.ERRORS.GENERAL,
        variant: "destructive",
      });
    },
  });

  const handleFormSubmit = (data: InsertScreeningPage) => {
    updateScreeningPage.mutate(data);
  };

  const pageContent = (
    <div className="max-w-3xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Screening Page</h1>
        <Button 
          variant="outline" 
          onClick={() => setLocation(ROUTES.LANDLORD.SCREENING)}
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Screening Pages
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="ml-2">Loading screening page data...</span>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8 bg-white p-6 rounded-lg shadow">
            <div className="space-y-6">
              <h2 className="text-lg font-semibold border-b pb-2">Business Information</h2>
              
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

            <div className="space-y-6">
              <h2 className="text-lg font-semibold border-b pb-2">Tenant Requirements</h2>
              
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

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={updateScreeningPage.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateScreeningPage.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );

  return (
    <LandlordLayout>
      {pageContent}
    </LandlordLayout>
  );
}