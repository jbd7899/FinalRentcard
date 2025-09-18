export * from './routes';
export * from './api';
export * from './config';
export * from './env';
export * from './common';
export * from './validation';
export * from './network-messaging';

// Example usage in components:
/*
import { 
  ROUTES, 
  API_ENDPOINTS, 
  CONFIG, 
  ENV, 
  USER_ROLES,
  VALIDATION,
  FORM_MESSAGES,
} from '@/constants';

// Using route constants
<Link href={ROUTES.LANDLORD.DASHBOARD}>Dashboard</Link>

// Using API endpoints
const fetchProperty = async (id: string) => {
  const response = await fetch(API_ENDPOINTS.PROPERTIES.BY_ID(id));
  return response.json();
};

// Using configuration
const pageSize = CONFIG.PAGINATION.DEFAULT_PAGE_SIZE;

// Using environment variables
if (ENV.IS_DEVELOPMENT) {
  console.log('Development mode');
}

// Using common constants
if (userRole === USER_ROLES.LANDLORD) {
  // Show landlord specific content
}

// Using validation constants
const schema = z.object({
  password: z.string()
    .min(VALIDATION.PASSWORD.MIN_LENGTH, VALIDATION.PASSWORD.MESSAGE)
    .regex(VALIDATION.PASSWORD.REGEX, VALIDATION.PASSWORD.REGEX_MESSAGE),
  email: z.string().email(VALIDATION.EMAIL.MESSAGE),
});
*/
