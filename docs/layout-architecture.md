# Layout Architecture Documentation

## Overview

The application uses a hierarchical layout system with a shared base component to ensure consistency across different user roles while allowing for role-specific customizations. This approach minimizes code duplication and makes the codebase more maintainable.

## Layout Components Hierarchy

```
BaseLayout
├── LandlordLayout
└── TenantLayout
```

## BaseLayout

The `BaseLayout` component provides the common structure and styling shared across all user roles:

- Common page structure
- Main content container
- Responsive layout adjustments
- Sidebar integration
- Mobile header handling

### Props

```typescript
export interface BaseLayoutProps {
  children: ReactNode;        // Content to render in the main area
  sidebar: ReactNode;         // Sidebar component to render
  mobileHeader?: ReactNode;   // Optional header for mobile views
  mobileMenuOpen?: boolean;   // State for mobile menu visibility
  setMobileMenuOpen?: (open: boolean) => void; // Function to toggle mobile menu
}
```

### Implementation

The BaseLayout manages the consistent page structure:
- Flexible container with responsive styling
- Placement of sidebar and main content
- Mobile-friendly layout adjustments with proper spacing
- Content flow management

## Role-Specific Layouts

### LandlordLayout

The `LandlordLayout` extends `BaseLayout` by adding landlord-specific functionality:
- Uses `LandlordSidebar` for navigation
- Provides landlord-specific mobile header
- Manages landlord-specific state and navigation

```typescript
const LandlordLayout: React.FC<LandlordLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mobile header for landlord view
  const mobileHeader = (
    // Mobile header implementation
  );

  return (
    <BaseLayout
      sidebar={<LandlordSidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />}
      mobileHeader={mobileHeader}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
    >
      {children}
    </BaseLayout>
  );
};
```

### TenantLayout

The `TenantLayout` extends `BaseLayout` with tenant-specific functionality:
- Uses `TenantSidebar` for navigation
- Provides tenant-specific mobile header
- Accepts an `activeRoute` prop to highlight the active navigation item
- Manages tenant-specific state and navigation

```typescript
const TenantLayout: React.FC<TenantLayoutProps> = ({ 
  children, 
  activeRoute = ROUTES.TENANT.DASHBOARD 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Mobile header for tenant view
  const mobileHeader = (
    // Mobile header implementation
  );

  return (
    <BaseLayout
      sidebar={<TenantSidebar activeRoute={activeRoute} mobileMenuOpen={mobileMenuOpen} />}
      mobileHeader={mobileHeader}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
    >
      {children}
    </BaseLayout>
  );
};
```

## Benefits of this Architecture

1. **Code Reusability**: Common layout code is defined once in the BaseLayout
2. **Consistency**: All layouts share the same structure and responsive behavior
3. **Maintainability**: Changes to the shared layout only need to be made in one place
4. **Flexibility**: Role-specific layouts can easily add custom functionality
5. **Separation of Concerns**: Each layout component handles only its specific responsibilities

## How to Use

### Creating a New Page with LandlordLayout

```tsx
import React from 'react';
import LandlordLayout from '@/components/layouts/LandlordLayout';

const LandlordSettingsPage: React.FC = () => {
  return (
    <LandlordLayout>
      <div>
        {/* Page content */}
        <h1>Settings</h1>
        {/* More content */}
      </div>
    </LandlordLayout>
  );
};

export default LandlordSettingsPage;
```

### Creating a New Page with TenantLayout

```tsx
import React from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ROUTES } from '@/constants';

const TenantDocumentsPage: React.FC = () => {
  return (
    <TenantLayout activeRoute={ROUTES.TENANT.DOCUMENTS}>
      <div>
        {/* Page content */}
        <h1>My Documents</h1>
        {/* More content */}
      </div>
    </TenantLayout>
  );
};

export default TenantDocumentsPage;
```

## Extending the Architecture

To add a new user role layout (e.g., AdminLayout):

1. Create the corresponding sidebar component (AdminSidebar)
2. Create the new layout component extending BaseLayout
3. Pass the appropriate props to BaseLayout

Example:

```tsx
import React, { useState } from 'react';
import AdminSidebar from '../shared/AdminSidebar';
import BaseLayout from './BaseLayout';
import { Button } from "@/components/ui/button";
import { Building, Menu, X } from 'lucide-react';
import { Link } from "wouter";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mobile header for admin view
  const mobileHeader = (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-10">
      {/* Mobile header content */}
    </div>
  );

  return (
    <BaseLayout
      sidebar={
        <AdminSidebar 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen} 
        />
      }
      mobileHeader={mobileHeader}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
    >
      {children}
    </BaseLayout>
  );
};

export default AdminLayout;
```