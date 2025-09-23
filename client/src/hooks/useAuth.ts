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
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
        });

        if (response.status === 401) {
          // User not authenticated, return null instead of throwing error
          return null;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch user: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Auth fetch error:', error);
        throw error;
      }
    },
    retry: false,
    staleTime: 30 * 1000, // 30 seconds to reduce auth check frequency
    refetchOnWindowFocus: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: user !== null && user !== undefined,
  };
}