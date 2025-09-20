import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { insertRentCardSchema, type InsertRentCard } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuthStore } from '@/stores/authStore';
import { ROUTES, MESSAGES } from '@/constants';
import { convertFormNumericValues } from '@/utils/form-utils';
import OneClickShareButton from '@/components/shared/OneClickShareButton';

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import Navbar from '@/components/shared/navbar';

// Icons
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Home, 
  DollarSign, 
  Calendar,
  Share2, 
  CheckCircle, 
  Loader2,
  Star,
  ArrowRight
} from 'lucide-react';

// Simplified schema focusing on essential fields
const simplifiedRentCardSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number is required"),
  monthlyIncome: z.string().min(1, "Monthly income is required"),
  creditScore: z.string().min(1, "Credit score is required"),
  maxRent: z.string().min(1, "Maximum rent budget is required"),
  moveInDate: z.string().min(1, "Move-in date is required"),
});

type SimplifiedRentCard = z.infer<typeof simplifiedRentCardSchema>;

export default function CreateRentCardSimple() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const [isPublished, setIsPublished] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<SimplifiedRentCard>({
    resolver: zodResolver(simplifiedRentCardSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: user?.email || '',
      phone: '',
      monthlyIncome: '',
      creditScore: '',
      maxRent: '',
      moveInDate: '',
    }
  });

  const numericFields = ['monthlyIncome', 'maxRent', 'creditScore'];

  const createRentCardMutation = useMutation({
    mutationFn: async (data: SimplifiedRentCard) => {
      // Convert numeric fields first, then create full format
      const convertedData = convertFormNumericValues(data, numericFields);
      
      const fullRentCardData: InsertRentCard = {
        ...convertedData,
        // Add required fields with sensible defaults
        currentEmployer: 'Not specified',
        yearsEmployed: '1',
        currentAddress: 'Not specified',
        currentRent: 0,
        hasRoommates: false,
        hasPets: false,
      };

      const response = await apiRequest('POST', '/api/tenant/rentcard', {
        ...fullRentCardData,
        userId: user?.id
      });
      
      if (!response.ok) throw new Error(MESSAGES.ERRORS.GENERAL);
      return response.json();
    },
    onSuccess: (data) => {
      console.log('RentCard created successfully:', data);
      setIsPublished(true);
      setShowSuccess(true);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['tenant-profile'] });
      queryClient.invalidateQueries({ queryKey: ['share-tokens'] });
      
      toast({
        title: "🎉 RentCard Created!",
        description: "Your RentCard is ready to share with landlords instantly!",
      });

      // Auto-scroll to success section
      setTimeout(() => {
        document.getElementById('success-section')?.scrollIntoView({ 
          behavior: 'smooth' 
        });
      }, 100);
    },
    onError: (error) => {
      toast({
        title: MESSAGES.ERRORS.GENERAL,
        description: error instanceof Error ? error.message : MESSAGES.ERRORS.GENERAL,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (data: SimplifiedRentCard) => {
    createRentCardMutation.mutate(data);
  };

  const handleGoToDashboard = () => {
    setLocation(ROUTES.TENANT.DASHBOARD);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <div id="success-section" className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🎉 Your RentCard is Ready!
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Private landlords can now review your profile in seconds instead of reviewing dozens of applications.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">75%</div>
                <div className="text-sm text-gray-600">Private Landlords</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">2x Faster</div>
                <div className="text-sm text-gray-600">Response Time</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">&lt; 2 min</div>
                <div className="text-sm text-gray-600">Time to Share</div>
              </div>
            </div>

            {/* Primary Actions */}
            <div className="space-y-4 mb-8">
              <OneClickShareButton 
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3"
                showText={true}
                mode="simple"
              />
              
              <Button
                onClick={handleGoToDashboard}
                variant="outline" 
                size="lg"
                className="w-full text-lg py-3"
                data-testid="button-go-dashboard"
              >
                <Home className="w-5 h-5 mr-2" />
                Go to Dashboard
              </Button>
            </div>

            <p className="text-sm text-gray-500">
              💡 Pro tip: Landlords respond 3x faster to RentCards than traditional applications
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Create Your RentCard
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            One profile, share with any private landlord instantly
          </p>
          <Badge variant="secondary" className="text-sm">
            <Star className="w-4 h-4 mr-1" />
            Takes less than 2 minutes
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Essential Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter first name"
                                data-testid="input-first-name"
                              />
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
                              <Input
                                {...field}
                                placeholder="Enter last name"
                                data-testid="input-last-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="Enter email address"
                                data-testid="input-email"
                              />
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
                            <FormLabel className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              Phone
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="tel"
                                placeholder="Enter phone number"
                                data-testid="input-phone"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Financial Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="monthlyIncome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              Monthly Income
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                placeholder="5000"
                                data-testid="input-monthly-income"
                              />
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
                            <FormLabel className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              Credit Score
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                placeholder="750"
                                min="300"
                                max="850"
                                data-testid="input-credit-score"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="maxRent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Home className="w-4 h-4" />
                              Max Rent Budget
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                placeholder="2000"
                                data-testid="input-max-rent"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Move-in Date */}
                    <FormField
                      control={form.control}
                      name="moveInDate"
                      render={({ field }) => (
                        <FormItem className="max-w-md">
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Desired Move-in Date
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              data-testid="input-move-in-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                      disabled={createRentCardMutation.isPending}
                      data-testid="button-create-rentcard"
                    >
                      {createRentCardMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Creating Your RentCard...
                        </>
                      ) : (
                        <>
                          <Share2 className="w-5 h-5 mr-2" />
                          Create & Share RentCard
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Benefits Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Why RentCards Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Private Landlord Focus</h4>
                    <p className="text-sm text-gray-600">75% of rentals are owned by private landlords who prefer personal connections</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Faster Decisions</h4>
                    <p className="text-sm text-gray-600">Landlords respond 2x faster than traditional applications</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Share2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">One-Click Sharing</h4>
                    <p className="text-sm text-gray-600">Create once, share with unlimited landlords instantly</p>
                  </div>
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg mt-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Pro tip:</strong> Complete RentCards get 3x more responses than incomplete applications
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}