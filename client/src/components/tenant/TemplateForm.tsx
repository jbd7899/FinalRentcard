import { useState, useEffect } from 'react';
import { useMessageTemplatesStore, TenantMessageTemplate } from '@/stores/messageTemplatesStore';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { 
  FileText, 
  MessageCircle, 
  Mail,
  Star,
  Sparkles,
  Loader2,
  Info,
  Eye,
  Code
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';

const templateFormSchema = z.object({
  templateName: z.string().min(1, 'Template name is required').max(100, 'Template name is too long'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  body: z.string().min(1, 'Message body is required').max(5000, 'Message is too long'),
  category: z.enum(['initial_inquiry', 'follow_up', 'application', 'custom']),
  isDefault: z.boolean().default(false),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

const TEMPLATE_CATEGORIES = [
  { 
    value: 'initial_inquiry', 
    label: 'Initial Inquiry', 
    icon: MessageCircle, 
    description: 'First contact with landlords or agents about properties' 
  },
  { 
    value: 'follow_up', 
    label: 'Follow-up', 
    icon: Mail, 
    description: 'Following up after property viewings or initial contact' 
  },
  { 
    value: 'application', 
    label: 'Application', 
    icon: FileText, 
    description: 'When submitting rental applications with your RentCard' 
  },
  { 
    value: 'custom', 
    label: 'Custom', 
    icon: Star, 
    description: 'Your own custom templates for specific needs' 
  },
];

const TEMPLATE_VARIABLES = [
  { key: '{tenant_name}', description: 'Your name from your tenant profile' },
  { key: '{contact_name}', description: 'The recipient\'s name from your contacts' },
  { key: '{property_address}', description: 'Property address from contact info' },
  { key: '{company_name}', description: 'Company name from contact info' },
  { key: '{rentcard_link}', description: 'Link to your RentCard for easy access' },
];

const DEFAULT_TEMPLATES = {
  initial_inquiry: {
    subject: 'Rental Inquiry - {property_address}',
    body: `Hello {contact_name},

I hope this message finds you well. I'm interested in learning more about the rental property at {property_address} and would like to share my rental profile with you.

I've prepared a comprehensive RentCard that includes all my rental information, references, and documentation. You can view it here: {rentcard_link}

I'm actively looking for a rental and would appreciate the opportunity to discuss this property further. Please let me know if you have any questions or if you'd like to schedule a viewing.

Thank you for your time and consideration.

Best regards,
{tenant_name}`
  },
  follow_up: {
    subject: 'Following up on {property_address}',
    body: `Hi {contact_name},

I wanted to follow up on our recent discussion about the rental property at {property_address}. I remain very interested in this property and wanted to ensure you had access to my complete rental profile.

Here's my RentCard with all my information: {rentcard_link}

This includes my employment details, rental history, references, and all necessary documentation. Please let me know if you need any additional information or if we can move forward with the next steps.

I'm available to discuss this at your convenience.

Best regards,
{tenant_name}`
  },
  application: {
    subject: 'Rental Application - {property_address}',
    body: `Dear {contact_name},

I am submitting my rental application for the property at {property_address}. I'm very excited about this opportunity and believe I would be an excellent tenant.

Please find my complete rental profile here: {rentcard_link}

This RentCard contains:
- Employment verification and income details
- Complete rental history with references
- Credit information and financial documentation
- Personal and professional references
- All required application materials

I've ensured all information is current and complete. Please don't hesitate to contact me if you need any additional documentation or have any questions about my application.

Thank you for considering my application. I look forward to hearing from you soon.

Sincerely,
{tenant_name}`
  }
};

interface TemplateFormProps {
  template?: TenantMessageTemplate | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const TemplateForm = ({ template, onClose, onSuccess }: TemplateFormProps) => {
  const { addTemplate, updateTemplate } = useMessageTemplatesStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  const isEditing = Boolean(template);

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      templateName: '',
      subject: '',
      body: '',
      category: 'initial_inquiry',
      isDefault: false,
    },
  });

  const watchedValues = form.watch();

  useEffect(() => {
    if (template) {
      form.reset({
        templateName: template.templateName,
        subject: template.subject,
        body: template.body,
        category: template.category as 'initial_inquiry' | 'follow_up' | 'application' | 'custom',
        isDefault: template.isDefault,
      });
    } else {
      form.reset({
        templateName: '',
        subject: '',
        body: '',
        category: 'initial_inquiry',
        isDefault: false,
      });
    }
  }, [template, form]);

  const onSubmit = async (values: TemplateFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Extract variables from subject and body
      const allText = values.subject + ' ' + values.body;
      const variables = Array.from(allText.matchAll(/\{[^}]+\}/g))
        .map(match => match[0])
        .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

      const templateData = {
        ...values,
        variables,
      };

      let result;
      if (isEditing && template) {
        result = await updateTemplate(template.id, templateData);
      } else {
        result = await addTemplate(templateData);
      }

      if (result) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting template form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseDefaultTemplate = (category: string) => {
    const defaultTemplate = DEFAULT_TEMPLATES[category as keyof typeof DEFAULT_TEMPLATES];
    if (defaultTemplate) {
      const categoryInfo = TEMPLATE_CATEGORIES.find(c => c.value === category);
      form.setValue('templateName', `${categoryInfo?.label} Template`);
      form.setValue('subject', defaultTemplate.subject);
      form.setValue('body', defaultTemplate.body);
      form.setValue('category', category as any);
    }
  };

  const insertVariable = (variable: string) => {
    const currentBody = form.getValues('body');
    const cursorPosition = currentBody.length; // Insert at the end for simplicity
    const newBody = currentBody + variable;
    form.setValue('body', newBody);
  };

  const highlightVariables = (text: string) => {
    return text.replace(/\{[^}]+\}/g, (match) => 
      `<span class="inline-block bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs font-mono">${match}</span>`
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-template-form">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? (
              <>
                <FileText className="h-5 w-5" />
                Edit Template
              </>
            ) : (
              <>
                <FileText className="h-5 w-5" />
                Create New Template
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update your message template with personalized content and variables.' 
              : 'Create a reusable message template for sharing your RentCard efficiently.'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Edit Template
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Main Form */}
                  <div className="space-y-4">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="templateName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Template Name *</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="e.g., Initial Property Inquiry"
                                data-testid="input-template-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-template-category">
                                  <SelectValue placeholder="Select template category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TEMPLATE_CATEGORIES.map((category) => {
                                  const IconComponent = category.icon;
                                  return (
                                    <SelectItem key={category.value} value={category.value}>
                                      <div className="flex items-center gap-2">
                                        <IconComponent className="h-4 w-4" />
                                        <div>
                                          <div className="font-medium">{category.label}</div>
                                          <div className="text-xs text-muted-foreground">{category.description}</div>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Subject *</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="e.g., Rental Inquiry - {property_address}"
                                data-testid="input-template-subject"
                              />
                            </FormControl>
                            <FormDescription>
                              Use variables like {'{property_address}'} that will be replaced with actual values
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="body"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message Body *</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field}
                                placeholder="Write your message template here. Use variables like {contact_name} and {rentcard_link}..."
                                rows={12}
                                data-testid="textarea-template-body"
                              />
                            </FormControl>
                            <FormDescription>
                              Write your message using variables that will be automatically filled in
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {!isEditing && (
                        <FormField
                          control={form.control}
                          name="isDefault"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="flex items-center gap-2">
                                  <Sparkles className={cn("h-4 w-4", field.value && "text-blue-500")} />
                                  Default Template
                                </FormLabel>
                                <FormDescription>
                                  Mark this as a default template that will be suggested to other users
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-template-default"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>

                  {/* Helper Panel */}
                  <div className="space-y-4">
                    {/* Default Templates */}
                    {!isEditing && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Quick Start
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Use a pre-made template as a starting point
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {TEMPLATE_CATEGORIES.slice(0, 3).map((category) => (
                            <Button
                              key={category.value}
                              variant="outline"
                              size="sm"
                              onClick={() => handleUseDefaultTemplate(category.value)}
                              className="w-full justify-start text-left"
                              type="button"
                            >
                              <category.icon className="h-4 w-4 mr-2" />
                              Use {category.label} Template
                            </Button>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Variables */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          Available Variables
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Click to insert variables into your template
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {TEMPLATE_VARIABLES.map((variable) => (
                          <div key={variable.key} className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <Badge 
                                variant="outline" 
                                className="text-xs font-mono cursor-pointer hover:bg-blue-50"
                                onClick={() => insertVariable(variable.key)}
                              >
                                {variable.key}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {variable.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Tips */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Tips
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs text-muted-foreground">
                        <p>• Use variables to personalize your messages automatically</p>
                        <p>• Keep messages professional yet friendly</p>
                        <p>• Include a clear call to action</p>
                        <p>• Preview your template before saving</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                    data-testid="button-cancel-template"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    data-testid="button-save-template"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isEditing ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        {isEditing ? 'Update Template' : 'Create Template'}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Template Preview</CardTitle>
                <CardDescription className="text-xs">
                  This is how your template will look with variables highlighted
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Subject:</Label>
                  <div 
                    className="mt-1 p-3 bg-muted rounded-md"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightVariables(watchedValues.subject || 'No subject entered')
                    }}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Message:</Label>
                  <div 
                    className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap min-h-[200px]"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightVariables(watchedValues.body || 'No message entered')
                    }}
                  />
                </div>
                {watchedValues.subject || watchedValues.body ? (
                  <div>
                    <Label className="text-sm font-medium">Variables Used:</Label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {Array.from((watchedValues.subject + ' ' + watchedValues.body).matchAll(/\{[^}]+\}/g))
                        .map(match => match[0])
                        .filter((value, index, self) => self.indexOf(value) === index)
                        .map((variable, index) => (
                          <Badge key={index} variant="outline" className="font-mono">
                            {variable}
                          </Badge>
                        ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};