import { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation, useRoute } from "wouter";
import { useAuthStore } from '@/stores/authStore';
import {
  Building2,
  X,
  DollarSign,
  Calendar,
  CheckCircle,
  Info,
  ArrowRight,
  Send,
  Mail,
  Phone,
  Wifi,
  Droplets,
  Zap,
  Car,
  Home,
  Plus,
  MapPin,
  Building,
  Utensils,
  Dumbbell,
  Upload,
  Loader2
} from 'lucide-react';
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ROUTES, API_ENDPOINTS, MESSAGES } from '@/constants';
import { useUIStore } from '@/stores/uiStore';
import PropertyImageUpload from "@/components/shared/PropertyImageUpload";
import PropertyAmenityManager from "@/components/shared/PropertyAmenityManager";
import { PropertyImage, PropertyAmenity } from '@shared/schema';
import { useDropzone } from 'react-dropzone';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/shared/navbar";
import LandlordLayout from '@/components/layouts/LandlordLayout';
import { z } from "zod";
import React from "react";

// Add before the AddPropertyForm component
const propertyFormSchema = z.object({
  // Property Details
  name: z.string().min(1, "Property name is required"),
  type: z.string().min(1, "Property type is required"),
  address: z.string().min(1, "Address is required"),
  unit: z.string().optional(),
  rent: z.string().min(1, "Rent amount is required"),
  availableDate: z.string().min(1, "Available date is required"),
  description: z.string().optional(),

  // Requirements
  creditScore: z.string(),
  incomeMultiplier: z.string(),
  noEvictions: z.boolean(),
  cleanHistory: z.boolean(),

  // Additional Settings
  petPolicy: z.string(),
  petDeposit: z.string().optional(),
  leaseLength: z.string(),
  securityDeposit: z.string().min(1, "Security deposit is required")
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

const STEPS = ['property_details', 'requirements', 'additional_settings', 'images_amenities'] as const;
type Step = typeof STEPS[number];

// Main page component wrapper
const AddProperty = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const [, params] = useRoute("/landlord/properties/:id/edit");
  const isEditMode = !!params?.id;
  const propertyId = params?.id ? parseInt(params.id) : undefined;
  
  const pageTitle = isEditMode ? "Edit Property" : "Add Property";

  return (
    <LandlordLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {isEditMode ? 'Edit Property' : 'Add New Property'}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEditMode 
                ? 'Update your property details' 
                : 'Create a new property listing and screening page'}
            </p>
          </div>
          
          <AddPropertyForm 
            propertyId={propertyId}
            isEditMode={isEditMode}
          />
        </div>
      </div>
    </LandlordLayout>
  );
};

