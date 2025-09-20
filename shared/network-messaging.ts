/**
 * Network value messaging and social proof constants for viral growth
 * Focus: Private landlords who own up to 75% of US rentals
 */

// Private landlord market statistics
export const PRIVATE_LANDLORD_STATS = {
  MARKET_SHARE: 'up to 75% of US rentals',
  DECISION_SPEED: 'Faster response times',
  PERSONAL_APPROACH: 'Direct landlord communication',
  NO_JUNK_FEES: 'No hidden prequalification fees',
} as const;


// Mechanism-based statistics (realistic time savings and specific process improvements)
export const SOCIAL_PROOF_STATS = {
  // Private landlord advantages - focus on mechanism, not inflated numbers
  PRIVATE_LANDLORD_RESPONSE_TIME: 'Faster response times',
  INDIVIDUAL_LANDLORD_RESPONSE_TIME: 'Faster response times', // DEPRECATED - use PRIVATE_LANDLORD_RESPONSE_TIME
  TENANT_APPLICATION_TIME_SAVED: '60-90 minutes per prequalification',
  // Process improvements with private landlords
  STREAMLINED_COMMUNICATION: 'Direct landlord communication',
  ELIMINATE_JUNK_FEES: 'No hidden prequalification fees',
  FASTER_SCREENING: 'Same-day responses possible',
  PERSONAL_RELATIONSHIPS: 'Direct tenant-landlord connection',
  PRIVATE_LANDLORD_DECISIONS: 'Faster response times',
  INDIVIDUAL_LANDLORD_DECISIONS: 'Faster response times', // DEPRECATED - use PRIVATE_LANDLORD_DECISIONS
  // Quality-focused growth indicators (realistic rates)
  PRIVATE_LANDLORDS_JOINING: 'Growing private landlord network',
  INDIVIDUAL_LANDLORDS_JOINING: 'Growing private landlord network', // DEPRECATED - use PRIVATE_LANDLORDS_JOINING
  NETWORK_QUALITY: 'Verified private landlord connections',
  PERSONAL_APPROACH: 'Direct property owner relationships',
} as const;

// Import official value propositions from source of truth
import { DERIVED_MESSAGING } from './value-propositions';

// Private landlord-focused value propositions (derived from official source)
export const NETWORK_VALUE_PROPS = {
  TENANT: {
    HERO: DERIVED_MESSAGING.TENANT.HERO,
    SECONDARY: DERIVED_MESSAGING.TENANT.SECONDARY,
    BENEFITS: DERIVED_MESSAGING.TENANT.BENEFITS,
    SOCIAL_PROOF: [
      'Private landlords provide faster response times and more personal decisions',
      'Direct landlord communication and transparent pricing',
      'Personal communication leads to faster approvals and better relationships',
      `Access to ${PRIVATE_LANDLORD_STATS.MARKET_SHARE} rental market through private landlord network`,
    ],
  },
  LANDLORD: {
    HERO: DERIVED_MESSAGING.LANDLORD.HERO,
    SECONDARY: DERIVED_MESSAGING.LANDLORD.SECONDARY,
    BENEFITS: DERIVED_MESSAGING.LANDLORD.BENEFITS,
    SOCIAL_PROOF: [
      'Private landlords provide professional efficiency with personal service',
      'Attract tenants seeking personal relationships and direct communication',
      'Professional screening tools help private landlords compete effectively',
      'Professional efficiency tools that maintain your personal approach',
    ],
  },
  NETWORK_EFFECTS: {
    TENANT: [
      'More Private Landlords = direct property owner access',
      'Verified private landlord network = faster, personal decisions',
      'Private landlord community = responsive communication',
      `Growing network = more ${PRIVATE_LANDLORD_STATS.MARKET_SHARE} market access`,
    ],
    LANDLORD: [
      'More Tenants Preferring Private Landlords = quality applicant pool',
      'Tenants seeking private landlords = better tenant-landlord fit',
      'Network of private landlords = shared best practices',
      'Private landlord community = shared best practices and support',
    ],
  },
} as const;

