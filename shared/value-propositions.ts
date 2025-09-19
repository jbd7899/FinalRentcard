/**
 * MYRENTCARD VALUE PROPOSITIONS - SOURCE OF TRUTH
 * 
 * These are the official, refined value propositions that MUST be used
 * across all platform messaging, marketing copy, and user communications.
 * 
 * Last Updated: September 18, 2025
 * Context: Network positioning focused on private landlords vs corporate
 */

export const OFFICIAL_VALUE_PROPOSITIONS = {
  TENANT: {
    PRIMARY: "Create your RentCard and send to Private Landlords. Private landlords own up to 75% of rentals in America. Create your Rentcard once and send with one click to Private landlords even if they aren't on our platform. Save time and get matched with the perfect Private Rental.",
    
    KEY_POINTS: [
      "Create RentCard",
      "Send to Private Landlords", 
      "Private landlords own up to 75% of rentals",
      "Create once, send with one click",
      "Works even if landlords not on platform",
      "Save time",
      "Get matched with perfect Private Rental"
    ]
  },
  
  LANDLORD: {
    PRIMARY: "Create your landlord profile and streamline connecting to tenants interested in Private Rentals. Allow tenants to submit interest in your properties even if they don't have a RentCard. Generate free QR codes to put on signs and marketing materials that link directly to you. Cross-sell your other properties that may not be listed yet.",
    
    KEY_POINTS: [
      "Create landlord profile",
      "Streamline connecting to tenants", 
      "Tenants interested in Private Rentals",
      "Accept interest without RentCard",
      "Generate free QR codes",
      "Put on signs and marketing materials",
      "Link directly to you",
      "Cross-sell other properties"
    ]
  },
  
  NETWORK_POSITIONING: {
    CORE_CONCEPT: "Platform for standardizing prequalification process between tenants and private landlords",
    NOT_SOCIAL_MEDIA: "Professional network, not social platform",
    PRIVATE_LANDLORD_FOCUS: "Up to 75% market share, personal relationships, faster decisions vs corporate",
    STANDARDIZATION_BENEFIT: "Consistent prequalification process across all private landlords"
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
    HERO: "Create your RentCard and send to Private Landlords",
    SECONDARY: "Private landlords own up to 75% of rentals in America",
    DESCRIPTION: "Create your Rentcard once and send with one click to Private landlords even if they aren't on our platform. Save time and get matched with the perfect Private Rental.",
    BENEFITS: [
      "Create your RentCard once and send with one click",
      "Send to Private landlords even if they're not on our platform",
      "Private landlords own up to 75% of rentals in America", 
      "Save time with standardized applications",
      "Get matched with the perfect Private Rental"
    ],
    CALL_TO_ACTION: "Create Your Free RentCard"
  },
  
  LANDLORD: {
    HERO: "Create your landlord profile and streamline connecting to tenants interested in Private Rentals",
    SECONDARY: "Private Landlord Network Tools",
    DESCRIPTION: "Allow tenants to submit interest in your properties even if they don't have a RentCard. Generate free QR codes to put on signs and marketing materials that link directly to you. Cross-sell your other properties that may not be listed yet.",
    BENEFITS: [
      "Allow tenants to submit interest even without a RentCard",
      "Generate free QR codes for signs and marketing materials",
      "Links point directly to you and your properties",
      "Cross-sell other properties that may not be listed yet",
      "Streamline connections with tenants interested in Private Rentals"
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