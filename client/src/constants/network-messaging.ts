/**
 * Network value messaging and social proof constants for viral growth
 */

// Social proof statistics (these would be updated from real data in production)
export const SOCIAL_PROOF_STATS = {
  VERIFIED_RENTERS: '15,000+',
  VERIFIED_LANDLORDS: '2,500+',
  TOTAL_USERS: '17,500+',
  PROPERTIES_LISTED: '8,200+',
  RENTCARDS_CREATED: '12,400+',
  REFERENCES_VERIFIED: '24,800+',
  TIME_SAVED_HOURS: '40+',
  SCREENING_TIME_REDUCTION: '75%',
  AVERAGE_APPROVAL_TIME: '2 hours',
  SUCCESSFUL_MATCHES: '5,600+',
  CITIES_SERVED: '150+',
  MONTHLY_GROWTH: '22%',
  NEW_USERS_DAILY: '120+',
  RETURN_RATE: '94%',
  SATISFACTION_SCORE: '4.8',
} as const;

// Network value propositions
export const NETWORK_VALUE_PROPS = {
  TENANT: {
    HERO: 'Join 15,000+ verified renters who land apartments faster',
    SECONDARY: 'The more landlords on our platform, the more opportunities for you',
    BENEFITS: [
      'Access to a growing network of verified landlords',
      'Stand out among thousands of qualified applicants',
      'Join renters who get approved 3x faster',
      'Benefit from community-verified references',
    ],
    SOCIAL_PROOF: [
      'Trusted by 15,000+ renters nationwide',
      '94% of users would recommend MyRentCard',
      'Average approval time reduced to 2 hours',
      'Join renters in 150+ cities',
    ],
  },
  LANDLORD: {
    HERO: 'Join 2,500+ landlords who save 40+ hours per week',
    SECONDARY: 'The more quality tenants, the better your screening options',
    BENEFITS: [
      'Access pre-screened tenants from our growing network',
      'Join landlords who fill units 75% faster',
      'Benefit from community-verified tenant references',
      'Reduce screening time by up to 75%',
    ],
    SOCIAL_PROOF: [
      'Trusted by 2,500+ property managers',
      'Over 24,800 references verified by our community',
      '5,600+ successful tenant-landlord matches',
      'Growing by 22% monthly',
    ],
  },
  NETWORK_EFFECTS: {
    TENANT: [
      'More landlords = more opportunities',
      'Verified network = faster approvals',
      'Community references = higher trust',
      'Growing platform = better matches',
    ],
    LANDLORD: [
      'More tenants = better selection',
      'Verified applicants = less risk',
      'Network screening = time savings',
      'Community trust = quality assurance',
    ],
  },
} as const;

// Viral messaging for sharing and referrals
export const VIRAL_MESSAGING = {
  REFERRAL: {
    HEADLINES: [
      'Help grow the trusted rental network',
      'Share MyRentCard with your network',
      'Invite friends to join 17,500+ users',
      'Grow our community, earn rewards together',
    ],
    SHARE_TEXTS: {
      TENANT: [
        'I found my apartment through MyRentCard - join 15,000+ verified renters!',
        'Skip the rental hassle - MyRentCard connects you with verified landlords',
        'Join me and 15,000+ renters who get approved faster with MyRentCard',
        'Found my place in 2 hours with MyRentCard. You should try it too!',
      ],
      LANDLORD: [
        'I save 40+ hours per week screening tenants with MyRentCard',
        'Join 2,500+ landlords who find quality tenants faster',
        'Pre-screened tenants, verified references - join the network!',
        'Reduced my screening time by 75% with MyRentCard. Game changer!',
      ],
    },
    BENEFITS_MESSAGING: [
      'Growing network means better matches for everyone',
      'Every new member makes the platform more valuable',
      'Join a community that values trust and verification',
      'Help us create the rental network everyone can trust',
    ],
  },
  ONBOARDING: {
    NETWORK_PARTICIPATION: [
      'Your complete profile helps the entire network',
      'Verified profiles make the platform stronger',
      'Quality members attract quality connections',
      'Every verification builds community trust',
    ],
    SOCIAL_PROOF_STEPS: [
      'Join 15,000+ who completed their profile',
      'Be part of 24,800+ verified references',
      'Add to our 94% user satisfaction rate',
      'Help us reach 18,000+ trusted members',
    ],
  },
  EMAIL_SUBJECTS: {
    NETWORK_GROWTH: [
      'Join the fastest-growing rental network',
      'Be part of 17,500+ verified users',
      'Your friends are joining MyRentCard',
      'The rental network everyone is talking about',
    ],
    SOCIAL_PROOF: [
      '15,000+ renters can\'t be wrong',
      'Why 2,500+ landlords choose MyRentCard',
      'Join the 94% who love MyRentCard',
      '75% faster screening - see why landlords switch',
    ],
  },
} as const;

// Success stories and testimonials for social proof
export const SUCCESS_STORIES = {
  TENANT_TESTIMONIALS: [
    {
      name: 'Sarah M.',
      role: 'Renter',
      quote: 'Got approved in 2 hours instead of 2 weeks. The verified network made all the difference.',
      metric: 'Approved 10x faster',
    },
    {
      name: 'Mike T.',
      role: 'Recent Graduate',
      quote: 'Landlords trust MyRentCard references. I got my dream apartment on the first try.',
      metric: 'First application accepted',
    },
    {
      name: 'Jessica L.',
      role: 'Working Professional',
      quote: 'The network grows every day. More options, faster responses, better matches.',
      metric: '3 offers in one week',
    },
  ],
  LANDLORD_TESTIMONIALS: [
    {
      name: 'David R.',
      role: 'Property Manager',
      quote: 'Went from 20 hours of screening to 5 hours. Pre-verified tenants are a game changer.',
      metric: 'Saves 40+ hours weekly',
    },
    {
      name: 'Lisa K.',
      role: 'Real Estate Investor',
      quote: 'Quality tenant pool keeps growing. Every week brings better applicants.',
      metric: '95% tenant retention',
    },
    {
      name: 'Carlos M.',
      role: 'Building Owner',
      quote: 'Filled 12 units in one month. The network effect is real.',
      metric: 'Units filled 75% faster',
    },
  ],
} as const;

