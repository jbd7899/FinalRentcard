# MyRentCard

MyRentCard simplifies the rental application process by allowing tenants to create a reusable rental profile ("RentCard") that can be instantly shared with potential landlords. Track property views, pre-screen qualified tenants, and streamline the tenant qualification process.

## Features

- Create and manage reusable rental profiles
- Instant profile sharing with potential landlords
- Property view tracking and analytics
- Secure document storage and verification
  - Upload various document types (ID, payslips, references, etc.)
  - Landlord verification of tenant documents
  - Document status tracking and management
  - Secure document preview and storage
- Real-time application status updates
- Automated reference checks
- Messaging system between tenants and landlords
- Comprehensive property listings with images and amenities
- Roommate/co-applicant support for group applications
- Notification system for important updates
- Detailed analytics and reporting

## Documentation

- [Development Guide](DEVELOPMENT.md) - Setup and development workflow
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions
- [Contributing Guide](CONTRIBUTING.md) - How to contribute to the project
- [Authentication Debugging Guide](DEVELOPMENT.md#authentication-debugging) - Troubleshooting authentication issues

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Create .env file in root directory
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Project Structure

```
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── constants/     # Application constants
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Page components
│   │   ├── providers/    # Context providers
│   │   ├── shared/       # Shared interfaces and types
│   │   ├── stores/       # State management stores
│   │   └── App.tsx       # Main application
├── server/                # Backend application
│   ├── auth.ts           # Authentication logic
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database operations
│   └── index.ts          # Server entry point
└── shared/               # Shared types and schemas
    └── schema.ts         # Database and validation schemas
```

## Tech Stack

- **Frontend:** React, TailwindCSS, React Router
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Drizzle ORM)
- **Authentication:** JWT (LocalStorage for dev, Secure Cookies for prod)
- **Storage:** Cloudinary/AWS S3 (For image uploads)
- **Development:** Replit

## Development

For detailed development guidelines, including constants management, authentication handling, and best practices, please refer to our [Development Guide](DEVELOPMENT.md).

For UI state management patterns and best practices, including the toast notification system, see our [UI State Management Guide](UI_STATE.md).

### Running Tests

```bash
# Run frontend tests
npm run test:client

# Run backend tests
npm run test:server

# Run all tests
npm run test
```

### Environment Variables

Required environment variables:

```
VITE_API_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/myrentcard
JWT_SECRET=your-secret-key
CLOUDINARY_URL=your-cloudinary-url
```

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

For detailed deployment instructions, see [Deployment Guide](DEPLOYMENT.md).

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For detailed contribution guidelines, see [Contributing Guide](CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Database Structure

MyRentCard uses PostgreSQL with Drizzle ORM for database management. The database schema includes:

### Core Tables
- **users**: Authentication and basic user information
- **tenant_profiles**: Detailed tenant information
- **landlord_profiles**: Landlord business information
- **properties**: Property listings with details
- **applications**: Tenant applications for properties
- **screening_pages**: Custom screening pages for landlords
- **rent_cards**: Comprehensive tenant rental profiles

### Enhanced Features

#### Document Management
- **tenant_documents**: Store and verify tenant documents (ID, payslips, etc.)

#### Messaging System
- **conversations**: Property-related conversations
- **conversation_participants**: Users participating in conversations
- **messages**: Individual messages within conversations

#### Property Enhancements
- **property_images**: Multiple images for properties
- **property_amenities**: Detailed property amenities

#### Analytics
- **property_analytics**: Detailed property performance metrics
- **user_activity**: Track user actions for analytics

#### Notifications
- **notifications**: System notifications for users

#### References
- **tenant_references**: Detailed tenant references with verification

#### Roommates
- **roommate_groups**: Groups of tenants applying together
- **roommate_group_members**: Members of roommate groups
- **group_applications**: Applications submitted by roommate groups