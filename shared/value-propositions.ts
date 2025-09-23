/**
 * MYRENTCARD VALUE PROPOSITIONS - SOURCE OF TRUTH
 * 
 * These are the official, refined value propositions that MUST be used
 * across all platform messaging, marketing copy, and user communications.
 * 
 * Last Updated: September 18, 2025
 * Context: Network positioning focused on private landlord relationships
 */

export const OFFICIAL_VALUE_PROPOSITIONS = {
  TENANT: {
    PRIMARY:
      'Create once, share easily. Private landlords own 68.7% of rentals in America. Build your RentCard one time, keep it updated in minutes, and share it without any extra verification steps.',

    KEY_POINTS: [
      'Create your RentCard once',
      'Share with private landlords anywhere',
      'Private landlords own 68.7% of rentals in America',
      'Update easily and share with one click',
      'Provide clear prequalification information',
      'No verification hoops—share only what you choose'
    ]
  },

  LANDLORD: {
    PRIMARY:
      'Spend your time with pre-qualified tenants. Create a RentCard profile for each property, collect organized tenant interest with one click submissions, and reuse QR codes anywhere you promote rentals.',

    KEY_POINTS: [
      'Create a landlord profile for each property',
      'Collect organized tenant interest',
      'Tenants submit interest with one click',
      'Generate reusable QR codes',
      'Share links on signs and listings',
      'Cross-sell between properties with the same toolkit'
    ]
  },

  NETWORK_POSITIONING: {
    CORE_CONCEPT: 'Platform for standardizing prequalification between tenants and private landlords',
    NOT_SOCIAL_MEDIA: 'Professional network, not social platform',
    PRIVATE_LANDLORD_FOCUS: '68.7% market share, personal relationships, faster responses',
    STANDARDIZATION_BENEFIT: 'Consistent prequalification process across private landlords'
  }
} as const;

/**
 * USAGE GUIDELINES:
 * 
 * 1. ALL user-facing messaging should derive from these value propositions
 * 2. When creating new copy, reference these as the foundation
 * 3. Any updates to these value props require updating this file FIRST
 * 4. Use KEY_POINTS to ensure all important elements are included
 * 5. Maintain NETWORK_POSITIONING context in all messaging
 */

// Derived messaging components based on official value propositions
export const DERIVED_MESSAGING = {
  TENANT: {
    HERO: 'Create once, share easily.',
    SECONDARY: 'Share prequalification details with private landlords in seconds.',
    DESCRIPTION:
      'Create your RentCard one time, update it easily, and share with one click to private landlords—even if they are not on RentCard. No verification hoops—just the information you choose to show.',
    BENEFITS: [
      'One RentCard you can update in minutes',
      'Share links or QR codes with any private landlord',
      'Stay ready for the 68.7% of rentals owned by private landlords',
      'Provide the prequalification details landlords expect up front',
      'Cut the back-and-forth before a showing'
    ],
    CALL_TO_ACTION: 'Create Your Free RentCard'
  },

  LANDLORD: {
    HERO: 'Spend your time with pre-qualified tenants.',
    SECONDARY: 'Easily collect and organize tenant interest.',
    DESCRIPTION:
      'Create a RentCard profile for each property, let tenants submit interest with one click, and keep QR codes ready for every listing so you can focus on renters who are already a match.',
    BENEFITS: [
      'Collect organized tenant interest in one place',
      'Create reusable QR codes for every property',
      'Let tenants raise their hand with one click',
      'Highlight other properties to interested renters',
      'Focus follow-ups on renters who already shared context'
    ],
    CALL_TO_ACTION: 'Create Your Free Landlord Profile'
  }
} as const;

// Legacy compatibility - gradually migrate to OFFICIAL_VALUE_PROPOSITIONS
export const NETWORK_VALUE_PROPS = {
  TENANT: {
    HERO: DERIVED_MESSAGING.TENANT.HERO,
    SECONDARY: DERIVED_MESSAGING.TENANT.SECONDARY,
    BENEFITS: DERIVED_MESSAGING.TENANT.BENEFITS,
  },
  LANDLORD: {
    HERO: DERIVED_MESSAGING.LANDLORD.HERO, 
    SECONDARY: DERIVED_MESSAGING.LANDLORD.SECONDARY,
    BENEFITS: DERIVED_MESSAGING.LANDLORD.BENEFITS,
  }
};

export type OfficialValueProp = keyof typeof OFFICIAL_VALUE_PROPOSITIONS;
export type DerivedMessage = keyof typeof DERIVED_MESSAGING;