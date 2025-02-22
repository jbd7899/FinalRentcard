/**
 * API endpoints and related constants
 */

const API_BASE = '/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE}/auth/login`,
    REGISTER: `${API_BASE}/auth/register`,
    LOGOUT: `${API_BASE}/auth/logout`,
    USER: `${API_BASE}/user`,
  },

  // Property endpoints
  PROPERTIES: {
    BASE: `${API_BASE}/properties`,
    BY_ID: (id: string) => `${API_BASE}/properties/${id}`,
    SEARCH: `${API_BASE}/properties/search`,
  },

  // Application endpoints
  APPLICATIONS: {
    BASE: `${API_BASE}/applications`,
    BY_ID: (id: string) => `${API_BASE}/applications/${id}`,
    STATUS: (id: string) => `${API_BASE}/applications/${id}/status`,
    CREATE: `${API_BASE}/applications`,
  },

  // Rentcard endpoints
  RENTCARDS: {
    BASE: `${API_BASE}/rentcards`,
    BY_ID: (id: string) => `${API_BASE}/rentcards/${id}`,
    GENERATE: `${API_BASE}/rentcards/generate`,
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