/**
 * Application route paths
 */

export const ROUTES = {
  // Auth routes
  AUTH: '/auth',
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Home
  HOME: '/',
  
  // Tenant routes
  TENANT: {
    DASHBOARD: '/tenant/dashboard',
    APPLICATIONS: '/tenant/applications',
    RENTCARD: '/tenant/rentcard',
  },
  
  // Landlord routes
  LANDLORD: {
    DASHBOARD: '/landlord/dashboard',
    PROPERTIES: '/landlord/properties',
    ADD_PROPERTY: '/landlord/properties/add',
    SCREENING: '/landlord/screening',
    REFERENCE_FORM: '/landlord/reference-form',
  },
} as const;

// Type for route parameters
export type RouteParams = {
  propertyId: string;
  applicationId: string;
  rentcardId: string;
};

// Helper function to generate dynamic routes
export const generateRoute = {
  property: (id: string) => `${ROUTES.LANDLORD.PROPERTIES}/${id}`,
  application: (id: string) => `${ROUTES.TENANT.APPLICATIONS}/${id}`,
  rentcard: (id: string) => `${ROUTES.TENANT.RENTCARD}/${id}`,
};
