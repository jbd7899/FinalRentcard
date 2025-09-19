import { Building2, ArrowRight, Users, Shield, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navbar from '@/components/shared/navbar';

const AuthPage = () => {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <Building2 className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Welcome to MyRentCard
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Streamline your rental applications and connect with private landlords
            </p>
            <Button 
              size="lg" 
              onClick={handleLogin}
              className="text-lg px-8 py-3"
              data-testid="button-login"
            >
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="text-center">
              <CardHeader>
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>For Tenants</CardTitle>
                <CardDescription>
                  Create your digital rental application once, use it anywhere
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>✓ Digital rent cards</li>
                  <li>✓ Document management</li>
                  <li>✓ Application tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Building2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <CardTitle>For Landlords</CardTitle>
                <CardDescription>
                  Screen tenants efficiently and manage your properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>✓ Tenant screening</li>
                  <li>✓ Property management</li>
                  <li>✓ Application review</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Secure & Fast</CardTitle>
                <CardDescription>
                  Secure authentication and streamlined processes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>✓ Secure login</li>
                  <li>✓ Fast applications</li>
                  <li>✓ Real-time updates</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to get started?
            </h2>
            <p className="text-gray-600 mb-6">
              Join thousands of tenants and landlords using MyRentCard
            </p>
            <Button 
              size="lg" 
              onClick={handleLogin}
              className="text-lg px-8 py-3"
              data-testid="button-get-started"
            >
              Sign In to Continue <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;