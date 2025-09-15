import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Activity,
  Building2,
  UserCheck,
  Target,
  Percent,
  ArrowUp,
  ArrowDown
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
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';

interface PropertyAnalytics {
  propertyId: number;
  address: string;
  totalViews: number;
  uniqueViews: number;
  avgViewDuration: number;
  totalShares: number;
  interestCount: number;
  conversionRate: number;
  trendData: { date: string; views: number; interests: number }[];
}

interface LandlordAnalyticsData {
  summary: {
    totalProperties: number;
    totalViews: number;
    totalInterests: number;
    avgConversionRate: number;
    bestPerformingProperty: string;
    totalActiveShares: number;
  };
  propertyAnalytics: PropertyAnalytics[];
  topSources: { source: string; count: number; percentage: number }[];
  deviceBreakdown: { type: string; count: number; percentage: number }[];
  conversionTrends: { date: string; conversions: number; views: number; rate: number }[];
  interestsByTimeOfDay: { hour: number; count: number }[];
  geographicData: { region: string; views: number; interests: number }[];
}

interface LandlordAnalyticsDashboardProps {
  landlordId: number;
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

export const LandlordAnalyticsDashboard: React.FC<LandlordAnalyticsDashboardProps> = ({ landlordId }) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30days');
  const [selectedProperty, setSelectedProperty] = useState<number | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'interests' | 'sources'>('overview');

  // Fetch landlord dashboard analytics
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['landlord-analytics-dashboard', landlordId, timeFilter, selectedProperty],
    queryFn: async () => {
      const params = new URLSearchParams({
        timeframe: timeFilter,
        ...(selectedProperty !== 'all' && { propertyId: selectedProperty.toString() })
      });
      const response = await apiRequest('GET', `/api/analytics/landlord/dashboard?${params}`);
      return response.json() as Promise<LandlordAnalyticsData>;
    }
  });

  // Fetch property-specific analytics
  const { data: propertyData, isLoading: isPropertyLoading } = useQuery({
    queryKey: ['landlord-property-analytics', landlordId, timeFilter],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/analytics/landlord/${landlordId}/properties?timeframe=${timeFilter}`);
      return response.json();
    }
  });

  // Fetch interest analytics
  const { data: interestData, isLoading: isInterestLoading } = useQuery({
    queryKey: ['landlord-interest-analytics', landlordId, timeFilter],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/analytics/landlord/${landlordId}/interests?timeframe=${timeFilter}`);
      return response.json();
    }
  });

  const isLoading = isDashboardLoading || isPropertyLoading || isInterestLoading;

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

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const generateConversionTrendData = () => {
    if (!dashboardData?.conversionTrends) return [];
    return dashboardData.conversionTrends.map(item => ({
      ...item,
      rate: item.conversions / Math.max(item.views, 1) * 100
    }));
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Properties</p>
                <p className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : dashboardData?.summary.totalProperties || 0}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Views</p>
                <p className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : dashboardData?.summary.totalViews || 0}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Interests</p>
                <p className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : dashboardData?.summary.totalInterests || 0}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Conversion Rate</p>
                <p className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : formatPercentage(dashboardData?.summary.avgConversionRate || 0)}
                </p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Conversion Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={generateConversionTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'rate' ? `${typeof value === 'number' ? value.toFixed(1) : value}%` : value,
                    name === 'rate' ? 'Conversion Rate' : name
                  ]} />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stackId="1"
                    stroke="#8884d8" 
                    fill="#8884d8"
                    name="Views"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="conversions" 
                    stackId="1"
                    stroke="#82ca9d" 
                    fill="#82ca9d"
                    name="Interests"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={dashboardData?.topSources || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ source, percentage }) => `${source}: ${(percentage * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(dashboardData?.topSources || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SOURCE_COLORS[entry.source as keyof typeof SOURCE_COLORS] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Best Performing Properties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Property Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {(dashboardData?.propertyAnalytics || []).slice(0, 5).map((property, index) => (
                <div key={property.propertyId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">#{index + 1}</Badge>
                    <div>
                      <p className="font-medium">{property.address}</p>
                      <p className="text-sm text-gray-500">
                        {property.totalViews} views • {property.interestCount} interests
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatPercentage(property.conversionRate)}</p>
                    <p className="text-sm text-gray-500">conversion</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderPropertiesTab = () => (
    <div className="space-y-6">
      {/* Property Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {(dashboardData?.propertyAnalytics || []).map((property) => (
          <Card key={property.propertyId}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{property.address}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{property.totalViews}</p>
                  <p className="text-sm text-gray-500">Total Views</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{property.interestCount}</p>
                  <p className="text-sm text-gray-500">Interests</p>
                </div>
              </div>
              
              <div className="text-center py-2 bg-gray-50 rounded">
                <p className="text-xl font-bold text-purple-600">{formatPercentage(property.conversionRate)}</p>
                <p className="text-sm text-gray-500">Conversion Rate</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Unique Views</p>
                  <p className="font-medium">{property.uniqueViews}</p>
                </div>
                <div>
                  <p className="text-gray-500">Avg Duration</p>
                  <p className="font-medium">{formatDuration(property.avgViewDuration)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderInterestsTab = () => (
    <div className="space-y-6">
      {/* Interest Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <UserCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{interestData?.stats?.totalInterests || 0}</p>
              <p className="text-sm text-gray-500">Total Interests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {formatPercentage(interestData?.stats?.avgConversionRate || 0)}
              </p>
              <p className="text-sm text-gray-500">Avg Conversion</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {Math.round(interestData?.stats?.avgTimeToInterest || 0)}h
              </p>
              <p className="text-sm text-gray-500">Avg Time to Interest</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interest Activity by Time */}
      <Card>
        <CardHeader>
          <CardTitle>Interest Activity by Hour</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboardData?.interestsByTimeOfDay || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent Interest Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Interest Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {(interestData?.recentInterests || []).slice(0, 10).map((interest: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-4 h-4" />
                    <div>
                      <p className="font-medium">{interest.property}</p>
                      <p className="text-sm text-gray-500">
                        {format(parseISO(interest.date), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{interest.source}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSourcesTab = () => (
    <div className="space-y-6">
      {/* Source Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dashboardData?.topSources || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="source" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
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
                    label={({ type, percentage }) => `${type}: ${(percentage * 100).toFixed(1)}%`}
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

      {/* Geographic Data */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {(dashboardData?.geographicData || []).map((region, index) => (
                <div key={region.region} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{region.region}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{region.views}</span>
                    <span className="text-sm text-gray-500 ml-1">views</span>
                    <span className="text-sm text-gray-500 ml-3">{region.interests} interests</span>
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
    <div className="space-y-6" data-testid="landlord-analytics-dashboard">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Property Analytics</h2>
          <p className="text-gray-500">Track your property views and tenant interest</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Property Filter */}
          <Select value={selectedProperty.toString()} onValueChange={(value) => setSelectedProperty(value === 'all' ? 'all' : parseInt(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {(propertyData?.properties || []).map((property: any) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.address}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
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
            onClick={() => setActiveTab('properties')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'properties'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            data-testid="tab-properties"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Properties
            </div>
          </button>
          <button
            onClick={() => setActiveTab('interests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'interests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            data-testid="tab-interests"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Interests
            </div>
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sources'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            data-testid="tab-sources"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Sources
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'properties' && renderPropertiesTab()}
        {activeTab === 'interests' && renderInterestsTab()}
        {activeTab === 'sources' && renderSourcesTab()}
      </div>
    </div>
  );
};

export default LandlordAnalyticsDashboard;