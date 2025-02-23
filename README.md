# MyRentCard

MyRentCard simplifies the rental application process by allowing tenants to create a reusable rental profile ("RentCard") that can be instantly shared with potential landlords. Track property views, manage applications, and streamline the rental process.

## Features

- Create and manage reusable rental profiles
- Instant profile sharing with potential landlords
- Property view tracking and analytics
- Secure document storage and verification
- Real-time application status updates
- Automated reference checks

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

For UI state management patterns and best practices, see our [UI State Management Guide](UI_STATE.md).

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