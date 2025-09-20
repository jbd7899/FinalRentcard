import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { storage } from "./storage";
import { 
  insertPropertySchema, insertInterestSchema, clientInterestSchema, insertShareTokenSchema, insertPropertyQRCodeSchema,
  insertTenantContactPreferencesSchema, insertCommunicationLogSchema, insertTenantBlockedContactsSchema, insertCommunicationTemplateSchema,
  insertShortlinkSchema, insertShortlinkClickSchema, insertRecipientContactSchema, insertTenantMessageTemplateSchema, insertContactSharingHistorySchema,
  // Import referral schemas
  insertReferralSchema, insertReferralRewardSchema,
  // Import RentCard request and prospect list schemas
  insertRentCardRequestSchema, insertProspectListSchema
} from "@shared/schema";
import { 
  properties, interests, propertyImages, propertyAmenities, Interest, shareTokens, ShareToken, PropertyQRCode,
  TenantContactPreferences, CommunicationLog, TenantBlockedContact, CommunicationTemplate, Shortlink, ShortlinkClick,
  RecipientContact, TenantMessageTemplate, ContactSharingHistory,
  // Import referral types
  Referral, ReferralReward,
  // Import RentCard request and prospect list types
  RentCardRequest, ProspectList
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
import { emailService, EmailType } from "./services/emailService";

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
  if (!req.user?.claims?.sub) {
    throw new Error("Unauthorized: No user session");
  }
  
  const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
  if (!tenantProfile || tenantProfile.id !== tenantId) {
    throw new Error("Forbidden: Access denied to this tenant resource");
  }
}

async function assertLandlordOwnership(req: any, landlordId: number): Promise<void> {
  if (!req.user?.claims?.sub) {
    throw new Error("Unauthorized: No user session");
  }
  
  const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
  if (!landlordProfile || landlordProfile.id !== landlordId) {
    throw new Error("Forbidden: Access denied to this landlord resource");
  }
}

async function assertReferenceOwnership(req: any, referenceId: number): Promise<void> {
  if (!req.user?.claims?.sub) {
    throw new Error("Unauthorized: No user session");
  }
  
  const reference = await storage.getTenantReferenceById(referenceId);
  if (!reference) {
    throw new Error("Reference not found");
  }
  
  const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
  if (!tenantProfile || !reference.tenantId || tenantProfile.id !== reference.tenantId) {
    throw new Error("Forbidden: Access denied to this reference");
  }
}

async function assertDocumentOwnership(req: any, documentId: number): Promise<void> {
  if (!req.user?.claims?.sub) {
    throw new Error("Unauthorized: No user session");
  }
  
  const document = await storage.getTenantDocumentById(documentId);
  if (!document) {
    throw new Error("Document not found");
  }
  
  const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
  if (!tenantProfile || !document.tenantId || tenantProfile.id !== document.tenantId) {
    throw new Error("Forbidden: Access denied to this document");
  }
}

async function assertPropertyOwnership(req: any, propertyId: number): Promise<void> {
  if (!req.user?.claims?.sub) {
    throw new Error("Unauthorized: No user session");
  }
  
  const property = await storage.getProperty(propertyId);
  if (!property) {
    throw new Error("Property not found");
  }
  
  const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
  if (!landlordProfile || landlordProfile.id !== property.landlordId) {
    throw new Error("Forbidden: Access denied to this property");
  }
}

async function assertRentCardRequestOwnership(req: any, requestId: number): Promise<void> {
  if (!req.user?.claims?.sub) {
    throw new Error("Unauthorized: No user session");
  }
  
  const request = await storage.getRentCardRequestById(requestId);
  if (!request) {
    throw new Error("RentCard request not found");
  }
  
  const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
  if (!landlordProfile || landlordProfile.id !== request.landlordId) {
    throw new Error("Forbidden: Access denied to this RentCard request");
  }
}

async function assertProspectListOwnership(req: any, listId: number): Promise<void> {
  if (!req.user?.claims?.sub) {
    throw new Error("Unauthorized: No user session");
  }
  
  const list = await storage.getProspectListById(listId);
  if (!list) {
    throw new Error("Prospect list not found");
  }
  
  const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
  if (!landlordProfile || landlordProfile.id !== list.landlordId) {
    throw new Error("Forbidden: Access denied to this prospect list");
  }
}

async function assertShareTokenOwnership(req: any, tokenId: number): Promise<void> {
  if (!req.user?.claims?.sub) {
    throw new Error("Unauthorized: No user session");
  }
  
  const shareToken = await storage.getShareTokenById(tokenId);
  if (!shareToken) {
    throw new Error("Share token not found");
  }
  
  const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
  if (!tenantProfile || tenantProfile.id !== shareToken.tenantId) {
    throw new Error("Forbidden: Access denied to this share token");
  }
}

