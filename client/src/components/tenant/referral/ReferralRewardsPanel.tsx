import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Gift, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  CreditCard, 
  Award,
  Sparkles,
  Calendar,
  ArrowRight,
  Loader2,
  Trophy,
  Star,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import type { ReferralRewardsPanelProps, ReferralReward, ReferralStatusVariant } from "./types";

interface RewardCardProps {
  reward: ReferralReward;
  onClaim?: (rewardId: number) => void;
  isClaimPending?: boolean;
}

function formatCurrency(amountInCents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amountInCents / 100);
}

function formatRewardValue(reward: ReferralReward): string {
  switch (reward.rewardType) {
    case 'credit':
    case 'cash':
      return formatCurrency(reward.rewardValue, reward.rewardCurrency);
    case 'discount':
      return `${reward.rewardValue}% off`;
    case 'points':
      return `${reward.rewardValue.toLocaleString()} points`;
    case 'premium_feature':
      return 'Premium Access';
    default:
      return reward.rewardDescription;
  }
}

function getRewardIcon(rewardType: string) {
  switch (rewardType) {
    case 'credit':
    case 'cash':
      return <DollarSign className="w-4 h-4" />;
    case 'discount':
      return <Award className="w-4 h-4" />;
    case 'points':
      return <Star className="w-4 h-4" />;
    case 'premium_feature':
      return <Sparkles className="w-4 h-4" />;
    default:
      return <Gift className="w-4 h-4" />;
  }
}

function getStatusConfig(status: string): { label: string; variant: ReferralStatusVariant; icon: React.ReactNode } {
  switch (status) {
    case 'earned':
      return {
        label: 'Ready to Claim',
        variant: 'default',
        icon: <Gift className="w-3 h-3" />
      };
    case 'pending':
      return {
        label: 'Pending',
        variant: 'secondary',
        icon: <Clock className="w-3 h-3" />
      };
    case 'redeemed':
      return {
        label: 'Claimed',
        variant: 'success',
        icon: <CheckCircle className="w-3 h-3" />
      };
    case 'expired':
      return {
        label: 'Expired',
        variant: 'destructive',
        icon: <Clock className="w-3 h-3" />
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        variant: 'destructive',
        icon: <Clock className="w-3 h-3" />
      };
    default:
      return {
        label: status,
        variant: 'outline',
        icon: <Clock className="w-3 h-3" />
      };
  }
}

