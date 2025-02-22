/**
 * Application configuration constants
 */

export const CONFIG = {
  // Application settings
  APP: {
    NAME: 'MyRentCard',
    VERSION: '1.0.0',
    DESCRIPTION: 'Rental Management Platform',
  },

  // Pagination settings
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50,
  },

  // Form validation
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  },

  // Toast notification duration
  TOAST: {
    DEFAULT_DURATION: 3000,
    ERROR_DURATION: 5000,
  },
} as const;
