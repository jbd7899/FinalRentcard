import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  RefreshCw,
  History,
  User,
  Mail,
  Calendar,
  TrendingUp,
  Gift,
  ExternalLink,
  Filter,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Share2,
  MessageSquare,
  Smartphone,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import type { ReferralHistoryTableProps, ReferralHistoryItem, ReferralStatusVariant } from "./types";

interface StatusConfig {
  label: string;
  variant: ReferralStatusVariant;
  icon: React.ReactNode;
  description: string;
}

function getStatusConfig(status: string): StatusConfig {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending',
        variant: 'secondary',
        icon: <Clock className="w-3 h-3" />,
        description: 'Waiting for signup'
      };
    case 'converted':
      return {
        label: 'Converted',
        variant: 'default',
        icon: <CheckCircle className="w-3 h-3" />,
        description: 'Successfully signed up'
      };
    case 'rewarded':
      return {
        label: 'Rewarded',
        variant: 'default',
        icon: <Gift className="w-3 h-3" />,
        description: 'Reward earned'
      };
    case 'expired':
      return {
        label: 'Expired',
        variant: 'destructive',
        icon: <XCircle className="w-3 h-3" />,
        description: 'Referral expired'
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        variant: 'destructive',
        icon: <XCircle className="w-3 h-3" />,
        description: 'Referral cancelled'
      };
    default:
      return {
        label: status,
        variant: 'outline',
        icon: <AlertCircle className="w-3 h-3" />,
        description: 'Unknown status'
      };
  }
}

function getSourceIcon(source: string) {
  switch (source) {
    case 'email':
      return <Mail className="w-3 h-3" />;
    case 'sms':
      return <MessageSquare className="w-3 h-3" />;
    case 'social':
      return <Share2 className="w-3 h-3" />;
    case 'qr_code':
      return <Smartphone className="w-3 h-3" />;
    case 'direct_link':
      return <ExternalLink className="w-3 h-3" />;
    default:
      return <Globe className="w-3 h-3" />;
  }
}

function formatSource(source: string): string {
  switch (source) {
    case 'direct_link':
      return 'Direct Link';
    case 'qr_code':
      return 'QR Code';
    default:
      return source.charAt(0).toUpperCase() + source.slice(1);
  }
}

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
    </TableRow>
  );
}

