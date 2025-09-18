/**
 * TypeScript interfaces for the referral system components
 */

// Core referral types based on schema
export interface Referral {
  id: number;
  referralCode: string;
  
  // Referrer information
  referrerUserId?: number;
  referrerEmail?: string;
  referrerName?: string;
  referrerType: 'tenant' | 'landlord' | 'prospect';
  
  // Referee information
  refereeUserId?: number;
  refereeEmail: string;
  refereeName?: string;
  refereeType: 'tenant' | 'landlord' | 'prospect';
  
  // Attribution and tracking
  referralSource: 'direct_link' | 'email' | 'sms' | 'social' | 'qr_code';
  shareTokenId?: number;
  shortlinkId?: number;
  campaignId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  
  // Status and conversion
  status: 'pending' | 'converted' | 'rewarded' | 'expired' | 'cancelled';
  conversionEvent?: 'signup' | 'rentcard_created' | 'property_inquiry' | 'application_submitted';
  convertedAt?: string;
  
  // Reward eligibility
  referrerRewardEligible: boolean;
  refereeRewardEligible: boolean;
  
  // Metadata
  metadata?: {
    originalUrl?: string;
    deviceInfo?: {
      type: 'desktop' | 'mobile' | 'tablet';
      os?: string;
      browser?: string;
    };
    locationInfo?: {
      country?: string;
      region?: string;
      city?: string;
    };
    customData?: Record<string, any>;
  };
  
  // Timestamps
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralReward {
  id: number;
  referralId: number;
  
  // Recipient information
  recipientUserId?: number;
  recipientType: 'referrer' | 'referee';
  recipientEmail: string;
  
  // Reward details
  rewardType: 'credit' | 'discount' | 'cash' | 'points' | 'premium_feature';
  rewardValue: number; // Value in cents or points
  rewardCurrency: string;
  rewardDescription: string;
  
  // Reward conditions
  triggerEvent: 'signup' | 'first_rentcard' | 'property_inquiry' | 'application';
  minimumRequirement?: {
    type: 'none' | 'time_limit' | 'action_count' | 'value_threshold';
    value?: number;
    description?: string;
  };
  
  // Status tracking
  status: 'earned' | 'pending' | 'redeemed' | 'expired' | 'cancelled';
  earnedAt: string;
  redeemedAt?: string;
  expiresAt?: string;
  
  // Redemption details
  redemptionMethod?: 'account_credit' | 'discount_code' | 'cash_payout' | 'automatic';
  redemptionDetails?: {
    transactionId?: string;
    discountCode?: string;
    payoutMethod?: string;
    payoutDetails?: Record<string, any>;
    appliedToOrderId?: string;
    appliedAt?: string;
  };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Component prop interfaces
export interface ReferralStatsData {
  totalReferrals: number;
  convertedReferrals: number;
  pendingReferrals: number;
  totalRewards: number;
  pendingRewards: number;
  redeemedRewards: number;
  conversionRate: number;
  totalEarnings: number; // in cents
  pendingEarnings: number; // in cents
  thisMonthReferrals: number;
  thisMonthConversions: number;
  topReferralSource: string;
}

export interface ReferralLink {
  code: string;
  url: string;
  shortUrl?: string;
  qrCodeUrl?: string;
  createdAt: string;
  clickCount: number;
  conversionCount: number;
  isActive: boolean;
}

export interface ReferralHistoryItem extends Referral {
  reward?: ReferralReward;
  refereeDisplayName: string;
  statusDisplayText: string;
  sourceDisplayText: string;
  rewardDisplayText?: string;
  daysAgo: number;
}

// Component props
export interface ReferralStatsCardProps {
  stats: ReferralStatsData;
  isLoading?: boolean;
  className?: string;
}

export interface ReferralLinkGeneratorProps {
  currentLink?: ReferralLink;
  onLinkGenerated?: (link: ReferralLink) => void;
  className?: string;
}

export interface ReferralRewardsPanelProps {
  rewards: ReferralReward[];
  isLoading?: boolean;
  onClaimReward?: (rewardId: number) => void;
  className?: string;
}

export interface ReferralHistoryTableProps {
  referrals: ReferralHistoryItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export interface ReferralDashboardProps {
  userId?: number;
  className?: string;
}

// API response types
export interface ReferralStatsResponse {
  stats: ReferralStatsData;
  referralLink: ReferralLink;
}

export interface ClaimRewardRequest {
  rewardId: number;
  redemptionMethod?: 'account_credit' | 'discount_code' | 'cash_payout';
}

export interface ClaimRewardResponse {
  success: boolean;
  reward: ReferralReward;
  message?: string;
}

export interface CreateReferralLinkRequest {
  campaignId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  expiresAt?: string;
}

export interface CreateReferralLinkResponse {
  referralLink: ReferralLink;
}

// Utility types for display
export type ReferralStatusVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export interface StatusDisplayConfig {
  [key: string]: {
    label: string;
    variant: ReferralStatusVariant;
    icon?: string;
  };
}

export interface RewardTypeDisplayConfig {
  [key: string]: {
    label: string;
    icon: string;
    color: string;
    format: (value: number, currency?: string) => string;
  };
}