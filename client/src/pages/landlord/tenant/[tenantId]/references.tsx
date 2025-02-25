import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { API_ENDPOINTS } from '@/constants/api';
import Navbar from '@/components/shared/navbar';
import { Button } from '@/components/ui/button';
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
import { Separator } from '@/components/ui/separator';
import { 
  UserCheck, 
  Building, 
  Briefcase, 
  Users, 
  Heart, 
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
  Star,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { format } from 'date-fns';

// Define the reference data structure
interface TenantReference {
  id: number;
  tenantId: number;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  isVerified: boolean;
  verificationDate: string | null;
  notes: string | null;
  rating?: string;
  comments?: string;
}

interface TenantProfile {
  id: number;
  userId: number;
  moveInDate: string | null;
  maxRent: number | null;
  employmentInfo: string | null;
  creditScore: number | null;
  rentalHistory: string | null;
  user?: {
    id: number;
    email: string;
    userType: string;
    phone: string | null;
  };
}

const LandlordTenantReferencesPage = () => {
  const router = useRouter();
  const { tenantId } = router.query;
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [references, setReferences] = useState<TenantReference[]>([]);
  const [tenantProfile, setTenantProfile] = useState<TenantProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    const fetchData = async () => {
      if (!tenantId || !user?.landlordProfile?.id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch tenant profile
        const profileResponse = await axios.get(`/api/tenant/profile/${tenantId}`);
        setTenantProfile(profileResponse.data);
        
        // Fetch tenant references
        const referencesResponse = await axios.get(`/api/landlord/tenant/${tenantId}/references`);
        setReferences(referencesResponse.data);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching tenant references:', err);
        setError('Failed to load tenant references. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [tenantId, user]);
  
  const getRelationshipLabel = (relationship: string) => {
    switch (relationship) {
      case 'previous_landlord': return 'Previous Landlord';
      case 'current_landlord': return 'Current Landlord';
      case 'employer': return 'Employer';
      case 'personal': return 'Personal Reference';
      case 'professional': return 'Professional Reference';
      case 'roommate': return 'Roommate';
      case 'family': return 'Family Member';
      default: return relationship;
    }
  };
  
  const getRelationshipIcon = (relationship: string) => {
    switch (relationship) {
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
  
  const getRatingLabel = (rating: string | undefined) => {
    if (!rating) return 'Not Rated';
    
    switch (rating) {
      case 'excellent': return 'Excellent - Highly Recommended';
      case 'good': return 'Good - Recommended';
      case 'fair': return 'Fair - Neutral';
      case 'poor': return 'Poor - Not Recommended';
      default: return rating;
    }
  };
  
  const getRatingColor = (rating: string | undefined) => {
    if (!rating) return 'text-gray-400';
    
    switch (rating) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };
  
  const getRatingStars = (rating: string | undefined) => {
    if (!rating) return null;
    
    const starCount = {
      'excellent': 5,
      'good': 4,
      'fair': 3,
      'poor': 1
    }[rating] || 0;
    
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${i < starCount ? getRatingColor(rating) : 'text-gray-300'}`} 
            fill={i < starCount ? 'currentColor' : 'none'} 
          />
        ))}
      </div>
    );
  };
  
  const filteredReferences = references.filter(reference => {
    if (activeTab === 'verified' && !reference.isVerified) return false;
    if (activeTab === 'unverified' && reference.isVerified) return false;
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
  
  const verifiedCount = references.filter(ref => ref.isVerified).length;
  const unverifiedCount = references.filter(ref => !ref.isVerified).length;
  
  const handleBack = () => {
    router.back();
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <Button 
          variant="ghost" 
          className="mb-6 pl-0" 
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Tenant References</h1>
            <p className="text-gray-500 mt-1">
              {tenantProfile?.user?.email || 'Loading tenant information...'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total References</CardTitle>
              <CardDescription>All references provided</CardDescription>
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
              <CardTitle className="text-lg">Unverified</CardTitle>
              <CardDescription>References awaiting verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-yellow-500 mr-3" />
                <span className="text-3xl font-bold">{unverifiedCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-2">{references.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="verified">
                Verified
                <Badge variant="secondary" className="ml-2">{verifiedCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="unverified">
                Unverified
                <Badge variant="secondary" className="ml-2">{unverifiedCount}</Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : error ? (
                <div className="flex justify-center items-center py-12 text-red-500">
                  <AlertCircle className="h-8 w-8 mr-2" />
                  <p>{error}</p>
                </div>
              ) : filteredReferences.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No references found</h3>
                  <p className="text-gray-500">
                    This tenant has not provided any references yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.keys(referencesByType).map(type => (
                    <div key={type}>
                      <div className="flex items-center mb-4">
                        {getRelationshipIcon(type)}
                        <h3 className="text-lg font-medium ml-2">{getRelationshipLabel(type)}</h3>
                      </div>
                      <div className="space-y-4">
                        {referencesByType[type].map(reference => (
                          <Card key={reference.id} className="overflow-hidden">
                            <div className={`h-2 w-full ${reference.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg">{reference.name}</CardTitle>
                                  <CardDescription>
                                    {getRelationshipLabel(reference.relationship)}
                                    {reference.isVerified && (
                                      <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                                        Verified
                                      </Badge>
                                    )}
                                    {!reference.isVerified && (
                                      <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-200">
                                        Pending Verification
                                      </Badge>
                                    )}
                                  </CardDescription>
                                </div>
                                {reference.isVerified && reference.rating && (
                                  <div className="text-right">
                                    {getRatingStars(reference.rating)}
                                    <p className={`text-sm font-medium ${getRatingColor(reference.rating)}`}>
                                      {getRatingLabel(reference.rating)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-600">{reference.email}</span>
                                </div>
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-600">{reference.phone}</span>
                                </div>
                              </div>
                              
                              {reference.isVerified && reference.verificationDate && (
                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                  <span>Verified on {format(new Date(reference.verificationDate), 'PPP')}</span>
                                </div>
                              )}
                              
                              {reference.isVerified && reference.comments && (
                                <div className="mt-4">
                                  <div className="flex items-center mb-2">
                                    <MessageSquare className="h-4 w-4 text-gray-400 mr-2" />
                                    <h4 className="text-sm font-medium">Comments</h4>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                                    {reference.comments}
                                  </div>
                                </div>
                              )}
                              
                              {reference.notes && (
                                <div className="mt-4">
                                  <div className="flex items-center mb-2">
                                    <MessageSquare className="h-4 w-4 text-gray-400 mr-2" />
                                    <h4 className="text-sm font-medium">Notes</h4>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                                    {reference.notes}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <Separator className="mt-8" />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="verified" className="mt-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : filteredReferences.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No verified references</h3>
                  <p className="text-gray-500">
                    This tenant has no verified references yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReferences.map(reference => (
                    <Card key={reference.id} className="overflow-hidden">
                      <div className="h-2 w-full bg-green-500" />
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{reference.name}</CardTitle>
                            <CardDescription>
                              {getRelationshipLabel(reference.relationship)}
                              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                                Verified
                              </Badge>
                            </CardDescription>
                          </div>
                          {reference.rating && (
                            <div className="text-right">
                              {getRatingStars(reference.rating)}
                              <p className={`text-sm font-medium ${getRatingColor(reference.rating)}`}>
                                {getRatingLabel(reference.rating)}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">{reference.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">{reference.phone}</span>
                          </div>
                        </div>
                        
                        {reference.verificationDate && (
                          <div className="flex items-center text-sm text-gray-500 mb-4">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span>Verified on {format(new Date(reference.verificationDate), 'PPP')}</span>
                          </div>
                        )}
                        
                        {reference.comments && (
                          <div className="mt-4">
                            <div className="flex items-center mb-2">
                              <MessageSquare className="h-4 w-4 text-gray-400 mr-2" />
                              <h4 className="text-sm font-medium">Comments</h4>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                              {reference.comments}
                            </div>
                          </div>
                        )}
                        
                        {reference.notes && (
                          <div className="mt-4">
                            <div className="flex items-center mb-2">
                              <MessageSquare className="h-4 w-4 text-gray-400 mr-2" />
                              <h4 className="text-sm font-medium">Notes</h4>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                              {reference.notes}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="unverified" className="mt-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : filteredReferences.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No unverified references</h3>
                  <p className="text-gray-500">
                    All references have been verified.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReferences.map(reference => (
                    <Card key={reference.id} className="overflow-hidden">
                      <div className="h-2 w-full bg-yellow-500" />
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{reference.name}</CardTitle>
                            <CardDescription>
                              {getRelationshipLabel(reference.relationship)}
                              <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-200">
                                Pending Verification
                              </Badge>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">{reference.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">{reference.phone}</span>
                          </div>
                        </div>
                        
                        {reference.notes && (
                          <div className="mt-4">
                            <div className="flex items-center mb-2">
                              <MessageSquare className="h-4 w-4 text-gray-400 mr-2" />
                              <h4 className="text-sm font-medium">Notes</h4>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                              {reference.notes}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                          <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-yellow-800">Awaiting Verification</p>
                              <p className="text-sm text-yellow-700 mt-1">
                                This reference has not yet verified their information. The tenant may need to resend the verification email.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LandlordTenantReferencesPage; 