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
    IMAGES: {
      LIST: (propertyId: string | number) => `/api/properties/${propertyId}/images`,
      UPLOAD: (propertyId: string | number) => `/api/properties/${propertyId}/images`,
      DELETE: (imageId: string | number) => `/api/properties/images/${imageId}`,
      SET_PRIMARY: (imageId: string | number) => `/api/properties/images/${imageId}/primary`,
    },
    AMENITIES: {
      LIST: (propertyId: string | number) => `/api/properties/${propertyId}/amenities`,
      CREATE: (propertyId: string | number) => `/api/properties/${propertyId}/amenities`,
      DELETE: (amenityId: string | number) => `/api/properties/amenities/${amenityId}`,
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

  // Document endpoints
  DOCUMENTS: {
    BASE: '/api/documents',
    UPLOAD: '/api/documents/upload',
    BY_ID: (id: string | number) => `/api/documents/${id}`,
    DELETE: (id: string | number) => `/api/documents/${id}`,
    VERIFY: (id: string | number) => `/api/documents/${id}/verify`,
    BY_TENANT: (tenantId: string | number) => `/api/documents/tenant/${tenantId}`,
    STATS: '/api/landlord/documents/stats',
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

  // Tenant References endpoints
  TENANT_REFERENCES: {
    BASE: '/api/tenant/references',
    LIST: (tenantId: string | number) => `/api/tenant/references/${tenantId}`,
    CREATE: '/api/tenant/references',
    BY_ID: (id: string | number) => `/api/tenant/references/${id}`,
    UPDATE: (id: string | number) => `/api/tenant/references/${id}`,
    DELETE: (id: string | number) => `/api/tenant/references/${id}`,
    VERIFY: (id: string | number) => `/api/tenant/references/${id}/verify`,
    SEND_VERIFICATION: (id: string | number) => `/api/tenant/references/${id}/send-verification`,
    LANDLORD_VIEW: (tenantId: string | number) => `/api/landlord/tenant/${tenantId}/references`,
    VERIFICATION: {
      VALIDATE: (token: string) => `/api/tenant/references/verify/validate/${token}`,
      SUBMIT: (token: string) => `/api/tenant/references/verify/${token}`,
    },
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