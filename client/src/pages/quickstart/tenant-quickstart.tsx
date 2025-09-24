import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { 
  User, 
  ArrowRight, 
  CheckCircle, 
  Sparkles, 
  Star, 
  ShoppingBag,
  Plus,
  Trash2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { US_STATES } from '@/constants/states';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/uiStore';
import { apiRequest, queryClient } from '@/lib/queryClient';
import LiveRentCardPreview from '@/components/LiveRentCardPreview';

// Complete form schema for all RentCard data
const rentCardSchema = z.object({
  // Contact information
  email: z.string().email("Please enter a valid email address"),
  
  // Personal details
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  
  // Location preferences
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "Please select a state"),
  maxRent: z.number().min(0, "Maximum rent must be a positive number"),
  
  // Employment information
  employmentStatus: z.string().min(1, "Employment status is required"),
  employer: z.string().optional(),
  jobTitle: z.string().optional(),
  monthlyIncome: z.number().optional(),
  employmentDuration: z.string().optional(),
  
  // References (optional)
  references: z.array(z.object({
    name: z.string().min(1, "Reference name is required"),
    relationship: z.string().min(1, "Relationship is required"), 
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    email: z.string().email("Please enter a valid email address").optional()
  })).default([]),
  
  // Account preferences
  saveAccount: z.boolean().default(true),
  agreeToTerms: z.boolean().refine(val => val, "You must agree to the terms of service")
});

type RentCardForm = z.infer<typeof rentCardSchema>;

const TenantQuickStart = () => {
  const { user, isLoading: userLoading } = useAuth();
  const { addToast } = useUIStore();
  const [, setLocation] = useLocation();
  const [showCelebration, setShowCelebration] = useState(false);
  const [isExpressSignupMode, setIsExpressSignupMode] = useState(false);

  // Single form for all RentCard data
  const form = useForm<RentCardForm>({
    resolver: zodResolver(rentCardSchema),
    defaultValues: {
      email: user?.email || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: '',
      city: '',
      state: '',
      maxRent: 1500,
      employmentStatus: '',
      employer: '',
      jobTitle: '',
      monthlyIncome: undefined,
      employmentDuration: '',
      references: [],
      saveAccount: !user, // Default to true if not logged in
      agreeToTerms: false
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "references"
  });

  // Watch form values for live preview
  const watchedValues = form.watch();

  // Create RentCard mutation
  const createRentCardMutation = useMutation({
    mutationFn: async (data: RentCardForm) => {
      const response = await apiRequest('POST', '/api/tenant/profile/quickstart', {
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tenant-profile'] });
      addToast({
        title: "🎉 RentCard Created!",
        description: "Your RentCard is ready to share with landlords",
        type: "success"
      });
      setShowCelebration(true);
      setTimeout(() => {
        setLocation(ROUTES.TENANT.DASHBOARD + '?welcome=true');
      }, 2000);
    }
  });

  // Handle express signup
  const handleExpressSignup = () => {
    localStorage.setItem('selectedRole', 'tenant');
    window.location.href = '/api/login';
  };

  // Auto-populate fields when user logs in
  useEffect(() => {
    if (user && !isExpressSignupMode) {
      form.setValue('email', user.email || '');
      form.setValue('firstName', user.firstName || '');
      form.setValue('lastName', user.lastName || '');
      setIsExpressSignupMode(true);
    }
  }, [user, form, isExpressSignupMode]);

  // Handle form submission
  const onSubmit = async (data: RentCardForm) => {
    console.log('Submitting RentCard data:', data);
    
    if (!user && data.saveAccount) {
      // Redirect to auth with form data stored
      localStorage.setItem('quickstartData', JSON.stringify(data));
      localStorage.setItem('selectedRole', 'tenant');
      window.location.href = '/api/login';
      return;
    }
    
    createRentCardMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {showCelebration && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>RentCard created successfully!</span>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Create your RentCard
          </h1>
          <p className="text-slate-600">
            Your standardized rental profile for private landlords
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
                      <p className="text-sm text-green-700">Your information will be saved automatically</p>
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

              {/* Personal Details Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Personal details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} data-testid="input-first-name" />
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
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} data-testid="input-last-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(555) 123-4567" 
                          {...field} 
                          data-testid="input-phone" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location Preferences */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Location preferences</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Austin" {...field} data-testid="input-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-state">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {US_STATES.map((state) => (
                              <SelectItem key={state.value} value={state.value}>
                                {state.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="maxRent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum monthly rent</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1500" 
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value) || 0)}
                          data-testid="input-max-rent"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Employment Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Employment</h2>
                <FormField
                  control={form.control}
                  name="employmentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-employment-status">
                            <SelectValue placeholder="Select employment status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="employed">Employed</SelectItem>
                          <SelectItem value="self-employed">Self-Employed</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="unemployed">Unemployed</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employer (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Company name" {...field} data-testid="input-employer" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job title (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Software Engineer" {...field} data-testid="input-job-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="monthlyIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly income (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="5000" 
                          {...field}
                          onChange={e => {
                            const val = e.target.value;
                            field.onChange(val === '' ? undefined : Number(val));
                          }}
                          data-testid="input-monthly-income"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* References Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">References (optional)</h2>
                <p className="text-sm text-slate-600">
                  Add professional or personal references to strengthen your RentCard
                </p>
                
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-slate-900">Reference {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                        data-testid={`button-remove-reference-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`references.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Smith" {...field} data-testid={`input-reference-name-${index}`} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`references.${index}.relationship`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid={`select-reference-relationship-${index}`}>
                                  <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="employer">Employer/Manager</SelectItem>
                                <SelectItem value="coworker">Coworker</SelectItem>
                                <SelectItem value="previous-landlord">Previous Landlord</SelectItem>
                                <SelectItem value="personal">Personal Reference</SelectItem>
                                <SelectItem value="professional">Professional Contact</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`references.${index}.phoneNumber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone number</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="(555) 123-4567" {...field} data-testid={`input-reference-phone-${index}`} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`references.${index}.email`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (optional)</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@company.com" {...field} data-testid={`input-reference-email-${index}`} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ name: '', relationship: '', phoneNumber: '', email: '' })}
                  className="w-full"
                  data-testid="button-add-reference"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add reference
                </Button>
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
                disabled={createRentCardMutation.isPending}
                className="w-full h-14 text-base font-semibold bg-blue-600 hover:bg-blue-700"
                data-testid="button-create-rentcard"
              >
                {createRentCardMutation.isPending ? (
                  "Creating RentCard..."
                ) : user ? (
                  <>
                    Create my RentCard
                    <ShoppingBag className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    Create account & RentCard
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
                    RentCard Preview
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    This is how landlords will see your profile
                  </p>
                </div>
                <div className="p-6">
                  <LiveRentCardPreview 
                    essentialsData={{
                      firstName: watchedValues.firstName,
                      lastName: watchedValues.lastName,
                      email: watchedValues.email,
                      phone: watchedValues.phone,
                      city: watchedValues.city,
                      state: watchedValues.state,
                      maxRent: watchedValues.maxRent
                    }}
                    employmentData={{
                      employmentStatus: watchedValues.employmentStatus,
                      employer: watchedValues.employer,
                      jobTitle: watchedValues.jobTitle,
                      monthlyIncome: watchedValues.monthlyIncome,
                      employmentDuration: watchedValues.employmentDuration
                    }}
                    documentsData={{
                      hasDocuments: false,
                      documentTypes: []
                    }}
                    currentStep={3}
                  />
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default TenantQuickStart;