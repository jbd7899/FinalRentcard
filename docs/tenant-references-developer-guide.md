# Tenant References System - Developer Guide

## System Architecture

The Tenant References System consists of the following components:

1. **Frontend Components**:
   - Reference management page (`client/src/pages/tenant/references.tsx`)
   - Reference verification page (`client/src/pages/references/verify/[token].tsx`)
   - Reference form component (`client/src/components/tenant/ReferenceForm.tsx`)
   - Reference card component (`client/src/components/tenant/ReferenceCard.tsx`)

2. **State Management**:
   - References store (`client/src/stores/referencesStore.ts`)

3. **Backend Services**:
   - API routes (`server/routes.ts`)
   - Email service (`server/email.ts`)
   - Storage service (`server/storage.ts`)

4. **Database Schema**:
   - Tenant references table (`shared/schema-enhancements.ts`)

## Data Flow

1. **Reference Creation**:
   - User submits reference form → References store → API endpoint → Storage service → Database
   
2. **Reference Verification**:
   - Send verification → API endpoint → Email service → Reference email
   - Reference clicks link → Verification page → API endpoint → Storage service → Database

## API Endpoints

### Tenant References

#### GET `/api/tenant/references/:tenantId`
- **Description**: Retrieves all references for a tenant
- **Authentication**: Required
- **Parameters**: `tenantId` (path parameter)
- **Response**: Array of tenant references

#### GET `/api/tenant/references/detail/:id`
- **Description**: Retrieves a specific reference by ID
- **Authentication**: Required
- **Parameters**: `id` (path parameter)
- **Response**: Tenant reference object

#### POST `/api/tenant/references`
- **Description**: Creates a new reference
- **Authentication**: Required
- **Request Body**: Reference object
- **Response**: Created reference object

#### PUT `/api/tenant/references/:id`
- **Description**: Updates an existing reference
- **Authentication**: Required
- **Parameters**: `id` (path parameter)
- **Request Body**: Updated reference fields
- **Response**: Updated reference object

#### DELETE `/api/tenant/references/:id`
- **Description**: Deletes a reference
- **Authentication**: Required
- **Parameters**: `id` (path parameter)
- **Response**: 204 No Content

#### POST `/api/tenant/references/:id/send-verification`
- **Description**: Sends a verification email to a reference
- **Authentication**: Required
- **Parameters**: `id` (path parameter)
- **Response**: Success message and updated reference

### Reference Verification

#### GET `/api/tenant/references/verify/validate/:token`
- **Description**: Validates a verification token
- **Authentication**: Not required
- **Parameters**: `token` (path parameter)
- **Response**: Reference data with validation status

#### POST `/api/tenant/references/verify/:token`
- **Description**: Submits a verification for a reference
- **Authentication**: Not required
- **Parameters**: `token` (path parameter)
- **Request Body**: `{ rating, comments }`
- **Response**: Success message and updated reference

## Database Schema

```typescript
// Tenant References
export const tenantReferences = pgTable("tenant_references", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenantProfiles.id),
  name: text("name").notNull(),
  relationship: text("relationship").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationDate: timestamp("verification_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

## Email Service

The email service handles sending verification emails to references. It includes:

1. **Token Generation**: Creates secure, time-limited tokens for verification
2. **Token Verification**: Validates tokens and extracts reference IDs
3. **Email Sending**: Formats and sends verification emails

### Token Format

Tokens are base64-encoded strings containing:
- Reference ID
- Timestamp
- Hash (for security)

Tokens expire after 24 hours for security.

## Component Structure

### ReferenceForm

The reference form component handles:
- Creating new references
- Editing existing references
- Form validation

### ReferenceCard

The reference card component displays:
- Reference information
- Verification status
- Action buttons (edit, delete, send verification)

### Verification Page

The verification page handles:
- Token validation
- Displaying reference information
- Collecting verification data (rating, comments)
- Submitting verification

## State Management

The references store manages:
- Fetching references
- Adding references
- Updating references
- Deleting references
- Sending verification emails

## Error Handling

The system includes comprehensive error handling for:
- Invalid tokens
- Expired tokens
- Already verified references
- Missing required fields
- Server errors

## Security Considerations

1. **Token Security**:
   - Tokens include a timestamp for expiration
   - Tokens are hashed with a secret key
   - Tokens are base64-encoded

2. **Authentication**:
   - All tenant reference management endpoints require authentication
   - Verification endpoints do not require authentication but validate tokens

3. **Data Validation**:
   - All input data is validated using Zod schemas
   - API endpoints validate request data

## Testing

See the [Testing Plan](./tenant-references-testing.md) for detailed testing procedures.

## Extending the System

### Adding New Reference Types

To add new reference types:
1. Update the `RELATIONSHIP_TYPES` array in `ReferenceForm.tsx`
2. Update the `getRelationshipIcon` and `getRelationshipLabel` functions in `ReferenceCard.tsx`

### Enhancing Verification

To enhance the verification process:
1. Modify the verification form schema in `[token].tsx`
2. Update the verification API endpoint in `routes.ts`
3. Update the verification email template in `email.ts` 