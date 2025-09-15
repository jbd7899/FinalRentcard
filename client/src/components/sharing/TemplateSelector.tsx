import { useState, useEffect } from 'react';
import { useMessageTemplatesStore, TenantMessageTemplate } from '@/stores/messageTemplatesStore';
import { RecipientContact } from '@/stores/contactsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  MessageCircle, 
  Mail,
  Star,
  Plus,
  Edit,
  Eye,
  Sparkles,
  User,
  Building,
  MapPin,
  Link as LinkIcon,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TemplateForm } from '@/components/tenant/TemplateForm';

interface TemplateSelectorProps {
  selectedTemplate?: TenantMessageTemplate | null;
  onTemplateSelect: (template: TenantMessageTemplate | null) => void;
  onMessageChange: (subject: string, body: string) => void;
  contact?: RecipientContact | null;
  rentCardLink?: string;
  className?: string;
  disabled?: boolean;
  defaultCategory?: string;
}

interface ProcessedTemplate {
  subject: string;
  body: string;
  variables: string[];
}

const TEMPLATE_CATEGORIES = {
  initial_inquiry: { label: 'Initial Inquiry', icon: MessageCircle, color: 'bg-blue-500' },
  follow_up: { label: 'Follow-up', icon: Mail, color: 'bg-green-500' },
  application: { label: 'Application', icon: FileText, color: 'bg-purple-500' },
  custom: { label: 'Custom', icon: Star, color: 'bg-orange-500' },
};

