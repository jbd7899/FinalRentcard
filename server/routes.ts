import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, requireAuth } from "./auth";
import { storage } from "./storage";
import { insertPropertySchema, insertInterestSchema } from "@shared/schema";
import { properties, interests, propertyImages, propertyAmenities, Interest } from "@shared/schema";
import { eq } from "drizzle-orm";
import { documentUpload, propertyImageUpload, deleteCloudinaryFile, getPublicIdFromUrl } from "./cloudinary";
import { db } from "./db";
import { sendReferenceVerificationEmail, verifyToken } from "./email";

// Standardized error handler for consistent API responses
function handleRouteError(error: unknown, res: any, operation: string): void {
  console.error(`Error in ${operation}:`, error);
  
  if (error instanceof Error) {
    if (error.message.includes('Unauthorized')) {
      return res.status(401).json({ message: error.message });
    }
    if (error.message.includes('Forbidden')) {
      return res.status(403).json({ message: error.message });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
  }
  
  // Default to 500 for unexpected errors
  res.status(500).json({ 
    message: `Server error in ${operation}`,
    error: error instanceof Error ? error.message : "Unknown error"
  });
}

// Authorization helper functions
async function assertTenantOwnership(req: any, tenantId: number): Promise<void> {
  if (!req.user?.id) {
    throw new Error("Unauthorized: No user session");
  }
  
  const tenantProfile = await storage.getTenantProfile(req.user.id);
  if (!tenantProfile || tenantProfile.id !== tenantId) {
    throw new Error("Forbidden: Access denied to this tenant resource");
  }
}

async function assertLandlordOwnership(req: any, landlordId: number): Promise<void> {
  if (!req.user?.id) {
    throw new Error("Unauthorized: No user session");
  }
  
  const landlordProfile = await storage.getLandlordProfile(req.user.id);
  if (!landlordProfile || landlordProfile.id !== landlordId) {
    throw new Error("Forbidden: Access denied to this landlord resource");
  }
}

async function assertReferenceOwnership(req: any, referenceId: number): Promise<void> {
  if (!req.user?.id) {
    throw new Error("Unauthorized: No user session");
  }
  
  const reference = await storage.getTenantReferenceById(referenceId);
  if (!reference) {
    throw new Error("Reference not found");
  }
  
  const tenantProfile = await storage.getTenantProfile(req.user.id);
  if (!tenantProfile || !reference.tenantId || tenantProfile.id !== reference.tenantId) {
    throw new Error("Forbidden: Access denied to this reference");
  }
}

async function assertDocumentOwnership(req: any, documentId: number): Promise<void> {
  if (!req.user?.id) {
    throw new Error("Unauthorized: No user session");
  }
  
  const document = await storage.getTenantDocumentById(documentId);
  if (!document) {
    throw new Error("Document not found");
  }
  
  const tenantProfile = await storage.getTenantProfile(req.user.id);
  if (!tenantProfile || !document.tenantId || tenantProfile.id !== document.tenantId) {
    throw new Error("Forbidden: Access denied to this document");
  }
}

async function assertPropertyOwnership(req: any, propertyId: number): Promise<void> {
  if (!req.user?.id) {
    throw new Error("Unauthorized: No user session");
  }
  
  const property = await storage.getProperty(propertyId);
  if (!property) {
    throw new Error("Property not found");
  }
  
  const landlordProfile = await storage.getLandlordProfile(req.user.id);
  if (!landlordProfile || landlordProfile.id !== property.landlordId) {
    throw new Error("Forbidden: Access denied to this property");
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Note: requireAuth middleware imported from auth.ts handles both session and JWT authentication

  // Profile routes
  app.get("/api/profile/tenant/:userId", requireAuth, async (req, res) => {
    try {
      const requestedUserId = parseInt(req.params.userId);
      
      // Only allow users to access their own profile
      if (req.user?.id !== requestedUserId) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }
      
      const profile = await storage.getTenantProfile(requestedUserId);
      if (!profile) return res.status(404).json({ message: "Profile not found" });
      res.json(profile);
    } catch (error) {
      handleRouteError(error, res, 'tenant profile endpoint');
    }
  });

  // Add endpoint for current user's tenant profile
  app.get("/api/tenant/profile", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        console.error('Unauthorized access to tenant profile: No user ID in request');
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      console.log(`Fetching tenant profile for user ID: ${req.user.id}`);
      const profile = await storage.getTenantProfile(req.user.id);
      
      if (!profile) {
        console.log(`No tenant profile found for user ID: ${req.user.id}`);
        return res.status(404).json({ message: "Profile not found" });
      }
      
      console.log(`Successfully retrieved tenant profile for user ID: ${req.user.id}`);
      res.json(profile);
    } catch (error) {
      handleRouteError(error, res, '/api/tenant/profile endpoint');
    }
  });

  // Add endpoint for specific tenant profile (with authorization check)
  app.get("/api/tenant/profile/:tenantId", requireAuth, async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      
      if (isNaN(tenantId)) {
        console.error(`Invalid tenant ID format: ${req.params.tenantId}`);
        return res.status(400).json({ message: "Invalid tenant ID format" });
      }
      
      // Verify ownership - only allow access to own tenant profile
      await assertTenantOwnership(req, tenantId);
      
      // After successful ownership assertion, req.user is guaranteed to exist
      if (!req.user?.id) {
        throw new Error("Unexpected: User session lost after ownership verification");
      }
      
      console.log(`Fetching tenant profile for user ID: ${req.user.id} (verified tenant ID: ${tenantId})`);
      const profile = await storage.getTenantProfile(req.user.id);
      
      if (!profile) {
        console.log(`No tenant profile found for tenant ID: ${tenantId}`);
        return res.status(404).json({ message: "Profile not found" });
      }
      
      console.log(`Successfully retrieved tenant profile for tenant ID: ${tenantId}`);
      res.json(profile);
    } catch (error) {
      console.error(`Error in /api/tenant/profile/:tenantId endpoint for ID ${req.params.tenantId}:`, error);
      
      if (error instanceof Error && error.message.includes('Forbidden')) {
        return res.status(403).json({ message: error.message });
      }
      
      res.status(500).json({ 
        message: "Server error while fetching tenant profile",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/profile/tenant", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Ensure the profile is created for the authenticated user
      const profileData = { ...req.body, userId: req.user.id };
      const profile = await storage.createTenantProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      handleRouteError(error, res, 'creating tenant profile');
    }
  });

  app.get("/api/profile/landlord/:userId", requireAuth, async (req, res) => {
    try {
      const requestedUserId = parseInt(req.params.userId);
      
      // Only allow users to access their own profile
      if (req.user?.id !== requestedUserId) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }
      
      const profile = await storage.getLandlordProfile(requestedUserId);
      if (!profile) return res.status(404).json({ message: "Profile not found" });
      res.json(profile);
    } catch (error) {
      handleRouteError(error, res, 'landlord profile endpoint');
    }
  });

  app.post("/api/profile/landlord", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Ensure the profile is created for the authenticated user
      const profileData = { ...req.body, userId: req.user.id };
      const profile = await storage.createLandlordProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      handleRouteError(error, res, 'creating landlord profile');
    }
  });

  // Property routes
  app.get("/api/properties", async (req, res) => {
    try {
      const landlordId = req.query.landlordId ? parseInt(req.query.landlordId as string) : undefined;
      const propertiesData = await storage.getProperties(landlordId);

      // Get application counts for each property
      const applicationCounts = await Promise.all(
        propertiesData.map(async (property) => {
          const propertyInterests = await storage.getInterests(undefined, property.id);
          return {
            propertyId: property.id,
            count: propertyInterests.length
          };
        })
      );

      // Combine property data with application counts
      const propertiesWithCounts = propertiesData.map(property => ({
        ...property,
        applicationCount: applicationCounts.find(count => count.propertyId === property.id)?.count || 0
      }));

      res.json(propertiesWithCounts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching properties", error });
    }
  });

  // New route to get property by screening page slug
  app.get("/api/properties/screening/:slug", async (req, res) => {
    try {
      const property = await storage.getPropertyBySlug(req.params.slug);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Increment view count
      await storage.incrementPropertyViewCount(property.id);

      // Get updated property with new view count
      const updatedProperty = await storage.getPropertyBySlug(req.params.slug);
      
      // Get property images
      const images = await storage.getPropertyImages(property.id);
      
      // Get property amenities
      const amenities = await storage.getPropertyAmenities(property.id);
      
      // Return property with images and amenities
      res.json({
        ...updatedProperty,
        images,
        amenities
      });
    } catch (error) {
      console.error('Error fetching property by slug:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/landlord/properties", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get the landlord profile
      const landlordProfile = await storage.getLandlordProfile(req.user.id);
      if (!landlordProfile) {
        return res.status(400).json({ message: "Landlord profile not found" });
      }

      // Create the property with required fields
      const property = await storage.createProperty({
        landlordId: landlordProfile.id,
        address: req.body.address,
        rent: req.body.rent,
        bedrooms: req.body.bedrooms,
        bathrooms: req.body.bathrooms,
        description: req.body.description || null,
        available: req.body.available || true,
        parking: req.body.parking || null,
        availableFrom: req.body.availableFrom ? new Date(req.body.availableFrom) : null,
        screeningPageSlug: req.body.screeningPageSlug || null,
        requirements: req.body.requirements || null,
        viewCount: 0,
        isArchived: false
      });

      res.status(201).json(property);
    } catch (error) {
      res.status(400).json({ message: "Invalid property data", error });
    }
  });

  // Property Images routes
  app.get("/api/properties/:propertyId/images", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const images = await storage.getPropertyImages(propertyId);
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Error fetching property images", error });
    }
  });

  app.post("/api/properties/:propertyId/images", requireAuth, propertyImageUpload.single('image'), async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const propertyId = parseInt(req.params.propertyId);
      
      // Verify property ownership
      await assertPropertyOwnership(req, propertyId);
      
      // Check if this is the first image for the property (make it primary)
      const existingImages = await storage.getPropertyImages(propertyId);
      const isPrimary = existingImages.length === 0;

      const newImage = await storage.createPropertyImage({
        propertyId,
        imageUrl: req.file.path,
        isPrimary
      });

      res.status(201).json(newImage);
    } catch (error) {
      console.error('Error uploading property image:', error);
      
      if (error instanceof Error && error.message.includes('Forbidden')) {
        return res.status(403).json({ message: error.message });
      }
      
      res.status(400).json({ message: "Error uploading property image", error });
    }
  });

  app.put("/api/properties/images/:imageId/primary", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const imageId = parseInt(req.params.imageId);
      
      // Get the image to verify property ownership
      const image = await storage.getPropertyImageById(imageId);
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      // Verify property ownership
      if (!image.propertyId) {
        return res.status(400).json({ message: "Invalid image: missing property reference" });
      }
      await assertPropertyOwnership(req, image.propertyId);
      
      const updatedImage = await storage.setPrimaryPropertyImage(imageId);
      
      res.json(updatedImage);
    } catch (error) {
      console.error('Error setting primary image:', error);
      
      if (error instanceof Error && error.message.includes('Forbidden')) {
        return res.status(403).json({ message: error.message });
      }
      
      res.status(400).json({ message: "Error setting primary image", error });
    }
  });

  app.delete("/api/properties/images/:imageId", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const imageId = parseInt(req.params.imageId);
      
      // Get the image to delete
      const image = await storage.getPropertyImageById(imageId);
      
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      // Verify property ownership
      if (!image.propertyId) {
        return res.status(400).json({ message: "Invalid image: missing property reference" });
      }
      await assertPropertyOwnership(req, image.propertyId);
      
      // Delete from Cloudinary
      const publicId = getPublicIdFromUrl(image.imageUrl);
      await deleteCloudinaryFile(publicId);
      
      // Delete from database
      await storage.deletePropertyImage(imageId);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting property image:', error);
      
      if (error instanceof Error && error.message.includes('Forbidden')) {
        return res.status(403).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Error deleting property image", error });
    }
  });

  // Property Amenities routes
  app.get("/api/properties/:propertyId/amenities", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const amenities = await storage.getPropertyAmenities(propertyId);
      res.json(amenities);
    } catch (error) {
      res.status(500).json({ message: "Error fetching property amenities", error });
    }
  });

  app.post("/api/properties/:propertyId/amenities", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const propertyId = parseInt(req.params.propertyId);
      
      // Verify property ownership
      await assertPropertyOwnership(req, propertyId);
      
      const { amenityType, description } = req.body;
      
      const newAmenity = await storage.createPropertyAmenity({
        propertyId,
        amenityType,
        description: description || null
      });

      res.status(201).json(newAmenity);
    } catch (error) {
      console.error('Error adding property amenity:', error);
      
      if (error instanceof Error && error.message.includes('Forbidden')) {
        return res.status(403).json({ message: error.message });
      }
      
      res.status(400).json({ message: "Error adding property amenity", error });
    }
  });

  app.delete("/api/properties/amenities/:amenityId", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const amenityId = parseInt(req.params.amenityId);
      
      // Get the amenity to verify property ownership
      const amenities = await storage.getPropertyAmenities(0); // Get all amenities
      const amenity = amenities.find(a => a.id === amenityId);
      
      if (!amenity) {
        return res.status(404).json({ message: "Amenity not found" });
      }
      
      // Verify property ownership
      if (!amenity.propertyId) {
        return res.status(400).json({ message: "Invalid amenity: missing property reference" });
      }
      await assertPropertyOwnership(req, amenity.propertyId);
      
      // Delete from database
      await storage.deletePropertyAmenity(amenityId);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting property amenity:', error);
      
      if (error instanceof Error && error.message.includes('Forbidden')) {
        return res.status(403).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Error deleting property amenity", error });
    }
  });

  // Application routes
  app.get("/api/applications", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { propertyId } = req.query;
      
      // Get applications based on user type
      const tenantProfile = await storage.getTenantProfile(req.user.id);
      const landlordProfile = await storage.getLandlordProfile(req.user.id);
      
      let applications;
      
      if (tenantProfile) {
        // Tenants can only see their own interests
        applications = await storage.getInterests(
          tenantProfile.id,
          propertyId ? parseInt(propertyId as string) : undefined
        );
      } else if (landlordProfile) {
        // Landlords can see applications for their properties
        if (propertyId) {
          const property = await storage.getProperty(parseInt(propertyId as string));
          if (!property || property.landlordId !== landlordProfile.id) {
            return res.status(403).json({ message: "Access denied to property applications" });
          }
        }
        applications = await storage.getInterests(
          undefined,
          propertyId ? parseInt(propertyId as string) : undefined
        );
        // Filter to only applications for landlord's properties
        if (!propertyId) {
          const landlordProperties = await storage.getProperties(landlordProfile.id);
          const landlordPropertyIds = landlordProperties.map(p => p.id);
          applications = applications.filter((app: Interest) => app.propertyId !== null && landlordPropertyIds.includes(app.propertyId));
        }
      } else {
        return res.status(403).json({ message: "User profile not found" });
      }
      
      res.json(applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({ message: "Error fetching applications", error });
    }
  });

  app.post("/api/applications", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get the tenant profile
      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile) {
        return res.status(400).json({ message: "Tenant profile not found" });
      }

      // Validate the user has a RentCard
      const rentCard = await storage.getRentCard(req.user.id);
      if (!rentCard) {
        return res.status(400).json({ message: "Please create your RentCard first" });
      }

      // Validate the propertyId
      const propertyId = Number(req.body.propertyId);
      if (!propertyId || isNaN(propertyId)) {
        return res.status(400).json({ message: "Valid property ID is required" });
      }

      // Verify the property exists
      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(400).json({ message: "Property not found" });
      }

      // Get the landlord ID from the property
      const landlordId = property.landlordId;
      if (!landlordId) {
        return res.status(400).json({ message: "Property has no associated landlord" });
      }

      // Get tenant contact info from user and tenant profile
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // Create the interest
      const application = await storage.createInterest({
        status: "new",
        propertyId,
        tenantId: tenantProfile.id,
        landlordId,
        contactInfo: {
          name: `${rentCard.firstName} ${rentCard.lastName}`,
          email: user.email,
          phone: user.phone,
          preferredContact: 'email'
        },
        message: `Interest in property at ${property.address}`
      });

      res.status(201).json(application);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to create application",
        error 
      });
    }
  });

  // Interest routes
  app.post("/api/interests/:id/contact", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const interestId = parseInt(req.params.id);
      if (isNaN(interestId)) {
        return res.status(400).json({ message: "Invalid interest ID" });
      }

      // Verify landlord ownership via interest -> landlord relationship
      const landlordProfile = await storage.getLandlordProfile(req.user.id);
      if (!landlordProfile) {
        return res.status(403).json({ message: "Only landlords can manage interests" });
      }

      const updatedInterest = await storage.updateInterestStatus(interestId, 'contacted');
      res.json(updatedInterest);
    } catch (error) {
      handleRouteError(error, res, 'contact interest');
    }
  });

  app.post("/api/interests/:id/archive", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const interestId = parseInt(req.params.id);
      if (isNaN(interestId)) {
        return res.status(400).json({ message: "Invalid interest ID" });
      }

      // Verify landlord ownership via interest -> landlord relationship
      const landlordProfile = await storage.getLandlordProfile(req.user.id);
      if (!landlordProfile) {
        return res.status(403).json({ message: "Only landlords can manage interests" });
      }

      const updatedInterest = await storage.updateInterestStatus(interestId, 'archived');
      res.json(updatedInterest);
    } catch (error) {
      handleRouteError(error, res, 'archive interest');
    }
  });

  // RentCard routes
  app.get("/api/tenant/rentcard", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const rentCard = await storage.getRentCard(req.user.id);
      if (!rentCard) {
        return res.status(404).json({ message: "RentCard not found" });
      }
      res.json(rentCard);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch RentCard",
        error 
      });
    }
  });

  app.patch("/api/applications/:id/status", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const applicationId = parseInt(req.params.id);
      
      // Get the application to verify ownership
      const applications = await storage.getInterests();
      const application = applications.find((app: Interest) => app.id === applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Only landlords who own the property can update application status
      const landlordProfile = await storage.getLandlordProfile(req.user.id);
      if (!landlordProfile) {
        return res.status(403).json({ message: "Only landlords can update application status" });
      }
      
      if (!application.propertyId) {
        return res.status(400).json({ message: "Invalid application: missing property reference" });
      }
      
      const property = await storage.getProperty(application.propertyId);
      if (!property || property.landlordId !== landlordProfile.id) {
        return res.status(403).json({ message: "Access denied to this application" });
      }
      
      const updatedApplication = await storage.updateInterestStatus(
        applicationId,
        req.body.status
      );
      res.json(updatedApplication);
    } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json({ message: "Error updating application status", error });
    }
  });

  // Stats routes with dummy data
  app.get("/api/stats/views", async (req, res) => {
    try {
      const timeframe = req.query.timeframe as 'today' | '7days' | '30days';
      const total = 124; // Dummy total
      const now = new Date();
      const data = [];

      if (timeframe === 'today') {
        // Generate hourly data points for today
        for (let i = 0; i < 24; i++) {
          data.push({
            date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), i).toISOString(),
            count: Math.floor(Math.random() * 8) + 2 // Random count between 2-10
          });
        }
      } else if (timeframe === '7days') {
        // Generate daily data points for last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          data.push({
            date: date.toISOString(),
            count: Math.floor(Math.random() * 15) + 10 // Random count between 10-25
          });
        }
      } else {
        // Generate daily data points for last 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          data.push({
            date: date.toISOString(),
            count: Math.floor(Math.random() * 5) + 2 // Random count between 2-7
          });
        }
      }

      res.json({ data, total });
    } catch (error) {
      res.status(500).json({ message: "Error fetching view statistics", error });
    }
  });

  app.get("/api/stats/submissions", async (req, res) => {
    try {
      const timeframe = req.query.timeframe as 'today' | '7days' | '30days';
      const total = 18; // Dummy total
      const now = new Date();
      const data = [];

      if (timeframe === 'today') {
        // Generate hourly data points for today
        for (let i = 0; i < 24; i++) {
          data.push({
            date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), i).toISOString(),
            count: Math.floor(Math.random() * 2) // Random count between 0-1
          });
        }
      } else if (timeframe === '7days') {
        // Generate daily data points for last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          data.push({
            date: date.toISOString(),
            count: Math.floor(Math.random() * 3) + 1 // Random count between 1-3
          });
        }
      } else {
        // Generate daily data points for last 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          data.push({
            date: date.toISOString(),
            count: Math.floor(Math.random() * 2) // Random count between 0-1
          });
        }
      }

      res.json({ data, total });
    } catch (error) {
      res.status(500).json({ message: "Error fetching submission statistics", error });
    }
  });

  // Document management routes
  app.get("/api/documents/:tenantId", requireAuth, async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      
      // Verify ownership - only allow access to own documents
      await assertTenantOwnership(req, tenantId);
      
      const documents = await storage.getTenantDocuments(tenantId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching tenant documents:", error);
      
      if (error instanceof Error && error.message.includes('Forbidden')) {
        return res.status(403).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents/upload", requireAuth, documentUpload.single("document"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { documentType } = req.body;
      
      if (!documentType) {
        return res.status(400).json({ message: "Missing required field: documentType" });
      }
      
      // Get the authenticated user's tenant profile
      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile) {
        return res.status(400).json({ message: "Tenant profile not found" });
      }

      const document = await storage.createTenantDocument({
        tenantId: tenantProfile.id,
        documentType,
        documentUrl: (req.file as any).path,
      });

      res.status(201).json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  app.delete("/api/documents/:id", requireAuth, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      
      // Verify ownership before deleting
      await assertDocumentOwnership(req, documentId);
      
      // Get the document to find the URL
      const documents = await storage.getTenantDocumentById(documentId);
      if (!documents) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Delete from Cloudinary
      const publicId = getPublicIdFromUrl(documents.documentUrl);
      await deleteCloudinaryFile(publicId);
      
      // Delete from database
      await storage.deleteTenantDocument(documentId);
      
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      
      if (error instanceof Error && error.message.includes('Forbidden')) {
        return res.status(403).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  app.put("/api/documents/:id/verify", requireAuth, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Verify the user is a landlord (only landlords should verify documents)
      const landlordProfile = await storage.getLandlordProfile(req.user.id);
      if (!landlordProfile) {
        return res.status(403).json({ message: "Only landlords can verify documents" });
      }
      
      const document = await storage.verifyTenantDocument(documentId, landlordProfile.id);
      res.json(document);
    } catch (error) {
      console.error("Error verifying document:", error);
      
      if (error instanceof Error && error.message.includes('Forbidden')) {
        return res.status(403).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Failed to verify document" });
    }
  });

  // Tenant References routes
  app.get("/api/tenant/references/:tenantId", requireAuth, async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      
      // Verify ownership - only allow access to own references
      await assertTenantOwnership(req, tenantId);
      
      const references = await storage.getTenantReferences(tenantId);
      res.json(references);
    } catch (error) {
      console.error("Error fetching tenant references:", error);
      
      if (error instanceof Error && error.message.includes('Forbidden')) {
        return res.status(403).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Failed to fetch tenant references" });
    }
  });

  app.get("/api/tenant/references/detail/:id", requireAuth, async (req, res) => {
    try {
      const referenceId = parseInt(req.params.id);
      
      // Verify ownership - only allow access to own references
      await assertReferenceOwnership(req, referenceId);
      
      const reference = await storage.getTenantReferenceById(referenceId);
      
      if (!reference) {
        return res.status(404).json({ message: "Reference not found" });
      }
      
      res.json(reference);
    } catch (error) {
      console.error("Error fetching tenant reference:", error);
      
      if (error instanceof Error && error.message.includes('Forbidden')) {
        return res.status(403).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Failed to fetch tenant reference" });
    }
  });

  app.post("/api/tenant/references", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Get the authenticated user's tenant profile
      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile) {
        return res.status(400).json({ message: "Tenant profile not found" });
      }
      
      // Bind the reference to the authenticated user's tenant profile
      const referenceData = { ...req.body, tenantId: tenantProfile.id };
      const reference = await storage.createTenantReference(referenceData);
      res.status(201).json(reference);
    } catch (error) {
      console.error("Error creating tenant reference:", error);
      res.status(500).json({ message: "Failed to create tenant reference" });
    }
  });

  app.put("/api/tenant/references/:id", requireAuth, async (req, res) => {
    try {
      const referenceId = parseInt(req.params.id);
      
      // Verify ownership before updating
      await assertReferenceOwnership(req, referenceId);
      
      const reference = await storage.updateTenantReference(referenceId, req.body);
      res.json(reference);
    } catch (error) {
      console.error("Error updating tenant reference:", error);
      
      if (error instanceof Error && error.message.includes('Forbidden')) {
        return res.status(403).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Failed to update tenant reference" });
    }
  });

  app.delete("/api/tenant/references/:id", requireAuth, async (req, res) => {
    try {
      const referenceId = parseInt(req.params.id);
      
      // Verify ownership before deleting
      await assertReferenceOwnership(req, referenceId);
      
      await storage.deleteTenantReference(referenceId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting tenant reference:", error);
      
      if (error instanceof Error && error.message.includes('Forbidden')) {
        return res.status(403).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Failed to delete tenant reference" });
    }
  });

  app.post("/api/tenant/references/:id/send-verification", requireAuth, async (req, res) => {
    try {
      const referenceId = parseInt(req.params.id);
      
      // Verify ownership before sending verification
      await assertReferenceOwnership(req, referenceId);
      
      const reference = await storage.getTenantReferenceById(referenceId);
      
      if (!reference) {
        return res.status(404).json({ message: "Reference not found" });
      }
      
      // Get tenant profile to include in the email
      const tenantId = reference.tenantId;
      if (tenantId === null) {
        return res.status(400).json({ message: "Reference has no associated tenant" });
      }
      
      const tenantProfile = await storage.getTenantProfile(tenantId);
      
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }
      
      // Get user to get the tenant's email
      const userId = tenantProfile.userId;
      if (userId === null) {
        return res.status(400).json({ message: "Tenant profile has no associated user" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Generate the base URL for the verification link
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      // Get tenant name from user email as fallback
      // Note: In a real implementation, we would get the name from the tenant profile
      // but for now we'll use the email as the tenant identifier
      const tenantName = user.email;
      
      // Send the verification email
      const { success, info, error } = await sendReferenceVerificationEmail(
        reference,
        tenantName,
        baseUrl
      );
      
      if (!success) {
        return res.status(500).json({ 
          message: "Failed to send verification email", 
          error 
        });
      }
      
      // Update the reference to indicate that a verification email was sent
      const updatedReference = await storage.updateTenantReference(referenceId, {
        notes: reference.notes 
          ? `${reference.notes}\nVerification email sent on ${new Date().toISOString()}` 
          : `Verification email sent on ${new Date().toISOString()}`
      });
      
      res.json({ 
        message: "Verification email sent successfully", 
        reference: updatedReference,
        emailInfo: process.env.NODE_ENV === 'development' ? info : undefined
      });
    } catch (error) {
      console.error("Error sending verification email:", error);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  });

  // Landlord view of tenant references
  app.get("/api/landlord/tenant/:tenantId/references", requireAuth, async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const references = await storage.getTenantReferences(tenantId);
      res.json(references);
    } catch (error) {
      console.error("Error fetching tenant references for landlord:", error);
      res.status(500).json({ message: "Failed to fetch tenant references" });
    }
  });

  // Tenant References Verification Routes
  app.get('/api/tenant/references/verify/validate/:token', async (req, res) => {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({ 
          error: 'Verification token is required',
          code: 'TOKEN_REQUIRED'
        });
      }
      
      // Verify the token and get the reference ID
      const tokenData = verifyToken(token);
      
      if (!tokenData) {
        return res.status(400).json({ 
          error: 'Invalid or expired verification link',
          code: 'INVALID_TOKEN',
          message: 'The verification link is either invalid or has expired. Please contact the tenant for a new verification link.'
        });
      }
      
      const { referenceId } = tokenData;
      
      // Get the reference
      const reference = await storage.getTenantReferenceById(referenceId);
      
      if (!reference) {
        return res.status(404).json({ 
          error: 'Reference not found',
          code: 'REFERENCE_NOT_FOUND',
          message: 'The reference information could not be found. Please contact the tenant for assistance.'
        });
      }
      
      // Get tenant information for the response
      let tenantName = 'the tenant';
      if (reference.tenantId) {
        try {
          const tenantProfile = await storage.getTenantProfile(reference.tenantId);
          
          if (tenantProfile && tenantProfile.userId) {
            const user = await storage.getUser(tenantProfile.userId);
            
            if (user) {
              tenantName = user.email;
            }
          }
        } catch (profileError) {
          console.error('Error fetching tenant profile:', profileError);
          // Continue with default tenant name
        }
      }
      
      // Return reference data with tenant name and verification status
      return res.json({
        ...reference,
        tenantName,
        tokenValid: true,
        tokenExpiry: new Date(tokenData.timestamp + 24 * 60 * 60 * 1000).toISOString()
      });
    } catch (error) {
      console.error('Error validating verification token:', error);
      return res.status(500).json({ 
        error: 'Failed to validate verification token',
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred while validating your verification link. Please try again later.'
      });
    }
  });

  app.post('/api/tenant/references/verify/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const { rating, comments } = req.body;
      
      if (!token) {
        return res.status(400).json({ 
          error: 'Verification token is required',
          code: 'TOKEN_REQUIRED'
        });
      }
      
      if (!rating) {
        return res.status(400).json({ 
          error: 'Rating is required',
          code: 'RATING_REQUIRED'
        });
      }
      
      if (!comments || comments.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Comments are required',
          code: 'COMMENTS_REQUIRED'
        });
      }
      
      // Verify the token and get the reference ID
      const tokenData = verifyToken(token);
      
      if (!tokenData) {
        return res.status(400).json({ 
          error: 'Invalid or expired verification token',
          code: 'INVALID_TOKEN',
          message: 'The verification link is either invalid or has expired. Please contact the tenant for a new verification link.'
        });
      }
      
      const { referenceId } = tokenData;
      
      // Get the reference
      const reference = await storage.getTenantReferenceById(referenceId);
      
      if (!reference) {
        return res.status(404).json({ 
          error: 'Reference not found',
          code: 'REFERENCE_NOT_FOUND',
          message: 'The reference information could not be found. Please contact the tenant for assistance.'
        });
      }
      
      // Check if already verified
      if (reference.isVerified) {
        return res.status(400).json({ 
          error: 'Reference has already been verified',
          code: 'ALREADY_VERIFIED',
          message: 'This reference has already been verified. Thank you for your participation.'
        });
      }
      
      // Update the reference with verification data
      const updatedReference = await storage.verifyTenantReference(referenceId);
      
      if (!updatedReference) {
        throw new Error('Failed to update reference verification status');
      }
      
      // Update the notes separately
      const notesUpdate = `${reference.notes || ''}\n\nVerified on ${new Date().toISOString()}\nRating: ${rating}\nComments: ${comments}`;
      await storage.updateTenantReference(referenceId, { notes: notesUpdate });
      
      // Get tenant information for the response
      let tenantName = 'the tenant';
      if (reference.tenantId) {
        try {
          const tenantProfile = await storage.getTenantProfile(reference.tenantId);
          
          if (tenantProfile && tenantProfile.userId) {
            const user = await storage.getUser(tenantProfile.userId);
            
            if (user) {
              tenantName = user.email;
            }
          }
        } catch (profileError) {
          console.error('Error fetching tenant profile:', profileError);
          // Continue with default tenant name
        }
      }
      
      return res.json({ 
        message: 'Reference verified successfully', 
        reference: updatedReference,
        tenantName,
        verificationDate: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error verifying reference:', error);
      return res.status(500).json({ 
        error: 'Failed to verify reference',
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred while verifying your reference. Please try again later.'
      });
    }
  });

  // Add endpoint to update a property
  app.patch("/api/properties/:id", requireAuth, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      
      // Check if the property exists
      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Check if the user is the landlord of this property
      if (req.user?.userType !== 'landlord') {
        return res.status(403).json({ message: "Only landlords can update properties" });
      }
      
      // Get the landlord profile
      const landlordProfile = await storage.getLandlordProfile(req.user.id);
      if (!landlordProfile || property.landlordId !== landlordProfile.id) {
        return res.status(403).json({ message: "You can only update your own properties" });
      }
      
      // Update the property
      const updatedProperty = await storage.updateProperty(propertyId, req.body);
      
      res.json(updatedProperty);
    } catch (error) {
      console.error('Error updating property:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}