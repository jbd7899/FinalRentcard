import { useState } from 'react';
import { useLocation } from 'wouter';
import { Building2, User, ArrowRight } from 'lucide-react';
import Navbar from '@/components/shared/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function RoleSelectionPage() {
  const [, setLocation] = useLocation();
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'landlord' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleRoleSelection = async () => {
    if (!selectedRole) return;
    
    setIsSubmitting(true);
    try {
      await apiRequest('PATCH', '/api/auth/user/role', { userType: selectedRole });
      
      // Invalidate the auth query to force refresh user data
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

      toast({
        title: 'Role set successfully!',
        description: `Welcome to MyRentCard as a ${selectedRole}.`,
      });

      // Redirect to the appropriate dashboard
      setLocation(selectedRole === 'landlord' ? '/landlord/dashboard' : '/tenant/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to set your role. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user already has a role, redirect them
  if (user && user.userType) {
    setLocation(user.userType === 'landlord' ? '/landlord/dashboard' : '/tenant/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-16">
        <section className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Choose Your Role
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Select how you'll be using MyRentCard. You can switch between roles anytime from your dashboard.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card 
            className={`cursor-pointer transition-all duration-200 ${
              selectedRole === 'tenant' 
                ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]' 
                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
            }`}
            onClick={() => setSelectedRole('tenant')}
            data-testid="role-card-tenant"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-blue-700">
                <User className="w-6 h-6" />
                I'm a Tenant
              </CardTitle>
              <CardDescription>
                Looking for rental properties and want to streamline the application process.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm text-slate-600">
                <li>• Create and manage your rental profile</li>
                <li>• Share standardized prequalification information</li>
                <li>• Track application status with landlords</li>
                <li>• Upload and organize required documents</li>
              </ul>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-200 ${
              selectedRole === 'landlord' 
                ? 'border-green-500 bg-green-50 shadow-lg scale-[1.02]' 
                : 'border-gray-200 hover:border-green-300 hover:shadow-md'
            }`}
            onClick={() => setSelectedRole('landlord')}
            data-testid="role-card-landlord"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-700">
                <Building2 className="w-6 h-6" />
                I'm a Landlord
              </CardTitle>
              <CardDescription>
                Managing rental properties and need to review tenant applications efficiently.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm text-slate-600">
                <li>• Review standardized tenant profiles</li>
                <li>• Manage property listings and interest</li>
                <li>• Streamline tenant screening process</li>
                <li>• Verify documents and references</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            size="lg"
            disabled={!selectedRole || isSubmitting}
            onClick={handleRoleSelection}
            className="px-8"
            data-testid="button-continue"
          >
            {isSubmitting ? 'Setting up your account...' : 'Continue'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-sm text-slate-500 mt-4">
            Don't worry - you can change your role or add additional roles later from your dashboard.
          </p>
        </div>
      </main>
    </div>
  );
}