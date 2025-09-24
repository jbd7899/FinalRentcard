import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { 
  Building2,
  ArrowRight, 
  CheckCircle, 
  Sparkles, 
  Star, 
  ShoppingBag,
  QrCode,
  Link as LinkIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/uiStore';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Complete form schema for all property data
const propertySchema = z.object({
  // Contact information
  email: z.string().email("Please enter a valid email address"),
  
  // Property details
  address: z.string().min(5, "Property address is required"),
  rent: z.number().min(100, "Rent must be at least $100"),
  bedrooms: z.number().min(0, "Bedrooms must be 0 or more"),
  bathrooms: z.number().min(0.5, "Bathrooms must be 0.5 or more"),
  propertyType: z.string().min(1, "Property type is required"),
  description: z.string().optional(),
  availableFrom: z.string().optional(),
  
  // Share & promote settings
  enablePublicLink: z.boolean().default(true),
  enableQRCode: z.boolean().default(true),
  customMessage: z.string().optional(),
  
  // Interest collection preferences
  enableGeneralScreening: z.boolean().default(true),
  requireRentCard: z.boolean().default(false),
  
  // Account preferences
  saveAccount: z.boolean().default(true),
  agreeToTerms: z.boolean().refine(val => val, "You must agree to the terms of service")
});

type PropertyForm = z.infer<typeof propertySchema>;

// Property type options
const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "condo", label: "Condo/Townhome" },
  { value: "studio", label: "Studio" },
  { value: "room", label: "Room/Shared" },
  { value: "other", label: "Other" }
];

const LandlordQuickStart = () => {
  const { user, isLoading: userLoading } = useAuth();
  const { addToast } = useUIStore();
  const [, setLocation] = useLocation();
  const [showCelebration, setShowCelebration] = useState(false);
  const [isExpressSignupMode, setIsExpressSignupMode] = useState(false);

  // Single form for all property data
  const form = useForm<PropertyForm>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      email: user?.email || '',
      address: '',
      rent: 1500,
      bedrooms: 2,
      bathrooms: 1,
      propertyType: '',
      description: '',
      availableFrom: '',
      enablePublicLink: true,
      enableQRCode: true,
      customMessage: '',
      enableGeneralScreening: true,
      requireRentCard: false,
      saveAccount: !user, // Default to true if not logged in
      agreeToTerms: false
    }
  });

  // Watch form values for live preview
  const watchedValues = form.watch();

  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (data: PropertyForm) => {
      const response = await apiRequest('POST', '/api/landlord/property/quickstart', {
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['landlord-properties'] });
      addToast({
        title: "🏠 Property Listed!",
        description: "Your property is ready to share with tenants",
        type: "success"
      });
      setShowCelebration(true);
      setTimeout(() => {
        setLocation(ROUTES.LANDLORD.DASHBOARD + '?welcome=true');
      }, 2000);
    }
  });

  // Handle express signup
  const handleExpressSignup = () => {
    localStorage.setItem('selectedRole', 'landlord');
    window.location.href = '/api/login';
  };

  // Auto-populate fields when user logs in
  useEffect(() => {
    if (user && !isExpressSignupMode) {
      form.setValue('email', user.email || '');
      setIsExpressSignupMode(true);
    }
  }, [user, form, isExpressSignupMode]);

  // Handle form submission
  const onSubmit = async (data: PropertyForm) => {
    console.log('Submitting property data:', data);
    
    if (!user && data.saveAccount) {
      // Redirect to auth with form data stored
      localStorage.setItem('quickstartData', JSON.stringify(data));
      localStorage.setItem('selectedRole', 'landlord');
      window.location.href = '/api/login';
      return;
    }
    
    createPropertyMutation.mutate(data);
  };

  // Generate mock property URL for preview
  const getPropertyPreviewUrl = () => {
    if (watchedValues.address) {
      const slug = watchedValues.address.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return `${window.location.origin}/property/${slug}`;
    }
    return `${window.location.origin}/property/your-property`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {showCelebration && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>Property listed successfully!</span>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            List your property
          </h1>
          <p className="text-slate-600">
            Create your rental listing and start collecting tenant interest
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Form */}
            <div className="space-y-8">
              {/* Express Signup Section */}
              {!user && (
                <div className="space-y-4">
                  <div className="text-sm text-slate-600 text-center">Express signup</div>
                  <Button
                    type="button"
                    onClick={handleExpressSignup}
                    className="w-full h-14 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-3"
                    data-testid="express-signup-button"
                  >
                    <Sparkles className="w-5 h-5" />
                    Express Sign Up
                  </Button>
                  <div className="relative">
                    <Separator />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-50 px-3 text-sm text-slate-500">
                      OR
                    </div>
                  </div>
                </div>
              )}

              {user && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Signed in as {user.email}</p>
                      <p className="text-sm text-green-700">Your property will be saved automatically</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your.email@example.com" 
                          {...field} 
                          disabled={!!user}
                          data-testid="input-email" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!user && (
                  <div className="flex items-center gap-2 text-sm">
                    <Checkbox 
                      id="newsletter" 
                      checked={form.watch('saveAccount')}
                      onCheckedChange={(checked) => form.setValue('saveAccount', !!checked)}
                    />
                    <label htmlFor="newsletter" className="text-slate-600">
                      Save my information to create an account
                    </label>
                  </div>
                )}
              </div>

              {/* Property Details Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Property details</h2>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123 Main Street, Austin, TX 78701" 
                          {...field} 
                          data-testid="input-address" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly rent ($)</FormLabel>
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
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-property-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PROPERTY_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bedrooms</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
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
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bathrooms</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.5"
                            min="0.5"
                            placeholder="1" 
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value) || 0.5)}
                            data-testid="input-bathrooms"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your property's best features, amenities, and neighborhood highlights..."
                          rows={3}
                          {...field} 
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Share & Promote Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Share & promote</h2>
                <p className="text-sm text-slate-600">
                  Generate tools to share your property with potential tenants
                </p>
                
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="enablePublicLink"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-enable-public-link"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            Create public listing link
                          </FormLabel>
                          <p className="text-xs text-slate-500">
                            Generate a shareable URL for your property
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="enableQRCode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-enable-qr-code"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            Generate QR code
                          </FormLabel>
                          <p className="text-xs text-slate-500">
                            Create QR code for signs and marketing materials
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Interest Collection Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Interest collection</h2>
                <p className="text-sm text-slate-600">
                  Set preferences for how tenants can express interest
                </p>
                
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="enableGeneralScreening"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-enable-general-screening"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            Enable general screening
                          </FormLabel>
                          <p className="text-xs text-slate-500">
                            Allow tenants to submit basic qualification information
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="requireRentCard"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-require-rentcard"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            Require RentCard for applications
                          </FormLabel>
                          <p className="text-xs text-slate-500">
                            Only accept applications from tenants with completed RentCards
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-agree-terms"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          I agree to the{' '}
                          <a href="/terms" className="text-blue-600 hover:underline">
                            Terms of Service
                          </a>{' '}
                          and{' '}
                          <a href="/privacy" className="text-blue-600 hover:underline">
                            Privacy Policy
                          </a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={createPropertyMutation.isPending}
                className="w-full h-14 text-base font-semibold bg-blue-600 hover:bg-blue-700"
                data-testid="button-create-property"
              >
                {createPropertyMutation.isPending ? (
                  "Creating property..."
                ) : user ? (
                  <>
                    List my property
                    <ShoppingBag className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    Create account & list property
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Right Column - Live Preview */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Property Preview
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    This is how tenants will see your listing
                  </p>
                </div>
                <div className="p-6">
                  {/* Property Preview Card */}
                  <div className="space-y-4">
                    {/* Property Image Placeholder */}
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-slate-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-slate-400" />
                    </div>
                    
                    {/* Property Details */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-slate-900">
                          {watchedValues.address || "Your Property Address"}
                        </h4>
                        <p className="text-2xl font-bold text-green-600">
                          ${watchedValues.rent?.toLocaleString() || "1,500"}/month
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>{watchedValues.bedrooms || 2} bed</span>
                        <span>•</span>
                        <span>{watchedValues.bathrooms || 1} bath</span>
                        <span>•</span>
                        <span className="capitalize">
                          {PROPERTY_TYPES.find(t => t.value === watchedValues.propertyType)?.label || "Property Type"}
                        </span>
                      </div>
                      
                      {watchedValues.description && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {watchedValues.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Share Tools Preview */}
                    {(watchedValues.enablePublicLink || watchedValues.enableQRCode) && (
                      <div className="border-t pt-4 space-y-3">
                        <h5 className="font-medium text-slate-900">Share tools</h5>
                        
                        {watchedValues.enablePublicLink && (
                          <div className="flex items-center gap-2 text-sm">
                            <LinkIcon className="w-4 h-4 text-blue-600" />
                            <span className="text-slate-600">Public listing link</span>
                          </div>
                        )}
                        
                        {watchedValues.enableQRCode && (
                          <div className="flex items-center gap-2 text-sm">
                            <QrCode className="w-4 h-4 text-blue-600" />
                            <span className="text-slate-600">QR code for marketing</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Interest Collection Preview */}
                    <div className="border-t pt-4 space-y-2">
                      <h5 className="font-medium text-slate-900">Interest collection</h5>
                      <div className="space-y-1 text-sm text-slate-600">
                        {watchedValues.enableGeneralScreening && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span>General screening enabled</span>
                          </div>
                        )}
                        {watchedValues.requireRentCard && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-blue-600" />
                            <span>RentCard required</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default LandlordQuickStart;