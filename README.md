# MyRentCard

## AI Maintenance Guide

This project is maintained **exclusively by AI**. Follow these instructions strictly when making updates to ensure code integrity, compatibility, and functionality.

## Project Overview

MyRentCard simplifies the rental application process by allowing tenants to create a reusable rental profile ("RentCard") that can be instantly shared with potential landlords. The AI is responsible for maintaining all aspects of the project, including updates, bug fixes, optimizations, and feature additions.

## Tech Stack

- **Frontend:** React, TailwindCSS, React Router
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Drizzle ORM)
- **Authentication:** JWT (LocalStorage for dev, Secure Cookies for prod)
- **Storage:** Cloudinary/AWS S3 (For image uploads)
- **Dev Environment:** Replit

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

## AI Guidelines for Code Maintenance

### **General Rules**
1. **Preserve Context Awareness**
   - Always reference this README before making modifications.
   - If modifying a function, check for dependencies in other files.
   - Ensure backward compatibility unless explicitly instructed to refactor.

2. **Incremental Updates Only**
   - Apply changes in **small, modular updates** instead of full rewrites.
   - Before modifying, list dependencies that may be affected.

3. **Ensure Code Compatibility**
   - Maintain **API compatibility** across all updates.
   - Preserve authentication flow and database schema.
   - Validate that UI components remain functional and responsive.

4. **Strict State Management**
   - Do not modify `useState`, `useContext`, or `Redux` logic without reviewing all affected components.
   - Ensure all API requests use the correct authentication headers.

5. **Pre-Update Check**
   - Before committing any code changes:
     - Identify potential breaking changes.
     - Verify dependency updates will not introduce incompatibilities.
     - Ensure all database modifications follow the existing schema structure.

6. **Post-Update Testing**
   - Run tests after every major change.
   - Ensure authentication, database operations, and frontend interactions remain functional.

## Authentication Handling

### Development Mode (Replit Issue Fix)
- Uses in-memory session storage for quick iteration.
- JWT tokens are stored in **LocalStorage** to persist sessions.
- Upon login, the token is **saved and automatically retrieved on reload**.
- API requests include the token in **Authorization headers**.
- If security is a concern, use `sessionStorage` instead of `localStorage`.
- Implement a **silent refresh mechanism** to renew expired tokens seamlessly.

### Production Mode
- PostgreSQL session storage using `connect-pg-simple`.
- Uses **HTTP-only, Secure cookies** for session management.
- Tokens have an **expiration mechanism** with a **refresh token flow**:
  - **Access token**: Short-lived (15-30 mins).
  - **Refresh token**: Stored securely in **HTTP-only cookies**, allowing re-authentication without requiring a login.
- Secure settings:
  - `Secure: true` (only sent over HTTPS).
  - `HttpOnly: true` (not accessible via JavaScript).
  - `SameSite=Strict` (prevents CSRF attacks).
- Store **refresh tokens in the database** for better security.

## API Endpoints

### Authentication
- `POST /api/auth/login` → User login
- `POST /api/auth/register` → User registration
- `POST /api/auth/logout` → User logout
- `GET /api/auth/me` → Get current user

### Tenant Routes
- `GET /api/tenant/dashboard` → Get tenant dashboard data
- `POST /api/tenant/rentcard` → Create new RentCard
- `GET /api/tenant/rentcard/:id` → Get specific RentCard
- `PATCH /api/tenant/rentcard/:id` → Update RentCard

### Landlord Routes
- `GET /api/landlord/dashboard` → Get landlord dashboard data
- `GET /api/landlord/applications` → List rental applications
- `POST /api/landlord/screening` → Create screening page
- `GET /api/landlord/screening/:id` → Get screening page
- `POST /api/landlord/reference-form` → Submit reference form

## AI Workflow in Replit

### **How to Apply Safe Code Updates**
1. **Reference this README before making any modifications.**
2. **Modify only the necessary files.**
3. **Use modular updates to prevent unintended side effects.**
4. **Before updating code, list all dependencies affected.**
5. **Ensure UI/Backend/API remain fully functional post-update.**
6. **Run tests and verify correct operation after modifications.**

## Database Management
- Schema changes are managed through Drizzle ORM.
- Run migrations: `npm run db:push`.
- Generate migration files: `npm run db:generate`.

## AI Contribution Workflow
1. Identify the requested update or fix.
2. Check affected files and dependencies.
3. Generate modular code updates.
4. Test before deployment.
5. Commit updates with detailed changelog.

## License
This project is proprietary and confidential.

---
**Last updated:** February 20, 2025