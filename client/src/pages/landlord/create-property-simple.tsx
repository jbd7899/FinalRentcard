import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import {
  Building2,
  DollarSign,
  Calendar,
  MapPin,
  QrCode,
  Copy,
  Download,
  CheckCircle,
  Home,
  Plus,
  Settings,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import LandlordLayout from '@/components/layouts/LandlordLayout';

// Simplified schema - only 3 essential fields required
const simplePropertySchema = z.object({
  address: z.string().min(1, "Address is required"),
  rent: z.string().min(1, "Monthly rent is required"),
  availableDate: z.string().min(1, "Available date is required"),
  // Optional advanced fields
  propertyName: z.string().optional(),
  description: z.string().optional(),
  creditScore: z.string().optional(),
});

type SimplePropertyValues = z.infer<typeof simplePropertySchema>;

const CreatePropertySimple = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [createdProperty, setCreatedProperty] = useState<any>(null);
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);

  const form = useForm<SimplePropertyValues>({
    resolver: zodResolver(simplePropertySchema),
    defaultValues: {
      address: '',
      rent: '',
      availableDate: '',
      propertyName: '',
      description: '',
      creditScore: '650',
    },
  });

  // Watch address to auto-generate property name
  const addressValue = form.watch('address');

  const createPropertyMutation = useMutation({
    mutationFn: async (data: SimplePropertyValues) => {
      // Auto-generate smart defaults
      const propertyData = {
        name: data.propertyName || `Property at ${data.address}`,
        type: 'apartment', // Smart default
        address: data.address,
        rent: parseInt(data.rent),
        availableDate: data.availableDate,
        description: data.description || `Great rental opportunity at ${data.address}`,
        // Backend expects these specific fields for /api/landlord/properties
        bedrooms: 1, // Smart default
        bathrooms: 1, // Smart default  
        parking: null,
        availableFrom: data.availableDate,
        available: true,
        requirements: {
          creditScore: parseInt(data.creditScore || '650'),
          incomeMultiplier: 3,
          noEvictions: true,
          cleanHistory: true,
          petPolicy: 'case-by-case',
          leaseLength: '12 months',
          securityDeposit: parseInt(data.rent)
        },
      };

      const propertyResponse = await apiRequest('POST', '/api/landlord/properties', propertyData);
      const createdProperty = await propertyResponse.json();

      // Use PUBLIC screening route for QR codes (tenants must access without auth)
      // Format: /screening/property/property-{id} to match PropertyScreeningPage parser
      createdProperty.qrCodeUrl = `/screening/property/property-${createdProperty.id}`;
      createdProperty.shareableUrl = `${window.location.origin}/screening/property/property-${createdProperty.id}`;
      
      return createdProperty;
    },
    onSuccess: (data) => {
      toast({
        title: "🎉 Property & QR Created!",
        description: data.screeningPageSlug ? 
          "QR code generated and ready to share!" : 
          "QR code created with fallback URL",
      });
      setCreatedProperty(data);
      setQrCodeGenerated(true);
      queryClient.invalidateQueries({ queryKey: ['/api/landlord/properties'] });
    },
    onError: (error) => {
      console.error('Error creating property:', error);
      toast({
        title: "Error",
        description: "Failed to create property. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SimplePropertyValues) => {
    createPropertyMutation.mutate(data);
  };

  const handleCopyQRUrl = async () => {
    if (!createdProperty) return;
    
    const qrUrl = createdProperty.shareableUrl || `${window.location.origin}/screening/property/property-${createdProperty.id}`;
    
    try {
      await navigator.clipboard.writeText(qrUrl);
      toast({
        title: "✅ Link Copied!",
        description: "Share this link with potential tenants",
      });
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = 256;
        canvas.height = 256;
        ctx?.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${createdProperty.address}-qr-code.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        });
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const screeningUrl = createdProperty ? 
    (createdProperty.shareableUrl || `${window.location.origin}/screening/property/property-${createdProperty.id}`) : 
    '';

  // Success state - QR code generated
  if (qrCodeGenerated && createdProperty) {
    return (
      <LandlordLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-green-600 mb-2" data-testid="text-success-title">
                🎉 Property Created & QR Generated!
              </h1>
              <p className="text-gray-600">
                Your property is live and ready to share with potential tenants
              </p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  {createdProperty.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Address:</strong> {createdProperty.address}</p>
                  <p><strong>Monthly Rent:</strong> ${createdProperty.rent}</p>
                  <p><strong>Available:</strong> {createdProperty.availableDate}</p>
                </div>
              </CardContent>
            </Card>

            {/* Auto-Generated QR Code */}
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Your QR Code (Auto-Generated)
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Print this QR code on signs or share the link directly
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* QR Code Display */}
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                    <QRCodeSVG
                      id="qr-code-svg"
                      value={screeningUrl}
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={handleCopyQRUrl}
                    className="flex items-center gap-2"
                    data-testid="button-copy-qr-link"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleDownloadQR}
                    className="flex items-center gap-2"
                    data-testid="button-download-qr"
                  >
                    <Download className="w-4 h-4" />
                    Download QR
                  </Button>
                </div>

                {/* Direct Link */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <Label className="text-xs font-medium text-gray-700">Direct Link:</Label>
                  <p className="text-xs text-gray-600 break-all mt-1">{screeningUrl}</p>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <div className="mt-6 flex gap-3 justify-center">
              <Button 
                onClick={() => setLocation('/landlord/dashboard')}
                data-testid="button-view-properties"
              >
                View All Properties
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setCreatedProperty(null);
                  setQrCodeGenerated(false);
                  form.reset();
                }}
                data-testid="button-create-another"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Another
              </Button>
            </div>
          </div>
        </div>
      </LandlordLayout>
    );
  }

  // Creation form
  return (
    <LandlordLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
              Quick Property Setup
            </h1>
            <p className="text-gray-600">
              Enter 3 essential details and get your QR code instantly
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-blue-600">
              <QrCode className="w-4 h-4" />
              <span>QR code auto-generated upon creation</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Essential Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Address - Required */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Property Address
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="123 Main Street, City, State"
                            data-testid="input-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Rent - Required */}
                  <FormField
                    control={form.control}
                    name="rent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Monthly Rent
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <Input 
                              {...field}
                              type="number"
                              className="pl-9"
                              placeholder="1500"
                              data-testid="input-rent"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Available Date - Required */}
                  <FormField
                    control={form.control}
                    name="availableDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Available Date
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            type="date"
                            data-testid="input-available-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Optional Advanced Fields */}
              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    data-testid="button-toggle-advanced"
                  >
                    <Settings className="w-4 h-4" />
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Optional Details</CardTitle>
                      <p className="text-sm text-gray-600">Smart defaults will be used if left blank</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="propertyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Property Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder={addressValue ? `Property at ${addressValue}` : "Auto-generated from address"}
                                data-testid="input-property-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="Brief property description"
                                data-testid="input-description"
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
                            <FormLabel>Minimum Credit Score</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                type="number"
                                placeholder="650 (default)"
                                data-testid="input-credit-score"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                disabled={createPropertyMutation.isPending}
                data-testid="button-create-property"
              >
                {createPropertyMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Property & QR Code...
                  </>
                ) : (
                  <>
                    <Building2 className="w-5 h-5 mr-2" />
                    Create Property + Auto-Generate QR
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>All other details will use smart defaults and can be edited later</p>
          </div>
        </div>
      </div>
    </LandlordLayout>
  );
};

export default CreatePropertySimple;