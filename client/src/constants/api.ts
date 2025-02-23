/**
 * API endpoints and related constants
 */

const API_BASE = '/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },

  // Stats endpoints
  STATS: {
    BASE: '/api/stats',
    VIEWS: '/api/stats/views',
    SUBMISSIONS: '/api/stats/submissions',
  },

  // Property endpoints
  PROPERTIES: {
    BASE: '/api/properties',
    CREATE: '/api/landlord/properties',
    BY_ID: (id: string | number) => `/api/properties/${id}`,
    UPDATE: (id: string | number) => `/api/properties/${id}`,
    DELETE: (id: string | number) => `/api/properties/${id}`,
    SCREENING: {
      BY_SLUG: (slug: string) => `/api/properties/screening/${slug}`,
      CREATE: '/api/landlord/screening',
      UPDATE: (id: string | number) => `/api/landlord/screening/${id}`,
    },
  },

  // Application endpoints
  APPLICATIONS: {
    BASE: '/api/applications',
    CREATE: '/api/applications',
    BY_ID: (id: string | number) => `/api/applications/${id}`,
    UPDATE_STATUS: (id: string | number) => `/api/landlord/applications/${id}/status`,
    STATS: '/api/landlord/applications/stats',
  },

  // Rentcard endpoints
  RENTCARD: {
    BASE: '/api/tenant/rentcard',
    BY_ID: (id: string | number) => `/api/tenant/rentcard/${id}`,
    SHARE: (id: string | number) => `/api/tenant/rentcard/${id}/share`,
    PDF: (id: string | number) => `/api/tenant/rentcard/${id}/pdf`,
  },

  // RentCards endpoints (for multiple rentcards)
  RENTCARDS: {
    BASE: '/api/tenant/rentcards',
    USER: '/api/tenant/rentcard', // Endpoint to get user's rentcard
  },

  // Reference endpoints
  REFERENCE: {
    CREATE: '/api/landlord/reference-form',
  },
} as const;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

// Common API response status
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  PENDING: 'pending',
} as const;