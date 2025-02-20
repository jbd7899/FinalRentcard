# MyRentCard - Rental Management Platform

## Project Overview
MyRentCard is a comprehensive rental management platform that streamlines the connection between tenants and landlords. The application provides a modern, secure web interface for property screening, application management, and communication between parties.

### Key Features
- Role-based authentication (Tenant/Landlord)
- Property screening and application management
- RentCard creation and management
- Landlord reference forms
- Interactive dashboards for both tenants and landlords
- Real-time application status tracking

## Tech Stack

### Frontend
- React 18+ with Vite for build tooling
- TanStack React Query for server state management
- Wouter for client-side routing
- Tailwind CSS with shadcn/ui components for styling
- React Hook Form with Zod for form validation

### Backend
- Express.js server
- PostgreSQL database with Drizzle ORM
- JWT-based authentication
- Session management with express-session
- Passport.js for authentication strategies

### Development Tools
- TypeScript for type safety
- Drizzle Kit for database migrations
- Zod for runtime type validation
- ESLint and Prettier for code formatting

## File Structure
```
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions and configurations
│   │   ├── pages/        # Page components and routes
│   │   └── App.tsx       # Main application component
├── server/                # Backend application
│   ├── auth.ts           # Authentication logic
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database operations
│   └── index.ts          # Server entry point
└── shared/               # Shared types and schemas
    └── schema.ts         # Database and validation schemas
```

## Authentication Handling

### Development Mode
- Uses in-memory session storage
- JWT tokens for API authentication
- Local authentication strategy with email/password
- Session cookies for maintaining user state

### Production Mode
- PostgreSQL session storage using connect-pg-simple
- Secure cookie settings with HTTP-only flags
- JWT tokens with appropriate expiration
- Rate limiting on authentication endpoints

## API Endpoints

### Authentication
```
POST /api/auth/login       # User login
POST /api/auth/register    # User registration
POST /api/auth/logout      # User logout
GET  /api/auth/me         # Get current user
```

### Tenant Routes
```
GET    /api/tenant/dashboard      # Get tenant dashboard data
POST   /api/tenant/rentcard       # Create new RentCard
GET    /api/tenant/rentcard/:id   # Get specific RentCard
PATCH  /api/tenant/rentcard/:id   # Update RentCard
```

### Landlord Routes
```
GET    /api/landlord/dashboard           # Get landlord dashboard data
GET    /api/landlord/applications        # List rental applications
POST   /api/landlord/screening           # Create screening page
GET    /api/landlord/screening/:id       # Get screening page
POST   /api/landlord/reference-form      # Submit reference form
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Start development server: `npm run dev`
5. Access the application at `http://localhost:3000`

## Database Management
- Schema changes are managed through Drizzle ORM
- Run migrations: `npm run db:push`
- Generate migration files: `npm run db:generate`

## Contributing
1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License
This project is proprietary and confidential.

---
Last updated: February 20, 2025
```
