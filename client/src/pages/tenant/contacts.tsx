import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useContactsStore, RecipientContact } from '@/stores/contactsStore';
import { ContactCard } from '@/components/tenant/ContactCard';
import { ContactForm } from '@/components/tenant/ContactForm';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Users, 
  Building, 
  UserCheck, 
  Briefcase, 
  User,
  Loader2,
  Search,
  Filter,
  Heart,
  Star
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
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const CONTACT_TYPES = {
  landlord: { label: 'Landlord', icon: Building, color: 'bg-blue-500' },
  property_manager: { label: 'Property Manager', icon: UserCheck, color: 'bg-green-500' },
  real_estate_agent: { label: 'Real Estate Agent', icon: Briefcase, color: 'bg-purple-500' },
  other: { label: 'Other', icon: User, color: 'bg-gray-500' },
};

const ContactsPage = () => {
  const { user } = useAuthStore();
  const { contacts, isLoading, error, fetchContacts } = useContactsStore();
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<RecipientContact | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [tenantProfileId, setTenantProfileId] = useState<number | null>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [filters, setFilters] = useState({
    showFavorites: true,
    showRegular: true,
    types: {
      landlord: true,
      property_manager: true,
      real_estate_agent: true,
      other: true,
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
            fetchContacts();
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
  }, [user, fetchContacts, toast]);

  // Filter contacts based on search and filters
  const filteredContacts = contacts.filter(contact => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (!contact.name.toLowerCase().includes(search) &&
          !contact.email.toLowerCase().includes(search) &&
          !contact.company?.toLowerCase().includes(search)) {
        return false;
      }
    }

    // Favorite filter
    if (!filters.showFavorites && contact.isFavorite) return false;
    if (!filters.showRegular && !contact.isFavorite) return false;

    // Type filter
    if (!filters.types[contact.contactType as keyof typeof filters.types]) {
      return false;
    }

    // Tab filter
    if (activeTab === 'favorites' && !contact.isFavorite) return false;
    if (activeTab !== 'all' && activeTab !== 'favorites' && contact.contactType !== activeTab) {
      return false;
    }

    return true;
  });

  const handleAddContact = () => {
    setEditingContact(null);
    setIsAddContactOpen(true);
  };

  const handleEditContact = (contact: RecipientContact) => {
    setEditingContact(contact);
    setIsAddContactOpen(true);
  };

  const handleFormSuccess = () => {
    setIsAddContactOpen(false);
    setEditingContact(null);
  };

  const getContactTypeStats = () => {
    const stats: Record<string, number> = {};
    Object.keys(CONTACT_TYPES).forEach(type => {
      stats[type] = contacts.filter(c => c.contactType === type).length;
    });
    return stats;
  };

  const typeStats = getContactTypeStats();
  const favoriteCount = contacts.filter(c => c.isFavorite).length;

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
                <Users className="h-5 w-5" />
                Profile Required
              </CardTitle>
              <CardDescription>
                You need to complete your tenant profile to manage contacts.
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
              My Contacts
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your landlords, property managers, and real estate contacts
            </p>
          </div>
          <Button 
            onClick={handleAddContact} 
            className="flex items-center gap-2"
            data-testid="button-add-contact"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card data-testid="card-stat-total">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{contacts.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Contacts</p>
            </CardContent>
          </Card>
          
          <Card data-testid="card-stat-favorites">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-2xl font-bold">{favoriteCount}</span>
              </div>
              <p className="text-sm text-muted-foreground">Favorites</p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-landlords">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-blue-500" />
                <span className="text-2xl font-bold">{typeStats.landlord || 0}</span>
              </div>
              <p className="text-sm text-muted-foreground">Landlords</p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-agents">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-purple-500" />
                <span className="text-2xl font-bold">{typeStats.real_estate_agent || 0}</span>
              </div>
              <p className="text-sm text-muted-foreground">Agents</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search contacts by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-contacts"
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
                checked={filters.showFavorites}
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ ...prev, showFavorites: checked }))
                }
              >
                Favorite Contacts
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.showRegular}
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ ...prev, showRegular: checked }))
                }
              >
                Regular Contacts
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Contact Types</DropdownMenuLabel>
              
              {Object.entries(CONTACT_TYPES).map(([key, { label }]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={filters.types[key as keyof typeof filters.types]}
                  onCheckedChange={(checked) => 
                    setFilters(prev => ({ 
                      ...prev, 
                      types: { ...prev.types, [key]: checked }
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
              All ({contacts.length})
            </TabsTrigger>
            <TabsTrigger value="favorites" data-testid="tab-favorites">
              <Heart className="h-4 w-4 mr-1" />
              Favorites ({favoriteCount})
            </TabsTrigger>
            <TabsTrigger value="landlord" data-testid="tab-landlords">
              <Building className="h-4 w-4 mr-1" />
              Landlords ({typeStats.landlord || 0})
            </TabsTrigger>
            <TabsTrigger value="property_manager" data-testid="tab-managers">
              <UserCheck className="h-4 w-4 mr-1" />
              Managers ({typeStats.property_manager || 0})
            </TabsTrigger>
            <TabsTrigger value="real_estate_agent" data-testid="tab-agents">
              <Briefcase className="h-4 w-4 mr-1" />
              Agents ({typeStats.real_estate_agent || 0})
            </TabsTrigger>
            <TabsTrigger value="other" data-testid="tab-other">
              <User className="h-4 w-4 mr-1" />
              Other ({typeStats.other || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading contacts...</p>
                </div>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm || Object.values(filters.types).some(v => !v) ? 
                    'No contacts found' : 'No contacts yet'
                  }
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || Object.values(filters.types).some(v => !v) ?
                    'Try adjusting your search or filters.' :
                    'Add your first contact to get started with easy RentCard sharing.'
                  }
                </p>
                {!searchTerm && Object.values(filters.types).every(v => v) && (
                  <Button onClick={handleAddContact} data-testid="button-add-first-contact">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Contact
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="grid-contacts">
                {filteredContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onEdit={handleEditContact}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Add/Edit Contact Form Modal */}
        {isAddContactOpen && (
          <ContactForm
            contact={editingContact}
            onClose={() => setIsAddContactOpen(false)}
            onSuccess={handleFormSuccess}
          />
        )}
      </div>
    </TenantLayout>
  );
};

export default ContactsPage;