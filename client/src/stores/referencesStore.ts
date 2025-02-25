import { create } from 'zustand';
import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS } from '@/constants';
import { toast } from '@/hooks/use-toast';

export interface TenantReference {
  id: number;
  tenantId: number;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  isVerified: boolean;
  verificationDate: string | null;
  notes: string | null;
}

interface ReferencesState {
  references: TenantReference[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchReferences: (tenantId: number) => Promise<void>;
  addReference: (reference: Omit<TenantReference, 'id' | 'isVerified' | 'verificationDate'>) => Promise<TenantReference | null>;
  updateReference: (id: number, reference: Partial<TenantReference>) => Promise<TenantReference | null>;
  deleteReference: (id: number) => Promise<boolean>;
  sendVerificationEmail: (id: number) => Promise<boolean>;
  verifyReference: (id: number) => Promise<TenantReference | null>;
}

export const useReferencesStore = create<ReferencesState>((set, get) => ({
  references: [],
  isLoading: false,
  error: null,
  
  fetchReferences: async (tenantId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest('GET', API_ENDPOINTS.TENANT_REFERENCES.LIST(tenantId));
      
      if (!response.ok) {
        throw new Error('Failed to fetch references');
      }
      
      const data = await response.json();
      set({ references: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching references:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  addReference: async (reference) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest('POST', API_ENDPOINTS.TENANT_REFERENCES.CREATE, reference);
      
      if (!response.ok) {
        throw new Error('Failed to add reference');
      }
      
      const newReference = await response.json();
      set(state => ({ 
        references: [...state.references, newReference],
        isLoading: false 
      }));
      
      toast({
        title: 'Reference Added',
        description: 'The reference has been added successfully.',
      });
      
      return newReference;
    } catch (error) {
      console.error('Error adding reference:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add reference',
        variant: 'destructive',
      });
      
      return null;
    }
  },
  
  updateReference: async (id, reference) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest('PUT', API_ENDPOINTS.TENANT_REFERENCES.UPDATE(id), reference);
      
      if (!response.ok) {
        throw new Error('Failed to update reference');
      }
      
      const updatedReference = await response.json();
      set(state => ({ 
        references: state.references.map(ref => ref.id === id ? updatedReference : ref),
        isLoading: false 
      }));
      
      toast({
        title: 'Reference Updated',
        description: 'The reference has been updated successfully.',
      });
      
      return updatedReference;
    } catch (error) {
      console.error('Error updating reference:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update reference',
        variant: 'destructive',
      });
      
      return null;
    }
  },
  
  deleteReference: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest('DELETE', API_ENDPOINTS.TENANT_REFERENCES.DELETE(id));
      
      if (!response.ok) {
        throw new Error('Failed to delete reference');
      }
      
      set(state => ({ 
        references: state.references.filter(ref => ref.id !== id),
        isLoading: false 
      }));
      
      toast({
        title: 'Reference Deleted',
        description: 'The reference has been deleted successfully.',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting reference:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete reference',
        variant: 'destructive',
      });
      
      return false;
    }
  },
  
  sendVerificationEmail: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest('POST', API_ENDPOINTS.TENANT_REFERENCES.SEND_VERIFICATION(id));
      
      if (!response.ok) {
        throw new Error('Failed to send verification email');
      }
      
      const data = await response.json();
      
      // Update the reference in the store
      if (data.reference) {
        set(state => ({ 
          references: state.references.map(ref => ref.id === id ? data.reference : ref),
          isLoading: false 
        }));
      } else {
        set({ isLoading: false });
      }
      
      toast({
        title: 'Verification Email Sent',
        description: 'The verification email has been sent successfully.',
      });
      
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send verification email',
        variant: 'destructive',
      });
      
      return false;
    }
  },
  
  verifyReference: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest('POST', API_ENDPOINTS.TENANT_REFERENCES.VERIFY(id));
      
      if (!response.ok) {
        throw new Error('Failed to verify reference');
      }
      
      const verifiedReference = await response.json();
      set(state => ({ 
        references: state.references.map(ref => ref.id === id ? verifiedReference : ref),
        isLoading: false 
      }));
      
      toast({
        title: 'Reference Verified',
        description: 'The reference has been verified successfully.',
      });
      
      return verifiedReference;
    } catch (error) {
      console.error('Error verifying reference:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to verify reference',
        variant: 'destructive',
      });
      
      return null;
    }
  },
})); 