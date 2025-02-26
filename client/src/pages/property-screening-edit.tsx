import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useParams } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertScreeningPageSchema, type InsertScreeningPage } from "@shared/schema";
import { useAuthStore } from '@/stores/authStore';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Image as ImageIcon,
  Calendar,
  Save,
  Loader2,
  ArrowLeft,
  Info,
  Home,
  DollarSign,
  Bed,
  Bath
} from "lucide-react";
import { MESSAGES, VALIDATION, ROUTES } from '@/constants';
import { convertNestedNumericValues } from '@/utils/form-utils';
import LandlordLayout from "@/components/layouts/LandlordLayout";
import PropertyScreeningImageUpload from "@/components/shared/PropertyScreeningImageUpload";
import { format, parseISO } from "date-fns";

export default function PropertyScreeningEdit() {
  const [location, setLocation] = useLocation();
  const params = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("business-info");
  
  // Extract slug from the URL
  const slug = params.slug || '';
  
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
      propertyDetails: {
        address: "",
        unit: "",
        bedrooms: 1,
        bathrooms: 1,
        squareFeet: 0,
        rentAmount: 0,
        availableDate: new Date().toISOString().split('T')[0],
        description: "",
        amenities: [],
        petPolicy: "no-pets",
        parkingInfo: "",
        images: []
      },
      slug,
    },
  });

  // Fetch the screening page data
  const { data: screeningPage } = useQuery({
    queryKey: ['/api/screening/property', slug],
    queryFn: async () => {
      setIsLoading(true);
      try {
        const res = await apiRequest("GET", `/api/properties/screening/${slug}`);
        if (!res.ok) throw new Error("Failed to fetch property screening page data");
        return res.json();
      } catch (error) {
        console.error("Error fetching screening page:", error);
        toast({
          title: "Error loading data",
          description: "Could not load the property screening information. Please try again.",
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    enabled: !!slug
  });

  // Update form with fetched data
  useEffect(() => {
    if (screeningPage) {
      const formattedDate = screeningPage.propertyDetails?.availableDate 
        ? screeningPage.propertyDetails.availableDate 
        : new Date().toISOString().split('T')[0];

      form.reset({
        ...screeningPage,
        screeningCriteria: {
          minCreditScore: screeningPage.screeningCriteria?.minCreditScore || VALIDATION.SCREENING.CREDIT_SCORE.MIN,
          minMonthlyIncome: screeningPage.screeningCriteria?.minMonthlyIncome || VALIDATION.SCREENING.MONTHLY_INCOME.MIN,
          noEvictions: screeningPage.screeningCriteria?.noEvictions ?? true,
          cleanRentalHistory: screeningPage.screeningCriteria?.cleanRentalHistory ?? true,
        },
        propertyDetails: {
          address: screeningPage.propertyDetails?.address || "",
          unit: screeningPage.propertyDetails?.unit || "",
          bedrooms: screeningPage.propertyDetails?.bedrooms || 1,
          bathrooms: screeningPage.propertyDetails?.bathrooms || 1,
          squareFeet: screeningPage.propertyDetails?.squareFeet || 0,
          rentAmount: screeningPage.propertyDetails?.rentAmount || 0,
          availableDate: formattedDate,
          description: screeningPage.propertyDetails?.description || "",
          amenities: screeningPage.propertyDetails?.amenities || [],
          petPolicy: screeningPage.propertyDetails?.petPolicy || "no-pets",
          parkingInfo: screeningPage.propertyDetails?.parkingInfo || "",
          images: screeningPage.propertyDetails?.images || []
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
        screeningCriteria: ['minCreditScore', 'minMonthlyIncome'],
        propertyDetails: ['bedrooms', 'bathrooms', 'squareFeet', 'rentAmount']
      });
      
      const res = await apiRequest("PATCH", `/api/properties/screening/${slug}`, processedData);
      if (!res.ok) {
        throw new Error(MESSAGES.ERRORS.GENERAL);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/screening/property', slug] });
      queryClient.invalidateQueries({ queryKey: ['/api/properties/screening', slug] });
      toast({
        title: "Changes saved",
        description: "Your property screening page has been updated successfully.",
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

  const handleImagesChange = (images: any[]) => {
    form.setValue('propertyDetails.images', images);
  };

  return (
    <LandlordLayout>
      <div className="max-w-4xl mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Edit Property Screening Page</h1>
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
            <span className="ml-2">Loading property data...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 w-full mb-6">
                  <TabsTrigger value="business-info" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Business Info</span>
                    <span className="sm:hidden">Business</span>
                  </TabsTrigger>
                  <TabsTrigger value="property-details" className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    <span className="hidden sm:inline">Property Details</span>
                    <span className="sm:hidden">Property</span>
                  </TabsTrigger>
                  <TabsTrigger value="images" className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>Images</span>
                  </TabsTrigger>
                </TabsList>

                {/* Business Information Tab */}
                <TabsContent value="business-info" className="bg-white p-6 rounded-lg shadow space-y-6">
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
                        <FormDescription>
                          Shown to potential tenants on the screening page
                        </FormDescription>
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

                  <div className="space-y-6 pt-4">
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
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              value={field.value?.toString() || ''}
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
                          <FormLabel>Minimum Monthly Income ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g., 3000" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              value={field.value?.toString() || ''}
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
                </TabsContent>

                {/* Property Details Tab */}
                <TabsContent value="property-details" className="bg-white p-6 rounded-lg shadow space-y-6">
                  <h2 className="text-lg font-semibold border-b pb-2">Property Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="propertyDetails.address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter property address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="propertyDetails.unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit # (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Apt 301" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="propertyDetails.bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Bed className="w-4 h-4 mr-2 text-gray-400" />
                              <Input 
                                type="number" 
                                min={0}
                                step={1}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                value={field.value?.toString() || ''}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="propertyDetails.bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Bath className="w-4 h-4 mr-2 text-gray-400" />
                              <Input 
                                type="number" 
                                min={0}
                                step={0.5}
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                value={field.value?.toString() || ''}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="propertyDetails.squareFeet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Square Feet</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={0}
                              placeholder="e.g., 1200"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              value={field.value?.toString() || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="propertyDetails.rentAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Rent</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                              <Input 
                                type="number"
                                min={0}
                                placeholder="e.g., 1500"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                value={field.value?.toString() || ''}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="propertyDetails.availableDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Available From</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              <Input 
                                type="date"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Next vacancy date
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="propertyDetails.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the property, highlight key features..." 
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="propertyDetails.petPolicy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pet Policy</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a pet policy" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="no-pets">No Pets Allowed</SelectItem>
                              <SelectItem value="cats-only">Cats Only</SelectItem>
                              <SelectItem value="small-dogs">Small Dogs Only</SelectItem>
                              <SelectItem value="cats-dogs">Cats and Dogs</SelectItem>
                              <SelectItem value="case-by-case">Case by Case Basis</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="propertyDetails.parkingInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parking Information</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 1 assigned space, street parking..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Images Tab */}
                <TabsContent value="images" className="bg-white p-6 rounded-lg shadow space-y-6">
                  <h2 className="text-lg font-semibold border-b pb-2">Property Images</h2>
                  
                  <div className="py-2">
                    <div className="flex items-start gap-2 mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                      <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-700">
                        Upload high-quality images of your property to attract potential tenants. 
                        The image marked as "Primary" will be the main image displayed on the screening page.
                      </p>
                    </div>
                    
                    <PropertyScreeningImageUpload 
                      images={form.watch('propertyDetails.images') || []} 
                      onChange={handleImagesChange}
                      maxImages={10}
                    />
                  </div>
                </TabsContent>
              </Tabs>

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
    </LandlordLayout>
  );
}