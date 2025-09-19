import { Building2, User, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/shared/navbar';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const { user } = useAuth();

  // If user is authenticated, redirect to their dashboard
  if (user) {
    const dashboardPath = user && 'userType' in user && user.userType === 'landlord' 
      ? '/landlord/dashboard' 
      : '/tenant/dashboard';
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
        <div className="relative z-10">
          <Navbar />
        </div>
        
        <main className="relative z-1 max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-6">Welcome back!</h1>
          <Link 
            href={dashboardPath}
            className="group bg-blue-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-blue-700 shadow-lg hover:shadow-xl inline-flex items-center gap-3 transition-all"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </main>
      </div>
    );
  }

  // For unauthenticated users, show role selection
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <div className="relative z-10">
        <Navbar />
      </div>

      <main className="relative z-1 max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-block bg-purple-100 text-purple-600 px-4 py-2 rounded-full shadow-md mb-6">
              <span className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Prequalification Network for Private Landlords</span>
              </span>
            </div>
            <h1 className="text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
                MyRentCard
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect tenants and private landlords who own 75% of rentals in America
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Tenant Card */}
            <Link href="/tenant" data-testid="card-tenant">
              <div className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-200 cursor-pointer">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">I'm Looking for a Place</h3>
                <p className="text-gray-600 mb-6">
                  Create your RentCard once and share with private landlords instantly. 
                  Skip application fees and get personal responses.
                </p>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:scale-105 transition-transform"
                  data-testid="button-get-started-tenant"
                >
                  Get Started as Tenant
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </Link>

            {/* Landlord Card */}
            <Link href="/landlord" data-testid="card-landlord">
              <div className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-green-200 cursor-pointer">
                <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">I Own/Manage Properties</h3>
                <p className="text-gray-600 mb-6">
                  Get qualified tenant interest with one-click submissions. 
                  Generate QR codes and compete with corporate efficiency.
                </p>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white group-hover:scale-105 transition-transform"
                  data-testid="button-get-started-landlord"
                >
                  Get Started as Landlord
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </Link>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Join the network that's standardizing prequalification for private rentals
            </p>
            <div className="flex justify-center gap-4 text-sm text-gray-500">
              <span>✓ No application fees</span>
              <span>✓ Personal relationships</span>
              <span>✓ 2-3x faster decisions</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}