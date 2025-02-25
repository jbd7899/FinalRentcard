# Authentication Debugging Tools

This directory contains tools for debugging authentication issues in the application.

## Overview

The authentication debugging tools have been consolidated into a single, flexible component:

- `AuthDebugTools.tsx`: A unified component that can function as both a standalone page and an embedded widget
  
## Backward Compatibility

For backward compatibility, the following files are maintained:

- `/client/src/pages/debug-auth.tsx`: Now imports from the unified component
- `/client/src/examples/AuthDebugExample.tsx`: Now uses the unified component with embedded=true

## Usage

### As a Standalone Page

To use the full debug page, navigate to `/debug-auth` in the application.

```tsx
// This route is already set up in App.tsx
<Route path="/debug-auth" component={DebugAuthPage} />
```

### As an Embedded Component

To embed the debug tools in any component:

```tsx
import { AuthDebugTools } from "@/components/AuthDebugTools";

function YourComponent() {
  return (
    <div>
      <h1>Your Component</h1>
      {/* During development only: */}
      {process.env.NODE_ENV === 'development' && (
        <AuthDebugTools embedded={true} />
      )}
    </div>
  );
}
```

## Props for AuthDebugTools

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| embedded | boolean | false | When true, renders a simplified version suitable for embedding in other components |
| autoInitialize | boolean | true | Whether to automatically initialize auth on mount |
| showEndpointTester | boolean | true | Whether to show the endpoint testing tool (only in full view) |

## Transition Plan

1. All new authentication debugging features should be added to `AuthDebugTools.tsx`
2. Existing code should gradually transition to using `AuthDebugTools` directly
3. The legacy files are maintained for backward compatibility but marked as deprecated

## Features

The authentication debugging tools provide:

1. Authentication status display
2. Token debugging
3. API endpoint testing with current authentication
4. Authentication reinitialization
5. Token reset functionality

## Common Authentication Issues

1. **401 Unauthorized errors**: These occur when the authentication token is missing, invalid, or expired.
2. **403 Forbidden errors**: These occur when the user is authenticated but doesn't have permission for the requested resource.
3. **Authentication state inconsistencies**: These occur when the client-side authentication state doesn't match the server-side state.

## Troubleshooting Steps

1. Use the **Debug Token** button to check if the token exists and is valid.
2. If the token is expired, you'll need to login again.
3. Use the **Reinitialize Auth** button to refresh the authentication state.
4. Use the API Endpoint Tester to test specific endpoints with the current authentication.
5. If all else fails, use the **Reset Token** button to clear authentication and start fresh.