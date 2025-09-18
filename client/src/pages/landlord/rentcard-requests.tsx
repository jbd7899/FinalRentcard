import { useState } from 'react';
import LandlordLayout from '@/components/layouts/LandlordLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Mail, 
  Users, 
  Send, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  Upload,
  Download,
  MoreHorizontal,
  Trash2,
  Edit
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { RentCardRequest, ProspectList } from '@shared/schema';

interface ProspectContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

const RequestRentCardDashboard = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  
  // Individual request form state
  const [individualForm, setIndividualForm] = useState({
    recipientName: '',
    recipientEmail: '',
    customMessage: ''
  });
  
  // Bulk request form state
  const [bulkForm, setBulkForm] = useState({
    prospectListId: '',
    customMessage: ''
  });
  
  // Prospect list form state
  const [prospectListForm, setProspectListForm] = useState({
    listName: '',
    description: '',
    contacts: [] as ProspectContact[]
  });
  
  // New contact form state
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Get landlord profile
  const { data: landlordProfile } = useQuery({
    queryKey: ['/api/landlord/profile'],
    enabled: !!user
  });
  const typedLandlordProfile = landlordProfile as { id: number } | undefined;

  // Fetch RentCard requests
  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['/api/rentcard-requests/landlord', typedLandlordProfile?.id],
    enabled: !!typedLandlordProfile?.id
  });
  const typedRequests = requests as RentCardRequest[];

  // Fetch prospect lists
  const { data: prospectLists = [], isLoading: listsLoading } = useQuery({
    queryKey: ['/api/prospect-lists/landlord', typedLandlordProfile?.id],
    enabled: !!typedLandlordProfile?.id
  });
  const typedProspectLists = prospectLists as ProspectList[];

  // Create individual request mutation
  const createIndividualRequest = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/rentcard-requests/create', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rentcard-requests/landlord'] });
      setIndividualForm({ recipientName: '', recipientEmail: '', customMessage: '' });
      toast({
        title: "Success",
        description: "RentCard request sent successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send request",
        variant: "destructive"
      });
    }
  });

  // Create bulk request mutation
  const createBulkRequest = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/rentcard-requests/bulk-create', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rentcard-requests/landlord'] });
      setBulkForm({ prospectListId: '', customMessage: '' });
      toast({
        title: "Success",
        description: "Bulk requests sent successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send bulk requests",
        variant: "destructive"
      });
    }
  });

  // Create prospect list mutation
  const createProspectList = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/prospect-lists/create', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prospect-lists/landlord'] });
      setProspectListForm({ listName: '', description: '', contacts: [] });
      toast({
        title: "Success",
        description: "Prospect list created successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create prospect list",
        variant: "destructive"
      });
    }
  });

  // Delete prospect list mutation
  const deleteProspectList = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/prospect-lists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prospect-lists/landlord'] });
      toast({
        title: "Success",
        description: "Prospect list deleted successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete prospect list",
        variant: "destructive"
      });
    }
  });

  const handleIndividualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedLandlordProfile?.id) return;
    
    createIndividualRequest.mutate({
      landlordId: typedLandlordProfile.id,
      recipientName: individualForm.recipientName,
      recipientEmail: individualForm.recipientEmail,
      customMessage: individualForm.customMessage || undefined,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    });
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedLandlordProfile?.id || !bulkForm.prospectListId) return;
    
    createBulkRequest.mutate({
      landlordId: typedLandlordProfile.id,
      prospectListId: parseInt(bulkForm.prospectListId),
      customMessage: bulkForm.customMessage || undefined,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  };

  const addContact = () => {
    if (!newContact.name || !newContact.email) return;
    
    const contact: ProspectContact = {
      id: Date.now().toString(),
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone || undefined,
      notes: newContact.notes || undefined
    };
    
    setProspectListForm(prev => ({
      ...prev,
      contacts: [...prev.contacts, contact]
    }));
    
    setNewContact({ name: '', email: '', phone: '', notes: '' });
  };

  const removeContact = (contactId: string) => {
    setProspectListForm(prev => ({
      ...prev,
      contacts: prev.contacts.filter(c => c.id !== contactId)
    }));
  };

  const handleCreateProspectList = () => {
    if (!typedLandlordProfile?.id || !prospectListForm.listName || prospectListForm.contacts.length === 0) return;
    
    createProspectList.mutate({
      landlordId: typedLandlordProfile.id,
      listName: prospectListForm.listName,
      description: prospectListForm.description || undefined,
      contacts: prospectListForm.contacts
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      sent: { variant: "secondary" as const, icon: Mail, text: "Sent" },
      viewed: { variant: "default" as const, icon: Eye, text: "Viewed" },
      started: { variant: "default" as const, icon: Clock, text: "Started" },
      completed: { variant: "default" as const, icon: CheckCircle, text: "Completed" },
      expired: { variant: "destructive" as const, icon: XCircle, text: "Expired" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.sent;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1" data-testid={`status-${status}`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const stats = {
    totalRequests: typedRequests.length,
    completedRequests: typedRequests.filter((r: RentCardRequest) => r.status === 'completed').length,
    pendingRequests: typedRequests.filter((r: RentCardRequest) => ['sent', 'viewed', 'started'].includes(r.status)).length,
    expiredRequests: typedRequests.filter((r: RentCardRequest) => r.status === 'expired').length,
    totalLists: typedProspectLists.length,
    totalContacts: typedProspectLists.reduce((sum: number, list: ProspectList) => sum + (list.contacts ? list.contacts.length : 0), 0)
  };

  return (
    <LandlordLayout>
      <div className="container mx-auto px-4 py-6 space-y-6" data-testid="rentcard-requests-dashboard">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" data-testid="page-title">
              RentCard Requests
            </h1>
            <p className="text-gray-600" data-testid="page-description">
              Request RentCards from prospects and manage your prospect lists
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button data-testid="button-individual-request">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Individual Request
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Send Individual RentCard Request</DialogTitle>
                  <DialogDescription>
                    Send a RentCard request to a specific prospect
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleIndividualSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipientName">Recipient Name</Label>
                    <Input
                      id="recipientName"
                      value={individualForm.recipientName}
                      onChange={(e) => setIndividualForm(prev => ({ ...prev, recipientName: e.target.value }))}
                      required
                      data-testid="input-recipient-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipientEmail">Email Address</Label>
                    <Input
                      id="recipientEmail"
                      type="email"
                      value={individualForm.recipientEmail}
                      onChange={(e) => setIndividualForm(prev => ({ ...prev, recipientEmail: e.target.value }))}
                      required
                      data-testid="input-recipient-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customMessage">Custom Message (Optional)</Label>
                    <Textarea
                      id="customMessage"
                      value={individualForm.customMessage}
                      onChange={(e) => setIndividualForm(prev => ({ ...prev, customMessage: e.target.value }))}
                      placeholder="Add a personal message to your request..."
                      data-testid="textarea-custom-message"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={createIndividualRequest.isPending}
                    data-testid="button-send-individual"
                  >
                    {createIndividualRequest.isPending ? 'Sending...' : 'Send Request'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-bulk-request">
                  <Users className="w-4 h-4 mr-2" />
                  Send Bulk Request
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Send Bulk RentCard Requests</DialogTitle>
                  <DialogDescription>
                    Send RentCard requests to all contacts in a prospect list
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBulkSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prospectListId">Prospect List</Label>
                    <Select 
                      value={bulkForm.prospectListId} 
                      onValueChange={(value) => setBulkForm(prev => ({ ...prev, prospectListId: value }))}
                    >
                      <SelectTrigger data-testid="select-prospect-list">
                        <SelectValue placeholder="Select a prospect list" />
                      </SelectTrigger>
                      <SelectContent>
                        {typedProspectLists.map((list: ProspectList) => (
                          <SelectItem key={list.id} value={list.id.toString()}>
                            {list.listName} ({list.contacts ? list.contacts.length : 0} contacts)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bulkCustomMessage">Custom Message (Optional)</Label>
                    <Textarea
                      id="bulkCustomMessage"
                      value={bulkForm.customMessage}
                      onChange={(e) => setBulkForm(prev => ({ ...prev, customMessage: e.target.value }))}
                      placeholder="Add a personal message to your requests..."
                      data-testid="textarea-bulk-message"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={createBulkRequest.isPending || !bulkForm.prospectListId}
                    data-testid="button-send-bulk"
                  >
                    {createBulkRequest.isPending ? 'Sending...' : 'Send Bulk Requests'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card data-testid="stat-total-requests">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
                </div>
                <Send className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card data-testid="stat-completed-requests">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedRequests}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card data-testid="stat-pending-requests">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card data-testid="stat-expired-requests">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-red-600">{stats.expiredRequests}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card data-testid="stat-prospect-lists">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Prospect Lists</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalLists}</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card data-testid="stat-total-contacts">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalContacts}</p>
                </div>
                <Mail className="w-8 h-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="requests" data-testid="tab-requests">Requests</TabsTrigger>
            <TabsTrigger value="prospect-lists" data-testid="tab-prospect-lists">Prospect Lists</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Requests</CardTitle>
                  <CardDescription>Your latest RentCard requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {requestsLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  ) : typedRequests.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No requests sent yet</p>
                  ) : (
                    <div className="space-y-3">
                      {typedRequests.slice(0, 5).map((request: RentCardRequest) => (
                        <div key={request.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{request.prospectName}</p>
                            <p className="text-sm text-gray-500">{request.prospectEmail}</p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Prospect Lists</CardTitle>
                  <CardDescription>Your contact lists for bulk requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {listsLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  ) : typedProspectLists.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No prospect lists created yet</p>
                  ) : (
                    <div className="space-y-3">
                      {typedProspectLists.slice(0, 5).map((list: ProspectList) => (
                        <div key={list.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{list.listName}</p>
                            <p className="text-sm text-gray-500">{list.contacts ? list.contacts.length : 0} contacts</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Requests</CardTitle>
                <CardDescription>Manage and track your RentCard requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Checkbox
                            checked={selectedRequests.length === typedRequests.length}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedRequests(typedRequests.map((r: RentCardRequest) => r.id));
                              } else {
                                setSelectedRequests([]);
                              }
                            }}
                            data-testid="checkbox-select-all"
                          />
                        </TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sent</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requestsLoading ? (
                        [...Array(3)].map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                            <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                            <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div></TableCell>
                            <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div></TableCell>
                            <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div></TableCell>
                            <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div></TableCell>
                          </TableRow>
                        ))
                      ) : typedRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                            No requests found. Send your first RentCard request to get started!
                          </TableCell>
                        </TableRow>
                      ) : (
                        typedRequests.map((request: RentCardRequest) => (
                          <TableRow key={request.id} data-testid={`request-row-${request.id}`}>
                            <TableCell>
                              <Checkbox
                                checked={selectedRequests.includes(request.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedRequests(prev => [...prev, request.id]);
                                  } else {
                                    setSelectedRequests(prev => prev.filter(id => id !== request.id));
                                  }
                                }}
                                data-testid={`checkbox-request-${request.id}`}
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium" data-testid={`recipient-name-${request.id}`}>
                                  {request.prospectName}
                                </p>
                                <p className="text-sm text-gray-500" data-testid={`recipient-email-${request.id}`}>
                                  {request.prospectEmail}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell className="text-sm text-gray-600" data-testid={`sent-date-${request.id}`}>
                              {request.sentAt ? new Date(request.sentAt).toLocaleDateString() : 'Not sent'}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600" data-testid={`expires-date-${request.id}`}>
                              {request.expiresAt ? new Date(request.expiresAt).toLocaleDateString() : 'No expiry'}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" data-testid={`actions-${request.id}`}>
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem data-testid={`resend-${request.id}`}>
                                    <Send className="w-4 h-4 mr-2" />
                                    Resend
                                  </DropdownMenuItem>
                                  <DropdownMenuItem data-testid={`view-${request.id}`}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prospect-lists" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Prospect Lists</h3>
                <p className="text-gray-600">Manage your prospect contact lists</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-list">
                    <Plus className="w-4 h-4 mr-2" />
                    Create List
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Prospect List</DialogTitle>
                    <DialogDescription>
                      Create a new list and add prospect contacts for bulk requests
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="listName">List Name</Label>
                        <Input
                          id="listName"
                          value={prospectListForm.listName}
                          onChange={(e) => setProspectListForm(prev => ({ ...prev, listName: e.target.value }))}
                          placeholder="e.g., Downtown Prospects"
                          data-testid="input-list-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="listDescription">Description</Label>
                        <Input
                          id="listDescription"
                          value={prospectListForm.description}
                          onChange={(e) => setProspectListForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Optional description"
                          data-testid="input-list-description"
                        />
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Add Contacts</h4>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <Input
                          placeholder="Contact Name"
                          value={newContact.name}
                          onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                          data-testid="input-contact-name"
                        />
                        <Input
                          placeholder="Email Address"
                          type="email"
                          value={newContact.email}
                          onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                          data-testid="input-contact-email"
                        />
                        <Input
                          placeholder="Phone (optional)"
                          value={newContact.phone}
                          onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                          data-testid="input-contact-phone"
                        />
                        <Input
                          placeholder="Notes (optional)"
                          value={newContact.notes}
                          onChange={(e) => setNewContact(prev => ({ ...prev, notes: e.target.value }))}
                          data-testid="input-contact-notes"
                        />
                      </div>
                      <Button 
                        type="button" 
                        onClick={addContact}
                        disabled={!newContact.name || !newContact.email}
                        className="mb-4"
                        data-testid="button-add-contact"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Contact
                      </Button>
                      
                      {prospectListForm.contacts.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="font-medium">Contacts ({prospectListForm.contacts.length})</h5>
                          <div className="max-h-40 overflow-y-auto space-y-2 border rounded p-2">
                            {prospectListForm.contacts.map((contact) => (
                              <div key={contact.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div>
                                  <p className="font-medium text-sm">{contact.name}</p>
                                  <p className="text-xs text-gray-600">{contact.email}</p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeContact(contact.id)}
                                  data-testid={`button-remove-contact-${contact.id}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      onClick={handleCreateProspectList}
                      disabled={!prospectListForm.listName || prospectListForm.contacts.length === 0 || createProspectList.isPending}
                      className="w-full"
                      data-testid="button-save-list"
                    >
                      {createProspectList.isPending ? 'Creating...' : 'Create Prospect List'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listsLoading ? (
                [...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </CardContent>
                  </Card>
                ))
              ) : typedProspectLists.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No prospect lists created yet</p>
                  <p className="text-sm text-gray-400">Create your first list to start sending bulk requests</p>
                </div>
              ) : (
                typedProspectLists.map((list: ProspectList) => (
                  <Card key={list.id} data-testid={`prospect-list-${list.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{list.listName}</CardTitle>
                          {list.description && (
                            <CardDescription className="mt-1">{list.description}</CardDescription>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" data-testid={`list-actions-${list.id}`}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem data-testid={`edit-list-${list.id}`}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteProspectList.mutate(list.id)}
                              data-testid={`delete-list-${list.id}`}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span data-testid={`contacts-count-${list.id}`}>
                            {list.contacts ? list.contacts.length : 0} contacts
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Created {new Date(list.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </LandlordLayout>
  );
};

export default RequestRentCardDashboard;