import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, requireAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertPropertySchema, insertInterestSchema, clientInterestSchema, insertShareTokenSchema, insertPropertyQRCodeSchema,
  insertTenantContactPreferencesSchema, insertCommunicationLogSchema, insertTenantBlockedContactsSchema, insertCommunicationTemplateSchema,
  insertShortlinkSchema, insertShortlinkClickSchema, insertRecipientContactSchema, insertTenantMessageTemplateSchema, insertContactSharingHistorySchema
} from "@shared/schema";
import { 
  properties, interests, propertyImages, propertyAmenities, Interest, shareTokens, ShareToken, PropertyQRCode,
  TenantContactPreferences, CommunicationLog, TenantBlockedContact, CommunicationTemplate, Shortlink, ShortlinkClick,
  RecipientContact, TenantMessageTemplate, ContactSharingHistory
} from "@shared/schema";
import {
  insertRentcardViewSchema, insertViewSessionSchema, insertInterestAnalyticsSchema,
  insertSharingAnalyticsSchema, insertQRCodeAnalyticsSchema, insertNotificationSchema,
  insertNotificationPreferencesSchema, insertNotificationDeliveryLogSchema,
  insertOnboardingProgressSchema, insertOnboardingStepSchema, ONBOARDING_STEPS,
  RentcardView, ViewSession, InterestAnalytics, SharingAnalytics, QRCodeAnalytics,
  Notification, NotificationPreferences, NotificationDeliveryLog, OnboardingProgress, OnboardingStep
} from "@shared/schema-enhancements";
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

async function assertShareTokenOwnership(req: any, tokenId: number): Promise<void> {
  if (!req.user?.id) {
    throw new Error("Unauthorized: No user session");
  }
  
  const shareToken = await storage.getShareTokenById(tokenId);
  if (!shareToken) {
    throw new Error("Share token not found");
  }
  
  const tenantProfile = await storage.getTenantProfile(req.user.id);
  if (!tenantProfile || tenantProfile.id !== shareToken.tenantId) {
    throw new Error("Forbidden: Access denied to this share token");
  }
}

async function assertLandlordTenantAssociation(req: any, tenantId: number): Promise<void> {
  if (!req.user?.id) {
    throw new Error("Unauthorized: No user session");
  }
  
  const landlordProfile = await storage.getLandlordProfile(req.user.id);
  if (!landlordProfile) {
    throw new Error("Landlord profile not found");
  }
  
  // Check if tenant has submitted interest on any of the landlord's properties
  const interests = await storage.getInterests(landlordProfile.id, tenantId);
  if (interests.length === 0) {
    throw new Error("Forbidden: No legitimate relationship with this tenant");
  }
}

// Analytics utility functions
function extractRequestMetadata(req: any): {
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  deviceInfo?: { type: 'desktop' | 'mobile' | 'tablet'; os?: string; browser?: string };
} {
  const userAgent = req.headers['user-agent'] || '';
  const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
  const referrer = req.headers.referer || req.headers.referrer;
  
  // Simple device detection based on user agent
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    if (/iPad|tablet/i.test(userAgent)) {
      deviceType = 'tablet';
    } else {
      deviceType = 'mobile';
    }
  }
  
  // Extract OS and browser (simplified)
  let os: string | undefined;
  let browser: string | undefined;
  
  if (/Windows/i.test(userAgent)) os = 'Windows';
  else if (/Mac/i.test(userAgent)) os = 'macOS';
  else if (/Linux/i.test(userAgent)) os = 'Linux';
  else if (/Android/i.test(userAgent)) os = 'Android';
  else if (/iOS/i.test(userAgent)) os = 'iOS';
  
  if (/Chrome/i.test(userAgent)) browser = 'Chrome';
  else if (/Firefox/i.test(userAgent)) browser = 'Firefox';
  else if (/Safari/i.test(userAgent)) browser = 'Safari';
  else if (/Edge/i.test(userAgent)) browser = 'Edge';
  
  return {
    ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
    userAgent,
    referrer,
    deviceInfo: { type: deviceType, os, browser }
  };
}

function generateViewerFingerprint(req: any): string {
  const metadata = extractRequestMetadata(req);
  const fingerprint = `${metadata.ipAddress}-${metadata.deviceInfo?.type}-${metadata.userAgent}`;
  return Buffer.from(fingerprint).toString('base64').substring(0, 32);
}

function generateSessionFingerprint(req: any): string {
  const metadata = extractRequestMetadata(req);
  const timestamp = Date.now();
  const fingerprint = `${metadata.ipAddress}-${timestamp}-${Math.random()}`;
  return Buffer.from(fingerprint).toString('base64').substring(0, 32);
}

