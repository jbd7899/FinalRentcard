/**
 * Common string literals and enums
 */

// User roles
export const USER_ROLES = {
  TENANT: 'tenant',
  LANDLORD: 'landlord',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Interest status (simplified)
export const INTEREST_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  ARCHIVED: 'archived',
} as const;

export type InterestStatus = typeof INTEREST_STATUS[keyof typeof INTEREST_STATUS];

// Keep APPLICATION_STATUS as alias for backward compatibility
export const APPLICATION_STATUS = INTEREST_STATUS;
export type ApplicationStatus = InterestStatus;

// Property types
export const PROPERTY_TYPES = {
  APARTMENT: 'apartment',
  HOUSE: 'house',
  CONDO: 'condo',
  TOWNHOUSE: 'townhouse',
  OTHER: 'other',
} as const;

export type PropertyType = typeof PROPERTY_TYPES[keyof typeof PROPERTY_TYPES];

// Interest labels (simplified)
export const INTEREST_LABELS = {
  STATUS: {
    [INTEREST_STATUS.NEW]: 'New Interest',
    [INTEREST_STATUS.CONTACTED]: 'Contacted',
    [INTEREST_STATUS.ARCHIVED]: 'Archived',
  },
};

// Keep APPLICATION_LABELS as alias for backward compatibility
export const APPLICATION_LABELS = {
  STATUS: INTEREST_LABELS.STATUS,
  PAYMENT_HISTORY: {
    ON_TIME: 'Always on time',
    MOSTLY_ON_TIME: 'Usually on time',
    SOMETIMES_LATE: 'Sometimes late',
    OFTEN_LATE: 'Often late',
  },
  PROPERTY_CONDITION: {
    EXCELLENT: 'Excellent',
    GOOD: 'Good',
    FAIR: 'Fair',
    POOR: 'Poor',
  },
} as const;

// Common messages
export const MESSAGES = {
  ERRORS: {
    GENERAL: 'Something went wrong. Please try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION: 'Please check your input and try again.',
  },
  SUCCESS: {
    SAVED: 'Changes saved successfully.',
    CREATED: 'Created successfully.',
    UPDATED: 'Updated successfully.',
    DELETED: 'Deleted successfully.',
    COPIED: 'Link copied to clipboard!',
  },
  INTEREST_STATUS: {
    [INTEREST_STATUS.CONTACTED]: 'Successfully Contacted',
    [INTEREST_STATUS.ARCHIVED]: 'Archived',
  },
  APPLICATION_STATUS: {
    [APPLICATION_STATUS.CONTACTED]: 'Successfully Contacted',
    [APPLICATION_STATUS.ARCHIVED]: 'Archived',
  },
  AUTH: {
    CARD_DESCRIPTIONS: {
      LOGIN: 'Enter your credentials to access your RentCard account',
      REGISTER: 'One profile landlords can pre-screen instantly',
    },
    TITLES: {
      LOGIN: 'Login to your account',
      REGISTER: 'Create Your RentCard',
    },
    BENEFITS: [
      {
        title: 'Create your verified profile',
        description: 'Build a RentCard that landlords can pre-screen instantly',
      },
      {
        title: 'Pre-screen qualified tenants',
        description: 'Save time by qualifying prospects before showings',
      },
      {
        title: 'Streamline tenant qualification',
        description: 'Automate your pre-screening workflow efficiently',
      },
    ],
  },
  TOAST: {
    AUTH: {
      LOGIN_ERROR: {
        TITLE: 'Login failed',
        DESCRIPTION: 'Please check your credentials and try again',
      },
      REGISTER_ERROR: {
        TITLE: 'Registration failed',
        DESCRIPTION: 'An error occurred during registration. Please try again',
      },
      LOGIN_SUCCESS: {
        TITLE: 'Welcome back!',
        DESCRIPTION: 'You have successfully logged in',
      },
      REGISTER_SUCCESS: {
        TITLE: 'Welcome to the Individual Landlord Network!',
        DESCRIPTION: 'Your account is ready to connect with responsive individual landlords',
      },
      LOGOUT_SUCCESS: {
        TITLE: 'Goodbye!',
        DESCRIPTION: 'You have been logged out successfully',
      },
    },
    RENTCARD: {
      CREATE_SUCCESS: {
        TITLE: 'RentCard Created',
        DESCRIPTION: 'Your RentCard has been created successfully',
      },
      UPDATE_SUCCESS: {
        TITLE: 'RentCard Updated',
        DESCRIPTION: 'Your RentCard has been updated successfully',
      },
    },
    PROPERTY: {
      CREATE_SUCCESS: {
        TITLE: 'Property Added',
        DESCRIPTION: 'Your property has been added successfully',
      },
      UPDATE_SUCCESS: {
        TITLE: 'Property Updated',
        DESCRIPTION: 'Your property has been updated successfully',
      },
    },
    APPLICATION: {
      STATUS_UPDATED: {
        TITLE: 'Pre-Screening Updated',
        DESCRIPTION: 'Pre-screening status has been updated successfully',
      },
      ARCHIVED: {
        TITLE: 'Pre-Screening Archived',
        DESCRIPTION: 'Pre-screening has been archived successfully',
      },
      CONTACTED: {
        TITLE: 'Prospect Contacted',
        DESCRIPTION: 'Prospect has been successfully contacted',
      },
    },
  },
  CTA: {
    LANDLORD: {
      PRIMARY: 'Start Pre-Screening',
      SECONDARY: 'Request RentCard',
      BENEFITS: {
        PRE_SCREENING: 'Pre-screen qualified tenants instantly',
        TIME_SAVING: 'Save time by qualifying prospects before property showings',
        STREAMLINED: 'Streamline your tenant qualification workflow',
      },
    },
    TENANT: {
      PRIMARY: 'Create RentCard',
      SECONDARY: 'Submit Interest',
    },
  },
} as const;