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
    ADD_PROPERTY: '/landlord/add-property',
    EDIT_PROPERTY: '/landlord/properties/edit',
    SCREENING: '/landlord/screening',
    REFERENCE_FORM: '/landlord/reference-form',
    APPLICATIONS: '/landlord/applications',
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
  property: (id: string | number) => `${ROUTES.LANDLORD.PROPERTIES}/${id}`,
  propertyEdit: (id: string | number) => `${ROUTES.LANDLORD.PROPERTIES}/${id}/edit`,
  application: (id: string | number) => `${ROUTES.TENANT.APPLICATIONS}/${id}`,
  rentcard: (id: string | number) => `${ROUTES.TENANT.RENTCARD}/${id}`,
  screening: (slug: string) => `${ROUTES.LANDLORD.SCREENING}/${slug}`,
};
