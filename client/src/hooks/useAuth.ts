import { useQuery } from "@tanstack/react-query";

// User type matching the API response structure
interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  userType?: 'tenant' | 'landlord';
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
  profiles?: {
    tenant: any;
    landlord: any;
  };
  requiresSetup?: boolean;
  availableRoles?: {
    tenant: boolean;
    landlord: boolean;
  };
  pendingRoleSelection?: 'tenant' | 'landlord' | null;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}