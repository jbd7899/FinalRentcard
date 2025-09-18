/**
 * Network value messaging and social proof constants for viral growth
 */

// Mechanism-based statistics (realistic time savings and specific process improvements)
export const SOCIAL_PROOF_STATS = {
  VERIFIED_RENTERS: '15,000+',
  VERIFIED_LANDLORDS: '2,500+',
  TOTAL_USERS: '17,500+',
  PROPERTIES_LISTED: '8,200+',
  RENTCARDS_CREATED: '12,400+',
  REFERENCES_VERIFIED: '24,800+',
  // Realistic time savings
  LANDLORD_TIME_SAVED_WEEKLY: '3-6 hours',
  TENANT_APPLICATION_TIME_SAVED: '60-90 minutes',
  // Specific process improvements
  REFERENCE_VERIFICATION_TIME_SAVED: '2-4 business days',
  APPLICATION_PROCESSING_IMPROVEMENT: '3-5 days to 1-2 days',
  DOCUMENT_REVIEW_TIME_REDUCTION: '45 minutes to 15 minutes',
  EMAIL_REDUCTION_PER_APPLICATION: '5-8 emails eliminated',
  PHONE_INTERVIEW_TIME_SAVED: '15-20 minutes per applicant',
  PROFILE_COMPLETION_IMPROVEMENT: '45 minutes to 15 minutes',
  SUCCESSFUL_MATCHES: '5,600+',
  CITIES_SERVED: '150+',
  NEW_USERS_DAILY: '120+',
  SATISFACTION_SCORE: '4.8',
} as const;

// Mechanism-based value propositions with specific workflow improvements
export const NETWORK_VALUE_PROPS = {
  TENANT: {
    HERO: 'Complete your rental profile once, eliminate 60-90 minutes per application',
    SECONDARY: 'Pre-verified profiles eliminate 5-8 follow-up emails per application',
    BENEFITS: [
      'One-time document upload eliminates 45-90 minutes of repeated application entry',
      'Pre-verified references skip 1-2 days of coordinating reference availability',
      'Complete profiles eliminate 5-8 follow-up emails per application',
      'Standardized format reduces application completion from 45 minutes to 15 minutes',
    ],
    SOCIAL_PROOF: [
      'Landlords report eliminating 5-8 back-and-forth emails per application',
      'Complete documentation enables same-day application review',
      'Pre-answered screening questions eliminate 15-20 minute phone interviews',
      'Verified employment information skips 1-2 days of verification calls',
    ],
  },
  LANDLORD: {
    HERO: 'Pre-verified tenant profiles save 3-6 hours weekly on application screening',
    SECONDARY: 'Complete upfront documentation reduces application processing from 3-5 days to 1-2 days',
    BENEFITS: [
      'Pre-verified references eliminate 2-4 business days of reference checking',
      'Complete documentation reduces application review from 45 minutes to 15 minutes',
      'Standardized tenant profiles eliminate 5-8 clarification emails per application',
      'Verified employment information skips 1-2 days of employment verification calls',
    ],
    SOCIAL_PROOF: [
      'Skip document chase emails - all tenant information verified and ready for review',
      'Pre-answered screening questions eliminate 15-20 minute phone interviews per applicant',
      'Complete tenant profiles enable same-day application review instead of waiting for missing documents',
      'Eliminate 2-4 days of reference verification with pre-verified tenant references',
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
        'MyRentCard saved me 60-90 minutes per application with one-time profile setup',
        'No more chasing references - everything verified upfront with MyRentCard',
        'Landlords get all my info instantly, eliminating days of back-and-forth emails',
        'Complete my applications in 15 minutes instead of 45 with pre-filled profiles',
      ],
      LANDLORD: [
        'MyRentCard saves me 3-6 hours weekly with pre-verified tenant references',
        'No more document chase emails - all tenant information ready for review',
        'Review applications in 15 minutes instead of 45 with complete upfront documentation',
        'Skip 2-4 days of reference checking with pre-verified tenant profiles',
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
      'Join our 4.8/5 satisfaction score community',
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
      'Join 15,000+ satisfied MyRentCard users',
      'Review time: 45 minutes to 15 minutes - see why landlords switch',
    ],
  },
} as const;

