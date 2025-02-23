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