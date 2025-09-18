/**
 * Network value messaging and social proof constants for viral growth
 * Focus: Individual landlords who own 70-75% of US rentals
 */

// Individual landlord market statistics
export const INDIVIDUAL_LANDLORD_STATS = {
  MARKET_SHARE: '70-75% of US rentals',
  DECISION_SPEED: 'Respond 2-3x faster than corporate',
  PERSONAL_APPROACH: 'Direct landlord communication',
  NO_JUNK_FEES: 'Skip corporate application fees',
} as const;

// Mechanism-based statistics (realistic time savings and specific process improvements)
export const SOCIAL_PROOF_STATS = {
  // Individual landlord advantages - focus on mechanism, not inflated numbers
  INDIVIDUAL_LANDLORD_RESPONSE_TIME: '2-3x faster decisions',
  TENANT_APPLICATION_TIME_SAVED: '60-90 minutes per application',
  // Process improvements with individual landlords
  SKIP_CORPORATE_BUREAUCRACY: 'Direct landlord communication',
  ELIMINATE_JUNK_FEES: 'No corporate application fees',
  FASTER_SCREENING: 'Same-day responses possible',
  PERSONAL_RELATIONSHIPS: 'Direct tenant-landlord connection',
  INDIVIDUAL_LANDLORD_DECISIONS: '1-2 days vs 5-10 days corporate',
  // Quality-focused growth indicators (realistic rates)
  INDIVIDUAL_LANDLORDS_JOINING: 'Growing individual landlord network',
  NETWORK_QUALITY: 'Verified individual landlord connections',
  PERSONAL_APPROACH: 'Direct property owner relationships',
} as const;

// Individual landlord-focused value propositions
export const NETWORK_VALUE_PROPS = {
  TENANT: {
    HERO: 'Efficiently connect with individual landlords through your completed RentCard',
    SECONDARY: 'Skip corporate bureaucracy and junk fees – individual landlords respond faster and make faster decisions',
    BENEFITS: [
      `Connect directly with individual landlords who own ${INDIVIDUAL_LANDLORD_STATS.MARKET_SHARE}`,
      'Skip corporate property management bureaucracy and application fees',
      'Individual landlords respond 2-3x faster than corporate management',
      'Build personal relationships with responsive individual property owners',
    ],
    SOCIAL_PROOF: [
      'Individual landlords make decisions in 1-2 days vs 5-10 days for corporate',
      'Skip junk fees and corporate bureaucracy with direct landlord connections',
      'Personal communication leads to faster approvals and better relationships',
      `Access to ${INDIVIDUAL_LANDLORD_STATS.MARKET_SHARE} rental market through individual landlord network`,
    ],
  },
  LANDLORD: {
    HERO: 'Individual landlords competing with corporate efficiency through professional tools',
    SECONDARY: 'Professional screening tools without corporate overhead – maintain your personal touch while staying competitive',
    BENEFITS: [
      'Compete with corporate property management using professional pre-screening tools',
      'Access tenants who specifically prefer individual landlords over corporate management',
      'Maintain personal landlord-tenant relationships while using efficient screening',
      'Professional tools without corporate fees, bureaucracy, or rigid policies',
    ],
    SOCIAL_PROOF: [
      'Individual landlords report staying competitive with corporate efficiency',
      'Attract tenants seeking personal relationships over corporate bureaucracy',
      'Professional screening tools help individual landlords compete effectively',
      'Keep your personal touch while using corporate-level efficiency tools',
    ],
  },
  NETWORK_EFFECTS: {
    TENANT: [
      'More Individual Landlords = direct property owner access',
      'Verified individual landlord network = faster, personal decisions',
      'Individual landlord community = responsive communication',
      `Growing network = more ${INDIVIDUAL_LANDLORD_STATS.MARKET_SHARE} market access`,
    ],
    LANDLORD: [
      'More Tenants Preferring Individual Landlords = quality applicant pool',
      'Tenants seeking individual landlords = better tenant-landlord fit',
      'Network of individual landlords = shared best practices',
      'Individual landlord community = competitive advantage over corporate',
    ],
  },
} as const;

