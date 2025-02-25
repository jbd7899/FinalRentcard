# Landlord Pages

This directory contains all the pages related to landlord functionality in the application.

## Pages Overview

### Dashboard (`dashboard.tsx`)
The main dashboard for landlords showing property statistics, recent applications, and quick actions.

### Applications (`applications.tsx`)
Page for landlords to review and manage tenant applications for their properties.

### Add Property (`add-property.tsx`)
Form for landlords to add new rental properties to the system.

### Screening Page (`screening-page.tsx`)
Custom screening page for each property that landlords can share with potential tenants.

### Verify Documents (`verify-documents.tsx`)
Page for landlords to review and verify tenant documents.

## Verify Documents Feature

The Verify Documents page allows landlords to:

1. View a list of tenants who have uploaded documents
2. Search and filter tenants
3. View documents uploaded by each tenant
4. Preview document contents
5. Verify documents as legitimate
6. Delete invalid documents

### Implementation Details

- Uses the `DocumentList` component to display tenant documents
- Integrates with the document verification API endpoints
- Supports various document types (ID, payslips, references, etc.)
- Includes document preview functionality

### Usage

```tsx
// Example of how to use the VerifyDocumentsPage component
import VerifyDocumentsPage from '@/pages/landlord/verify-documents';

// In your router
<Route path="/landlord/verify-documents" component={VerifyDocumentsPage} />
```

### Related Components

- `DocumentList`: Displays a list of documents with verification options
- `DocumentUpload`: Used by tenants to upload documents

### API Integration

The Verify Documents feature uses the following API endpoints:

- `GET /api/documents/tenant/:tenantId`: Get documents for a specific tenant
- `PUT /api/documents/:id/verify`: Mark a document as verified
- `DELETE /api/documents/:id`: Delete a document

For more detailed documentation, see the [Verify Documents Feature Documentation](/docs/features/verify-documents.md). 