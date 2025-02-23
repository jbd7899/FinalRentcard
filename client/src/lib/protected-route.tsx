import { ReactNode } from 'react';
import { Route, useLocation } from 'wouter';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/constants';

interface ProtectedRouteProps {
  component: React.ComponentType;
  path: string;
}

export function ProtectedRoute({ component: Component, path }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuthStore();

  return (
    <Route
      path={path}
      component={() => {
        if (isLoading) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          );
        }

        if (!isAuthenticated) {
          setLocation(ROUTES.AUTH);
          return null;
        }

        return <Component />;
      }}
    />
  );
}
