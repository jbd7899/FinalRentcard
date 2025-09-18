import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Share2, 
  TrendingUp, 
  Gift, 
  History, 
  AlertCircle, 
  Sparkles,
  Users,
  Target,
  Award,
  Zap,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/stores/authStore";
import { SOCIAL_PROOF_STATS, VIRAL_MESSAGING } from "@/constants";

// Import our referral components
import { ReferralStatsCard } from "./ReferralStatsCard";
import { ReferralLinkGenerator } from "./ReferralLinkGenerator";
import { ReferralRewardsPanel } from "./ReferralRewardsPanel";
import { ReferralHistoryTable } from "./ReferralHistoryTable";

import type { 
  ReferralDashboardProps,
  ReferralStatsData,
  ReferralLink,
  ReferralReward,
  ReferralHistoryItem,
  ReferralStatsResponse,
  ClaimRewardRequest,
  ClaimRewardResponse
} from "./types";

// Transform backend API response to match frontend types
function transformApiStatsData(apiResponse: any): ReferralStatsData {
  const stats = apiResponse.stats;
  const summary = apiResponse.summary;
  
  return {
    totalReferrals: stats.totalReferrals || 0,
    convertedReferrals: stats.convertedReferrals || 0,
    pendingReferrals: stats.pendingReferrals || 0,
    totalRewards: stats.totalRewards || 0,
    pendingRewards: stats.pendingRewards || 0,
    redeemedRewards: stats.redeemedRewards || 0,
    conversionRate: stats.conversionRate || 0,
    totalEarnings: (stats.claimedRewards || 0) + (stats.pendingRewards || 0),
    pendingEarnings: stats.pendingRewards || 0,
    thisMonthReferrals: stats.thisMonthReferrals || 0,
    thisMonthConversions: stats.thisMonthConversions || 0,
    topReferralSource: stats.topReferralSource || 'direct'
  };
}

function transformApiRewards(apiRewards: any[]): ReferralReward[] {
  return apiRewards.map((reward: any) => ({
    id: reward.id,
    referralId: reward.referralId || 0,
    recipientUserId: reward.recipientUserId,
    recipientType: reward.recipientType || 'referrer',
    recipientEmail: reward.recipientEmail || '',
    rewardType: reward.type || reward.rewardType || 'credit',
    rewardValue: reward.value || reward.rewardValue || 0,
    rewardCurrency: reward.rewardCurrency || 'USD',
    rewardDescription: reward.description || reward.rewardDescription || '',
    triggerEvent: reward.triggerEvent || 'signup',
    status: reward.status || 'earned',
    earnedAt: reward.earnedAt || new Date().toISOString(),
    redeemedAt: reward.redeemedAt,
    expiresAt: reward.expiresAt,
    createdAt: reward.createdAt || new Date().toISOString(),
    updatedAt: reward.updatedAt || new Date().toISOString()
  }));
}

function transformApiReferrals(apiReferrals: any[]): ReferralHistoryItem[] {
  return apiReferrals.map((referral: any) => {
    const daysAgo = Math.floor((Date.now() - new Date(referral.createdAt).getTime()) / (24 * 60 * 60 * 1000));
    const displayName = referral.refereeName || referral.refereeEmail?.split('@')[0] || 'Unknown';
    const statusText = referral.status === 'converted' ? 'Successfully joined' : 
                      referral.status === 'pending' ? 'Invitation sent' : 
                      referral.status;
    
    return {
      ...referral,
      refereeDisplayName: displayName,
      statusDisplayText: statusText,
      sourceDisplayText: referral.referralSource === 'email' ? 'Email invitation' : 
                        referral.referralSource === 'sms' ? 'SMS message' : 
                        referral.referralSource === 'direct_link' ? 'Direct link' : 
                        referral.referralSource || 'Direct',
      rewardDisplayText: referral.status === 'converted' ? '$25.00' : undefined,
      daysAgo
    };
  });
}

