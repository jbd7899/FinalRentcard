/**
 * MYRENTCARD VALUE PROPOSITIONS - SOURCE OF TRUTH
 * 
 * These are the official, refined value propositions that MUST be used
 * across all platform messaging, marketing copy, and user communications.
 * 
 * Last Updated: September 18, 2025
 * Context: Network positioning focused on individual landlords vs corporate
 */

export const OFFICIAL_VALUE_PROPOSITIONS = {
  TENANT: {
    PRIMARY: "Join the network to create your standardized RentCard once, then easily share your prequalification information with individual landlords who own 70-75% of US rentals. Skip corporate application fees and bureaucracy - individual landlords in our network respond 2-3x faster and build the personal relationships that help you find the right rental more efficiently.",
    
    KEY_POINTS: [
      "Join the network",
      "Standardized RentCard creation", 
      "Easy sharing of prequalification info",
      "Individual landlords own 70-75% of US rentals",
      "Skip corporate fees and bureaucracy",
      "2-3x faster responses",
      "Personal relationships",
      "Find rentals more efficiently"
    ]
  },
  
  LANDLORD: {
    PRIMARY: "Join the network to streamline how tenants connect with your properties while maintaining your competitive edge as an individual landlord. Allow qualified tenants to submit interest with one click using standardized RentCards, review prequalification details before showings, and cross-sell other properties when appropriate. Stay competitive with corporate management efficiency while keeping the personal touch that tenants prefer - complete with QR code marketing tools.",
    
    KEY_POINTS: [
      "Join the network",
      "Streamline tenant connections", 
      "Maintain competitive edge as individual landlord",
      "One-click tenant submissions",
      "Standardized RentCards",
      "Review prequalification before showings",
      "Cross-sell other properties",
      "Stay competitive with corporate efficiency", 
      "Keep personal touch",
      "QR code marketing tools"
    ]
  },
  
  NETWORK_POSITIONING: {
    CORE_CONCEPT: "Platform for standardizing prequalification process between tenants and individual landlords",
    NOT_SOCIAL_MEDIA: "Professional network, not social platform",
    INDIVIDUAL_LANDLORD_FOCUS: "70-75% market share, personal relationships, faster decisions vs corporate",
    STANDARDIZATION_BENEFIT: "Consistent prequalification process across all individual landlords"
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
    HERO: "Create Your Standardized RentCard",
    SECONDARY: "One-Click Applications to Individual Landlords",
    DESCRIPTION: "Join the network. Create once, apply everywhere. Individual landlords own 75% of rentals.",
    BENEFITS: [
      "Join the network to create your standardized RentCard once",
      "Easily share prequalification information with individual landlords",
      "Skip corporate application fees and bureaucracy", 
      "Individual landlords respond 2-3x faster than corporate management",
      "Build personal relationships that help you find the right rental"
    ],
    CALL_TO_ACTION: "Create Your Free RentCard"
  },
  
  LANDLORD: {
    HERO: "Streamline Tenant Connections",
    SECONDARY: "Individual Landlord Network Tools",
    DESCRIPTION: "Join the network. One-click submissions, QR codes, cross-selling tools.",
    BENEFITS: [
      "Allow qualified tenants to submit interest with one click",
      "Review standardized RentCard prequalification before showings",
      "Cross-sell other properties when appropriate",
      "Stay competitive with corporate efficiency while keeping personal touch",
      "Generate QR code marketing tools with one click"
    ],
    CALL_TO_ACTION: "Create Your Free Landlord Profile"
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