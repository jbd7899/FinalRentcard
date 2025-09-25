import { useState } from 'react';
import { User, Building2, DollarSign, Briefcase, MapPin, Mail, Phone, Star, Smartphone, QrCode, Send, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/shared/navbar';

interface DemoFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  maxRent: string;
  employer: string;
  jobTitle: string;
  monthlyIncome: string;
  creditScore: string;
}

type SharingScenario = 'text' | 'email' | 'qr' | null;

const initialFormData: DemoFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  city: '',
  state: '',
  maxRent: '',
  employer: '',
  jobTitle: '',
  monthlyIncome: '',
  creditScore: ''
};

export default function InteractiveDemo() {
  const [formData, setFormData] = useState<DemoFormData>(initialFormData);
  const [selectedScenario, setSelectedScenario] = useState<SharingScenario>(null);
  const [showScenarios, setShowScenarios] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'scenarios' | 'simulation'>('form');

  const handleInputChange = (field: keyof DemoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.firstName && formData.lastName && formData.email && formData.phone && 
                     formData.city && formData.state && formData.maxRent && formData.employer && 
                     formData.jobTitle && formData.monthlyIncome;

  const displayName = formData.firstName && formData.lastName 
    ? `${formData.firstName} ${formData.lastName}` 
    : 'Your Name';

  const displayLocation = formData.city && formData.state 
    ? `${formData.city}, ${formData.state}` 
    : 'Your Location';

  const displayMaxRent = formData.maxRent 
    ? `$${parseInt(formData.maxRent).toLocaleString()}/month` 
    : '$1,500/month';

  const displayIncome = formData.monthlyIncome 
    ? `$${parseInt(formData.monthlyIncome).toLocaleString()}/month` 
    : 'Monthly Income';

  const fillSampleData = () => {
    setFormData({
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 123-4567',
      city: 'Austin',
      state: 'TX',
      maxRent: '2500',
      employer: 'Tech Solutions Inc',
      jobTitle: 'Software Engineer',
      monthlyIncome: '6500',
      creditScore: '750'
    });
  };

  const RentCardPreview = () => (
    <Card className="bg-white shadow-xl border">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-5 h-5" />
          <span className="font-semibold">MyRentCard</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`font-bold text-lg ${displayName === 'Your Name' ? 'text-blue-200' : 'text-white'}`}>
              {displayName}
            </h3>
            <div className="flex items-center gap-1 text-blue-100">
              <MapPin className="w-3 h-3" />
              <span className="text-sm">{displayLocation}</span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Contact Info */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800 text-sm">Contact Information</h4>
          <div className="space-y-1 text-sm">
            <div className={`flex items-center gap-2 ${formData.email ? 'text-gray-700' : 'text-gray-400'}`}>
              <Mail className="w-3 h-3" />
              <span>{formData.email || 'Email address'}</span>
            </div>
            <div className={`flex items-center gap-2 ${formData.phone ? 'text-gray-700' : 'text-gray-400'}`}>
              <Phone className="w-3 h-3" />
              <span>{formData.phone || 'Phone number'}</span>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="font-medium text-gray-800 text-sm">Budget Range</span>
          </div>
          <div className={`text-lg font-bold ${formData.maxRent ? 'text-green-600' : 'text-gray-400'}`}>
            Up to {displayMaxRent}
          </div>
        </div>

        {/* Employment */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800 text-sm">Employment</h4>
          <div className="space-y-1">
            <div className={`flex items-center gap-2 ${formData.employer ? 'text-gray-700' : 'text-gray-400'}`}>
              <Briefcase className="w-3 h-3" />
              <span className="text-sm">{formData.employer || 'Current Employer'}</span>
            </div>
            <div className={`flex items-center gap-2 ${formData.jobTitle ? 'text-gray-700' : 'text-gray-400'}`}>
              <Star className="w-3 h-3" />
              <span className="text-sm">{formData.jobTitle || 'Job Title'}</span>
            </div>
            <div className={`text-lg font-bold ${formData.monthlyIncome ? 'text-green-600' : 'text-gray-400'}`}>
              {displayIncome}
            </div>
          </div>
        </div>

        {/* Credit Score */}
        {formData.creditScore && (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-green-600" />
              <span className="font-medium text-gray-800 text-sm">Credit Score</span>
            </div>
            <div className="text-lg font-bold text-green-600">
              {formData.creditScore}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const ScenarioSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose How to Share Your RentCard</h2>
        <p className="text-slate-600">See what happens from both your perspective and the landlord's</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <button
          onClick={() => setSelectedScenario('text')}
          className={`p-6 rounded-2xl border-2 text-left transition-all ${
            selectedScenario === 'text' 
              ? 'border-blue-600 bg-blue-50/70 shadow-lg' 
              : 'border-slate-200 bg-white hover:border-blue-300'
          }`}
          data-testid="scenario-text"
        >
          <div className="bg-blue-100 p-3 rounded-xl w-fit mb-3">
            <Smartphone className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Text RentCard</h3>
          <p className="text-sm text-slate-600">Send a quick text message with your RentCard link</p>
        </button>

        <button
          onClick={() => setSelectedScenario('email')}
          className={`p-6 rounded-2xl border-2 text-left transition-all ${
            selectedScenario === 'email' 
              ? 'border-emerald-600 bg-emerald-50/70 shadow-lg' 
              : 'border-slate-200 bg-white hover:border-emerald-300'
          }`}
          data-testid="scenario-email"
        >
          <div className="bg-emerald-100 p-3 rounded-xl w-fit mb-3">
            <Mail className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Email RentCard</h3>
          <p className="text-sm text-slate-600">Send a professional email with your profile details</p>
        </button>

        <button
          onClick={() => setSelectedScenario('qr')}
          className={`p-6 rounded-2xl border-2 text-left transition-all ${
            selectedScenario === 'qr' 
              ? 'border-purple-600 bg-purple-50/70 shadow-lg' 
              : 'border-slate-200 bg-white hover:border-purple-300'
          }`}
          data-testid="scenario-qr"
        >
          <div className="bg-purple-100 p-3 rounded-xl w-fit mb-3">
            <QrCode className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Scan QR Code</h3>
          <p className="text-sm text-slate-600">Scan a QR code on a "For Rent" sign</p>
        </button>
      </div>

      {selectedScenario && (
        <div className="text-center mt-8">
          <Button 
            onClick={() => setCurrentStep('simulation')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            data-testid="button-see-simulation"
          >
            See What Happens Next
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950/5">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute top-40 -left-32 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent">
              Interactive Demo
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-6">
            Build a RentCard and see exactly how it works when you share it with landlords
          </p>
          <Badge className="bg-blue-50 text-blue-700 px-4 py-2">
            <Clock className="h-4 w-4 mr-2" />
            Takes 2 minutes to complete
          </Badge>
        </div>

        {currentStep === 'form' && (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Form Section */}
            <Card className="shadow-xl bg-white/90">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Build Your RentCard</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fillSampleData}
                    data-testid="button-fill-sample"
                  >
                    Use Sample Data
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Personal Information</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Enter your first name"
                        data-testid="input-first-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Enter your last name"
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                        data-testid="input-email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                        data-testid="input-phone"
                      />
                    </div>
                  </div>
                </div>

                {/* Location & Budget */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Location & Budget</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Austin"
                        data-testid="input-city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                        <SelectTrigger data-testid="select-state">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TX">Texas</SelectItem>
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="NY">New York</SelectItem>
                          <SelectItem value="FL">Florida</SelectItem>
                          <SelectItem value="IL">Illinois</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="maxRent">Max Rent ($)</Label>
                      <Input
                        id="maxRent"
                        type="number"
                        value={formData.maxRent}
                        onChange={(e) => handleInputChange('maxRent', e.target.value)}
                        placeholder="2500"
                        data-testid="input-max-rent"
                      />
                    </div>
                  </div>
                </div>

                {/* Employment */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Employment</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="employer">Current Employer</Label>
                      <Input
                        id="employer"
                        value={formData.employer}
                        onChange={(e) => handleInputChange('employer', e.target.value)}
                        placeholder="Tech Solutions Inc"
                        data-testid="input-employer"
                      />
                    </div>
                    <div>
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={formData.jobTitle}
                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                        placeholder="Software Engineer"
                        data-testid="input-job-title"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="monthlyIncome">Monthly Income ($)</Label>
                      <Input
                        id="monthlyIncome"
                        type="number"
                        value={formData.monthlyIncome}
                        onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                        placeholder="6500"
                        data-testid="input-monthly-income"
                      />
                    </div>
                    <div>
                      <Label htmlFor="creditScore">Credit Score (Optional)</Label>
                      <Input
                        id="creditScore"
                        type="number"
                        value={formData.creditScore}
                        onChange={(e) => handleInputChange('creditScore', e.target.value)}
                        placeholder="750"
                        data-testid="input-credit-score"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setCurrentStep('scenarios')}
                  disabled={!isFormValid}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                  data-testid="button-continue-to-scenarios"
                >
                  Continue to Sharing Options
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Live Preview */}
            <div className="lg:sticky lg:top-8">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Live Preview</h3>
                <p className="text-slate-600">See your RentCard update as you type</p>
              </div>
              <RentCardPreview />
            </div>
          </div>
        )}

        {currentStep === 'scenarios' && (
          <div className="max-w-4xl mx-auto">
            <ScenarioSelection />
          </div>
        )}

        {currentStep === 'simulation' && selectedScenario && (
          <div className="max-w-6xl mx-auto">
            {/* Simulation will be implemented in the next task */}
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Simulation Coming Soon
              </h2>
              <p className="text-slate-600 mb-8">
                This will show the {selectedScenario} sharing experience from both perspectives
              </p>
              <Button 
                onClick={() => setCurrentStep('scenarios')}
                variant="outline"
              >
                Back to Scenarios
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}