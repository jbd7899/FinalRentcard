import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/stores/authStore";
import { useLocation } from "wouter";
import { ROUTES } from "@/constants/routes";

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoleSelectionModal({ isOpen, onClose }: RoleSelectionModalProps) {
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'landlord' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { initialize } = useAuthStore();
  const [, setLocation] = useLocation();

  const handleRoleSelect = (role: 'tenant' | 'landlord') => {
    setSelectedRole(role);
  };

  const handleSubmit = async () => {
    if (!selectedRole) {
      toast({
        title: "Please select a role",
        description: "You must choose whether you're a tenant or landlord to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest('PATCH', '/api/auth/user/role', {
        userType: selectedRole
      });

      if (response.ok) {
        toast({
          title: "Role selected successfully",
          description: `You're now set up as a ${selectedRole}.`,
        });
        
        // Invalidate the auth query to force refresh
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        
        // Refresh auth state to get updated user data
        await initialize();
        
        // Navigate to the appropriate dashboard
        if (selectedRole === 'tenant') {
          setLocation(ROUTES.TENANT.DASHBOARD);
        } else if (selectedRole === 'landlord') {
          setLocation(ROUTES.LANDLORD.DASHBOARD);
        }
        
        onClose();
      } else {
        throw new Error('Failed to update role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error updating role",
        description: "There was a problem saving your role selection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isSubmitting && onClose()}>
      <DialogContent className="max-w-2xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome! Choose your role</DialogTitle>
          <DialogDescription>
            To get started, please let us know how you'll be using MyRentCard.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedRole === 'tenant' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleRoleSelect('tenant')}
            data-testid="card-role-tenant"
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 p-3 rounded-full bg-blue-50 dark:bg-blue-900/20 w-16 h-16 flex items-center justify-center">
                <Home className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>I'm a Tenant</CardTitle>
              <CardDescription>
                Looking for rental properties and want to create a digital rent card
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Create and share your digital rent card</li>
                <li>• Apply to properties with one click</li>
                <li>• Track your application status</li>
                <li>• Store your rental documents securely</li>
              </ul>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedRole === 'landlord' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleRoleSelect('landlord')}
            data-testid="card-role-landlord"
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 p-3 rounded-full bg-green-50 dark:bg-green-900/20 w-16 h-16 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>I'm a Landlord</CardTitle>
              <CardDescription>
                Managing rental properties and screening potential tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• List your rental properties</li>
                <li>• Review tenant applications</li>
                <li>• Screen potential tenants efficiently</li>
                <li>• Manage property inquiries</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            onClick={handleSubmit}
            disabled={!selectedRole || isSubmitting}
            data-testid="button-confirm-role"
          >
            {isSubmitting ? "Setting up..." : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}