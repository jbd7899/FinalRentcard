import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS } from '@/constants/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

// Define the form schema
const verificationFormSchema = z.object({
  rating: z.enum(['excellent', 'good', 'fair', 'poor']),
  comments: z.string()
    .min(1, 'Please provide some comments')
    .max(500, 'Comments must be less than 500 characters'),
});

type VerificationFormValues = z.infer<typeof verificationFormSchema>;

// Define the reference data structure
interface ReferenceData {
  id: number;
  tenantId: number;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  isVerified: boolean;
  verificationDate: string | null;
  notes: string | null;
  tenantName?: string;
  tokenValid?: boolean;
  tokenExpiry?: string;
}

const VerificationPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [validationProgress, setValidationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);
  
  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      rating: 'good',
      comments: '',
    },
  });
  
  useEffect(() => {
    const validateToken = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setValidationProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 200);
        
        const response = await apiRequest('GET', API_ENDPOINTS.TENANT_REFERENCES.VERIFICATION.VALIDATE(token));
        
        clearInterval(progressInterval);
        setValidationProgress(100);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.error || 'Invalid or expired verification link');
        }
        
        const data = await response.json();
        
        if (data.isVerified) {
          setIsAlreadyVerified(true);
        }
        
        setReferenceData(data);
        
        // Show a welcome toast
        toast({
          title: "Verification Link Valid",
          description: `Thank you for verifying your reference for ${data.tenantName || 'the tenant'}.`,
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error validating token:', err);
        
        // Extract error code and message from the error response if available
        let errorMessage = 'Invalid or expired verification link';
        let errorCode = 'INVALID_TOKEN';
        
        if (err instanceof Error) {
          errorMessage = err.message;
          
          if (errorMessage.includes('expired')) {
            errorCode = 'EXPIRED_TOKEN';
          } else if (errorMessage.includes('already verified')) {
            errorCode = 'ALREADY_VERIFIED';
          }
        }
        
        setError(errorMessage);
        setErrorCode(errorCode);
        setIsLoading(false);
        
        // Show error toast
        toast({
          title: "Verification Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };
    
    validateToken();
    
    // Cleanup function
    return () => {
      setValidationProgress(0);
    };
  }, [token, toast]);
  
  const onSubmit = async (values: VerificationFormValues) => {
    if (!token || !referenceData) return;
    
    try {
      setIsSubmitting(true);
      
      // Show submitting toast
      toast({
        title: "Submitting Verification",
        description: "Please wait while we process your verification...",
      });
      
      // Combine the form values with the reference ID
      const verificationData = {
        referenceId: referenceData.id,
        rating: values.rating,
        comments: values.comments,
      };
      
      // Send the verification data to the API
      const response = await apiRequest('POST', API_ENDPOINTS.TENANT_REFERENCES.VERIFICATION.SUBMIT(token), verificationData);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to submit verification');
      }
      
      const responseData = await response.json();
      
      setSuccess(true);
      setIsSubmitting(false);
      
      // Show success toast
      toast({
        title: "Verification Successful",
        description: `Thank you for verifying your reference for ${responseData.tenantName || referenceData.tenantName || 'the tenant'}.`,
        variant: "default",
      });
    } catch (err) {
      console.error('Error submitting verification:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit verification';
      setError(errorMessage);
      setIsSubmitting(false);
      
      // Show error toast
      toast({
        title: "Verification Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'Excellent - Highly recommend';
      case 'good': return 'Good - Recommend';
      case 'fair': return 'Fair - Neutral recommendation';
      case 'poor': return 'Poor - Would not recommend';
      default: return rating;
    }
  };
  
  const getRelationshipLabel = (relationship: string) => {
    switch (relationship) {
      case 'previous_landlord': return 'Previous Landlord';
      case 'current_landlord': return 'Current Landlord';
      case 'employer': return 'Employer';
      case 'personal': return 'Personal Reference';
      case 'professional': return 'Professional Reference';
      case 'roommate': return 'Roommate';
      case 'family': return 'Family Member';
      default: return relationship;
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center w-full max-w-md px-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Validating verification link...</h2>
          <p className="text-gray-500 mt-2 mb-4">Please wait while we validate your verification link.</p>
          <Progress value={validationProgress} className="w-full h-2" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {errorCode === 'EXPIRED_TOKEN' ? (
              <Clock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            ) : errorCode === 'ALREADY_VERIFIED' ? (
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            )}
            <CardTitle className="text-xl font-semibold text-gray-900">Verification {errorCode === 'ALREADY_VERIFIED' ? 'Already Complete' : 'Error'}</CardTitle>
            <CardDescription className="text-gray-500 mt-2">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            {errorCode === 'EXPIRED_TOKEN' && (
              <div className="bg-amber-50 border border-amber-100 rounded-md p-4 mb-4">
                <p className="text-amber-800 text-sm">
                  Verification links expire after 24 hours for security reasons. Please contact the tenant to request a new verification link.
                </p>
              </div>
            )}
            {errorCode === 'ALREADY_VERIFIED' && (
              <div className="bg-green-50 border border-green-100 rounded-md p-4 mb-4">
                <p className="text-green-800 text-sm">
                  You have already verified this reference. No further action is needed.
                </p>
              </div>
            )}
            <p className="text-sm text-center text-gray-500">
              {errorCode === 'ALREADY_VERIFIED' 
                ? 'Thank you for your participation in the verification process.'
                : 'If you believe this is an error, please contact the tenant who sent you this verification request.'}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => window.close()}>Close Window</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-xl font-semibold text-gray-900">Verification Successful</CardTitle>
            <CardDescription className="text-gray-500 mt-2">
              Thank you for verifying your reference for {referenceData?.tenantName || 'the tenant'}. Your feedback has been recorded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-100 rounded-md p-4 text-center">
              <p className="text-green-800 text-sm">
                The tenant has been notified of your verification. This helps build their rental profile.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => window.close()}>Close Window</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (isAlreadyVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-xl font-semibold text-gray-900">Already Verified</CardTitle>
            <CardDescription className="text-gray-500 mt-2">
              You have already verified this reference for {referenceData?.tenantName || 'the tenant'}. Thank you for your feedback.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4 text-center">
              <p className="text-yellow-800 text-sm">
                Each reference can only be verified once. If you need to update your verification, please contact the tenant.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => window.close()}>Close Window</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-center">Reference Verification</CardTitle>
            <CardDescription className="text-center">
              You have been asked to provide a reference for {referenceData?.tenantName || 'a tenant'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Reference Details</h3>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Your Name</p>
                    <p className="text-sm text-gray-900">{referenceData?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Relationship</p>
                    <p className="text-sm text-gray-900">{getRelationshipLabel(referenceData?.relationship || '')}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Please provide your feedback</h3>
                <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-4">
                  <p className="text-blue-800 text-sm">
                    Your honest feedback helps landlords make informed decisions. All information you provide will be shared with potential landlords reviewing this tenant's application.
                  </p>
                </div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>How would you rate this tenant?</FormLabel>
                          <FormDescription>
                            Select the option that best describes your experience with this tenant.
                          </FormDescription>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="excellent" id="excellent" />
                                <Label htmlFor="excellent">Excellent - Highly recommend</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="good" id="good" />
                                <Label htmlFor="good">Good - Recommend</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="fair" id="fair" />
                                <Label htmlFor="fair">Fair - Neutral recommendation</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="poor" id="poor" />
                                <Label htmlFor="poor">Poor - Would not recommend</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="comments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comments</FormLabel>
                          <FormDescription>
                            Please provide specific details about your experience with this tenant. Consider including information about:
                            {referenceData?.relationship === 'previous_landlord' || referenceData?.relationship === 'current_landlord' ? (
                              <ul className="list-disc pl-5 mt-1 text-sm">
                                <li>Rent payment history (on-time, late, etc.)</li>
                                <li>Property maintenance and cleanliness</li>
                                <li>Communication and responsiveness</li>
                                <li>Compliance with lease terms</li>
                              </ul>
                            ) : referenceData?.relationship === 'employer' ? (
                              <ul className="list-disc pl-5 mt-1 text-sm">
                                <li>Reliability and punctuality</li>
                                <li>Work ethic and performance</li>
                                <li>Length of employment</li>
                                <li>Communication skills</li>
                              </ul>
                            ) : (
                              <ul className="list-disc pl-5 mt-1 text-sm">
                                <li>How long you've known the tenant</li>
                                <li>Their reliability and trustworthiness</li>
                                <li>Their character and behavior</li>
                                <li>Any other relevant information</li>
                              </ul>
                            )}
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="Please provide details about your experience with this tenant..."
                              className="resize-none min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                        <p className="text-gray-700 text-sm">
                          <strong>Privacy Notice:</strong> By submitting this verification, you acknowledge that your feedback will be shared with the tenant and potential landlords reviewing their application. Your contact information will not be shared with third parties.
                        </p>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => window.close()}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            'Submit Verification'
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerificationPage; 