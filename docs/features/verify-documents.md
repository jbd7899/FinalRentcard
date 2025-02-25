# Verify Documents Feature

## Overview

The "Verify Documents" feature allows landlords to review and verify documents uploaded by tenants. This verification process adds credibility to tenant profiles and helps landlords make informed decisions during the tenant screening process.

## User Roles and Permissions

### Landlords
- View a list of tenants and their uploaded documents
- Preview document contents
- Verify documents (mark as legitimate)
- Reject or delete invalid documents
- Filter and search through tenant documents

### Tenants
- Upload various document types
- View verification status of their documents
- Delete their own documents
- See which landlord verified their documents

## Feature Components

### 1. Document Upload (Tenant Side)

Tenants can upload various document types through the Document Upload component:
- ID documents
- Payslips
- Reference letters
- Employment verification
- Bank statements
- Tax returns
- Other documents

The upload component supports:
- Drag and drop functionality
- File type validation
- File size limits (10MB max)
- Document type selection

### 2. Document List (Both Tenant and Landlord)

Displays a list of documents with:
- Document type
- Upload date
- Verification status
- Preview option
- Delete option (for tenant's own documents or landlord)
- Verify option (landlord only)

### 3. Document Verification (Landlord Side)

Landlords can:
- Select a tenant from a list
- View all documents uploaded by the tenant
- Preview document contents
- Mark documents as verified
- Add verification notes (optional)
- Reject documents with reason

## Technical Implementation

### API Endpoints

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/documents` | GET | Get all documents (admin only) | Admin |
| `/api/documents/upload` | POST | Upload a new document | Tenant |
| `/api/documents/:id` | GET | Get document by ID | Owner, Landlord |
| `/api/documents/:id` | DELETE | Delete document | Owner, Landlord |
| `/api/documents/:id/verify` | PUT | Verify document | Landlord |
| `/api/documents/tenant/:tenantId` | GET | Get documents by tenant ID | Tenant, Landlord |
| `/api/landlord/documents/stats` | GET | Get document statistics | Landlord |

### Data Models

#### Document
```typescript
interface Document {
  id: number;
  tenantId: number;
  documentType: string;
  documentUrl: string;
  isVerified: boolean;
  verifiedBy?: number;
  verifiedAt?: string;
  uploadedAt: string;
}
```

### Frontend Components

- `VerifyDocumentsPage`: Main page for landlords to verify tenant documents
- `DocumentList`: Reusable component to display documents
- `DocumentUpload`: Component for tenants to upload documents
- `DocumentPreview`: Component to preview document contents

## User Flows

### Tenant Document Upload Flow
1. Tenant navigates to Documents page
2. Tenant selects document type and uploads file
3. System validates and stores the document
4. Document appears in tenant's document list with "Pending" status

### Landlord Verification Flow
1. Landlord navigates to Verify Documents page
2. Landlord selects a tenant from the list
3. System displays all documents uploaded by the tenant
4. Landlord previews document contents
5. Landlord verifies document or rejects it
6. System updates document status and notifies tenant

## Integration with Other Features

- **RentCard**: Verified documents enhance tenant's RentCard score
- **Applications**: Landlords can see which documents are verified when reviewing applications
- **Tenant Dashboard**: Tenants can see verification status of their documents
- **Landlord Dashboard**: Shows statistics on document verification

## Security Considerations

- Documents are stored securely with access controls
- Only the document owner (tenant) and authorized landlords can access documents
- Document URLs are not publicly accessible
- Sensitive information in documents is handled according to privacy regulations

## Future Enhancements

- Automated document verification using OCR and AI
- Document expiration tracking
- Bulk document verification
- Enhanced document categorization
- Document sharing between landlords (with tenant permission)

## Troubleshooting

### Common Issues

1. **Document Upload Failures**
   - Check file size (must be under 10MB)
   - Ensure file type is supported
   - Verify network connection

2. **Document Preview Issues**
   - Ensure browser supports PDF preview
   - Check if document URL is valid
   - Try downloading the document instead

3. **Verification Problems**
   - Ensure landlord has proper permissions
   - Check if document is already verified
   - Verify API connectivity 