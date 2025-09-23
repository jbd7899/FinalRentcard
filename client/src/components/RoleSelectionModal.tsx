import { useCallback, useEffect, useRef, useState } from "react";
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
  storedRolePreference?: 'tenant' | 'landlord' | null;
}

const STORAGE_KEY = 'selectedRole';

const isValidRole = (role: unknown): role is 'tenant' | 'landlord' =>
  role === 'tenant' || role === 'landlord';

export function RoleSelectionModal({ isOpen, onClose, storedRolePreference }: RoleSelectionModalProps) {
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'landlord' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { initialize } = useAuthStore();
  const [, setLocation] = useLocation();
  const autoSubmitAttemptedRef = useRef(false);

  const handleRoleSelect = (role: 'tenant' | 'landlord') => {
    setSelectedRole(role);
  };

  const submitRole = useCallback(async (roleToSubmit: 'tenant' | 'landlord') => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest('PATCH', '/api/auth/user/role', {
        userType: roleToSubmit
      });

      if (response.ok) {
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(STORAGE_KEY);
          }
        } catch (storageError) {
          console.warn('Unable to clear stored role preference from localStorage', storageError);
        }

        toast({
          title: "Role selected successfully",
          description: `You're now set up as a ${roleToSubmit}.`,
        });

        // Invalidate the auth query to force refresh
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

        // Refresh auth state to get updated user data
        await initialize();

        // Navigate to the appropriate dashboard
        if (roleToSubmit === 'tenant') {
          setLocation(ROUTES.TENANT.DASHBOARD);
        } else if (roleToSubmit === 'landlord') {
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
  }, [initialize, onClose, setLocation, toast]);

  const handleSubmit = useCallback(() => {
    if (!selectedRole) {
      toast({
        title: "Please select a role",
        description: "You must choose whether you're a tenant or landlord to continue.",
        variant: "destructive",
      });
      return;
    }

    void submitRole(selectedRole);
  }, [selectedRole, submitRole, toast]);

  useEffect(() => {
    if (!isOpen) {
      autoSubmitAttemptedRef.current = false;
      return;
    }

    if (autoSubmitAttemptedRef.current) {
      return;
    }

    let storedRole: 'tenant' | 'landlord' | null = null;

    try {
      if (typeof window !== 'undefined') {
        const persistedRole = window.localStorage.getItem(STORAGE_KEY);
        if (isValidRole(persistedRole)) {
          storedRole = persistedRole;
        } else if (persistedRole) {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (storageError) {
      console.warn('Unable to access localStorage for stored role preference', storageError);
    }

    if (!storedRole && isValidRole(storedRolePreference)) {
      storedRole = storedRolePreference;
    }

    if (storedRole) {
      setSelectedRole(storedRole);
      autoSubmitAttemptedRef.current = true;
      void submitRole(storedRole);
    }
  }, [isOpen, storedRolePreference, submitRole]);

  return (
    <Dialog open={isOpen} onOpenChange={() => !isSubmitting && onClose()}>
      <DialogContent 
        className="max-w-2xl max-h-[95vh] flex flex-col" 
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Welcome! Choose your role</DialogTitle>
          <DialogDescription>
            To get started, please let us know how you'll be using MyRentCard.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedRole === 'tenant' ? 'ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'hover:ring-1 hover:ring-gray-300'
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
                <li>• Create and share your digital RentCard</li>
                <li>• Express interest with one link or QR code</li>
                <li>• Track landlord responses in one place</li>
                <li>• Store your rental documents securely</li>
              </ul>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedRole === 'landlord' ? 'ring-2 ring-green-600 bg-green-50 dark:bg-green-900/20' : 'hover:ring-1 hover:ring-gray-300'
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
                <li>• Review standardized RentCards</li>
                <li>• Screen potential tenants efficiently</li>
                <li>• Manage property inquiries</li>
              </ul>
            </CardContent>
          </Card>
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-4 border-t flex-shrink-0">
          <Button
            onClick={handleSubmit}
            disabled={!selectedRole || isSubmitting}
            size="lg"
            className="w-full sm:w-auto min-w-[200px]"
            data-testid="button-confirm-role"
          >
            {isSubmitting ? "Setting up..." : selectedRole ? `Continue as ${selectedRole}` : "Select a role above"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
