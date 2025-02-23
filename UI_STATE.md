# UI State Management Guide

## Overview

MyRentCard uses Zustand for centralized UI state management. This guide covers the implementation, best practices, and usage patterns for managing UI state across the application.

## UI Store Implementation

```typescript
const useUIStore = create<UIState>()((set) => ({
  // Loading states
  loadingStates: {},
  setLoading: (key: string, isLoading: boolean) => 
    set((state) => ({
      loadingStates: {
        ...state.loadingStates,
        [key]: isLoading,
      },
    })),

  // Modal management
  modal: null,
  openModal: (type: string, data?: any) => 
    set({
      modal: {
        isOpen: true,
        type,
        data,
      },
    }),
  closeModal: () => set({ modal: null }),

  // Toast notifications
  toasts: [],
  addToast: (toast: Omit<Toast, 'id'>) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          ...toast,
          id: Math.random().toString(36).substring(2),
        },
      ],
    })),
  removeToast: (id: string) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),

  // Screening state
  screening: {
    currentStep: 1,
    screeningPageUrl: undefined,
    setScreeningStep: (step: number) =>
      set((state) => ({
        screening: { ...state.screening, currentStep: step },
      })),
    setScreeningUrl: (url: string) =>
      set((state) => ({
        screening: { ...state.screening, screeningPageUrl: url },
      })),
  },

  // Dashboard state
  dashboard: {
    timeFilter: '7days',
    showChart: false,
    showQRCode: false,
    showCopyAlert: false,
    setTimeFilter: (filter: string) =>
      set((state) => ({
        dashboard: { ...state.dashboard, timeFilter: filter },
      })),
    setShowChart: (show: boolean) =>
      set((state) => ({
        dashboard: { ...state.dashboard, showChart: show },
      })),
  },

  // Applications state
  applications: {
    selectedProperty: 'all',
    selectedStatus: 'all',
    showReferences: false,
    setSelectedProperty: (property: string) =>
      set((state) => ({
        applications: { ...state.applications, selectedProperty: property },
      })),
    setSelectedStatus: (status: string) =>
      set((state) => ({
        applications: { ...state.applications, selectedStatus: status },
      })),
  },

  // Sidebar state
  sidebar: {
    isMobileOpen: false,
    isDesktopOpen: true,
    toggleMobile: () =>
      set((state) => ({
        sidebar: {
          ...state.sidebar,
          isMobileOpen: !state.sidebar.isMobileOpen,
        },
      })),
    toggleDesktop: () =>
      set((state) => ({
        sidebar: {
          ...state.sidebar,
          isDesktopOpen: !state.sidebar.isDesktopOpen,
        },
      })),
  },
}));
```

## State Categories

### 1. Loading States
- Key-based loading indicators
- Used for async operations
- Granular control over loading UI

```typescript
// Setting loading state
const { setLoading } = useUIStore();
setLoading('submit-form', true);

// Using loading state
const isLoading = useUIStore((state) => state.loadingStates['submit-form']);
```

### 2. Modal Management
- Control modal visibility
- Pass data to modals
- Handle modal types

```typescript
// Opening a modal
const { openModal } = useUIStore();
openModal('confirmDelete', { id: 123 });

// Modal component
const { modal, closeModal } = useUIStore();
if (modal?.type === 'confirmDelete') {
  // Render confirm delete modal
}
```

### 3. Toast Notifications
- Queue toast messages
- Auto-remove functionality
- Different toast types

```typescript
// Show success toast
const { addToast } = useUIStore();
addToast({
  title: 'Success',
  description: 'Operation completed',
  type: 'success'
});
```

### 4. Form States
- Multi-step form progress
- Form validation states
- Form data persistence

```typescript
// Managing form steps
const { setScreeningStep, currentStep } = useUIStore((state) => state.screening);
setScreeningStep(currentStep + 1);
```

### 5. UI Preferences
- Theme settings
- Layout preferences
- User customizations

```typescript
// Toggle sidebar
const { toggleDesktop } = useUIStore((state) => state.sidebar);
toggleDesktop();
```

## Best Practices

### 1. State Organization
- Group related states
- Use descriptive names
- Keep state updates atomic

```typescript
// Good: Grouped related state
dashboard: {
  timeFilter: '7days',
  showChart: false,
  setTimeFilter: (filter) => set(...),
  setShowChart: (show) => set(...),
}

// Bad: Flat structure
timeFilter: '7days',
showChart: false,
setDashboardTimeFilter: (filter) => set(...),
setDashboardShowChart: (show) => set(...),
```

### 2. Performance Optimization
- Use selective state updates
- Implement proper memoization
- Avoid unnecessary re-renders

```typescript
// Good: Selective state usage
const showChart = useUIStore((state) => state.dashboard.showChart);

// Bad: Getting entire state
const dashboard = useUIStore((state) => state.dashboard);
```

### 3. Type Safety
- Define proper interfaces
- Use strict type checking
- Maintain type consistency

```typescript
interface UIState {
  loadingStates: Record<string, boolean>;
  modal: {
    isOpen: boolean;
    type: string;
    data?: any;
  } | null;
  // ... other state types
}
```

### 4. State Persistence
- Consider which states to persist
- Handle storage errors
- Clear sensitive data

```typescript
const usePersistedUIStore = create(
  persist(
    (set) => ({
      // ... store implementation
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebar: state.sidebar,
      }),
    }
  )
);
```

## Common Patterns

### 1. Loading Indicators
```typescript
function SubmitButton() {
  const isLoading = useUIStore((state) => state.loadingStates['submit']);
  return (
    <button disabled={isLoading}>
      {isLoading ? 'Submitting...' : 'Submit'}
    </button>
  );
}
```

### 2. Modal Dialogs
```typescript
function DeleteModal() {
  const { modal, closeModal } = useUIStore();
  
  if (modal?.type !== 'delete') return null;
  
  return (
    <Dialog open onClose={closeModal}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        Are you sure you want to delete this item?
      </DialogContent>
      <DialogActions>
        <Button onClick={closeModal}>Cancel</Button>
        <Button onClick={() => {
          // Handle delete
          closeModal();
        }}>Delete</Button>
      </DialogActions>
    </Dialog>
  );
}
```

### 3. Toast Notifications
```typescript
function ToastContainer() {
  const { toasts, removeToast } = useUIStore();
  
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
```

## Testing

### 1. Unit Tests
```typescript
describe('UI Store', () => {
  it('should update loading state', () => {
    const { result } = renderHook(() => useUIStore());
    
    act(() => {
      result.current.setLoading('test', true);
    });
    
    expect(result.current.loadingStates.test).toBe(true);
  });
});
```

### 2. Integration Tests
```typescript
test('modal workflow', async () => {
  render(<App />);
  
  // Open modal
  fireEvent.click(screen.getByText('Delete'));
  
  // Check modal content
  expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
  
  // Close modal
  fireEvent.click(screen.getByText('Cancel'));
  
  // Verify modal is closed
  expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
});
```

## Debugging

### 1. Redux DevTools Integration
```typescript
const useUIStore = create(
  devtools(
    (set) => ({
      // ... store implementation
    }),
    {
      name: 'UI Store',
    }
  )
);
```

### 2. Logging Middleware
```typescript
const log = (config) => (set, get, api) =>
  config(
    (...args) => {
      console.log('  applying', args);
      set(...args);
      console.log('  new state', get());
    },
    get,
    api
  );

const useUIStore = create(log((set) => ({
  // ... store implementation
})));
``` 