// Viral messaging for sharing and referrals
export const VIRAL_MESSAGING = {
  REFERRAL: {
    HEADLINES: [
      'Help grow the trusted individual landlord network',
      'Share MyRentCard with your network',
      'Connect friends with individual landlords',
      'Grow our community, earn rewards together',
    ],
    SHARE_TEXTS: {
      TENANT: [
        `MyRentCard connects me directly with individual landlords who own ${INDIVIDUAL_LANDLORD_STATS.MARKET_SHARE}`,
        'Skip corporate management entirely - individual landlords respond so much faster',
        'No junk fees or corporate bureaucracy, just direct communication with property owners',
        'Individual landlords make personal decisions in days, not weeks like corporate management',
      ],
      LANDLORD: [
        'MyRentCard helps me compete with corporate efficiency while keeping my personal touch',
        'Attract tenants who specifically prefer individual landlords over corporate management',
        'Professional screening tools without corporate overhead or rigid policies',
        'Stay competitive with big companies while maintaining personal landlord relationships',
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
      'Complete your profile to connect with individual landlords',
      'Build verified references for individual landlord connections',
      'Join our community focused on individual landlord relationships',
      'Help build the individual landlord network',
    ],
  },
  EMAIL_SUBJECTS: {
    NETWORK_GROWTH: [
      'Join the individual landlord network',
      'Connect with verified individual landlords',
      'Your friends are joining MyRentCard',
      'The individual landlord network everyone is talking about',
    ],
    SOCIAL_PROOF: [
      'Individual landlords respond 2-3x faster',
      'Why individual landlords choose MyRentCard',
      'Join satisfied individual landlord network members',
      'Review time: 45 minutes to 15 minutes - see why individual landlords switch',
    ],
  },
} as const;

// Individual landlord success stories and testimonials
export const SUCCESS_STORIES = {
  TENANT_TESTIMONIALS: [
    {
      name: 'Sarah M.',
      role: 'Renter',
      quote: 'Found an amazing individual landlord who responded same day. Skip corporate management entirely.',
      metric: 'Same-day individual landlord response',
    },
    {
      name: 'Mike T.',
      role: 'Recent Graduate',
      quote: 'Individual landlord was so much more flexible than corporate properties. Personal communication made all the difference.',
      metric: 'Personal landlord relationship',
    },
    {
      name: 'Jessica L.',
      role: 'Working Professional',
      quote: 'Connected directly with property owner. No junk fees, no corporate bureaucracy, just honest communication.',
      metric: 'Direct property owner access',
    },
  ],
  LANDLORD_TESTIMONIALS: [
    {
      name: 'David R.',
      role: 'Individual Property Owner',
      quote: 'Stay competitive with corporate management while keeping my personal touch. Best of both worlds.',
      metric: 'Competitive + Personal',
    },
    {
      name: 'Lisa K.',
      role: 'Individual Landlord',
      quote: 'Tenants specifically look for individual landlords like me. They want personal relationships over corporate.',
      metric: 'Individual landlord preference',
    },
    {
      name: 'Carlos M.',
      role: 'Property Owner',
      quote: 'Professional screening tools help me compete with big companies without losing my personal approach.',
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
    '50+ individual landlords joining monthly',
    'Individual landlord network expanding to new cities',
    'New individual property owners joining weekly',
    'Direct landlord opportunities added daily',
    'Individual landlord community expanding nationwide',
    'Personal landlord connections reaching new markets',
  ],
} as const;

// Message templates with network emphasis
export const NETWORK_MESSAGE_TEMPLATES = {
  RENTCARD_REQUEST: {
    INDIVIDUAL_LANDLORD_FOCUS: `Hi {contact_name},

I'm {tenant_name}, and I'm specifically interested in connecting with individual landlords like you for your property at {property_address}.

As someone who values personal landlord relationships over corporate management, I appreciate that individual landlords:
• Respond faster and make decisions quicker
• Skip corporate bureaucracy and junk fees
• Build genuine tenant-landlord relationships

My verified RentCard: {rentcard_link}

Looking forward to connecting directly!
{tenant_name}`,
    NETWORK_VALUE: `Hi {contact_name},

I found your property through MyRentCard's individual landlord network at {property_address}.

As an individual property owner, you're part of the ${INDIVIDUAL_LANDLORD_STATS.MARKET_SHARE} owned by individual landlords. Our platform helps tenants like me connect specifically with responsive individual landlords rather than corporate management.

View my verified profile: {rentcard_link}

{tenant_name}`,
  },
  FOLLOW_UP: {
    INDIVIDUAL_LANDLORD_EMPHASIS: `Hi {contact_name},

Following up on my interest in {property_address}.

I specifically seek out individual landlords like you because you respond faster and make personal decisions rather than going through corporate bureaucracy.

My complete profile with verified references: {rentcard_link}

Appreciate your direct, personal approach to landlording!

{tenant_name}`,
  },
  INITIAL_INQUIRY: {
    INDIVIDUAL_LANDLORD_CONNECTION: `Hi {contact_name},

I saw your listing for {property_address} and I'm very interested!

I specifically choose to work with individual landlords like you rather than corporate property management. Individual landlords own ${INDIVIDUAL_LANDLORD_STATS.MARKET_SHARE} and offer the personal touch and faster decisions I value.

My verified rental profile: {rentcard_link}

Would love to schedule a viewing and discuss your property directly.

Best,
{tenant_name}`,
  },
} as const;

// Individual landlord-focused notification messaging
export const NETWORK_NOTIFICATIONS = {
  WELCOME_MESSAGES: {
    TENANT: `RentCard complete! Connect with individual landlords who own ${INDIVIDUAL_LANDLORD_STATS.MARKET_SHARE}.`,
    LANDLORD: 'Individual landlord tools ready! Compete with corporate efficiency while keeping your personal touch.',
  },
  ACHIEVEMENT_MESSAGES: {
    PROFILE_COMPLETE: 'RentCard ready! Individual landlords can now make faster decisions about your application.',
    REFERENCE_VERIFIED: 'References verified! Individual landlords appreciate pre-verified tenant information.',
    FIRST_SHARE: 'RentCard shared! Individual landlord has everything needed for quick, personal decision-making.',
  },
  WORKFLOW_MESSAGES: {
    DOCUMENT_COMPLETE: 'Documentation complete! Individual landlords can make informed decisions quickly.',
    REFERENCE_READY: 'References ready! Individual landlords appreciate verified tenant references.',
    EMPLOYMENT_VERIFIED: 'Employment verified! Individual landlords value transparent tenant information.',
  },
} as const;

// Individual landlord-focused CTA messaging
export const NETWORK_CTA = {
  PRIMARY: {
    TENANT: {
      MAIN: 'Connect with Individual Landlords',
      SECONDARY: `Access ${INDIVIDUAL_LANDLORD_STATS.MARKET_SHARE} Rental Market`,
      URGENCY: 'Skip Corporate Bureaucracy Today',
    },
    LANDLORD: {
      MAIN: 'Compete with Corporate Efficiency',
      SECONDARY: 'Keep Your Personal Touch',
      URGENCY: 'Professional Tools for Individual Landlords',
    },
  },
  SECONDARY: {
    SHARE: 'Connect with Individual Property Owners',
    REFER: 'Join Individual Landlord Network',
    EXPLORE: 'See Individual Landlord Benefits',
    LEARN_MORE: 'Why Individual Landlords Respond Faster',
  },
  INDIVIDUAL_LANDLORD_FOCUSED: {
    TENANT_WORKFLOW: 'Connect directly with property owners',
    LANDLORD_WORKFLOW: 'Individual landlord efficiency tools',
    RELATIONSHIP_FOCUSED: 'Build personal landlord relationships',
    EFFICIENCY_FOCUSED: 'Skip corporate management entirely',
  },
} as const;

// Types for TypeScript support
export type SocialProofStat = keyof typeof SOCIAL_PROOF_STATS;
export type NetworkValueProp = keyof typeof NETWORK_VALUE_PROPS;
export type ViralMessage = keyof typeof VIRAL_MESSAGING;
export type SuccessStory = typeof SUCCESS_STORIES.TENANT_TESTIMONIALS[0];
export type TrustSignal = keyof typeof TRUST_SIGNALS;
export type NetworkCTA = keyof typeof NETWORK_CTA;