function ReferralRow({ referral }: { referral: ReferralHistoryItem }) {
  const statusConfig = getStatusConfig(referral.status);
  const sourceIcon = getSourceIcon(referral.referralSource);
  
  return (
    <TableRow 
      className="hover:bg-gray-50 transition-colors"
      data-testid={`referral-row-${referral.id}`}
    >
      {/* Referee */}
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
            {referral.refereeDisplayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-sm truncate" data-testid={`referee-name-${referral.id}`}>
              {referral.refereeDisplayName}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {referral.refereeEmail}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Badge 
          variant={statusConfig.variant} 
          className="inline-flex items-center gap-1"
          title={statusConfig.description}
          data-testid={`status-${referral.id}`}
        >
          {statusConfig.icon}
          <span className="hidden sm:inline">{statusConfig.label}</span>
        </Badge>
      </TableCell>

      {/* Source */}
      <TableCell>
        <div className="flex items-center gap-1 text-sm">
          {sourceIcon}
          <span className="hidden md:inline">{formatSource(referral.referralSource)}</span>
        </div>
      </TableCell>

      {/* Date */}
      <TableCell>
        <div className="text-sm">
          <div className="font-medium">{referral.daysAgo === 0 ? 'Today' : `${referral.daysAgo}d ago`}</div>
          <div className="text-xs text-gray-500 hidden sm:block">
            {format(new Date(referral.createdAt), 'MMM d')}
          </div>
        </div>
      </TableCell>

      {/* Conversion */}
      <TableCell>
        {referral.convertedAt ? (
          <div className="text-sm">
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-3 h-3" />
              <span className="hidden sm:inline">Converted</span>
            </div>
            <div className="text-xs text-gray-500 hidden sm:block">
              {formatDistanceToNow(new Date(referral.convertedAt), { addSuffix: true })}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">-</div>
        )}
      </TableCell>

      {/* Reward */}
      <TableCell>
        {referral.reward ? (
          <div className="text-sm">
            <div className="flex items-center gap-1">
              <Gift className="w-3 h-3 text-orange-500" />
              <span className="font-medium" data-testid={`reward-value-${referral.id}`}>
                {referral.rewardDisplayText}
              </span>
            </div>
            <div className="text-xs text-gray-500 hidden sm:block">
              {referral.reward.status === 'redeemed' ? 'Claimed' : 'Available'}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">-</div>
        )}
      </TableCell>
    </TableRow>
  );
}

export function ReferralHistoryTable({ 
  referrals, 
  isLoading = false, 
  onRefresh, 
  className 
}: ReferralHistoryTableProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'converted' | 'rewarded'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Filter referrals based on current filter
  const filteredReferrals = filter === 'all' 
    ? referrals 
    : referrals.filter(r => r.status === filter);

  // Sort by creation date (newest first)
  const sortedReferrals = [...filteredReferrals].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const stats = {
    total: referrals.length,
    pending: referrals.filter(r => r.status === 'pending').length,
    converted: referrals.filter(r => r.status === 'converted' || r.status === 'rewarded').length,
    rewarded: referrals.filter(r => r.status === 'rewarded').length,
  };

  return (
    <Card className={cn("", className)} data-testid="referral-history-table">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Referral History
            </CardTitle>
            <CardDescription>
              Track all your referrals and their conversion status
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex rounded-lg border p-1">
              {[
                { key: 'all', label: 'All', count: stats.total },
                { key: 'pending', label: 'Pending', count: stats.pending },
                { key: 'converted', label: 'Active', count: stats.converted },
                { key: 'rewarded', label: 'Rewarded', count: stats.rewarded }
              ].map((item) => (
                <Button
                  key={item.key}
                  variant={filter === item.key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(item.key as any)}
                  className="text-xs h-7"
                  data-testid={`filter-${item.key}`}
                >
                  {item.label}
                  {item.count > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 min-w-[16px] text-xs">
                      {item.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Refresh button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              data-testid="button-refresh-history"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              <span className="hidden sm:inline ml-2">Refresh</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-3" data-testid="history-loading">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Conversion</TableHead>
                  <TableHead>Reward</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))}
              </TableBody>
            </Table>
          </div>
        ) : sortedReferrals.length === 0 ? (
          <div className="text-center py-8" data-testid="history-empty">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium mb-2">
              {filter === 'all' ? 'No Referrals Yet' : `No ${filter} Referrals`}
            </h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all' 
                ? 'Start sharing your referral link to see your referral history here.'
                : `You don't have any ${filter} referrals at the moment.`
              }
            </p>
            {filter !== 'all' && (
              <Button variant="outline" size="sm" onClick={() => setFilter('all')}>
                View All Referrals
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold" data-testid="stats-total">{stats.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600" data-testid="stats-pending">{stats.pending}</div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600" data-testid="stats-converted">{stats.converted}</div>
                <div className="text-xs text-gray-600">Converted</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-600" data-testid="stats-rewarded">{stats.rewarded}</div>
                <div className="text-xs text-gray-600">Rewarded</div>
              </div>
            </div>

            {/* Referrals Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-medium">Referee</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium">Source</TableHead>
                    <TableHead className="font-medium">Date</TableHead>
                    <TableHead className="font-medium">Conversion</TableHead>
                    <TableHead className="font-medium">Reward</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedReferrals.map((referral) => (
                    <ReferralRow key={referral.id} referral={referral} />
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Show more button for large lists */}
            {sortedReferrals.length > 10 && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View All {referrals.length} Referrals
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}