function RewardCard({ reward, onClaim, isClaimPending }: RewardCardProps) {
  const statusConfig = getStatusConfig(reward.status);
  const canClaim = reward.status === 'earned' && !isClaimPending;
  const isExpiring = reward.expiresAt && new Date(reward.expiresAt) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-200 hover:shadow-md",
      reward.status === 'earned' && "ring-2 ring-blue-100",
      isExpiring && "ring-2 ring-orange-100"
    )} data-testid={`reward-card-${reward.id}`}>
      {/* Premium gradient for high-value rewards */}
      {reward.rewardValue >= 5000 && reward.status === 'earned' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500" />
      )}
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              reward.status === 'earned' ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
            )}>
              {getRewardIcon(reward.rewardType)}
            </div>
            <div>
              <h3 className="font-medium text-sm" data-testid={`reward-title-${reward.id}`}>
                {formatRewardValue(reward)}
              </h3>
              <p className="text-xs text-gray-500">{reward.rewardDescription}</p>
            </div>
          </div>
          
          <Badge variant={statusConfig.variant} className="text-xs shrink-0">
            {statusConfig.icon}
            <span className="ml-1">{statusConfig.label}</span>
          </Badge>
        </div>

        {/* Reward details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Trigger: {reward.triggerEvent}</span>
            <span>Earned: {format(new Date(reward.earnedAt), 'MMM d')}</span>
          </div>
          
          {reward.expiresAt && (
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="w-3 h-3" />
              <span className={cn(
                isExpiring ? "text-orange-600 font-medium" : "text-gray-500"
              )}>
                Expires {formatDistanceToNow(new Date(reward.expiresAt), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>

        {/* Action button */}
        {canClaim && (
          <Button
            size="sm"
            onClick={() => onClaim?.(reward.id)}
            disabled={isClaimPending}
            className="w-full"
            data-testid={`button-claim-reward-${reward.id}`}
          >
            {isClaimPending ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Claiming...
              </>
            ) : (
              <>
                <Gift className="w-3 h-3 mr-2" />
                Claim Reward
              </>
            )}
          </Button>
        )}
        
        {reward.status === 'redeemed' && reward.redeemedAt && (
          <div className="text-xs text-gray-500 text-center">
            Claimed on {format(new Date(reward.redeemedAt), 'MMM d, yyyy')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RewardCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div>
              <Skeleton className="h-4 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="space-y-2 mb-4">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );
}

export function ReferralRewardsPanel({ 
  rewards, 
  isLoading = false, 
  onClaimReward, 
  className 
}: ReferralRewardsPanelProps) {
  const { toast } = useToast();
  const [claimingRewards, setClaimingRewards] = useState<Set<number>>(new Set());

  const handleClaimReward = async (rewardId: number) => {
    setClaimingRewards(prev => new Set(prev).add(rewardId));
    
    try {
      await onClaimReward?.(rewardId);
      toast({
        title: "Reward Claimed!",
        description: "Your reward has been successfully claimed.",
      });
    } catch (error) {
      toast({
        title: "Claim Failed",
        description: "Unable to claim reward. Please try again.",
        variant: "destructive"
      });
    } finally {
      setClaimingRewards(prev => {
        const newSet = new Set(prev);
        newSet.delete(rewardId);
        return newSet;
      });
    }
  };

  // Categorize rewards
  const earnedRewards = rewards.filter(r => r.status === 'earned');
  const pendingRewards = rewards.filter(r => r.status === 'pending');
  const redeemedRewards = rewards.filter(r => r.status === 'redeemed');
  const expiredRewards = rewards.filter(r => r.status === 'expired');

  // Calculate totals
  const totalEarned = earnedRewards.reduce((sum, reward) => sum + reward.rewardValue, 0);
  const totalPending = pendingRewards.reduce((sum, reward) => sum + reward.rewardValue, 0);
  const totalRedeemed = redeemedRewards.reduce((sum, reward) => sum + reward.rewardValue, 0);

  if (isLoading) {
    return (
      <Card className={cn("", className)} data-testid="referral-rewards-panel-loading">
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <RewardCardSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)} data-testid="referral-rewards-panel">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-500" />
              Rewards Center
            </CardTitle>
            <CardDescription>
              Claim your earned rewards and track your progress
            </CardDescription>
          </div>
          {earnedRewards.length > 0 && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              {earnedRewards.length} ready to claim
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary Stats */}
        {rewards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Available</span>
              </div>
              <div className="text-lg font-semibold text-green-700" data-testid="total-earned">
                {formatCurrency(totalEarned)}
              </div>
              <div className="text-xs text-green-600">{earnedRewards.length} rewards</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <div className="text-lg font-semibold text-blue-700" data-testid="total-pending">
                {formatCurrency(totalPending)}
              </div>
              <div className="text-xs text-blue-600">{pendingRewards.length} rewards</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Claimed</span>
              </div>
              <div className="text-lg font-semibold text-gray-700" data-testid="total-redeemed">
                {formatCurrency(totalRedeemed)}
              </div>
              <div className="text-xs text-gray-600">{redeemedRewards.length} rewards</div>
            </div>
          </div>
        )}

        {/* Rewards List */}
        {rewards.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Rewards Yet</h3>
            <p className="text-gray-500 mb-4">Start referring friends to earn your first rewards!</p>
            <Button variant="outline" size="sm">
              <ArrowRight className="w-4 h-4 mr-2" />
              Learn More About Rewards
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Earned Rewards */}
            {earnedRewards.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-green-600" />
                  Ready to Claim ({earnedRewards.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {earnedRewards.map((reward) => (
                    <RewardCard
                      key={reward.id}
                      reward={reward}
                      onClaim={handleClaimReward}
                      isClaimPending={claimingRewards.has(reward.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Pending Rewards */}
            {pendingRewards.length > 0 && (
              <>
                {earnedRewards.length > 0 && <Separator />}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Pending Approval ({pendingRewards.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingRewards.map((reward) => (
                      <RewardCard key={reward.id} reward={reward} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Recently Claimed */}
            {redeemedRewards.length > 0 && (
              <>
                {(earnedRewards.length > 0 || pendingRewards.length > 0) && <Separator />}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-gray-600" />
                    Recently Claimed ({redeemedRewards.slice(0, 6).length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {redeemedRewards.slice(0, 6).map((reward) => (
                      <RewardCard key={reward.id} reward={reward} />
                    ))}
                  </div>
                  {redeemedRewards.length > 6 && (
                    <Button variant="ghost" size="sm" className="w-full mt-4">
                      View All Claimed Rewards ({redeemedRewards.length})
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}