// Viral messaging for sharing and referrals
export const VIRAL_MESSAGING = {
  REFERRAL: {
    HEADLINES: [
      'Help grow the trusted private landlord network',
      'Share MyRentCard with your network',
      'Connect friends with private landlords',
      'Grow our community, earn rewards together',
    ],
    SHARE_TEXTS: {
      TENANT: [
        `MyRentCard connects me directly with private landlords who own ${PRIVATE_LANDLORD_STATS.MARKET_SHARE}`,
        'Private landlords provide faster, more personal responses than large management companies',
        'No hidden fees or complex processes, just direct communication with property owners',
        'Private landlords make personal decisions quickly, typically within 1-2 days',
      ],
      LANDLORD: [
        'MyRentCard provides professional efficiency tools while maintaining my personal approach',
        'Attract tenants who prefer personal relationships and direct communication',
        'Professional screening tools with flexible, personalized service',
        'Professional tools that support personal tenant-landlord relationships',
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
      'Complete your profile to connect with private landlords',
      'Build verified references for private landlord connections',
      'Join our community focused on private landlord relationships',
      'Help build the private landlord network',
    ],
  },
  EMAIL_SUBJECTS: {
    NETWORK_GROWTH: [
      'Join the private landlord network',
      'Connect with verified private landlords',
      'Your friends are joining MyRentCard',
      'The private landlord network everyone is talking about',
    ],
    SOCIAL_PROOF: [
      'Private landlords provide faster response times',
      'Why private landlords choose MyRentCard',
      'Join satisfied private landlord network members',
      'Review time: 45 minutes to 15 minutes - see why private landlords switch',
    ],
  },
} as const;

// Individual landlord success stories and testimonials
export const SUCCESS_STORIES = {
  TENANT_TESTIMONIALS: [
    {
      name: 'Sarah M.',
      role: 'Renter',
      quote: 'Found an amazing private landlord who responded same day. Direct communication made the process so smooth.',
      metric: 'Same-day private landlord response',
    },
    {
      name: 'Mike T.',
      role: 'Recent Graduate',
      quote: 'Private landlord was incredibly responsive and flexible. Personal communication made all the difference.',
      metric: 'Personal landlord relationship',
    },
    {
      name: 'Jessica L.',
      role: 'Working Professional',
      quote: 'Connected directly with property owner. No hidden fees, transparent process, just honest communication.',
      metric: 'Direct property owner access',
    },
  ],
  LANDLORD_TESTIMONIALS: [
    {
      name: 'David R.',
      role: 'Private Property Owner',
      quote: 'Professional efficiency tools with personal service. Best of both worlds.',
      metric: 'Competitive + Personal',
    },
    {
      name: 'Lisa K.',
      role: 'Private Landlord',
      quote: 'Tenants specifically look for private landlords like me. They value personal relationships and direct communication.',
      metric: 'Private landlord preference',
    },
    {
      name: 'Carlos M.',
      role: 'Property Owner',
      quote: 'Professional screening tools that support my personal approach to tenant relationships.',
      metric: 'Professional tools + personal service',
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
    '50+ private landlords joining monthly',
    'Private landlord network expanding to new cities',
    'New private property owners joining weekly',
    'Direct landlord opportunities added daily',
    'Private landlord community expanding nationwide',
    'Personal landlord connections reaching new markets',
  ],
} as const;

// Message templates with network emphasis
export const NETWORK_MESSAGE_TEMPLATES = {
  RENTCARD_REQUEST: {
    INDIVIDUAL_LANDLORD_FOCUS: `Hi {contact_name},

I'm {tenant_name}, and I'm specifically interested in connecting with private landlords like you for your property at {property_address}.

As someone who values personal landlord relationships and direct communication, I appreciate that private landlords:
• Respond faster and make decisions quicker
• Provide transparent pricing and streamlined processes
• Build genuine tenant-landlord relationships

My verified RentCard: {rentcard_link}

Looking forward to connecting directly!
{tenant_name}`,
    NETWORK_VALUE: `Hi {contact_name},

I found your property through MyRentCard's individual landlord network at {property_address}.

As a private property owner, you're part of the ${PRIVATE_LANDLORD_STATS.MARKET_SHARE} owned by private landlords. Our platform helps tenants like me connect specifically with responsive private landlords who provide personal service.

View my verified profile: {rentcard_link}

{tenant_name}`,
  },
  FOLLOW_UP: {
    INDIVIDUAL_LANDLORD_EMPHASIS: `Hi {contact_name},

Following up on my interest in {property_address}.

I specifically seek out private landlords like you because you respond faster and make personal decisions with streamlined processes.

My complete profile with verified references: {rentcard_link}

Appreciate your direct, personal approach to landlording!

{tenant_name}`,
  },
  INITIAL_INQUIRY: {
    INDIVIDUAL_LANDLORD_CONNECTION: `Hi {contact_name},

I saw your listing for {property_address} and I'm very interested!

I specifically choose to work with private landlords like you because you own ${PRIVATE_LANDLORD_STATS.MARKET_SHARE} and offer the personal touch and faster decisions I value.

My verified rental profile: {rentcard_link}

Would love to schedule a viewing and discuss your property directly.

Best,
{tenant_name}`,
  },
} as const;

// Individual landlord-focused notification messaging
export const NETWORK_NOTIFICATIONS = {
  WELCOME_MESSAGES: {
    TENANT: `RentCard complete! Connect with private landlords who own ${PRIVATE_LANDLORD_STATS.MARKET_SHARE}.`,
    LANDLORD: 'Individual landlord tools ready! Professional efficiency with personal service.',
  },
  ACHIEVEMENT_MESSAGES: {
    PROFILE_COMPLETE: 'RentCard ready! Private landlords can now make faster decisions about your prequalification.',
    REFERENCE_VERIFIED: 'References verified! Private landlords appreciate pre-verified tenant information.',
    FIRST_SHARE: 'RentCard shared! Individual landlord has everything needed for quick, personal decision-making.',
  },
  WORKFLOW_MESSAGES: {
    DOCUMENT_COMPLETE: 'Documentation complete! Private landlords can make informed decisions quickly.',
    REFERENCE_READY: 'References ready! Private landlords appreciate verified tenant references.',
    EMPLOYMENT_VERIFIED: 'Employment verified! Private landlords value transparent tenant information.',
  },
} as const;

// Individual landlord-focused CTA messaging
export const NETWORK_CTA = {
  PRIMARY: {
    TENANT: {
      MAIN: 'Connect with Private Landlords',
      SECONDARY: `Access ${PRIVATE_LANDLORD_STATS.MARKET_SHARE} Rental Market`,
      URGENCY: 'Streamlined Process Today',
    },
    LANDLORD: {
      MAIN: 'Professional Efficiency Tools',
      SECONDARY: 'Keep Your Personal Touch',
      URGENCY: 'Professional Tools for Private Landlords',
    },
  },
  SECONDARY: {
    SHARE: 'Connect with Private Property Owners',
    REFER: 'Join Individual Landlord Network',
    EXPLORE: 'See Individual Landlord Benefits',
    LEARN_MORE: 'Why Private Landlords Respond Faster',
  },
  INDIVIDUAL_LANDLORD_FOCUSED: {
    TENANT_WORKFLOW: 'Connect directly with property owners',
    LANDLORD_WORKFLOW: 'Individual landlord efficiency tools',
    RELATIONSHIP_FOCUSED: 'Build personal landlord relationships',
    EFFICIENCY_FOCUSED: 'Streamlined rental processes',
  },
} as const;

// Types for TypeScript support
export type SocialProofStat = keyof typeof SOCIAL_PROOF_STATS;
export type NetworkValueProp = keyof typeof NETWORK_VALUE_PROPS;
export type ViralMessage = keyof typeof VIRAL_MESSAGING;
export type SuccessStory = typeof SUCCESS_STORIES.TENANT_TESTIMONIALS[0];
export type TrustSignal = keyof typeof TRUST_SIGNALS;
export type NetworkCTA = keyof typeof NETWORK_CTA;