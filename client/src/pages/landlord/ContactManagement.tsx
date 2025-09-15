import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MessageSquare, 
  Template, 
  History, 
  Users,
  Mail, 
  Phone, 
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Calendar
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import LandlordLayout from '@/components/layouts/LandlordLayout';
import { ROUTES } from '@/constants/routes';
import CommunicationTemplates from '@/components/landlord/CommunicationTemplates';
import type { CommunicationLog } from '@shared/schema';

interface CommunicationStats {
  totalCommunications: number;
  emailCount: number;
  phoneCount: number;
  smsCount: number;
  successRate: number;
  thisWeek: number;
  thisMonth: number;
}

const ContactManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch communication logs
  const { data: communicationLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['/api/communication-logs', statusFilter, dateFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (dateFilter !== 'all') params.append('dateFilter', dateFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      
      const response = await fetch(`/api/communication-logs?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch communication logs');
      return response.json() as CommunicationLog[];
    }
  });

  // Calculate statistics
  const stats: CommunicationStats = {
    totalCommunications: communicationLogs.length,
    emailCount: communicationLogs.filter(log => log.communicationType === 'email').length,
    phoneCount: communicationLogs.filter(log => log.communicationType === 'phone').length,
    smsCount: communicationLogs.filter(log => log.communicationType === 'sms').length,
    successRate: communicationLogs.length > 0 
      ? Math.round((communicationLogs.filter(log => log.status === 'delivered' || log.status === 'sent').length / communicationLogs.length) * 100)
      : 0,
    thisWeek: communicationLogs.filter(log => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(log.createdAt) > weekAgo;
    }).length,
    thisMonth: communicationLogs.filter(log => {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return new Date(log.createdAt) > monthAgo;
    }).length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <LandlordLayout activeRoute="/landlord/contact-management">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold tracking-tight">Contact Management</h1>
          </div>
          <p className="text-gray-600">
            Manage tenant communications, templates, and contact preferences.
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4" data-testid="tabs-contact-management">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">Communication History</TabsTrigger>
            <TabsTrigger value="templates" data-testid="tab-templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card data-testid="card-total-communications">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Communications</p>
                      <p className="text-2xl font-bold">{stats.totalCommunications}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-success-rate">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold">{stats.successRate}%</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-this-week">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">This Week</p>
                      <p className="text-2xl font-bold">{stats.thisWeek}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-this-month">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">This Month</p>
                      <p className="text-2xl font-bold">{stats.thisMonth}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Communication Method Breakdown */}
            <Card data-testid="card-communication-methods">
              <CardHeader>
                <CardTitle>Communication Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Mail className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-gray-600">{stats.emailCount} messages</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Phone className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-gray-600">{stats.phoneCount} calls</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <MessageSquare className="h-6 w-6 text-purple-600" />
                    <div>
                      <p className="font-medium">SMS/Text</p>
                      <p className="text-sm text-gray-600">{stats.smsCount} messages</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Communications */}
            <Card data-testid="card-recent-communications">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Communications</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab('history')}
                    data-testid="button-view-all-history"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : communicationLogs.slice(0, 5).length > 0 ? (
                  <div className="space-y-3">
                    {communicationLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(log.communicationType)}
                          <div>
                            <p className="font-medium">
                              {log.communicationType.charAt(0).toUpperCase() + log.communicationType.slice(1)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {log.subject || 'No subject'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatDate(log.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No communications yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication History Tab */}
          <TabsContent value="history" className="space-y-6">
            {/* Filters */}
            <Card data-testid="card-history-filters">
              <CardContent className="p-4">
                <div className="flex gap-4 items-center flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Filter:</span>
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32" data-testid="select-status-filter">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32" data-testid="select-type-filter">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-32" data-testid="select-date-filter">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="sm" data-testid="button-export-history">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Communication History List */}
            <Card data-testid="card-communication-history">
              <CardHeader>
                <CardTitle>Communication History</CardTitle>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : communicationLogs.length > 0 ? (
                  <div className="space-y-3">
                    {communicationLogs.map((log) => (
                      <div key={log.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(log.communicationType)}
                            <div>
                              <p className="font-medium">
                                {log.communicationType.charAt(0).toUpperCase() + log.communicationType.slice(1)}
                                {log.subject && ` - ${log.subject}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                Tenant ID: {log.tenantId}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getStatusColor(log.status)}>
                              {log.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatDate(log.createdAt)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-2">
                          {log.message}
                        </div>
                        
                        {log.templateId && (
                          <div className="flex items-center gap-1 mt-2">
                            <Template className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-500">Used template ID: {log.templateId}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No communication history found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <CommunicationTemplates />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card data-testid="card-analytics-placeholder">
              <CardHeader>
                <CardTitle>Communication Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Analytics Coming Soon</p>
                  <p>Detailed communication analytics and insights will be available here.</p>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Response Rate</p>
                      <p className="text-xl font-bold">{stats.successRate}%</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Avg Response Time</p>
                      <p className="text-xl font-bold">2.3 hrs</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Most Used Method</p>
                      <p className="text-xl font-bold">
                        {stats.emailCount >= Math.max(stats.phoneCount, stats.smsCount) 
                          ? 'Email' 
                          : stats.phoneCount >= stats.smsCount 
                            ? 'Phone' 
                            : 'SMS'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LandlordLayout>
  );
};

export default ContactManagement;