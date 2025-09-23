/**
 * Network value messaging and social proof constants for private landlord workflows
 */

export const PRIVATE_LANDLORD_STATS = {
  MARKET_SHARE: 'Private landlords manage most U.S. rentals',
  DECISION_SPEED: 'Quicker personal decisions',
  PERSONAL_APPROACH: 'Direct communication with owners',
  NO_JUNK_FEES: 'No unnecessary prequalification fees',
} as const;

export const SOCIAL_PROOF_STATS = {
  PRIVATE_LANDLORD_RESPONSE_TIME: 'Faster replies from owners',
  TENANT_APPLICATION_TIME_SAVED: 'Less time rewriting forms',
  STREAMLINED_COMMUNICATION: 'Direct landlord communication',
  ELIMINATE_JUNK_FEES: 'Transparent, fee-free prequalification',
  FASTER_SCREENING: 'Decisions with fewer follow-up emails',
  PERSONAL_RELATIONSHIPS: 'Personalized conversations',
  PRIVATE_LANDLORD_DECISIONS: 'Faster personal decisions',
  PRIVATE_LANDLORDS_JOINING: 'Growing private landlord network',
  NETWORK_QUALITY: 'Trusted private rental network',
  PERSONAL_APPROACH: 'Direct property owner relationships',
} as const;

import { DERIVED_MESSAGING } from './value-propositions';

export const NETWORK_VALUE_PROPS = {
  TENANT: {
    HERO: DERIVED_MESSAGING.TENANT.HERO,
    SECONDARY: DERIVED_MESSAGING.TENANT.SECONDARY,
    BENEFITS: [
      'Create your RentCard once and reuse it anywhere',
      'Share links or QR codes with private landlords quickly',
      'Know earlier if you meet a landlord’s criteria',
    ],
  },
  LANDLORD: {
    HERO: DERIVED_MESSAGING.LANDLORD.HERO,
    SECONDARY: DERIVED_MESSAGING.LANDLORD.SECONDARY,
    BENEFITS: [
      'Receive consistent prequalification information',
      'Collect interest through links or QR codes',
      'Decide faster while keeping conversations personal',
    ],
  },
  NETWORK_EFFECTS: {
    TENANT: [
      'More private landlords mean more direct opportunities',
      'Shared standards make responses clearer and faster',
      'Verified RentCards build trust across the network',
      'Every share improves landlord awareness of qualified renters',
    ],
    LANDLORD: [
      'More prepared tenants reduce your screening workload',
      'Shared templates keep expectations consistent',
      'Quality RentCards encourage quick, confident replies',
      'Network effects help surface serious prospects sooner',
    ],
  },
} as const;

export const VIRAL_MESSAGING = {
  REFERRAL: {
    HEADLINES: [
      'Help grow the trusted private landlord network',
      'Share MyRentCard with fellow renters and owners',
      'Connect friends with responsive private landlords',
      'Grow our prequalification community',
    ],
    SHARE_TEXTS: {
      TENANT: [
        'I use MyRentCard to share my qualifications instantly with private landlords.',
        'Private landlords respond faster when they get the full story up front.',
        'No extra fees—just a clean RentCard I control.',
        'Sharing my RentCard saves both sides back-and-forth emails.',
      ],
      LANDLORD: [
        'MyRentCard gives me consistent RentCards before I schedule tours.',
        'Tenants send the right details the first time, so I can respond quickly.',
        'It keeps the personal feel of private landlording while saving time.',
        'Sharing property links helps me stay organized across channels.',
      ],
    },
    BENEFITS_MESSAGING: [
      'Each new member keeps the network trustworthy and useful',
      'Better data means better decisions for everyone',
      'Help us build a standard that respects both sides',
      'More verified RentCards create smoother conversations',
    ],
  },
  ONBOARDING: {
    NETWORK_PARTICIPATION: [
      'Your complete RentCard helps landlords respond with clarity',
      'Verified details shorten the path to a yes or no',
      'Quality profiles attract quality conversations',
      'Every profile builds confidence in the network',
    ],
    SOCIAL_PROOF_STEPS: [
      'Complete your profile to connect with private landlords',
      'Verified references show landlords you are ready',
      'Stay in control of what you share and when',
      'Invite trusted contacts to strengthen the network',
    ],
  },
  EMAIL_SUBJECTS: {
    NETWORK_GROWTH: [
      'Join the private landlord prequalification network',
      'Connect with private landlords who respond quickly',
      'Your RentCard opens doors to new rentals',
      'See how other renters stay organized with MyRentCard',
    ],
    SOCIAL_PROOF: [
      'Private landlords appreciate ready-to-review RentCards',
      'A consistent format speeds up rental decisions',
      'Tenants save time by sharing one RentCard everywhere',
      'Landlords rely on standardized prequalification',
    ],
  },
} as const;