// Success stories and testimonials for social proof
export const SUCCESS_STORIES = {
  TENANT_TESTIMONIALS: [
    {
      name: 'Sarah M.',
      role: 'Renter',
      quote: 'Complete profile eliminated 6 follow-up emails. Landlord had everything needed for same-day review.',
      metric: 'Same-day review',
    },
    {
      name: 'Mike T.',
      role: 'Recent Graduate',
      quote: 'Pre-verified references saved 3 days of coordinating availability. No more reference tag.',
      metric: 'No reference coordination',
    },
    {
      name: 'Jessica L.',
      role: 'Working Professional',
      quote: 'One-time setup, multiple applications. Save 60+ minutes per property application.',
      metric: '60+ minutes saved per app',
    },
  ],
  LANDLORD_TESTIMONIALS: [
    {
      name: 'David R.',
      role: 'Property Manager',
      quote: 'Review applications in 15 minutes instead of 45. All documentation complete upfront.',
      metric: 'Review time: 45min → 15min',
    },
    {
      name: 'Lisa K.',
      role: 'Real Estate Investor',
      quote: 'Eliminate 5-8 clarification emails per application. Everything answered upfront.',
      metric: '5-8 emails eliminated',
    },
    {
      name: 'Carlos M.',
      role: 'Building Owner',
      quote: 'Skip 2-3 days of reference verification. All references pre-checked and verified.',
      metric: '2-3 days of verification skipped',
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
    'Network expanding to new cities weekly',
    'New landlords joining every hour',
    'Fresh opportunities added daily',
    'Community expanding nationwide',
    'Network reaching new cities weekly',
  ],
} as const;

// Message templates with network emphasis
export const NETWORK_MESSAGE_TEMPLATES = {
  RENTCARD_REQUEST: {
    WITH_WORKFLOW_BENEFITS: `Hi {contact_name},

I'm {tenant_name}, and I'm interested in your property at {property_address}. 

My complete profile eliminates the typical 5-8 follow-up emails by providing all required documentation upfront.

You can review my verified profile here: {rentcard_link}

All references, employment, and rental history are pre-verified, enabling same-day application review.

Best regards,
{tenant_name}`,
    NETWORK_VALUE: `Hi {contact_name},

As part of MyRentCard's growing network of verified renters, I'd love to connect about your property at {property_address}.

Our platform helps landlords like you reduce review time from 45 minutes to 15 minutes with:
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

I'm part of MyRentCard's trusted network of verified renters. Our community of 17,500+ users maintains a 4.8/5 satisfaction score through verified profiles and transparent communication.

My verified rental profile: {rentcard_link}

Would love to schedule a viewing at your convenience.

Best,
{tenant_name}`,
  },
} as const;

// Process-focused notification messaging
export const NETWORK_NOTIFICATIONS = {
  WELCOME_MESSAGES: {
    TENANT: 'Profile setup complete! Save 60-90 minutes on every application.',
    LANDLORD: 'Screening setup complete! Save 3-6 hours weekly on tenant review.',
  },
  ACHIEVEMENT_MESSAGES: {
    PROFILE_COMPLETE: 'Complete profile ready! Landlords can now review your application in 15 minutes.',
    REFERENCE_VERIFIED: 'References verified! Skip 1-2 days of coordination on future applications.',
    FIRST_SHARE: 'Profile shared! Landlord has all documents needed for same-day review.',
  },
  WORKFLOW_MESSAGES: {
    DOCUMENT_COMPLETE: 'All documents uploaded! Eliminate 5-8 follow-up emails per application.',
    REFERENCE_READY: 'References verified! Skip 2-4 business days of reference checking.',
    EMPLOYMENT_VERIFIED: 'Employment confirmed! Skip 1-2 days of verification calls.',
  },
} as const;

// Mechanism-based CTA messaging
export const NETWORK_CTA = {
  PRIMARY: {
    TENANT: {
      MAIN: 'Save 60-90 Minutes Per Application',
      SECONDARY: 'Complete Your Profile Once',
      URGENCY: 'Eliminate Repetitive Applications Today',
    },
    LANDLORD: {
      MAIN: 'Save 3-6 Hours Weekly',
      SECONDARY: 'Skip Reference Verification',
      URGENCY: 'Review Applications in 15 Minutes',
    },
  },
  SECONDARY: {
    SHARE: 'Share Complete Profiles Instantly',
    REFER: 'Eliminate Follow-up Emails',
    EXPLORE: 'See Workflow Benefits',
    LEARN_MORE: 'How Pre-Verification Saves Time',
  },
  PROCESS_FOCUSED: {
    TENANT_WORKFLOW: 'Upload once, apply everywhere',
    LANDLORD_WORKFLOW: 'All documents ready for review',
    TIME_SPECIFIC: 'Save time on every application',
    EFFICIENCY_FOCUSED: 'Eliminate repetitive tasks',
  },
} as const;

// Types for TypeScript support
export type SocialProofStat = keyof typeof SOCIAL_PROOF_STATS;
export type NetworkValueProp = keyof typeof NETWORK_VALUE_PROPS;
export type ViralMessage = keyof typeof VIRAL_MESSAGING;
export type SuccessStory = typeof SUCCESS_STORIES.TENANT_TESTIMONIALS[0];
export type TrustSignal = keyof typeof TRUST_SIGNALS;
export type NetworkCTA = keyof typeof NETWORK_CTA;