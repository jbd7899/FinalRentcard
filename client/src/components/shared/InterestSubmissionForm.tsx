import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { clientInterestSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Phone, MessageSquare, User, CheckCircle } from "lucide-react";

// Both forms use the same client-safe schema (tenantId is server-controlled)
type ClientInterestData = z.infer<typeof clientInterestSchema>;

interface InterestSubmissionFormProps {
  propertyId?: number;
  landlordId: number;
  propertyAddress?: string;
  onSuccess?: () => void;
  className?: string;
}

interface GuestFormProps {
  onSubmit: (data: ClientInterestData) => void;
  isPending: boolean;
  propertyAddress?: string;
}

interface TenantFormProps {
  onSubmit: (data: ClientInterestData) => void;
  isPending: boolean;
  propertyAddress?: string;
  tenantName?: string;
  tenantEmail?: string;
  tenantPhone?: string;
}

// Guest Interest Form Component
const GuestInterestForm = ({ onSubmit, isPending, propertyAddress }: GuestFormProps) => {
  const form = useForm<ClientInterestData>({
    resolver: zodResolver(clientInterestSchema),
    defaultValues: {
      contactInfo: {
        name: "",
        email: "",
        phone: "",
        preferredContact: "email",
      },
      message: propertyAddress ? `I'm interested in the property at ${propertyAddress}` : "",
      status: "new",
    },
  });

  const handleSubmit = (data: ClientInterestData) => {
    onSubmit(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary" />
          Schedule Qualification Call
        </CardTitle>
        <CardDescription>
          Schedule a qualification call or property viewing. Fill out your contact information below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="contactInfo.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your full name"
                      data-testid="input-guest-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactInfo.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="your.email@example.com"
                        data-testid="input-guest-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactInfo.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        placeholder="(555) 123-4567"
                        data-testid="input-guest-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contactInfo.preferredContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Contact Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-guest-contact-method">
                        <SelectValue placeholder="How would you like to be contacted?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="email">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email
                        </div>
                      </SelectItem>
                      <SelectItem value="phone">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Phone Call
                        </div>
                      </SelectItem>
                      <SelectItem value="text">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Text Message
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="Tell us about your interest or preferred times for a qualification call..."
                      rows={3}
                      data-testid="textarea-guest-message"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>Want a better experience?</strong> Create a MyRentCard account to pre-fill your information for faster qualification calls.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
              data-testid="button-submit-guest-interest"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scheduling Call...
                </>
              ) : (
                "Schedule Qualification Call"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

// Authenticated Tenant Interest Form Component
const TenantInterestForm = ({ 
  onSubmit, 
  isPending, 
  propertyAddress,
  tenantName,
  tenantEmail,
  tenantPhone 
}: TenantFormProps) => {
  const form = useForm<ClientInterestData>({
    resolver: zodResolver(clientInterestSchema),
    defaultValues: {
      contactInfo: {
        name: tenantName || "",
        email: tenantEmail || "",
        phone: tenantPhone || "",
        preferredContact: "email",
      },
      message: propertyAddress ? `I'm interested in the property at ${propertyAddress}` : "",
      status: "new",
    },
  });

  const handleSubmit = (data: ClientInterestData) => {
    onSubmit(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" />
          Quick Qualification Call
        </CardTitle>
        <CardDescription>
          Schedule a qualification call with your pre-filled MyRentCard profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Authenticated User
            </Badge>
          </div>
          <div className="space-y-1 text-sm text-green-800">
            <p><strong>Name:</strong> {tenantName}</p>
            <p><strong>Email:</strong> {tenantEmail}</p>
            <p><strong>Phone:</strong> {tenantPhone}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="contactInfo.preferredContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Contact Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-tenant-contact-method">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="email">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email
                        </div>
                      </SelectItem>
                      <SelectItem value="phone">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Phone Call
                        </div>
                      </SelectItem>
                      <SelectItem value="text">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Text Message
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="Tell us about your interest or preferred times for a qualification call..."
                      rows={3}
                      data-testid="textarea-tenant-message"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
              data-testid="button-submit-tenant-interest"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scheduling Call...
                </>
              ) : (
                "Schedule Qualification Call"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

// Success Component
const SuccessMessage = ({ onClose }: { onClose: () => void }) => (
  <Card className="w-full">
    <CardContent className="pt-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-green-800" data-testid="text-success-title">
            Qualification Call Requested!
          </h3>
          <p className="text-gray-600 mt-2">
            Your request has been sent to the landlord. They will contact you to schedule a qualification call or property viewing.
          </p>
        </div>
        <Button onClick={onClose} variant="outline" data-testid="button-close-success">
          Close
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Main Interest Submission Form Component
export default function InterestSubmissionForm({ 
  propertyId, 
  landlordId, 
  propertyAddress,
  onSuccess,
  className = ""
}: InterestSubmissionFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // UX GATING: Prevent form rendering when required props are missing
  if (!landlordId) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="text-gray-600" data-testid="text-loading-landlord">
              Loading property information...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const interestMutation = useMutation({
    mutationFn: async (data: ClientInterestData) => {
      // SECURITY: Send only client-safe data - server derives tenantId from session
      const interestData = {
        ...data,
        propertyId: propertyId || null,
        landlordId,
        // tenantId removed - server derives from authentication session
      };

      const response = await apiRequest("POST", "/api/interests", interestData);
      if (!response.ok) {
        throw new Error("Failed to submit interest");
      }
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Qualification Call Requested",
        description: "Your request has been sent to the landlord successfully.",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Request Failed",
        description: error.message || "There was an error submitting your qualification call request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return <SuccessMessage onClose={handleClose} />;
  }

  return (
    <div className={className}>
      {user ? (
        <TenantInterestForm
          onSubmit={interestMutation.mutate}
          isPending={interestMutation.isPending}
          propertyAddress={propertyAddress}
          tenantName={`${user.email.split('@')[0]}`} // Fallback name
          tenantEmail={user.email}
          tenantPhone={user.phone}
        />
      ) : (
        <GuestInterestForm
          onSubmit={interestMutation.mutate}
          isPending={interestMutation.isPending}
          propertyAddress={propertyAddress}
        />
      )}
    </div>
  );
}