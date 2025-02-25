import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { ENV } from "@/constants/env";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn('No authentication token found in localStorage');
    return {};
  }
  console.log('Using authentication token from localStorage');
  return { Authorization: `Bearer ${token}` };
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {
    ...getAuthHeader(),
  };

  console.log(`Making ${method} request to ${url} with auth headers:`, 
    headers.Authorization ? 'Bearer token present' : 'No auth token');

  if (data) {
    headers["Content-Type"] = "application/json";
  }

  const fullUrl = url.startsWith('http') ? url : `${ENV.API_URL}${url}`;

  // MOCK IMPLEMENTATION FOR DEVELOPMENT
  // Store mock properties in localStorage to persist between page refreshes
  const getMockProperties = () => {
    try {
      const stored = localStorage.getItem('mockProperties');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error retrieving mock properties:', e);
      return [];
    }
  };

  const saveMockProperties = (properties: any[]) => {
    try {
      localStorage.setItem('mockProperties', JSON.stringify(properties));
    } catch (e) {
      console.error('Error saving mock properties:', e);
    }
  };

  // Mock property creation endpoint
  if (url === '/api/landlord/properties' && method === 'POST') {
    console.log('MOCK: Intercepting property creation request', data);
    
    // Cast data to any to access properties safely
    const propertyData = data as any;
    
    // Create a mock property response
    const mockProperty = {
      id: Math.floor(Math.random() * 10000),
      landlordId: 1,
      address: propertyData?.address || '123 Mock Street',
      rent: propertyData?.rent || 1500,
      bedrooms: propertyData?.bedrooms || 2,
      bathrooms: propertyData?.bathrooms || 1,
      description: propertyData?.description || 'Mock property description',
      available: true,
      parking: propertyData?.parking || null,
      availableFrom: propertyData?.availableFrom || new Date().toISOString(),
      screeningPageSlug: `property-${Math.floor(Math.random() * 10000)}`,
      requirements: propertyData?.requirements || null,
      viewCount: 0,
      applicationCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save to mock storage
    const properties = getMockProperties();
    properties.push(mockProperty);
    saveMockProperties(properties);
    
    // Return a mock successful response
    return new Response(JSON.stringify(mockProperty), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Mock properties list endpoint
  if (url === '/api/properties' && method === 'GET') {
    console.log('MOCK: Intercepting properties list request');
    
    // Get properties from mock storage
    let properties = getMockProperties();
    
    // If no properties exist, create some sample properties
    if (properties.length === 0) {
      properties = [
        {
          id: 1001,
          landlordId: 1,
          address: '123 Sample Street, San Francisco, CA',
          rent: 2500,
          bedrooms: 2,
          bathrooms: 1,
          description: 'Beautiful apartment in the heart of the city',
          available: true,
          parking: 'Street parking',
          availableFrom: new Date().toISOString(),
          screeningPageSlug: 'sample-property-1001',
          requirements: null,
          viewCount: 45,
          applicationCount: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      saveMockProperties(properties);
    }
    
    // Return a mock successful response
    return new Response(JSON.stringify(properties), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Mock property screening endpoint
  if (url.startsWith('/api/properties/screening/') && method === 'GET') {
    console.log('MOCK: Intercepting property screening request');
    
    // Extract the slug from the URL
    const slug = url.split('/api/properties/screening/')[1];
    
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      console.error('MOCK: Unauthorized access to property screening');
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get properties from mock storage
    const properties = getMockProperties();
    
    // Find the property with the matching slug
    const property = properties.find((p: any) => p.screeningPageSlug === slug);
    
    if (!property) {
      console.error('MOCK: Property not found with slug:', slug);
      return new Response(JSON.stringify({ message: "Property not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Increment view count
    property.viewCount = (property.viewCount || 0) + 1;
    saveMockProperties(properties);
    
    // Return a mock successful response
    return new Response(JSON.stringify(property), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Mock general screening endpoint
  if (url === '/api/screening/general' && method === 'GET') {
    console.log('MOCK: Intercepting general screening request');
    
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      console.error('MOCK: Unauthorized access to general screening');
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get or create general screening data from localStorage
    const getGeneralScreening = () => {
      try {
        const stored = localStorage.getItem('mockGeneralScreening');
        if (stored) return JSON.parse(stored);
        
        // Create default general screening data if none exists
        const defaultScreening = {
          id: 1,
          landlordId: 1,
          slug: generateUniqueSlug('Your Property Management', 1),
          businessName: 'Your Property Management',
          contactName: 'Property Manager',
          businessEmail: 'contact@example.com',
          screeningCriteria: {
            minCreditScore: 650,
            minMonthlyIncome: 3000,
            noEvictions: true,
            cleanRentalHistory: true
          },
          viewCount: 42,
          applicationCount: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true
        };
        
        localStorage.setItem('mockGeneralScreening', JSON.stringify(defaultScreening));
        return defaultScreening;
      } catch (e) {
        console.error('Error retrieving mock general screening:', e);
        return null;
      }
    };
    
    const generalScreening = getGeneralScreening();
    
    if (!generalScreening) {
      console.error('MOCK: General screening data not found');
      return new Response(JSON.stringify({ message: "General screening not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Return a mock successful response
    return new Response(JSON.stringify(generalScreening), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Mock general screening by slug endpoint
  if (url.startsWith('/api/screening/general/') && method === 'GET') {
    console.log('MOCK: Intercepting general screening by slug request');
    
    // Extract the slug from the URL
    const slug = url.split('/api/screening/general/')[1];
    
    // Get general screening data
    const getGeneralScreening = () => {
      try {
        const stored = localStorage.getItem('mockGeneralScreening');
        return stored ? JSON.parse(stored) : null;
      } catch (e) {
        console.error('Error retrieving mock general screening:', e);
        return null;
      }
    };
    
    const generalScreening = getGeneralScreening();
    
    if (!generalScreening || generalScreening.slug !== slug) {
      console.error('MOCK: General screening not found with slug:', slug);
      return new Response(JSON.stringify({ message: "General screening not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Increment view count
    generalScreening.viewCount = (generalScreening.viewCount || 0) + 1;
    localStorage.setItem('mockGeneralScreening', JSON.stringify(generalScreening));
    
    // Return a mock successful response
    return new Response(JSON.stringify(generalScreening), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Mock create screening page endpoint
  if (url === '/api/screening' && method === 'POST') {
    console.log('MOCK: Intercepting create screening page request', data);
    
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      console.error('MOCK: Unauthorized access to create screening');
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Cast data to any to access properties safely
    const screeningData = data as any;
    
    // Create a mock screening page
    const mockScreening = {
      id: 1,
      landlordId: 1,
      businessName: screeningData?.businessName || 'Your Property Management',
      contactName: screeningData?.contactName || 'Property Manager',
      businessEmail: screeningData?.businessEmail || 'contact@example.com',
      screeningCriteria: screeningData?.screeningCriteria || {
        minCreditScore: 650,
        minMonthlyIncome: 3000,
        noEvictions: true,
        cleanRentalHistory: true
      },
      slug: generateUniqueSlug(screeningData?.businessName || 'Your Property Management', 1),
      viewCount: 0,
      applicationCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      url: `/screening/${generateUniqueSlug(screeningData?.businessName || 'Your Property Management', 1)}`
    };
    
    // Save to localStorage
    localStorage.setItem('mockGeneralScreening', JSON.stringify(mockScreening));
    
    // Return a mock successful response
    return new Response(JSON.stringify(mockScreening), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Mock property GET by ID endpoint
  if (url.match(/^\/api\/properties\/\d+$/) && method === 'GET') {
    console.log('MOCK: Intercepting property get by ID request');
    
    // Extract the ID from the URL
    const id = parseInt(url.split('/api/properties/')[1]);
    
    // Get properties from mock storage
    const properties = getMockProperties();
    
    // Find the property with the matching ID
    const property = properties.find((p: any) => p.id === id);
    
    if (!property) {
      console.error('MOCK: Property not found with ID:', id);
      return new Response(JSON.stringify({ message: "Property not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Return a mock successful response
    return new Response(JSON.stringify(property), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Mock property PUT (edit) endpoint
  if (url.match(/^\/api\/properties\/\d+$/) && method === 'PUT') {
    console.log('MOCK: Intercepting property update request', data);
    
    // Extract the ID from the URL
    const id = parseInt(url.split('/api/properties/')[1]);
    
    // Get properties from mock storage
    const properties = getMockProperties();
    
    // Find the index of the property with the matching ID
    const propertyIndex = properties.findIndex((p: any) => p.id === id);
    
    if (propertyIndex === -1) {
      console.error('MOCK: Property not found with ID:', id);
      return new Response(JSON.stringify({ message: "Property not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update the property with the new data
    const updatedProperty = {
      ...properties[propertyIndex],
      ...(data as object),
      updatedAt: new Date().toISOString()
    };
    
    // Save the updated property
    properties[propertyIndex] = updatedProperty;
    saveMockProperties(properties);
    
    // Return a mock successful response
    return new Response(JSON.stringify(updatedProperty), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Mock property PATCH (update) endpoint
  if (url.match(/^\/api\/properties\/\d+$/) && method === 'PATCH') {
    console.log('MOCK: Intercepting property PATCH request', data);
    
    // Extract the ID from the URL
    const id = parseInt(url.split('/api/properties/')[1]);
    
    // Get properties from mock storage
    const properties = getMockProperties();
    
    // Find the index of the property with the matching ID
    const propertyIndex = properties.findIndex((p: any) => p.id === id);
    
    if (propertyIndex === -1) {
      console.error('MOCK: Property not found with ID:', id);
      return new Response(JSON.stringify({ message: "Property not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update the property with the new data
    const updatedProperty = {
      ...properties[propertyIndex],
      ...(data as object),
      updatedAt: new Date().toISOString()
    };
    
    // Save the updated property
    properties[propertyIndex] = updatedProperty;
    saveMockProperties(properties);
    
    console.log('MOCK: Successfully updated property:', updatedProperty);
    
    // Return a mock successful response
    return new Response(JSON.stringify(updatedProperty), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Mock property images endpoint
  if (url.match(/^\/api\/properties\/\d+\/images$/) && method === 'GET') {
    console.log('MOCK: Intercepting property images request');
    
    // Extract the property ID from the URL
    const propertyId = parseInt(url.split('/api/properties/')[1].split('/images')[0]);
    
    // Get mock images from localStorage or create empty array
    const getMockImages = () => {
      try {
        const stored = localStorage.getItem(`mockPropertyImages_${propertyId}`);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.error('Error retrieving mock images:', e);
        return [];
      }
    };
    
    // Return a mock successful response with empty array if no images
    const images = getMockImages();
    return new Response(JSON.stringify(images), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Mock property image upload endpoint
  if (url.match(/^\/api\/properties\/\d+\/images$/) && method === 'POST') {
    console.log('MOCK: Intercepting property image upload request');
    
    // Extract the property ID from the URL
    const propertyId = parseInt(url.split('/api/properties/')[1].split('/images')[0]);
    
    // Create a mock image response
    const mockImage = {
      id: Math.floor(Math.random() * 10000),
      propertyId: propertyId,
      url: 'https://placehold.co/600x400',
      isPrimary: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Get mock images from localStorage
    const getMockImages = () => {
      try {
        const stored = localStorage.getItem(`mockPropertyImages_${propertyId}`);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.error('Error retrieving mock images:', e);
        return [];
      }
    };
    
    // Save mock images to localStorage
    const saveMockImages = (images: any[]) => {
      try {
        localStorage.setItem(`mockPropertyImages_${propertyId}`, JSON.stringify(images));
      } catch (e) {
        console.error('Error saving mock images:', e);
      }
    };
    
    // Add the new image to the mock storage
    const images = getMockImages();
    images.push(mockImage);
    saveMockImages(images);
    
    // Return a mock successful response
    return new Response(JSON.stringify(mockImage), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Mock property amenities endpoint
  if (url.match(/^\/api\/properties\/\d+\/amenities$/) && method === 'GET') {
    console.log('MOCK: Intercepting property amenities request');
    
    // Extract the property ID from the URL
    const propertyId = parseInt(url.split('/api/properties/')[1].split('/amenities')[0]);
    
    // Get mock amenities from localStorage or create empty array
    const getMockAmenities = () => {
      try {
        const stored = localStorage.getItem(`mockPropertyAmenities_${propertyId}`);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.error('Error retrieving mock amenities:', e);
        return [];
      }
    };
    
    // Return a mock successful response with empty array if no amenities
    const amenities = getMockAmenities();
    return new Response(JSON.stringify(amenities), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Mock property amenity creation endpoint
  if (url.match(/^\/api\/properties\/\d+\/amenities$/) && method === 'POST') {
    console.log('MOCK: Intercepting property amenity creation request', data);
    
    // Extract the property ID from the URL
    const propertyId = parseInt(url.split('/api/properties/')[1].split('/amenities')[0]);
    
    // Cast data to any to access properties safely
    const amenityData = data as any;
    
    // Create a mock amenity response
    const mockAmenity = {
      id: Math.floor(Math.random() * 10000),
      propertyId: propertyId,
      amenityType: amenityData?.amenityType || 'wifi',
      description: amenityData?.description || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Get mock amenities from localStorage
    const getMockAmenities = () => {
      try {
        const stored = localStorage.getItem(`mockPropertyAmenities_${propertyId}`);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.error('Error retrieving mock amenities:', e);
        return [];
      }
    };
    
    // Save mock amenities to localStorage
    const saveMockAmenities = (amenities: any[]) => {
      try {
        localStorage.setItem(`mockPropertyAmenities_${propertyId}`, JSON.stringify(amenities));
      } catch (e) {
        console.error('Error saving mock amenities:', e);
      }
    };
    
    // Add the new amenity to the mock storage
    const amenities = getMockAmenities();
    amenities.push(mockAmenity);
    saveMockAmenities(amenities);
    
    // Return a mock successful response
    return new Response(JSON.stringify(mockAmenity), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('Making API request:', { method, url: fullUrl, headers, data });
    const res = await fetch(fullUrl, {
      method,
      headers,
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Response Error:', {
        status: res.status,
        statusText: res.statusText,
        body: errorText
      });
      
      // Enhanced logging for authentication errors
      if (res.status === 401) {
        console.error('Authentication error details:', {
          hasToken: !!headers.Authorization,
          tokenPrefix: headers.Authorization ? headers.Authorization.substring(0, 15) + '...' : 'none',
          endpoint: url
        });
      }
      
      throw new Error(`API Error ${res.status}: ${errorText || res.statusText}`);
    }

    return res;
  } catch (error) {
    console.error('API Request error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url: fullUrl,
      method
    });
    
    // Enhance error handling for network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error detected. This might be a CORS or connectivity issue.');
    }
    
    // Rethrow the error for the caller to handle
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = getAuthHeader();
    const url = queryKey[0] as string;
    const fullUrl = url.startsWith('http') ? url : `${ENV.API_URL}${url}`;
    
    const res = await fetch(fullUrl, { 
      headers,
      credentials: 'include',
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Debug function to help diagnose authentication issues
export function debugAuthToken() {
  const token = localStorage.getItem('token');
  
  console.log('Auth Token Debug Info:', {
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    tokenPrefix: token ? `${token.substring(0, 10)}...` : 'none',
    tokenSuffix: token ? `...${token.substring(token.length - 10)}` : 'none',
  });
  
  if (token) {
    try {
      // Try to decode the JWT payload (middle part)
      const payload = token.split('.')[1];
      if (payload) {
        const decodedPayload = JSON.parse(atob(payload));
        const expiration = decodedPayload.exp ? new Date(decodedPayload.exp * 1000) : 'No expiration';
        const isExpired = decodedPayload.exp ? Date.now() > decodedPayload.exp * 1000 : false;
        
        console.log('Token payload:', {
          userId: decodedPayload.id || decodedPayload.userId || decodedPayload.sub,
          expiration,
          isExpired,
          issuedAt: decodedPayload.iat ? new Date(decodedPayload.iat * 1000) : 'Unknown',
          timeRemaining: decodedPayload.exp ? 
            `${Math.floor((decodedPayload.exp * 1000 - Date.now()) / 1000 / 60)} minutes` : 
            'Unknown'
        });
      }
    } catch (e) {
      console.error('Error decoding token:', e);
    }
  }
  
  return { hasToken: !!token };
}

// Helper function to generate a unique slug based on business name and landlord ID
function generateUniqueSlug(businessName: string, landlordId: number): string {
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