import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { debugAuthToken, apiRequest } from '@/lib/queryClient';

/**
 * Authentication Debugging Tools
 * 
 * This component provides comprehensive tools for debugging authentication issues
 * during development. It can be used in two ways:
 * 
 * 1. As a standalone page at /debug-auth
 * 2. As an embeddable component that can be included in any page during development
 * 
 * @param {object} props - Component props
 * @param {boolean} props.embedded - Whether the component is embedded in another page (simplified view)
 * @param {boolean} props.autoInitialize - Whether to automatically initialize auth on mount
 * @param {boolean} props.showEndpointTester - Whether to show the endpoint testing tool (only in full view)
 */
export function AuthDebugTools({ 
  embedded = false,
  autoInitialize = true,
  showEndpointTester = true
}: {
  embedded?: boolean;
  autoInitialize?: boolean;
  showEndpointTester?: boolean;
}) {
  const { user, token, isAuthenticated, initialize } = useAuthStore();
  const [testEndpoint, setTestEndpoint] = useState('/api/user');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize auth on component mount if autoInitialize is true
    if (autoInitialize) {
      initialize();
      // Log basic auth status to console in embedded mode
      if (embedded) {
        console.log('Authentication status:', {
          isAuthenticated,
          userId: user?.id,
          userType: user?.userType
        });
      }
    }
  }, [initialize, autoInitialize, isAuthenticated, user, embedded]);

  const handleDebugToken = () => {
    const tokenInfo = debugAuthToken();
    if (embedded) {
      console.log('Token exists:', tokenInfo.hasToken);
    }
  };

  const handleTestEndpoint = async () => {
    setLoading(true);
    setTestResponse(null);
    setTestError(null);
    
    try {
      const response = await apiRequest('GET', testEndpoint);
      const data = await response.json();
      setTestResponse(data);
    } catch (error) {
      setTestError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetToken = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  // Render embedded (simplified) version
  if (embedded) {
    return (
      <div className="p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Authentication Debug</h2>
        
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

  // Render full version (for the debug page)
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Authentication Debugging Tools</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="font-semibold">Authenticated:</div>
          <div>{isAuthenticated ? 'Yes' : 'No'}</div>
          
          <div className="font-semibold">Token Present:</div>
          <div>{token ? 'Yes' : 'No'}</div>
          
          <div className="font-semibold">User ID:</div>
          <div>{user?.id || 'Not logged in'}</div>
          
          <div className="font-semibold">User Type:</div>
          <div>{user?.userType || 'N/A'}</div>
          
          <div className="font-semibold">Email:</div>
          <div>{user?.email || 'N/A'}</div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <button 
            onClick={handleDebugToken}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Debug Token
          </button>
          
          <button 
            onClick={() => initialize()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Reinitialize Auth
          </button>
          
          <button 
            onClick={handleResetToken}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reset Token
          </button>
        </div>
      </div>
      
      {showEndpointTester && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h2 className="text-xl font-semibold mb-2">API Endpoint Tester</h2>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Endpoint URL:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testEndpoint}
                onChange={(e) => setTestEndpoint(e.target.value)}
                className="flex-1 px-3 py-2 border rounded"
                placeholder="/api/endpoint"
              />
              <button
                onClick={handleTestEndpoint}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                {loading ? 'Testing...' : 'Test'}
              </button>
            </div>
          </div>
          
          {testError && (
            <div className="p-3 mb-4 bg-red-100 border border-red-200 rounded">
              <h3 className="text-lg font-medium text-red-800 mb-1">Error</h3>
              <p className="text-red-700">{testError}</p>
            </div>
          )}
          
          {testResponse && (
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Response:</h3>
              <pre className="p-3 bg-gray-800 text-green-300 rounded overflow-auto max-h-60">
                {JSON.stringify(testResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Authentication Debugging Guide</h2>
        <div className="prose">
          <h3>Common Authentication Issues</h3>
          <ul>
            <li><strong>401 Unauthorized errors</strong>: These occur when the authentication token is missing, invalid, or expired.</li>
            <li><strong>403 Forbidden errors</strong>: These occur when the user is authenticated but doesn't have permission for the requested resource.</li>
            <li><strong>Authentication state inconsistencies</strong>: These occur when the client-side authentication state doesn't match the server-side state.</li>
          </ul>
          
          <h3>Troubleshooting Steps</h3>
          <ol>
            <li>Use the <strong>Debug Token</strong> button to check if the token exists and is valid.</li>
            <li>If the token is expired, you'll need to login again.</li>
            <li>Use the <strong>Reinitialize Auth</strong> button to refresh the authentication state.</li>
            <li>Use the API Endpoint Tester to test specific endpoints with the current authentication.</li>
            <li>If all else fails, use the <strong>Reset Token</strong> button to clear authentication and start fresh.</li>
          </ol>
          
          <p className="text-sm text-gray-600 mt-4">
            For more information, see the <code>DEVELOPMENT.md</code> documentation.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * @deprecated Use AuthDebugTools with embedded=true instead
 */
export function AuthDebugExample() {
  return <AuthDebugTools embedded={true} />;
}

/**
 * Debug Auth Page using the AuthDebugTools component
 */
export default function DebugAuthPage() {
  return <AuthDebugTools />;
}