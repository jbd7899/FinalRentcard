import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useReferencesStore, TenantReference } from '@/stores/referencesStore';
import { ReferenceCard } from '@/components/tenant/ReferenceCard';
import { ReferenceForm } from '@/components/tenant/ReferenceForm';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  UserCheck, 
  Building, 
  Briefcase, 
  Users, 
  Heart, 
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
  Filter
} from 'lucide-react';
import { ROUTES } from '@/constants';
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
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const ReferencesPage = () => {
  const { user } = useAuthStore();
  const { references, isLoading, error, fetchReferences } = useReferencesStore();
  const [isAddReferenceOpen, setIsAddReferenceOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [tenantProfileId, setTenantProfileId] = useState<number | null>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [filters, setFilters] = useState({
    showVerified: true,
    showPending: true,
    types: {
      previous_landlord: true,
      current_landlord: true,
      employer: true,
      personal: true,
      professional: true,
      roommate: true,
      family: true,
    }
  });
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchTenantProfile = async () => {
      if (!user) return;
      
      try {
        setIsFetchingProfile(true);
        // Fetch tenant profile if not available directly on user object
        const response = await apiRequest('GET', '/api/tenant/profile');
        
        if (response.ok) {
          const profileData = await response.json();
          if (profileData && profileData.id) {
            setTenantProfileId(profileData.id);
            fetchReferences(profileData.id);
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
        
        // More detailed error message
        let errorMessage = 'An error occurred while fetching your profile.';
        if (error instanceof Error) {
          errorMessage = `Error: ${error.message}`;
        } else if (error instanceof DOMException) {
          errorMessage = `Network error: ${error.name}. Please check your connection.`;
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
  }, [user, fetchReferences, toast]);
  
  const handleAddReference = () => {
    if (!tenantProfileId) {
      toast({
        title: 'Error',
        description: 'You need to complete your tenant profile first.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsAddReferenceOpen(true);
  };
  
  const filteredReferences = references.filter(reference => {
    // Filter by verification status
    if (reference.isVerified && !filters.showVerified) return false;
    if (!reference.isVerified && !filters.showPending) return false;
    
    // Filter by relationship type
    if (!filters.types[reference.relationship as keyof typeof filters.types]) return false;
    
    // Filter by tab
    if (activeTab === 'verified' && !reference.isVerified) return false;
    if (activeTab === 'pending' && reference.isVerified) return false;
    
    return true;
  });
  
  // Group references by type
  const referencesByType: Record<string, TenantReference[]> = {};
  
  filteredReferences.forEach(reference => {
    if (!referencesByType[reference.relationship]) {
      referencesByType[reference.relationship] = [];
    }
    referencesByType[reference.relationship].push(reference);
  });
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'previous_landlord': return 'Previous Landlords';
      case 'current_landlord': return 'Current Landlords';
      case 'employer': return 'Employers';
      case 'personal': return 'Personal References';
      case 'professional': return 'Professional References';
      case 'roommate': return 'Roommates';
      case 'family': return 'Family Members';
      default: return type;
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'previous_landlord':
      case 'current_landlord':
        return <Building className="h-5 w-5" />;
      case 'employer':
        return <Briefcase className="h-5 w-5" />;
      case 'personal':
      case 'professional':
        return <User className="h-5 w-5" />;
      case 'roommate':
        return <Users className="h-5 w-5" />;
      case 'family':
        return <Heart className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };
  
  const verifiedCount = references.filter(ref => ref.isVerified).length;
  const pendingCount = references.filter(ref => !ref.isVerified).length;
  
  if (isFetchingProfile || isLoading) {
    return (
      <TenantLayout activeRoute={ROUTES.TENANT.REFERENCES}>
        <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
          <h2 className="text-xl font-semibold">Loading references...</h2>
          <p className="text-gray-500">Please wait while we fetch your references.</p>
        </div>
      </TenantLayout>
    );
  }
  
  if (!tenantProfileId && !isFetchingProfile) {
    return (
      <TenantLayout activeRoute={ROUTES.TENANT.REFERENCES}>
        <div className="container mx-auto py-8 px-4">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Tenant Profile Required</h2>
            <p className="text-gray-500 mt-2 mb-4">
              You need to complete your tenant profile before you can manage references.
            </p>
            <Button onClick={() => window.location.href = '/tenant/rentcard'}>
              Complete Your Profile
            </Button>
          </div>
        </div>
      </TenantLayout>
    );
  }
  
  return (
    <TenantLayout activeRoute={ROUTES.TENANT.REFERENCES}>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">References</h1>
            <p className="text-gray-500 mt-1">
              Manage your references to strengthen your rental applications
            </p>
          </div>
          <Button onClick={handleAddReference}>
            <Plus className="h-4 w-4 mr-2" />
            Add Reference
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total References</CardTitle>
              <CardDescription>All your references</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-blue-500 mr-3" />
                <span className="text-3xl font-bold">{references.length}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Verified</CardTitle>
              <CardDescription>References that have been verified</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                <span className="text-3xl font-bold">{verifiedCount}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pending</CardTitle>
              <CardDescription>References awaiting verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-yellow-500 mr-3" />
                <span className="text-3xl font-bold">{pendingCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="all">
                    All
                    <Badge variant="secondary" className="ml-2">{references.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="verified">
                    Verified
                    <Badge variant="secondary" className="ml-2">{verifiedCount}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending
                    <Badge variant="secondary" className="ml-2">{pendingCount}</Badge>
                  </TabsTrigger>
                </TabsList>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Filter References</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs font-normal text-gray-500">Status</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                      checked={filters.showVerified}
                      onCheckedChange={(checked) => setFilters({...filters, showVerified: checked})}
                    >
                      Show Verified
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filters.showPending}
                      onCheckedChange={(checked) => setFilters({...filters, showPending: checked})}
                    >
                      Show Pending
                    </DropdownMenuCheckboxItem>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs font-normal text-gray-500">Reference Types</DropdownMenuLabel>
                    
                    {Object.keys(filters.types).map(type => (
                      <DropdownMenuCheckboxItem
                        key={type}
                        checked={filters.types[type as keyof typeof filters.types]}
                        onCheckedChange={(checked) => 
                          setFilters({
                            ...filters, 
                            types: {
                              ...filters.types,
                              [type]: checked
                            }
                          })
                        }
                      >
                        {getTypeLabel(type).slice(0, -1)}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <TabsContent value="all" className="mt-0">
            {Object.keys(referencesByType).length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No references found</h3>
                <p className="text-gray-500 mt-1">
                  Add references to strengthen your rental applications.
                </p>
                <Button onClick={handleAddReference} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Reference
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.keys(referencesByType).map(type => (
                  <div key={type}>
                    <div className="flex items-center mb-4">
                      {getTypeIcon(type)}
                      <h3 className="text-lg font-medium ml-2">{getTypeLabel(type)}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {referencesByType[type].map(reference => (
                        <ReferenceCard 
                          key={reference.id} 
                          reference={reference}
                          tenantId={tenantProfileId || 0}
                        />
                      ))}
                    </div>
                    
                    <Separator className="mt-8" />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="verified" className="mt-0">
            {verifiedCount === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No verified references</h3>
                <p className="text-gray-500 mt-1">
                  Your references will appear here once they've been verified.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.keys(referencesByType).map(type => {
                  const verifiedRefs = referencesByType[type].filter(ref => ref.isVerified);
                  if (verifiedRefs.length === 0) return null;
                  
                  return (
                    <div key={type}>
                      <div className="flex items-center mb-4">
                        {getTypeIcon(type)}
                        <h3 className="text-lg font-medium ml-2">{getTypeLabel(type)}</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {verifiedRefs.map(reference => (
                          <ReferenceCard 
                            key={reference.id} 
                            reference={reference}
                            tenantId={tenantProfileId || 0}
                          />
                        ))}
                      </div>
                      
                      <Separator className="mt-8" />
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="mt-0">
            {pendingCount === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No pending references</h3>
                <p className="text-gray-500 mt-1">
                  All your references have been verified.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.keys(referencesByType).map(type => {
                  const pendingRefs = referencesByType[type].filter(ref => !ref.isVerified);
                  if (pendingRefs.length === 0) return null;
                  
                  return (
                    <div key={type}>
                      <div className="flex items-center mb-4">
                        {getTypeIcon(type)}
                        <h3 className="text-lg font-medium ml-2">{getTypeLabel(type)}</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingRefs.map(reference => (
                          <ReferenceCard 
                            key={reference.id} 
                            reference={reference}
                            tenantId={tenantProfileId || 0}
                          />
                        ))}
                      </div>
                      
                      <Separator className="mt-8" />
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {tenantProfileId && (
          <ReferenceForm 
            isOpen={isAddReferenceOpen}
            onClose={() => setIsAddReferenceOpen(false)}
            tenantId={tenantProfileId}
          />
        )}
      </div>
    </TenantLayout>
  );
};

export default ReferencesPage; 