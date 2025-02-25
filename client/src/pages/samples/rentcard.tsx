import React from 'react';
import {
  Star,
  CheckCircle,
  Building2,
  DollarSign,
  Briefcase,
  Users,
  Heart,
  Info,
  User,
  Share2,
  MessageSquare
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { FeedbackToast } from '@/components/ui/FeedbackToast';
import type { ReactNode } from 'react';
import { useLocation } from 'wouter';

// Update the Toast type to allow ReactNode in description
type Toast = {
  title: string;
  description?: ReactNode;
  type: 'default' | 'destructive' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
};

const SampleRentCard = () => {
  const { setLoading, loadingStates, addToast } = useUIStore();
  const [, setLocation] = useLocation();

  // Static dummy data for quick stats
  const quickStats = [
    { icon: <DollarSign className="w-6 h-6 text-blue-600 mr-2" />, title: "Income", value: "$85,000/year" },
    { icon: <Briefcase className="w-6 h-6 text-blue-600 mr-2" />, title: "Employment", value: "Full-time (3+ years)" },
    { icon: <Users className="w-6 h-6 text-blue-600 mr-2" />, title: "Occupants", value: "2 Adults" },
    { icon: <Heart className="w-6 h-6 text-blue-600 mr-2" />, title: "Pets", value: "1 Cat (5 years)" },
  ];

  // Static dummy data for rental history
  const rentalHistory = [
    { name: "The Parkview Apartments", dates: "Jan 2023 - Present", details: "Rent: $2,200/month • No late payments" },
    { name: "Riverfront Residences", dates: "Mar 2020 - Dec 2022", details: "Rent: $1,950/month • No late payments" },
  ];

  // Static dummy data for landlord references
  const landlordReferences = [
    {
      name: "John Smith",
      contact: "john@example.com",
      period: "Jan 2020 - Dec 2022",
      comment: "Sarah was an excellent tenant, always paid on time and took great care of the property.",
      rating: 5,
    },
    {
      name: "Jane Doe",
      contact: "jane@example.com",
      period: "Mar 2018 - Dec 2019",
      comment: "Reliable tenant with great communication. Would rent to again.",
      rating: 5,
    },
  ];

  const handleCreateRentCard = () => {
    setLocation('/create-rentcard');
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

      // Show feedback prompt after a short delay
      setTimeout(() => {
        addToast({
          title: 'Quick Feedback',
          description: <FeedbackToast 
            interaction="share_rentcard"
            onSubmit={async (rating) => {
              // Here you can send the feedback to your API
              console.log('Feedback submitted:', {
                interaction: 'share_rentcard',
                rating,
                timestamp: new Date().toISOString()
              });
            }}
          />,
          type: 'default',
          duration: 10000, // Give users more time to rate
        });
      }, 1000);
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Original Top Bar */}
      <div className="max-w-4xl mx-auto mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
        <h1 className="text-xl font-semibold mb-2 flex items-center">
          <Info className="w-5 h-5 text-blue-600 mr-2" />
          Sample RentCard Preview
        </h1>
        <p className="text-gray-600 mb-4">
          This is a demo RentCard showing how your rental profile will look to landlords. 
          Create your own RentCard in minutes and share it instantly with any property.
        </p>
        <div className="flex gap-4">
          <button 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-transform hover:scale-105"
            onClick={handleCreateRentCard}
            disabled={loadingStates.createRentCard}
          >
            {loadingStates.createRentCard ? 'Creating...' : 'Create My RentCard'}
          </button>
          <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors">
            Learn More
          </button>
        </div>
      </div>

      {/* Enhanced RentCard */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with Logo and Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-4 sm:p-6 lg:p-8 text-white relative">
          {/* Share Button */}
          <button 
            className="absolute top-4 right-4 bg-white text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors z-10"
            onClick={handleShareRentCard}
            disabled={loadingStates.shareRentCard}
          >
            <Share2 className={`w-5 h-5 ${loadingStates.shareRentCard ? 'animate-spin' : ''}`} />
          </button>

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
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Sarah Anderson</h2>
                  <p className="text-blue-100">Preferred Move-in: March 2025</p>
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
                    <span className="text-xl font-bold text-white">4.9</span>
                    <span className="text-blue-100 whitespace-nowrap">Profile Completeness</span>
                  </div>
                  <p className="text-sm text-blue-100 mt-1">Last updated: October 25, 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-8 bg-gray-50">
          <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-800">
            Key Information
            <span
              className="ml-2 cursor-help"
              title="These key stats provide a quick overview of your rental profile for landlords."
            >
              <Info className="w-4 h-4 text-gray-500" />
            </span>
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center mb-2">
                  {stat.icon}
                  <span className="font-medium text-gray-700">{stat.title}</span>
                </div>
                <p className="text-gray-600">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* About Me */}
        <div className="p-8 border-t border-gray-200">
          <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-800">
            About Me
            <span
              className="ml-2 cursor-help"
              title="A personal bio helps landlords get to know you better."
            >
              <Info className="w-4 h-4 text-gray-500" />
            </span>
          </h3>
          <p className="text-gray-600 leading-relaxed">
            I'm a software engineer at TechCorp with a passion for technology and community. 
            Looking for a quiet, well-maintained apartment where I can work from home occasionally. 
            I'm a non-smoker, no parties, and I always pay rent on time.
          </p>
        </div>

        {/* Rental History */}
        <div className="p-8 bg-gray-50 border-t border-gray-200">
          <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-800">
            Rental History
            <span
              className="ml-2 cursor-help"
              title="Your rental history demonstrates your experience and reliability as a tenant."
            >
              <Info className="w-4 h-4 text-gray-500" />
            </span>
          </h3>
          <div className="space-y-6">
            {rentalHistory.map((history, index) => (
              <div key={index} className="flex items-start pb-4 border-b last:border-b-0">
                <Building2 className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                <div>
                  <p className="font-medium text-gray-800">{history.name}</p>
                  <p className="text-gray-600">{history.dates}</p>
                  <p className="text-sm text-gray-500">{history.details}</p>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Reference Verified</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Landlord References */}
        <div className="p-8 border-t border-gray-200">
          <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-800">
            Previous Landlord References
            <span
              className="ml-2 cursor-help"
              title="Verified landlord references demonstrate your reliability and help build trust with potential landlords."
            >
              <Info className="w-4 h-4 text-gray-500" />
            </span>
          </h3>
          <div className="space-y-6">
            {landlordReferences.map((ref, index) => (
              <div key={index} className="flex items-start pb-4 border-b last:border-b-0">
                <MessageSquare className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                <div>
                  <p className="font-medium text-gray-800">{ref.name}</p>
                  <p className="text-gray-600">{ref.contact}</p>
                  <p className="text-gray-600">Rental Period: {ref.period}</p>
                  <p className="text-gray-600 mt-2 italic">"{ref.comment}"</p>
                  <div className="flex items-center mt-2">
                    {[...Array(ref.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">Landlord Rating</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Reference Verified</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pre-Qualification Details */}
        <div className="p-8 bg-gray-50 border-t border-gray-200">
          <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-800">
            Pre-Qualification Details
            <span
              className="ml-2 cursor-help"
              title="Pre-qualification details help landlords assess your financial stability quickly."
            >
              <Info className="w-4 h-4 text-gray-500" />
            </span>
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Credit Score Range</h4>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-gray-700">720-750</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Background Check</h4>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-gray-700">Clear</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shareability Section */}
        <div className="p-8 bg-blue-50 border-t border-blue-100 text-center">
          <h3 className="text-xl font-semibold text-blue-800 mb-2">Share Your RentCard Easily</h3>
          <p className="text-gray-600 mb-4">
            With just one click, share your RentCard with any landlord or property manager. 
            No more paperwork, no more hassle.
          </p>
          <button 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-transform hover:scale-105 inline-flex items-center gap-2"
            onClick={handleShareRentCard}
            disabled={loadingStates.shareRentCard}
          >
            <Share2 className="w-5 h-5" />
            {loadingStates.shareRentCard ? 'Sharing RentCard...' : 'Share RentCard Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SampleRentCard;