// Move step components outside main component to prevent recreation
const PropertyDetails = React.memo(({ control }: { control: any }) => (
  <div className="space-y-4">
    <FormField
      control={control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Property Name</FormLabel>
          <FormControl>
            <Input 
              {...field}
              placeholder="e.g., Oak Ridge Apartments"
              onChange={(e) => field.onChange(e)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Property Type</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="address"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Street Address</FormLabel>
          <FormControl>
            <Input placeholder="Enter street address" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name="unit"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Unit Number (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Apt 4B" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="rent"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Monthly Rent</FormLabel>
            <FormControl>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input type="number" className="pl-9" placeholder="Enter amount" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
    <FormField
      control={control}
      name="availableDate"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Available Date</FormLabel>
          <FormControl>
            <Input type="date" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Property Description</FormLabel>
          <FormControl>
            <Textarea
              rows={3}
              placeholder="Enter property description..."
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
));

const RequirementsSection = React.memo(({ control }: { control: any }) => (
  <div className="space-y-6">
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
      <div className="flex gap-2">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
        <p className="text-sm text-gray-600">
          Set your screening requirements. These will be used to automatically pre-qualify applicants.
        </p>
      </div>
    </div>
    <FormField
      control={control}
      name="creditScore"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Minimum Credit Score</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="600">600+</SelectItem>
              <SelectItem value="650">650+</SelectItem>
              <SelectItem value="700">700+</SelectItem>
              <SelectItem value="750">750+</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="incomeMultiplier"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Minimum Income Requirement</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="2.5">2.5× monthly rent</SelectItem>
              <SelectItem value="3">3× monthly rent</SelectItem>
              <SelectItem value="3.5">3.5× monthly rent</SelectItem>
              <SelectItem value="4">4× monthly rent</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
    <div className="space-y-3">
      <FormField
        control={control}
        name="noEvictions"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="!mt-0">No prior evictions</FormLabel>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="cleanHistory"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="!mt-0">Clean rental payment history</FormLabel>
          </FormItem>
        )}
      />
    </div>
  </div>
));

const AdditionalSettings = React.memo(({ control }: { control: any }) => {
  const petPolicy = useWatch({
    control,
    name: "petPolicy"
  });

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="petPolicy"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pet Policy</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="no">No pets allowed</SelectItem>
                <SelectItem value="cats">Cats only</SelectItem>
                <SelectItem value="dogs">Dogs only</SelectItem>
                <SelectItem value="both">Both cats and dogs allowed</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      {petPolicy !== "no" && (
        <FormField
          control={control}
          name="petDeposit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pet Deposit</FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input type="number" className="pl-9" placeholder="Enter amount" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      <FormField
        control={control}
        name="leaseLength"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Minimum Lease Length (months)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="18">18 months</SelectItem>
                <SelectItem value="24">24 months</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="securityDeposit"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Security Deposit</FormLabel>
            <FormControl>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input type="number" className="pl-9" placeholder="Enter amount" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
});

// New component for Images and Amenities step that works without a propertyId
const ImagesAndAmenities = React.memo(({ 
  propertyId,
  tempImages,
  setTempImages,
  tempAmenities,
  setTempAmenities,
  isEditMode
}: { 
  propertyId?: number;
  tempImages: File[];
  setTempImages: (images: File[]) => void;
  tempAmenities: any[];
  setTempAmenities: (amenities: any[]) => void;
  isEditMode?: boolean;
}) => {
  const { toast } = useToast();
  const [amenityDialogOpen, setAmenityDialogOpen] = useState(false);
  const [selectedAmenityType, setSelectedAmenityType] = useState('');
  const [amenityDescription, setAmenityDescription] = useState('');
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);
  const [existingAmenities, setExistingAmenities] = useState<PropertyAmenity[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isLoadingAmenities, setIsLoadingAmenities] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  
  // Fetch existing images and amenities if in edit mode
  useEffect(() => {
    if (isEditMode && propertyId) {
      // Only attempt to fetch if we have a valid propertyId
      if (!propertyId || propertyId <= 0) {
        console.log('Invalid propertyId, skipping fetch:', propertyId);
        return;
      }

      const fetchData = async () => {
        try {
          // Fetch images
          setIsLoadingImages(true);
          setFetchError(false);
          
          try {
            // Use apiRequest instead of fetch for consistent error handling
            const imagesResponse = await apiRequest(
              'GET', 
              API_ENDPOINTS.PROPERTIES.IMAGES.LIST(propertyId)
            );
            
            if (imagesResponse.ok) {
              const data = await imagesResponse.json();
              setExistingImages(data);
            } else {
              console.warn('Failed to fetch images, status:', imagesResponse.status);
            }
          } catch (error) {
            console.error('Error fetching property images:', error);
            // Don't show toast for every fetch error to avoid overwhelming the user
            setFetchError(true);
          } finally {
            setIsLoadingImages(false);
          }
          
          // Fetch amenities
          setIsLoadingAmenities(true);
          
          try {
            // Use apiRequest instead of fetch for consistent error handling
            const amenitiesResponse = await apiRequest(
              'GET', 
              API_ENDPOINTS.PROPERTIES.AMENITIES.LIST(propertyId)
            );
            
            if (amenitiesResponse.ok) {
              const data = await amenitiesResponse.json();
              setExistingAmenities(data);
            } else {
              console.warn('Failed to fetch amenities, status:', amenitiesResponse.status);
            }
          } catch (error) {
            console.error('Error fetching property amenities:', error);
            setFetchError(true);
          } finally {
            setIsLoadingAmenities(false);
          }
        } catch (error) {
          console.error('Error in fetch data effect:', error);
          setFetchError(true);
        }
      };
      
      fetchData();
    }
  }, [isEditMode, propertyId]);
  
  // Show a single toast for fetch errors
  useEffect(() => {
    if (fetchError) {
      toast({
        title: 'Connection Error',
        description: 'Could not load property data. You can continue adding the property and update images/amenities later.',
        variant: 'destructive',
      });
    }
  }, [fetchError, toast]);
  
  // Amenity types from PropertyAmenityManager
  const AMENITY_CATEGORIES = {
    UTILITIES: 'utilities',
    FEATURES: 'features',
    NEARBY: 'nearby',
  } as const;
  
  type AmenityCategory = typeof AMENITY_CATEGORIES[keyof typeof AMENITY_CATEGORIES];
  
  interface AmenityType {
    value: string;
    label: string;
    icon: React.ReactNode;
    category: AmenityCategory;
  }
  
  const AMENITY_TYPES: AmenityType[] = [
    // Utilities
    { value: 'wifi', label: 'WiFi Included', icon: <Wifi className="h-4 w-4" />, category: AMENITY_CATEGORIES.UTILITIES },
    { value: 'water', label: 'Water Included', icon: <Droplets className="h-4 w-4" />, category: AMENITY_CATEGORIES.UTILITIES },
    { value: 'electricity', label: 'Electricity Included', icon: <Zap className="h-4 w-4" />, category: AMENITY_CATEGORIES.UTILITIES },
    { value: 'parking', label: 'Parking', icon: <Car className="h-4 w-4" />, category: AMENITY_CATEGORIES.UTILITIES },
    
    // Features
    { value: 'laundry', label: 'In-unit Laundry', icon: <Home className="h-4 w-4" />, category: AMENITY_CATEGORIES.FEATURES },
    { value: 'ac', label: 'Air Conditioning', icon: <Home className="h-4 w-4" />, category: AMENITY_CATEGORIES.FEATURES },
    { value: 'dishwasher', label: 'Dishwasher', icon: <Home className="h-4 w-4" />, category: AMENITY_CATEGORIES.FEATURES },
    { value: 'balcony', label: 'Balcony', icon: <Home className="h-4 w-4" />, category: AMENITY_CATEGORIES.FEATURES },
    
    // Nearby Services
    { value: 'transit', label: 'Public Transit', icon: <MapPin className="h-4 w-4" />, category: AMENITY_CATEGORIES.NEARBY },
    { value: 'shopping', label: 'Shopping', icon: <Building className="h-4 w-4" />, category: AMENITY_CATEGORIES.NEARBY },
    { value: 'restaurants', label: 'Restaurants', icon: <Utensils className="h-4 w-4" />, category: AMENITY_CATEGORIES.NEARBY },
    { value: 'gym', label: 'Gym', icon: <Dumbbell className="h-4 w-4" />, category: AMENITY_CATEGORIES.NEARBY },
  ];

  // Handle file drop for images
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const MAX_IMAGES = 10;
    if (tempImages.length + acceptedFiles.length > MAX_IMAGES) {
      toast({
        title: 'Too many images',
        description: `You can upload a maximum of ${MAX_IMAGES} images`,
        variant: 'destructive',
      });
      return;
    }
    
    setTempImages([...tempImages, ...acceptedFiles]);
  }, [tempImages, setTempImages, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    disabled: tempImages.length >= 10,
  });

  const handleRemoveImage = (index: number) => {
    const newImages = [...tempImages];
    newImages.splice(index, 1);
    setTempImages(newImages);
  };

  const handleAddAmenity = () => {
    if (!selectedAmenityType) {
      toast({
        title: 'Error',
        description: 'Please select an amenity type',
        variant: 'destructive',
      });
      return;
    }

    const amenityType = AMENITY_TYPES.find(type => type.value === selectedAmenityType);
    
    if (!amenityType) return;
    
    const newAmenity = {
      id: Date.now(), // Temporary ID
      amenityType: selectedAmenityType,
      description: amenityDescription.trim() || null,
      propertyId: -1, // Placeholder
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setTempAmenities([...tempAmenities, newAmenity]);
    
    // Reset form
    setSelectedAmenityType('');
    setAmenityDescription('');
    setAmenityDialogOpen(false);
  };

  const handleDeleteAmenity = (id: number) => {
    setTempAmenities(tempAmenities.filter(amenity => amenity.id !== id));
  };

  // Group amenities by category
  const amenitiesByCategory = tempAmenities.reduce<Record<AmenityCategory, any[]>>((acc, amenity) => {
    const amenityType = AMENITY_TYPES.find(type => type.value === amenity.amenityType);
    const category = amenityType?.category || AMENITY_CATEGORIES.FEATURES;
    
    if (!acc[category]) {
      acc[category] = [];
    }
    
    acc[category].push(amenity);
    return acc;
  }, {
    [AMENITY_CATEGORIES.UTILITIES]: [],
    [AMENITY_CATEGORIES.FEATURES]: [],
    [AMENITY_CATEGORIES.NEARBY]: [],
  });

  // Get icon for amenity type
  const getAmenityIcon = (amenityType: string) => {
    return AMENITY_TYPES.find(type => type.value === amenityType)?.icon || <Home className="h-4 w-4" />;
  };

  // Get label for amenity type
  const getAmenityLabel = (amenityType: string) => {
    return AMENITY_TYPES.find(type => type.value === amenityType)?.label || amenityType;
  };

  // Reusable amenity dialog content
  const AmenityDialogContent = () => (
    <>
      <DialogHeader>
        <DialogTitle>Add Property Amenity</DialogTitle>
        <DialogDescription>
          Select an amenity type and provide an optional description.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Amenity Type</label>
          <Select value={selectedAmenityType} onValueChange={setSelectedAmenityType}>
            <SelectTrigger>
              <SelectValue placeholder="Select amenity type" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2">
                <h4 className="mb-2 text-sm font-semibold">Utilities</h4>
                {AMENITY_TYPES
                  .filter(type => type.category === AMENITY_CATEGORIES.UTILITIES)
                  .map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        {type.icon}
                        <span className="ml-2">{type.label}</span>
                      </div>
                    </SelectItem>
                  ))
                }
              </div>
              <div className="p-2 border-t">
                <h4 className="mb-2 text-sm font-semibold">Features</h4>
                {AMENITY_TYPES
                  .filter(type => type.category === AMENITY_CATEGORIES.FEATURES)
                  .map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        {type.icon}
                        <span className="ml-2">{type.label}</span>
                      </div>
                    </SelectItem>
                  ))
                }
              </div>
              <div className="p-2 border-t">
                <h4 className="mb-2 text-sm font-semibold">Nearby</h4>
                {AMENITY_TYPES
                  .filter(type => type.category === AMENITY_CATEGORIES.NEARBY)
                  .map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        {type.icon}
                        <span className="ml-2">{type.label}</span>
                      </div>
                    </SelectItem>
                  ))
                }
              </div>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Description (Optional)</label>
          <Textarea
            placeholder="Add details about this amenity..."
            value={amenityDescription}
            onChange={(e) => setAmenityDescription(e.target.value)}
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={() => setAmenityDialogOpen(false)}>
          Cancel
        </Button>
        <Button onClick={handleAddAmenity}>
          Add Amenity
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Property Images</h3>
        <p className="text-sm text-gray-500">
          Upload images of your property. The first image will be used as the primary image.
        </p>
        
        {propertyId && isEditMode ? (
          <div>
            {isLoadingImages ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : fetchError ? (
              <div className="border-2 border-dashed rounded-lg p-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-500">
                    Could not load existing images. You can try again later by editing the property.
                  </p>
                  <div className="space-y-4">
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                        ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary/50'}
                        ${tempImages.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <input {...getInputProps()} />
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Upload className="h-8 w-8 text-gray-500" />
                        <p className="text-sm font-medium">
                          {isDragActive
                            ? 'Drop images here'
                            : tempImages.length >= 10
                            ? 'Maximum 10 images reached'
                            : 'Drag & drop images here, or click to select'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <PropertyImageUpload propertyId={propertyId} />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary/50'}
                ${tempImages.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-2">
                <Upload className="h-8 w-8 text-gray-500" />
                <p className="text-sm font-medium">
                  {isDragActive
                    ? 'Drop images here'
                    : tempImages.length >= 10
                    ? 'Maximum 10 images reached'
                    : 'Drag & drop images here, or click to select'}
                </p>
                <p className="text-xs text-gray-500">
                  Supports JPG, PNG, WEBP (max 10 images)
                </p>
              </div>
            </div>
            
            {tempImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {tempImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-md overflow-hidden border bg-gray-50">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Property Amenities</h3>
        <p className="text-sm text-gray-500">
          Add amenities to highlight the features of your property.
        </p>
        
        {propertyId && isEditMode ? (
          <div>
            {isLoadingAmenities ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : fetchError ? (
              <div className="border-2 border-dashed rounded-lg p-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-500">
                    Could not load existing amenities. You can try again later by editing the property.
                  </p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Add Temporary Amenities</h3>
                      <Dialog open={amenityDialogOpen} onOpenChange={setAmenityDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Amenity
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <AmenityDialogContent />
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    {Object.entries(amenitiesByCategory).map(([category, categoryAmenities]) => 
                      categoryAmenities.length > 0 && (
                        <div key={category} className="space-y-2">
                          <h4 className="text-sm font-medium capitalize">{category}</h4>
                          <div className="flex flex-wrap gap-2">
                            {categoryAmenities.map(amenity => (
                              <div key={amenity.id} className="group relative">
                                <Badge variant="outline" className="flex items-center gap-1 py-1 px-3">
                                  {getAmenityIcon(amenity.amenityType)}
                                  <span>{getAmenityLabel(amenity.amenityType)}</span>
                                  {amenity.description && (
                                    <span className="text-xs text-gray-500 ml-1">
                                      - {amenity.description}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAmenity(amenity.id)}
                                    className="ml-1 text-gray-400 hover:text-red-500"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                    
                    {!tempAmenities.length && (
                      <div className="text-center p-6 border-2 border-dashed rounded-lg">
                        <p className="text-sm text-gray-500">
                          No amenities added yet. Click "Add Amenity" to get started.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <PropertyAmenityManager propertyId={propertyId} />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Property Amenities</h3>
              <Dialog open={amenityDialogOpen} onOpenChange={setAmenityDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Amenity
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <AmenityDialogContent />
                </DialogContent>
              </Dialog>
            </div>
            
            {Object.entries(amenitiesByCategory).map(([category, categoryAmenities]) => 
              categoryAmenities.length > 0 && (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium capitalize">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {categoryAmenities.map(amenity => (
                      <div key={amenity.id} className="group relative">
                        <Badge variant="outline" className="flex items-center gap-1 py-1 px-3">
                          {getAmenityIcon(amenity.amenityType)}
                          <span>{getAmenityLabel(amenity.amenityType)}</span>
                          {amenity.description && (
                            <span className="text-xs text-gray-500 ml-1">
                              - {amenity.description}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteAmenity(amenity.id)}
                            className="ml-1 text-gray-400 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
            
            {!tempAmenities.length && (
              <div className="text-center p-6 border-2 border-dashed rounded-lg">
                <p className="text-sm text-gray-500">
                  No amenities added yet. Click "Add Amenity" to get started.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

// Form component
const AddPropertyForm = ({ 
  propertyId, 
  isEditMode 
}: { 
  propertyId?: number;
  isEditMode?: boolean;
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('property_details');
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { setLoading, addToast, loadingStates } = useUIStore();
  const isLoading = loadingStates[isEditMode ? 'updateProperty' : 'createProperty'];
  const { toast } = useToast();
  const [createdPropertyId, setCreatedPropertyId] = useState<number | undefined>(propertyId);
  
  // State for temporary images and amenities
  const [tempImages, setTempImages] = useState<File[]>([]);
  const [tempAmenities, setTempAmenities] = useState<any[]>([]);

  // Initialize form with default values
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: "",
      type: "apartment",
      address: "",
      unit: "",
      rent: "",
      availableDate: new Date().toISOString().split('T')[0],
      description: "",
      creditScore: "650",
      incomeMultiplier: "3",
      noEvictions: true,
      cleanHistory: true,
      petPolicy: "no",
      petDeposit: "",
      leaseLength: "12",
      securityDeposit: ""
    }
  });

  // Fetch property data if in edit mode
  useEffect(() => {
    const fetchPropertyData = async () => {
      if (isEditMode && propertyId) {
        try {
          setLoading('fetchProperty', true);
          
          // Add error handling for the API request
          try {
            const response = await apiRequest('GET', `${API_ENDPOINTS.PROPERTIES.BASE}/${propertyId}`);
            
            if (!response.ok) {
              throw new Error(`API returned status ${response.status}`);
            }
            
            const propertyData = await response.json();
            
            // Extract unit from address if it exists
            let address = propertyData.address;
            let unit = "";
            
            const unitMatch = propertyData.address.match(/, (.*?)$/);
            if (unitMatch) {
              address = propertyData.address.replace(/, (.*?)$/, '');
              unit = unitMatch[1];
            }
            
            // Format data for the form
            form.reset({
              name: propertyData.name || "",
              type: propertyData.type || "apartment",
              address: address,
              unit: unit,
              rent: propertyData.rent?.toString() || "",
              availableDate: propertyData.availableFrom ? new Date(propertyData.availableFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              description: propertyData.description || "",
              creditScore: propertyData.requirements?.find((req: any) => req.icon === 'credit-card')?.description?.match(/\d+/)?.[0] || "650",
              incomeMultiplier: propertyData.requirements?.find((req: any) => req.icon === 'dollar-sign')?.description?.match(/(\d+)x/)?.[1] || "3",
              noEvictions: true,
              cleanHistory: true,
              petPolicy: propertyData.petPolicy || "no",
              petDeposit: propertyData.petDeposit?.toString() || "",
              leaseLength: propertyData.leaseLength?.toString() || "12",
              securityDeposit: propertyData.securityDeposit?.toString() || ""
            });
          } catch (apiError) {
            console.error('API request failed:', apiError);
            throw apiError;
          }
        } catch (error) {
          console.error('Error fetching property data:', error);
          toast({
            title: 'Error',
            description: 'Failed to load property data. Please try again.',
            variant: 'destructive',
          });
        } finally {
          setLoading('fetchProperty', false);
        }
      }
    };
    
    fetchPropertyData();
  }, [isEditMode, propertyId, form, setLoading, toast]);

  // Memoize step components to prevent unnecessary re-renders
  const stepComponents = useMemo(() => ({
    'property_details': <PropertyDetails control={form.control} />,
    'requirements': <RequirementsSection control={form.control} />,
    'additional_settings': <AdditionalSettings control={form.control} />,
    'images_amenities': <ImagesAndAmenities 
                          propertyId={createdPropertyId} 
                          tempImages={tempImages}
                          setTempImages={setTempImages}
                          tempAmenities={tempAmenities}
                          setTempAmenities={setTempAmenities}
                          isEditMode={isEditMode}
                        />
  }), [form.control, createdPropertyId, tempImages, tempAmenities, isEditMode]);

  // Add form state debugging
  const formState = form.formState;
  console.log('Form State:', {
    isDirty: formState.isDirty,
    dirtyFields: formState.dirtyFields,
    isValid: formState.isValid,
    errors: formState.errors
  });

  const currentStepIndex = STEPS.indexOf(currentStep);

  // Navigation functions
  const goToNextStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    
    // If we're on the property details step, validate and submit the form
    if (currentStep === 'property_details') {
      form.trigger(['name', 'type', 'address', 'rent', 'availableDate']).then(isValid => {
        if (isValid) {
          setCurrentStep(STEPS[currentIndex + 1]);
        } else {
          console.log('Form validation failed:', form.formState.errors);
        }
      });
    } else if (currentStep === 'requirements') {
      form.trigger(['creditScore', 'incomeMultiplier', 'noEvictions', 'cleanHistory']).then(isValid => {
        if (isValid) {
          setCurrentStep(STEPS[currentIndex + 1]);
        } else {
          console.log('Form validation failed:', form.formState.errors);
        }
      });
    } else if (currentStep === 'additional_settings') {
      form.trigger(['petPolicy', 'leaseLength', 'securityDeposit']).then(isValid => {
        if (isValid) {
          setCurrentStep(STEPS[currentIndex + 1]);
        } else {
          console.log('Form validation failed:', form.formState.errors);
        }
      });
    } else if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  // Determine button text based on current step
  const getNextButtonText = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex === STEPS.length - 1) {
      return isEditMode ? 'Update Property' : 'Create Property';
    } else {
      return 'Continue';
    }
  };

  const onSubmit = async (data: PropertyFormValues) => {
    try {
      setLoading(isEditMode ? 'updateProperty' : 'createProperty', true);
      console.log('Submitting property data:', data);
      
      // Format data for API
      const propertyData = {
        landlordId: 0, // Will be set by the server based on the authenticated user
        name: data.name,
        type: data.type,
        address: `${data.address}${data.unit ? `, ${data.unit}` : ''}`,
        rent: parseInt(data.rent),
        bedrooms: 2, // Default values, could be added to the form
        bathrooms: 1, // Default values, could be added to the form
        description: data.description || '',
        available: true,
        parking: null,
        availableFrom: new Date(data.availableDate).toISOString(),
        screeningPageSlug: isEditMode ? undefined : `${data.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`,
        requirements: [
          {
            icon: 'credit-card',
            description: `Minimum credit score of ${data.creditScore}`
          },
          {
            icon: 'dollar-sign',
            description: `Income at least ${data.incomeMultiplier}x the monthly rent`
          },
          {
            icon: 'home',
            description: 'Clean rental history'
          }
        ],
        securityDeposit: parseInt(data.securityDeposit),
        petPolicy: data.petPolicy,
        petDeposit: data.petDeposit ? parseInt(data.petDeposit) : null,
        leaseLength: parseInt(data.leaseLength),
        viewCount: 0
      };

      // Create or update the property
      let response;
      try {
        if (isEditMode && propertyId) {
          // Update existing property
          response = await apiRequest('PATCH', `${API_ENDPOINTS.PROPERTIES.BASE}/${propertyId}`, propertyData);
        } else {
          // Create new property
          response = await apiRequest('POST', API_ENDPOINTS.PROPERTIES.CREATE, propertyData);
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || 
            `Failed to ${isEditMode ? 'update' : 'create'} property (Status: ${response.status})`
          );
        }
      } catch (error) {
        console.error('API error:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to save property data',
          variant: 'destructive',
        });
        return; // Exit early if property creation/update fails
      }
      
      // Get the property ID from the response
      let responseData;
      try {
        responseData = await response.json();
      } catch (error) {
        console.error('Error parsing response:', error);
        toast({
          title: 'Warning',
          description: 'Property saved but encountered an issue. Some features may not work correctly.',
          variant: 'destructive',
        });
        // Continue with the flow, but we might not have a valid property ID
      }
      
      const newPropertyId = responseData?.id || propertyId;
      
      // Save the property ID for the images and amenities step
      setCreatedPropertyId(newPropertyId);
      
      // If we don't have a valid property ID, we can't upload images or amenities
      if (!newPropertyId) {
        toast({
          title: 'Warning',
          description: 'Property created but could not get property ID. Images and amenities will not be saved.',
          variant: 'destructive',
        });
        
        // Still redirect to dashboard
        queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PROPERTIES.BASE] });
        setLocation(ROUTES.LANDLORD.DASHBOARD);
        return;
      }
      
      // Upload images if there are any
      let imageUploadErrors = 0;
      if (tempImages.length > 0 && newPropertyId) {
        toast({
          title: 'Uploading images',
          description: `Uploading ${tempImages.length} images...`,
        });
        
        for (const image of tempImages) {
          const formData = new FormData();
          formData.append('image', image);
          
          try {
            // Use FormData with apiRequest
            const imageResponse = await fetch(API_ENDPOINTS.PROPERTIES.IMAGES.UPLOAD(newPropertyId), {
              method: 'POST',
              body: formData,
              headers: {
                // Don't set Content-Type header when using FormData
                // Browser will set it automatically with the correct boundary
                ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
              }
            });
            
            if (!imageResponse.ok) {
              throw new Error(`Failed to upload image: ${imageResponse.statusText}`);
            }
            
            // Safely check the response
            try {
              const text = await imageResponse.text();
              if (text && text.trim()) {
                // Only try to parse if there's actual content
                JSON.parse(text);
              }
            } catch (parseError) {
              console.warn('Non-critical: Could not parse image upload response', parseError);
              // Continue anyway since the upload was successful
            }
          } catch (error) {
            console.error('Error uploading image:', error);
            imageUploadErrors++;
          }
        }
        
        if (imageUploadErrors > 0) {
          toast({
            title: 'Image upload issues',
            description: `${imageUploadErrors} images failed to upload. You can try again later from the edit page.`,
            variant: 'destructive',
          });
        } else if (tempImages.length > 0) {
          toast({
            title: 'Images uploaded',
            description: `Successfully uploaded ${tempImages.length} images`,
          });
        }
      }
      
      // Add amenities if there are any
      let amenityAddErrors = 0;
      if (tempAmenities.length > 0 && newPropertyId) {
        toast({
          title: 'Adding amenities',
          description: `Adding ${tempAmenities.length} amenities...`,
        });
        
        for (const amenity of tempAmenities) {
          try {
            const amenityResponse = await apiRequest(
              'POST', 
              API_ENDPOINTS.PROPERTIES.AMENITIES.CREATE(newPropertyId), 
              {
                amenityType: amenity.amenityType,
                description: amenity.description,
              }
            );
            
            if (!amenityResponse.ok) {
              throw new Error(`Failed to add amenity: ${amenityResponse.statusText}`);
            }
            
            // Safely check the response
            try {
              const text = await amenityResponse.text();
              if (text && text.trim()) {
                // Only try to parse if there's actual content
                JSON.parse(text);
              }
            } catch (parseError) {
              console.warn('Non-critical: Could not parse amenity add response', parseError);
              // Continue anyway since the addition was successful
            }
          } catch (error) {
            console.error('Error adding amenity:', error);
            amenityAddErrors++;
          }
        }
        
        if (amenityAddErrors > 0) {
          toast({
            title: 'Amenity addition issues',
            description: `${amenityAddErrors} amenities failed to add. You can try again later from the edit page.`,
            variant: 'destructive',
          });
        } else if (tempAmenities.length > 0) {
          toast({
            title: 'Amenities added',
            description: `Successfully added ${tempAmenities.length} amenities`,
          });
        }
      }
      
      // Show success message
      toast({
        title: isEditMode ? 'Property Updated' : MESSAGES.TOAST.PROPERTY.CREATE_SUCCESS.TITLE,
        description: isEditMode ? 'Your property has been updated successfully.' : MESSAGES.TOAST.PROPERTY.CREATE_SUCCESS.DESCRIPTION,
      });

      // Invalidate properties query to refresh the dashboard
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PROPERTIES.BASE] });

      // Redirect to the dashboard
      setLocation(ROUTES.LANDLORD.DASHBOARD);
    } catch (error) {
      console.error(isEditMode ? 'Error updating property:' : 'Error creating property:', error);
      
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : (isEditMode ? 'Failed to update property. Please try again.' : 'Failed to create property. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setLoading(isEditMode ? 'updateProperty' : 'createProperty', false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((stepId, index) => (
        <div key={stepId} className="flex items-center">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center
            ${currentStepIndex >= index ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
          `}>
            {index + 1}
          </div>
          {index < STEPS.length - 1 && (
            <div className={`w-16 h-1 ${currentStepIndex > index ? 'bg-blue-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-auto">
        <div className="p-6 border-b bg-white">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">{isEditMode ? 'Edit Property' : 'Add New Property'}</h2>
          </div>
          <p className="text-gray-500 mt-2">
            {isEditMode 
              ? 'Update your property details and requirements' 
              : 'Set up your property details and requirements to start receiving qualified RentCard applications'}
          </p>
        </div>
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <p className="text-sm">Enter property details and requirements</p>
              </div>
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <p className="text-sm">Customize your screening criteria</p>
              </div>
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <p className="text-sm">Get your unique screening page link</p>
              </div>
            </div>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="p-6">
              <StepIndicator />
              {stepComponents[currentStep]}
            </div>
            <div className="flex justify-between p-6 border-t bg-gray-50">
              {currentStepIndex > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousStep}
                >
                  Back
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation(ROUTES.LANDLORD.DASHBOARD)}
                >
                  Cancel
                </Button>
              )}
              
              {currentStepIndex < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={goToNextStep}
                  className="gap-2"
                >
                  {getNextButtonText()}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                  className="gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {getNextButtonText()}
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddProperty;