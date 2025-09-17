import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Star,
  Building2,
  Briefcase,
  DollarSign,
  CreditCard,
  CheckCircle,
  Share2,
  Download,
  Loader2,
  Info,
  User,
  MessageSquare,
  Phone,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  Edit3,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MESSAGES, APPLICATION_LABELS, ROUTES } from '@/constants';
import { useAuthStore } from '@/stores/authStore';
import { useParams } from 'wouter';
import TenantLayout from '@/components/layouts/TenantLayout';
import { EnhancedShareModal } from '@/components/shared/EnhancedShareModal';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TenantProfile, User as UserType } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';


// Validation schemas for editing forms
const personalInfoSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(1, 'Phone number is required'),
});

const employmentInfoSchema = z.object({
  employer: z.string().min(1, 'Employer name is required'),
  position: z.string().min(1, 'Position is required'),
  monthlyIncome: z.coerce.number().min(1, 'Monthly income is required'),
  startDate: z.string().min(1, 'Start date is required'),
});

const rentalPreferencesSchema = z.object({
  maxRent: z.coerce.number().min(1, 'Maximum rent is required'),
  moveInDate: z.string().optional(),
});

const rentalHistorySchema = z.object({
  address: z.string().min(1, 'Address is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  landlordContact: z.string().min(1, 'Landlord contact is required'),
});

const creditInfoSchema = z.object({
  creditScore: z.coerce.number().min(300, 'Credit score must be at least 300').max(850, 'Credit score cannot exceed 850'),
});

type PersonalInfoForm = z.infer<typeof personalInfoSchema>;
type EmploymentInfoForm = z.infer<typeof employmentInfoSchema>;
type RentalPreferencesForm = z.infer<typeof rentalPreferencesSchema>;
type RentalHistoryForm = z.infer<typeof rentalHistorySchema>;
type CreditInfoForm = z.infer<typeof creditInfoSchema>;

const RentCard = () => {
  const { setLoading, loadingStates, addToast } = useUIStore();
  const { user } = useAuthStore();
  const { slug } = useParams();
  const isPublicView = Boolean(slug);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Fetch real tenant profile data
  const { data: tenantProfile, isLoading: profileLoading, error: profileError } = useQuery<TenantProfile>({
    queryKey: ['/api/tenant/profile'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/tenant/profile');
      return response.json();
    },
    enabled: !!user && !isPublicView,
  });

  // Forms for different sections
  const personalInfoForm = useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const employmentInfoForm = useForm<EmploymentInfoForm>({
    resolver: zodResolver(employmentInfoSchema),
    defaultValues: {
      employer: '',
      position: '',
      monthlyIncome: 0,
      startDate: '',
    },
  });

  const rentalPreferencesForm = useForm<RentalPreferencesForm>({
    resolver: zodResolver(rentalPreferencesSchema),
    defaultValues: {
      maxRent: 0,
      moveInDate: '',
    },
  });

  const rentalHistoryForm = useForm<RentalHistoryForm>({
    resolver: zodResolver(rentalHistorySchema),
    defaultValues: {
      address: '',
      startDate: '',
      endDate: '',
      landlordContact: '',
    },
  });

  const creditInfoForm = useForm<CreditInfoForm>({
    resolver: zodResolver(creditInfoSchema),
    defaultValues: {
      creditScore: 0,
    },
  });

  // Update user mutation for personal info
  const updateUserMutation = useMutation({
    mutationFn: async (data: PersonalInfoForm) => {
      const response = await apiRequest('PUT', '/api/user', data);
      if (!response.ok) {
        throw new Error('Failed to update user info');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      addToast({
        title: 'Personal Info Updated',
        description: 'Your personal information has been successfully updated.',
        type: 'success',
      });
      setEditingSection(null);
    },
    onError: (error) => {
      addToast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update personal info',
        type: 'destructive',
      });
    },
  });

  // Update tenant profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<TenantProfile>) => {
      const response = await apiRequest('PUT', '/api/tenant/profile', data);
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenant/profile'] });
      addToast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
        type: 'success',
      });
      setEditingSection(null);
    },
    onError: (error) => {
      addToast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        type: 'destructive',
      });
    },
  });

  // Sync form data when user data or tenantProfile loads
  useEffect(() => {
    if (user) {
      personalInfoForm.reset({
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user, personalInfoForm]);

  useEffect(() => {
    if (tenantProfile) {
      employmentInfoForm.reset({
        employer: tenantProfile.employmentInfo?.employer || '',
        position: tenantProfile.employmentInfo?.position || '',
        monthlyIncome: tenantProfile.employmentInfo?.monthlyIncome || 0,
        startDate: tenantProfile.employmentInfo?.startDate || '',
      });

      rentalPreferencesForm.reset({
        maxRent: tenantProfile.maxRent || 0,
        moveInDate: tenantProfile.moveInDate ? new Date(tenantProfile.moveInDate).toISOString().split('T')[0] : '',
      });
    }
  }, [tenantProfile, employmentInfoForm, rentalPreferencesForm]);

  // Calculate profile completeness
  const calculateProfileCompleteness = () => {
    if (!tenantProfile) return 0;
    
    let completedFields = 0;
    const totalFields = 8;
    
    if (tenantProfile.employmentInfo?.employer) completedFields++;
    if (tenantProfile.employmentInfo?.position) completedFields++;
    if (tenantProfile.employmentInfo?.monthlyIncome) completedFields++;
    if (tenantProfile.employmentInfo?.startDate) completedFields++;
    if (tenantProfile.creditScore) completedFields++;
    if (tenantProfile.maxRent) completedFields++;
    if (tenantProfile.moveInDate) completedFields++;
    if (tenantProfile.rentalHistory?.previousAddresses?.length) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  const handleShare = () => {
    setShareModalOpen(true);
  };

  const handleEditSection = (section: string) => {
    setEditingSection(section);
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditMode(false);
    // Reset forms to original values
    personalInfoForm.reset({
      email: user?.email || '',
      phone: user?.phone || '',
    });
    employmentInfoForm.reset({
      employer: tenantProfile?.employmentInfo?.employer || '',
      position: tenantProfile?.employmentInfo?.position || '',
      monthlyIncome: tenantProfile?.employmentInfo?.monthlyIncome || 0,
      startDate: tenantProfile?.employmentInfo?.startDate || '',
    });
    rentalPreferencesForm.reset({
      maxRent: tenantProfile?.maxRent || 0,
      moveInDate: tenantProfile?.moveInDate ? new Date(tenantProfile.moveInDate).toISOString().split('T')[0] : '',
    });
    rentalHistoryForm.reset({
      address: '',
      startDate: '',
      endDate: '',
      landlordContact: '',
    });
    creditInfoForm.reset({
      creditScore: tenantProfile?.creditScore || 0,
    });
  };

  const handlePersonalInfoSubmit = async (data: PersonalInfoForm) => {
    await updateUserMutation.mutateAsync(data);
  };

  const handleEmploymentInfoSubmit = async (data: EmploymentInfoForm) => {
    await updateProfileMutation.mutateAsync({
      employmentInfo: data,
    });
  };

  const handleRentalPreferencesSubmit = async (data: RentalPreferencesForm) => {
    await updateProfileMutation.mutateAsync({
      maxRent: data.maxRent,
      moveInDate: data.moveInDate ? new Date(data.moveInDate) : undefined,
    });
  };

  const handleRentalHistorySubmit = async (data: RentalHistoryForm) => {
    // Get existing rental history or create new array
    const existingHistory = tenantProfile?.rentalHistory?.previousAddresses || [];
    
    // Add new rental history entry
    const newHistory = {
      address: data.address,
      startDate: data.startDate,
      endDate: data.endDate,
      landlordContact: data.landlordContact,
    };
    
    // Update the profile with the new rental history
    await updateProfileMutation.mutateAsync({
      rentalHistory: {
        previousAddresses: [...existingHistory, newHistory]
      }
    });
  };

  const handleCreditInfoSubmit = async (data: CreditInfoForm) => {
    await updateProfileMutation.mutateAsync({
      creditScore: data.creditScore,
    });
  };

  const handleDownloadPDF = async () => {
    try {
      setLoading('downloadPDF', true);
      const element = document.getElementById('rentcard-content');
      if (!element) {
        throw new Error(MESSAGES.ERRORS.GENERAL);
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      const userName = user ? `${user.email.split('@')[0]}` : 'tenant';
      pdf.save(`${userName}_RentCard.pdf`);

      addToast({
        title: MESSAGES.SUCCESS.SAVED,
        description: "RentCard downloaded successfully",
        type: 'success'
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      addToast({
        title: MESSAGES.ERRORS.GENERAL,
        description: MESSAGES.ERRORS.GENERAL,
        type: 'destructive'
      });
    } finally {
      setLoading('downloadPDF', false);
    }
  };

  // Handle loading state
  if (profileLoading && !isPublicView) {
    return (
      <TenantLayout activeRoute={ROUTES.TENANT.RENTCARD}>
        <div className="min-h-screen bg-gray-100 p-6">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-8">
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-20 h-20 rounded-full" />
                  <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </TenantLayout>
    );
  }

  // Handle error state
  if (profileError && !isPublicView) {
    return (
      <TenantLayout activeRoute={ROUTES.TENANT.RENTCARD}>
        <div className="min-h-screen bg-gray-100 p-6">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
              <p className="text-gray-600 mb-4">
                Your tenant profile hasn't been created yet. Complete your profile to get started.
              </p>
              <Button onClick={() => window.location.href = '/tenant/dashboard'}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </TenantLayout>
    );
  }

  const profileCompleteness = calculateProfileCompleteness();

  // Generate the rentcard URL based on whether we're in public or private view
  const rentCardUrl = isPublicView 
    ? window.location.href 
    : user 
      ? `${window.location.origin}/rentcard/${user.email.split('@')[0]}-${user.id}`
      : window.location.href;

  // Use real data or fallback to demo data for public view
  const displayData = {
    tenant: {
      name: user ? user.email.split('@')[0] : "Tenant",
      email: user?.email || "email@example.com",
      phone: user?.phone || "(555) 123-4567",
      since: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "January 2025"
    },
    employment: {
      employer: tenantProfile?.employmentInfo?.employer || "Add employer",
      position: tenantProfile?.employmentInfo?.position || "Add position",
      income: tenantProfile?.employmentInfo?.monthlyIncome ? `$${(tenantProfile.employmentInfo.monthlyIncome * 12).toLocaleString()}` : "Add income",
      monthlyIncome: tenantProfile?.employmentInfo?.monthlyIncome || 0,
      startDate: tenantProfile?.employmentInfo?.startDate || ""
    },
    creditInfo: {
      score: tenantProfile?.creditScore ? `${tenantProfile.creditScore}` : "Add credit score"
    },
    preferences: {
      maxRent: tenantProfile?.maxRent || 0,
      moveInDate: tenantProfile?.moveInDate ? new Date(tenantProfile.moveInDate).toLocaleDateString() : "Not specified"
    },
    rentalHistory: tenantProfile?.rentalHistory?.previousAddresses || []
  };

  return (
    <TenantLayout activeRoute={ROUTES.TENANT.RENTCARD}>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden" id="rentcard-content">
          {/* Header with Logo and Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-4 sm:p-6 lg:p-8 text-white relative">
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              {!isPublicView && (
                <Button 
                  variant="outline"
                  onClick={() => setEditMode(!editMode)}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  disabled={loadingStates.downloadPDF || updateProfileMutation.isPending}
                  data-testid="button-edit-profile"
                >
                  {editMode ? (
                    <X className="w-4 h-4 sm:mr-2" />
                  ) : (
                    <Edit3 className="w-4 h-4 sm:mr-2" />
                  )}
                  <span className="hidden sm:inline">{editMode ? 'Cancel' : 'Edit Profile'}</span>
                </Button>
              )}
              {(!isPublicView || (user && slug === `${user.email.split('@')[0]}-${user.id}`)) && (
                <Button 
                  variant="outline"
                  onClick={handleShare}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  disabled={loadingStates.downloadPDF}
                  data-testid="button-share-rentcard"
                >
                  <Share2 className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={handleDownloadPDF}
                className="bg-white text-blue-600 hover:bg-blue-50"
                disabled={loadingStates.downloadPDF}
              >
                {loadingStates.downloadPDF ? (
                  <Loader2 className="w-4 h-4 sm:mr-2" />
                ) : (
                  <Download className="w-4 h-4 sm:mr-2" />
                )}
                <span className="hidden sm:inline">
                  {loadingStates.downloadPDF ? 'Downloading...' : 'Download PDF'}
                </span>
              </Button>
            </div>

            <div className="flex flex-col space-y-6">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-white" />
                <span className="text-xl font-semibold text-white">MyRentCard</span>
              </div>

              {/* Main Content Area */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                {/* Tenant Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shrink-0">
                    <User className="w-10 h-10 text-gray-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">{displayData.tenant.name}</h2>
                    <p className="text-blue-100">Member since {displayData.tenant.since}</p>
                  </div>
                </div>

                {/* Verification and Score */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <span className="bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                    Verified Profile
                  </span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Star className="w-6 h-6 text-yellow-300 fill-current" />
                      <span className="text-xl font-bold text-white">{profileCompleteness}%</span>
                      <span className="text-blue-100 whitespace-nowrap">Profile Completeness</span>
                    </div>
                    <p className="text-sm text-blue-100 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Information Section */}
          <div className="p-8 bg-gray-50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg flex items-center text-gray-800">
                Key Information
                <span className="ml-2 cursor-help" title="Overview of tenant's profile">
                  <Info className="w-4 h-4 text-gray-500" />
                </span>
              </h3>
              {!isPublicView && !editMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditSection('personal')}
                  className="flex items-center gap-2"
                  data-testid="button-edit-personal-info"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>
            
            {editingSection === 'personal' ? (
              <Form {...personalInfoForm}>
                <form onSubmit={personalInfoForm.handleSubmit(handlePersonalInfoSubmit)} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={personalInfoForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email"
                              placeholder="Enter your email"
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalInfoForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="tel"
                              placeholder="Enter your phone number"
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      data-testid="button-cancel-edit"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateUserMutation.isPending}
                      data-testid="button-save-personal-info"
                    >
                      {updateUserMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
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
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center mb-2">
                    <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
                    <span className="font-medium text-gray-700">Annual Income</span>
                  </div>
                  <p className="text-gray-600" data-testid="text-annual-income">
                    {displayData.employment.income}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Briefcase className="w-6 h-6 text-blue-600 mr-2" />
                    <span className="font-medium text-gray-700">Employment</span>
                  </div>
                  <p className="text-gray-600" data-testid="text-employment">
                    {displayData.employment.employer}
                  </p>
                  <p className="text-sm text-gray-500" data-testid="text-position">
                    {displayData.employment.position}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center mb-2">
                    <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
                    <span className="font-medium text-gray-700">Credit Score</span>
                  </div>
                  <p className="text-gray-600" data-testid="text-credit-score">
                    {displayData.creditInfo.score}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Employment Information Section */}
          <div className="p-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg flex items-center text-gray-800">
                Employment Information
                <span className="ml-2 cursor-help" title="Employment details and verification">
                  <Info className="w-4 h-4 text-gray-500" />
                </span>
              </h3>
              {!isPublicView && !editMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditSection('employment')}
                  className="flex items-center gap-2"
                  data-testid="button-edit-employment"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>
            
            {editingSection === 'employment' ? (
              <Form {...employmentInfoForm}>
                <form onSubmit={employmentInfoForm.handleSubmit(handleEmploymentInfoSubmit)} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={employmentInfoForm.control}
                      name="employer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employer Name</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter your employer"
                              data-testid="input-employer"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={employmentInfoForm.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title/Position</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter your job title"
                              data-testid="input-position"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={employmentInfoForm.control}
                      name="monthlyIncome"
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>Monthly Income ($)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              type="number"
                              min="0"
                              step="1"
                              value={value || ''}
                              onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : 0)}
                              placeholder="Enter monthly income"
                              data-testid="input-monthly-income"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={employmentInfoForm.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employment Start Date</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="date"
                              data-testid="input-start-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      data-testid="button-cancel-edit"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-save-employment"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
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
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Building2 className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-gray-700 text-sm">Employer</span>
                  </div>
                  <p className="text-gray-900 font-medium" data-testid="text-employer">
                    {displayData.employment.employer}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Briefcase className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-gray-700 text-sm">Position</span>
                  </div>
                  <p className="text-gray-900 font-medium" data-testid="text-job-position">
                    {displayData.employment.position}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center mb-2">
                    <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-gray-700 text-sm">Monthly Income</span>
                  </div>
                  <p className="text-gray-900 font-medium" data-testid="text-monthly-income">
                    {displayData.employment.monthlyIncome ? `$${displayData.employment.monthlyIncome.toLocaleString()}` : 'Add income'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-gray-700 text-sm">Start Date</span>
                  </div>
                  <p className="text-gray-900 font-medium" data-testid="text-employment-start">
                    {displayData.employment.startDate ? new Date(displayData.employment.startDate).toLocaleDateString() : 'Add start date'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Rental Preferences Section */}
          <div className="p-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg flex items-center text-gray-800">
                Rental Preferences
                <span className="ml-2 cursor-help" title="Your rental preferences and requirements">
                  <Info className="w-4 h-4 text-gray-500" />
                </span>
              </h3>
              {!isPublicView && !editMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditSection('preferences')}
                  className="flex items-center gap-2"
                  data-testid="button-edit-preferences"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>
            
            {editingSection === 'preferences' ? (
              <Form {...rentalPreferencesForm}>
                <form onSubmit={rentalPreferencesForm.handleSubmit(handleRentalPreferencesSubmit)} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={rentalPreferencesForm.control}
                      name="maxRent"
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>Maximum Rent ($)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              type="number"
                              min="0"
                              step="1"
                              value={value || ''}
                              onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : 0)}
                              placeholder="Enter maximum rent you can afford"
                              data-testid="input-max-rent"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={rentalPreferencesForm.control}
                      name="moveInDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Move-in Date</FormLabel>
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
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      data-testid="button-cancel-edit"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-save-preferences"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
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
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center mb-3">
                    <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
                    <span className="font-medium text-gray-700">Maximum Rent</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-max-rent">
                    {displayData.preferences.maxRent ? `$${displayData.preferences.maxRent.toLocaleString()}` : 'Not specified'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Monthly budget</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center mb-3">
                    <Calendar className="w-6 h-6 text-blue-600 mr-2" />
                    <span className="font-medium text-gray-700">Move-in Date</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-preferred-move-in">
                    {displayData.preferences.moveInDate}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Preferred date</p>
                </div>
              </div>
            )}
          </div>

          {/* Rental History Section */}
          <div className="p-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg flex items-center text-gray-800">
                Rental History
                <span className="ml-2 cursor-help" title="Previous rental experiences">
                  <Info className="w-4 h-4 text-gray-500" />
                </span>
              </h3>
              {!isPublicView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditSection('history')}
                  className="flex items-center gap-2"
                  data-testid="button-edit-rental-history"
                >
                  <Plus className="w-4 h-4" />
                  Add History
                </Button>
              )}
            </div>
            
            {editingSection === 'history' ? (
              <Form {...rentalHistoryForm}>
                <form onSubmit={rentalHistoryForm.handleSubmit(handleRentalHistorySubmit)} className="space-y-4">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-4">Add Rental History</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={rentalHistoryForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Address</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Enter property address"
                                data-testid="input-rental-address"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={rentalHistoryForm.control}
                        name="landlordContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Landlord Contact</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Enter landlord contact"
                                data-testid="input-landlord-contact"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <FormField
                        control={rentalHistoryForm.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="date"
                                data-testid="input-rental-start-date"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={rentalHistoryForm.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="date"
                                data-testid="input-rental-end-date"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      data-testid="button-cancel-rental-history"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-save-rental-history"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Add History
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : displayData.rentalHistory.length > 0 ? (
              <div className="space-y-4">
                {displayData.rentalHistory.map((history, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <Building2 className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                        <div>
                          <p className="font-medium text-gray-800" data-testid={`text-rental-address-${index}`}>
                            {history.address}
                          </p>
                          <p className="text-gray-600" data-testid={`text-rental-dates-${index}`}>
                            {new Date(history.startDate).toLocaleDateString()} - {new Date(history.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500 mt-1" data-testid={`text-landlord-contact-${index}`}>
                            Landlord: {history.landlordContact}
                          </p>
                        </div>
                      </div>
                      {!isPublicView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-red-500"
                          data-testid={`button-delete-rental-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2" data-testid="text-no-rental-history">
                  No rental history added yet
                </p>
                <p className="text-sm text-gray-500">
                  Add your previous rental experiences to strengthen your profile
                </p>
              </div>
            )}
          </div>

          {/* Credit Information Section */}
          <div className="p-8 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg flex items-center text-gray-800">
                Credit Information
                <span className="ml-2 cursor-help" title="Credit score and financial information">
                  <Info className="w-4 h-4 text-gray-500" />
                </span>
              </h3>
              {!isPublicView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditSection('credit')}
                  className="flex items-center gap-2"
                  data-testid="button-edit-credit"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>
            
            {editingSection === 'credit' ? (
              <Form {...creditInfoForm}>
                <form onSubmit={creditInfoForm.handleSubmit(handleCreditInfoSubmit)} className="space-y-4">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-4">Update Credit Information</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={creditInfoForm.control}
                        name="creditScore"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Credit Score</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number"
                                min="300"
                                max="850"
                                placeholder="Enter credit score (300-850)"
                                data-testid="input-credit-score"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      data-testid="button-cancel-credit"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-save-credit"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
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
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                <CreditCard className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-800">Credit Score</h4>
                  <p className="text-sm text-gray-600">Your current credit rating</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="text-3xl font-bold text-gray-900 mr-4" data-testid="text-credit-score-large">
                  {displayData.creditInfo.score}
                </div>
                <div className="flex-1">
                  {tenantProfile?.creditScore && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          tenantProfile.creditScore >= 740 ? 'bg-green-500' :
                          tenantProfile.creditScore >= 670 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((tenantProfile.creditScore / 850) * 100, 100)}%` }}
                      ></div>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Poor</span>
                    <span>Fair</span>
                    <span>Good</span>
                    <span>Excellent</span>
                  </div>
                </div>
              </div>
              
              {!tenantProfile?.creditScore && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Adding your credit score helps landlords assess your application more quickly.
                  </p>
                </div>
              )}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Share Modal */}
        <EnhancedShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          resourceType="rentcard"
          title="Share Your RentCard"
          description="Share your rental profile with landlords and property managers"
        />
      </div>
    </TenantLayout>
  );
};

export default RentCard;