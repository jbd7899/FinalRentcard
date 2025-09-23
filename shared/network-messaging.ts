/**
 * Private landlord messaging constants focused on clear, direct copy.
 */

import { DERIVED_MESSAGING } from './value-propositions';

export const PRIVATE_LANDLORD_STATS = {
  MARKET_SHARE: 'Private landlords own 68.7% of U.S. rentals.',
  FASTER_DECISIONS: 'Clear renter details help private landlords decide quickly.',
  CONTROLLED_SHARING: 'Renters stay in control of what they share and when they update it.',
} as const;

export const SOCIAL_PROOF_STATS = {
  FASTER_REPLIES: 'Landlords reply faster after reviewing a RentCard.',
  LESS_REPETITION: 'Tenants reuse one RentCard instead of rewriting forms.',
  QR_AT_SHOWINGS: 'QR codes capture interest at showings and on signage.',
  ORGANIZED_INTEREST: 'Property profiles keep every inquiry organized.',
  BETTER_MATCHES: 'Everyone spends time on renters who already fit.',
} as const;

export const NETWORK_VALUE_PROPS = {
  TENANT: {
    HERO: DERIVED_MESSAGING.TENANT.HERO,
    SECONDARY: DERIVED_MESSAGING.TENANT.SECONDARY,
    BENEFITS: [
      'Create your RentCard once and reuse it anywhere.',
      'Share links or QR codes with private landlords as soon as a property appears.',
      'Stay in control of what you update and when you share it.',
    ],
  },
  LANDLORD: {
    HERO: DERIVED_MESSAGING.LANDLORD.HERO,
    SECONDARY: DERIVED_MESSAGING.LANDLORD.SECONDARY,
    BENEFITS: [
      'Collect organized tenant interest in one place.',
      'Reuse QR codes and links across every listing and showing.',
      'Spend time with renters who already meet your criteria.',
    ],
  },
} as const;

export const VIRAL_MESSAGING = {
  REFERRAL: {
    HEADLINES: [
      'Share RentCard with renters and landlords you trust',
      'Let private landlords see complete renter details',
      'Help friends skip rewriting applications',
      'Show landlords how easy one-click interest can be',
    ],
    SHARE_TEXTS: {
      TENANT: [
        'I keep my renter details ready with RentCard and share them in one click.',
        'Private landlords see my income, history, and references right away.',
        'RentCard lets me skip repeating the same information for every property.',
        'Here’s the link I send to landlords when I spot a new listing.',
      ],
      LANDLORD: [
        'RentCard keeps my property inquiries organized with full context.',
        'Tenants submit interest with one click so I can focus on good matches.',
        'QR codes make it easy to collect interest at showings and online.',
        'I reuse the same profile when I cross-sell another property.',
      ],
    },
    BENEFITS_MESSAGING: [
      'Clear RentCards reduce guesswork for both renters and landlords.',
      'Reusable links keep conversations short and focused.',
      'Prepared renters help landlords respond with confidence.',
      'Sharing RentCard keeps private rentals personal and organized.',
    ],
  },
  ONBOARDING: {
    NETWORK_PARTICIPATION: [
      'Complete your RentCard so you can share it in one click.',
      'Add income, employment, and rental history landlords expect to see.',
      'Update your details whenever something changes.',
      'Share your link with landlords who value prepared renters.',
    ],
    SOCIAL_PROOF_STEPS: [
      'Send your RentCard before you ask about a tour.',
      'Include references and documents so landlords have context.',
      'Keep the same link in emails, texts, and QR codes.',
      'Suggest RentCard to property owners who want organized interest.',
    ],
  },
  EMAIL_SUBJECTS: {
    NETWORK_GROWTH: [
      'Share your RentCard with private landlords today',
      'Ready to send your RentCard in one click?',
      'Keep your renter details in one link',
      'See how landlords respond to complete RentCards',
    ],
    SOCIAL_PROOF: [
      'Private landlords prefer ready-to-review RentCards',
      'Share one link instead of rewriting forms',
      'Organize tenant interest with a RentCard profile',
      'Reuse QR codes across every showing',
    ],
  },
} as const;

export const SUCCESS_STORIES = {
  TENANT_TESTIMONIALS: [
    {
      name: 'Sarah M.',
      role: 'Renter',
      quote: 'I sent my RentCard link and heard back the same afternoon.',
      metric: 'Same-day reply',
    },
    {
      name: 'Mike T.',
      role: 'Recent Graduate',
      quote: 'Landlords see my full story without extra emails or forms.',
      metric: 'Less back-and-forth',
    },
    {
      name: 'Jessica L.',
      role: 'Working Professional',
      quote: 'One link now replaces the stack of documents I used to send.',
      metric: 'Single share workflow',
    },
  ],
  LANDLORD_TESTIMONIALS: [
    {
      name: 'David R.',
      role: 'Private Property Owner',
      quote: 'RentCards give me the context I need before I schedule a tour.',
      metric: 'Prepared tours',
    },
    {
      name: 'Lisa K.',
      role: 'Private Landlord',
      quote: 'Organized interest means I can focus on renters who are a fit.',
      metric: 'Focused follow-ups',
    },
    {
      name: 'Carlos M.',
      role: 'Property Owner',
      quote: 'QR codes and links make it simple to collect interest anywhere.',
      metric: 'Every-channel capture',
    },
  ],
} as const;

