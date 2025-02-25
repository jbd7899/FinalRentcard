# Unique Slugs for General Screening Pages

This document explains the implementation of unique slugs for general screening pages in the MyRentCard application.

## Overview

Each landlord account now gets a unique URL slug for their general screening page. This ensures that:

1. Each landlord has a distinct, personalized URL for their general screening page
2. URLs are more professional and branded with the landlord's business name
3. Multiple landlords can have general screening pages without URL conflicts

## Implementation Details

### Slug Generation

Slugs are generated using the following formula:

```javascript
function generateUniqueSlug(businessName, landlordId) {
  // Convert business name to lowercase, replace spaces with hyphens, and remove special characters
  const baseSlug = businessName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .substring(0, 30); // Limit length
  
  // Add landlord ID to ensure uniqueness
  return `${baseSlug}-${landlordId}`;
}
```

For example:
- "ABC Property Management" with landlord ID 123 becomes: `abc-property-management-123`
- "John's Rentals" with landlord ID 456 becomes: `johns-rentals-456`

### Fallback Mechanism

If a slug is not available for any reason, the system falls back to a generated slug based on the landlord's ID:

```javascript
`landlord-${user?.id || '1'}-screening`
```

For example:
- Landlord with ID 123: `landlord-123-screening`

## URL Structure

The general screening page URLs now follow this pattern:

```
/screening/{business-name-landlordId}
```

For example:
- `/screening/abc-property-management-123`
- `/screening/johns-rentals-456`

## Testing

To test this implementation:
1. Create a new landlord account
2. Navigate to the screening management page
3. Verify that the general screening page has a unique URL based on your business name and ID
4. Copy the link and verify it works correctly when accessed

## Future Enhancements

Potential future enhancements could include:
- Custom slug editing by landlords
- Slug validation to prevent duplicates
- Slug history tracking for URL redirects if a slug changes 