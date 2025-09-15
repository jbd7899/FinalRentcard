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
    INTERESTS: '/tenant/interests',
    APPLICATIONS: '/tenant/applications',
    RENTCARD: '/tenant/rentcard',
    DOCUMENTS: '/tenant/documents',
    REFERENCES: '/tenant/references',
    CONTACT_PREFERENCES: '/tenant/contact-preferences',
    CONTACTS: '/tenant/contacts',
    MESSAGE_TEMPLATES: '/tenant/message-templates',
  },
  
  // Landlord routes
  LANDLORD: {
    DASHBOARD: '/landlord/dashboard',
    PROPERTIES: '/landlord/properties',
    ADD_PROPERTY: '/landlord/add-property',
    EDIT_PROPERTY: '/landlord/properties/edit',
    SCREENING: '/landlord/screening',
    REFERENCE_FORM: '/landlord/reference-form',
    INTERESTS: '/landlord/interests',
    APPLICATIONS: '/landlord/applications',
    VERIFY_DOCUMENTS: '/landlord/verify-documents',
    CONTACT_MANAGEMENT: '/landlord/contact-management',
  },

  // Property routes
  PROPERTY: {
    ARCHIVED: '/property/archived',
  },

  // Screening routes
  SCREENING: {
    GENERAL: '/screening',
    PROPERTY: '/screening/property',
    EDIT_GENERAL: '/screening/general',
    EDIT_PROPERTY: '/screening/property',
  },
} as const;

// Type for route parameters
export type RouteParams = {
  propertyId: string;
  interestId: string;
  rentcardId: string;
  documentId: string;
  tenantId: string;
  referenceId: string;
};

// Helper function to generate dynamic routes
export const generateRoute = {
  property: (id: string | number) => `${ROUTES.LANDLORD.PROPERTIES}/${id}`,
  propertyEdit: (id: string | number) => `${ROUTES.LANDLORD.PROPERTIES}/${id}/edit`,
  interest: (id: string | number) => `${ROUTES.TENANT.INTERESTS}/${id}`,
  rentcard: (id: string | number) => `${ROUTES.TENANT.RENTCARD}/${id}`,
  screening: (slug: string) => `${ROUTES.SCREENING.PROPERTY}/${slug}`,
  generalScreening: (slug: string) => `${ROUTES.SCREENING.GENERAL}/${slug}`,
  propertyScreening: (slug: string) => `${ROUTES.SCREENING.PROPERTY}/${slug}`,
  editGeneralScreening: (slug: string) => `${ROUTES.SCREENING.EDIT_GENERAL}/${slug}/edit`,
  editPropertyScreening: (slug: string) => `${ROUTES.SCREENING.EDIT_PROPERTY}/${slug}/edit`,
  archivedProperty: (slug: string) => `${ROUTES.PROPERTY.ARCHIVED}/${slug}`,
  document: (id: string | number) => `${ROUTES.TENANT.DOCUMENTS}/${id}`,
  verifyTenantDocuments: (tenantId: string | number) => `${ROUTES.LANDLORD.VERIFY_DOCUMENTS}/${tenantId}`,
  references: (tenantId: string | number) => `${ROUTES.TENANT.REFERENCES}/${tenantId}`,
  reference: (id: string | number) => `${ROUTES.TENANT.REFERENCES}/detail/${id}`,
};
