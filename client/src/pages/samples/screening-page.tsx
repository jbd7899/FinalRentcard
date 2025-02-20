import React, { useState } from 'react';
import {
  Info,
  Shield,
  ArrowRight,
  DollarSign,
  Star,
  Lock,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Image,
  Building
} from 'lucide-react';

const SampleScreeningPage = () => {
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Demo Banner */}
      <div className="max-w-3xl mx-auto mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mr-2 mt-1" />
          <div>
            <h1 className="font-semibold mb-1">Sample Property Screening Page</h1>
            <p className="text-gray-600 text-sm">
              This is a demo showing how your screening page will be customized with your company branding 
              and property details. All branding and property information can be easily updated from your dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow">
        {/* Company Branding */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gray-200 rounded-lg p-4 mr-4">
                <Image className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500">Your Logo</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Oceanview Property Management</h2>
                <p className="text-gray-600">Professional Property Management Since 1995</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div className="flex items-center justify-end mb-1">
                <Phone className="w-4 h-4 mr-1" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center justify-end">
                <Mail className="w-4 h-4 mr-1" />
                <span>leasing@oceanview.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="p-6 border-b">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-4">
                <Building className="w-12 h-12 text-gray-400" />
                <span className="text-sm text-gray-500 ml-2">Property Photos</span>
              </div>
              <h2 className="text-xl font-semibold">The Oceanview Residences</h2>
              <div className="flex items-center text-gray-600 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span>123 Coastal Drive, Seaside CA 90210</span>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-3">Unit Details</h3>
              <div className="space-y-2 text-gray-600">
                <p>Unit Type: 2 Bed / 2 Bath</p>
                <p>Square Footage: 1,200 sq ft</p>
                <p>Rent: $2,800/month</p>
                <p>Available: March 2025</p>
                <p>Parking: 1 Assigned Space</p>
                <p>Pets: Cats Only (with deposit)</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <h3 className="font-medium mb-3">Property Requirements</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-blue-600 mr-2" />
                <span>Credit Score: 650+</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 text-blue-600 mr-2" />
                <span>Income: 3x Monthly Rent</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                <span>No Evictions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Option 1: RentCard */}
        <div className="p-6 border-b bg-blue-50">
          <div className="mb-4">
            <h3 className="font-medium mb-1">Option 1: Apply with RentCard (Recommended)</h3>
            <p className="text-sm text-gray-600">Send your verified rental profile instantly</p>
          </div>

          <button className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 flex items-center justify-center mb-3">
            <span>1-Click Submit with RentCard</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>

          <p className="text-sm text-center text-gray-600">
            Don't have a RentCard?{' '}
            <a href="/create-rentcard" className="text-blue-600 hover:underline">Create one now</a>
          </p>
        </div>

        {/* Option 2: Traditional */}
        <div className="p-6 border-b">
          <div className="mb-4">
            <h3 className="font-medium mb-1">Option 2: Traditional Application</h3>
            <p className="text-sm text-gray-600">Complete a standard rental application form</p>
          </div>

          <button 
            onClick={() => setShowApplicationForm(!showApplicationForm)}
            className="w-full border-2 border-gray-200 text-gray-700 p-3 rounded-lg hover:bg-gray-50 flex items-center justify-center"
          >
            Show Application Form
          </button>
        </div>

        {/* Security Info */}
        <div className="p-6">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-blue-600 mr-1" />
              <span>RentCard Verified</span>
            </div>
            <div className="flex items-center">
              <Lock className="w-4 h-4 text-blue-600 mr-1" />
              <span>256-bit SSL Encryption</span>
            </div>
            <div className="flex items-center">
              <Shield className="w-4 h-4 text-blue-600 mr-1" />
              <span>Privacy Protected</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 mt-4">
            Your information is secure and will only be shared with Oceanview Property Management
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-3xl mx-auto mt-6 text-center">
        <p className="text-gray-600 mb-4">Ready to create your own branded screening page?</p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Create Screening Page
        </button>
      </div>
    </div>
  );
};

export default SampleScreeningPage;
