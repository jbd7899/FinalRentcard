import { ReactNode } from 'react';
import { Route, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { ROUTES } from '@/constants';

interface ProtectedRouteProps {
  component: React.ComponentType;
  path: string;
}

export function ProtectedRoute({ component: Component, path }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  return (
    <Route
      path={path}
      component={() => {
        // Redirect to login if not authenticated
        useEffect(() => {
          if (!isLoading && !isAuthenticated) {
            toast({
              title: "Unauthorized",
              description: "You are logged out. Logging in again...",
              variant: "destructive",
            });
            setTimeout(() => {
              setLocation(`/auth?mode=login`);
            }, 500);
          }
        }, [isAuthenticated, isLoading]);

        if (isLoading) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          );
        }

        if (!isAuthenticated) {
          return null;
        }

        return <Component />;
      }}
    />
  );
}
