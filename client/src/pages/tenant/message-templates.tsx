import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useMessageTemplatesStore, TenantMessageTemplate } from '@/stores/messageTemplatesStore';
import { TemplateCard } from '@/components/tenant/TemplateCard';
import { TemplateForm } from '@/components/tenant/TemplateForm';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  FileText, 
  MessageCircle, 
  Mail,
  Star,
  Loader2,
  Search,
  Filter,
  Sparkles,
  Users
} from 'lucide-react';
import TenantLayout from '@/components/layouts/TenantLayout';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const TEMPLATE_CATEGORIES = {
  initial_inquiry: { 
    label: 'Initial Inquiry', 
    icon: MessageCircle, 
    color: 'bg-blue-500',
    description: 'First contact with landlords or agents'
  },
  follow_up: { 
    label: 'Follow-up', 
    icon: Mail, 
    color: 'bg-green-500',
    description: 'Following up after property viewings'
  },
  application: { 
    label: 'Application', 
    icon: FileText, 
    color: 'bg-purple-500',
    description: 'When submitting rental applications'
  },
  custom: { 
    label: 'Custom', 
    icon: Star, 
    color: 'bg-orange-500',
    description: 'Your own custom templates'
  },
};

const TEMPLATE_VARIABLES = [
  { key: '{tenant_name}', description: 'Your name' },
  { key: '{contact_name}', description: 'Recipient\'s name' },
  { key: '{property_address}', description: 'Property address' },
  { key: '{company_name}', description: 'Company or agency name' },
  { key: '{rentcard_link}', description: 'Link to your RentCard' },
];

