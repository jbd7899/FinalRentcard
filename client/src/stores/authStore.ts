import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User } from '@shared/schema';
import { queryClient } from "../lib/queryClient";

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  email: string;
  password: string;
  phone: string;
  userType: 'tenant' | 'landlord';
};

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
  login: (credentials: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
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
    persist(
      (set, get) => ({
        ...initialState,

        setUser: (user) => {
          queryClient.setQueryData(["/api/user"], user);
          set(
            { 
              user,
              isAuthenticated: !!user,
              error: null 
            },
            false,
            'auth/setUser'
          );
        },

        setToken: (token) => {
          if (token) {
            localStorage.setItem('token', token);
            queryClient.setQueryData(["token"], token);
          } else {
            localStorage.removeItem('token');
            queryClient.setQueryData(["token"], null);
          }
          set(
            { token },
            false,
            'auth/setToken'
          );
        },

        setError: (error) => set(
          { error },
          false,
          'auth/setError'
        ),

        setLoading: (isLoading) => set(
          { isLoading },
          false,
          'auth/setLoading'
        ),

        login: async (credentials: LoginData) => {
          const { setToken, setUser, setLoading, setError } = get();
          
          try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(credentials)
            });

            if (!response.ok) {
              throw new Error('Invalid credentials');
            }

            const { token, user } = await response.json();
            setToken(token);
            setUser(user);
            return user;
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Authentication failed';
            setError(message);
            throw error;
          } finally {
            setLoading(false);
          }
        },

        register: async (data: RegisterData) => {
          const { setToken, setUser, setLoading, setError } = get();
          
          try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            });

            if (!response.ok) {
              throw new Error('Registration failed');
            }

            const { token, user } = await response.json();
            setToken(token);
            setUser(user);
            return user;
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Registration failed';
            setError(message);
            throw error;
          } finally {
            setLoading(false);
          }
        },

        logout: async () => {
          const { setToken, setUser } = get();
          try {
            setToken(null);
            setUser(null);
            queryClient.setQueryData(["/api/user"], null);
            set(initialState, false, 'auth/logout');
          } catch (error) {
            console.error('Logout error:', error);
          }
        },

        initialize: async () => {
          const { setLoading, setError, setToken, setUser } = get();
          
          try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (token) {
              const response = await fetch('/api/user', {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });

              if (response.ok) {
                const userData = await response.json();
                setToken(token);
                setUser(userData);
              } else {
                // If token is invalid, clean up
                setToken(null);
                setUser(null);
              }
            }
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to initialize auth');
          } finally {
            setLoading(false);
          }
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ token: state.token }),
      }
    )
  )
); 