export const TemplateSelector = ({
  selectedTemplate,
  onTemplateSelect,
  onMessageChange,
  contact,
  rentCardLink = '#',
  className,
  disabled = false,
  defaultCategory,
}: TemplateSelectorProps) => {
  const { templates, fetchTemplates, isLoading } = useMessageTemplatesStore();
  const [currentSubject, setCurrentSubject] = useState('');
  const [currentBody, setCurrentBody] = useState('');
  const [showAddTemplateDialog, setShowAddTemplateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('select');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (templates.length === 0 && !isLoading) {
      fetchTemplates();
    }
  }, [templates.length, fetchTemplates, isLoading]);

  // Get filtered templates based on default category
  const filteredTemplates = defaultCategory 
    ? templates.filter(t => t.category === defaultCategory)
    : templates;

  const favoriteTemplates = filteredTemplates.filter(t => t.isDefault);
  const customTemplates = filteredTemplates.filter(t => !t.isDefault);

  // Process template variables
  const processTemplate = (template: TenantMessageTemplate): ProcessedTemplate => {
    let { subject, body } = template;
    const usedVariables: string[] = [];

    // Replace variables with actual values
    const replacements = {
      '{tenant_name}': 'Your Name', // This should come from user profile
      '{contact_name}': contact?.name || '[Contact Name]',
      '{property_address}': contact?.propertyAddress || '[Property Address]',
      '{company_name}': contact?.company || '[Company Name]',
      '{rentcard_link}': rentCardLink,
    };

    // Track which variables are in the template
    Object.keys(replacements).forEach(variable => {
      if (subject.includes(variable) || body.includes(variable)) {
        usedVariables.push(variable);
      }
    });

    // Replace variables in preview mode
    if (previewMode) {
      Object.entries(replacements).forEach(([variable, value]) => {
        subject = subject.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
        body = body.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
      });
    }

    return { subject, body, variables: usedVariables };
  };

  // Handle template selection
  const handleTemplateSelect = (template: TenantMessageTemplate) => {
    const processed = processTemplate(template);
    setCurrentSubject(processed.subject);
    setCurrentBody(processed.body);
    onTemplateSelect(template);
    onMessageChange(processed.subject, processed.body);
  };

  // Handle manual message changes
  const handleSubjectChange = (value: string) => {
    setCurrentSubject(value);
    onMessageChange(value, currentBody);
  };

  const handleBodyChange = (value: string) => {
    setCurrentBody(value);
    onMessageChange(currentSubject, value);
  };

  // Clear template selection and go to custom mode
  const handleCustomMode = () => {
    setCurrentSubject('');
    setCurrentBody('');
    onTemplateSelect(null);
    onMessageChange('', '');
    setActiveTab('custom');
  };

  const handleAddTemplateSuccess = () => {
    setShowAddTemplateDialog(false);
    fetchTemplates(); // Refresh templates list
  };

  const TemplateCard = ({ template }: { template: TenantMessageTemplate }) => {
    const category = TEMPLATE_CATEGORIES[template.category as keyof typeof TEMPLATE_CATEGORIES] || TEMPLATE_CATEGORIES.custom;
    const IconComponent = category.icon;
    const processed = processTemplate(template);
    const isSelected = selectedTemplate?.id === template.id;

    return (
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md",
          isSelected && "ring-2 ring-primary bg-primary/5",
          template.isDefault && "border-blue-200 bg-blue-50/50"
        )}
        onClick={() => handleTemplateSelect(template)}
        data-testid={`template-card-${template.id}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <div className={cn("p-1.5 rounded text-white", category.color)}>
                <IconComponent className="h-3 w-3" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm flex items-center gap-2">
                  {template.templateName}
                  {template.isDefault && (
                    <Sparkles className="h-3 w-3 text-blue-500" />
                  )}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {category.label}
                  </Badge>
                  {template.usageCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {template.usageCount} uses
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Subject:</p>
              <p className="text-xs font-medium truncate">{processed.subject}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Preview:</p>
              <p className="text-xs text-muted-foreground line-clamp-3">
                {processed.body.substring(0, 120)}...
              </p>
            </div>
            {processed.variables.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Variables:</p>
                <div className="flex flex-wrap gap-1">
                  {processed.variables.slice(0, 2).map((variable, index) => (
                    <Badge key={index} variant="outline" className="text-xs font-mono">
                      {variable}
                    </Badge>
                  ))}
                  {processed.variables.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{processed.variables.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="select" data-testid="tab-select-template">
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="custom" data-testid="tab-custom-message">
              <Edit className="h-4 w-4 mr-2" />
              Custom
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              data-testid="toggle-preview-mode"
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? 'Show Variables' : 'Preview'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddTemplateDialog(true)}
              data-testid="add-new-template"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </div>

        <TabsContent value="select" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-sm font-semibold mb-2">No templates found</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Create your first message template to get started
                </p>
                <Button
                  size="sm"
                  onClick={() => setShowAddTemplateDialog(true)}
                  data-testid="create-first-template"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Context Info */}
              {contact && (
                <Card className="bg-muted/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-xs">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">Sharing with:</span>
                      <span>{contact.name}</span>
                      {contact.company && (
                        <>
                          <span className="text-muted-foreground">at</span>
                          <span>{contact.company}</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Default Templates */}
              {favoriteTemplates.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    Recommended Templates
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {favoriteTemplates.map((template) => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Templates */}
              {customTemplates.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-orange-500" />
                    Your Templates
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customTemplates.map((template) => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Message Option */}
              <Card 
                className="cursor-pointer transition-all duration-200 hover:shadow-md border-dashed"
                onClick={handleCustomMode}
                data-testid="custom-message-card"
              >
                <CardContent className="p-4 text-center">
                  <Edit className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">Write Custom Message</p>
                  <p className="text-xs text-muted-foreground">
                    Create a one-time message without saving as template
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Custom Message
              </CardTitle>
              <CardDescription className="text-xs">
                Write a personalized message for this sharing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="custom-subject" className="text-xs">Subject</Label>
                <Input
                  id="custom-subject"
                  value={currentSubject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  placeholder="Enter email subject..."
                  disabled={disabled}
                  data-testid="custom-subject-input"
                />
              </div>
              
              <div>
                <Label htmlFor="custom-body" className="text-xs">Message</Label>
                <Textarea
                  id="custom-body"
                  value={currentBody}
                  onChange={(e) => handleBodyChange(e.target.value)}
                  placeholder="Write your message here..."
                  rows={8}
                  disabled={disabled}
                  data-testid="custom-body-textarea"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You can use variables like {'{contact_name}'} and {'{rentcard_link}'}
                </p>
              </div>

              {/* Variables Helper */}
              <div className="border-t pt-4">
                <Label className="text-xs font-medium">Quick Insert:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    { key: '{contact_name}', label: 'Contact Name' },
                    { key: '{property_address}', label: 'Property' },
                    { key: '{rentcard_link}', label: 'RentCard Link' },
                  ].map((variable) => (
                    <Button
                      key={variable.key}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newBody = currentBody + variable.key;
                        setCurrentBody(newBody);
                        onMessageChange(currentSubject, newBody);
                      }}
                      className="text-xs h-7 px-2"
                      disabled={disabled}
                    >
                      {variable.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Template Info */}
      {selectedTemplate && activeTab === 'select' && (
        <Card className="mt-4 bg-primary/5 border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-medium">Using template:</span>
                <span>{selectedTemplate.templateName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onTemplateSelect(null);
                  setCurrentSubject('');
                  setCurrentBody('');
                  onMessageChange('', '');
                }}
                className="h-6 px-2 text-xs"
                data-testid="clear-template-selection"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Template Dialog */}
      {showAddTemplateDialog && (
        <TemplateForm
          onClose={() => setShowAddTemplateDialog(false)}
          onSuccess={handleAddTemplateSuccess}
        />
      )}
    </div>
  );
};