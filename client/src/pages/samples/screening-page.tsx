import React from 'react';
import { Building2, Info, Shield, ArrowRight, DollarSign, Star, Clock, CheckCircle, MapPin, Users, X, Bed, Bath, Car, CalendarDays, Share2, Phone, Mail } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useLocation } from 'wouter';

interface PropertyDetailsModalProps {
  onClose: () => void;
}

const PropertyDetailsModal = ({ onClose }: PropertyDetailsModalProps) => {
  const { modal } = useUIStore();
  
  if (!modal || modal.type !== 'propertyDetails') return null;

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

          <div className="bg-gray-100 h-64 rounded-lg mb-6 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <Building2 className="w-12 h-12 mx-auto mb-2" />
              <p>Property Photos</p>
            </div>
          </div>

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

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600">
              Beautiful 2-bedroom apartment in prime Santa Monica location. Recently renovated with modern 
              appliances and finishes. Bright and spacious with plenty of natural light. Walking distance 
              to beach, restaurants, and shopping.
            </p>
          </div>

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
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-transform hover:scale-105"
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
  const { openModal, closeModal, setLoading, loadingStates, addToast } = useUIStore();
  const [, setLocation] = useLocation();

  const handleViewPropertyDetails = () => {
    openModal('propertyDetails');
  };

  const handleClosePropertyDetails = () => {
    closeModal();
  };

  const handleShareRentCard = async () => {
    try {
      setLoading('shareRentCard', true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      addToast({
        title: 'RentCard Shared',
        description: 'Your RentCard has been shared successfully.',
        type: 'success'
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to share RentCard. Please try again.',
        type: 'destructive'
      });
    } finally {
      setLoading('shareRentCard', false);
    }
  };

  const handleCreateScreeningPage = () => {
    setLocation('/create-screening');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Demo Banner with Button */}
      <div className="max-w-4xl mx-auto mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold mb-2 flex items-center">
              <Info className="w-5 h-5 text-blue-600 mr-2" />
              Sample Landlord Screening Page
            </h1>
            <p className="text-gray-600">
              This is a free screening page demo for your rental business. Manage tenant inquiries as usual—our MyRentCard integration 
              helps you screen faster and connects tenants to a free profile tool, at no cost to you.
            </p>
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-transform hover:scale-105 w-full md:w-auto">
            Create My Free Pre-Screening Page
          </button>
        </div>
      </div>

      {/* Property Header with Landlord Info */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-4 text-white relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              {/* Landlord Info */}
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-semibold text-white">Oceanfront Rentals</h2>
                <div className="flex flex-col sm:flex-row sm:gap-4 text-blue-100 text-sm">
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>(555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>contact@oceanfrontrentals.com</span>
                  </div>
                </div>
              </div>
              {/* Property Info */}
              <div className="flex flex-col items-center md:flex-row md:items-center">
                <div className="bg-white rounded-lg p-4">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-0 md:ml-4 mt-4 md:mt-0 text-center md:text-left">
                  <h1 className="text-2xl font-bold text-white">123 Ocean Avenue, Unit 2B</h1>
                  <p className="text-blue-100">2 Bed • 2 Bath • $2,400/month</p>
                  <button 
                    className="mt-2 text-white hover:text-blue-200 font-medium flex items-center gap-1 mx-auto md:mx-0"
                    onClick={handleViewPropertyDetails}
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
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* RentCard Integration Section */}
          <div className="p-8 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-6 h-6 text-blue-600 fill-current" />
              <h2 className="text-2xl font-bold text-gray-800">Screen Tenants Instantly with RentCard</h2>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <p className="text-lg text-gray-700 mb-4">
                  Accept verified RentCards for seamless tenant screening—no extra work for you!
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-gray-700 justify-center md:justify-start">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span>Saves you time</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 justify-center md:justify-start">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span>Verified tenants</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <button 
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 shadow-lg transform hover:scale-105 transition-transform"
                  onClick={handleShareRentCard}
                  disabled={loadingStates.shareRentCard}
                >
                  <Share2 className="w-5 h-5" />
                  {loadingStates.shareRentCard ? 'Sharing...' : 'Share Your RentCard'}
                </button>
                <p className="text-sm text-gray-600 text-center">
                  No RentCard?{' '}
                  <button 
                    className="text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => openModal('createRentCard')}
                  >
                    Create Your RentCard
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Pre-Screening Form */}
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Quick Tenant Pre-Screening</h2>
            <p className="text-gray-600 mb-6">
              Collect tenant details to find your perfect match. This free tool works with your existing process—no changes required!
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-gray-800">Your Requirements:</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-gray-600">Minimum Income: $7,200/month</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-gray-600">Max Occupants: 4 people</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <p className="text-gray-600">Move-in: Available Now</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                <button 
                  onClick={() => openModal('quickPreScreening')}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2 transition-transform hover:scale-105"
                >
                  Submit Pre-Screening
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Free tenant screening tool • No cost to you • Integrates with your process
                </p>
              </div>
            </div>
          </div>

          {/* Trust Section */}
          <div className="bg-gray-50 p-6 text-center border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">★★★★★ "Effortless tenant screening!"</p>
            <p className="text-sm text-gray-600">A free tool to enhance your rental business</p>
          </div>

          {/* Last Updated Footer */}
          <div className="bg-gray-100 p-3 text-center text-sm text-gray-500">
            This Screening Page was last updated: October 25, 2024
          </div>
        </div>
      </div>

      <PropertyDetailsModal onClose={handleClosePropertyDetails} />
    </div>
  );
};

export default SampleScreeningPage;