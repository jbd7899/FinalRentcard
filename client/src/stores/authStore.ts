import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Simplified auth actions store - state management is handled by useAuth hook
// This store only provides redirect actions for login/register/logout

interface AuthActions {
  login: () => Promise<void>;
  register: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthActions>()(
  devtools(
    () => ({
      login: async () => {
        // Redirect to Replit Auth login
        window.location.href = '/auth?mode=login';
      },

      register: async () => {
        // Redirect to Replit Auth registration
        window.location.href = '/auth?mode=register';
      },

      logout: async () => {
        // Redirect to Replit Auth logout
        window.location.href = '/api/logout';
      },
    }),
    { name: 'auth-actions' }
  )
);