import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Gift, 
  Target,
  Calendar,
  Share2,
  Award,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReferralStatsCardProps, ReferralStatsData } from "./types";

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  valueClassName?: string;
}

function StatItem({ 
  icon, 
  label, 
  value, 
  subValue, 
  trend, 
  trendValue, 
  className,
  valueClassName 
}: StatItemProps) {
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
        <div className="text-blue-600">{icon}</div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={cn("text-2xl font-semibold", valueClassName)} data-testid={`stat-value-${label.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </p>
          {trend && trendValue && (
            <Badge 
              variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600">{label}</p>
        {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
      </div>
    </div>
  );
}

function StatItemSkeleton() {
  return (
    <div className="flex items-center space-x-3">
      <Skeleton className="w-10 h-10 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

function formatCurrency(amountInCents: number): string {
  return `$${(amountInCents / 100).toFixed(2)}`;
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function ReferralStatsCard({ 
  stats, 
  isLoading = false, 
  className 
}: ReferralStatsCardProps) {
  if (isLoading) {
    return (
      <Card className={cn("", className)} data-testid="referral-stats-card-loading">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="w-12 h-12 rounded-lg" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <StatItemSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const conversionRate = stats.totalReferrals > 0 
    ? (stats.convertedReferrals / stats.totalReferrals) * 100 
    : 0;

  const monthlyGrowth = stats.thisMonthReferrals > 0 && stats.totalReferrals > stats.thisMonthReferrals
    ? ((stats.thisMonthReferrals / (stats.totalReferrals - stats.thisMonthReferrals)) * 100)
    : 0;

  return (
    <Card className={cn("", className)} data-testid="referral-stats-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-600" />
              Referral Performance
            </CardTitle>
            <CardDescription>
              Track your referral success and earnings
            </CardDescription>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              {stats.topReferralSource || 'Direct'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Referrals */}
          <StatItem
            icon={<Users className="w-5 h-5" />}
            label="Total Referrals"
            value={stats.totalReferrals}
            subValue={`${stats.thisMonthReferrals} this month`}
            trend={monthlyGrowth > 0 ? 'up' : monthlyGrowth < 0 ? 'down' : 'neutral'}
            trendValue={monthlyGrowth > 0 ? `${monthlyGrowth.toFixed(1)}%` : undefined}
          />

          {/* Conversion Rate */}
          <StatItem
            icon={<Target className="w-5 h-5" />}
            label="Conversion Rate"
            value={formatPercentage(conversionRate)}
            subValue={`${stats.convertedReferrals} of ${stats.totalReferrals} converted`}
            trend={conversionRate >= 20 ? 'up' : conversionRate >= 10 ? 'neutral' : 'down'}
            valueClassName="text-green-600"
          />

          {/* Pending Referrals */}
          <StatItem
            icon={<Clock className="w-5 h-5" />}
            label="Pending Referrals"
            value={stats.pendingReferrals}
            subValue="Awaiting conversion"
            className="md:col-span-2 lg:col-span-1"
          />

          {/* Total Earnings */}
          <StatItem
            icon={<DollarSign className="w-5 h-5" />}
            label="Total Earnings"
            value={formatCurrency(stats.totalEarnings)}
            subValue={`${formatCurrency(stats.pendingEarnings)} pending`}
            valueClassName="text-green-600 font-bold"
          />

          {/* Available Rewards */}
          <StatItem
            icon={<Gift className="w-5 h-5" />}
            label="Available Rewards"
            value={stats.totalRewards - stats.redeemedRewards}
            subValue={`${stats.redeemedRewards} redeemed`}
            trend={stats.pendingRewards > 0 ? 'up' : 'neutral'}
            trendValue={stats.pendingRewards > 0 ? `${stats.pendingRewards} pending` : undefined}
          />

          {/* This Month's Activity */}
          <StatItem
            icon={<Calendar className="w-5 h-5" />}
            label="This Month"
            value={stats.thisMonthConversions}
            subValue="Conversions"
            trend={stats.thisMonthConversions > stats.thisMonthReferrals / 2 ? 'up' : 'neutral'}
            className="lg:col-span-1"
          />
        </div>

        {/* Additional insights section */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">
                  Best performing: <span className="font-medium">{stats.topReferralSource || 'Direct Link'}</span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">
                {stats.totalRewards > 0 ? (
                  <>Earned <span className="font-medium">{stats.totalRewards}</span> rewards</>
                ) : (
                  'Start referring to earn rewards!'
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Quick stats bar for mobile */}
        <div className="mt-4 sm:hidden">
          <div className="flex justify-between items-center text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            <div className="text-center">
              <div className="font-medium text-gray-900">{formatPercentage(conversionRate)}</div>
              <div>Conversion</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">{formatCurrency(stats.totalEarnings)}</div>
              <div>Earned</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">{stats.pendingReferrals}</div>
              <div>Pending</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}