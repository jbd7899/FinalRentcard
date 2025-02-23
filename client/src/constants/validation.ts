/**
 * Form validation constants and messages
 */

export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 6,
    MESSAGE: 'Password must be at least 6 characters',
    REGEX: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
    REGEX_MESSAGE: 'Password must contain at least one letter and one number'
  },
  PHONE: {
    MIN_LENGTH: 10,
    MESSAGE: 'Please enter a valid phone number',
    REGEX: /^\+?[\d\s-]{10,}$/,
    REGEX_MESSAGE: 'Please enter a valid phone number format'
  },
  EMAIL: {
    MESSAGE: 'Please enter a valid email address',
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    REGEX_MESSAGE: 'Please enter a valid email format'
  },
  RENTCARD: {
    NAME: {
      MIN_LENGTH: 2,
      MESSAGE: 'Name must be at least 2 characters',
    },
    EMPLOYER: {
      MIN_LENGTH: 2,
      MESSAGE: 'Employer name must be at least 2 characters',
    },
    ADDRESS: {
      MIN_LENGTH: 5,
      MESSAGE: 'Please enter a valid address',
    },
    YEARS_EMPLOYED: {
      MIN: 0,
      MAX: 50,
      MESSAGE: 'Please enter a valid number of years',
    },
    INCOME: {
      MIN: 0,
      MESSAGE: 'Please enter a valid income amount',
    },
    RENT: {
      MIN: 0,
      MESSAGE: 'Please enter a valid rent amount',
    },
    CREDIT_SCORE: {
      MIN: 300,
      MAX: 850,
      MESSAGE: 'Please enter a valid credit score (300-850)',
    },
  },
  SCREENING: {
    BUSINESS_NAME: {
      MIN_LENGTH: 2,
      MESSAGE: 'Business name must be at least 2 characters',
    },
    CONTACT_NAME: {
      MIN_LENGTH: 2,
      MESSAGE: 'Contact name must be at least 2 characters',
    },
    CREDIT_SCORE: {
      MIN: 300,
      MAX: 850,
      MESSAGE: 'Please enter a valid credit score (300-850)',
    },
    MONTHLY_INCOME: {
      MIN: 0,
      MESSAGE: 'Please enter a valid monthly income requirement',
    },
  }
} as const;

export const FORM_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID: 'Please enter a valid value',
  MIN_LENGTH: (length: number) => `Must be at least ${length} characters`,
  MAX_LENGTH: (length: number) => `Must be at most ${length} characters`,
  PASSWORDS_MUST_MATCH: 'Passwords must match',
} as const;

export type ValidationRule = keyof typeof VALIDATION; 