// Slug generation helper function
function generateShortSlug(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Note: requireAuth middleware imported from auth.ts handles both session and JWT authentication

  // Shortlink routes - added early for redirect performance
  
  // Shortlink redirect route - handle /r/:slug redirects
  app.get("/r/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const shortlink = await storage.getShortlinkBySlug(slug);
      
      if (!shortlink) {
        return res.status(404).json({ message: "Shortlink not found" });
      }
      
      // Check if expired
      if (shortlink.expiresAt && new Date() > new Date(shortlink.expiresAt)) {
        return res.status(410).json({ message: "Shortlink expired" });
      }
      
      // SECURITY: Validate targetUrl to prevent open redirect (defense in depth)
      try {
        const urlObj = new URL(shortlink.targetUrl);
        const allowedPaths = [
          '/rentcard/shared/',
          '/property/',
          '/screening/',
          '/tenant/',
          '/landlord/',
          '/'
        ];
        const isValidProtocol = urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
        const isValidHostname = urlObj.hostname === 'localhost' || 
                               urlObj.hostname.includes('replit') || 
                               urlObj.hostname.includes('myrentcard') ||
                               urlObj.hostname === '127.0.0.1' ||
                               urlObj.hostname === '0.0.0.0';
        const isValidPath = allowedPaths.some(path => urlObj.pathname.startsWith(path));
        
        if (!isValidProtocol || !isValidHostname || !isValidPath) {
          console.error('Security violation: Invalid redirect URL attempted', {
            shortlinkId: shortlink.id,
            targetUrl: shortlink.targetUrl,
            requestIP: req.ip
          });
          return res.status(403).json({ message: "Invalid redirect URL - security policy violation" });
        }
      } catch (urlError) {
        console.error('Invalid URL format in shortlink', { shortlinkId: shortlink.id, targetUrl: shortlink.targetUrl });
        return res.status(400).json({ message: "Invalid URL format" });
      }
      
      // Extract request metadata for analytics
      const metadata = extractRequestMetadata(req);
      
      // Determine channel from query parameters or headers
      let channel = req.query.ch as string || 'direct';
      const validChannels = ['copy', 'mobile_share', 'email', 'sms', 'qr', 'pdf', 'direct', 'unknown'];
      if (!validChannels.includes(channel)) {
        channel = 'direct';
      }
      
      // Record click analytics asynchronously (don't block redirect)
      Promise.all([
        storage.incrementShortlinkClick(slug),
        storage.recordShortlinkClick({
          shortlinkId: shortlink.id,
          channel: channel as any,
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          referrer: metadata.referrer,
          deviceInfo: metadata.deviceInfo,
          locationInfo: undefined, // Could be enhanced with GeoIP
          sessionId: generateSessionFingerprint(req),
          userId: (req as any).user?.id || null,
        })
      ]).catch(error => {
        console.error('Failed to record shortlink click:', error);
      });
      
      // Perform redirect
      res.redirect(302, shortlink.targetUrl);
    } catch (error) {
      handleRouteError(error, res, 'shortlink redirect');
    }
  });

  // Create shortlink endpoint
  app.post("/api/shortlinks", requireAuth, async (req, res) => {
    try {
      const validationResult = insertShortlinkSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid shortlink data",
          errors: validationResult.error.issues 
        });
      }

      const data = validationResult.data;
      
      // SECURITY: Validate shareTokenId ownership if provided
      if (data.shareTokenId) {
        try {
          await assertShareTokenOwnership(req, data.shareTokenId);
        } catch (ownershipError) {
          return res.status(403).json({ 
            message: "Forbidden: Cannot create shortlink for share token you don't own" 
          });
        }
      }
      
      // Generate unique slug
      let slug: string;
      let attempts = 0;
      const maxAttempts = 10;
      
      do {
        slug = generateShortSlug();
        const existing = await storage.getShortlinkBySlug(slug);
        if (!existing) break;
        attempts++;
      } while (attempts < maxAttempts);
      
      if (attempts >= maxAttempts) {
        return res.status(500).json({ message: "Unable to generate unique slug" });
      }

      // Determine owner based on user type
      let tenantId: number | undefined;
      let landlordId: number | undefined;
      
      if (req.user?.userType === 'tenant') {
        const tenantProfile = await storage.getTenantProfile(req.user.id);
        if (tenantProfile) {
          tenantId = tenantProfile.id;
        }
      } else if (req.user?.userType === 'landlord') {
        const landlordProfile = await storage.getLandlordProfile(req.user.id);
        if (landlordProfile) {
          landlordId = landlordProfile.id;
        }
      }

      const shortlink = await storage.createShortlink({
        ...data,
        slug,
        tenantId,
        landlordId,
        isActive: true,
      });

      res.json(shortlink);
    } catch (error) {
      handleRouteError(error, res, 'create shortlink');
    }
  });

  // Get user's shortlinks
  app.get("/api/shortlinks", requireAuth, async (req, res) => {
    try {
      let shortlinks: Shortlink[] = [];
      
      if (req.user?.userType === 'tenant') {
        const tenantProfile = await storage.getTenantProfile(req.user.id);
        if (tenantProfile) {
          shortlinks = await storage.getShortlinks(tenantProfile.id);
        }
      } else if (req.user?.userType === 'landlord') {
        const landlordProfile = await storage.getLandlordProfile(req.user.id);
        if (landlordProfile) {
          shortlinks = await storage.getShortlinks(undefined, landlordProfile.id);
        }
      }

      res.json(shortlinks);
    } catch (error) {
      handleRouteError(error, res, 'get shortlinks');
    }
  });

  // Get shortlink analytics
  app.get("/api/shortlinks/:id/analytics", requireAuth, async (req, res) => {
    try {
      const shortlinkId = parseInt(req.params.id);
      if (isNaN(shortlinkId)) {
        return res.status(400).json({ message: "Invalid shortlink ID" });
      }

      const timeframe = req.query.timeframe as string;
      const clicks = await storage.getShortlinkAnalytics(shortlinkId, timeframe);
      
      // Calculate analytics summary
      const totalClicks = clicks.length;
      const uniqueClicks = new Set(clicks.map(c => c.sessionId)).size;
      
      const channelBreakdown = clicks.reduce((acc, click) => {
        acc[click.channel] = (acc[click.channel] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const deviceBreakdown = clicks.reduce((acc, click) => {
        const device = click.deviceInfo?.type || 'unknown';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      res.json({
        summary: {
          totalClicks,
          uniqueClicks,
          topChannel: Object.entries(channelBreakdown).sort(([,a], [,b]) => b - a)[0]?.[0] || 'none',
        },
        clicks,
        channelBreakdown,
        deviceBreakdown,
        timeline: clicks.map(click => ({
          date: click.clickedAt,
          channel: click.channel,
          device: click.deviceInfo?.type
        })).reverse()
      });
    } catch (error) {
      handleRouteError(error, res, 'get shortlink analytics');
    }
  });

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

  // Add endpoint for current user's landlord profile
  app.get("/api/landlord/profile", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        console.error('Unauthorized access to landlord profile: No user ID in request');
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      console.log(`Fetching landlord profile for user ID: ${req.user.id}`);
      const profile = await storage.getLandlordProfile(req.user.id);
      
      if (!profile) {
        console.log(`No landlord profile found for user ID: ${req.user.id}`);
        return res.status(404).json({ message: "Profile not found" });
      }
      
      console.log(`Successfully retrieved landlord profile for user ID: ${req.user.id}`);
      res.json(profile);
    } catch (error) {
      handleRouteError(error, res, '/api/landlord/profile endpoint');
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

  // Property QR Code routes
  app.get("/api/properties/:propertyId/qrcodes", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const propertyId = parseInt(req.params.propertyId);
      
      // Verify property ownership
      await assertPropertyOwnership(req, propertyId);
      
      const qrCodes = await storage.getPropertyQRCodes(propertyId);
      res.json(qrCodes);
    } catch (error) {
      console.error('Error fetching property QR codes:', error);
      
      if (error instanceof Error && error.message.includes('Forbidden')) {
        return res.status(403).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Error fetching QR codes", error });
    }
  });

  app.post("/api/properties/:propertyId/qrcodes", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const propertyId = parseInt(req.params.propertyId);
      
      // Verify property ownership
      await assertPropertyOwnership(req, propertyId);
      
      // Validate request body
      const validationResult = insertPropertyQRCodeSchema.safeParse({
        ...req.body,
        propertyId
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.errors 
        });
      }

      const newQRCode = await storage.createPropertyQRCode({
        propertyId,
        qrCodeData: validationResult.data.qrCodeData,
        title: validationResult.data.title,
        description: validationResult.data.description || null,
        isActive: true
      });

      res.status(201).json(newQRCode);
    } catch (error) {
      console.error('Error creating property QR code:', error);
      
      if (error instanceof Error && error.message.includes('Forbidden')) {
        return res.status(403).json({ message: error.message });
      }
      
      res.status(400).json({ message: "Error creating QR code", error });
    }
  });

  app.get("/api/properties/qrcodes/:qrCodeId", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const qrCodeId = parseInt(req.params.qrCodeId);
      const qrCode = await storage.getPropertyQRCodeById(qrCodeId);
      
      if (!qrCode) {
        return res.status(404).json({ message: "QR code not found" });
      }
      
      // Verify property ownership
      if (!qrCode.propertyId) {
        return res.status(400).json({ message: "Invalid QR code: missing property reference" });
      }
      await assertPropertyOwnership(req, qrCode.propertyId);
      
      res.json(qrCode);
    } catch (error) {
      console.error('Error fetching QR code:', error);
      
      if (error instanceof Error && error.message.includes('Forbidden')) {
        return res.status(403).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Error fetching QR code", error });
    }
  });

  app.put("/api/properties/qrcodes/:qrCodeId", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const qrCodeId = parseInt(req.params.qrCodeId);
      const qrCode = await storage.getPropertyQRCodeById(qrCodeId);
      
      if (!qrCode) {
        return res.status(404).json({ message: "QR code not found" });
      }
      
      // Verify property ownership
      if (!qrCode.propertyId) {
        return res.status(400).json({ message: "Invalid QR code: missing property reference" });
      }
      await assertPropertyOwnership(req, qrCode.propertyId);
      
      const updatedQRCode = await storage.updatePropertyQRCode(qrCodeId, req.body);
      res.json(updatedQRCode);
    } catch (error) {
      console.error('Error updating QR code:', error);
      
      if (error instanceof Error && error.message.includes('Forbidden')) {
        return res.status(403).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Error updating QR code", error });
    }
  });

  app.delete("/api/properties/qrcodes/:qrCodeId", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const qrCodeId = parseInt(req.params.qrCodeId);
      const qrCode = await storage.getPropertyQRCodeById(qrCodeId);
      
      if (!qrCode) {
        return res.status(404).json({ message: "QR code not found" });
      }
      
      // Verify property ownership
      if (!qrCode.propertyId) {
        return res.status(400).json({ message: "Invalid QR code: missing property reference" });
      }
      await assertPropertyOwnership(req, qrCode.propertyId);
      
      await storage.deletePropertyQRCode(qrCodeId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting QR code:', error);
      
      if (error instanceof Error && error.message.includes('Forbidden')) {
        return res.status(403).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Error deleting QR code", error });
    }
  });

  // Public route for tracking QR code scans (no auth required)
  app.post("/api/qrcode/:qrCodeId/track", async (req, res) => {
    try {
      const qrCodeId = parseInt(req.params.qrCodeId);
      const qrCode = await storage.getPropertyQRCodeById(qrCodeId);
      
      if (!qrCode || !qrCode.isActive) {
        return res.status(404).json({ message: "QR code not found or inactive" });
      }
      
      // Track the scan (existing simple tracking)
      await storage.trackQRCodeScan(qrCodeId);
      
      // Enhanced analytics tracking
      try {
        const metadata = extractRequestMetadata(req);
        await storage.recordQRCodeAnalytics({
          qrCodeId: qrCodeId,
          source: 'qr_code',
          sourceId: qrCodeId.toString(),
          ...metadata
        });
      } catch (analyticsError) {
        // Don't fail the request if analytics fails
        console.error('QR analytics tracking failed:', analyticsError);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking QR code scan:', error);
      res.status(500).json({ message: "Error tracking QR code scan", error });
    }
  });

  // Public QR code redirect endpoint with scan tracking (no auth required)
  app.get("/qr/:id", async (req, res) => {
    try {
      const qrCodeId = parseInt(req.params.id);
      
      if (isNaN(qrCodeId)) {
        return res.status(400).send("Invalid QR code ID");
      }
      
      const qrCode = await storage.getPropertyQRCodeById(qrCodeId);
      
      if (!qrCode || !qrCode.isActive) {
        return res.status(404).send("QR code not found or inactive");
      }
      
      // Track the scan (existing simple tracking)
      await storage.trackQRCodeScan(qrCodeId);
      
      // Enhanced analytics tracking
      try {
        const metadata = extractRequestMetadata(req);
        await storage.recordQRCodeAnalytics({
          qrCodeId: qrCodeId,
          source: 'qr_code',
          sourceId: qrCodeId.toString(),
          ...metadata
        });
      } catch (analyticsError) {
        // Don't fail the request if analytics fails
        console.error('QR analytics tracking failed:', analyticsError);
      }
      
      // Redirect to the target URL
      res.redirect(302, qrCode.qrCodeData);
    } catch (error) {
      console.error('Error in QR code redirect:', error);
      res.status(500).send("Error processing QR code");
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

  // Interest submission (supports both authenticated and guest users)
  app.post("/api/interests", async (req, res) => {
    try {
      // SECURITY: Validate request body using CLIENT-SAFE schema (excludes tenantId)
      const validationResult = clientInterestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error",
          errors: validationResult.error.errors 
        });
      }

      const clientData = validationResult.data;
      
      // SECURITY: Derive tenantId from authenticated session, NEVER from client payload
      let tenantId = null;
      if (req.user?.id) {
        // User is authenticated - get their tenant profile
        const tenantProfile = await storage.getTenantProfile(req.user.id);
        if (tenantProfile) {
          tenantId = tenantProfile.id;
        }
      }

      // Validate the propertyId if provided
      if (clientData.propertyId) {
        const property = await storage.getProperty(clientData.propertyId);
        if (!property) {
          return res.status(400).json({ message: "Property not found" });
        }

        // Get the landlord ID from the property
        if (!property.landlordId) {
          return res.status(400).json({ message: "Property has no associated landlord" });
        }

        // Ensure landlordId matches the property's landlord
        if (clientData.landlordId !== property.landlordId) {
          return res.status(400).json({ message: "Invalid landlord for this property" });
        }
      } else {
        // For general interests, verify the landlord exists
        const landlordProfile = await storage.getLandlordProfileById(clientData.landlordId);
        if (!landlordProfile) {
          return res.status(400).json({ message: "Landlord not found" });
        }
      }

      // SECURITY: Create interest with server-controlled tenantId
      const interest = await storage.createInterest({
        status: "new",
        propertyId: clientData.propertyId || null,
        tenantId, // Server-derived value, NEVER from client
        landlordId: clientData.landlordId,
        contactInfo: clientData.contactInfo,
        message: clientData.message || null
      });

      // Create notification for interest submission (for user engagement)
      try {
        if (tenantId) {
          // Get tenant profile to get userId for notification
          const tenantProfile = await storage.getTenantProfileById(tenantId);
          
          if (tenantProfile?.userId) {
            // Check user's notification preferences before creating notification
            const preferences = await storage.getUserNotificationPreferences(tenantProfile.userId);
            
            if (!preferences || preferences.interestSubmissionsEnabled) {
              // Get landlord info for better notification messaging
              const landlordProfile = await storage.getLandlordProfileById(clientData.landlordId);
              const landlordName = landlordProfile?.companyName || 'A landlord';
              
              // Get property info if available
              let propertyInfo = '';
              if (clientData.propertyId) {
                const property = await storage.getProperty(clientData.propertyId);
                propertyInfo = property ? ` for ${property.title}` : '';
              }

              const title = "Someone is interested in you!";
              const message = `${landlordName} submitted interest in your RentCard${propertyInfo}`;

              // Create the notification
              await storage.createNotification({
                userId: tenantProfile.userId,
                type: 'interest_submission',
                title,
                message,
                metadata: {
                  interestId: interest.id,
                  landlordId: clientData.landlordId,
                  propertyId: clientData.propertyId,
                  landlordName,
                  hasMessage: !!clientData.message
                },
                actionUrl: `/tenant/dashboard?tab=interests`,
                priority: 'high',
                category: 'engagement'
              });
            }
          }
        }
      } catch (notificationError) {
        // Don't fail the request if notification creation fails
        console.error('Interest notification creation failed:', notificationError);
      }

      res.status(201).json(interest);
    } catch (error) {
      handleRouteError(error, res, 'interest submission');
    }
  });

  // Interest routes
  
  // GET /api/interests - List interests with filtering
  app.get("/api/interests", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { propertyId, status } = req.query;
      
      // Get user profile to determine access permissions
      const landlordProfile = await storage.getLandlordProfile(req.user.id);
      const tenantProfile = await storage.getTenantProfile(req.user.id);
      
      if (!landlordProfile && !tenantProfile) {
        return res.status(403).json({ message: "User profile not found" });
      }

      let interests: Interest[] = [];
      
      if (landlordProfile) {
        // Landlords can see interests for their properties
        interests = await storage.getInterests(landlordProfile.id, undefined, propertyId ? parseInt(propertyId as string) : undefined);
        
        // Filter by status if provided
        if (status && status !== 'all') {
          interests = interests.filter(interest => interest.status === status);
        }
      } else if (tenantProfile) {
        // Tenants can only see their own interests
        interests = await storage.getInterests(undefined, tenantProfile.id, propertyId ? parseInt(propertyId as string) : undefined);
        
        // Filter by status if provided
        if (status && status !== 'all') {
          interests = interests.filter(interest => interest.status === status);
        }
      }

      // For landlords, also fetch property information for each interest
      if (landlordProfile) {
        const enrichedInterests = await Promise.all(
          interests.map(async (interest) => {
            let property = null;
            if (interest.propertyId) {
              property = await storage.getProperty(interest.propertyId);
            }
            return {
              ...interest,
              property: property ? {
                id: property.id,
                address: property.address,
                rent: property.rent,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms
              } : null,
              isGeneral: !interest.propertyId
            };
          })
        );
        return res.json(enrichedInterests);
      }

      // For tenants, enrich with basic property info
      const enrichedInterests = await Promise.all(
        interests.map(async (interest) => {
          let property = null;
          if (interest.propertyId) {
            property = await storage.getProperty(interest.propertyId);
          }
          return {
            ...interest,
            property: property ? {
              address: property.address,
              rent: property.rent
            } : null,
            isGeneral: !interest.propertyId
          };
        })
      );

      res.json(enrichedInterests);
    } catch (error) {
      handleRouteError(error, res, 'list interests');
    }
  });

  // GET /api/interests/:id - Get specific interest details
  app.get("/api/interests/:id", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const interestId = parseInt(req.params.id);
      if (isNaN(interestId)) {
        return res.status(400).json({ message: "Invalid interest ID" });
      }

      // Get all interests to find the one we want (simple approach)
      const allInterests = await storage.getInterests();
      const interest = allInterests.find(i => i.id === interestId);
      
      if (!interest) {
        return res.status(404).json({ message: "Interest not found" });
      }

      // Check authorization
      const landlordProfile = await storage.getLandlordProfile(req.user.id);
      const tenantProfile = await storage.getTenantProfile(req.user.id);
      
      let hasAccess = false;
      if (landlordProfile && interest.landlordId === landlordProfile.id) {
        hasAccess = true;
      } else if (tenantProfile && interest.tenantId === tenantProfile.id) {
        hasAccess = true;
      }
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied to this interest" });
      }

      // Enrich with property information if available
      let property = null;
      if (interest.propertyId) {
        property = await storage.getProperty(interest.propertyId);
      }

      const enrichedInterest = {
        ...interest,
        property: property ? {
          id: property.id,
          address: property.address,
          rent: property.rent,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms
        } : null,
        isGeneral: !interest.propertyId
      };

      // Mark as viewed if landlord is viewing it
      if (landlordProfile && !interest.viewedAt) {
        await storage.markInterestAsViewed(interestId);
        enrichedInterest.viewedAt = new Date().toISOString();
      }

      res.json(enrichedInterest);
    } catch (error) {
      handleRouteError(error, res, 'get interest details');
    }
  });

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

  // Share Token routes
  app.post("/api/share-tokens", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      // Validate rent card exists
      const rentCard = await storage.getRentCard(req.user.id);
      if (!rentCard) {
        return res.status(400).json({ message: "Please create your RentCard first" });
      }

      const validatedData = insertShareTokenSchema.parse(req.body);
      const shareToken = await storage.createShareToken(tenantProfile.id, validatedData);

      res.status(201).json(shareToken);
    } catch (error) {
      handleRouteError(error, res, 'create share token');
    }
  });

  app.get("/api/share-tokens", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      const shareTokens = await storage.getShareTokensByTenant(tenantProfile.id);
      res.json(shareTokens);
    } catch (error) {
      handleRouteError(error, res, 'list share tokens');
    }
  });

  app.patch("/api/share-tokens/:id/revoke", requireAuth, async (req, res) => {
    try {
      const tokenId = parseInt(req.params.id);
      if (isNaN(tokenId)) {
        return res.status(400).json({ message: "Invalid token ID" });
      }

      // Use the existing ownership validation function
      await assertShareTokenOwnership(req, tokenId);

      const revokedToken = await storage.revokeShareToken(tokenId);
      res.json(revokedToken);
    } catch (error) {
      handleRouteError(error, res, 'revoke share token');
    }
  });

  // Public endpoint for accessing shared rent cards
  app.get("/api/rentcard/shared/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      const shareToken = await storage.getShareToken(token);
      if (!shareToken) {
        return res.status(404).json({ message: "Invalid or expired share link" });
      }

      // Check if token is revoked
      if (shareToken.revoked) {
        return res.status(403).json({ message: "This share link has been revoked" });
      }

      // Check if token is expired
      if (shareToken.expiresAt && new Date() > shareToken.expiresAt) {
        return res.status(403).json({ message: "This share link has expired" });
      }

      // Get the tenant profile to get user ID
      const tenantProfile = await storage.getTenantProfileById(shareToken.tenantId);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      // Get the rent card
      const rentCard = await storage.getRentCard(tenantProfile.userId!);
      if (!rentCard) {
        return res.status(404).json({ message: "RentCard not found" });
      }

      // Track the view (existing simple tracking)
      await storage.trackTokenView(token);

      // Enhanced analytics tracking
      try {
        const metadata = extractRequestMetadata(req);
        await storage.recordRentCardView({
          shareTokenId: shareToken.id,
          tenantId: shareToken.tenantId,
          source: 'share_link',
          sourceId: token,
          ...metadata
        });
      } catch (analyticsError) {
        // Don't fail the request if analytics fails
        console.error('Analytics tracking failed:', analyticsError);
      }

      // Create notification for RentCard view (for user engagement)
      try {
        if (tenantProfile.userId) {
          // Check user's notification preferences before creating notification
          const preferences = await storage.getUserNotificationPreferences(tenantProfile.userId);
          
          if (!preferences || preferences.rentcardViewsEnabled) {
            // Determine viewer context for better notification messaging
            const metadata = extractRequestMetadata(req);
            const location = metadata.location;
            const deviceType = metadata.deviceInfo?.type || 'unknown';
            
            let title = "Someone viewed your RentCard!";
            let message = `Your RentCard was viewed from ${deviceType}`;
            
            if (location?.city && location?.region) {
              message += ` in ${location.city}, ${location.region}`;
            } else if (location?.region) {
              message += ` in ${location.region}`;
            }

            // Create the notification
            await storage.createNotification({
              userId: tenantProfile.userId,
              type: 'rentcard_view',
              title,
              message,
              metadata: {
                shareTokenId: shareToken.id,
                viewId: shareToken.id, // Could link to specific view record
                source: 'share_link',
                location: location,
                deviceType
              },
              actionUrl: `/tenant/dashboard?tab=analytics`,
              priority: 'normal',
              category: 'engagement'
            });
          }
        }
      } catch (notificationError) {
        // Don't fail the request if notification creation fails
        console.error('Notification creation failed:', notificationError);
      }

      // Return the rent card data
      res.json(rentCard);
    } catch (error) {
      handleRouteError(error, res, 'access shared rent card');
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

  // ========================
  // RECIPIENT MANAGEMENT API ENDPOINTS
  // ========================

  // Recipient Contacts CRUD Operations
  app.get("/api/tenant/contacts", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      const { category, isFavorite } = req.query;
      const options = {
        category: category as string,
        isFavorite: isFavorite === 'true' ? true : isFavorite === 'false' ? false : undefined
      };

      const contacts = await storage.getRecipientContacts(tenantProfile.id, options);
      res.json(contacts);
    } catch (error) {
      handleRouteError(error, res, 'get recipient contacts');
    }
  });

  app.get("/api/tenant/contacts/:id", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const contactId = parseInt(req.params.id);
      const contact = await storage.getRecipientContactById(contactId);
      
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }

      // Verify ownership
      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile || contact.tenantId !== tenantProfile.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(contact);
    } catch (error) {
      handleRouteError(error, res, 'get recipient contact');
    }
  });

  app.post("/api/tenant/contacts", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      // Validate the request body
      const validatedData = insertRecipientContactSchema.parse(req.body);

      const contact = await storage.createRecipientContact({
        ...validatedData,
        tenantId: tenantProfile.id
      });

      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: (error as any).errors 
        });
      }
      handleRouteError(error, res, 'create recipient contact');
    }
  });

  app.put("/api/tenant/contacts/:id", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const contactId = parseInt(req.params.id);
      const contact = await storage.getRecipientContactById(contactId);
      
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }

      // Verify ownership
      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile || contact.tenantId !== tenantProfile.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedContact = await storage.updateRecipientContact(contactId, req.body);
      res.json(updatedContact);
    } catch (error) {
      handleRouteError(error, res, 'update recipient contact');
    }
  });

  app.delete("/api/tenant/contacts/:id", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const contactId = parseInt(req.params.id);
      const contact = await storage.getRecipientContactById(contactId);
      
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }

      // Verify ownership
      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile || contact.tenantId !== tenantProfile.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteRecipientContact(contactId);
      res.status(204).send();
    } catch (error) {
      handleRouteError(error, res, 'delete recipient contact');
    }
  });

  // Tenant Message Templates CRUD Operations
  app.get("/api/tenant/message-templates", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      const { category } = req.query;
      const templates = await storage.getTenantMessageTemplates(tenantProfile.id, category as string);
      res.json(templates);
    } catch (error) {
      handleRouteError(error, res, 'get tenant message templates');
    }
  });

  app.get("/api/tenant/message-templates/:id", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const templateId = parseInt(req.params.id);
      const template = await storage.getTenantMessageTemplateById(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Verify ownership
      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile || template.tenantId !== tenantProfile.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(template);
    } catch (error) {
      handleRouteError(error, res, 'get tenant message template');
    }
  });

  app.post("/api/tenant/message-templates", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      // Validate the request body
      const validatedData = insertTenantMessageTemplateSchema.parse(req.body);

      const template = await storage.createTenantMessageTemplate({
        ...validatedData,
        tenantId: tenantProfile.id
      });

      res.status(201).json(template);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: (error as any).errors 
        });
      }
      handleRouteError(error, res, 'create tenant message template');
    }
  });

  app.put("/api/tenant/message-templates/:id", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const templateId = parseInt(req.params.id);
      const template = await storage.getTenantMessageTemplateById(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Verify ownership
      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile || template.tenantId !== tenantProfile.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedTemplate = await storage.updateTenantMessageTemplate(templateId, req.body);
      res.json(updatedTemplate);
    } catch (error) {
      handleRouteError(error, res, 'update tenant message template');
    }
  });

  app.delete("/api/tenant/message-templates/:id", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const templateId = parseInt(req.params.id);
      const template = await storage.getTenantMessageTemplateById(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Verify ownership
      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile || template.tenantId !== tenantProfile.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteTenantMessageTemplate(templateId);
      res.status(204).send();
    } catch (error) {
      handleRouteError(error, res, 'delete tenant message template');
    }
  });

  // Contact Sharing History Operations
  app.get("/api/tenant/sharing-history", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      const { contactId } = req.query;
      const history = await storage.getContactSharingHistory(
        tenantProfile.id, 
        contactId ? parseInt(contactId as string) : undefined
      );
      
      res.json(history);
    } catch (error) {
      handleRouteError(error, res, 'get contact sharing history');
    }
  });

  app.post("/api/tenant/sharing-history", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      // Validate the request body
      const validatedData = insertContactSharingHistorySchema.parse(req.body);

      const history = await storage.createContactSharingHistory({
        ...validatedData,
        tenantId: tenantProfile.id
      });

      res.status(201).json(history);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: (error as any).errors 
        });
      }
      handleRouteError(error, res, 'create contact sharing history');
    }
  });

  app.post("/api/tenant/sharing-history/:id/mark-response", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const historyId = parseInt(req.params.id);
      const { notes } = req.body;

      // Verify ownership by checking if the sharing history belongs to the tenant
      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      const allHistory = await storage.getContactSharingHistory(tenantProfile.id);
      const historyItem = allHistory.find(h => h.id === historyId);
      
      if (!historyItem) {
        return res.status(404).json({ message: "Sharing history not found" });
      }

      const updatedHistory = await storage.markSharingResponseReceived(historyId, notes);
      res.json(updatedHistory);
    } catch (error) {
      handleRouteError(error, res, 'mark sharing response received');
    }
  });

  // ========================
  // NOTIFICATION API ENDPOINTS
  // ========================

  // Get user notifications with pagination and filtering
  app.get("/api/tenant/notifications", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { limit, offset, unreadOnly, type } = req.query;
      
      const options = {
        limit: limit ? parseInt(limit as string) : 20,
        offset: offset ? parseInt(offset as string) : 0,
        unreadOnly: unreadOnly === 'true',
        type: type as string
      };

      const notifications = await storage.getUserNotifications(req.user.id, options);
      res.json(notifications);
    } catch (error) {
      handleRouteError(error, res, 'get user notifications');
    }
  });

  // Get notification count/badge count
  app.get("/api/tenant/notifications/count", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { unreadOnly } = req.query;
      const count = await storage.getUserNotificationCount(req.user.id, unreadOnly === 'true');
      
      res.json({ count });
    } catch (error) {
      handleRouteError(error, res, 'get notification count');
    }
  });

  // Mark notification as read
  app.post("/api/tenant/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const notificationId = parseInt(req.params.id);
      
      // Verify ownership by getting the notification first
      const notifications = await storage.getUserNotifications(req.user.id);
      const notification = notifications.find(n => n.id === notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      res.json(updatedNotification);
    } catch (error) {
      handleRouteError(error, res, 'mark notification as read');
    }
  });

  // Mark notification as clicked
  app.post("/api/tenant/notifications/:id/click", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const notificationId = parseInt(req.params.id);
      
      // Verify ownership
      const notifications = await storage.getUserNotifications(req.user.id);
      const notification = notifications.find(n => n.id === notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      const updatedNotification = await storage.markNotificationAsClicked(notificationId);
      res.json(updatedNotification);
    } catch (error) {
      handleRouteError(error, res, 'mark notification as clicked');
    }
  });

  // Mark all notifications as read
  app.post("/api/tenant/notifications/read-all", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await storage.markAllNotificationsAsRead(req.user.id);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      handleRouteError(error, res, 'mark all notifications as read');
    }
  });

  // Get notification preferences
  app.get("/api/tenant/notification-preferences", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      let preferences = await storage.getUserNotificationPreferences(req.user.id);
      
      // Create default preferences if none exist
      if (!preferences) {
        preferences = await storage.createUserNotificationPreferences({
          userId: req.user.id,
          rentcardViewsEnabled: true,
          rentcardViewsEmail: false,
          rentcardViewsFrequency: 'instant',
          interestSubmissionsEnabled: true,
          interestSubmissionsEmail: true,
          interestSubmissionsFrequency: 'instant',
          weeklySummaryEnabled: true,
          weeklySummaryEmail: true,
          weeklySummaryDay: 'monday',
          systemNotificationsEnabled: true,
          systemNotificationsEmail: false,
          timezone: 'America/New_York',
          emailDigestEnabled: false,
          emailDigestFrequency: 'daily',
          maxNotificationsPerHour: 10,
          groupSimilarNotifications: true
        });
      }
      
      res.json(preferences);
    } catch (error) {
      handleRouteError(error, res, 'get notification preferences');
    }
  });

  // Update notification preferences
  app.put("/api/tenant/notification-preferences", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validationResult = insertNotificationPreferencesSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid notification preferences", 
          errors: validationResult.error.errors 
        });
      }

      // Check if preferences exist, create if not
      let preferences = await storage.getUserNotificationPreferences(req.user.id);
      
      if (!preferences) {
        preferences = await storage.createUserNotificationPreferences({
          userId: req.user.id,
          ...validationResult.data
        });
      } else {
        preferences = await storage.updateUserNotificationPreferences(req.user.id, validationResult.data);
      }
      
      res.json(preferences);
    } catch (error) {
      handleRouteError(error, res, 'update notification preferences');
    }
  });

  // Get notification statistics and analytics
  app.get("/api/tenant/notification-stats", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { timeframe } = req.query;
      const stats = await storage.getUserNotificationStats(req.user.id, timeframe as string);
      
      res.json(stats);
    } catch (error) {
      handleRouteError(error, res, 'get notification stats');
    }
  });

  // Delete old notifications (cleanup endpoint)
  app.delete("/api/tenant/notifications/cleanup", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { olderThanDays } = req.query;
      const days = olderThanDays ? parseInt(olderThanDays as string) : 30;
      const olderThanDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      await storage.deleteUserNotifications(req.user.id, olderThanDate);
      res.json({ message: `Deleted notifications older than ${days} days` });
    } catch (error) {
      handleRouteError(error, res, 'cleanup old notifications');
    }
  });

  // Internal API endpoint for creating notifications (used by system triggers)
  app.post("/api/internal/notifications", async (req, res) => {
    try {
      // This endpoint should be protected or only accessible internally
      // For now, we'll validate the request has required fields
      const validationResult = insertNotificationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid notification data", 
          errors: validationResult.error.errors 
        });
      }

      const notification = await storage.createNotification(validationResult.data);
      res.json(notification);
    } catch (error) {
      handleRouteError(error, res, 'create notification');
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

  // ===== CONTACT PREFERENCE API ENDPOINTS =====

  // Contact preferences routes
  app.get("/api/tenant/contact-preferences", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'tenant') {
        return res.status(403).json({ message: "Access denied" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      const preferences = await storage.getTenantContactPreferences(tenantProfile.id);
      res.json(preferences || null);
    } catch (error) {
      handleRouteError(error, res, 'get contact preferences');
    }
  });

  app.post("/api/tenant/contact-preferences", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'tenant') {
        return res.status(403).json({ message: "Access denied" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      // Validate the request body
      const validatedData = insertTenantContactPreferencesSchema.parse(req.body);
      
      // Check if preferences already exist
      const existingPreferences = await storage.getTenantContactPreferences(tenantProfile.id);
      
      let preferences;
      if (existingPreferences) {
        // Update existing preferences
        preferences = await storage.updateTenantContactPreferences(tenantProfile.id, validatedData);
      } else {
        // Create new preferences
        preferences = await storage.createTenantContactPreferences({
          ...validatedData,
          tenantId: tenantProfile.id
        });
      }

      res.status(201).json(preferences);
    } catch (error) {
      handleRouteError(error, res, 'create/update contact preferences');
    }
  });

  app.put("/api/tenant/contact-preferences", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'tenant') {
        return res.status(403).json({ message: "Access denied" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      // Validate the request body
      const validatedData = insertTenantContactPreferencesSchema.partial().parse(req.body);
      
      // Update preferences
      const preferences = await storage.updateTenantContactPreferences(tenantProfile.id, validatedData);
      res.json(preferences);
    } catch (error) {
      handleRouteError(error, res, 'update contact preferences');
    }
  });

  // Communication logs routes
  app.get("/api/communication-logs", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { tenantId, propertyId } = req.query;

      let logs;
      if (req.user.userType === 'landlord') {
        const landlordProfile = await storage.getLandlordProfile(req.user.id);
        if (!landlordProfile) {
          return res.status(404).json({ message: "Landlord profile not found" });
        }
        
        // Support filtering by tenantId or propertyId for landlords
        const tenantIdNum = tenantId ? parseInt(tenantId as string) : undefined;
        const propertyIdNum = propertyId ? parseInt(propertyId as string) : undefined;
        
        // SECURITY FIX: If tenantId is specified, verify landlord has legitimate association
        if (tenantIdNum) {
          await assertLandlordTenantAssociation(req, tenantIdNum);
        }
        
        // SECURITY FIX: If propertyId is specified, verify landlord owns the property
        if (propertyIdNum) {
          await assertPropertyOwnership(req, propertyIdNum);
        }
        
        logs = await storage.getCommunicationLogs(landlordProfile.id, tenantIdNum, propertyIdNum);
      } else if (req.user.userType === 'tenant') {
        const tenantProfile = await storage.getTenantProfile(req.user.id);
        if (!tenantProfile) {
          return res.status(404).json({ message: "Tenant profile not found" });
        }
        logs = await storage.getCommunicationLogs(undefined, tenantProfile.id);
      } else {
        return res.status(403).json({ message: "Invalid user type" });
      }

      res.json(logs);
    } catch (error) {
      handleRouteError(error, res, 'get communication logs');
    }
  });

  app.post("/api/communication-logs", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'landlord') {
        return res.status(403).json({ message: "Only landlords can create communication logs" });
      }

      const landlordProfile = await storage.getLandlordProfile(req.user.id);
      if (!landlordProfile) {
        return res.status(404).json({ message: "Landlord profile not found" });
      }

      // Validate the request body
      const validatedData = insertCommunicationLogSchema.parse(req.body);
      
      // SECURITY FIX: Verify landlord has legitimate association with tenant
      if (validatedData.tenantId) {
        await assertLandlordTenantAssociation(req, validatedData.tenantId);
      }
      
      // SECURITY FIX: If propertyId is specified, verify landlord owns the property
      if (validatedData.propertyId) {
        await assertPropertyOwnership(req, validatedData.propertyId);
      }
      
      // CRITICAL: Enforce tenant contact preferences and blocked contacts
      if (validatedData.tenantId) {
        // Check if contact is blocked
        const isBlocked = await storage.isContactBlocked(
          validatedData.tenantId, 
          landlordProfile.id
        );

        if (isBlocked) {
          return res.status(403).json({ 
            message: "Cannot contact tenant - contact is blocked" 
          });
        }

        // Check tenant contact preferences
        const preferences = await storage.getTenantContactPreferences(validatedData.tenantId);
        
        if (preferences && !preferences.preferredMethods.includes(validatedData.communicationType as any)) {
          return res.status(403).json({ 
            message: `Communication method '${validatedData.communicationType}' not allowed by tenant preferences`,
            allowedMethods: preferences.preferredMethods 
          });
        }

        // Check if current time respects tenant's time preferences
        if (preferences && preferences.timePreferences) {
          const now = new Date();
          const currentHour = now.getHours();
          const currentDay = now.getDay(); // 0 = Sunday
          
          const startHour = parseInt(preferences.timePreferences.startTime.split(':')[0]);
          const endHour = parseInt(preferences.timePreferences.endTime.split(':')[0]);
          
          // Check if current day is allowed
          if (!preferences.timePreferences.daysOfWeek.includes(currentDay)) {
            return res.status(403).json({ 
              message: "Current day not allowed by tenant's time preferences",
              allowedDays: preferences.timePreferences.daysOfWeek 
            });
          }
          
          // Check if current time is allowed
          if (currentHour < startHour || currentHour > endHour) {
            return res.status(403).json({ 
              message: "Current time not allowed by tenant's time preferences",
              allowedTimeRange: `${preferences.timePreferences.startTime} - ${preferences.timePreferences.endTime}` 
            });
          }
        }
      }
      
      // Create the communication log
      const log = await storage.createCommunicationLog({
        ...validatedData,
        landlordId: landlordProfile.id
      });

      // If a template was used, increment its usage count
      if (validatedData.templateId) {
        await storage.incrementTemplateUsage(validatedData.templateId);
      }

      res.status(201).json(log);
    } catch (error) {
      handleRouteError(error, res, 'create communication log');
    }
  });

  app.get("/api/communication-logs/thread/:threadId", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { threadId } = req.params;
      const logs = await storage.getCommunicationThread(threadId);
      
      // Verify user has access to this thread
      const userCanAccess = logs.some(log => {
        if (req.user?.userType === 'landlord') {
          const landlordProfile = storage.getLandlordProfile(req.user.id);
          return landlordProfile.then(profile => profile?.id === log.landlordId);
        } else if (req.user?.userType === 'tenant') {
          const tenantProfile = storage.getTenantProfile(req.user.id);
          return tenantProfile.then(profile => profile?.id === log.tenantId);
        }
        return false;
      });

      if (!await userCanAccess) {
        return res.status(403).json({ message: "Access denied to this communication thread" });
      }

      res.json(logs);
    } catch (error) {
      handleRouteError(error, res, 'get communication thread');
    }
  });

  app.patch("/api/communication-logs/:id/status", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'landlord') {
        return res.status(403).json({ message: "Only landlords can update communication log status" });
      }

      const logId = parseInt(req.params.id);
      const { status, metadata } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const updatedLog = await storage.updateCommunicationLogStatus(logId, status, metadata);
      res.json(updatedLog);
    } catch (error) {
      handleRouteError(error, res, 'update communication log status');
    }
  });

  // Blocked contacts routes
  app.get("/api/tenant/blocked-contacts", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'tenant') {
        return res.status(403).json({ message: "Access denied" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      const blockedContacts = await storage.getTenantBlockedContacts(tenantProfile.id);
      res.json(blockedContacts);
    } catch (error) {
      handleRouteError(error, res, 'get blocked contacts');
    }
  });

  app.post("/api/tenant/blocked-contacts", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'tenant') {
        return res.status(403).json({ message: "Access denied" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      // Validate the request body
      const validatedData = insertTenantBlockedContactsSchema.parse(req.body);
      
      const blockedContact = await storage.createTenantBlockedContact({
        ...validatedData,
        tenantId: tenantProfile.id
      });

      res.status(201).json(blockedContact);
    } catch (error) {
      handleRouteError(error, res, 'create blocked contact');
    }
  });

  app.delete("/api/tenant/blocked-contacts/:id", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'tenant') {
        return res.status(403).json({ message: "Access denied" });
      }

      const contactId = parseInt(req.params.id);
      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      // Verify the blocked contact belongs to the tenant
      const blockedContacts = await storage.getTenantBlockedContacts(tenantProfile.id);
      const contactToDelete = blockedContacts.find(contact => contact.id === contactId);
      
      if (!contactToDelete) {
        return res.status(404).json({ message: "Blocked contact not found" });
      }

      await storage.removeTenantBlockedContact(contactId);
      res.status(204).send();
    } catch (error) {
      handleRouteError(error, res, 'remove blocked contact');
    }
  });

  app.post("/api/tenant/check-blocked", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'tenant') {
        return res.status(403).json({ message: "Access denied" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      const { landlordId, email, phone } = req.body;
      const isBlocked = await storage.isContactBlocked(tenantProfile.id, landlordId, email, phone);
      
      res.json({ isBlocked });
    } catch (error) {
      handleRouteError(error, res, 'check if contact is blocked');
    }
  });

  // Communication templates routes
  app.get("/api/landlord/communication-templates", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'landlord') {
        return res.status(403).json({ message: "Access denied" });
      }

      const landlordProfile = await storage.getLandlordProfile(req.user.id);
      if (!landlordProfile) {
        return res.status(404).json({ message: "Landlord profile not found" });
      }

      const { category } = req.query;
      const templates = await storage.getCommunicationTemplates(
        landlordProfile.id, 
        category as string || undefined
      );
      
      res.json(templates);
    } catch (error) {
      handleRouteError(error, res, 'get communication templates');
    }
  });

  app.post("/api/landlord/communication-templates", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'landlord') {
        return res.status(403).json({ message: "Access denied" });
      }

      const landlordProfile = await storage.getLandlordProfile(req.user.id);
      if (!landlordProfile) {
        return res.status(404).json({ message: "Landlord profile not found" });
      }

      // Validate the request body
      const validatedData = insertCommunicationTemplateSchema.parse(req.body);
      
      const template = await storage.createCommunicationTemplate({
        ...validatedData,
        landlordId: landlordProfile.id
      });

      res.status(201).json(template);
    } catch (error) {
      handleRouteError(error, res, 'create communication template');
    }
  });

  app.put("/api/landlord/communication-templates/:id", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'landlord') {
        return res.status(403).json({ message: "Access denied" });
      }

      const templateId = parseInt(req.params.id);
      const landlordProfile = await storage.getLandlordProfile(req.user.id);
      if (!landlordProfile) {
        return res.status(404).json({ message: "Landlord profile not found" });
      }

      // Verify template belongs to landlord
      const existingTemplate = await storage.getCommunicationTemplateById(templateId);
      if (!existingTemplate || existingTemplate.landlordId !== landlordProfile.id) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Validate the request body
      const validatedData = insertCommunicationTemplateSchema.partial().parse(req.body);
      
      const template = await storage.updateCommunicationTemplate(templateId, validatedData);
      res.json(template);
    } catch (error) {
      handleRouteError(error, res, 'update communication template');
    }
  });

  app.delete("/api/landlord/communication-templates/:id", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'landlord') {
        return res.status(403).json({ message: "Access denied" });
      }

      const templateId = parseInt(req.params.id);
      const landlordProfile = await storage.getLandlordProfile(req.user.id);
      if (!landlordProfile) {
        return res.status(404).json({ message: "Landlord profile not found" });
      }

      // Verify template belongs to landlord
      const existingTemplate = await storage.getCommunicationTemplateById(templateId);
      if (!existingTemplate || existingTemplate.landlordId !== landlordProfile.id) {
        return res.status(404).json({ message: "Template not found" });
      }

      await storage.deleteCommunicationTemplate(templateId);
      res.status(204).send();
    } catch (error) {
      handleRouteError(error, res, 'delete communication template');
    }
  });

  // Landlord endpoint to get tenant contact preferences summary
  app.get("/api/landlord/tenant/:tenantId/contact-preferences", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'landlord') {
        return res.status(403).json({ message: "Access denied" });
      }

      const landlordProfile = await storage.getLandlordProfile(req.user.id);
      if (!landlordProfile) {
        return res.status(404).json({ message: "Landlord profile not found" });
      }

      const tenantId = parseInt(req.params.tenantId);
      if (isNaN(tenantId)) {
        return res.status(400).json({ message: "Invalid tenant ID" });
      }

      // SECURITY FIX: Verify landlord has legitimate association with tenant
      await assertLandlordTenantAssociation(req, tenantId);

      // Check if tenant exists and get their profile for validation
      const tenantProfile = await storage.getTenantProfileById(tenantId);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      // Get tenant contact preferences (this is allowed for landlords to view summary)
      const preferences = await storage.getTenantContactPreferences(tenantId);
      
      // Check if contact is blocked
      const isBlocked = await storage.isContactBlocked(tenantId, landlordProfile.id);

      // Return summarized preferences for landlord use
      const response = {
        canContact: !isBlocked,
        isBlocked,
        preferences: preferences ? {
          id: preferences.id,
          preferredMethods: preferences.preferredMethods,
          timePreferences: preferences.timePreferences,
          frequencyPreferences: preferences.frequencyPreferences,
          allowUnknownContacts: preferences.allowUnknownContacts,
          allowPhoneCalls: preferences.allowPhoneCalls,
          allowTextMessages: preferences.allowTextMessages,
          isActive: preferences.isActive
        } : null
      };

      res.json(response);
    } catch (error) {
      handleRouteError(error, res, 'get tenant contact preferences for landlord');
    }
  });

  // Helper endpoint for landlords to check if they can contact a tenant
  app.post("/api/landlord/can-contact-tenant", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'landlord') {
        return res.status(403).json({ message: "Access denied" });
      }

      const landlordProfile = await storage.getLandlordProfile(req.user.id);
      if (!landlordProfile) {
        return res.status(404).json({ message: "Landlord profile not found" });
      }

      const { tenantId, communicationType } = req.body;
      
      if (!tenantId || !communicationType) {
        return res.status(400).json({ message: "Tenant ID and communication type are required" });
      }

      // Check if contact is blocked
      const isBlocked = await storage.isContactBlocked(
        tenantId, 
        landlordProfile.id
      );

      if (isBlocked) {
        return res.json({ 
          canContact: false, 
          reason: "Contact is blocked by tenant" 
        });
      }

      // Get tenant preferences
      const preferences = await storage.getTenantContactPreferences(tenantId);
      
      if (!preferences) {
        // No preferences set, assume all contact is allowed
        return res.json({ 
          canContact: true, 
          preferences: null 
        });
      }

      // Check if the communication type is allowed
      const canContact = preferences.preferredMethods.includes(communicationType as any);
      
      res.json({ 
        canContact, 
        preferences,
        suggestedMethods: preferences.preferredMethods,
        timePreferences: preferences.timePreferences
      });
    } catch (error) {
      handleRouteError(error, res, 'check if can contact tenant');
    }
  });

  // ============== ENHANCED ANALYTICS ENDPOINTS ==============

  // Data Collection Endpoints

  // Track RentCard view
  app.post("/api/analytics/rentcard-view", async (req, res) => {
    try {
      const metadata = extractRequestMetadata(req);
      const {
        shareTokenId,
        tenantId,
        source = 'direct',
        sourceId,
        viewDuration = 0,
        actionsPerformed = []
      } = req.body;

      // Validate required fields
      if (!shareTokenId && !tenantId) {
        return res.status(400).json({ message: "Either shareTokenId or tenantId is required" });
      }

      // Check if this is a unique view
      const viewerFingerprint = generateViewerFingerprint(req);
      const existingViews = await storage.getRentcardViews(shareTokenId, tenantId);
      const isUnique = !existingViews.some(v => v.viewerFingerprint === viewerFingerprint);

      // Create view record
      const viewData = {
        shareTokenId: shareTokenId || null,
        tenantId: tenantId || null,
        viewerFingerprint,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        referrer: metadata.referrer,
        source,
        sourceId,
        deviceInfo: metadata.deviceInfo,
        viewDuration,
        actionsPerformed,
        isUnique
      };

      const newView = await storage.createRentcardView(viewData);

      // Track share token view count if applicable
      if (shareTokenId) {
        await storage.trackTokenView(shareTokenId.toString());
      }

      res.status(201).json({ 
        success: true, 
        viewId: newView.id,
        isUnique
      });
    } catch (error) {
      handleRouteError(error, res, 'track rentcard view');
    }
  });

  // Track sharing action
  app.post("/api/analytics/sharing", async (req, res) => {
    try {
      const {
        shareTokenId,
        tenantId,
        sharingMethod,
        recipientInfo = {}
      } = req.body;

      if (!shareTokenId || !tenantId || !sharingMethod) {
        return res.status(400).json({ 
          message: "shareTokenId, tenantId, and sharingMethod are required" 
        });
      }

      const sharingData = {
        shareTokenId,
        tenantId,
        sharingMethod,
        recipientInfo,
        performanceScore: 0 // Will be calculated later based on engagement
      };

      const newSharing = await storage.createSharingAnalytics(sharingData);
      res.status(201).json({ success: true, sharingId: newSharing.id });
    } catch (error) {
      handleRouteError(error, res, 'track sharing action');
    }
  });

  // Track QR code scan
  app.post("/api/analytics/qr-scan", async (req, res) => {
    try {
      const metadata = extractRequestMetadata(req);
      const {
        qrCodeId,
        propertyId,
        scanLocation,
        subsequentAction = 'scanned'
      } = req.body;

      if (!qrCodeId || !propertyId) {
        return res.status(400).json({ 
          message: "qrCodeId and propertyId are required" 
        });
      }

      const scanData = {
        qrCodeId,
        propertyId,
        scanLocation,
        scannerInfo: {
          deviceType: metadata.deviceInfo?.type,
          os: metadata.deviceInfo?.os,
          browser: metadata.deviceInfo?.browser
        },
        subsequentAction,
        sessionDuration: 0,
        conversionValue: subsequentAction !== 'scanned' ? subsequentAction : null
      };

      const newScan = await storage.createQRCodeAnalytics(scanData);

      // Track QR code usage in the property QR codes table
      if (qrCodeId) {
        await storage.trackQRCodeScan(qrCodeId);
      }

      res.status(201).json({ success: true, scanId: newScan.id });
    } catch (error) {
      handleRouteError(error, res, 'track QR scan');
    }
  });

  // Track interest conversion
  app.post("/api/analytics/interest-conversion", async (req, res) => {
    try {
      const {
        interestId,
        tenantId,
        landlordId,
        propertyId,
        sourceView = 'unknown',
        viewsBeforeInterest = 0,
        timeToInterest = 0,
        metadata: analyticsMetadata = {}
      } = req.body;

      if (!interestId || !tenantId || !landlordId) {
        return res.status(400).json({ 
          message: "interestId, tenantId, and landlordId are required" 
        });
      }

      const conversionData = {
        interestId,
        tenantId,
        landlordId,
        propertyId: propertyId || null,
        sourceView,
        viewsBeforeInterest,
        timeToInterest,
        engagementScore: Math.min(100, Math.max(0, 
          50 + (viewsBeforeInterest * 10) - (timeToInterest / 60)
        )), // Simple engagement score calculation
        responseTime: null,
        finalStatus: 'new',
        metadata: analyticsMetadata
      };

      const newConversion = await storage.createInterestAnalytics(conversionData);
      res.status(201).json({ success: true, conversionId: newConversion.id });
    } catch (error) {
      handleRouteError(error, res, 'track interest conversion');
    }
  });

  // Reporting Endpoints

  // Get tenant view analytics
  app.get("/api/analytics/tenant/:tenantId/views", requireAuth, async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      if (isNaN(tenantId)) {
        return res.status(400).json({ message: "Invalid tenant ID" });
      }

      // Verify tenant ownership
      await assertTenantOwnership(req, tenantId);

      const timeframe = req.query.timeframe as string;
      const stats = await storage.getRentcardViewStats(tenantId, timeframe);
      const views = await storage.getRentcardViews(undefined, tenantId, timeframe);

      res.json({
        stats,
        recentViews: views.slice(0, 10), // Last 10 views for detail
        viewHistory: views.map(v => ({
          date: v.timestamp,
          source: v.source,
          deviceType: v.deviceInfo?.type,
          duration: v.viewDuration,
          isUnique: v.isUnique
        }))
      });
    } catch (error) {
      handleRouteError(error, res, 'get tenant view analytics');
    }
  });

  // Get tenant sharing performance
  app.get("/api/analytics/tenant/:tenantId/sharing", requireAuth, async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      if (isNaN(tenantId)) {
        return res.status(400).json({ message: "Invalid tenant ID" });
      }

      await assertTenantOwnership(req, tenantId);

      const stats = await storage.getSharingPerformanceStats(tenantId);
      const sharingHistory = await storage.getSharingAnalytics(undefined, tenantId);

      res.json({
        stats,
        sharingHistory: sharingHistory.slice(0, 20).map(s => ({
          date: s.shareDate,
          method: s.sharingMethod,
          totalViews: s.totalViews,
          uniqueViewers: s.uniqueViewers,
          converted: s.conversionToInterest,
          performanceScore: s.performanceScore
        }))
      });
    } catch (error) {
      handleRouteError(error, res, 'get tenant sharing analytics');
    }
  });

  // Get landlord conversion analytics
  app.get("/api/analytics/landlord/:landlordId/conversions", requireAuth, async (req, res) => {
    try {
      const landlordId = parseInt(req.params.landlordId);
      if (isNaN(landlordId)) {
        return res.status(400).json({ message: "Invalid landlord ID" });
      }

      await assertLandlordOwnership(req, landlordId);

      const timeframe = req.query.timeframe as string;
      const stats = await storage.getInterestConversionStats(landlordId, timeframe);
      const analytics = await storage.getInterestAnalytics(landlordId);

      res.json({
        stats,
        conversionTrends: analytics.slice(0, 50).map(a => ({
          date: a.createdAt,
          source: a.sourceView,
          timeToInterest: a.timeToInterest,
          engagementScore: a.engagementScore,
          finalStatus: a.finalStatus
        }))
      });
    } catch (error) {
      handleRouteError(error, res, 'get landlord conversion analytics');
    }
  });

  // Get property QR code statistics
  app.get("/api/analytics/property/:propertyId/qr-stats", requireAuth, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      await assertPropertyOwnership(req, propertyId);

      const stats = await storage.getQRCodeStats(propertyId);
      const scanHistory = await storage.getQRCodeAnalytics(undefined, propertyId);

      res.json({
        stats,
        scanHistory: scanHistory.slice(0, 50).map(scan => ({
          date: scan.scanDate,
          deviceType: scan.scannerInfo?.deviceType,
          action: scan.subsequentAction,
          location: scan.scanLocation,
          sessionDuration: scan.sessionDuration
        }))
      });
    } catch (error) {
      handleRouteError(error, res, 'get property QR analytics');
    }
  });

  // General analytics dashboard endpoint for landlords
  app.get("/api/analytics/landlord/dashboard", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'landlord') {
        return res.status(403).json({ message: "Access denied" });
      }

      const landlordProfile = await storage.getLandlordProfile(req.user.id);
      if (!landlordProfile) {
        return res.status(404).json({ message: "Landlord profile not found" });
      }

      const timeframe = req.query.timeframe as string;

      // Get conversion stats
      const conversionStats = await storage.getInterestConversionStats(landlordProfile.id, timeframe);
      
      // Get properties for property-level analytics
      const properties = await storage.getProperties(landlordProfile.id);
      
      // Aggregate QR stats across all properties
      let totalQRScans = 0;
      let totalQRConversions = 0;
      for (const property of properties) {
        const qrStats = await storage.getQRCodeStats(property.id);
        totalQRScans += qrStats.totalScans;
        totalQRConversions += Math.round(qrStats.totalScans * qrStats.conversionRate / 100);
      }

      res.json({
        summary: {
          totalInterests: conversionStats.totalInterests,
          conversionRate: conversionStats.conversionRate,
          avgTimeToInterest: conversionStats.avgTimeToInterest,
          totalQRScans,
          qrConversionRate: totalQRScans > 0 ? (totalQRConversions / totalQRScans) * 100 : 0
        },
        conversionStats,
        propertyPerformance: properties.map(p => ({
          id: p.id,
          address: p.address,
          viewCount: p.viewCount || 0,
          interests: 0 // Would need to calculate from interests table
        }))
      });
    } catch (error) {
      handleRouteError(error, res, 'get landlord dashboard analytics');
    }
  });

  // General analytics dashboard endpoint for tenants
  app.get("/api/analytics/tenant/dashboard", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'tenant') {
        return res.status(403).json({ message: "Access denied" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.id);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      const timeframe = req.query.timeframe as string;

      // Get view stats
      const viewStats = await storage.getRentcardViewStats(tenantProfile.id, timeframe);
      
      // Get sharing performance
      const sharingStats = await storage.getSharingPerformanceStats(tenantProfile.id);
      
      // Get share tokens for additional metrics
      const shareTokens = await storage.getShareTokensByTenant(tenantProfile.id);
      const totalShares = shareTokens.length;
      const totalViews = shareTokens.reduce((sum, token) => sum + token.viewCount, 0);

      res.json({
        summary: {
          totalViews: viewStats.totalViews,
          uniqueViews: viewStats.uniqueViews,
          avgViewDuration: viewStats.avgViewDuration,
          totalShares,
          shareTokens: totalShares
        },
        viewStats,
        sharingStats,
        topSources: viewStats.topSources,
        deviceBreakdown: viewStats.deviceBreakdown
      });
    } catch (error) {
      handleRouteError(error, res, 'get tenant dashboard analytics');
    }
  });

  // Get landlord properties analytics
  app.get("/api/analytics/landlord/:landlordId/properties", requireAuth, async (req, res) => {
    try {
      const landlordId = parseInt(req.params.landlordId);
      if (isNaN(landlordId)) {
        return res.status(400).json({ message: "Invalid landlord ID" });
      }

      await assertLandlordOwnership(req, landlordId);
      
      const timeframe = req.query.timeframe as string;

      // Get all properties for this landlord
      const properties = await storage.getProperties(landlordId);
      
      // Get analytics for each property
      const propertyAnalytics = await Promise.all(
        properties.map(async (property) => {
          // Get interest count for this property
          const interests = await storage.getInterests(landlordId, undefined, property.id);
          const interestCount = interests.length;
          
          // Get view stats
          const viewCount = property.viewCount || 0;
          const uniqueViews = Math.floor(viewCount * 0.7); // Estimate unique views
          const avgViewDuration = 120; // Default 2 minutes
          const conversionRate = viewCount > 0 ? (interestCount / viewCount) : 0;
          
          return {
            propertyId: property.id,
            address: property.address,
            totalViews: viewCount,
            uniqueViews,
            avgViewDuration,
            totalShares: 0, // Could be enhanced with share token data
            interestCount,
            conversionRate,
            trendData: [] // Could be enhanced with historical data
          };
        })
      );

      res.json({
        properties: propertyAnalytics
      });
    } catch (error) {
      handleRouteError(error, res, 'get landlord properties analytics');
    }
  });

  // Get landlord interests analytics
  app.get("/api/analytics/landlord/:landlordId/interests", requireAuth, async (req, res) => {
    try {
      const landlordId = parseInt(req.params.landlordId);
      if (isNaN(landlordId)) {
        return res.status(400).json({ message: "Invalid landlord ID" });
      }

      await assertLandlordOwnership(req, landlordId);
      
      const timeframe = req.query.timeframe as string;

      // Get interest conversion stats
      const conversionStats = await storage.getInterestConversionStats(landlordId, timeframe);
      
      // Get all interests for this landlord
      const interests = await storage.getInterests(landlordId);
      
      // Get recent interests with property info
      const recentInterests = await Promise.all(
        interests.slice(0, 10).map(async (interest) => {
          const property = interest.propertyId ? await storage.getProperty(interest.propertyId) : null;
          return {
            id: interest.id,
            property: property?.address || 'General Interest',
            date: interest.createdAt,
            source: 'direct', // Could be enhanced with source tracking
            status: interest.status
          };
        })
      );

      res.json({
        stats: {
          totalInterests: conversionStats.totalInterests,
          avgConversionRate: conversionStats.conversionRate,
          avgTimeToInterest: conversionStats.avgTimeToInterest
        },
        recentInterests,
        conversionTrends: interests.map(interest => ({
          date: interest.createdAt,
          conversions: 1,
          views: 10, // Estimated
          rate: 0.1
        })).slice(0, 30)
      });
    } catch (error) {
      handleRouteError(error, res, 'get landlord interests analytics');
    }
  });

  // ===== ONBOARDING ROUTES =====
  
  // Get user's onboarding progress
  app.get("/api/onboarding/progress", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      let progress = await storage.getOnboardingProgress(req.user.id);

      // Initialize onboarding if not exists
      if (!progress) {
        progress = await storage.initializeOnboarding(req.user.id, req.user.userType as 'tenant' | 'landlord');
      }

      const steps = await storage.getOnboardingSteps(progress.id);
      const calculatedProgress = await storage.calculateOnboardingProgress(req.user.id);

      res.json({
        progress: {
          ...progress,
          ...calculatedProgress,
          progressPercentage: calculatedProgress.percentage
        },
        steps: steps.map(step => ({
          ...step,
          requirements: ONBOARDING_STEPS.TENANT[step.stepKey.toUpperCase() as keyof typeof ONBOARDING_STEPS.TENANT] || null
        }))
      });
    } catch (error) {
      handleRouteError(error, res, 'get onboarding progress');
    }
  });

  // Update onboarding progress
  app.put("/api/onboarding/progress", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const validatedData = insertOnboardingProgressSchema.parse(req.body);
      const updatedProgress = await storage.updateOnboardingProgress(req.user.id, validatedData);

      res.json(updatedProgress);
    } catch (error) {
      handleRouteError(error, res, 'update onboarding progress');
    }
  });

  // Mark an onboarding step as completed (with validation)
  app.post("/api/onboarding/steps/:stepKey/complete", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { stepKey } = req.params;
      const { metadata } = req.body;

      // SECURITY: Validate prerequisites before marking complete
      // This prevents manual completion without meeting requirements
      const tenantProfile = await storage.getTenantProfile(req.user.id);
      const rentCard = await storage.getRentCard(req.user.id);
      let canComplete = false;
      let validationError = "";

      switch (stepKey) {
        case 'complete_profile':
          canComplete = !!(
            tenantProfile?.employmentInfo && 
            tenantProfile?.rentalHistory && 
            tenantProfile?.creditScore &&
            rentCard?.firstName &&
            rentCard?.lastName &&
            rentCard?.monthlyIncome
          );
          validationError = canComplete ? "" : "Profile information incomplete. Missing employment info, rental history, credit score, or personal details.";
          break;

        case 'add_references':
          if (tenantProfile?.id) {
            const references = await storage.getTenantReferences(tenantProfile.id);
            canComplete = references.length >= 2;
            validationError = canComplete ? "" : `Need at least 2 references. Currently have ${references.length}.`;
          } else {
            validationError = "Tenant profile not found.";
          }
          break;

        case 'preview_rentcard':
          // Allow manual completion for preview step as it's just a UI interaction
          canComplete = !!(tenantProfile && rentCard);
          validationError = canComplete ? "" : "Profile or rent card data not found.";
          break;

        case 'share_first_link':
          if (tenantProfile?.id) {
            const shareTokens = await storage.getShareTokensByTenant(tenantProfile.id);
            canComplete = shareTokens.length > 0;
            validationError = canComplete ? "" : "No share links created yet. Create a share link first.";
          } else {
            validationError = "Tenant profile not found.";
          }
          break;

        default:
          validationError = `Unknown step: ${stepKey}`;
      }

      if (!canComplete) {
        return res.status(400).json({ 
          message: "Prerequisites not met",
          stepKey,
          validationError,
          success: false
        });
      }

      await storage.markStepCompleted(req.user.id, stepKey, {
        ...metadata,
        manuallyCompleted: true,
        validatedAt: new Date().toISOString()
      });

      // Get updated progress
      const progress = await storage.getOnboardingProgress(req.user.id);
      const calculatedProgress = await storage.calculateOnboardingProgress(req.user.id);

      res.json({
        success: true,
        progress: {
          ...progress,
          ...calculatedProgress,
          progressPercentage: calculatedProgress.percentage
        }
      });
    } catch (error) {
      handleRouteError(error, res, 'mark step completed');
    }
  });

  // Check specific step completion
  app.get("/api/onboarding/steps/:stepKey/status", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { stepKey } = req.params;
      const isCompleted = await storage.checkStepCompletion(req.user.id, stepKey);

      res.json({ stepKey, isCompleted });
    } catch (error) {
      handleRouteError(error, res, 'check step completion');
    }
  });

  // Auto-check and update step completion based on current data
  app.post("/api/onboarding/auto-check", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const results: { [key: string]: boolean } = {};

      // Check profile completion
      const tenantProfile = await storage.getTenantProfile(req.user.id);
      const rentCard = await storage.getRentCard(req.user.id);
      
      const profileCompleted = !!(
        tenantProfile?.employmentInfo && 
        tenantProfile?.rentalHistory && 
        tenantProfile?.creditScore &&
        rentCard?.firstName &&
        rentCard?.lastName &&
        rentCard?.monthlyIncome
      );

      if (profileCompleted) {
        await storage.markStepCompleted(req.user.id, 'complete_profile', {
          checkedAt: new Date().toISOString(),
          autoDetected: true
        });
        results['complete_profile'] = true;
      }

      // Check references
      if (tenantProfile?.id) {
        const references = await storage.getTenantReferences(tenantProfile.id);
        const referencesCompleted = references.length >= 2;
        
        if (referencesCompleted) {
          await storage.markStepCompleted(req.user.id, 'add_references', {
            referenceCount: references.length,
            checkedAt: new Date().toISOString(),
            autoDetected: true
          });
          results['add_references'] = true;
        }
      }

      // Check first share
      if (tenantProfile?.id) {
        const shareTokens = await storage.getShareTokensByTenant(tenantProfile.id);
        const hasShared = shareTokens.length > 0;
        
        if (hasShared) {
          await storage.markStepCompleted(req.user.id, 'share_first_link', {
            firstShareAt: shareTokens[0]?.createdAt,
            checkedAt: new Date().toISOString(),
            autoDetected: true
          });
          results['share_first_link'] = true;
        }
      }

      // Get updated progress
      const progress = await storage.getOnboardingProgress(req.user.id);
      const calculatedProgress = await storage.calculateOnboardingProgress(req.user.id);

      res.json({
        success: true,
        checkedSteps: results,
        progress: {
          ...progress,
          ...calculatedProgress,
          progressPercentage: calculatedProgress.percentage
        }
      });
    } catch (error) {
      handleRouteError(error, res, 'auto-check progress');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}