async function assertLandlordTenantAssociation(req: any, tenantId: number): Promise<void> {
  if (!req.user?.claims?.sub) {
    throw new Error("Unauthorized: No user session");
  }
  
  const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
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
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // Use the database user ID stored in the session
      const userId = req.user.claims.dbUserId || req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check for existing profiles to determine setup status
      const tenantProfile = await storage.getTenantProfile(userId);
      const landlordProfile = await storage.getLandlordProfile(userId);
      
      const response = {
        ...user,
        profiles: {
          tenant: tenantProfile,
          landlord: landlordProfile
        },
        // Use the actual database value for requiresSetup
        requiresSetup: user.requiresSetup || false,
        availableRoles: {
          tenant: !tenantProfile,
          landlord: !landlordProfile
        }
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Role update endpoint
  app.patch('/api/auth/user/role', isAuthenticated, async (req: any, res) => {
    try {
      // Use the database user ID stored in the session
      const userId = req.user.claims.dbUserId || req.user.claims.sub;
      const { userType } = req.body;

      // Validate role
      if (!userType || !['tenant', 'landlord'].includes(userType)) {
        return res.status(400).json({ 
          message: "Invalid role. Must be 'tenant' or 'landlord'" 
        });
      }

      // Update user role and clear requiresSetup
      const updatedUser = await storage.updateUser(userId, {
        userType,
        requiresSetup: false,
        availableRoles: {
          tenant: true,
          landlord: true
        }
      });

      res.json({ 
        message: "Role updated successfully",
        user: updatedUser 
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  // Note: isAuthenticated middleware imported from replitAuth.ts handles Replit Auth sessions

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
          ipAddress: metadata.ipAddress || null,
          userAgent: metadata.userAgent || null,
          referrer: metadata.referrer || null,
          deviceInfo: metadata.deviceInfo || undefined,
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
  app.post("/api/shortlinks", isAuthenticated, async (req, res) => {
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
        const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
        if (tenantProfile) {
          tenantId = tenantProfile.id;
        }
      } else if (req.user?.userType === 'landlord') {
        const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
        if (landlordProfile) {
          landlordId = landlordProfile.id;
        }
      }

      const shortlinkData: any = {
        ...data,
        slug,
        isActive: true,
      };
      
      // Only include fields if they have values (omit undefined)
      if (tenantId) shortlinkData.tenantId = tenantId;
      if (landlordId) shortlinkData.landlordId = landlordId;
      if (data.description) shortlinkData.description = data.description;
      if (data.expiresAt) shortlinkData.expiresAt = data.expiresAt;
      if (data.propertyId) shortlinkData.propertyId = data.propertyId;
      
      const shortlink = await storage.createShortlink(shortlinkData);

      res.json(shortlink);
    } catch (error) {
      handleRouteError(error, res, 'create shortlink');
    }
  });

  // Get user's shortlinks
  app.get("/api/shortlinks", isAuthenticated, async (req, res) => {
    try {
      let shortlinks: Shortlink[] = [];
      
      if (req.user?.userType === 'tenant') {
        const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
        if (tenantProfile) {
          shortlinks = await storage.getShortlinks(tenantProfile.id);
        }
      } else if (req.user?.userType === 'landlord') {
        const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
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
  app.get("/api/shortlinks/:id/analytics", isAuthenticated, async (req, res) => {
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
  app.get("/api/profile/tenant/:userId", isAuthenticated, async (req, res) => {
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
  app.get("/api/tenant/profile", isAuthenticated, async (req, res) => {
    try {
      // Use the database user ID stored in the session
      const userId = req.user?.claims?.dbUserId || req.user?.claims?.sub;
      if (!userId) {
        console.error('Unauthorized access to tenant profile: No user ID in request');
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      console.log(`Fetching tenant profile for user ID: ${userId}`);
      const profile = await storage.getTenantProfile(String(userId));
      
      if (!profile) {
        console.log(`No tenant profile found for user ID: ${req.user.claims.sub}`);
        return res.status(404).json({ message: "Profile not found" });
      }
      
      console.log(`Successfully retrieved tenant profile for user ID: ${req.user.claims.sub}`);
      res.json(profile);
    } catch (error) {
      handleRouteError(error, res, '/api/tenant/profile endpoint');
    }
  });

  // Add endpoint for specific tenant profile (with authorization check)
  app.get("/api/tenant/profile/:tenantId", isAuthenticated, async (req, res) => {
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
      
      console.log(`Fetching tenant profile for user ID: ${req.user.claims.sub} (verified tenant ID: ${tenantId})`);
      const profile = await storage.getTenantProfile(req.user.claims.sub);
      
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
  app.get("/api/landlord/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.dbUserId || req.user?.claims?.sub;
      if (!userId) {
        console.error('Unauthorized access to landlord profile: No user ID in request');
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      console.log(`Fetching landlord profile for user ID: ${userId}`);
      const profile = await storage.getLandlordProfile(String(userId));
      
      if (!profile) {
        console.log(`No landlord profile found for user ID: ${req.user.claims.sub}`);
        return res.status(404).json({ message: "Profile not found" });
      }
      
      console.log(`Successfully retrieved landlord profile for user ID: ${req.user.claims.sub}`);
      res.json(profile);
    } catch (error) {
      handleRouteError(error, res, '/api/landlord/profile endpoint');
    }
  });

  app.post("/api/profile/tenant", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Ensure the profile is created for the authenticated user
      const profileData = { ...req.body, userId: req.user.claims.sub };
      const profile = await storage.createTenantProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      handleRouteError(error, res, 'creating tenant profile');
    }
  });

  app.get("/api/profile/landlord/:userId", isAuthenticated, async (req, res) => {
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

  app.post("/api/profile/landlord", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Ensure the profile is created for the authenticated user
      const profileData = { ...req.body, userId: req.user.claims.sub };
      const profile = await storage.createLandlordProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      handleRouteError(error, res, 'creating landlord profile');
    }
  });

  // PUT endpoint for updating tenant profile
  app.put("/api/tenant/profile", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      console.log(`Updating tenant profile for user ID: ${req.user.claims.sub}`);
      
      // Get the user's tenant profile to get the profile ID
      const existingProfile = await storage.getTenantProfile(req.user.claims.sub);
      if (!existingProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }
      
      // Process the request body and convert string dates to Date objects
      const profileData = { ...req.body };
      
      // Convert moveInDate string to Date object if present
      if (profileData.moveInDate && typeof profileData.moveInDate === 'string') {
        profileData.moveInDate = new Date(profileData.moveInDate);
      }
      
      // Update the profile
      const updatedProfile = await storage.updateTenantProfile(existingProfile.id, profileData);
      
      console.log(`Successfully updated tenant profile for user ID: ${req.user.claims.sub}`);
      res.json(updatedProfile);
    } catch (error) {
      handleRouteError(error, res, '/api/tenant/profile PUT endpoint');
    }
  });

  // POST endpoint for creating tenant RentCard
  app.post("/api/tenant/rentcard", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      console.log(`Creating RentCard for user ID: ${req.user.claims.sub}`);
      
      // Validate the request body against the RentCard schema
      const validatedData = {
        ...req.body,
        userId: req.user.claims.sub
      };
      
      // Create the RentCard
      const rentCard = await storage.createRentCard(validatedData);
      
      console.log(`Successfully created RentCard for user ID: ${req.user.claims.sub}`);
      res.status(201).json(rentCard);
    } catch (error) {
      handleRouteError(error, res, '/api/tenant/rentcard POST endpoint');
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
      const slug = req.params.slug;
      let property;
      
      // Handle property-{id} format for QR code compatibility
      if (slug.startsWith('property-')) {
        const propertyId = parseInt(slug.replace('property-', ''));
        if (!isNaN(propertyId)) {
          property = await storage.getProperty(propertyId);
        }
      } else {
        // Original slug-based lookup
        property = await storage.getPropertyBySlug(slug);
      }
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Increment view count
      await storage.incrementPropertyViewCount(property.id);

      // Get updated property with new view count - handle both slug types
      let updatedProperty;
      if (slug.startsWith('property-')) {
        updatedProperty = await storage.getProperty(property.id);
      } else {
        updatedProperty = await storage.getPropertyBySlug(slug);
      }
      
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

  app.post("/api/landlord/properties", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get the landlord profile
      const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
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

  app.post("/api/properties/:propertyId/images", isAuthenticated, propertyImageUpload.single('image'), async (req, res) => {
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

  app.put("/api/properties/images/:imageId/primary", isAuthenticated, async (req, res) => {
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

  app.delete("/api/properties/images/:imageId", isAuthenticated, async (req, res) => {
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

  app.post("/api/properties/:propertyId/amenities", isAuthenticated, async (req, res) => {
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

  app.delete("/api/properties/amenities/:amenityId", isAuthenticated, async (req, res) => {
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
  app.get("/api/properties/:propertyId/qrcodes", isAuthenticated, async (req, res) => {
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

  app.post("/api/properties/:propertyId/qrcodes", isAuthenticated, async (req, res) => {
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

  app.get("/api/properties/qrcodes/:qrCodeId", isAuthenticated, async (req, res) => {
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

  app.put("/api/properties/qrcodes/:qrCodeId", isAuthenticated, async (req, res) => {
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

  app.delete("/api/properties/qrcodes/:qrCodeId", isAuthenticated, async (req, res) => {
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
        await storage.createQRCodeAnalytics({
          qrCodeId: qrCodeId,
          propertyId: qrCode.propertyId || null,
          scanLocation: null,
          scannerInfo: metadata.deviceInfo ? {
            deviceType: metadata.deviceInfo.type,
            os: metadata.deviceInfo.os,
            browser: metadata.deviceInfo.browser
          } : null,
          subsequentAction: 'qr_scanned',
          sessionDuration: null,
          conversionValue: null
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
        await storage.createQRCodeAnalytics({
          qrCodeId: qrCodeId,
          propertyId: qrCode.propertyId || null,
          scanLocation: null,
          scannerInfo: metadata.deviceInfo ? {
            deviceType: metadata.deviceInfo.type,
            os: metadata.deviceInfo.os,
            browser: metadata.deviceInfo.browser
          } : null,
          subsequentAction: 'qr_scanned',
          sessionDuration: null,
          conversionValue: null
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
  app.get("/api/applications", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { propertyId } = req.query;
      
      // Get applications based on user type
      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
      const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
      
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

  app.post("/api/applications", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get the tenant profile
      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
      if (!tenantProfile) {
        return res.status(400).json({ message: "Tenant profile not found" });
      }

      // Check if tenant profile is complete enough to share (alternative to requiring a separate RentCard)
      const hasBasicInfo = tenantProfile.employmentInfo && tenantProfile.creditScore && tenantProfile.maxRent;
      if (!hasBasicInfo) {
        return res.status(400).json({ message: "Please complete your profile before applying" });
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
      const user = await storage.getUser(req.user.claims.sub);
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
          name: user.email.split('@')[0], // Use email username as name for now
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
        const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
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
                propertyInfo = property ? ` for ${property.address}` : '';
              }

              const title = "Someone is interested in you!";
              const message = `${landlordName} submitted interest in your RentCard${propertyInfo}`;

              // Create the notification with all required fields
              const notificationData: any = {
                userId: tenantProfile.userId,
                type: 'interest_submission',
                title,
                content: message,
                priority: 'high',
                isRead: false,
                relatedEntityType: 'interest',
                deliveryMethods: ['in_app'],
                emailSent: false,
                metadata: {
                  landlordId: clientData.landlordId,
                  actionUrl: `/tenant/dashboard?tab=interests`
                }
              };
              
              if (clientData.propertyId) {
                notificationData.relatedEntityId = clientData.propertyId;
              }
              
              await storage.createNotification(notificationData);
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
  app.get("/api/interests", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { propertyId, status } = req.query;
      
      // Get user profile to determine access permissions
      const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
      
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
  app.get("/api/interests/:id", isAuthenticated, async (req, res) => {
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
      const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
      
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
        enrichedInterest.viewedAt = new Date();
      }

      res.json(enrichedInterest);
    } catch (error) {
      handleRouteError(error, res, 'get interest details');
    }
  });

  app.post("/api/interests/:id/contact", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const interestId = parseInt(req.params.id);
      if (isNaN(interestId)) {
        return res.status(400).json({ message: "Invalid interest ID" });
      }

      // Verify landlord ownership via interest -> landlord relationship
      const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
      if (!landlordProfile) {
        return res.status(403).json({ message: "Only landlords can manage interests" });
      }

      const updatedInterest = await storage.updateInterestStatus(interestId, 'contacted');
      res.json(updatedInterest);
    } catch (error) {
      handleRouteError(error, res, 'contact interest');
    }
  });

  app.post("/api/interests/:id/archive", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const interestId = parseInt(req.params.id);
      if (isNaN(interestId)) {
        return res.status(400).json({ message: "Invalid interest ID" });
      }

      // Verify landlord ownership via interest -> landlord relationship
      const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
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
  app.get("/api/tenant/rentcard", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const rentCard = await storage.getRentCard(req.user.claims.sub);
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
  app.post("/api/share-tokens", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      // Check if tenant profile is complete enough to share (alternative to requiring a separate RentCard)
      const hasBasicInfo = tenantProfile.employmentInfo && tenantProfile.creditScore && tenantProfile.maxRent;
      if (!hasBasicInfo) {
        return res.status(400).json({ message: "Please complete your profile before sharing" });
      }

      const validatedData = insertShareTokenSchema.parse(req.body);
      const shareToken = await storage.createShareToken(tenantProfile.id, validatedData);

      res.status(201).json(shareToken);
    } catch (error) {
      handleRouteError(error, res, 'create share token');
    }
  });

  app.get("/api/share-tokens", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.dbUserId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const tenantProfile = await storage.getTenantProfile(String(userId));
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      const shareTokens = await storage.getShareTokensByTenant(tenantProfile.id);
      res.json(shareTokens);
    } catch (error) {
      handleRouteError(error, res, 'list share tokens');
    }
  });

  app.patch("/api/share-tokens/:id/revoke", isAuthenticated, async (req, res) => {
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

      // Get the user info for the tenant profile
      const user = await storage.getUser(tenantProfile.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if tenant profile is complete enough to share
      const hasBasicInfo = tenantProfile.employmentInfo && tenantProfile.creditScore && tenantProfile.maxRent;
      if (!hasBasicInfo) {
        return res.status(404).json({ message: "RentCard profile is incomplete" });
      }

      // Track the view (existing simple tracking)
      await storage.trackTokenView(token);

      // Enhanced analytics tracking
      try {
        const metadata = extractRequestMetadata(req);
        await storage.createRentcardView({
          shareTokenId: shareToken.id,
          tenantId: shareToken.tenantId,
          viewerFingerprint: generateViewerFingerprint(req),
          ipAddress: metadata.ipAddress || null,
          userAgent: metadata.userAgent || null,
          referrer: metadata.referrer || null,
          source: 'share_link',
          sourceId: token,
          location: null, // Could be enhanced with GeoIP
          deviceInfo: metadata.deviceInfo || null,
          viewDuration: null, // Could be tracked with frontend analytics
          actionsPerformed: null, // Could be tracked with frontend analytics
          isUnique: true // Could be determined by checking previous views
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
            const deviceType = metadata.deviceInfo?.type || 'desktop';
            
            let title = "Someone viewed your RentCard!";
            let message = `Your RentCard was viewed from ${deviceType}`;
            
            // Location info could be added here with GeoIP

            // Create the notification with all required fields
            await storage.createNotification({
              userId: tenantProfile.userId,
              type: 'rentcard_view',
              title,
              content: message,
              priority: 'normal',
              isRead: false,
              relatedEntityType: 'shareToken',
              relatedEntityId: shareToken.id,
              deliveryMethods: ['in_app'],
              emailSent: false,
              emailSentAt: null,
              clickedAt: null,
              viewData: {
                shareTokenId: shareToken.id,
                viewerInfo: {
                  deviceType: deviceType,
                  source: 'direct'
                }
              },
              interestData: null,
              metadata: {
                shareTokenId: shareToken.id,
                actionUrl: `/tenant/dashboard?tab=analytics`
              }
            });
          }
        }
      } catch (notificationError) {
        // Don't fail the request if notification creation fails
        console.error('Notification creation failed:', notificationError);
      }

      // Return the tenant profile data formatted as a RentCard
      const rentCardData = {
        firstName: user.email.split('@')[0], // Use email username as first name for now
        lastName: '', // Can be enhanced when we add name fields
        email: user.email,
        phone: user.phone || '',
        moveInDate: tenantProfile.moveInDate,
        maxRent: tenantProfile.maxRent,
        currentRent: tenantProfile.maxRent || 0, // Use maxRent as fallback for currentRent
        creditScore: tenantProfile.creditScore,
        employmentInfo: tenantProfile.employmentInfo,
        rentalHistory: tenantProfile.rentalHistory || [],
        references: [], // References are stored separately and can be fetched if needed
        documents: [], // Documents can be added later if needed
        interests: [] // Interests are stored separately and can be fetched if needed
      };
      
      res.json(rentCardData);
    } catch (error) {
      handleRouteError(error, res, 'access shared rent card');
    }
  });

  app.patch("/api/applications/:id/status", isAuthenticated, async (req, res) => {
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
      const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
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
  app.get("/api/documents/:tenantId", isAuthenticated, async (req, res) => {
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

  app.post("/api/documents/upload", isAuthenticated, documentUpload.single("document"), async (req, res) => {
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
      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
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

  app.delete("/api/documents/:id", isAuthenticated, async (req, res) => {
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

  app.put("/api/documents/:id/verify", isAuthenticated, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Verify the user is a landlord (only landlords should verify documents)
      const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
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
  app.get("/api/tenant/references/:tenantId", isAuthenticated, async (req, res) => {
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

  app.get("/api/tenant/references/detail/:id", isAuthenticated, async (req, res) => {
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

  app.post("/api/tenant/references", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Get the authenticated user's tenant profile
      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
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

  app.put("/api/tenant/references/:id", isAuthenticated, async (req, res) => {
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

  app.delete("/api/tenant/references/:id", isAuthenticated, async (req, res) => {
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

  app.post("/api/tenant/references/:id/send-verification", isAuthenticated, async (req, res) => {
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
  app.get("/api/tenant/contacts", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
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

  app.get("/api/tenant/contacts/:id", isAuthenticated, async (req, res) => {
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
      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
      if (!tenantProfile || contact.tenantId !== tenantProfile.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(contact);
    } catch (error) {
      handleRouteError(error, res, 'get recipient contact');
    }
  });

  app.post("/api/tenant/contacts", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      // Validate the request body
      const validatedData = insertRecipientContactSchema.parse(req.body);

      const contact = await storage.createRecipientContact({
        ...validatedData,
        tenantId: tenantProfile.id,
        phone: validatedData.phone || null,
        notes: validatedData.notes || null,
        company: validatedData.company || null,
        propertyAddress: validatedData.propertyAddress || null
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

  app.put("/api/tenant/contacts/:id", isAuthenticated, async (req, res) => {
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
      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
      if (!tenantProfile || contact.tenantId !== tenantProfile.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedContact = await storage.updateRecipientContact(contactId, req.body);
      res.json(updatedContact);
    } catch (error) {
      handleRouteError(error, res, 'update recipient contact');
    }
  });

  app.delete("/api/tenant/contacts/:id", isAuthenticated, async (req, res) => {
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
      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
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
  app.get("/api/tenant/message-templates", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
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

  app.get("/api/tenant/message-templates/:id", isAuthenticated, async (req, res) => {
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
      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
      if (!tenantProfile || template.tenantId !== tenantProfile.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(template);
    } catch (error) {
      handleRouteError(error, res, 'get tenant message template');
    }
  });

  app.post("/api/tenant/message-templates", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
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

  app.put("/api/tenant/message-templates/:id", isAuthenticated, async (req, res) => {
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
      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
      if (!tenantProfile || template.tenantId !== tenantProfile.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedTemplate = await storage.updateTenantMessageTemplate(templateId, req.body);
      res.json(updatedTemplate);
    } catch (error) {
      handleRouteError(error, res, 'update tenant message template');
    }
  });

  app.delete("/api/tenant/message-templates/:id", isAuthenticated, async (req, res) => {
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
      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
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
  app.get("/api/tenant/sharing-history", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
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

  app.post("/api/tenant/sharing-history", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      // Validate the request body
      const validatedData = insertContactSharingHistorySchema.parse(req.body);

      const history = await storage.createContactSharingHistory({
        ...validatedData,
        tenantId: tenantProfile.id,
        notes: validatedData.notes || null,
        shareTokenId: validatedData.shareTokenId ?? null,
        templateId: validatedData.templateId ?? null,
        shortlinkId: validatedData.shortlinkId ?? null,
        messageUsed: validatedData.messageUsed || null,
        subjectUsed: validatedData.subjectUsed || null
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

  app.post("/api/tenant/sharing-history/:id/mark-response", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const historyId = parseInt(req.params.id);
      const { notes } = req.body;

      // Verify ownership by checking if the sharing history belongs to the tenant
      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
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
  app.get("/api/tenant/notifications", isAuthenticated, async (req, res) => {
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

      const notifications = await storage.getUserNotifications(req.user.claims.sub, options);
      res.json(notifications);
    } catch (error) {
      handleRouteError(error, res, 'get user notifications');
    }
  });

  // Get notification count/badge count
  app.get("/api/tenant/notifications/count", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { unreadOnly } = req.query;
      const count = await storage.getUserNotificationCount(req.user.claims.sub, unreadOnly === 'true');
      
      res.json({ count });
    } catch (error) {
      handleRouteError(error, res, 'get notification count');
    }
  });

  // Mark notification as read
  app.post("/api/tenant/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const notificationId = parseInt(req.params.id);
      
      // Verify ownership by getting the notification first
      const notifications = await storage.getUserNotifications(req.user.claims.sub);
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
  app.post("/api/tenant/notifications/:id/click", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const notificationId = parseInt(req.params.id);
      
      // Verify ownership
      const notifications = await storage.getUserNotifications(req.user.claims.sub);
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
  app.post("/api/tenant/notifications/read-all", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await storage.markAllNotificationsAsRead(req.user.claims.sub);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      handleRouteError(error, res, 'mark all notifications as read');
    }
  });

  // Get notification preferences
  app.get("/api/tenant/notification-preferences", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      let preferences = await storage.getUserNotificationPreferences(req.user.claims.sub);
      
      // Create default preferences if none exist
      if (!preferences) {
        preferences = await storage.createUserNotificationPreferences({
          userId: req.user.claims.sub,
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
          groupSimilarNotifications: true,
          quietHoursStart: null,
          quietHoursEnd: null
        });
      }
      
      res.json(preferences);
    } catch (error) {
      handleRouteError(error, res, 'get notification preferences');
    }
  });

  // Update notification preferences
  app.put("/api/tenant/notification-preferences", isAuthenticated, async (req, res) => {
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
      let preferences = await storage.getUserNotificationPreferences(req.user.claims.sub);
      
      if (!preferences) {
        preferences = await storage.createUserNotificationPreferences({
          ...validationResult.data,
          userId: req.user.claims.sub,
          quietHoursStart: validationResult.data.quietHoursStart ?? null,
          quietHoursEnd: validationResult.data.quietHoursEnd ?? null,
          rentcardViewsEnabled: validationResult.data.rentcardViewsEnabled ?? true,
          rentcardViewsEmail: validationResult.data.rentcardViewsEmail ?? false,
          rentcardViewsFrequency: validationResult.data.rentcardViewsFrequency ?? 'instant',
          interestSubmissionsEnabled: validationResult.data.interestSubmissionsEnabled ?? true,
          interestSubmissionsEmail: validationResult.data.interestSubmissionsEmail ?? true,
          interestSubmissionsFrequency: validationResult.data.interestSubmissionsFrequency ?? 'instant',
          weeklySummaryEnabled: validationResult.data.weeklySummaryEnabled ?? true,
          weeklySummaryEmail: validationResult.data.weeklySummaryEmail ?? true,
          weeklySummaryDay: validationResult.data.weeklySummaryDay ?? 'monday',
          systemNotificationsEnabled: validationResult.data.systemNotificationsEnabled ?? true,
          systemNotificationsEmail: validationResult.data.systemNotificationsEmail ?? false,
          timezone: validationResult.data.timezone ?? 'America/New_York',
          emailDigestEnabled: validationResult.data.emailDigestEnabled ?? false,
          emailDigestFrequency: validationResult.data.emailDigestFrequency ?? 'daily',
          maxNotificationsPerHour: validationResult.data.maxNotificationsPerHour ?? 10,
          groupSimilarNotifications: validationResult.data.groupSimilarNotifications ?? true
        });
      } else {
        preferences = await storage.updateUserNotificationPreferences(req.user.claims.sub, validationResult.data);
      }
      
      res.json(preferences);
    } catch (error) {
      handleRouteError(error, res, 'update notification preferences');
    }
  });

  // Get notification statistics and analytics
  app.get("/api/tenant/notification-stats", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { timeframe } = req.query;
      const stats = await storage.getUserNotificationStats(req.user.claims.sub, timeframe as string);
      
      res.json(stats);
    } catch (error) {
      handleRouteError(error, res, 'get notification stats');
    }
  });

  // Delete old notifications (cleanup endpoint)
  app.delete("/api/tenant/notifications/cleanup", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { olderThanDays } = req.query;
      const days = olderThanDays ? parseInt(olderThanDays as string) : 30;
      const olderThanDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      await storage.deleteUserNotifications(req.user.claims.sub, olderThanDate);
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

      const notification = await storage.createNotification({
        ...validationResult.data,
        isRead: validationResult.data.isRead ?? false,
        priority: validationResult.data.priority ?? 'normal',
        relatedEntityType: validationResult.data.relatedEntityType ?? null,
        relatedEntityId: validationResult.data.relatedEntityId ?? null,
        deliveryMethods: Array.isArray(validationResult.data.deliveryMethods) ? validationResult.data.deliveryMethods as string[] : null,
        viewData: validationResult.data.viewData as {
          shareTokenId?: number;
          viewerInfo?: {
            deviceType?: 'desktop' | 'mobile' | 'tablet';
            location?: string;
            source?: string;
          };
          viewDuration?: number;
          isUnique?: boolean;
        } | null ?? null,
        interestData: validationResult.data.interestData as {
          landlordInfo?: {
            name?: string;
            companyName?: string;
            email?: string;
          };
          propertyInfo?: {
            address?: string;
            rent?: number;
          };
          message?: string;
        } | null ?? null,
        emailSent: validationResult.data.emailSent ?? false,
        emailSentAt: validationResult.data.emailSentAt ?? null,
        clickedAt: validationResult.data.clickedAt ?? null,
        metadata: validationResult.data.metadata ? {
          aggregationKey: validationResult.data.metadata.aggregationKey as string,
          suppressEmail: validationResult.data.metadata.suppressEmail as boolean,
          expiresAt: validationResult.data.metadata.expiresAt as string,
          actionUrl: validationResult.data.metadata.actionUrl as string,
          landlordId: validationResult.data.metadata.landlordId as number,
          shareTokenId: validationResult.data.metadata.shareTokenId as number,
          summaryData: validationResult.data.metadata.summaryData
        } : null
      });
      res.json(notification);
    } catch (error) {
      handleRouteError(error, res, 'create notification');
    }
  });

  // Landlord view of tenant references
  app.get("/api/landlord/tenant/:tenantId/references", isAuthenticated, async (req, res) => {
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
  app.patch("/api/properties/:id", isAuthenticated, async (req, res) => {
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
      const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
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
  app.get("/api/tenant/contact-preferences", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'tenant') {
        return res.status(403).json({ message: "Access denied" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      const preferences = await storage.getTenantContactPreferences(tenantProfile.id);
      res.json(preferences || null);
    } catch (error) {
      handleRouteError(error, res, 'get contact preferences');
    }
  });

  app.post("/api/tenant/contact-preferences", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'tenant') {
        return res.status(403).json({ message: "Access denied" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
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
          tenantId: tenantProfile.id,
          isActive: validatedData.isActive ?? true,
          allowUnknownContacts: validatedData.allowUnknownContacts ?? false,
          allowPhoneCalls: validatedData.allowPhoneCalls ?? true,
          allowTextMessages: validatedData.allowTextMessages ?? true,
        });
      }

      res.status(201).json(preferences);
    } catch (error) {
      handleRouteError(error, res, 'create/update contact preferences');
    }
  });

  app.put("/api/tenant/contact-preferences", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'tenant') {
        return res.status(403).json({ message: "Access denied" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
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
  app.get("/api/communication-logs", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { tenantId, propertyId } = req.query;

      let logs;
      if (req.user.userType === 'landlord') {
        const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
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
        const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
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

  app.post("/api/communication-logs", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'landlord') {
        return res.status(403).json({ message: "Only landlords can create communication logs" });
      }

      const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
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
        landlordId: landlordProfile.id,
        tenantId: validatedData.tenantId ?? null,
        propertyId: validatedData.propertyId ?? null,
        message: validatedData.message || null,
        subject: validatedData.subject ?? null,
        recipientInfo: validatedData.recipientInfo || { name: '', email: '', phone: '' },
        threadId: validatedData.threadId || null,
        templateId: validatedData.templateId ?? null,
        metadata: validatedData.metadata as {
          deliveryTimestamp?: string;
          readTimestamp?: string;
          errorMessage?: string;
          retryCount?: number;
        } | null || null
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

  app.get("/api/communication-logs/thread/:threadId", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { threadId } = req.params;
      const logs = await storage.getCommunicationThread(threadId);
      
      // Verify user has access to this thread
      const userCanAccess = logs.some(log => {
        if (req.user?.userType === 'landlord') {
          const landlordProfile = storage.getLandlordProfile(req.user.claims.sub);
          return landlordProfile.then(profile => profile?.id === log.landlordId);
        } else if (req.user?.userType === 'tenant') {
          const tenantProfile = storage.getTenantProfile(req.user.claims.sub);
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

  app.patch("/api/communication-logs/:id/status", isAuthenticated, async (req, res) => {
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
  app.get("/api/tenant/blocked-contacts", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'tenant') {
        return res.status(403).json({ message: "Access denied" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      const blockedContacts = await storage.getTenantBlockedContacts(tenantProfile.id);
      res.json(blockedContacts);
    } catch (error) {
      handleRouteError(error, res, 'get blocked contacts');
    }
  });

  app.post("/api/tenant/blocked-contacts", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'tenant') {
        return res.status(403).json({ message: "Access denied" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
      if (!tenantProfile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      // Validate the request body
      const validatedData = insertTenantBlockedContactsSchema.parse(req.body);
      
      const blockedContact = await storage.createTenantBlockedContact({
        ...validatedData,
        tenantId: tenantProfile.id,
        landlordId: validatedData.landlordId ?? null,
        blockedEmail: validatedData.blockedEmail ?? null,
        blockedPhone: validatedData.blockedPhone ?? null,
        reason: validatedData.reason ?? null,
        blockedUntil: validatedData.blockedUntil ?? null
      });

      res.status(201).json(blockedContact);
    } catch (error) {
      handleRouteError(error, res, 'create blocked contact');
    }
  });

  app.delete("/api/tenant/blocked-contacts/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'tenant') {
        return res.status(403).json({ message: "Access denied" });
      }

      const contactId = parseInt(req.params.id);
      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
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

  app.post("/api/tenant/check-blocked", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'tenant') {
        return res.status(403).json({ message: "Access denied" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
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
  app.get("/api/landlord/communication-templates", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'landlord') {
        return res.status(403).json({ message: "Access denied" });
      }

      const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
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

  app.post("/api/landlord/communication-templates", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'landlord') {
        return res.status(403).json({ message: "Access denied" });
      }

      const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
      if (!landlordProfile) {
        return res.status(404).json({ message: "Landlord profile not found" });
      }

      // Validate the request body
      const validatedData = insertCommunicationTemplateSchema.parse(req.body);
      
      const template = await storage.createCommunicationTemplate({
        ...validatedData,
        landlordId: landlordProfile.id,
        isActive: validatedData.isActive ?? true
      });

      res.status(201).json(template);
    } catch (error) {
      handleRouteError(error, res, 'create communication template');
    }
  });

  app.put("/api/landlord/communication-templates/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'landlord') {
        return res.status(403).json({ message: "Access denied" });
      }

      const templateId = parseInt(req.params.id);
      const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
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

  app.delete("/api/landlord/communication-templates/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'landlord') {
        return res.status(403).json({ message: "Access denied" });
      }

      const templateId = parseInt(req.params.id);
      const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
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
  app.get("/api/landlord/tenant/:tenantId/contact-preferences", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'landlord') {
        return res.status(403).json({ message: "Access denied" });
      }

      const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
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
  app.post("/api/landlord/can-contact-tenant", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'landlord') {
        return res.status(403).json({ message: "Access denied" });
      }

      const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
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
        ipAddress: metadata.ipAddress || null,
        userAgent: metadata.userAgent || null,
        referrer: metadata.referrer || null,
        source,
        sourceId,
        deviceInfo: metadata.deviceInfo || null,
        location: null, // Can be enhanced with GeoIP later
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
        performanceScore: 0, // Will be calculated later based on engagement
        firstViewDate: null,
        totalViews: 0,
        uniqueViewers: 0,
        conversionToInterest: false,
        conversionDate: null
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
          deviceType: metadata.deviceInfo?.type || 'desktop',
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
  app.get("/api/analytics/tenant/:tenantId/views", isAuthenticated, async (req, res) => {
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
  app.get("/api/analytics/tenant/:tenantId/sharing", isAuthenticated, async (req, res) => {
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
  app.get("/api/analytics/landlord/:landlordId/conversions", isAuthenticated, async (req, res) => {
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
  app.get("/api/analytics/property/:propertyId/qr-stats", isAuthenticated, async (req, res) => {
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
  app.get("/api/analytics/landlord/dashboard", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'landlord') {
        return res.status(403).json({ message: "Access denied" });
      }

      const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
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
  app.get("/api/analytics/tenant/dashboard", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id || req.user.userType !== 'tenant') {
        return res.status(403).json({ message: "Access denied" });
      }

      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
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
  app.get("/api/analytics/landlord/:landlordId/properties", isAuthenticated, async (req, res) => {
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
  app.get("/api/analytics/landlord/:landlordId/interests", isAuthenticated, async (req, res) => {
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
  app.get("/api/onboarding/progress", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      let progress = await storage.getOnboardingProgress(req.user.claims.sub);

      // Initialize onboarding if not exists
      if (!progress) {
        progress = await storage.initializeOnboarding(req.user.claims.sub, req.user.userType as 'tenant' | 'landlord');
      }

      const steps = await storage.getOnboardingSteps(progress.id);
      const calculatedProgress = await storage.calculateOnboardingProgress(req.user.claims.sub);

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
  app.put("/api/onboarding/progress", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const validatedData = insertOnboardingProgressSchema.parse(req.body);
      const updatedProgress = await storage.updateOnboardingProgress(req.user.claims.sub, validatedData);

      res.json(updatedProgress);
    } catch (error) {
      handleRouteError(error, res, 'update onboarding progress');
    }
  });

  // Mark an onboarding step as completed (with validation)
  app.post("/api/onboarding/steps/:stepKey/complete", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { stepKey } = req.params;
      const { metadata } = req.body;

      // SECURITY: Validate prerequisites before marking complete
      // This prevents manual completion without meeting requirements
      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
      const rentCard = await storage.getRentCard(req.user.claims.sub);
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

      await storage.markStepCompleted(req.user.claims.sub, stepKey, {
        ...metadata,
        manuallyCompleted: true,
        validatedAt: new Date().toISOString()
      });

      // Get updated progress
      const progress = await storage.getOnboardingProgress(req.user.claims.sub);
      const calculatedProgress = await storage.calculateOnboardingProgress(req.user.claims.sub);

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
  app.get("/api/onboarding/steps/:stepKey/status", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { stepKey } = req.params;
      const isCompleted = await storage.checkStepCompletion(req.user.claims.sub, stepKey);

      res.json({ stepKey, isCompleted });
    } catch (error) {
      handleRouteError(error, res, 'check step completion');
    }
  });

  // Auto-check and update step completion based on current data
  app.post("/api/onboarding/auto-check", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const results: { [key: string]: boolean } = {};

      // Check profile completion
      const tenantProfile = await storage.getTenantProfile(req.user.claims.sub);
      const rentCard = await storage.getRentCard(req.user.claims.sub);
      
      const profileCompleted = !!(
        tenantProfile?.employmentInfo && 
        tenantProfile?.rentalHistory && 
        tenantProfile?.creditScore
      );

      if (profileCompleted) {
        await storage.markStepCompleted(req.user.claims.sub, 'complete_profile', {
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
          await storage.markStepCompleted(req.user.claims.sub, 'add_references', {
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
          await storage.markStepCompleted(req.user.claims.sub, 'share_first_link', {
            firstShareAt: shareTokens[0]?.createdAt,
            checkedAt: new Date().toISOString(),
            autoDetected: true
          });
          results['share_first_link'] = true;
        }
      }

      // Get updated progress
      const progress = await storage.getOnboardingProgress(req.user.claims.sub);
      const calculatedProgress = await storage.calculateOnboardingProgress(req.user.claims.sub);

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

  // ============================================================================
  // REFERRAL API ENDPOINTS - PHASE 1 NETWORK EFFECTS
  // ============================================================================

  // 1. POST /api/referrals/create - Create referral relationship when user clicks referral link
  app.post("/api/referrals/create", async (req, res) => {
    try {
      const validatedData = insertReferralSchema.parse(req.body);
      
      // Validate referral eligibility if referrer is provided
      if (validatedData.referrerUserId && validatedData.refereeEmail) {
        const eligibility = await storage.validateReferralEligibility(
          validatedData.referrerUserId, 
          validatedData.refereeEmail
        );
        
        if (!eligibility.eligible) {
          return res.status(400).json({ 
            message: "Referral not eligible",
            reason: eligibility.reason,
            success: false
          });
        }
      }

      // Extract request metadata for attribution tracking
      const metadata = extractRequestMetadata(req);
      
      const referral = await storage.createReferral({
        ...validatedData,
        metadata: {
          ...validatedData.metadata,
          deviceInfo: metadata.deviceInfo,
          locationInfo: metadata.referrer ? { source: metadata.referrer } : undefined,
          originalUrl: req.originalUrl,
          customData: { createdVia: 'api', userAgent: metadata.userAgent }
        }
      });

      // Track the referral click
      await storage.trackReferralClick(referral.referralCode, metadata);

      res.status(201).json({
        success: true,
        referral: {
          id: referral.id,
          referralCode: referral.referralCode,
          status: referral.status,
          expiresAt: referral.expiresAt
        }
      });
    } catch (error) {
      handleRouteError(error, res, 'create referral');
    }
  });

  // 2. POST /api/referrals/convert - Track conversion events (signup, first share, etc.)
  app.post("/api/referrals/convert", async (req, res) => {
    try {
      const { referralCode, conversionEvent, refereeUserId, metadata } = req.body;
      
      if (!referralCode || !conversionEvent) {
        return res.status(400).json({ 
          message: "referralCode and conversionEvent are required",
          success: false
        });
      }

      // Validate conversion event
      const validEvents = ['signup', 'first_rentcard', 'property_inquiry', 'application_submitted'];
      if (!validEvents.includes(conversionEvent)) {
        return res.status(400).json({ 
          message: `Invalid conversion event. Must be one of: ${validEvents.join(', ')}`,
          success: false
        });
      }

      const referral = await storage.convertReferral(referralCode, conversionEvent, refereeUserId);
      
      // Get any rewards that were created
      const rewards = await storage.getReferralRewards(referral.referrerUserId || 0);
      const newRewards = rewards.filter(r => 
        r.referralId === referral.id && 
        r.triggerEvent === conversionEvent
      );

      res.json({
        success: true,
        referral: {
          id: referral.id,
          status: referral.status,
          conversionEvent: referral.conversionEvent,
          convertedAt: referral.convertedAt
        },
        rewardsCreated: newRewards.length,
        rewards: newRewards.map(r => ({
          id: r.id,
          type: r.rewardType,
          value: r.rewardValue,
          description: r.rewardDescription,
          recipientType: r.recipientType
        }))
      });
    } catch (error) {
      handleRouteError(error, res, 'convert referral');
    }
  });

  // 3. GET /api/referrals/stats/:userId - Get user's referral statistics and rewards
  app.get("/api/referrals/stats/:userId", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Verify user can access these stats (own stats or admin)
      if (req.user?.id !== userId) {
        return res.status(403).json({ 
          message: "Access denied: You can only view your own referral statistics",
          success: false
        });
      }

      const stats = await storage.getReferralStats(userId);
      
      // Get detailed referrals and rewards
      const referrals = await storage.getReferralsByReferrer(userId);
      const rewards = await storage.getReferralRewards(userId);
      
      // Get available (earned but not claimed) rewards
      const availableRewards = rewards.filter(r => r.status === 'earned');
      
      res.json({
        success: true,
        stats,
        summary: {
          totalReferrals: stats.totalReferrals,
          conversionRate: `${stats.conversionRate}%`,
          totalEarned: `$${(stats.claimedRewards + stats.pendingRewards) / 100}`,
          availableToRedeem: `$${stats.pendingRewards / 100}`,
          availableRewardsCount: availableRewards.length
        },
        recentReferrals: referrals.slice(0, 10).map(r => ({
          id: r.id,
          referralCode: r.referralCode,
          refereeEmail: r.refereeEmail,
          status: r.status,
          conversionEvent: r.conversionEvent,
          createdAt: r.createdAt,
          convertedAt: r.convertedAt
        })),
        availableRewards: availableRewards.map(r => ({
          id: r.id,
          type: r.rewardType,
          value: r.rewardValue,
          description: r.rewardDescription,
          earnedAt: r.earnedAt,
          expiresAt: r.expiresAt
        }))
      });
    } catch (error) {
      handleRouteError(error, res, 'get referral stats');
    }
  });

  // 4. POST /api/referrals/claim-reward - Allow users to claim available rewards
  app.post("/api/referrals/claim-reward", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { rewardId } = req.body;
      
      if (!rewardId) {
        return res.status(400).json({ 
          message: "rewardId is required",
          success: false
        });
      }

      const claimedReward = await storage.claimReward(parseInt(rewardId), req.user.claims.sub);
      
      res.json({
        success: true,
        message: "Reward claimed successfully",
        reward: {
          id: claimedReward.id,
          type: claimedReward.rewardType,
          value: claimedReward.rewardValue,
          description: claimedReward.rewardDescription,
          redeemedAt: claimedReward.redeemedAt,
          redemptionDetails: claimedReward.redemptionDetails
        }
      });
    } catch (error) {
      handleRouteError(error, res, 'claim reward');
    }
  });

  // 5. GET /api/share-tokens/:token/with-referral - Enhanced token endpoint with referral attribution
  app.get("/api/share-tokens/:token/with-referral", async (req, res) => {
    try {
      const { token } = req.params;
      const referralCode = req.query.ref as string;
      
      const shareToken = await storage.getShareToken(token);
      if (!shareToken) {
        return res.status(404).json({ message: "Share token not found" });
      }

      if (shareToken.revoked) {
        return res.status(410).json({ message: "Share token has been revoked" });
      }

      if (shareToken.expiresAt && new Date() > new Date(shareToken.expiresAt)) {
        return res.status(410).json({ message: "Share token has expired" });
      }

      // Track the view
      await storage.trackTokenView(token);
      
      // If referral code is provided, create referral attribution
      let referralAttribution = null;
      if (referralCode) {
        try {
          const referral = await storage.getReferralByCode(referralCode);
          if (referral && referral.status === 'pending') {
            // Update referral with share token link
            await storage.updateReferralStatus(referral.id, 'pending', undefined, {
              ...referral.metadata,
              shareTokenAccessed: token,
              accessedAt: new Date().toISOString(),
              accessSource: 'share_token_with_referral'
            });
            
            referralAttribution = {
              referralCode: referral.referralCode,
              referrerName: referral.referrerName,
              eligible: true
            };
          }
        } catch (referralError) {
          console.error('Error processing referral attribution:', referralError);
          // Don't fail the request if referral processing fails
        }
      }

      // Get tenant profile for rent card data
      const tenantProfile = await storage.getTenantProfileById(shareToken.tenantId);
      const user = tenantProfile ? await storage.getUser(tenantProfile.userId || "") : null;
      const rentCard = user ? await storage.getRentCard(user.id) : null;

      res.json({
        success: true,
        shareToken: {
          token: shareToken.token,
          scope: shareToken.scope,
          createdAt: shareToken.createdAt,
          expiresAt: shareToken.expiresAt
        },
        tenantProfile,
        rentCard,
        referralAttribution,
        metadata: {
          viewCount: shareToken.viewCount + 1,
          lastViewed: new Date().toISOString()
        }
      });
    } catch (error) {
      handleRouteError(error, res, 'get share token with referral');
    }
  });

  // 6. POST /api/shortlinks/with-referral - Enhanced shortlink creation with referral codes
  app.post("/api/shortlinks/with-referral", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { referralCode, ...shortlinkData } = req.body;
      const validatedData = insertShortlinkSchema.parse(shortlinkData);

      // Create the shortlink with referral attribution
      const shortlink = await storage.createShortlinkWithReferral(validatedData, referralCode);
      
      // If referral code was provided, get referral info
      let referralInfo = null;
      if (referralCode) {
        try {
          const referral = await storage.getReferralByCode(referralCode);
          if (referral) {
            referralInfo = {
              referralCode: referral.referralCode,
              referrerName: referral.referrerName,
              attribution: 'shortlink_creation'
            };
          }
        } catch (referralError) {
          console.error('Error linking referral to shortlink:', referralError);
          // Don't fail shortlink creation if referral linking fails
        }
      }

      res.status(201).json({
        success: true,
        shortlink: {
          id: shortlink.id,
          slug: shortlink.slug,
          targetUrl: shortlink.targetUrl,
          shortUrl: `${req.protocol}://${req.get('host')}/r/${shortlink.slug}`,
          resourceType: shortlink.resourceType,
          isActive: shortlink.isActive,
          expiresAt: shortlink.expiresAt,
          createdAt: shortlink.createdAt
        },
        referralAttribution: referralInfo
      });
    } catch (error) {
      handleRouteError(error, res, 'create shortlink with referral');
    }
  });

  // ============================================================================
  // RENTCARD REQUESTS API ENDPOINTS
  // ============================================================================

  // POST /api/rentcard-requests/create - Create individual RentCard request
  app.post("/api/rentcard-requests/create", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Verify landlord profile
      const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
      if (!landlordProfile) {
        return res.status(403).json({ message: "Landlord profile required" });
      }

      // Validate request data
      const validatedData = insertRentCardRequestSchema.parse(req.body);

      // Create the request
      const request = await storage.createRentCardRequest({
        ...validatedData,
        landlordId: landlordProfile.id,
      });

      // Send email to prospect
      try {
        const landlordUser = await storage.getUser(req.user.claims.sub);
        const landlordName = landlordUser?.name || landlordProfile.companyName || 'Your Landlord';
        
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const rentCardUrl = `${baseUrl}/rentcard/request/${request.requestToken}`;
        
        await emailService.sendEmail(
          EmailType.RENTCARD_REQUEST,
          validatedData.prospectEmail,
          {
            prospectName: validatedData.prospectName,
            tenantName: landlordName, // Using landlord name as sender
            propertyAddress: validatedData.propertyAddress || 'Available Property',
            rentCardUrl,
            contactInfo: validatedData.landlordContactInfo || landlordUser?.email || ''
          },
          {
            subject: `RentCard Request from ${landlordName}`
          }
        );

        // Update request as sent
        await storage.updateRentCardRequestStatus(request.id, 'sent');
      } catch (emailError) {
        console.error('Error sending RentCard request email:', emailError);
        // Don't fail the request creation if email fails
      }

      res.status(201).json({
        success: true,
        request: {
          id: request.id,
          requestToken: request.requestToken,
          prospectName: request.prospectName,
          prospectEmail: request.prospectEmail,
          status: request.status,
          sentAt: request.sentAt,
          expiresAt: request.expiresAt,
          createdAt: request.createdAt
        }
      });
    } catch (error) {
      handleRouteError(error, res, 'create RentCard request');
    }
  });

  // POST /api/rentcard-requests/bulk-create - Create bulk RentCard requests
  app.post("/api/rentcard-requests/bulk-create", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Verify landlord profile
      const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
      if (!landlordProfile) {
        return res.status(403).json({ message: "Landlord profile required" });
      }

      const { requests, propertyAddress, landlordContactInfo } = req.body;
      
      if (!Array.isArray(requests) || requests.length === 0) {
        return res.status(400).json({ message: "Requests array is required and cannot be empty" });
      }

      const createdRequests = [];
      const errors = [];

      // Get landlord info for emails
      const landlordUser = await storage.getUser(req.user.claims.sub);
      const landlordName = landlordUser?.name || landlordProfile.companyName || 'Your Landlord';
      const baseUrl = `${req.protocol}://${req.get('host')}`;

      // Process each request
      for (let i = 0; i < requests.length; i++) {
        try {
          const requestData = requests[i];
          
          // Validate individual request
          const validatedData = insertRentCardRequestSchema.parse({
            ...requestData,
            propertyAddress: requestData.propertyAddress || propertyAddress,
            landlordContactInfo: requestData.landlordContactInfo || landlordContactInfo,
          });

          // Create the request
          const request = await storage.createRentCardRequest({
            ...validatedData,
            landlordId: landlordProfile.id,
          });

          // Send email
          try {
            const rentCardUrl = `${baseUrl}/rentcard/request/${request.requestToken}`;
            
            await emailService.sendEmail(
              EmailType.RENTCARD_REQUEST,
              validatedData.prospectEmail,
              {
                prospectName: validatedData.prospectName,
                tenantName: landlordName,
                propertyAddress: validatedData.propertyAddress || 'Available Property',
                rentCardUrl,
                contactInfo: validatedData.landlordContactInfo || landlordUser?.email || ''
              },
              {
                subject: `RentCard Request from ${landlordName}`
              }
            );

            await storage.updateRentCardRequestStatus(request.id, 'sent');
          } catch (emailError) {
            console.error(`Error sending email for request ${i}:`, emailError);
          }

          createdRequests.push({
            id: request.id,
            requestToken: request.requestToken,
            prospectName: request.prospectName,
            prospectEmail: request.prospectEmail,
            status: request.status,
            sentAt: request.sentAt,
            createdAt: request.createdAt
          });
        } catch (requestError) {
          errors.push({
            index: i,
            prospect: requests[i]?.prospectEmail || 'Unknown',
            error: requestError instanceof Error ? requestError.message : 'Unknown error'
          });
        }
      }

      res.status(201).json({
        success: true,
        created: createdRequests.length,
        requests: createdRequests,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      handleRouteError(error, res, 'bulk create RentCard requests');
    }
  });

  // GET /api/rentcard-requests/landlord/:landlordId - Get all requests for landlord
  app.get("/api/rentcard-requests/landlord/:landlordId", isAuthenticated, async (req, res) => {
    try {
      const landlordId = parseInt(req.params.landlordId);
      
      // Verify ownership
      await assertLandlordOwnership(req, landlordId);
      
      const status = req.query.status as string | undefined;
      const requests = await storage.getRentCardRequests(landlordId, status);
      
      res.json({
        success: true,
        requests
      });
    } catch (error) {
      handleRouteError(error, res, 'get landlord RentCard requests');
    }
  });

  // PUT /api/rentcard-requests/:id/status - Update request status
  app.put("/api/rentcard-requests/:id/status", isAuthenticated, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { status, metadata } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      // Verify ownership
      await assertRentCardRequestOwnership(req, requestId);
      
      const updatedRequest = await storage.updateRentCardRequestStatus(requestId, status, metadata);
      
      res.json({
        success: true,
        request: updatedRequest
      });
    } catch (error) {
      handleRouteError(error, res, 'update RentCard request status');
    }
  });

  // ============================================================================
  // PROSPECT LISTS API ENDPOINTS
  // ============================================================================

  // POST /api/prospect-lists/create - Create/manage prospect contact lists
  app.post("/api/prospect-lists/create", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Verify landlord profile
      const landlordProfile = await storage.getLandlordProfile(req.user.claims.sub);
      if (!landlordProfile) {
        return res.status(403).json({ message: "Landlord profile required" });
      }

      // Validate request data
      const validatedData = insertProspectListSchema.parse(req.body);

      // Create the prospect list
      const list = await storage.createProspectList({
        ...validatedData,
        landlordId: landlordProfile.id,
      });

      res.status(201).json({
        success: true,
        list
      });
    } catch (error) {
      handleRouteError(error, res, 'create prospect list');
    }
  });

  // GET /api/prospect-lists/landlord/:landlordId - Get landlord's prospect lists
  app.get("/api/prospect-lists/landlord/:landlordId", isAuthenticated, async (req, res) => {
    try {
      const landlordId = parseInt(req.params.landlordId);
      
      // Verify ownership
      await assertLandlordOwnership(req, landlordId);
      
      const lists = await storage.getProspectLists(landlordId);
      
      res.json({
        success: true,
        lists
      });
    } catch (error) {
      handleRouteError(error, res, 'get landlord prospect lists');
    }
  });

  // DELETE /api/prospect-lists/:id - Delete prospect list
  app.delete("/api/prospect-lists/:id", isAuthenticated, async (req, res) => {
    try {
      const listId = parseInt(req.params.id);
      
      // Verify ownership
      await assertProspectListOwnership(req, listId);
      
      await storage.deleteProspectList(listId);
      
      res.json({
        success: true,
        message: "Prospect list deleted successfully"
      });
    } catch (error) {
      handleRouteError(error, res, 'delete prospect list');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}