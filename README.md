# MyRentCard

## AI Maintenance Guide

This project is maintained exclusively by AI. Follow these instructions strictly when making updates to ensure code integrity, compatibility, and functionality.

## Project Overview

MyRentCard simplifies the rental application process by allowing tenants to create a reusable rental profile ("RentCard") that can be instantly shared with potential landlords. The AI is responsible for maintaining all aspects of the project, including updates, bug fixes, optimizations, and feature additions. This includes tracking property view counts.

## Tech Stack

- Frontend: React, TailwindCSS, React Router
- Backend: Node.js, Express.js
- Database: PostgreSQL (Drizzle ORM)
- Authentication: JWT (LocalStorage for dev, Secure Cookies for prod)
- Storage: Cloudinary/AWS S3 (For image uploads)
- Dev Environment: Replit

## File Structure

```
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── constants/     # Application constants
│   │   │   ├── index.ts   # Barrel exports for constants
│   │   │   ├── api.ts     # API endpoints and methods
│   │   │   ├── common.ts  # Common enums and messages
│   │   │   ├── config.ts  # App configuration
│   │   │   ├── env.ts     # Environment variables
│   │   │   └── routes.ts  # Route definitions
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # Main application
├── server/                 # Backend application
│   ├── auth.ts            # Authentication logic
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database operations
│   └── index.ts           # Server entry point
└── shared/                # Shared types and schemas
    └── schema.ts          # Database and validation schemas
```

## Constants Management

The project uses a centralized constants management system in the `src/constants` directory. All constants are exported through a barrel export in `index.ts` for consistent importing.

### Constants Structure

1. **API Constants** (`api.ts`)
```typescript
// API endpoint definitions with type safety
API_ENDPOINTS.AUTH.LOGIN // '/api/auth/login'
API_ENDPOINTS.PROPERTIES.BY_ID(id) // Dynamic endpoint generation

// HTTP Methods and API Status
HTTP_METHODS.GET
API_STATUS.SUCCESS
```

2. **Common Constants** (`common.ts`)
```typescript
// Type-safe enums with TypeScript
USER_ROLES.TENANT
APPLICATION_STATUS.PENDING
PROPERTY_TYPES.APARTMENT

// Standardized messages
MESSAGES.ERRORS.GENERAL
MESSAGES.SUCCESS.SAVED
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

### Maintenance Guidelines

1. **Adding New Constants**
- Add to appropriate file based on category
- Include TypeScript types/interfaces
- Update barrel export in index.ts
- Add usage example in comments

2. **Modifying Existing Constants**
- Maintain backward compatibility
- Update related TypeScript types
- Document changes in comments
- Test all components using modified constants

3. **Best Practices**
- Keep constants immutable using `as const`
- Group related constants logically
- Provide helper functions for complex operations
- Maintain comprehensive typing

4. **Documentation**
- Comment complex constants
- Include usage examples
- Document breaking changes
- Keep README updated with new additions

## Authentication Handling

### Development Mode (Replit Issue Fix)

- Uses in-memory session storage for quick iteration
- JWT tokens are stored in LocalStorage to persist sessions
- Upon login, the token is saved and automatically retrieved on reload
- API requests include the token in Authorization headers
- If security is a concern, use sessionStorage instead of localStorage
- Implement a silent refresh mechanism to renew expired tokens seamlessly

### Production Mode

- PostgreSQL session storage using connect-pg-simple
- Uses HTTP-only, Secure cookies for session management
- Tokens have an expiration mechanism with a refresh token flow:
  - Access token: Short-lived (15-30 mins)
  - Refresh token: Stored securely in HTTP-only cookies
- Secure settings:
  - Secure: true (only sent over HTTPS)
  - HttpOnly: true (not accessible via JavaScript)
  - SameSite=Strict (prevents CSRF attacks)
- Store refresh tokens in the database for better security

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

### Landlord Routes
- GET /api/landlord/dashboard → Get landlord dashboard data
- GET /api/landlord/applications → List rental applications
- POST /api/landlord/screening → Create screening page
- GET /api/landlord/screening/:id → Get screening page
- GET /api/properties → Get all properties
- GET /api/properties/screening/:slug → Get property details
- POST /api/landlord/reference-form → Submit reference form

## Property Requirements Format

Properties can define screening requirements that are displayed to potential tenants. Each requirement includes:

- icon: Name of the Lucide icon to display (e.g., "DollarSign", "Shield", "CheckCircle")
- description: Text description of the requirement

Example:
```json
{
  "requirements": [
    {
      "icon": "DollarSign",
      "description": "Minimum monthly income of $7,500"
    },
    {
      "icon": "Shield",
      "description": "Credit score above 650"
    }
  ]
}
```

## AI Workflow in Replit

### How to Apply Safe Code Updates

1. Reference this README before making any modifications
2. Modify only the necessary files
3. Use modular updates to prevent unintended side effects
4. Before updating code, list all dependencies affected
5. Ensure UI/Backend/API remain fully functional post-update
6. Run tests and verify correct operation after modifications

### Database Management

- Schema changes are managed through Drizzle ORM
- Run migrations: npm run db:push
- Generate migration files: npm run db:generate

### AI Contribution Workflow

1. Identify the requested update or fix
2. Check affected files and dependencies
3. Generate modular code updates
4. Test before deployment
5. Commit updates with detailed changelog