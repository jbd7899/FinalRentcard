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

// Mock storage for property screening pages
let mockPropertyScreenings = [
  {
    id: 1,
    landlordId: 2,
    businessName: "ABC Property Management",
    contactName: "John Smith",
    businessEmail: "contact@abcproperty.com",
    screeningCriteria: {
      minCreditScore: 650,
      minMonthlyIncome: 3000,
      noEvictions: true,
      cleanRentalHistory: true
    },
    slug: "property-3038-screening",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    propertyDetails: {
      address: "123 Main Street",
      unit: "Apt 4B",
      bedrooms: 2,
      bathrooms: 1.5,
      squareFeet: 950,
      rentAmount: 1500,
      availableDate: new Date(Date.now() + 30*86400000).toISOString().split('T')[0], // 30 days from now
      description: "Beautiful apartment in downtown with modern amenities. Close to public transportation and shopping centers.",
      petPolicy: "cats-only",
      parkingInfo: "1 assigned parking space included",
      images: [
        {
          id: 1,
          url: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
          isPrimary: true
        },
        {
          id: 2, 
          url: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
          isPrimary: false
        }
      ]
    },
    viewCount: 42,
    applicationCount: 5
  },
  {
    id: 2,
    landlordId: 2,
    businessName: "XYZ Real Estate",
    contactName: "Jane Doe",
    businessEmail: "info@xyzrealestate.com",
    screeningCriteria: {
      minCreditScore: 700,
      minMonthlyIncome: 4000,
      noEvictions: true,
      cleanRentalHistory: true
    },
    slug: "luxury-downtown-condo-screening",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    propertyDetails: {
      address: "456 Park Avenue",
      unit: "Unit 12C",
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1400,
      rentAmount: 2800,
      availableDate: new Date(Date.now() + 15*86400000).toISOString().split('T')[0], // 15 days from now
      description: "Luxury condo with stunning city views. Features stainless steel appliances, hardwood floors, and 24-hour doorman.",
      petPolicy: "case-by-case",
      parkingInfo: "Garage parking available for additional fee",
      images: [
        {
          id: 3,
          url: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
          isPrimary: true
        },
        {
          id: 4,
          url: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
          isPrimary: false
        }
      ]
    },
    viewCount: 78,
    applicationCount: 12
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
  
  // Handle property screening endpoints
  if (urlStr.includes('/api/properties/screening/')) {
    // Get property screening page by slug
    const slug = urlStr.split('/api/properties/screening/')[1].split('?')[0]; // Remove any query params
    
    // Intercept screening page fetch request
    if (options?.method === 'GET' || !options?.method) {
      console.log('MOCK: Intercepting property screening request for slug:', slug);
      
      // Always return a mock screening page for testing purposes
      const mockScreeningPage = {
        id: 1,
        landlordId: 2,
        businessName: "ABC Property Management",
        contactName: "John Smith",
        businessEmail: "contact@abcproperty.com",
        screeningCriteria: {
          minCreditScore: 650,
          minMonthlyIncome: 3000,
          noEvictions: true,
          cleanRentalHistory: true
        },
        slug: slug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        propertyDetails: {
          address: "123 Main Street",
          unit: "Apt 4B",
          bedrooms: 2,
          bathrooms: 1.5,
          squareFeet: 950,
          rentAmount: 1500,
          availableDate: new Date(Date.now() + 30*86400000).toISOString().split('T')[0], // 30 days from now
          description: "Beautiful apartment in downtown with modern amenities. Close to public transportation and shopping centers.",
          petPolicy: "cats-only",
          parkingInfo: "1 assigned parking space included",
          images: [
            {
              id: 1,
              url: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
              isPrimary: true
            },
            {
              id: 2, 
              url: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
              isPrimary: false
            }
          ]
        },
        viewCount: 42,
        applicationCount: 5
      };
      
      return createMockResponse(mockScreeningPage);
    }
    
    // Update property screening page
    if (options?.method === 'PATCH' || options?.method === 'PUT') {
      console.log('MOCK: Updating property screening');
      
      try {
        // Parse the update data
        let updateData: any = {};
        
        if (options.body && typeof options.body === 'string') {
          updateData = JSON.parse(options.body);
          console.log('MOCK: Update data received:', updateData);
        }
        
        // For simplicity in the mock, just return success with the updated data
        const updatedScreeningPage = {
          id: 1,
          landlordId: 2,
          businessName: updateData.businessName || "ABC Property Management",
          contactName: updateData.contactName || "John Smith",
          businessEmail: updateData.businessEmail || "contact@abcproperty.com",
          screeningCriteria: updateData.screeningCriteria || {
            minCreditScore: 650,
            minMonthlyIncome: 3000,
            noEvictions: true,
            cleanRentalHistory: true
          },
          slug: slug,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          propertyDetails: updateData.propertyDetails || {
            address: "123 Main Street",
            unit: "Apt 4B",
            bedrooms: 2,
            bathrooms: 1.5,
            squareFeet: 950,
            rentAmount: 1500,
            availableDate: new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
            description: "Beautiful apartment in downtown with modern amenities.",
            petPolicy: "cats-only",
            parkingInfo: "1 assigned parking space included",
            images: [
              {
                id: 1,
                url: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
                isPrimary: true
              }
            ]
          },
          viewCount: 42,
          applicationCount: 5
        };
        
        // Add to mock data for subsequent requests
        const existingIndex = mockPropertyScreenings.findIndex(p => p.slug === slug);
        if (existingIndex !== -1) {
          mockPropertyScreenings[existingIndex] = updatedScreeningPage;
        } else {
          mockPropertyScreenings.push(updatedScreeningPage);
        }
        
        return createMockResponse(updatedScreeningPage);
      } catch (error) {
        console.error('MOCK: Error updating property screening:', error);
        return createMockResponse({ message: 'Failed to update property screening page' }, 500);
      }
    }
  }
  
  // Handle general screening page
  if (urlStr.includes('/api/screening/general') && (options?.method === 'GET' || !options?.method)) {
    console.log('MOCK: Intercepting general screening request');
    
    // Return a mock general screening page
    return createMockResponse({
      id: 100,
      landlordId: 2,
      businessName: "General Housing Solutions",
      contactName: "Admin User",
      businessEmail: "admin@generalhousing.com",
      screeningCriteria: {
        minCreditScore: 600,
        minMonthlyIncome: 2500,
        noEvictions: true,
        cleanRentalHistory: true
      },
      slug: "general-screening",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 150,
      applicationCount: 35
    });
  }
  
  // Handle properties list request
  if (urlStr.includes('/api/properties') && urlStr === '/api/properties' && (options?.method === 'GET' || !options?.method)) {
    console.log('MOCK: Intercepting properties list request');
    
    // Return a list of properties with screening pages
    return createMockResponse(mockPropertyScreenings.map(screening => ({
      id: screening.id,
      title: screening.propertyDetails?.address || `Property ${screening.id}`,
      address: `${screening.propertyDetails?.address || ''} ${screening.propertyDetails?.unit || ''}`.trim(),
      slug: screening.slug,
      applicationCount: screening.applicationCount,
      viewCount: screening.viewCount,
      isArchived: false
    })));
  }
  
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