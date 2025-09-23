# MyRentCard

MyRentCard standardizes the rental prequalification process for private landlords and renters. Tenants build a reusable RentCard that summarises their qualifications and decide when to share it. Landlords receive consistent information before they invest time in tours or paperwork, keeping conversations focused on fit instead of forms.

## Features

- **Reusable RentCards** – tenants create one profile with income, employment, references, and documents they control.
- **Share anywhere** – send RentCard links or QR codes to landlords, even if they are not on MyRentCard.
- **Property interest pages** – landlords generate shareable pages or QR codes to collect tenant interest in a consistent format.
- **Document and reference management** – store supporting documents and track reference verification in one place.
- **Interest tracking dashboards** – both roles can review the status of shared RentCards and landlord responses.
- **Messaging-ready workflows** – keep context when following up so every conversation starts with clear expectations.

## Documentation

- [Development Guide](DEVELOPMENT.md) – setup and development workflow
- [Deployment Guide](DEPLOYMENT.md) – production deployment instructions
- [Contributing Guide](CONTRIBUTING.md) – how to contribute to the project
- [Authentication Debugging](DEVELOPMENT.md#authentication-debugging) – troubleshooting login issues

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example environment file and update values:
   ```bash
   cp .env.example .env
   ```
3. Seed development test accounts (optional but recommended for local testing):
   ```bash
   npm run db:push
   node server/seed-test-accounts.ts
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

The client is served at `http://localhost:5173` and the API at `http://localhost:3000` when using the default configuration.

### Authentication in development

- **Replit Auth** (production): configure `REPLIT_DOMAINS`, `REPL_ID`, and related secrets. All `/auth` flows redirect through Replit.
- **Test login** (development): set `ENABLE_DEV_LOGIN=true` in your server environment and `VITE_ENABLE_DEV_AUTH=true` in the client. The `/auth` page exposes a development login form that signs into seeded test accounts (`test-tenant@myrentcard.com` / `test123`, `test-landlord@myrentcard.com` / `test123`).

## Project Structure

```
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components and routes
│   │   ├── hooks/         # Custom React hooks
│   │   ├── stores/        # Zustand stores
│   │   ├── lib/           # Client utilities
│   │   └── providers/     # Context providers
├── server/                # Backend application
│   ├── routes.ts          # API route definitions
│   ├── replitAuth.ts      # Authentication setup
│   ├── services/          # Domain logic
│   └── storage.ts         # Database access layer
└── shared/                # Shared schema and messaging constants
    └── schema.ts          # Database schema definitions
```

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, shadcn/ui, Wouter, TanStack Query
- **Backend:** Node.js, Express, TypeScript, Drizzle ORM, Passport
- **Database:** PostgreSQL
- **File storage:** Cloudinary (configurable)

## Environment Variables

Key environment variables:

```
# Client
VITE_API_URL=http://localhost:3000
VITE_NODE_ENV=development
VITE_ENABLE_DEV_AUTH=true

# Server
DATABASE_URL=postgresql://user:password@localhost:5432/myrentcard
SESSION_SECRET=super-secret-string
ENABLE_DEV_LOGIN=true
REPLIT_DOMAINS=your-replit-domain (optional when using Replit Auth)
REPL_ID=your-replit-app-id (optional when using Replit Auth)
```

Set `ENABLE_DEV_LOGIN` and `VITE_ENABLE_DEV_AUTH` to `false` in production.

## Deployment

1. Build the client and server bundles:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

Refer to [DEPLOYMENT.md](DEPLOYMENT.md) for infrastructure-specific instructions.

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/my-change`).
3. Commit changes (`git commit -m 'Describe change'`).
4. Push to your fork and open a pull request.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## Database Overview

MyRentCard uses PostgreSQL with Drizzle ORM. Core tables include:

- `users` – authentication details and role flags
- `tenant_profiles` – renter-specific information and preferences
- `landlord_profiles` – property owner information and screening preferences
- `properties` – landlord property records and QR codes
- `interests` – tenant interest submissions tied to properties or general inquiries
- `rent_cards` – reusable tenant prequalification records
- `share_tokens` – secure sharing tokens and analytics

Supporting tables cover documents, references, notifications, and property metadata. See `shared/schema.ts` for the complete schema.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