export const TRUST_SIGNALS = {
  RENTCARD_STRENGTH: [
    'Profile updated within the last 30 days',
    'Income range and employment details provided',
    'Rental history and references included',
    'Supporting documents attached where helpful',
    'Clear notes for landlords about timing and needs',
    'Contact preferences listed upfront',
  ],
  LANDLORD_CONFIDENCE: [
    'Property expectations outlined in the profile',
    'Availability for tours listed clearly',
    'Preferred response times shared with renters',
    'QR code displayed on signage and listings',
    'Other available properties linked for cross-selling',
    'Follow-up steps described in simple language',
  ],
  SHARING_MOMENTS: [
    'Renters send their RentCard link when they spot a new property',
    'Landlords post QR codes at showings and open houses',
    'Links added to listing descriptions and text replies',
    'Saved responses include the RentCard link for quick sharing',
    'Profiles refreshed before renewals and new showings',
    'Printed handouts include the property QR code',
  ],
} as const;

export const NETWORK_MESSAGE_TEMPLATES = {
  RENTCARD_REQUEST: {
    DIRECT_SHARE: `Hi {contact_name},

I'm {tenant_name}. Here's my RentCard with income, employment, and rental history:

{rentcard_link}

Looking forward to hearing from you.`,
    PROPERTY_SPECIFIC: `Hi {contact_name},

I noticed {property_address} and wanted to share my RentCard so you have everything you need:

{rentcard_link}

Thanks for taking a look,
{tenant_name}`,
  },
  FOLLOW_UP: {
    STATUS_CHECK: `Hi {contact_name},

Checking in about {property_address}. My RentCard keeps everything in one place:

{rentcard_link}

Happy to answer any questions.
{tenant_name}`,
  },
  INITIAL_INQUIRY: {
    FIRST_TOUCH: `Hi {contact_name},

I spotted your listing for {property_address}. My RentCard is ready to review:

{rentcard_link}

Let me know if we should schedule a visit.
Thanks,
{tenant_name}`,
  },
} as const;

export const NETWORK_NOTIFICATIONS = {
  WELCOME_MESSAGES: {
    TENANT: 'RentCard ready—share it with private landlords in one click.',
    LANDLORD: 'Landlord tools ready—collect organized interest immediately.',
  },
  ACHIEVEMENT_MESSAGES: {
    PROFILE_COMPLETE: 'RentCard complete. Share it with private landlords today.',
    REFERENCE_ADDED: 'Reference added. Landlords can now see it on your RentCard.',
    FIRST_SHARE: 'Nice work! Your RentCard link is live and ready to reuse.',
  },
  WORKFLOW_MESSAGES: {
    DOCUMENT_UPLOADED: 'Documents uploaded. Landlords will appreciate the clarity.',
    REFERENCE_UPDATED: 'Reference details updated. Share confidently with property owners.',
    EMPLOYMENT_UPDATED: 'Employment details refreshed. Keep your RentCard current.',
  },
} as const;

export const NETWORK_CTA = {
  PRIMARY: {
    TENANT: {
      MAIN: 'Create my RentCard',
      SECONDARY: 'Share it with private landlords',
      URGENCY: 'Be ready before the next listing appears',
    },
    LANDLORD: {
      MAIN: 'Create my property profile',
      SECONDARY: 'Collect organized tenant interest',
      URGENCY: 'Focus on renters who already fit',
    },
  },
  SECONDARY: {
    SHARE: 'Share RentCard with a landlord you trust',
    REFER: 'Invite a renter who needs a RentCard',
    EXPLORE: 'See how RentCard works for private rentals',
    LEARN_MORE: 'Learn how RentCard saves you time',
  },
  PRIVATE_RENTAL_WORKFLOWS: {
    TENANT_WORKFLOW: 'Keep your RentCard up to date',
    LANDLORD_WORKFLOW: 'Collect interest with one link or QR code',
    PERSONAL_TOUCH: 'Stay organized without losing the personal touch',
    EFFICIENCY: 'Review complete details before you reply',
  },
} as const;

export type SocialProofStat = keyof typeof SOCIAL_PROOF_STATS;
export type NetworkValueProp = keyof typeof NETWORK_VALUE_PROPS;
export type ViralMessage = keyof typeof VIRAL_MESSAGING;
export type SuccessStory = typeof SUCCESS_STORIES.TENANT_TESTIMONIALS[0];
export type TrustSignal = keyof typeof TRUST_SIGNALS;
export type NetworkCTA = keyof typeof NETWORK_CTA;
