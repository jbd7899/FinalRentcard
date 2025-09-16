# MyRentCard

## Overview

MyRentCard is a modern rental management platform that streamlines the rental application process by enabling tenants to create reusable rental profiles ("RentCards") that can be instantly shared with potential landlords. The application provides a comprehensive solution for both tenants and landlords with features including document verification, property listings, application tracking, messaging, and analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (September 2025)

### Major UX Improvements - "Super Easy to Use and Share"
- **Onboarding Checklist System**: Implemented comprehensive 4-step guided setup (Complete Profile, Add References, Preview RentCard, Share First Link) that reduces time-to-first-share to under 3 minutes
- **RentCard Editing Transformation**: Converted static demo data display into fully editable tenant profile with real-time form validation, data persistence, and mobile-responsive design
- **Seamless Workflow Integration**: Connected dashboard → onboarding checklist → editing pages → automatic progress tracking with real completion detection
- **Database Schema Enhancements**: Added onboarding_progress, onboarding_steps, and notifications tables with proper relationships and progress tracking
- **Production-Ready Implementation**: All components architect-approved with comprehensive error handling, data validation, and user feedback systems

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: TailwindCSS with shadcn/ui component library for consistent design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: 
  - Zustand for centralized UI state (modals, toasts, loading states)
  - TanStack Query (React Query) for server state management and caching
  - Custom stores for authentication and references management
- **Form Management**: React Hook Form with Zod validation for type-safe forms
- **Constants Management**: Centralized constant system with barrel exports for API endpoints, routes, validation rules, and common values

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with JWT tokens and Express sessions
- **File Storage**: Cloudinary for document and property image storage with automatic optimization
- **Email Service**: Nodemailer with environment-based configuration (Ethereal for development, production SMTP for live)
- **Password Security**: Scrypt with salt for password hashing

### Database Design
- **Core Tables**: Users, tenant profiles, landlord profiles, properties, applications
- **Enhanced Features**: Document storage, messaging system, property images/amenities, tenant references, notifications
- **Relationships**: Proper foreign key relationships with Drizzle relations for type-safe joins
- **Data Types**: JSON fields for complex data structures (employment info, rental history, screening criteria)

### Security Architecture
- **Authentication**: Multi-layer auth with Passport.js local strategy and JWT tokens
- **Session Management**: Express sessions with configurable storage (memory for dev, database for production)
- **Authorization**: Role-based access control with tenant/landlord specific endpoints
- **File Security**: Secure file uploads with type validation and size limits
- **Password Policy**: Minimum requirements with secure hashing

### Layout System
- **Hierarchical Layout**: BaseLayout component with role-specific extensions (LandlordLayout, TenantLayout)
- **Responsive Design**: Mobile-first approach with collapsible sidebars
- **Component Reusability**: Shared components across different user roles
- **Navigation**: Dynamic sidebar navigation based on user role

### Development Tools
- **Type Safety**: Full TypeScript coverage from frontend to database schema
- **Development Debugging**: Comprehensive auth debugging tools for development troubleshooting
- **Testing**: Playwright integration for end-to-end testing
- **Code Organization**: Feature-based folder structure with clear separation of concerns

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL (via Neon serverless) with Drizzle ORM for migrations and queries
- **File Storage**: Cloudinary for document storage, image optimization, and CDN delivery
- **Email Service**: Nodemailer with configurable SMTP providers
- **Authentication**: Passport.js ecosystem with local strategy support

### Development Tools
- **Build System**: Vite with React plugin for fast development and HMR
- **UI Components**: Radix UI primitives with shadcn/ui component system
- **Validation**: Zod for runtime type validation and form schema definitions
- **Icons**: Lucide React for consistent iconography

### Production Considerations
- **Deployment**: Express server with static file serving for production builds
- **Session Storage**: Configurable session store (memory for dev, database for production)
- **Environment Management**: Comprehensive environment variable configuration
- **Error Handling**: Centralized error handling with proper HTTP status codes