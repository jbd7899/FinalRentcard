import React, { useState } from 'react';
import {
  Plus,
  Building,
  Users,
  Eye,
  Edit,
  Send,
  Mail,
  Phone,
  ExternalLink,
  Info,
  LogOut,
  Loader2,
  QrCode,
  Copy,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/shared/navbar";
import { QRCodeSVG } from 'qrcode.react';
import { Property, Application } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfToday } from 'date-fns';
import { 
  ROUTES, 
  API_ENDPOINTS, 
  CONFIG, 
  MESSAGES, 
  USER_ROLES 
} from '@/constants';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { useLocation } from "wouter";
import { useUIStore } from '@/stores/uiStore';

type TimeFilter = '7days' | '30days' | '90days' | 'all';

interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  type: 'views' | 'submissions';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, description, icon, type }) => {
  const { 
    dashboard: { 
      timeFilter, 
      showChart, 
      setTimeFilter, 
      setShowChart 
    } 
  } = useUIStore();

  // Generate dummy data based on timeframe
  const generateDummyData = (timeframe: TimeFilter) => {
    const data = [];
    const now = new Date();
    const baseValue = type === 'views' ? 50 : 8; // Base value for views/submissions

    switch (timeframe) {
      case '7days':
        // Generate daily data for last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const randomFactor = 0.7 + Math.random() * 0.6;
          data.push({
            date: date.toISOString(),
            count: Math.round(baseValue * randomFactor)
          });
        }
        break;
      
      case '30days':
        // Generate daily data for last 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const randomFactor = 0.6 + Math.random() * 0.8;
          // Add a slight upward trend
          const trendFactor = 1 + ((30 - i) / 30) * 0.5;
          data.push({
            date: date.toISOString(),
            count: Math.round(baseValue * randomFactor * trendFactor)
          });
        }
        break;
      
      case '90days':
        // Generate daily data for last 90 days
        for (let i = 89; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const randomFactor = 0.6 + Math.random() * 0.8;
          // Add a slight upward trend
          const trendFactor = 1 + ((90 - i) / 90) * 0.5;
          data.push({
            date: date.toISOString(),
            count: Math.round(baseValue * randomFactor * trendFactor)
          });
        }
        break;
      
      case 'all':
        // Generate data for all time
        for (let i = 0; i < 365; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const randomFactor = 0.5 + Math.random();
          data.push({
            date: date.toISOString(),
            count: Math.round(baseValue * randomFactor * (i < now.getDate() ? 1 : 0))
          });
        }
        break;
    }

    return {
      data,
      total: data.reduce((sum, point) => sum + point.count, 0)
    };
  };

  const { data: chartData, isLoading } = useQuery({
    queryKey: [type === 'views' ? 'viewsStats' : 'submissionsStats', timeFilter],
    queryFn: async () => {
      try {
        const endpoint = type === 'views' ? API_ENDPOINTS.STATS.VIEWS : API_ENDPOINTS.STATS.SUBMISSIONS;
        const response = await apiRequest('GET', `${endpoint}?timeframe=${timeFilter}`);
        return response.json();
      } catch (error) {
        // Return dummy data if API fails
        return generateDummyData(timeFilter);
      }
    }
  });

  const getDateRange = () => {
    switch (timeFilter) {
      case '7days':
        return 'Last 7 Days';
      case '30days':
        return 'Last 30 Days';
      case '90days':
        return 'Last 90 Days';
      case 'all':
        return 'All Time';
      default:
        return 'Last 7 Days';
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowChart(true);
  };

  return (
    <>
      <Card 
        className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 active:scale-[0.99] relative group"
        onClick={handleCardClick}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground">{title}</p>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full hidden sm:inline-block">
                  Click for trends
                </span>
              </div>
              <p className="text-2xl font-semibold mt-1">{value}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {icon}
              <span className="text-xs text-primary sm:hidden">
                Tap for trends
              </span>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </CardContent>
      </Card>

      <Dialog open={showChart} onOpenChange={setShowChart}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{title} - {getDateRange()}</span>
              <div className="flex gap-2">
                <Button 
                  variant={timeFilter === '7days' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setTimeFilter('7days')}
                >
                  7 Days
                </Button>
                <Button 
                  variant={timeFilter === '30days' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setTimeFilter('30days')}
                >
                  30 Days
                </Button>
                <Button 
                  variant={timeFilter === '90days' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setTimeFilter('90days')}
                >
                  90 Days
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>
              View trends over time for {title.toLowerCase()}
            </DialogDescription>
          </DialogHeader>

          <div className="h-[300px] mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : chartData?.data ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.data}>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), timeFilter === '7days' ? 'MMM dd' : timeFilter === '30days' ? 'MMM dd' : timeFilter === '90days' ? 'MMM dd' : 'MMM dd, yyyy')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), timeFilter === '7days' ? 'MMM dd, yyyy' : timeFilter === '30days' ? 'MMM dd, yyyy' : timeFilter === '90days' ? 'MMM dd, yyyy' : 'MMM dd, yyyy')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data available
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChart(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface ScreeningActionsProps {
  screeningLink: string;
  propertyId: number;
  submissionCount: number;
  viewCount: number;
}

const ScreeningActions: React.FC<ScreeningActionsProps> = ({ screeningLink, propertyId, submissionCount, viewCount }) => {
  const { 
    dashboard: { 
      showQRCode, 
      showCopyAlert, 
      setShowQRCode, 
      setShowCopyAlert 
    } 
  } = useUIStore();

  const getScreeningPageUrl = (slug: string) => {
    return `${window.location.origin}${ROUTES.LANDLORD.SCREENING}/${slug}`;
  };

  const handleCopyLink = async () => {
    try {
      const fullUrl = getScreeningPageUrl(screeningLink);
      await navigator.clipboard.writeText(fullUrl);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), CONFIG.TOAST.DEFAULT_DURATION);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setShowQRCode(true)}
        >
          <QrCode className="w-4 h-4 mr-2" />
          Show QR Code
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full relative"
          onClick={handleCopyLink}
        >
          {showCopyAlert ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </>
          )}
        </Button>
      </div>

      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Screening Page QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code to access the screening page
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            <QRCodeSVG
              value={getScreeningPageUrl(screeningLink)}
              size={200}
              level="H"
              includeMargin
              imageSettings={{
                src: "/logo.png",
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowQRCode(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface PropertyWithCount extends Property {
  applicationCount: number | null;
  viewCount: number | null;
}

const LandlordDashboard = () => {
  const { user, logout } = useAuthStore();
  const { modal, openModal, closeModal } = useUIStore();
  const [, setLocation] = useLocation();

  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: [API_ENDPOINTS.PROPERTIES.BASE],
    queryFn: async () => {
      const response = await apiRequest('GET', API_ENDPOINTS.PROPERTIES.BASE);
      return response.json() as Promise<PropertyWithCount[]>;
    },
    enabled: !!user?.id
  });

  const totalSubmissions = properties?.reduce((sum, property) => {
    return sum + (property.applicationCount || 0);
  }, 0) || 0;
  const activeProperties = properties?.length || 0;
  const totalViews = properties?.reduce((sum, property) => {
    return sum + (property.viewCount || 0);
  }, 0) || 0;

  const handleLogout = () => {
    logout();
    setLocation(ROUTES.AUTH);
  };

  const showRequestModal = modal?.type === 'requestRentCard';

  const RequestModal = () => (
    <Dialog open={showRequestModal} onOpenChange={() => closeModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request RentCard</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Tenant Name</Label>
            <Input placeholder="Enter tenant's name" />
          </div>

          <div>
            <Label>Contact Method</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="justify-start">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" className="justify-start">
                <Phone className="w-4 h-4 mr-2" />
                SMS
              </Button>
            </div>
          </div>

          <div>
            <Label>Email or Phone Number</Label>
            <Input placeholder="Enter contact information" />
          </div>

          <div>
            <Label>Message (Optional)</Label>
            <Textarea
              rows={3}
              placeholder="Add a personal message..."
              defaultValue="Hi! Please complete your RentCard profile to apply for my property."
            />
          </div>

          <Button className="w-full">
            <Send className="w-4 h-4 mr-2" />
            Send Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{CONFIG.APP.NAME} Dashboard</h1>
            <p className="text-muted-foreground">Manage your screening pages and applications</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => openModal('requestRentCard')}>
              <Send className="w-4 h-4 mr-2" />
              Request RentCard
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatsCard
            title="Page Views"
            value={totalViews}
            description="Total screening page views"
            icon={<Eye className="w-8 h-8 text-primary" />}
            type="views"
          />

          <StatsCard
            title="Total Submissions"
            value={totalSubmissions}
            description="From all properties"
            icon={<Users className="w-8 h-8 text-primary" />}
            type="submissions"
          />

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">Active Properties</p>
                  <p className="text-2xl font-semibold mt-1">{activeProperties}</p>
                  <Link href={ROUTES.LANDLORD.ADD_PROPERTY} className="text-sm text-primary hover:underline cursor-pointer">
                    + Add Property
                  </Link>
                </div>
                <Building className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-6xl mx-auto mb-8">
          <Card className="bg-primary/5">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2 text-primary" />
                How to Use Your Screening Pages
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium mb-2">1. Share Your Links</h3>
                  <p className="text-sm text-muted-foreground">
                    Add your screening page link to listings or share directly with potential tenants.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">2. Request RentCards</h3>
                  <p className="text-sm text-muted-foreground">
                    Send requests to prospects via email or SMS to get their completed RentCard.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">3. Review Applications</h3>
                  <p className="text-sm text-muted-foreground">
                    Get instant access to verified tenant profiles that match your requirements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Property Screening Pages</h2>
            <Button 
              variant="link" 
              className="p-0 h-auto"
              onClick={() => setLocation(ROUTES.LANDLORD.ADD_PROPERTY)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Property
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {propertiesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : properties && properties.length > 0 ? (
                <div className="space-y-6">
                  {properties.map((property) => (
                    <Card key={property.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-medium">{property.address}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {property.bedrooms} bed • {property.bathrooms} bath • ${property.rent}/month
                            </p>
                          </div>
                          <Link href={`${ROUTES.LANDLORD.PROPERTIES}/${property.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>

                        <ScreeningActions
                          screeningLink={property.screeningPageSlug || `property-${property.id}`}
                          propertyId={property.id}
                          submissionCount={property.applicationCount || 0}
                          viewCount={property.viewCount || 0}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8">
                  <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No properties added yet</p>
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={() => setLocation(ROUTES.LANDLORD.ADD_PROPERTY)}
                  >
                    Add your first property
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <RequestModal />
      </div>
    </div>
  );
};

export default LandlordDashboard;