export function ReferralDashboard({ userId, className }: ReferralDashboardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuthStore();
  
  // Use userId from props or fallback to current user
  const targetUserId = userId || user?.id;

  // Fetch referral stats and data - this is the main query that gets all the data
  const { 
    data: statsResponse, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useQuery({
    queryKey: ['/api/referrals/stats', targetUserId],
    queryFn: async () => {
      if (!targetUserId) {
        throw new Error('User ID is required');
      }
      const response = await fetch(`/api/referrals/stats/${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch referral stats: ${response.status}`);
      }
      
      return response.json();
    },
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  // Extract transformed data from stats response
  const statsData = statsResponse ? transformApiStatsData(statsResponse) : null;
  const recentReferrals = statsResponse?.recentReferrals || [];
  const availableRewards = statsResponse?.availableRewards || [];
  
  // Transform the data for display
  const rewards = transformApiRewards(availableRewards);
  const history = transformApiReferrals(recentReferrals);
  
  // All loading states are tied to the main stats query
  const rewardsLoading = statsLoading;
  const historyLoading = statsLoading;

  // Claim reward mutation
  const claimRewardMutation = useMutation({
    mutationFn: async (request: ClaimRewardRequest): Promise<ClaimRewardResponse> => {
      const response = await fetch('/api/referrals/claim-reward', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to claim reward');
      }
      
      const data = await response.json();
      return {
        success: data.success,
        reward: {
          ...data.reward,
          rewardType: data.reward.type || data.reward.rewardType,
          rewardValue: data.reward.value || data.reward.rewardValue,
          rewardDescription: data.reward.description || data.reward.rewardDescription,
          recipientUserId: targetUserId,
          recipientType: 'referrer',
          recipientEmail: user?.email || '',
          triggerEvent: 'signup',
          createdAt: data.reward.createdAt || new Date().toISOString(),
          updatedAt: data.reward.updatedAt || new Date().toISOString(),
          earnedAt: data.reward.earnedAt || new Date().toISOString()
        },
        message: data.message
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Network Reward Claimed!",
        description: data.message || 'Thank you for growing our community! Reward claimed successfully.',
      });
      
      // Invalidate and refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/referrals/stats', targetUserId] });
    },
    onError: (error) => {
      console.error('Failed to claim reward:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to claim reward',
        variant: "destructive",
      });
    }
  });

  // Handle link generation
  const handleLinkGenerated = (newLink: ReferralLink) => {
    console.log('New referral link generated:', newLink);
    // Refresh stats to get updated link info
    refetchStats();
  };

  // Handle refresh functionality
  const handleRefreshAll = async () => {
    try {
      await refetchStats();
      
      toast({
        title: "Data Refreshed",
        description: "All referral data has been updated",
      });
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
      });
    }
  };

  // Show loading state if no user ID is available
  if (!targetUserId) {
    return (
      <Card className={cn("max-w-4xl mx-auto", className)} data-testid="referral-dashboard-no-user">
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please log in to view your referral dashboard.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (statsError) {
    return (
      <Card className={cn("max-w-4xl mx-auto", className)} data-testid="referral-dashboard-error">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Error Loading Referrals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {statsError instanceof Error ? statsError.message : 'Unable to load referral data. Please check your connection and try again.'}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={() => refetchStats()} 
              variant="outline"
              data-testid="button-retry-loading"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              data-testid="button-reload-page"
            >
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6 max-w-6xl mx-auto", className)} data-testid="referral-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            Network Growth Hub
          </h1>
          <p className="text-gray-600">
            Help grow our individual landlord network - invite friends, earn rewards, and build connections together
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefreshAll}
            variant="outline"
            size="sm"
            disabled={statsLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {statsData && (
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <div className="flex items-center gap-2 text-sm">
                <Award className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-700">
                  Help grow the individual landlord network! Next reward at {statsData.totalReferrals + 1} referrals
                </span>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {!statsLoading && statsData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('share')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Share2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">Grow Network</div>
                <div className="text-sm text-gray-500">Invite to community</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('rewards')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium">Network Rewards</div>
                <div className="text-sm text-gray-500">{rewards.filter(r => r.status === 'earned').length} earned</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('history')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <History className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-medium">View History</div>
                <div className="text-sm text-gray-500">{history.length} referrals</div>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Loading state for quick actions */}
      {statsLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <TrendingUp className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="share" data-testid="tab-share">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </TabsTrigger>
          <TabsTrigger value="rewards" data-testid="tab-rewards">
            <Gift className="w-4 h-4 mr-2" />
            Rewards
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">
            <History className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <ReferralStatsCard 
            stats={statsData || {
              totalReferrals: 0,
              convertedReferrals: 0,
              pendingReferrals: 0,
              totalRewards: 0,
              pendingRewards: 0,
              redeemedRewards: 0,
              conversionRate: 0,
              totalEarnings: 0,
              pendingEarnings: 0,
              thisMonthReferrals: 0,
              thisMonthConversions: 0,
              topReferralSource: ''
            }} 
            isLoading={statsLoading} 
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReferralLinkGenerator 
              userId={targetUserId}
              onLinkGenerated={handleLinkGenerated}
            />
            
            <ReferralRewardsPanel 
              rewards={rewards.slice(0, 3)} // Show first 3 rewards
              isLoading={rewardsLoading}
              onClaimReward={(rewardId) => claimRewardMutation.mutate({ rewardId })}
            />
          </div>
        </TabsContent>

        {/* Share Tab */}
        <TabsContent value="share" className="space-y-6">
          <ReferralLinkGenerator 
            userId={targetUserId}
            onLinkGenerated={handleLinkGenerated}
          />
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <ReferralRewardsPanel 
            rewards={rewards}
            isLoading={rewardsLoading}
            onClaimReward={(rewardId) => claimRewardMutation.mutate({ rewardId })}
          />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <ReferralHistoryTable 
            referrals={history}
            isLoading={historyLoading}
            onRefresh={handleRefreshAll}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}