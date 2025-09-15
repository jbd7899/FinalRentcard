import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Plus, 
  Edit2, 
  Trash2, 
  Save,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import type { CommunicationTemplate } from '@shared/schema';

interface TemplateFormData {
  name: string;
  subject?: string;
  body: string;
  category: string;
  tags?: string[];
}

const CommunicationTemplates = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CommunicationTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    subject: '',
    body: '',
    category: 'general',
    tags: []
  });

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['/api/landlord/communication-templates'],
    queryFn: async () => {
      const response = await fetch('/api/landlord/communication-templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json() as CommunicationTemplate[];
    }
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: TemplateFormData) => {
      const response = await fetch('/api/landlord/communication-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });
      if (!response.ok) throw new Error('Failed to create template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/landlord/communication-templates'] });
      setShowCreateModal(false);
      resetForm();
      toast({
        title: "Success",
        description: "Template created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template.",
        variant: "destructive",
      });
    }
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: TemplateFormData }) => {
      const response = await fetch(`/api/landlord/communication-templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/landlord/communication-templates'] });
      setEditingTemplate(null);
      resetForm();
      toast({
        title: "Success",
        description: "Template updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update template.",
        variant: "destructive",
      });
    }
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/landlord/communication-templates/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete template');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/landlord/communication-templates'] });
      toast({
        title: "Success",
        description: "Template deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete template.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      body: '',
      category: 'general',
      tags: []
    });
  };

  const handleCreateTemplate = () => {
    if (!formData.name.trim() || !formData.body.trim()) {
      toast({
        title: "Error",
        description: "Please provide a name and body for the template.",
        variant: "destructive",
      });
      return;
    }
    createTemplateMutation.mutate(formData);
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate || !formData.name.trim() || !formData.body.trim()) {
      toast({
        title: "Error",
        description: "Please provide a name and body for the template.",
        variant: "destructive",
      });
      return;
    }
    updateTemplateMutation.mutate({ id: editingTemplate.id, data: formData });
  };

  const handleEditTemplate = (template: CommunicationTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject || '',
      body: template.body,
      category: template.category || 'general',
      tags: template.tags || []
    });
  };

  const handleDeleteTemplate = (id: number) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplateMutation.mutate(id);
    }
  };

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'application_followup', label: 'Application Follow-up' },
    { value: 'property_inquiry', label: 'Property Inquiry' },
    { value: 'scheduling', label: 'Scheduling' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'rejection', label: 'Application Rejection' },
    { value: 'approval', label: 'Application Approval' }
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'bg-gray-100 text-gray-800',
      application_followup: 'bg-blue-100 text-blue-800',
      property_inquiry: 'bg-green-100 text-green-800',
      scheduling: 'bg-purple-100 text-purple-800',
      documentation: 'bg-yellow-100 text-yellow-800',
      rejection: 'bg-red-100 text-red-800',
      approval: 'bg-emerald-100 text-emerald-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Communication Templates
          </CardTitle>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button 
                data-testid="button-create-template"
                size="sm"
                onClick={() => resetForm()}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Communication Template</DialogTitle>
                <DialogDescription>
                  Create a reusable template for tenant communications
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      data-testid="input-template-name"
                      id="template-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Initial Property Inquiry Response"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="template-category">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger data-testid="select-template-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="template-subject">Subject (for emails)</Label>
                  <Input
                    data-testid="input-template-subject"
                    id="template-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g., Thank you for your interest in our property"
                  />
                </div>
                
                <div>
                  <Label htmlFor="template-body">Message Body</Label>
                  <Textarea
                    data-testid="textarea-template-body"
                    id="template-body"
                    value={formData.body}
                    onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Template message content..."
                    rows={8}
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    data-testid="button-cancel-template"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    data-testid="button-save-template"
                    onClick={handleCreateTemplate}
                    disabled={createTemplateMutation.isPending}
                  >
                    {createTemplateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Template
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : templates.length > 0 ? (
          <div className="space-y-3">
            {templates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">{template.name}</span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getCategoryColor(template.category || 'general')}`}
                    >
                      {categories.find(c => c.value === template.category)?.label || 'General'}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      data-testid={`button-edit-template-${template.id}`}
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      data-testid={`button-delete-template-${template.id}`}
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTemplate(template.id)}
                      disabled={deleteTemplateMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {template.subject && (
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    Subject: {template.subject}
                  </div>
                )}
                
                <div className="text-sm text-gray-600 line-clamp-2">
                  {template.body}
                </div>
                
                {template.usageCount && (
                  <div className="text-xs text-gray-500 mt-2">
                    Used {template.usageCount} times
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No templates created yet</p>
            <p className="text-sm">Create your first template to get started</p>
          </div>
        )}
      </CardContent>
      
      {/* Edit Template Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Communication Template</DialogTitle>
            <DialogDescription>
              Update your communication template
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-template-name">Template Name</Label>
                <Input
                  data-testid="input-edit-template-name"
                  id="edit-template-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Initial Property Inquiry Response"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-template-category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger data-testid="select-edit-template-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-template-subject">Subject (for emails)</Label>
              <Input
                data-testid="input-edit-template-subject"
                id="edit-template-subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g., Thank you for your interest in our property"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-template-body">Message Body</Label>
              <Textarea
                data-testid="textarea-edit-template-body"
                id="edit-template-body"
                value={formData.body}
                onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Template message content..."
                rows={8}
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button
                data-testid="button-cancel-edit-template"
                variant="outline"
                onClick={() => setEditingTemplate(null)}
              >
                Cancel
              </Button>
              <Button
                data-testid="button-update-template"
                onClick={handleUpdateTemplate}
                disabled={updateTemplateMutation.isPending}
              >
                {updateTemplateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Template
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CommunicationTemplates;