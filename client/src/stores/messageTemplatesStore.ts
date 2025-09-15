import { create } from 'zustand';
import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS } from '@/constants';
import { toast } from '@/hooks/use-toast';

export interface TenantMessageTemplate {
  id: number;
  tenantId: number;
  templateName: string;
  subject: string;
  body: string;
  category: 'initial_inquiry' | 'follow_up' | 'application' | 'custom';
  variables: string[];
  isDefault: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface MessageTemplatesState {
  templates: TenantMessageTemplate[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchTemplates: (category?: string) => Promise<void>;
  addTemplate: (template: Omit<TenantMessageTemplate, 'id' | 'tenantId' | 'usageCount' | 'createdAt' | 'updatedAt'>) => Promise<TenantMessageTemplate | null>;
  updateTemplate: (id: number, template: Partial<TenantMessageTemplate>) => Promise<TenantMessageTemplate | null>;
  deleteTemplate: (id: number) => Promise<boolean>;
  getTemplateById: (id: number) => TenantMessageTemplate | undefined;
  getTemplatesByCategory: (category: string) => TenantMessageTemplate[];
  getDefaultTemplates: () => TenantMessageTemplate[];
  duplicateTemplate: (id: number, newName: string) => Promise<TenantMessageTemplate | null>;
}

export const useMessageTemplatesStore = create<MessageTemplatesState>((set, get) => ({
  templates: [],
  isLoading: false,
  error: null,
  
  fetchTemplates: async (category) => {
    set({ isLoading: true, error: null });
    try {
      let url = API_ENDPOINTS.TENANT_MESSAGE_TEMPLATES.LIST;
      if (category) {
        url += `?category=${encodeURIComponent(category)}`;
      }
      
      const response = await apiRequest('GET', url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch message templates');
      }
      
      const data = await response.json();
      set({ templates: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching message templates:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  addTemplate: async (template) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest('POST', API_ENDPOINTS.TENANT_MESSAGE_TEMPLATES.CREATE, template);
      
      if (!response.ok) {
        throw new Error('Failed to add message template');
      }
      
      const newTemplate = await response.json();
      set(state => ({ 
        templates: [...state.templates, newTemplate].sort((a, b) => {
          // Sort by default templates first, then by category, then by name
          if (a.isDefault !== b.isDefault) {
            return a.isDefault ? -1 : 1;
          }
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return a.templateName.localeCompare(b.templateName);
        }),
        isLoading: false 
      }));
      
      toast({
        title: 'Template Added',
        description: `"${newTemplate.templateName}" has been added to your templates.`,
      });
      
      return newTemplate;
    } catch (error) {
      console.error('Error adding message template:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add message template',
        variant: 'destructive',
      });
      
      return null;
    }
  },
  
  updateTemplate: async (id, template) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest('PUT', API_ENDPOINTS.TENANT_MESSAGE_TEMPLATES.UPDATE(id), template);
      
      if (!response.ok) {
        throw new Error('Failed to update message template');
      }
      
      const updatedTemplate = await response.json();
      set(state => ({ 
        templates: state.templates.map(t => 
          t.id === id ? updatedTemplate : t
        ).sort((a, b) => {
          // Sort by default templates first, then by category, then by name
          if (a.isDefault !== b.isDefault) {
            return a.isDefault ? -1 : 1;
          }
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return a.templateName.localeCompare(b.templateName);
        }),
        isLoading: false 
      }));
      
      toast({
        title: 'Template Updated',
        description: `"${updatedTemplate.templateName}" has been updated successfully.`,
      });
      
      return updatedTemplate;
    } catch (error) {
      console.error('Error updating message template:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update message template',
        variant: 'destructive',
      });
      
      return null;
    }
  },
  
  deleteTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest('DELETE', API_ENDPOINTS.TENANT_MESSAGE_TEMPLATES.DELETE(id));
      
      if (!response.ok) {
        throw new Error('Failed to delete message template');
      }
      
      set(state => ({ 
        templates: state.templates.filter(t => t.id !== id),
        isLoading: false 
      }));
      
      toast({
        title: 'Template Deleted',
        description: 'The message template has been deleted successfully.',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting message template:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete message template',
        variant: 'destructive',
      });
      
      return false;
    }
  },

  duplicateTemplate: async (id, newName) => {
    const originalTemplate = get().getTemplateById(id);
    if (!originalTemplate) {
      toast({
        title: 'Error',
        description: 'Template not found',
        variant: 'destructive',
      });
      return null;
    }

    return get().addTemplate({
      templateName: newName,
      subject: originalTemplate.subject,
      body: originalTemplate.body,
      category: originalTemplate.category,
      variables: originalTemplate.variables,
      isDefault: false, // Duplicated templates are never default
    });
  },
  
  getTemplateById: (id) => {
    const state = get();
    return state.templates.find(template => template.id === id);
  },
  
  getTemplatesByCategory: (category) => {
    const state = get();
    return state.templates.filter(template => template.category === category);
  },

  getDefaultTemplates: () => {
    const state = get();
    return state.templates.filter(template => template.isDefault);
  },
}));