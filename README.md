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

## Documentation Maintenance
This README serves as a living document that is automatically updated with each significant change to the project. Key areas that are regularly reviewed and updated include:
- API endpoints when new routes are added or modified
- Authentication flows when security measures are updated
- File structure when new components or services are added
- Tech stack when new dependencies are introduced

## License
This project is proprietary and confidential.

---
Last updated: February 20, 2025