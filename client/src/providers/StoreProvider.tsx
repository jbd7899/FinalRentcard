import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const initialize = useAuthStore((state) => state.initialize);
  const setLoading = useUIStore((state) => state.setLoading);

  useEffect(() => {
    // Initialize auth state
    initialize().catch((error) => {
      console.error('Failed to initialize auth:', error);
    });

    // Listen for network state changes
    const updateOnlineStatus = () => {
      if (!navigator.onLine) {
        useUIStore.getState().addNotification({
          message: 'You are offline. Some features may be unavailable.',
          type: 'warning',
          duration: 0, // Don't auto-dismiss
        });
      } else {
        useUIStore.getState().addNotification({
          message: 'You are back online!',
          type: 'success',
          duration: 3000,
        });
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [initialize]);

  return <>{children}</>;
} 