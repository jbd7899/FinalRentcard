import { create } from 'zustand';
import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS } from '@/constants';
import { toast } from '@/hooks/use-toast';

export interface RecipientContact {
  id: number;
  tenantId: number;
  name: string;
  email: string;
  phone: string;
  company?: string;
  contactType: 'landlord' | 'property_manager' | 'real_estate_agent' | 'other';
  propertyAddress?: string;
  notes?: string;
  isFavorite: boolean;
  contactCount: number;
  lastContactedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ContactsState {
  contacts: RecipientContact[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchContacts: (options?: { category?: string; isFavorite?: boolean }) => Promise<void>;
  addContact: (contact: Omit<RecipientContact, 'id' | 'tenantId' | 'contactCount' | 'lastContactedAt' | 'createdAt' | 'updatedAt'>) => Promise<RecipientContact | null>;
  updateContact: (id: number, contact: Partial<RecipientContact>) => Promise<RecipientContact | null>;
  deleteContact: (id: number) => Promise<boolean>;
  getContactById: (id: number) => RecipientContact | undefined;
  getFavoriteContacts: () => RecipientContact[];
  getContactsByType: (contactType: string) => RecipientContact[];
}

export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: [],
  isLoading: false,
  error: null,
  
  fetchContacts: async (options = {}) => {
    set({ isLoading: true, error: null });
    try {
      let url = API_ENDPOINTS.TENANT_CONTACTS.LIST;
      const params = new URLSearchParams();
      
      if (options.category) {
        params.append('category', options.category);
      }
      
      if (options.isFavorite !== undefined) {
        params.append('isFavorite', String(options.isFavorite));
      }
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await apiRequest('GET', url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      
      const data = await response.json();
      set({ contacts: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching contacts:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  addContact: async (contact) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest('POST', API_ENDPOINTS.TENANT_CONTACTS.CREATE, contact);
      
      if (!response.ok) {
        throw new Error('Failed to add contact');
      }
      
      const newContact = await response.json();
      set(state => ({ 
        contacts: [...state.contacts, newContact].sort((a, b) => {
          // Sort by favorites first, then by name
          if (a.isFavorite !== b.isFavorite) {
            return a.isFavorite ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        }),
        isLoading: false 
      }));
      
      toast({
        title: 'Contact Added',
        description: `${newContact.name} has been added to your contacts.`,
      });
      
      return newContact;
    } catch (error) {
      console.error('Error adding contact:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add contact',
        variant: 'destructive',
      });
      
      return null;
    }
  },
  
  updateContact: async (id, contact) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest('PUT', API_ENDPOINTS.TENANT_CONTACTS.UPDATE(id), contact);
      
      if (!response.ok) {
        throw new Error('Failed to update contact');
      }
      
      const updatedContact = await response.json();
      set(state => ({ 
        contacts: state.contacts.map(c => 
          c.id === id ? updatedContact : c
        ).sort((a, b) => {
          // Sort by favorites first, then by name
          if (a.isFavorite !== b.isFavorite) {
            return a.isFavorite ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        }),
        isLoading: false 
      }));
      
      toast({
        title: 'Contact Updated',
        description: `${updatedContact.name} has been updated successfully.`,
      });
      
      return updatedContact;
    } catch (error) {
      console.error('Error updating contact:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update contact',
        variant: 'destructive',
      });
      
      return null;
    }
  },
  
  deleteContact: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest('DELETE', API_ENDPOINTS.TENANT_CONTACTS.DELETE(id));
      
      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }
      
      set(state => ({ 
        contacts: state.contacts.filter(c => c.id !== id),
        isLoading: false 
      }));
      
      toast({
        title: 'Contact Deleted',
        description: 'The contact has been deleted successfully.',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting contact:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete contact',
        variant: 'destructive',
      });
      
      return false;
    }
  },
  
  getContactById: (id) => {
    const state = get();
    return state.contacts.find(contact => contact.id === id);
  },
  
  getFavoriteContacts: () => {
    const state = get();
    return state.contacts.filter(contact => contact.isFavorite);
  },
  
  getContactsByType: (contactType) => {
    const state = get();
    return state.contacts.filter(contact => contact.contactType === contactType);
  },
}));