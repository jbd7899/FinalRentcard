import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { debugAuthToken } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';

export default function DebugAuthPage() {
  const { user, token, isAuthenticated, initialize } = useAuthStore();
  const [testEndpoint, setTestEndpoint] = useState('/api/user');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize auth on page load
    initialize();
  }, [initialize]);

  const handleDebugToken = () => {
    debugAuthToken();
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Authentication Debug Page</h1>
      
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
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-xl font-semibold mb-2">Test API Endpoint</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={testEndpoint}
            onChange={(e) => setTestEndpoint(e.target.value)}
            className="flex-1 px-4 py-2 border rounded"
            placeholder="API endpoint (e.g., /api/user)"
          />
          
          <button 
            onClick={handleTestEndpoint}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Testing...' : 'Test Endpoint'}
          </button>
        </div>
        
        {testError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error:</p>
            <p>{testError}</p>
          </div>
        )}
        
        {testResponse && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p className="font-bold">Response:</p>
            <pre className="whitespace-pre-wrap overflow-auto max-h-60">
              {JSON.stringify(testResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Common Test Endpoints</h2>
        <ul className="list-disc pl-5">
          <li className="mb-1">
            <button 
              onClick={() => setTestEndpoint('/api/user')}
              className="text-blue-500 hover:underline"
            >
              /api/user
            </button>
            - Test user authentication
          </li>
          <li className="mb-1">
            <button 
              onClick={() => setTestEndpoint('/api/properties')}
              className="text-blue-500 hover:underline"
            >
              /api/properties
            </button>
            - Test properties list access
          </li>
          <li className="mb-1">
            <button 
              onClick={() => setTestEndpoint('/api/properties/3038')}
              className="text-blue-500 hover:underline"
            >
              /api/properties/3038
            </button>
            - Test specific property access
          </li>
        </ul>
      </div>
    </div>
  );
} 