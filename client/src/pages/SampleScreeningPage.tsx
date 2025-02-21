import { useState } from 'react';
import {
  Info,
  Shield,
  ArrowRight,
  DollarSign,
  Star,
  Clock,
  CheckCircle,
  MapPin,
  Building,
  Users,
  X,
  Bed,
  Bath,
  Car,
  CalendarDays
} from 'lucide-react';

const PropertyDetailsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">123 Ocean Avenue, Unit 2B</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Property Images */}
          <div className="bg-gray-100 h-64 rounded-lg mb-6 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <Building className="w-12 h-12 mx-auto mb-2" />
              <p>Property Photos</p>
            </div>
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Bed className="w-5 h-5 text-blue-600" />
              <span>2 Bedrooms</span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="w-5 h-5 text-blue-600" />
              <span>2 Bathrooms</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-600" />
              <span>1 Parking</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              <span>Available Now</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600">
              Beautiful 2-bedroom apartment in prime Santa Monica location. Recently renovated with modern 
              appliances and finishes. Bright and spacious with plenty of natural light. Walking distance 
              to beach, restaurants, and shopping.
            </p>
          </div>

          {/* Amenities */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Amenities</h3>
            <div className="grid grid-cols-2 gap-2 text-gray-600">
              <div>• In-unit Washer/Dryer</div>
              <div>• Central AC/Heat</div>
              <div>• Dishwasher</div>
              <div>• Balcony</div>
              <div>• Pool Access</div>
              <div>• Gym Access</div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="font-semibold mb-2">Location</h3>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-5 h-5" />
              <span>Santa Monica, CA 90405</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">$2,400/month</p>
              <p className="text-gray-600">First, last & security deposit required</p>
            </div>
            <button 
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SampleScreeningPage = () => {
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Demo Banner */}
      <div className="max-w-3xl mx-auto mb-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
          <Info className="w-5 h-5 text-amber-600" />
          <p className="text-amber-800">
            This is a demo page showing how your rental listing will appear to potential tenants.
            <span className="hidden sm:inline"> Customize all property details and requirements from your dashboard.</span>
          </p>
        </div>
      </div>

      {/* Property Header */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 rounded-lg p-4">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">123 Ocean Avenue, Unit 2B</h1>
                  <p className="text-gray-600">2 Bed • 2 Bath • $2,400/month</p>
                  <button 
                    className="mt-2 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    onClick={() => setShowPropertyDetails(true)}
                  >
                    View full property details
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Quick Interest Section */}
          <div className="p-8 border-b bg-blue-50">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-6 h-6 text-blue-600 fill-current" />
              <h2 className="text-2xl font-semibold">Express Interest with RentCard</h2>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex-1">
                <p className="text-lg text-gray-700 mb-4">Share your verified rental profile instantly - no forms needed</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span>Takes 30 seconds</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span>Privacy protected</span>
                  </div>
                </div>
              </div>
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 shadow-lg transform hover:scale-105 transition-transform">
                Share RentCard
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Basic Interest Form */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Pre-Screening Form</h2>
            <p className="text-gray-600 mb-6">
              Share basic details to check if this property matches your needs. 
              Not a full application - just helps us understand if it's a good fit.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Basic Requirements:</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-gray-600 mt-1" />
                    <div>
                      <p className="text-gray-600">Minimum Income: $7,200/month</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-600 mt-1" />
                    <div>
                      <p className="text-gray-600">Max Occupants: 4 people</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-600 mt-1" />
                    <div>
                      <p className="text-gray-600">Move-in: Available Now</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <button 
                  onClick={() => setShowInterestForm(true)}
                  className="w-full bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 flex items-center justify-center gap-2"
                >
                  Start Quick Pre-Screen
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-sm text-gray-500 mt-3 text-center">
                  30-second form • No credit check • No commitment
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Trust Section */}
          <div className="bg-gray-50 p-6 rounded-b-lg">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">★★★★★ "Super quick process!"</p>
              <p>Used by thousands of renters to find their perfect home</p>
            </div>
          </div>
        </div>
      </div>

      {/* Property Details Modal */}
      <PropertyDetailsModal 
        isOpen={showPropertyDetails}
        onClose={() => setShowPropertyDetails(false)}
      />
    </div>
  );
};

export default SampleScreeningPage;
