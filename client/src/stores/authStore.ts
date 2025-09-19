import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Drop-in replacement for legacy auth store that works with Replit Auth
// This provides the same interface but delegates to the new auth system

interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  userType?: 'tenant' | 'landlord';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  login: () => Promise<void>;
  register: () => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setUser: (user) => {
        set({ 
          user,
          isAuthenticated: !!user,
          error: null 
        }, false, 'auth/setUser');
      },

      setToken: (token) => {
        set({ token }, false, 'auth/setToken');
      },

      setError: (error) => set({ error }, false, 'auth/setError'),

      setLoading: (isLoading) => set({ isLoading }, false, 'auth/setLoading'),

      login: async () => {
        // Redirect to Replit Auth login
        window.location.href = '/api/login';
      },

      register: async () => {
        // Redirect to Replit Auth login (registration happens automatically)
        window.location.href = '/api/login';
      },

      logout: async () => {
        // Redirect to Replit Auth logout
        window.location.href = '/api/logout';
      },

      initialize: async () => {
        const { setLoading, setUser, setError } = get();
        
        try {
          setLoading(true);
          setError(null);
          
          const response = await fetch('/api/auth/user', {
            credentials: 'include'
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else if (response.status === 401) {
            // User not authenticated
            setUser(null);
          } else {
            throw new Error('Failed to fetch user');
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          setError(error instanceof Error ? error.message : 'Authentication failed');
          setUser(null);
        } finally {
          setLoading(false);
        }
      },
    }),
    { name: 'auth-store' }
  )
);