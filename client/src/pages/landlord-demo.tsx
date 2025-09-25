import { useState } from 'react';
import { Building2, DollarSign, MapPin, Home, Users, QrCode, Send, ArrowRight, Clock, CheckCircle, ArrowLeft, Eye, Copy, ExternalLink, Bell, Calendar, Smartphone, Monitor, Mail, Star, Phone, User, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/shared/navbar';
import { Link } from 'wouter';

interface PropertyFormData {
  address: string;
  city: string;
  state: string;
  rent: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  propertyType: string;
  amenities: string[];
  description: string;
}

type LeadGenScenario = 'qr' | 'online' | 'direct' | null;

const initialPropertyData: PropertyFormData = {
  address: '',
  city: '',
  state: '',
  rent: '',
  bedrooms: '',
  bathrooms: '',
  sqft: '',
  propertyType: '',
  amenities: [],
  description: ''
};

const amenityOptions = [
  'Parking', 'Pet Friendly', 'Laundry', 'Gym/Fitness', 'Pool', 'Air Conditioning',
  'Balcony/Patio', 'Dishwasher', 'Walk-in Closet', 'Hardwood Floors'
];

export default function LandlordDemo() {
  const [propertyData, setPropertyData] = useState<PropertyFormData>(initialPropertyData);
  const [selectedScenario, setSelectedScenario] = useState<LeadGenScenario>(null);
  const [currentStep, setCurrentStep] = useState<'form' | 'scenarios' | 'simulation'>('form');

  const handleInputChange = (field: keyof PropertyFormData, value: string) => {
    setPropertyData(prev => ({ ...prev, [field]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setPropertyData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const isFormValid = propertyData.address && propertyData.city && propertyData.state && 
                     propertyData.rent && propertyData.bedrooms && propertyData.bathrooms && 
                     propertyData.propertyType;

  const displayAddress = propertyData.address && propertyData.city && propertyData.state
    ? `${propertyData.address}, ${propertyData.city}, ${propertyData.state}`
    : '123 Main Street, Austin, TX';

  const displayRent = propertyData.rent 
    ? `$${parseInt(propertyData.rent).toLocaleString()}/month` 
    : '$1,800/month';

  const displayBedBath = propertyData.bedrooms && propertyData.bathrooms
    ? `${propertyData.bedrooms} bed • ${propertyData.bathrooms} bath`
    : '2 bed • 2 bath';

  const fillSampleData = () => {
    setPropertyData({
      address: '456 Oak Street',
      city: 'Austin',
      state: 'TX',
      rent: '1800',
      bedrooms: '2',
      bathrooms: '2',
      sqft: '1200',
      propertyType: 'apartment',
      amenities: ['Parking', 'Pet Friendly', 'Laundry', 'Air Conditioning'],
      description: 'Beautiful 2-bedroom apartment in downtown Austin with modern amenities and great location near shops and restaurants.'
    });
  };

  const PropertyPreview = () => (
    <Card className="bg-white shadow-xl border">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-5 h-5" />
          <span className="font-semibold">MyRentCard Property</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">
              {displayRent}
            </h3>
            <div className="flex items-center gap-1 text-emerald-100">
              <MapPin className="w-3 h-3" />
              <span className="text-sm">{displayAddress}</span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Property Details */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800 text-sm">Property Details</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Home className="w-3 h-3" />
              <span>{displayBedBath}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Building2 className="w-3 h-3" />
              <span>{propertyData.propertyType || 'Property Type'}</span>
            </div>
            {propertyData.sqft && (
              <div className="flex items-center gap-2 text-gray-700">
                <span className="font-mono text-xs">{propertyData.sqft} sq ft</span>
              </div>
            )}
          </div>
        </div>

        {/* Amenities */}
        {propertyData.amenities.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800 text-sm">Amenities</h4>
            <div className="flex flex-wrap gap-1">
              {propertyData.amenities.slice(0, 4).map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {propertyData.amenities.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{propertyData.amenities.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800 text-sm">Description</h4>
          <p className="text-sm text-gray-600">
            {propertyData.description || 'Property description will appear here...'}
          </p>
        </div>

        {/* CTA for tenants */}
        <div className="pt-2 border-t">
          <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
            Express Interest
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (currentStep === 'form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Interactive Landlord Demo
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how MyRentCard helps you attract better tenants and save time with organized leads
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Property Builder Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Build Your Property Listing
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Create a professional property listing that attracts quality tenants
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={fillSampleData} 
                    variant="outline" 
                    className="w-full"
                    data-testid="button-sample-data"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Use Sample Property
                  </Button>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="address">Property Address</Label>
                      <Input
                        id="address"
                        value={propertyData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="123 Main Street"
                        data-testid="input-address"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={propertyData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="Austin"
                          data-testid="input-city"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={propertyData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          placeholder="TX"
                          data-testid="input-state"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rent">Monthly Rent ($)</Label>
                      <Input
                        id="rent"
                        type="number"
                        value={propertyData.rent}
                        onChange={(e) => handleInputChange('rent', e.target.value)}
                        placeholder="1800"
                        data-testid="input-rent"
                      />
                    </div>
                    <div>
                      <Label htmlFor="propertyType">Property Type</Label>
                      <Select onValueChange={(value) => handleInputChange('propertyType', value)} value={propertyData.propertyType}>
                        <SelectTrigger data-testid="select-property-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="condo">Condo</SelectItem>
                          <SelectItem value="townhouse">Townhouse</SelectItem>
                          <SelectItem value="duplex">Duplex</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <Select onValueChange={(value) => handleInputChange('bedrooms', value)} value={propertyData.bedrooms}>
                        <SelectTrigger data-testid="select-bedrooms">
                          <SelectValue placeholder="Beds" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Select onValueChange={(value) => handleInputChange('bathrooms', value)} value={propertyData.bathrooms}>
                        <SelectTrigger data-testid="select-bathrooms">
                          <SelectValue placeholder="Baths" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="1.5">1.5</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="2.5">2.5</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="3.5">3.5</SelectItem>
                          <SelectItem value="4">4+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sqft">Square Feet</Label>
                      <Input
                        id="sqft"
                        type="number"
                        value={propertyData.sqft}
                        onChange={(e) => handleInputChange('sqft', e.target.value)}
                        placeholder="1200"
                        data-testid="input-sqft"
                      />
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <Label>Amenities</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {amenityOptions.map((amenity) => (
                        <Button
                          key={amenity}
                          variant={propertyData.amenities.includes(amenity) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAmenityToggle(amenity)}
                          className="justify-start text-xs"
                          data-testid={`amenity-${amenity.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {amenity}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description">Property Description</Label>
                    <textarea
                      id="description"
                      value={propertyData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your property, neighborhood, and what makes it special..."
                      className="w-full p-3 border border-gray-200 rounded-md resize-none h-24 text-sm"
                      data-testid="textarea-description"
                    />
                  </div>

                  <Button
                    onClick={() => setCurrentStep('scenarios')}
                    disabled={!isFormValid}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    data-testid="button-continue-scenarios"
                  >
                    Continue to Lead Generation Options
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Live Preview */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Live Property Preview
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    See how your property appears to potential tenants
                  </p>
                </CardHeader>
                <CardContent>
                  <PropertyPreview />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-900">Why MyRentCard Works</h3>
                      <p className="text-sm text-emerald-700">Get better tenants, faster</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-emerald-800">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Tenants submit complete profiles upfront</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>No more back-and-forth requesting documents</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Professional tools like QR codes and analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Organized dashboard for all your leads</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'scenarios') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How do you want to attract tenants?
            </h1>
            <p className="text-lg text-gray-600">
              Choose a scenario to see how MyRentCard helps you get better leads
            </p>
          </div>

          {/* Property Summary */}
          <Card className="mb-8 border-emerald-200 bg-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Home className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-900">{displayRent}</h3>
                  <p className="text-sm text-emerald-700">{displayAddress}</p>
                  <p className="text-xs text-emerald-600">{displayBedBath}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep('form')}
                  className="text-emerald-700 hover:bg-emerald-100"
                  data-testid="button-edit-property"
                >
                  Edit Property
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Scenarios */}
          <div className="grid gap-6 mb-8">
            {/* QR Code Signs */}
            <Card 
              className={`cursor-pointer transition-all ${
                selectedScenario === 'qr' 
                  ? 'ring-2 ring-purple-500 bg-purple-50' 
                  : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedScenario('qr')}
              data-testid="scenario-qr"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedScenario === 'qr' 
                      ? 'bg-purple-100 text-purple-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Generate QR Codes for Signs</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Create professional "For Rent" signs with QR codes that let tenants instantly express interest
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        2 minute setup
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Free QR codes
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        No apps required
                      </span>
                    </div>
                  </div>
                  {selectedScenario === 'qr' && (
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Online Listings */}
            <Card 
              className={`cursor-pointer transition-all ${
                selectedScenario === 'online' 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedScenario('online')}
              data-testid="scenario-online"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedScenario === 'online' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Monitor className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Embed in Online Listings</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Add MyRentCard collection links to Craigslist, Facebook Marketplace, and other listing sites
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        30 second setup
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Works everywhere
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Better leads
                      </span>
                    </div>
                  </div>
                  {selectedScenario === 'online' && (
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Direct Sharing */}
            <Card 
              className={`cursor-pointer transition-all ${
                selectedScenario === 'direct' 
                  ? 'ring-2 ring-emerald-500 bg-emerald-50' 
                  : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedScenario('direct')}
              data-testid="scenario-direct"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedScenario === 'direct' 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Send className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Share Directly with Network</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Send property links to tenant networks, referral sources, and existing tenants who might know someone
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Instant sharing
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Personal touch
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Higher quality
                      </span>
                    </div>
                  </div>
                  {selectedScenario === 'direct' && (
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep('form')}
              data-testid="button-back-form"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Property
            </Button>
            <Button
              onClick={() => setCurrentStep('simulation')}
              disabled={!selectedScenario}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              data-testid="button-see-simulation"
            >
              See What Happens Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Simulation Step
  if (currentStep === 'simulation') {
    const QRSimulation = () => (
      <Tabs defaultValue="landlord" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="landlord">Your Setup</TabsTrigger>
          <TabsTrigger value="tenant">Tenant Experience</TabsTrigger>
        </TabsList>
        <TabsContent value="landlord" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Generate QR Code for Signs
              </CardTitle>
              <p className="text-sm text-gray-600">
                Create professional signage in 2 minutes
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code Generator Interface */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-medium mb-4">QR Code Generator</h4>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2">Property Link:</p>
                    <div className="flex items-center gap-2 p-2 bg-white border rounded text-xs font-mono">
                      <span className="text-gray-600">myrentcard.com/property/oak-street-austin</span>
                      <Copy className="w-4 h-4 text-gray-400 cursor-pointer" />
                    </div>
                    <Button size="sm" className="mt-3 bg-purple-600 hover:bg-purple-700">
                      Generate QR Code
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sign Templates */}
              <div>
                <h4 className="font-medium mb-4">Downloadable Sign Templates</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded p-4 text-center bg-white">
                    <div className="bg-red-600 text-white p-3 rounded mb-2">
                      <h5 className="font-bold">FOR RENT</h5>
                      <p className="text-xs">{displayBedBath}</p>
                      <p className="text-xs">{displayRent}</p>
                    </div>
                    <div className="w-16 h-16 bg-gray-200 mx-auto mb-2 flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-xs">Scan to Apply</p>
                  </div>
                  <div className="border rounded p-4 text-center bg-white">
                    <div className="bg-blue-600 text-white p-3 rounded mb-2">
                      <h5 className="font-bold">AVAILABLE NOW</h5>
                      <p className="text-xs">{displayAddress}</p>
                      <p className="text-xs">{displayRent}</p>
                    </div>
                    <div className="w-16 h-16 bg-gray-200 mx-auto mb-2 flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-xs">Express Interest</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-3">
                  Download All Templates
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tenant" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Tenant Scans Your Sign
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Phone Mockup */}
              <div className="max-w-sm mx-auto">
                <div className="bg-black rounded-3xl p-2 shadow-2xl">
                  <div className="bg-white rounded-2xl overflow-hidden">
                    <div className="bg-blue-600 p-4 text-white text-center">
                      <Smartphone className="w-6 h-6 mx-auto mb-2" />
                      <h4 className="font-medium text-sm">Camera detecting QR code...</h4>
                    </div>
                    <div className="p-6">
                      <PropertyPreview />
                      <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
                        Submit My RentCard
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600 mb-4">
                  Tenants scan your QR code with their phone camera and instantly see your property details
                </p>
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-emerald-900 mb-2">What happens next:</p>
                  <ul className="text-xs text-emerald-800 text-left space-y-1">
                    <li>• Tenant submits complete RentCard with income, employment, references</li>
                    <li>• You get organized notification in your landlord dashboard</li>
                    <li>• No phone calls asking for basic info - you have everything upfront</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    );

    const OnlineSimulation = () => (
      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="setup">Add to Listings</TabsTrigger>
          <TabsTrigger value="results">Tenant Response</TabsTrigger>
        </TabsList>
        <TabsContent value="setup" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Embed in Online Listings
              </CardTitle>
              <p className="text-sm text-gray-600">
                Add your property link to any listing site
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Craigslist Example */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Craigslist Listing Example
                </h4>
                <div className="bg-white border p-4 rounded text-sm">
                  <h5 className="font-bold text-blue-600 mb-2">{displayRent} - {displayBedBath} - {displayAddress}</h5>
                  <p className="text-gray-700 mb-3">{propertyData.description}</p>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
                    <p className="font-medium text-blue-900">Apply with MyRentCard:</p>
                    <p className="text-blue-700 underline text-sm">myrentcard.com/property/oak-street-austin</p>
                    <p className="text-xs text-blue-600 mt-1">
                      ✓ Submit complete rental application instantly
                      <br />✓ No back-and-forth - all info upfront
                    </p>
                  </div>
                </div>
              </div>

              {/* Copy-Paste Templates */}
              <div>
                <h4 className="font-medium mb-3">Ready-to-use Templates</h4>
                <div className="space-y-3">
                  <div className="bg-white border p-3 rounded">
                    <p className="text-xs font-medium text-gray-600 mb-2">Short Version:</p>
                    <p className="text-sm bg-gray-50 p-2 rounded font-mono">
                      Apply instantly: myrentcard.com/property/oak-street-austin
                    </p>
                  </div>
                  <div className="bg-white border p-3 rounded">
                    <p className="text-xs font-medium text-gray-600 mb-2">Detailed Version:</p>
                    <p className="text-sm bg-gray-50 p-2 rounded font-mono">
                      Skip the paperwork! Apply with your RentCard: myrentcard.com/property/oak-street-austin
                      ✓ Complete application in 2 minutes ✓ All documents included
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-3">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="results" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Higher Quality Responses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Before/After Comparison */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-3">❌ Without MyRentCard</h4>
                  <div className="space-y-2 text-sm text-red-800">
                    <p className="p-2 bg-red-100 rounded">"Is this still available?"</p>
                    <p className="p-2 bg-red-100 rounded">"What's the monthly rent?"</p>
                    <p className="p-2 bg-red-100 rounded">"Can I see it this weekend?"</p>
                    <p className="p-2 bg-red-100 rounded">"Do you allow pets?"</p>
                  </div>
                  <p className="text-xs text-red-700 mt-3 italic">
                    10+ messages before you know if they're qualified
                  </p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
                  <h4 className="font-medium text-emerald-900 mb-3">✅ With MyRentCard</h4>
                  <div className="bg-white border p-3 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium">Sarah Johnson submitted RentCard</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>💰 Income: $6,500/month (verified)</p>
                      <p>⭐ Credit Score: 750</p>
                      <p>🏢 Employment: Software Engineer, 2 years</p>
                      <p>📋 References: 2 previous landlords</p>
                      <p>📄 Documents: All attached and ready</p>
                    </div>
                    <Button size="sm" className="mt-3 bg-emerald-600 hover:bg-emerald-700">
                      Schedule Showing
                    </Button>
                  </div>
                  <p className="text-xs text-emerald-700 mt-3 italic">
                    Complete qualified application in first message
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    );

    const DirectSimulation = () => (
      <Tabs defaultValue="sharing" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sharing">Direct Sharing</TabsTrigger>
          <TabsTrigger value="dashboard">Your Dashboard</TabsTrigger>
        </TabsList>
        <TabsContent value="sharing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Share with Your Network
              </CardTitle>
              <p className="text-sm text-gray-600">
                Send property links to get referrals from your network
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Sharing */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email to Network
                </h4>
                <div className="bg-white border rounded overflow-hidden">
                  <div className="bg-gray-100 p-3 border-b">
                    <div className="text-xs space-y-1">
                      <p><span className="font-medium">To:</span> current-tenants@example.com, referral-sources@example.com</p>
                      <p><span className="font-medium">Subject:</span> Know anyone looking for a great rental?</p>
                    </div>
                  </div>
                  <div className="p-4 text-sm">
                    <p className="mb-3">Hi everyone,</p>
                    <p className="mb-3">I have a beautiful 2-bedroom apartment available at {displayAddress}. If you know anyone looking for a place, please share this link:</p>
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded">
                      <p className="font-medium text-emerald-900">{displayRent} - Available Now</p>
                      <p className="text-emerald-700 underline">myrentcard.com/property/oak-street-austin</p>
                      <p className="text-xs text-emerald-600 mt-1">They can apply instantly with their RentCard!</p>
                    </div>
                    <p className="mt-3">Thanks for helping me find great tenants!</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-3">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Email Template
                </Button>
              </div>

              {/* Text Message Sharing */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Text Message Example
                </h4>
                <div className="max-w-sm">
                  <div className="bg-blue-500 text-white p-3 rounded-2xl rounded-br-none mb-2">
                    <p className="text-sm">Hey! Know anyone looking for a 2-bed apartment in Austin? Great place, {displayRent}/month. They can apply instantly: myrentcard.com/property/oak-street-austin</p>
                  </div>
                  <p className="text-xs text-gray-500">Sent to 5 contacts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="dashboard" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Organized Lead Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Dashboard Mockup */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-4">Your Landlord Dashboard</h4>
                <div className="space-y-3">
                  {/* Recent Applications */}
                  <div className="bg-white border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-sm">Recent Applications</h5>
                      <Badge className="bg-emerald-100 text-emerald-800">3 new today</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2 bg-blue-50 rounded">
                        <User className="w-4 h-4 text-blue-600" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Sarah Johnson</p>
                          <p className="text-xs text-gray-600">$6,500/month income • Credit 750 • 2 references</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">2 min ago</Badge>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <User className="w-4 h-4 text-gray-600" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Mike Chen</p>
                          <p className="text-xs text-gray-600">$5,200/month income • Credit 720 • 1 reference</p>
                        </div>
                        <Badge variant="outline">15 min ago</Badge>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <User className="w-4 h-4 text-gray-600" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Lisa Rodriguez</p>
                          <p className="text-xs text-gray-600">$4,800/month income • Credit 680 • 3 references</p>
                        </div>
                        <Badge variant="outline">1 hour ago</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Property Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white border rounded p-3 text-center">
                      <p className="text-2xl font-bold text-emerald-600">12</p>
                      <p className="text-xs text-gray-600">Total Views</p>
                    </div>
                    <div className="bg-white border rounded p-3 text-center">
                      <p className="text-2xl font-bold text-blue-600">3</p>
                      <p className="text-xs text-gray-600">Applications</p>
                    </div>
                    <div className="bg-white border rounded p-3 text-center">
                      <p className="text-2xl font-bold text-purple-600">25%</p>
                      <p className="text-xs text-gray-600">Conversion</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              See How It Works
            </h1>
            <p className="text-lg text-gray-600">
              {selectedScenario === 'qr' && 'QR codes make it easy for tenants to apply from your property signs'}
              {selectedScenario === 'online' && 'Get better responses from your online listings'}
              {selectedScenario === 'direct' && 'Leverage your network to find quality tenants'}
            </p>
          </div>

          {/* Property Summary */}
          <Card className="mb-8 border-emerald-200 bg-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Home className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-900">{displayRent}</h3>
                  <p className="text-sm text-emerald-700">{displayAddress}</p>
                  <p className="text-xs text-emerald-600">{displayBedBath}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Simulation Content */}
          <div className="mb-8">
            {selectedScenario === 'qr' && <QRSimulation />}
            {selectedScenario === 'online' && <OnlineSimulation />}
            {selectedScenario === 'direct' && <DirectSimulation />}
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep('scenarios')}
              data-testid="button-back-scenarios"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Scenarios
            </Button>
            <div className="flex-1" />
            <Link 
              href="/quickstart/landlord"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-3 font-semibold transition-all shadow-lg"
              data-testid="button-add-property"
            >
              Add Your Property
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Value Proposition Footer */}
          <Card className="mt-8 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold text-emerald-900 mb-2">
                Ready to get better tenants with less work?
              </h3>
              <p className="text-emerald-700 mb-4">
                Join landlords who are saving hours per application and getting complete tenant information upfront
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-emerald-800">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Save 5+ hours per tenant
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Get complete applications
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Find better tenants
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}