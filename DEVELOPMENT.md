# Development Guide

## Constants Management

The project uses a centralized constants management system in the `src/constants` directory. All constants are exported through a barrel export in `index.ts` for consistent importing.

### Constants Structure

1. **API Constants** (`api.ts`)
```typescript
// API endpoint definitions with type safety
API_ENDPOINTS.AUTH.LOGIN // '/api/auth/login'
API_ENDPOINTS.PROPERTIES.BY_ID(id) // Dynamic endpoint generation

// Stats endpoints for analytics
API_ENDPOINTS.STATS.VIEWS // '/api/stats/views'
API_ENDPOINTS.STATS.SUBMISSIONS // '/api/stats/submissions'

// HTTP Methods and API Status
HTTP_METHODS.GET
API_STATUS.SUCCESS
```

2. **Common Constants** (`common.ts`)
```typescript
// Application Status
APPLICATION_STATUS.NEW
APPLICATION_STATUS.REVIEWING
APPLICATION_STATUS.APPROVED
APPLICATION_STATUS.REJECTED
APPLICATION_STATUS.CANCELLED
APPLICATION_STATUS.ARCHIVED

// Status Labels
APPLICATION_LABELS.STATUS[APPLICATION_STATUS.NEW] // 'New'
APPLICATION_LABELS.STATUS[APPLICATION_STATUS.REVIEWING] // 'Under Review'

// Payment History Labels
APPLICATION_LABELS.PAYMENT_HISTORY.ON_TIME // 'Always on time'
APPLICATION_LABELS.PAYMENT_HISTORY.MOSTLY_ON_TIME // 'Usually on time'

// Property Condition Labels
APPLICATION_LABELS.PROPERTY_CONDITION.EXCELLENT // 'Excellent'
APPLICATION_LABELS.PROPERTY_CONDITION.GOOD // 'Good'

// Standardized messages
MESSAGES.ERRORS.GENERAL // 'Something went wrong. Please try again.'
MESSAGES.SUCCESS.SAVED // 'Changes saved successfully.'
MESSAGES.SUCCESS.COPIED // 'Link copied to clipboard!'

// Toast Messages
MESSAGES.TOAST.RENTCARD.CREATE_SUCCESS.TITLE // 'RentCard Created'
MESSAGES.TOAST.APPLICATION.STATUS_UPDATED.TITLE // 'Application Updated'
```

3. **Configuration** (`config.ts`)
```typescript
// Application settings
CONFIG.APP.NAME
CONFIG.PAGINATION.DEFAULT_PAGE_SIZE
CONFIG.VALIDATION.MIN_PASSWORD_LENGTH
```

4. **Environment Variables** (`env.ts`)
```typescript
// Environment configuration with validation
ENV.API_URL
ENV.IS_PRODUCTION
ENV.FEATURES.ENABLE_ANALYTICS
```

5. **Routes** (`routes.ts`)
```typescript
// Route definitions with helper functions
ROUTES.TENANT.DASHBOARD
generateRoute.property(id)
```

### Usage Guidelines

1. **Importing Constants**
```typescript
// Preferred: Use barrel imports
import { ROUTES, API_ENDPOINTS, CONFIG } from '@/constants';

// Avoid: Don't import from individual files
// import { ROUTES } from '@/constants/routes';
```

2. **Type Safety**
- All constants use TypeScript's `as const` assertion
- Utilize provided type exports (UserRole, ApplicationStatus, etc.)
- Use helper functions for dynamic values

3. **Environment Variables**
- Always use ENV constant instead of process.env
- Add new variables to validateEnv() function
- Prefix all variables with VITE_

4. **Messages and Strings**
- Use MESSAGES constant for standard responses
- Maintain consistency in error messages
- Support future i18n integration

5. **Route Management**
- Use generateRoute helpers for dynamic routes
- Reference ROUTES constant for all navigation
- Maintain route parameter types

## Authentication System

The application uses a modern authentication system built with Zustand for state management and React Query for data fetching and caching.

### Authentication Store (Zustand)

```typescript
const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,

        setUser: (user) => {
          queryClient.setQueryData(["/api/user"], user);
          set({ 
            user,
            isAuthenticated: !!user,
            error: null 
          });
        },

        setToken: (token) => {
          if (token) {
            localStorage.setItem('token', token);
            queryClient.setQueryData(["token"], token);
          } else {
            localStorage.removeItem('token');
            queryClient.setQueryData(["token"], null);
          }
          set({ token });
        },

        login: async (credentials) => {
          const { setToken, setUser, setLoading, setError } = get();
          try {
            setLoading(true);
            const response = await fetch('/api/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(credentials)
            });
            if (!response.ok) throw new Error('Invalid credentials');
            const { token, user } = await response.json();
            setToken(token);
            setUser(user);
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Authentication failed');
            throw error;
          } finally {
            setLoading(false);
          }
        },

        logout: async () => {
          const { setToken, setUser } = get();
          setToken(null);
          setUser(null);
        }
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ token: state.token })
      }
    )
  )
);
```