// Trust signals and verification badges
export const TRUST_SIGNALS = {
  VERIFICATION_BADGES: [
    'Verified by community',
    'Trusted network member',
    'Reference confirmed',
    'Background checked',
    'Income verified',
    'Community endorsed',
  ],
  TRUST_INDICATORS: [
    'Part of verified network',
    'Community-trusted profile',
    'Network-verified references',
    'Peer-endorsed member',
    'Platform-verified identity',
    'Community-approved',
  ],
  NETWORK_GROWTH_INDICATORS: [
    '120+ new users joining daily',
    'Network growing 22% monthly',
    'New landlords joining every hour',
    'Fresh opportunities added daily',
    'Community expanding nationwide',
    'Network reaching new cities weekly',
  ],
} as const;

// Message templates with network emphasis
export const NETWORK_MESSAGE_TEMPLATES = {
  RENTCARD_REQUEST: {
    WITH_SOCIAL_PROOF: `Hi {contact_name},

I'm {tenant_name}, and I'm interested in your property at {property_address}. 

I'm part of MyRentCard's verified network of 15,000+ renters with community-verified references and pre-screened credentials.

You can review my complete rental profile here: {rentcard_link}

Join 2,500+ landlords who save 40+ hours per week with instant tenant screening.

Best regards,
{tenant_name}`,
    NETWORK_VALUE: `Hi {contact_name},

As part of MyRentCard's growing network of verified renters, I'd love to connect about your property at {property_address}.

Our platform helps landlords like you reduce screening time by 75% with:
✓ Pre-verified references (24,800+ verified)
✓ Background-checked tenants
✓ Instant qualification review

View my verified profile: {rentcard_link}

{tenant_name}`,
  },
  FOLLOW_UP: {
    COMMUNITY_EMPHASIS: `Hi {contact_name},

Following up on my interest in {property_address}. 

As a verified member of MyRentCard's network (15,000+ renters, 2,500+ landlords), I understand the value of quick, transparent communication.

My complete profile with verified references: {rentcard_link}

Looking forward to hearing from you!

{tenant_name}`,
  },
  INITIAL_INQUIRY: {
    NETWORK_TRUST: `Hi {contact_name},

I saw your listing for {property_address} and I'm very interested!

I'm part of MyRentCard's trusted network of verified renters. Our community of 17,500+ users maintains 94% satisfaction through verified profiles and transparent communication.

My verified rental profile: {rentcard_link}

Would love to schedule a viewing at your convenience.

Best,
{tenant_name}`,
  },
} as const;

// Notification messaging with network emphasis
export const NETWORK_NOTIFICATIONS = {
  WELCOME_MESSAGES: {
    TENANT: 'Welcome to the network! You\'ve joined 15,000+ verified renters.',
    LANDLORD: 'Welcome to the network! You\'ve joined 2,500+ trusted landlords.',
  },
  ACHIEVEMENT_MESSAGES: {
    PROFILE_COMPLETE: 'Profile verified! You\'re now part of our trusted network.',
    REFERENCE_VERIFIED: 'Reference verified! Helping build community trust.',
    FIRST_SHARE: 'First share sent! Help grow our network of 17,500+ users.',
  },
  GROWTH_MESSAGES: {
    MILESTONE_REACHED: 'Congratulations! Our network just reached 18,000 members.',
    NEW_CITY: 'Great news! MyRentCard is now available in your city.',
    NETWORK_UPDATE: 'Network update: 150+ cities, 17,500+ users, growing daily!',
  },
} as const;

// CTA (Call-to-Action) messaging with network emphasis
export const NETWORK_CTA = {
  PRIMARY: {
    TENANT: {
      MAIN: 'Join 15,000+ Verified Renters',
      SECONDARY: 'Start Your Rental Journey',
      URGENCY: 'Join the Growing Network Today',
    },
    LANDLORD: {
      MAIN: 'Join 2,500+ Smart Landlords',
      SECONDARY: 'Start Pre-Screening Tenants',
      URGENCY: 'Save 40+ Hours Per Week',
    },
  },
  SECONDARY: {
    SHARE: 'Invite Friends to the Network',
    REFER: 'Help Grow Our Community',
    EXPLORE: 'See Network Benefits',
    LEARN_MORE: 'Why 17,500+ Users Choose Us',
  },
  URGENCY: {
    LIMITED_TIME: 'Join before we reach 20,000 members',
    GROWING_FAST: 'Network growing 22% monthly',
    EARLY_ADOPTER: 'Be among the first in your city',
    TRENDING: 'Fastest-growing rental platform',
  },
} as const;

// Types for TypeScript support
export type SocialProofStat = keyof typeof SOCIAL_PROOF_STATS;
export type NetworkValueProp = keyof typeof NETWORK_VALUE_PROPS;
export type ViralMessage = keyof typeof VIRAL_MESSAGING;
export type SuccessStory = typeof SUCCESS_STORIES.TENANT_TESTIMONIALS[0];
export type TrustSignal = keyof typeof TRUST_SIGNALS;
export type NetworkCTA = keyof typeof NETWORK_CTA;