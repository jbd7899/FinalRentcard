# Individual Landlord Dashboard Documentation

## Overview

The Individual Landlord Dashboard is a central management interface designed specifically for individual property owners who represent 70-75% of the rental market. This personalized dashboard enables individual landlords to monitor and manage their rental properties, tenant applications, and screening processes with the personal attention that sets them apart from corporate property management. The dashboard follows a modular architecture with a tab-based interface that separates different functional areas into distinct components.

## Architecture

The dashboard is built using a component-based architecture with React and TypeScript. It follows these design principles:

1. **Separation of Concerns**: Each tab's content is extracted into its own component
2. **Reusable Components**: Common UI elements are shared across tabs
3. **Centralized State Management**: Uses React Query for data fetching and state management
4. **Responsive Design**: Adapts to different screen sizes with tailwind CSS

## Component Structure

### Main Components

- **LandlordDashboard**: The parent component that manages tab state and data fetching
- **OverviewTab**: Displays summary statistics and quick actions
- **PropertiesTab**: Lists and manages all properties
- **ApplicationsTab**: Shows tenant applications and documents requiring verification
- **RequestModal**: Modal for requesting tenant RentCards

### Component Hierarchy

```
BaseLayout
├── LandlordLayout / TenantLayout
│   └── LandlordDashboard / TenantDashboard
│       ├── Tab Navigation
│       ├── OverviewTab
│       │   ├── StatsCard
│       │   └── GeneralScreeningActions
│       ├── PropertiesTab
│       │   └── ScreeningActions
    ├── ApplicationsTab
    └── RequestModal
```

## Data Flow

1. **Data Fetching**: 
   - The main dashboard component fetches data using React Query
   - Data includes properties, general screening information, and application statistics
   - Mutations are defined for actions like toggling property archive status

2. **Props Flow**:
   - The main dashboard passes relevant data and callbacks to each tab component
   - Tab components receive only the data they need to function
   - Action callbacks (like `openModal` and `setLocation`) are passed down to enable navigation

3. **State Management**:
   - Tab selection state is managed in the main dashboard component
   - UI state (like modals) is managed through the `useUIStore`
   - Authentication state is managed through the `useAuthStore`

## Component Details

### LandlordDashboard

The main container component that:
- Manages tab selection state
- Fetches data from APIs
- Calculates summary statistics
- Renders the appropriate tab based on user selection

### OverviewTab

Displays a high-level overview of the individual landlord's rental business:
- Workflow guidance tailored for individual property owners
- Key statistics (views, submissions, active properties) with personal insights
- Quick action buttons designed for individual decision-making
- Individual landlord tips and best practices for personal property management
- General screening page information customized for individual landlords

**Props**:
```typescript
interface OverviewTabProps {
  totalViews: number;
  totalSubmissions: number;
  activeProperties: number;
  generalScreening: any;
  generalScreeningLoading: boolean;
  openModal: (modalType: string) => void;
  setLocation: (path: string) => void;
}
```

### PropertiesTab

Manages all properties owned by the individual landlord:
- Lists active properties with their details and personal notes
- Shows archived properties separately for individual record-keeping
- Provides actions for each property (view, edit, archive/unarchive) with personal control
- Displays screening page statistics for each property with individual insights

**Props**:
```typescript
interface PropertiesTabProps {
  properties: PropertyWithCount[] | undefined;
  propertiesLoading: boolean;
  toggleArchivePropertyPending: boolean;
  handleArchiveToggle: (propertyId: number) => void;
  setLocation: (path: string) => void;
}
```

### ApplicationsTab

Displays tenant applications and documents requiring individual landlord verification:
- Recent applications section with personal review capabilities
- Documents needing individual landlord verification with personal attention to detail
- Empty states with calls-to-action tailored for individual property owners

**Props**:
```typescript
interface ApplicationsTabProps {
  openModal: (modalType: string) => void;
  setLocation: (path: string) => void;
}
```

## How to Extend or Modify

### Adding a New Tab

1. Create a new tab component in `client/src/components/landlord/dashboard/`
2. Define the props interface for the component
3. Add the tab to the tab selection state in `LandlordDashboard`
4. Add a new tab button in the tab navigation section
5. Add conditional rendering for the new tab

Example:

```typescript
// 1. Create new tab component
// client/src/components/landlord/dashboard/ReportsTab.tsx
import React from 'react';

interface ReportsTabProps {
  // Define required props
}

const ReportsTab: React.FC<ReportsTabProps> = (props) => {
  return (
    <div>
      {/* Reports tab content */}
    </div>
  );
};

export default ReportsTab;

// 2. Update dashboard component
// In LandlordDashboard.tsx
const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'applications' | 'reports'>('overview');

// 3. Add tab button
<button
  className={`px-4 py-2 font-medium text-sm sm:text-base whitespace-nowrap ${
    activeTab === 'reports' 
      ? 'text-primary border-b-2 border-primary' 
      : 'text-muted-foreground hover:text-foreground'
  }`}
  onClick={() => setActiveTab('reports')}
>
  Reports
</button>

// 4. Add conditional rendering
{activeTab === 'reports' && (
  <ReportsTab
    // Pass required props
  />
)}
```

### Modifying Existing Tabs

To modify an existing tab:

1. Locate the tab component in `client/src/components/landlord/dashboard/`
2. Make changes to the component's JSX or logic
3. If adding new functionality that requires data, update the props interface
4. Update the parent dashboard component to pass any new required props

### Adding New Features to a Tab

Example: Adding a "Download CSV" feature to the PropertiesTab:

```typescript
// 1. Update PropertiesTabProps interface
interface PropertiesTabProps {
  // Existing props
  properties: PropertyWithCount[] | undefined;
  propertiesLoading: boolean;
  toggleArchivePropertyPending: boolean;
  handleArchiveToggle: (propertyId: number) => void;
  setLocation: (path: string) => void;
  // New prop
  handleDownloadCSV: () => void;
}

// 2. Add button to the component
<Button 
  onClick={handleDownloadCSV} 
  className="text-xs sm:text-sm h-9 sm:h-10 ml-2"
>
  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 sm:mr-3" />
  Download CSV
</Button>

// 3. Implement the handler in the dashboard component
const handleDownloadCSV = () => {
  // Implementation
};

// 4. Pass the handler to the tab component
<PropertiesTab
  properties={properties}
  propertiesLoading={propertiesLoading}
  toggleArchivePropertyPending={toggleArchiveProperty.isPending}
  handleArchiveToggle={handleArchiveToggle}
  setLocation={setLocation}
  handleDownloadCSV={handleDownloadCSV}
/>
```

## Component Relationship Diagram

The following describes the component relationships to be visualized in a diagram:

- **BaseLayout** is the foundational layout component that all role-specific layouts extend
- **LandlordLayout** extends BaseLayout and provides landlord-specific UI structure
- **LandlordDashboard** is the parent component that contains all dashboard-specific components
- **Tab Navigation** sits at the top and controls which tab is displayed
- **OverviewTab**, **PropertiesTab**, and **ApplicationsTab** are siblings that are conditionally rendered based on the active tab
- **RequestModal** is a modal component that can be triggered from any tab
- **StatsCard** and **GeneralScreeningActions** are child components used within the OverviewTab
- **ScreeningActions** is a child component used within the PropertiesTab
- Data flows down from LandlordDashboard to the tab components as props
- User actions in the tabs trigger callbacks that were passed down from the parent

For more details on the layout architecture, see the [Layout Architecture Documentation](/docs/layout-architecture.md)

## Best Practices

1. **Keep Components Focused**: Each tab component should focus on a specific area of functionality
2. **Minimize Prop Drilling**: Pass only the props that each component needs
3. **Use TypeScript Interfaces**: Define clear interfaces for all component props
4. **Handle Loading States**: Always account for loading, error, and empty states
5. **Responsive Design**: Ensure all components work well on different screen sizes
6. **Consistent Styling**: Follow the established design patterns and use the UI component library

## Troubleshooting

Common issues and solutions:

1. **Missing Data**: Ensure that the data fetching queries are enabled and dependencies are correct
2. **Type Errors**: Check that all props match their TypeScript interfaces
3. **UI Inconsistencies**: Verify that the correct CSS classes are applied for responsive design
4. **Performance Issues**: Use React.memo or useMemo for expensive calculations or renders
5. **Modal Not Showing**: Confirm that the modal state is being properly managed in the UI store
