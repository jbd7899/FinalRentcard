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

// Application status
export const APPLICATION_STATUS = {
  NEW: 'new',
  REVIEWING: 'reviewing',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  ARCHIVED: 'archived',
} as const;

export type ApplicationStatus = typeof APPLICATION_STATUS[keyof typeof APPLICATION_STATUS];

// Property types
export const PROPERTY_TYPES = {
  APARTMENT: 'apartment',
  HOUSE: 'house',
  CONDO: 'condo',
  TOWNHOUSE: 'townhouse',
  OTHER: 'other',
} as const;

export type PropertyType = typeof PROPERTY_TYPES[keyof typeof PROPERTY_TYPES];

// Application labels
export const APPLICATION_LABELS = {
  STATUS: {
    [APPLICATION_STATUS.NEW]: 'New',
    [APPLICATION_STATUS.REVIEWING]: 'Under Review',
    [APPLICATION_STATUS.APPROVED]: 'Approved',
    [APPLICATION_STATUS.REJECTED]: 'Rejected',
    [APPLICATION_STATUS.CANCELLED]: 'Cancelled',
    [APPLICATION_STATUS.ARCHIVED]: 'Archived',
  },
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
  APPLICATION_STATUS: {
    [APPLICATION_STATUS.REVIEWING]: 'Under Review',
    [APPLICATION_STATUS.APPROVED]: 'Approved',
    [APPLICATION_STATUS.REJECTED]: 'Rejected',
    [APPLICATION_STATUS.CANCELLED]: 'Cancelled',
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
        TITLE: 'Welcome to MyRentCard!',
        DESCRIPTION: 'Your account has been created successfully',
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
        TITLE: 'Application Updated',
        DESCRIPTION: 'Application status has been updated successfully',
      },
      ARCHIVED: {
        TITLE: 'Application Archived',
        DESCRIPTION: 'Application has been archived successfully',
      },
    },
  },
} as const;