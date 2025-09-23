import React, { ReactNode, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { toast } from '@/hooks/use-toast';

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const { toasts, removeToast } = useUIStore();

  useEffect(() => {
    // Auth initialization is now handled by useAuth hook automatically

    // Listen for network state changes
    const updateOnlineStatus = () => {
      if (!navigator.onLine) {
        useUIStore.getState().addToast({
          title: 'Network Status',
          description: 'You are offline. Some features may be unavailable.',
          type: 'warning',
          duration: 0, // Don't auto-dismiss
        });
      } else {
        useUIStore.getState().addToast({
          title: 'Network Status',
          description: 'You are back online!',
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
  }, []);

  // Bridge between useUIStore toasts and the main toast system
  useEffect(() => {
    // When a new toast is added to the UIStore, also show it in the main toast system
    if (toasts.length > 0) {
      const latestToast = toasts[toasts.length - 1];
      
      // Show the toast in the main system
      toast({
        title: latestToast.title,
        description: latestToast.description,
        variant: latestToast.type,
      });
      
      // Remove the toast from UIStore after it's shown
      // This prevents duplicate toasts
      removeToast(latestToast.id);
    }
  }, [toasts, removeToast]);

  return <>{children}</>;
}; 