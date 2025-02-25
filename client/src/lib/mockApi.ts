import { API_ENDPOINTS } from '@/constants';

// Mock storage for documents
let mockDocuments = [
  {
    id: 1,
    tenantId: 1,
    documentType: 'id',
    documentUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    isVerified: false,
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 2,
    tenantId: 1,
    documentType: 'payslip',
    documentUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.pdf',
    isVerified: true,
    verifiedBy: 2,
    verifiedAt: new Date().toISOString(),
    uploadedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  }
];

// Mock document ID counter
let documentIdCounter = mockDocuments.length + 1;

// Mock fetch implementation
const originalFetch = window.fetch;

// Helper to create a mock response
const createMockResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

// Override fetch for specific API endpoints
window.fetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  // Convert URL to string if it's not already
  const urlStr = url.toString();
  
  // Handle document endpoints
  if (urlStr.includes('/api/documents')) {
    // Get documents by tenant ID
    if (urlStr.includes('/api/documents/tenant/')) {
      const tenantId = parseInt(urlStr.split('/tenant/')[1]);
      const documents = mockDocuments.filter(doc => doc.tenantId === tenantId);
      return createMockResponse(documents);
    }
    
    // Upload document
    if (urlStr === API_ENDPOINTS.DOCUMENTS.UPLOAD && options?.method === 'POST') {
      try {
        let documentType = 'other';
        let tenantId = 1;
        
        // Try to parse the request body
        if (options.body) {
          // Check if it's a JSON request by examining the headers
          const contentTypeHeader = options.headers ? 
            Object.entries(options.headers).find(([key]) => 
              key.toLowerCase() === 'content-type'
            ) : null;
          
          const isJsonRequest = contentTypeHeader && 
            contentTypeHeader[1] === 'application/json';
          
          if (isJsonRequest && typeof options.body === 'string') {
            // Handle JSON request
            const body = JSON.parse(options.body);
            documentType = body.documentType || documentType;
            tenantId = body.tenantId || tenantId;
          } else if (options.body instanceof FormData) {
            // Handle FormData request (for production)
            const formData = options.body as FormData;
            documentType = formData.get('documentType')?.toString() || documentType;
            tenantId = parseInt(formData.get('tenantId')?.toString() || '1');
          }
        }
        
        // Create a new document
        const newDocument = {
          id: documentIdCounter++,
          tenantId,
          documentType,
          documentUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
          isVerified: false,
          uploadedAt: new Date().toISOString(),
        };
        
        mockDocuments.push(newDocument);
        return createMockResponse(newDocument, 201);
      } catch (error) {
        console.error('Error in mock document upload:', error);
        return createMockResponse({ message: 'Failed to upload document' }, 500);
      }
    }
    
    // Verify document
    if (urlStr.includes('/api/documents/') && urlStr.includes('/verify') && options?.method === 'PUT') {
      const documentId = parseInt(urlStr.split('/api/documents/')[1].split('/verify')[0]);
      const documentIndex = mockDocuments.findIndex(doc => doc.id === documentId);
      
      if (documentIndex !== -1) {
        mockDocuments[documentIndex] = {
          ...mockDocuments[documentIndex],
          isVerified: true,
          verifiedBy: 2, // Default to landlord ID 2 for mock
          verifiedAt: new Date().toISOString(),
        };
        
        return createMockResponse(mockDocuments[documentIndex]);
      }
    }
    
    // Delete document
    if (urlStr.includes('/api/documents/') && options?.method === 'DELETE') {
      const documentId = parseInt(urlStr.split('/api/documents/')[1]);
      const documentIndex = mockDocuments.findIndex(doc => doc.id === documentId);
      
      if (documentIndex !== -1) {
        mockDocuments = mockDocuments.filter(doc => doc.id !== documentId);
        return createMockResponse({ message: 'Document deleted successfully' });
      }
    }
  }
  
  // For all other requests, use the original fetch
  return originalFetch(url, options);
};

export default function setupMockApi() {
  console.log('🔧 Mock API handlers initialized');
  console.log('📄 Mock documents API endpoints:');
  console.log(`  - GET ${API_ENDPOINTS.DOCUMENTS.BY_TENANT(':tenantId')}`);
  console.log(`  - POST ${API_ENDPOINTS.DOCUMENTS.UPLOAD}`);
  console.log(`  - PUT ${API_ENDPOINTS.DOCUMENTS.VERIFY(':id')}`);
  console.log(`  - DELETE ${API_ENDPOINTS.DOCUMENTS.DELETE(':id')}`);
  console.log('💡 Using mock data for document operations in development mode');
} 