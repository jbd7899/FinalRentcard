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
    DOCUMENTS: '/tenant/documents',
    REFERENCES: '/tenant/references',
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
    VERIFY_DOCUMENTS: '/landlord/verify-documents',
  },

  // Property routes
  PROPERTY: {
    ARCHIVED: '/property/archived',
  },

  // Screening routes
  SCREENING: {
    GENERAL: '/screening',
  },
} as const;

// Type for route parameters
export type RouteParams = {
  propertyId: string;
  applicationId: string;
  rentcardId: string;
  documentId: string;
  tenantId: string;
  referenceId: string;
};

// Helper function to generate dynamic routes
export const generateRoute = {
  property: (id: string | number) => `${ROUTES.LANDLORD.PROPERTIES}/${id}`,
  propertyEdit: (id: string | number) => `${ROUTES.LANDLORD.PROPERTIES}/${id}/edit`,
  application: (id: string | number) => `${ROUTES.TENANT.APPLICATIONS}/${id}`,
  rentcard: (id: string | number) => `${ROUTES.TENANT.RENTCARD}/${id}`,
  screening: (slug: string) => `${ROUTES.SCREENING.GENERAL}/${slug}`,
  generalScreening: (slug: string) => `${ROUTES.SCREENING.GENERAL}/${slug}`,
  archivedProperty: (slug: string) => `${ROUTES.PROPERTY.ARCHIVED}/${slug}`,
  document: (id: string | number) => `${ROUTES.TENANT.DOCUMENTS}/${id}`,
  verifyTenantDocuments: (tenantId: string | number) => `${ROUTES.LANDLORD.VERIFY_DOCUMENTS}/${tenantId}`,
  references: (tenantId: string | number) => `${ROUTES.TENANT.REFERENCES}/${tenantId}`,
  reference: (id: string | number) => `${ROUTES.TENANT.REFERENCES}/detail/${id}`,
};