### Security Features

1. **Token Management**
   - Secure token storage in localStorage
   - Automatic token injection in API requests
   - Token invalidation on logout
   - Query cache invalidation on auth state changes

2. **State Management**
   - Centralized auth state with Zustand
   - Persistent auth state with zustand-persist
   - Type-safe auth actions and state
   - Dev tools integration for debugging

3. **Data Fetching**
   - Efficient data fetching with React Query
   - Automatic cache invalidation
   - Error handling and retries
   - Loading states management

4. **Route Protection**
```typescript
export function ProtectedRoute({ component: Component, path }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuthStore();

  return (
    <Route
      path={path}
      component={() => {
        if (isLoading) return <LoadingSpinner />;
        if (!isAuthenticated) {
          setLocation(ROUTES.AUTH);
          return null;
        }
        return <Component />;
      }}
    />
  );
}
```

## UI State Management

The application uses Zustand for centralized UI state management. See the UI Store implementation and usage guidelines in the [UI State Management Guide](UI_STATE.md).

## API Endpoints

### Authentication
- POST /api/auth/login → User login
- POST /api/auth/register → User registration
- POST /api/auth/logout → User logout
- GET /api/auth/me → Get current user

### Tenant Routes
- GET /api/tenant/dashboard → Get tenant dashboard data
- POST /api/tenant/rentcard → Create new RentCard
- GET /api/tenant/rentcard/:id → Get specific RentCard
- PATCH /api/tenant/rentcard/:id → Update RentCard
- GET /api/tenant/rentcard/:id/share → Get shareable RentCard link
- POST /api/tenant/rentcard/:id/pdf → Generate RentCard PDF

### Landlord Routes
- GET /api/landlord/dashboard → Get landlord dashboard data
- GET /api/landlord/applications → List rental applications
- PATCH /api/landlord/applications/:id/status → Update application status
- GET /api/landlord/applications/stats → Get application statistics
- POST /api/landlord/screening → Create screening page
- GET /api/landlord/screening/:id → Get screening page
- POST /api/landlord/reference-form → Submit reference form
- GET /api/properties → Get all properties
- GET /api/properties/screening/:slug → Get property details

## Application Management

The application management system follows a specific status flow:

1. **Status Flow**
```
NEW → REVIEWING → APPROVED/REJECTED
         ↓
    CANCELLED/ARCHIVED
```

2. **Status Definitions**
- NEW: Initial application submission
- REVIEWING: Under landlord review
- APPROVED: Application accepted
- REJECTED: Application declined
- CANCELLED: Application withdrawn
- ARCHIVED: Application stored for record-keeping

3. **Application Data Structure**
```typescript
interface Application {
  id: number;
  tenant: {
    name: string;
    email: string;
    phone: string;
    creditScore: string;
    income: string;
    score: number;
    references: Array<{
      name: string;
      property: string;
      dates: string;
      rating: number;
      payment: PaymentHistory;
      propertyCondition: PropertyCondition;
      comments: string;
      verified: boolean;
    }>;
    employment: string;
    moveIn: string;
  };
  property: string;
  status: ApplicationStatus;
  submittedAt: string;
  matchScore: number;
}
```

## Database Management

- Schema changes are managed through Drizzle ORM
- Run migrations: `npm run db:push`
- Generate migration files: `npm run db:generate`

## Testing Guidelines

1. **Unit Tests**
   - Test individual components and functions
   - Mock external dependencies
   - Use Jest and React Testing Library

2. **Integration Tests**
   - Test component interactions
   - Test API integrations
   - Use MSW for API mocking

3. **E2E Tests**
   - Test complete user flows
   - Use Cypress or Playwright
   - Test in production-like environment

## Code Style Guide

1. **TypeScript**
   - Use strict mode
   - Define interfaces for all data structures
   - Use proper type imports/exports

2. **React**
   - Use functional components
   - Implement proper error boundaries
   - Follow React best practices

3. **State Management**
   - Use appropriate state solutions
   - Implement proper caching
   - Follow immutability principles

## Validation System

The project uses a centralized validation system with Zod schemas and custom validation messages.

### Schema Examples

```typescript
// RentCard Schema
insertRentCardSchema.firstName // String, min length validation
insertRentCardSchema.creditScore // Number conversion with range validation
insertRentCardSchema.monthlyIncome // Number with minimum validation

// Screening Page Schema
insertScreeningPageSchema.businessName // String with min length
insertScreeningPageSchema.screeningCriteria // Nested object with defaults
```

### Form Integration

```typescript
const form = useForm<InsertRentCard>({
  resolver: zodResolver(insertRentCardSchema),
  defaultValues: {
    firstName: '',
    creditScore: '0',
    monthlyIncome: '0'
  }
});
```

## Authentication Debugging

The application includes several tools to help debug authentication issues during development.

### Common Authentication Issues

