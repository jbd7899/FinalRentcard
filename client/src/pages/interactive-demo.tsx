import { useState } from 'react';
import { User, Building2, DollarSign, Briefcase, MapPin, Mail, Phone, Star, Smartphone, QrCode, Send, ArrowRight, Clock, CheckCircle, ArrowLeft, Eye, Copy, ExternalLink, MessageSquare, Home } from 'lucide-react';
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

  const SimulationView = () => {
    const [simulationStep, setSimulationStep] = useState<'tenant' | 'landlord'>('tenant');
    
    const TextSimulation = () => (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Text Message Scenario</h2>
          <p className="text-slate-600">See how sharing your RentCard via text works</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setSimulationStep('tenant')}
              className={`px-4 py-2 rounded-md transition-all ${
                simulationStep === 'tenant' 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="h-4 w-4 mr-2 inline" />
              Your View
            </button>
            <button
              onClick={() => setSimulationStep('landlord')}
              className={`px-4 py-2 rounded-md transition-all ${
                simulationStep === 'landlord' 
                  ? 'bg-emerald-600 text-white shadow' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="h-4 w-4 mr-2 inline" />
              Landlord's View
            </button>
          </div>
        </div>

        {simulationStep === 'tenant' ? (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Phone Mockup */}
            <Card className="max-w-sm mx-auto">
              <CardContent className="p-0">
                {/* Phone Header */}
                <div className="bg-slate-900 text-white px-4 py-2 rounded-t-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span>9:41 AM</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-2 bg-white rounded-sm"></div>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
                
                {/* Messages Interface */}
                <div className="bg-slate-50 p-4 h-96 overflow-y-auto">
                  <div className="space-y-3">
                    <div className="flex justify-start">
                      <div className="bg-white p-3 rounded-2xl rounded-tl-md shadow-sm max-w-xs">
                        <p className="text-sm">Hi! I'm interested in your rental at 123 Oak Street. When would be a good time to schedule a viewing?</p>
                        <p className="text-xs text-slate-500 mt-1">2:14 PM</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-md shadow-sm max-w-xs">
                        <p className="text-sm">Sure! Can you tell me a bit about yourself first? Income, employment, etc?</p>
                        <p className="text-xs text-blue-100 mt-1">2:16 PM</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-start">
                      <div className="bg-white p-3 rounded-2xl rounded-tl-md shadow-sm max-w-xs">
                        <p className="text-sm">I have a RentCard with all my details! Check it out:</p>
                        <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <QrCode className="h-4 w-4 text-blue-600" />
                            <span className="text-xs text-blue-600 font-medium">myrentcard.com/r/{formData.firstName?.toLowerCase()}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">2:18 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Input Area */}
                <div className="border-t bg-white p-3 rounded-b-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full px-3 py-2">
                      <span className="text-sm text-slate-500">Type a message...</span>
                    </div>
                    <div className="bg-blue-600 p-2 rounded-full">
                      <Send className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900">Your Experience</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Quick Response</h4>
                    <p className="text-sm text-slate-600">Instead of typing out your details, just share your RentCard link</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Professional Impression</h4>
                    <p className="text-sm text-slate-600">Shows you're organized and serious about renting</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Copy className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Reusable</h4>
                    <p className="text-sm text-slate-600">Same link works for every landlord you contact</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Landlord Phone View */}
            <Card className="max-w-sm mx-auto">
              <CardContent className="p-0">
                {/* Phone Header */}
                <div className="bg-slate-900 text-white px-4 py-2 rounded-t-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span>9:43 AM</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-2 bg-white rounded-sm"></div>
                      <span>98%</span>
                    </div>
                  </div>
                </div>
                
                {/* Browser View */}
                <div className="bg-white">
                  <div className="bg-slate-100 px-3 py-2 border-b text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-slate-600">myrentcard.com/r/{formData.firstName?.toLowerCase()}</span>
                    </div>
                  </div>
                  <div className="p-3 h-80 overflow-y-auto">
                    <div className="min-h-full">
                      <RentCardPreview />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Landlord Benefits */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900">Landlord's Experience</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 p-2 rounded-full">
                    <Eye className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Instant Information</h4>
                    <p className="text-sm text-slate-600">All rental qualifications visible in one organized view</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Time Saver</h4>
                    <p className="text-sm text-slate-600">No back-and-forth requesting income docs, references, etc.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <Star className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Pre-Qualified</h4>
                    <p className="text-sm text-slate-600">Know if they meet your criteria before scheduling tours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );

    const EmailSimulation = () => (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Scenario</h2>
          <p className="text-slate-600">Professional email approach to sharing your RentCard</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setSimulationStep('tenant')}
              className={`px-4 py-2 rounded-md transition-all ${
                simulationStep === 'tenant' 
                  ? 'bg-emerald-600 text-white shadow' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="h-4 w-4 mr-2 inline" />
              Your Email
            </button>
            <button
              onClick={() => setSimulationStep('landlord')}
              className={`px-4 py-2 rounded-md transition-all ${
                simulationStep === 'landlord' 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="h-4 w-4 mr-2 inline" />
              What They Receive
            </button>
          </div>
        </div>

        {simulationStep === 'tenant' ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Compose Email</h3>
                    <p className="text-sm text-slate-600">to: landlord@property.com</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Subject</Label>
                    <div className="mt-1 p-2 bg-slate-50 rounded border text-sm">
                      Rental Interest - 123 Oak Street Apartment
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Message</Label>
                    <div className="mt-1 p-3 bg-slate-50 rounded border text-sm leading-relaxed">
                      <p>Dear Property Owner,</p>
                      <br />
                      <p>I'm very interested in renting your property at 123 Oak Street. I'm a working professional with steady income and excellent references.</p>
                      <br />
                      <p>I've attached my complete rental profile below with all the information you typically need:</p>
                      <br />
                      <div className="bg-white border-l-4 border-emerald-500 p-3 my-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-emerald-600" />
                          <span className="font-medium text-emerald-800">MyRentCard Profile</span>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">Complete rental qualification details</p>
                        <a href="#" className="text-emerald-600 text-sm font-medium hover:underline flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          View {displayName}'s RentCard
                        </a>
                      </div>
                      <p>I'm available for a viewing at your convenience. Please let me know what works best for your schedule.</p>
                      <br />
                      <p>Best regards,<br />{displayName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Landlord's Inbox
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-900">{displayName}</span>
                      <span className="text-xs text-slate-500">2 min ago</span>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">Rental Interest - 123 Oak Street Apartment</p>
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-blue-600">Contains RentCard link</span>
                    </div>
                  </div>
                  <div className="text-center py-4">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Full Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900">Why This Works</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Professional First Impression</h4>
                    <p className="text-sm text-slate-600">Email shows you're serious and organized</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 p-2 rounded-full">
                    <ExternalLink className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Easy Access</h4>
                    <p className="text-sm text-slate-600">Landlord clicks once to see all your qualifications</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <Star className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Stands Out</h4>
                    <p className="text-sm text-slate-600">Most applicants send messy document attachments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );

    const QRSimulation = () => (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">QR Code Scenario</h2>
          <p className="text-slate-600">Scan a "For Rent" sign and share your interest instantly</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setSimulationStep('tenant')}
              className={`px-4 py-2 rounded-md transition-all ${
                simulationStep === 'tenant' 
                  ? 'bg-purple-600 text-white shadow' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="h-4 w-4 mr-2 inline" />
              Scanning Experience
            </button>
            <button
              onClick={() => setSimulationStep('landlord')}
              className={`px-4 py-2 rounded-md transition-all ${
                simulationStep === 'landlord' 
                  ? 'bg-emerald-600 text-white shadow' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="h-4 w-4 mr-2 inline" />
              Landlord Gets Notified
            </button>
          </div>
        </div>

        {simulationStep === 'tenant' ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* QR Code and Sign Mockup */}
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6 text-center">
                <div className="bg-yellow-100 border-2 border-yellow-400 p-4 rounded-lg mb-4">
                  <h3 className="font-bold text-slate-900 mb-2">FOR RENT</h3>
                  <p className="text-sm text-slate-700 mb-3">2BR/2BA Apartment<br />$2,400/month</p>
                  <div className="bg-white p-3 rounded border">
                    <div className="w-24 h-24 mx-auto mb-2 bg-black" style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100' height='100' fill='%23000'/%3e%3crect x='10' y='10' width='80' height='80' fill='%23fff'/%3e%3crect x='20' y='20' width='60' height='60' fill='%23000'/%3e%3crect x='30' y='30' width='40' height='40' fill='%23fff'/%3e%3c/svg%3e")`,
                      backgroundSize: 'cover'
                    }}></div>
                    <p className="text-xs text-slate-600">Scan to express interest</p>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">Call (555) 123-4567</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-purple-600">
                    <Smartphone className="h-5 w-5" />
                    <span className="font-medium">Point camera at QR code</span>
                  </div>
                  <ArrowRight className="h-5 w-5 mx-auto text-slate-400" />
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-purple-900">Page opens in browser</p>
                    <p className="text-xs text-purple-700">Submit interest with your RentCard</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Process Steps */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900">Your Experience</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <span className="text-purple-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Scan QR Code</h4>
                    <p className="text-sm text-slate-600">Use your phone camera to scan the code on the sign</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <span className="text-purple-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Property Page Opens</h4>
                    <p className="text-sm text-slate-600">See property details and express interest button</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <span className="text-purple-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Share Your RentCard</h4>
                    <p className="text-sm text-slate-600">One-click to send your complete profile to the landlord</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Done!</h4>
                    <p className="text-sm text-slate-600">Landlord receives your interest with full qualifications</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Landlord Dashboard Mockup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                  Property Interest Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="font-medium text-slate-900">New Interest</span>
                      </div>
                      <span className="text-xs text-slate-500">Just now</span>
                    </div>
                    <p className="font-medium text-slate-900">{displayName}</p>
                    <p className="text-sm text-slate-600">123 Oak Street Apartment</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Income: {displayIncome}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Credit: {formData.creditScore || 'Good'}
                      </Badge>
                    </div>
                    <Button size="sm" className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits for Landlord */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900">Landlord Benefits</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 p-2 rounded-full">
                    <QrCode className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Passive Lead Collection</h4>
                    <p className="text-sm text-slate-600">QR codes work 24/7 without you being present</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Instant Qualification</h4>
                    <p className="text-sm text-slate-600">See income, employment, and credit details immediately</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <MessageSquare className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Organized Follow-up</h4>
                    <p className="text-sm text-slate-600">All interested tenants in one dashboard with context</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );

    return (
      <div className="space-y-8">
        {/* Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => setCurrentStep('scenarios')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Scenarios
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm text-slate-600">Live simulation</span>
          </div>
        </div>

        {/* Render appropriate simulation */}
        {selectedScenario === 'text' && <TextSimulation />}
        {selectedScenario === 'email' && <EmailSimulation />}
        {selectedScenario === 'qr' && <QRSimulation />}

        {/* Final CTA */}
        <div className="text-center pt-8 border-t">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Ready to create your own RentCard?</h3>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = '/quickstart/tenant'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
            >
              Create Your RentCard
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => setCurrentStep('form')}
            >
              Try Demo Again
            </Button>
          </div>
        </div>
      </div>
    );
  };

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
            <SimulationView />
          </div>
        )}
      </main>
    </div>
  );
}