import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Eye, 
  Share2, 
  Clock, 
  TrendingUp,
  Monitor,
  Smartphone,
  Tablet,
  Users,
  MapPin,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';

interface ViewStats {
  totalViews: number;
  uniqueViews: number;
  avgViewDuration: number;
  topSources: { source: string; count: number }[];
  deviceBreakdown: { type: string; count: number }[];
}

interface SharingStats {
  bestPerformingMethod: string;
  totalShares: number;
  avgPerformanceScore: number;
  conversionsByMethod: { method: string; conversions: number }[];
}

interface ViewHistory {
  date: string;
  source: string;
  deviceType: string;
  duration: number;
  isUnique: boolean;
}

interface TenantAnalyticsData {
  summary: {
    totalViews: number;
    uniqueViews: number;
    avgViewDuration: number;
    totalShares: number;
    shareTokens: number;
  };
  viewStats: ViewStats;
  sharingStats: SharingStats;
  topSources: { source: string; count: number }[];
  deviceBreakdown: { type: string; count: number }[];
}

interface AnalyticsDashboardProps {
  tenantId: number;
}

type TimeFilter = '7days' | '30days' | '90days' | 'all';

const DEVICE_COLORS = {
  mobile: '#8884d8',
  desktop: '#82ca9d',
  tablet: '#ffc658'
};

const SOURCE_COLORS = {
  qr_code: '#8884d8',
  share_link: '#82ca9d',
  email: '#ffc658',
  sms: '#ff7300',
  social: '#00ff00',
  direct: '#0088fe'
};

export const TenantAnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tenantId }) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30days');
  const [activeTab, setActiveTab] = useState<'overview' | 'views' | 'sharing'>('overview');

  // Fetch tenant dashboard analytics
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['tenant-analytics-dashboard', tenantId, timeFilter],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/analytics/tenant/dashboard?timeframe=${timeFilter}`);
      return response.json() as Promise<TenantAnalyticsData>;
    }
  });

  // Fetch detailed view analytics
  const { data: viewData, isLoading: isViewLoading } = useQuery({
    queryKey: ['tenant-view-analytics', tenantId, timeFilter],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/analytics/tenant/${tenantId}/views?timeframe=${timeFilter}`);
      return response.json();
    }
  });

  // Fetch sharing analytics
  const { data: sharingData, isLoading: isSharingLoading } = useQuery({
    queryKey: ['tenant-sharing-analytics', tenantId, timeFilter],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/analytics/tenant/${tenantId}/sharing`);
      return response.json();
    }
  });

  const isLoading = isDashboardLoading || isViewLoading || isSharingLoading;

  if (dashboardError) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600 mb-2">Analytics Unavailable</h3>
          <p className="text-gray-500">Unable to load analytics data. Please try again later.</p>
        </div>
      </Card>
    );
  }

  const generateViewTrendData = () => {
    if (!viewData?.viewHistory) return [];
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        date: format(date, 'MMM dd'),
        views: 0,
        uniqueViews: 0
      };
    }).reverse();

    viewData.viewHistory.forEach((view: ViewHistory) => {
      const viewDate = format(parseISO(view.date), 'MMM dd');
      const dayData = last7Days.find(day => day.date === viewDate);
      if (dayData) {
        dayData.views += 1;
        if (view.isUnique) dayData.uniqueViews += 1;
      }
    });

    return last7Days;
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Views</p>
                <p className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : dashboardData?.summary.totalViews || 0}
                </p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Unique Viewers</p>
                <p className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : dashboardData?.summary.uniqueViews || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg View Time</p>
                <p className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : formatDuration(dashboardData?.summary.avgViewDuration || 0)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Shares</p>
                <p className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : dashboardData?.summary.totalShares || 0}
                </p>
              </div>
              <Share2 className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* View Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              View Trends (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={generateViewTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Total Views"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="uniqueViews" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Unique Views"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Device Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={dashboardData?.deviceBreakdown || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, count }) => `${type}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(dashboardData?.deviceBreakdown || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DEVICE_COLORS[entry.type as keyof typeof DEVICE_COLORS] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Top Traffic Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {(dashboardData?.topSources || []).map((source, index) => (
                <div key={source.source} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">#{index + 1}</Badge>
                    <span className="capitalize font-medium">{source.source.replace('_', ' ')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{source.count}</span>
                    <span className="text-sm text-gray-500 ml-1">views</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderViewsTab = () => (
    <div className="space-y-6">
      {/* View Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Eye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{viewData?.stats?.totalViews || 0}</p>
              <p className="text-sm text-gray-500">Total Views</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{viewData?.stats?.uniqueViews || 0}</p>
              <p className="text-sm text-gray-500">Unique Viewers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{formatDuration(viewData?.stats?.avgViewDuration || 0)}</p>
              <p className="text-sm text-gray-500">Avg Duration</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Views */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Views</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {(viewData?.recentViews || []).map((view: ViewHistory, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(view.deviceType)}
                    <div>
                      <p className="font-medium">{view.source.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-500">
                        {format(parseISO(view.date), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatDuration(view.duration)}</p>
                    {view.isUnique && <Badge variant="secondary" className="text-xs">New</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSharingTab = () => (
    <div className="space-y-6">
      {/* Sharing Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Share2 className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{sharingData?.stats?.totalShares || 0}</p>
              <p className="text-sm text-gray-500">Total Shares</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {sharingData?.stats?.avgPerformanceScore?.toFixed(1) || '0.0'}
              </p>
              <p className="text-sm text-gray-500">Avg Performance</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold capitalize">
                {sharingData?.stats?.bestPerformingMethod?.replace('_', ' ') || 'N/A'}
              </p>
              <p className="text-sm text-gray-500">Best Method</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sharing Methods Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Conversions by Sharing Method</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sharingData?.stats?.conversionsByMethod || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="conversions" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Sharing History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sharing Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {(sharingData?.sharingHistory || []).slice(0, 5).map((share: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Share2 className="w-4 h-4" />
                    <div>
                      <p className="font-medium capitalize">{share.method.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-500">
                        {format(parseISO(share.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{share.totalViews} views</p>
                    <p className="text-sm text-gray-500">{share.uniqueViewers} unique</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6" data-testid="tenant-analytics-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">RentCard Analytics</h2>
          <p className="text-gray-500">Track your RentCard performance and engagement</p>
        </div>
        
        {/* Time Filter */}
        <div className="flex gap-2">
          <Button 
            variant={timeFilter === '7days' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeFilter('7days')}
            data-testid="filter-7days"
          >
            7 Days
          </Button>
          <Button 
            variant={timeFilter === '30days' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeFilter('30days')}
            data-testid="filter-30days"
          >
            30 Days
          </Button>
          <Button 
            variant={timeFilter === '90days' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeFilter('90days')}
            data-testid="filter-90days"
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            data-testid="tab-overview"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </div>
          </button>
          <button
            onClick={() => setActiveTab('views')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'views'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            data-testid="tab-views"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Views
            </div>
          </button>
          <button
            onClick={() => setActiveTab('sharing')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sharing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            data-testid="tab-sharing"
          >
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Sharing
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'views' && renderViewsTab()}
        {activeTab === 'sharing' && renderSharingTab()}
      </div>
    </div>
  );
};

export default TenantAnalyticsDashboard;