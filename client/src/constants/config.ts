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

  // Authentication settings
  AUTH: {
    TOKEN_KEY: 'auth_token',
    SESSION_COOKIE: 'sid',
    TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
    REFRESH_THRESHOLD: 60 * 60 * 1000, // 1 hour before expiry
    STORAGE_TYPE: 'localStorage' as 'localStorage' | 'sessionStorage',
  },

  // API Configuration
  API: {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    WITH_CREDENTIALS: true, // Required for session cookies
  },
} as const;