const MessageTemplatesPage = () => {
  const { user } = useAuthStore();
  const { templates, isLoading, error, fetchTemplates } = useMessageTemplatesStore();
  const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TenantMessageTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [tenantProfileId, setTenantProfileId] = useState<number | null>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [filters, setFilters] = useState({
    showDefault: true,
    showCustom: true,
    categories: {
      initial_inquiry: true,
      follow_up: true,
      application: true,
      custom: true,
    }
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchTenantProfile = async () => {
      if (!user) return;
      
      try {
        setIsFetchingProfile(true);
        const response = await apiRequest('GET', '/api/tenant/profile');
        
        if (response.ok) {
          const profileData = await response.json();
          if (profileData && profileData.id) {
            setTenantProfileId(profileData.id);
            fetchTemplates();
          } else {
            toast({
              title: 'Profile Not Found',
              description: 'Please complete your tenant profile first.',
              variant: 'destructive',
            });
          }
        } else {
          console.error('Failed to fetch tenant profile:', {
            status: response.status,
            statusText: response.statusText
          });
          
          toast({
            title: 'Error',
            description: `Failed to fetch tenant profile. Status: ${response.status}`,
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching tenant profile:', error);
        
        let errorMessage = 'An error occurred while fetching your profile.';
        if (error instanceof Error) {
          errorMessage = `Error: ${error.message}`;
        }
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsFetchingProfile(false);
      }
    };
    
    fetchTenantProfile();
  }, [user, fetchTemplates, toast]);

  // Filter templates based on search and filters
  const filteredTemplates = templates.filter(template => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (!template.templateName.toLowerCase().includes(search) &&
          !template.subject.toLowerCase().includes(search) &&
          !template.body.toLowerCase().includes(search)) {
        return false;
      }
    }

    // Default/Custom filter
    if (!filters.showDefault && template.isDefault) return false;
    if (!filters.showCustom && !template.isDefault) return false;

    // Category filter
    if (!filters.categories[template.category as keyof typeof filters.categories]) {
      return false;
    }

    // Tab filter
    if (activeTab === 'default' && !template.isDefault) return false;
    if (activeTab === 'custom' && template.isDefault) return false;
    if (activeTab !== 'all' && activeTab !== 'default' && activeTab !== 'custom' && 
        template.category !== activeTab) {
      return false;
    }

    return true;
  });

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setIsAddTemplateOpen(true);
  };

  const handleEditTemplate = (template: TenantMessageTemplate) => {
    setEditingTemplate(template);
    setIsAddTemplateOpen(true);
  };

  const handleFormSuccess = () => {
    setIsAddTemplateOpen(false);
    setEditingTemplate(null);
  };

  const getCategoryStats = () => {
    const stats: Record<string, number> = {};
    Object.keys(TEMPLATE_CATEGORIES).forEach(category => {
      stats[category] = templates.filter(t => t.category === category).length;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();
  const defaultCount = templates.filter(t => t.isDefault).length;
  const customCount = templates.filter(t => !t.isDefault).length;

  if (isFetchingProfile) {
    return (
      <TenantLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </TenantLayout>
    );
  }

  if (!tenantProfileId) {
    return (
      <TenantLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <FileText className="h-5 w-5" />
                Profile Required
              </CardTitle>
              <CardDescription>
                You need to complete your tenant profile to manage message templates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.location.href = '/tenant/profile'} 
                className="w-full"
                data-testid="button-complete-profile"
              >
                Complete Your Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
              Message Templates
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage reusable message templates for sharing your RentCard
            </p>
          </div>
          <Button 
            onClick={handleAddTemplate} 
            className="flex items-center gap-2"
            data-testid="button-add-template"
          >
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card data-testid="card-stat-total">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{templates.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Templates</p>
            </CardContent>
          </Card>
          
          <Card data-testid="card-stat-default">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span className="text-2xl font-bold">{defaultCount}</span>
              </div>
              <p className="text-sm text-muted-foreground">Default</p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-custom">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-orange-500" />
                <span className="text-2xl font-bold">{customCount}</span>
              </div>
              <p className="text-sm text-muted-foreground">Custom</p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-used">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                <span className="text-2xl font-bold">
                  {templates.reduce((sum, t) => sum + t.usageCount, 0)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Times Used</p>
            </CardContent>
          </Card>
        </div>

        {/* Template Variables Helper */}
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Available Variables</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {TEMPLATE_VARIABLES.map((variable) => (
                <Badge key={variable.key} variant="secondary" className="text-xs">
                  {variable.key}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Use these variables in your templates - they'll be replaced with actual values when sending
            </p>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search templates by name, subject, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-templates"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2" data-testid="button-filter">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Show</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={filters.showDefault}
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ ...prev, showDefault: checked }))
                }
              >
                Default Templates
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.showCustom}
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ ...prev, showCustom: checked }))
                }
              >
                Custom Templates
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Categories</DropdownMenuLabel>
              
              {Object.entries(TEMPLATE_CATEGORIES).map(([key, { label }]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={filters.categories[key as keyof typeof filters.categories]}
                  onCheckedChange={(checked) => 
                    setFilters(prev => ({ 
                      ...prev, 
                      categories: { ...prev.categories, [key]: checked }
                    }))
                  }
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" data-testid="tab-all">
              All ({templates.length})
            </TabsTrigger>
            <TabsTrigger value="default" data-testid="tab-default">
              <Sparkles className="h-4 w-4 mr-1" />
              Default ({defaultCount})
            </TabsTrigger>
            <TabsTrigger value="custom" data-testid="tab-custom">
              <Star className="h-4 w-4 mr-1" />
              Custom ({customCount})
            </TabsTrigger>
            <TabsTrigger value="initial_inquiry" data-testid="tab-inquiry">
              <MessageCircle className="h-4 w-4 mr-1" />
              Inquiry ({categoryStats.initial_inquiry || 0})
            </TabsTrigger>
            <TabsTrigger value="follow_up" data-testid="tab-followup">
              <Mail className="h-4 w-4 mr-1" />
              Follow-up ({categoryStats.follow_up || 0})
            </TabsTrigger>
            <TabsTrigger value="application" data-testid="tab-application">
              <FileText className="h-4 w-4 mr-1" />
              Application ({categoryStats.application || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading templates...</p>
                </div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm || Object.values(filters.categories).some(v => !v) ? 
                    'No templates found' : 'No templates yet'
                  }
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || Object.values(filters.categories).some(v => !v) ?
                    'Try adjusting your search or filters.' :
                    'Create your first message template to streamline RentCard sharing.'
                  }
                </p>
                {!searchTerm && Object.values(filters.categories).every(v => v) && (
                  <Button onClick={handleAddTemplate} data-testid="button-add-first-template">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Template
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="grid-templates">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onEdit={handleEditTemplate}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Add/Edit Template Form Modal */}
        {isAddTemplateOpen && (
          <TemplateForm
            template={editingTemplate}
            onClose={() => setIsAddTemplateOpen(false)}
            onSuccess={handleFormSuccess}
          />
        )}
      </div>
    </TenantLayout>
  );
};

export default MessageTemplatesPage;