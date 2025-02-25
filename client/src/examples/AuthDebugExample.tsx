import React, { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { debugAuthToken } from '@/lib/queryClient';

/**
 * Example component demonstrating how to use authentication debugging tools
 * 
 * This is an example only and not meant to be used in production.
 * For detailed information, see the Authentication Debugging Guide.
 */
export function AuthDebugExample() {
  const { user, isAuthenticated, initialize } = useAuthStore();

  useEffect(() => {
    // Initialize authentication on component mount
    initialize();
    
    // Log authentication token details to console
    debugAuthToken();
    
    // Example of checking authentication status
    console.log('Authentication status:', {
      isAuthenticated,
      userId: user?.id,
      userType: user?.userType
    });
  }, [initialize, isAuthenticated, user]);

  const handleDebugToken = () => {
    // Log detailed token information to console
    const tokenInfo = debugAuthToken();
    console.log('Token exists:', tokenInfo.hasToken);
  };

  const handleResetToken = () => {
    // Clear token from localStorage and reload
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div className="p-4 border rounded bg-gray-50">
      <h2 className="text-lg font-semibold mb-2">Authentication Debug Example</h2>
      
      <div className="mb-2">
        <strong>Status:</strong> {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
      </div>
      
      {user && (
        <div className="mb-2">
          <strong>User:</strong> {user.email} (ID: {user.id}, Type: {user.userType})
        </div>
      )}
      
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleDebugToken}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Debug Token
        </button>
        
        <button
          onClick={() => initialize()}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Reinitialize Auth
        </button>
        
        <button
          onClick={handleResetToken}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Reset Token
        </button>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Check the browser console for detailed authentication information.</p>
        <p>For more debugging tools, visit the <a href="/debug-auth" className="text-blue-500 hover:underline">/debug-auth</a> page.</p>
      </div>
    </div>
  );
} 