export const SUCCESS_STORIES = {
  TENANT_TESTIMONIALS: [
    {
      name: 'Sarah M.',
      role: 'Renter',
      quote: 'MyRentCard let me share everything a landlord asked for without rewriting forms. We scheduled a tour the same day.',
      metric: 'Faster private landlord response',
    },
    {
      name: 'Mike T.',
      role: 'Recent Graduate',
      quote: 'Private landlords like seeing my RentCard ahead of time. It sets expectations before we even speak.',
      metric: 'Prepared first conversations',
    },
    {
      name: 'Jessica L.',
      role: 'Working Professional',
      quote: 'Having one link to send everywhere saved me hours. Landlords appreciated the clarity.',
      metric: 'Consistent presentation',
    },
  ],
  LANDLORD_TESTIMONIALS: [
    {
      name: 'David R.',
      role: 'Private Property Owner',
      quote: 'RentCards give me the context I need to respond quickly without losing the personal touch.',
      metric: 'Efficient + personal',
    },
    {
      name: 'Lisa K.',
      role: 'Private Landlord',
      quote: 'Tenants arrive prepared. MyRentCard keeps expectations aligned from the first message.',
      metric: 'Prepared inquiries',
    },
    {
      name: 'Carlos M.',
      role: 'Property Owner',
      quote: 'I can review qualified tenants in minutes and keep my notes organized.',
      metric: 'Organized screening',
    },
  ],
} as const;

export const TRUST_SIGNALS = {
  VERIFICATION_BADGES: [
    'Verified by MyRentCard',
    'Trusted network member',
    'Reference confirmed',
    'Identity verified',
    'Income verified',
    'Community endorsed',
  ],
  TRUST_INDICATORS: [
    'Part of the verified private landlord network',
    'Controls what information is shared',
    'References confirmed by trusted contacts',
    'Profile kept up to date',
    'Transparent about requirements',
    'Respects data privacy',
  ],
  NETWORK_GROWTH_INDICATORS: [
    'More private landlords joining each week',
    'Growing pool of verified RentCards',
    'Expanding to more neighborhoods and cities',
    'New referrals strengthen the network',
    'Quality connections create better outcomes',
    'Shared standards keep expectations clear',
  ],
} as const;

export const NETWORK_MESSAGE_TEMPLATES = {
  RENTCARD_REQUEST: {
    INDIVIDUAL_LANDLORD_FOCUS: `Hi {contact_name},

I'm {tenant_name}. I prefer working with private landlords who can review my details upfront.

Here is my RentCard with income, references, and documents:
{rentcard_link}

Looking forward to connecting!
{tenant_name}`,
    NETWORK_VALUE: `Hi {contact_name},

I found your property in the MyRentCard private landlord network and would love to connect.

My RentCard is ready whenever you are:
{rentcard_link}

Thanks for reviewing,
{tenant_name}`,
  },
  FOLLOW_UP: {
    INDIVIDUAL_LANDLORD_EMPHASIS: `Hi {contact_name},

Checking in about {property_address}. My RentCard keeps everything in one place so you can decide quickly:
{rentcard_link}

Happy to answer any questions.
{tenant_name}`,
  },
  INITIAL_INQUIRY: {
    INDIVIDUAL_LANDLORD_CONNECTION: `Hi {contact_name},

I saw your listing for {property_address} and have already prepared my RentCard.

You can view it here:
{rentcard_link}

Let me know if we should schedule a tour.
Best,
{tenant_name}`,
  },
} as const;

export const NETWORK_NOTIFICATIONS = {
  WELCOME_MESSAGES: {
    TENANT: 'RentCard ready! Share it with private landlords who value preparedness.',
    LANDLORD: 'Landlord tools activated! Collect interest with a consistent process.',
  },
  ACHIEVEMENT_MESSAGES: {
    PROFILE_COMPLETE: 'RentCard complete—share it with private landlords today.',
    REFERENCE_VERIFIED: 'Reference confirmed! Landlords see a stronger profile.',
    FIRST_SHARE: 'Nice work! Your RentCard link is live and ready to reuse.',
  },
  WORKFLOW_MESSAGES: {
    DOCUMENT_COMPLETE: 'Documents uploaded. Landlords will appreciate the clarity.',
    REFERENCE_READY: 'Reference verified. Share confidently with property owners.',
    EMPLOYMENT_VERIFIED: 'Employment details updated. Keep your RentCard current.',
  },
} as const;

export const NETWORK_CTA = {
  PRIMARY: {
    TENANT: {
      MAIN: 'Create my RentCard',
      SECONDARY: 'Reuse it with private landlords',
      URGENCY: 'Share once, reuse everywhere',
    },
    LANDLORD: {
      MAIN: 'Set up landlord tools',
      SECONDARY: 'Review standardized RentCards',
      URGENCY: 'Save time on every inquiry',
    },
  },
  SECONDARY: {
    SHARE: 'Invite another landlord',
    REFER: 'Refer a renter who is ready to move',
    EXPLORE: 'See how the network works',
    LEARN_MORE: 'Learn why private landlords use MyRentCard',
  },
  INDIVIDUAL_LANDLORD_FOCUSED: {
    TENANT_WORKFLOW: 'Keep your RentCard up to date',
    LANDLORD_WORKFLOW: 'Collect interest with one link',
    RELATIONSHIP_FOCUSED: 'Build direct tenant-landlord conversations',
    EFFICIENCY_FOCUSED: 'Stay organized without losing the personal touch',
  },
} as const;

export type SocialProofStat = keyof typeof SOCIAL_PROOF_STATS;
export type NetworkValueProp = keyof typeof NETWORK_VALUE_PROPS;
export type ViralMessage = keyof typeof VIRAL_MESSAGING;
export type SuccessStory = typeof SUCCESS_STORIES.TENANT_TESTIMONIALS[0];
export type TrustSignal = keyof typeof TRUST_SIGNALS;
export type NetworkCTA = keyof typeof NETWORK_CTA;