1. **401 Unauthorized errors**: These occur when the authentication token is missing, invalid, or expired.
2. **403 Forbidden errors**: These occur when the user is authenticated but doesn't have permission for the requested resource.
3. **Authentication state inconsistencies**: These occur when the client-side authentication state doesn't match the server-side state.

### Debugging Tools

We've implemented several debugging tools to help diagnose and fix authentication issues:

#### 1. Debug Auth Page

A dedicated debugging page is available at `/debug-auth` that provides tools for inspecting and testing authentication.

Features:
- View current authentication status
- Inspect token and user information
- Test API endpoints with the current authentication
- Reset authentication token
- Reinitialize authentication state

#### 2. Authentication Token Debugging

The `debugAuthToken()` function in `client/src/lib/queryClient.ts` provides detailed information about the JWT token:

```typescript
import { debugAuthToken } from '@/lib/queryClient';

// Call this function to log token details to the console
debugAuthToken();
```

This function logs:
- Whether a token exists
- Token length and prefix/suffix
- Decoded payload information (user ID, expiration, etc.)
- Whether the token is expired

#### 3. Enhanced Error Logging

The API request function has been enhanced with detailed logging for authentication errors:

```typescript
// In client/src/lib/queryClient.ts
if (res.status === 401) {
  console.error('Authentication error details:', {
    hasToken: !!headers.Authorization,
    tokenPrefix: headers.Authorization ? headers.Authorization.substring(0, 15) + '...' : 'none',
    endpoint: url
  });
}
```

#### 4. Example Component

An example component demonstrating how to use the authentication debugging tools is available at `client/src/examples/AuthDebugExample.tsx`:

```typescript
import { debugAuthToken } from '@/lib/queryClient';

// Inside your component
const handleDebugToken = () => {
  const tokenInfo = debugAuthToken();
  console.log('Token exists:', tokenInfo.hasToken);
};
```

You can include this component in any page during development to quickly debug authentication issues.

### Troubleshooting Steps

#### For 401 Unauthorized Errors:

1. **Check if the token exists**:
   - Open the debug page at `/debug-auth`
   - Click "Debug Token" to see if a token exists in localStorage

2. **Check if the token is valid and not expired**:
   - The debug token function will show expiration information
   - If expired, you'll need to log in again

3. **Test specific endpoints**:
   - Use the endpoint testing tool on the debug page
   - Try `/api/user` first to verify basic authentication
   - Then test the specific endpoint that's failing

4. **Check for mock implementations**:
   - For development mode, ensure there's a mock implementation for the endpoint
   - Check `client/src/lib/queryClient.ts` for mock implementations

#### For Authentication State Issues:

1. **Reinitialize authentication**:
   - Click "Reinitialize Auth" on the debug page
   - This will attempt to validate the token and update the auth state

2. **Reset authentication if needed**:
   - Click "Reset Token" to clear the token from localStorage
   - Log in again to get a fresh token

### Mock Implementation for Development

In development mode, many API endpoints are mocked to work without a backend. When adding new endpoints, make sure to add mock implementations for them in `client/src/lib/queryClient.ts`.

Example of a mock implementation for a PATCH endpoint:

```typescript
// Mock property PATCH (update) endpoint
if (url.match(/^\/api\/properties\/\d+$/) && method === 'PATCH') {
  console.log('MOCK: Intercepting property PATCH request', data);
  
  // Extract the ID from the URL
  const id = parseInt(url.split('/api/properties/')[1]);
  
  // Get properties from mock storage
  const properties = getMockProperties();
  
  // Find the index of the property with the matching ID
  const propertyIndex = properties.findIndex((p: any) => p.id === id);
  
  if (propertyIndex === -1) {
    console.error('MOCK: Property not found with ID:', id);
    return new Response(JSON.stringify({ message: "Property not found" }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Update the property with the new data
  const updatedProperty = {
    ...properties[propertyIndex],
    ...(data as object),
    updatedAt: new Date().toISOString()
  };
  
  // Save the updated property
  properties[propertyIndex] = updatedProperty;
  saveMockProperties(properties);
  
  console.log('MOCK: Successfully updated property:', updatedProperty);
  
  // Return a mock successful response
  return new Response(JSON.stringify(updatedProperty), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### Best Practices

1. **Always check authentication in the browser console**:
   - Look for "Using authentication token from localStorage" messages
   - Check for any 401 errors and their details

2. **Use the debug page for systematic testing**:
   - Test authentication with `/api/user` endpoint
   - Test specific endpoints that are failing
   - Check token validity and expiration

3. **Keep mock implementations up to date**:
   - When adding new API endpoints, add corresponding mock implementations
   - Ensure mock implementations handle authentication correctly

4. **Check user roles and permissions**:
   - Some endpoints require specific user types (e.g., landlord)
   - Verify the user has the correct role for the operation

> Note: The content from the separate Authentication Debugging Guide has been merged into this section for easier reference. 