import { 
  User, TenantProfile, LandlordProfile, Property, Interest, RentCard, ShareToken, PropertyQRCode,
  TenantContactPreferences, CommunicationLog, TenantBlockedContact, CommunicationTemplate 
} from "@shared/schema";
import { 
  users, tenantProfiles, landlordProfiles, properties, interests, rentCards, shareTokens, propertyQRCodes,
  tenantContactPreferences, communicationLogs, tenantBlockedContacts, communicationTemplates 
} from "@shared/schema";
import { db, sql } from "./db";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Import new schema types
import {
  TenantDocument, PropertyImage, PropertyAmenity, TenantReference,
  Conversation, Message, Notification, RoommateGroup, GroupApplication,
  NeighborhoodInsight, RentcardView, ViewSession, InterestAnalytics,
  AnalyticsAggregation, SharingAnalytics, QRCodeAnalytics,
  tenantDocuments, propertyImages, propertyAmenities, tenantReferences,
  conversations, messages, notifications, roommateGroups, groupApplications,
  conversationParticipants, roommateGroupMembers, propertyAnalytics, userActivity,
  neighborhoodInsights, rentcardViews, viewSessions, interestAnalytics,
  analyticsAggregations, sharingAnalytics, qrCodeAnalytics
} from "@shared/schema-enhancements";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id" | "createdAt">): Promise<User>;

  // Tenant profile operations
  getTenantProfile(userId: number): Promise<TenantProfile | undefined>;
  getTenantProfileById(id: number): Promise<TenantProfile | undefined>;
  createTenantProfile(profile: Omit<TenantProfile, "id">): Promise<TenantProfile>;
  updateTenantProfile(id: number, profile: Partial<TenantProfile>): Promise<TenantProfile>;

  // Landlord profile operations
  getLandlordProfile(userId: number): Promise<LandlordProfile | undefined>;
  getLandlordProfileById(id: number): Promise<LandlordProfile | undefined>;
  createLandlordProfile(profile: Omit<LandlordProfile, "id">): Promise<LandlordProfile>;
  updateLandlordProfile(id: number, profile: Partial<LandlordProfile>): Promise<LandlordProfile>;

  // Property operations
  getProperties(landlordId?: number): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  getPropertyBySlug(slug: string): Promise<Property | undefined>;
  createProperty(property: Omit<Property, "id">): Promise<Property>;
  updateProperty(id: number, property: Partial<Property>): Promise<Property>;
  incrementPropertyViewCount(id: number): Promise<void>;

  // Interest operations
  getInterests(landlordId?: number, tenantId?: number, propertyId?: number): Promise<Interest[]>;
  createInterest(interest: Omit<Interest, "id" | "createdAt" | "viewedAt">): Promise<Interest>;
  updateInterestStatus(id: number, status: string): Promise<Interest>;
  markInterestAsViewed(id: number): Promise<Interest>;

  // Rent card operations
  getRentCard(userId: number): Promise<RentCard | undefined>;

  // Share token operations
  createShareToken(tenantId: number, data: { scope?: string; expiresAt?: Date }): Promise<ShareToken>;
  getShareToken(token: string): Promise<ShareToken | undefined>;
  getShareTokenById(id: number): Promise<ShareToken | undefined>;
  getShareTokensByTenant(tenantId: number): Promise<ShareToken[]>;
  revokeShareToken(id: number): Promise<ShareToken>;
  trackTokenView(token: string): Promise<void>;

  // Document operations
  getTenantDocuments(tenantId: number): Promise<TenantDocument[]>;
  getTenantDocumentById(id: number): Promise<TenantDocument | undefined>;
  createTenantDocument(document: Omit<TenantDocument, "id" | "isVerified" | "verifiedBy" | "verifiedAt" | "uploadedAt">): Promise<TenantDocument>;
  verifyTenantDocument(id: number, verifiedBy: number): Promise<TenantDocument>;
  deleteTenantDocument(id: number): Promise<void>;

  // Property image operations
  getPropertyImages(propertyId: number): Promise<PropertyImage[]>;
  getPropertyImageById(id: number): Promise<PropertyImage | undefined>;
  createPropertyImage(image: Omit<PropertyImage, "id" | "uploadedAt">): Promise<PropertyImage>;
  setPrimaryPropertyImage(id: number): Promise<PropertyImage>;
  deletePropertyImage(id: number): Promise<void>;

  // Property amenity operations
  getPropertyAmenities(propertyId: number): Promise<PropertyAmenity[]>;
  createPropertyAmenity(amenity: Omit<PropertyAmenity, "id">): Promise<PropertyAmenity>;
  deletePropertyAmenity(id: number): Promise<void>;

  // Tenant reference operations
  getTenantReferences(tenantId: number): Promise<TenantReference[]>;
  getTenantReferenceById(id: number): Promise<TenantReference | undefined>;
  createTenantReference(reference: Omit<TenantReference, "id" | "isVerified" | "verificationDate">): Promise<TenantReference>;
  updateTenantReference(id: number, reference: Partial<TenantReference>): Promise<TenantReference>;
  verifyTenantReference(id: number): Promise<TenantReference>;
  deleteTenantReference(id: number): Promise<void>;

  // Conversation operations
  getConversations(userId: number): Promise<Conversation[]>;
  createConversation(conversation: Omit<Conversation, "id" | "createdAt">, participantIds: number[]): Promise<Conversation>;
  getMessages(conversationId: number): Promise<Message[]>;
  createMessage(message: Omit<Message, "id" | "sentAt" | "readAt">): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message>;

  // Notification operations
  getUserNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: Omit<Notification, "id" | "createdAt">): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification>;

  // Roommate operations
  getRoommateGroups(tenantId?: number): Promise<RoommateGroup[]>;
  createRoommateGroup(group: Omit<RoommateGroup, "id" | "createdAt">, primaryTenantId: number): Promise<RoommateGroup>;
  addTenantToGroup(groupId: number, tenantId: number, isPrimary?: boolean): Promise<void>;
  getGroupApplications(groupId: number): Promise<GroupApplication[]>;
  createGroupApplication(application: Omit<GroupApplication, "id" | "submittedAt">): Promise<GroupApplication>;
  updateGroupApplicationStatus(id: number, status: string): Promise<GroupApplication>;

  // Analytics operations
  recordUserActivity(userId: number, activityType: string, metadata?: any): Promise<void>;
  updatePropertyAnalytics(propertyId: number): Promise<void>;

  // Enhanced Analytics operations
  // RentCard View Tracking
  createRentcardView(view: Omit<RentcardView, "id" | "timestamp">): Promise<RentcardView>;
  getRentcardViews(shareTokenId?: number, tenantId?: number, timeframe?: string): Promise<RentcardView[]>;
  getRentcardViewStats(tenantId: number, timeframe?: string): Promise<{
    totalViews: number;
    uniqueViews: number;
    avgViewDuration: number;
    topSources: { source: string; count: number }[];
    deviceBreakdown: { type: string; count: number }[];
  }>;

  // View Sessions
  createViewSession(session: Omit<ViewSession, "id" | "startTime">): Promise<ViewSession>;
  updateViewSession(id: number, updates: Partial<ViewSession>): Promise<ViewSession>;
  getViewSession(sessionFingerprint: string): Promise<ViewSession | undefined>;
  getViewSessions(shareTokenId?: number, tenantId?: number): Promise<ViewSession[]>;

  // Interest Analytics
  createInterestAnalytics(analytics: Omit<InterestAnalytics, "id" | "createdAt" | "updatedAt">): Promise<InterestAnalytics>;
  updateInterestAnalytics(id: number, updates: Partial<InterestAnalytics>): Promise<InterestAnalytics>;
  getInterestAnalytics(landlordId?: number, tenantId?: number, propertyId?: number): Promise<InterestAnalytics[]>;
  getInterestConversionStats(landlordId: number, timeframe?: string): Promise<{
    conversionRate: number;
    avgTimeToInterest: number;
    totalInterests: number;
    topSources: { source: string; count: number }[];
  }>;

  // Analytics Aggregations
  createAnalyticsAggregation(aggregation: Omit<AnalyticsAggregation, "id" | "createdAt">): Promise<AnalyticsAggregation>;
  getAnalyticsAggregations(entityType: string, entityId: number, aggregationType: string, startDate?: Date, endDate?: Date): Promise<AnalyticsAggregation[]>;
  updateDailyAggregations(): Promise<void>;

  // Sharing Analytics
  createSharingAnalytics(analytics: Omit<SharingAnalytics, "id" | "shareDate">): Promise<SharingAnalytics>;
  updateSharingAnalytics(id: number, updates: Partial<SharingAnalytics>): Promise<SharingAnalytics>;
  getSharingAnalytics(shareTokenId?: number, tenantId?: number): Promise<SharingAnalytics[]>;
  getSharingPerformanceStats(tenantId: number): Promise<{
    bestPerformingMethod: string;
    totalShares: number;
    avgPerformanceScore: number;
    conversionsByMethod: { method: string; conversions: number }[];
  }>;

  // QR Code Analytics  
  createQRCodeAnalytics(analytics: Omit<QRCodeAnalytics, "id" | "scanDate">): Promise<QRCodeAnalytics>;
  getQRCodeAnalytics(qrCodeId?: number, propertyId?: number): Promise<QRCodeAnalytics[]>;
  getQRCodeStats(propertyId: number): Promise<{
    totalScans: number;
    uniqueScans: number;
    conversionRate: number;
    topActions: { action: string; count: number }[];
  }>;

  // Neighborhood insights operations
  getNeighborhoodInsight(propertyId: number): Promise<NeighborhoodInsight | undefined>;
  createNeighborhoodInsight(insight: Omit<NeighborhoodInsight, "id" | "createdAt" | "updatedAt">): Promise<NeighborhoodInsight>;
  updateNeighborhoodInsight(id: number, insight: Partial<NeighborhoodInsight>): Promise<NeighborhoodInsight>;

  // Property QR Code operations
  getPropertyQRCodes(propertyId: number): Promise<PropertyQRCode[]>;
  getPropertyQRCodeById(id: number): Promise<PropertyQRCode | undefined>;
  createPropertyQRCode(qrCode: Omit<PropertyQRCode, "id" | "scanCount" | "lastScannedAt" | "createdAt" | "updatedAt">): Promise<PropertyQRCode>;
  updatePropertyQRCode(id: number, qrCode: Partial<PropertyQRCode>): Promise<PropertyQRCode>;
  trackQRCodeScan(id: number): Promise<void>;
  deletePropertyQRCode(id: number): Promise<void>;

  // Contact preference operations
  getTenantContactPreferences(tenantId: number): Promise<TenantContactPreferences | undefined>;
  createTenantContactPreferences(preferences: Omit<TenantContactPreferences, "id" | "createdAt" | "updatedAt">): Promise<TenantContactPreferences>;
  updateTenantContactPreferences(tenantId: number, preferences: Partial<TenantContactPreferences>): Promise<TenantContactPreferences>;

  // Communication log operations
  getCommunicationLogs(landlordId?: number, tenantId?: number, propertyId?: number): Promise<CommunicationLog[]>;
  createCommunicationLog(log: Omit<CommunicationLog, "id" | "createdAt">): Promise<CommunicationLog>;
  updateCommunicationLogStatus(id: number, status: string, metadata?: any): Promise<CommunicationLog>;
  getCommunicationThread(threadId: string): Promise<CommunicationLog[]>;

  // Blocked contacts operations
  getTenantBlockedContacts(tenantId: number): Promise<TenantBlockedContact[]>;
  createTenantBlockedContact(blockedContact: Omit<TenantBlockedContact, "id" | "createdAt">): Promise<TenantBlockedContact>;
  removeTenantBlockedContact(id: number): Promise<void>;
  isContactBlocked(tenantId: number, landlordId?: number, email?: string, phone?: string): Promise<boolean>;

  // Communication template operations
  getCommunicationTemplates(landlordId: number, category?: string): Promise<CommunicationTemplate[]>;
  getCommunicationTemplateById(id: number): Promise<CommunicationTemplate | undefined>;
  createCommunicationTemplate(template: Omit<CommunicationTemplate, "id" | "usageCount" | "createdAt" | "updatedAt">): Promise<CommunicationTemplate>;
  updateCommunicationTemplate(id: number, template: Partial<CommunicationTemplate>): Promise<CommunicationTemplate>;
  deleteCommunicationTemplate(id: number): Promise<void>;
  incrementTemplateUsage(id: number): Promise<void>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: Omit<User, "id" | "createdAt">): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getTenantProfile(userId: number): Promise<TenantProfile | undefined> {
    const [profile] = await db.select().from(tenantProfiles).where(eq(tenantProfiles.userId, userId));
    return profile;
  }

  async getTenantProfileById(id: number): Promise<TenantProfile | undefined> {
    const [profile] = await db.select().from(tenantProfiles).where(eq(tenantProfiles.id, id));
    return profile;
  }

  async createTenantProfile(profile: Omit<TenantProfile, "id">): Promise<TenantProfile> {
    const [newProfile] = await db.insert(tenantProfiles).values(profile).returning();
    return newProfile;
  }

  async updateTenantProfile(id: number, profile: Partial<TenantProfile>): Promise<TenantProfile> {
    const [updatedProfile] = await db
      .update(tenantProfiles)
      .set(profile)
      .where(eq(tenantProfiles.id, id))
      .returning();
    return updatedProfile;
  }

  async getLandlordProfile(userId: number): Promise<LandlordProfile | undefined> {
    const [profile] = await db.select().from(landlordProfiles).where(eq(landlordProfiles.userId, userId));
    return profile;
  }

  async getLandlordProfileById(id: number): Promise<LandlordProfile | undefined> {
    const [profile] = await db.select().from(landlordProfiles).where(eq(landlordProfiles.id, id));
    return profile;
  }

  async createLandlordProfile(profile: Omit<LandlordProfile, "id">): Promise<LandlordProfile> {
    const [newProfile] = await db.insert(landlordProfiles).values(profile).returning();
    return newProfile;
  }

  async updateLandlordProfile(id: number, profile: Partial<LandlordProfile>): Promise<LandlordProfile> {
    const [updatedProfile] = await db
      .update(landlordProfiles)
      .set(profile)
      .where(eq(landlordProfiles.id, id))
      .returning();
    return updatedProfile;
  }

  async getProperties(landlordId?: number): Promise<Property[]> {
    if (landlordId) {
      return db.select().from(properties).where(eq(properties.landlordId, landlordId));
    }
    return db.select().from(properties);
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async getPropertyBySlug(slug: string): Promise<Property | undefined> {
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.screeningPageSlug, slug));
    
    return property;
  }

  async createProperty(property: Omit<Property, "id">): Promise<Property> {
    const [newProperty] = await db.insert(properties).values(property).returning();
    return newProperty;
  }

  async updateProperty(id: number, property: Partial<Property>): Promise<Property> {
    const [updatedProperty] = await db
      .update(properties)
      .set(property)
      .where(eq(properties.id, id))
      .returning();
    return updatedProperty;
  }

  async incrementPropertyViewCount(id: number): Promise<void> {
    await db
      .update(properties)
      .set({ 
        viewCount: sql`${properties.viewCount} + 1` 
      })
      .where(eq(properties.id, id));
  }

  async getInterests(landlordId?: number, tenantId?: number, propertyId?: number): Promise<Interest[]> {
    let conditions = [];
    if (landlordId) conditions.push(eq(interests.landlordId, landlordId));
    if (tenantId) conditions.push(eq(interests.tenantId, tenantId));
    if (propertyId) conditions.push(eq(interests.propertyId, propertyId));

    const query = conditions.length > 0
      ? db.select().from(interests).where(and(...conditions))
      : db.select().from(interests);

    return await query;
  }

  async createInterest(interest: Omit<Interest, "id" | "createdAt" | "viewedAt">): Promise<Interest> {
    const [newInterest] = await db
      .insert(interests)
      .values(interest)
      .returning();
    return newInterest;
  }

  async updateInterestStatus(id: number, status: string): Promise<Interest> {
    const [updatedInterest] = await db
      .update(interests)
      .set({ status })
      .where(eq(interests.id, id))
      .returning();
    return updatedInterest;
  }

  async markInterestAsViewed(id: number): Promise<Interest> {
    const [updatedInterest] = await db
      .update(interests)
      .set({ viewedAt: new Date() })
      .where(eq(interests.id, id))
      .returning();
    return updatedInterest;
  }

  async getRentCard(userId: number): Promise<RentCard | undefined> {
    const [rentCard] = await db
      .select()
      .from(rentCards)
      .where(eq(rentCards.userId, userId));
    return rentCard;
  }

  async createRentCard(rentCard: Omit<RentCard, "id" | "createdAt" | "updatedAt">): Promise<RentCard> {
    const [newRentCard] = await db.insert(rentCards).values(rentCard).returning();
    return newRentCard;
  }

  // Share token operations
  async createShareToken(tenantId: number, data: { scope?: string; expiresAt?: Date }): Promise<ShareToken> {
    const { nanoid } = await import('nanoid');
    const token = nanoid(32); // Generate a secure 32-character token
    
    const [newShareToken] = await db
      .insert(shareTokens)
      .values({
        token,
        tenantId,
        scope: data.scope || 'rentcard',
        expiresAt: data.expiresAt,
      })
      .returning();
    
    return newShareToken;
  }

  async getShareToken(token: string): Promise<ShareToken | undefined> {
    const [shareToken] = await db
      .select()
      .from(shareTokens)
      .where(eq(shareTokens.token, token));
    return shareToken;
  }

  async getShareTokensByTenant(tenantId: number): Promise<ShareToken[]> {
    return await db
      .select()
      .from(shareTokens)
      .where(eq(shareTokens.tenantId, tenantId));
  }

  async revokeShareToken(id: number): Promise<ShareToken> {
    const [updatedToken] = await db
      .update(shareTokens)
      .set({ revoked: true })
      .where(eq(shareTokens.id, id))
      .returning();
    return updatedToken;
  }

  async getShareTokenById(id: number): Promise<ShareToken | undefined> {
    const [shareToken] = await db
      .select()
      .from(shareTokens)
      .where(eq(shareTokens.id, id));
    return shareToken;
  }

  async trackTokenView(token: string): Promise<void> {
    await db
      .update(shareTokens)
      .set({ 
        viewCount: sql`${shareTokens.viewCount} + 1`,
        lastViewedAt: new Date()
      })
      .where(eq(shareTokens.token, token));
  }

  // Document operations
  async getTenantDocuments(tenantId: number): Promise<TenantDocument[]> {
    return await db.select().from(tenantDocuments).where(eq(tenantDocuments.tenantId, tenantId));
  }

  async getTenantDocumentById(id: number): Promise<TenantDocument | undefined> {
    const results = await db.select().from(tenantDocuments).where(eq(tenantDocuments.id, id));
    return results[0];
  }

  async createTenantDocument(document: Omit<TenantDocument, "id" | "isVerified" | "verifiedBy" | "verifiedAt" | "uploadedAt">): Promise<TenantDocument> {
    const [newDocument] = await db.insert(tenantDocuments).values(document).returning();
    return newDocument;
  }

  async verifyTenantDocument(id: number, verifiedBy: number): Promise<TenantDocument> {
    const [updatedDocument] = await db
      .update(tenantDocuments)
      .set({ 
        isVerified: true, 
        verifiedBy, 
        verifiedAt: new Date() 
      })
      .where(eq(tenantDocuments.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteTenantDocument(id: number): Promise<void> {
    await db.delete(tenantDocuments).where(eq(tenantDocuments.id, id));
  }

  // Property image operations
  async getPropertyImages(propertyId: number): Promise<PropertyImage[]> {
    return await db.select().from(propertyImages).where(eq(propertyImages.propertyId, propertyId));
  }

  async getPropertyImageById(id: number): Promise<PropertyImage | undefined> {
    const [image] = await db.select().from(propertyImages).where(eq(propertyImages.id, id));
    return image;
  }

  async createPropertyImage(image: Omit<PropertyImage, "id" | "uploadedAt">): Promise<PropertyImage> {
    const [newImage] = await db.insert(propertyImages).values(image).returning();
    return newImage;
  }

  async setPrimaryPropertyImage(id: number): Promise<PropertyImage> {
    // First, get the property ID for this image
    const [image] = await db.select().from(propertyImages).where(eq(propertyImages.id, id));
    if (!image) throw new Error("Image not found");
    if (!image.propertyId) throw new Error("Image has no associated property");

    // Reset all images for this property to not primary
    await db
      .update(propertyImages)
      .set({ isPrimary: false })
      .where(eq(propertyImages.propertyId, image.propertyId));

    // Set the selected image as primary
    const [updatedImage] = await db
      .update(propertyImages)
      .set({ isPrimary: true })
      .where(eq(propertyImages.id, id))
      .returning();
    
    return updatedImage;
  }

  async deletePropertyImage(id: number): Promise<void> {
    await db.delete(propertyImages).where(eq(propertyImages.id, id));
  }

  // Property amenity operations
  async getPropertyAmenities(propertyId: number): Promise<PropertyAmenity[]> {
    return await db.select().from(propertyAmenities).where(eq(propertyAmenities.propertyId, propertyId));
  }

  async createPropertyAmenity(amenity: Omit<PropertyAmenity, "id">): Promise<PropertyAmenity> {
    const [newAmenity] = await db.insert(propertyAmenities).values(amenity).returning();
    return newAmenity;
  }

  async deletePropertyAmenity(id: number): Promise<void> {
    await db.delete(propertyAmenities).where(eq(propertyAmenities.id, id));
  }

  // Tenant reference operations
  async getTenantReferences(tenantId: number): Promise<TenantReference[]> {
    return await db.select().from(tenantReferences).where(eq(tenantReferences.tenantId, tenantId));
  }

  async getTenantReferenceById(id: number): Promise<TenantReference | undefined> {
    const [reference] = await db.select().from(tenantReferences).where(eq(tenantReferences.id, id));
    return reference;
  }

  async createTenantReference(reference: Omit<TenantReference, "id" | "isVerified" | "verificationDate">): Promise<TenantReference> {
    const [newReference] = await db.insert(tenantReferences).values(reference).returning();
    return newReference;
  }

  async updateTenantReference(id: number, reference: Partial<TenantReference>): Promise<TenantReference> {
    const [updatedReference] = await db
      .update(tenantReferences)
      .set(reference)
      .where(eq(tenantReferences.id, id))
      .returning();
    return updatedReference;
  }

  async verifyTenantReference(id: number): Promise<TenantReference> {
    const [updatedReference] = await db
      .update(tenantReferences)
      .set({ 
        isVerified: true, 
        verificationDate: new Date() 
      })
      .where(eq(tenantReferences.id, id))
      .returning();
    return updatedReference;
  }

  async deleteTenantReference(id: number): Promise<void> {
    await db.delete(tenantReferences).where(eq(tenantReferences.id, id));
  }

  // Conversation operations
  async getConversations(userId: number): Promise<Conversation[]> {
    // Get all conversation IDs where the user is a participant
    const participations = await db
      .select()
      .from(conversationParticipants)
      .where(eq(conversationParticipants.userId, userId));
    
    const conversationIds = participations.map(p => p.conversationId);
    
    if (conversationIds.length === 0) return [];
    
    // Get all conversations for these IDs
    return await db
      .select()
      .from(conversations)
      .where(sql`${conversations.id} IN (${conversationIds.join(',')})`);
  }

  async createConversation(conversation: Omit<Conversation, "id" | "createdAt">, participantIds: number[]): Promise<Conversation> {
    // Create the conversation
    const [newConversation] = await db.insert(conversations).values(conversation).returning();
    
    // Add all participants
    for (const userId of participantIds) {
      await db.insert(conversationParticipants).values({
        conversationId: newConversation.id,
        userId
      });
    }
    
    return newConversation;
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.sentAt);
  }

  async createMessage(message: Omit<Message, "id" | "sentAt" | "readAt">): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<Message> {
    const [updatedMessage] = await db
      .update(messages)
      .set({ readAt: new Date() })
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage;
  }

  // Notification operations
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(sql`${notifications.createdAt} DESC`);
  }

  async createNotification(notification: Omit<Notification, "id" | "createdAt">): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return updatedNotification;
  }

  // Roommate operations
  async getRoommateGroups(tenantId?: number): Promise<RoommateGroup[]> {
    if (tenantId) {
      // Get groups where this tenant is a member
      const memberships = await db
        .select()
        .from(roommateGroupMembers)
        .where(eq(roommateGroupMembers.tenantId, tenantId));
      
      const groupIds = memberships.map(m => m.groupId);
      
      if (groupIds.length === 0) return [];
      
      return await db
        .select()
        .from(roommateGroups)
        .where(sql`${roommateGroups.id} IN (${groupIds.join(',')})`);
    } else {
      return await db.select().from(roommateGroups);
    }
  }

  async createRoommateGroup(group: Omit<RoommateGroup, "id" | "createdAt">, primaryTenantId: number): Promise<RoommateGroup> {
    // Create the group
    const [newGroup] = await db.insert(roommateGroups).values(group).returning();
    
    // Add the primary tenant
    await db.insert(roommateGroupMembers).values({
      groupId: newGroup.id,
      tenantId: primaryTenantId,
      isPrimary: true
    });
    
    return newGroup;
  }

  async addTenantToGroup(groupId: number, tenantId: number, isPrimary: boolean = false): Promise<void> {
    await db.insert(roommateGroupMembers).values({
      groupId,
      tenantId,
      isPrimary
    });
  }

  async getGroupApplications(groupId: number): Promise<GroupApplication[]> {
    return await db
      .select()
      .from(groupApplications)
      .where(eq(groupApplications.groupId, groupId));
  }

  async createGroupApplication(application: Omit<GroupApplication, "id" | "submittedAt">): Promise<GroupApplication> {
    const [newApplication] = await db.insert(groupApplications).values(application).returning();
    return newApplication;
  }

  async updateGroupApplicationStatus(id: number, status: string): Promise<GroupApplication> {
    const [updatedApplication] = await db
      .update(groupApplications)
      .set({ status })
      .where(eq(groupApplications.id, id))
      .returning();
    return updatedApplication;
  }

  // Analytics operations
  async recordUserActivity(userId: number, activityType: string, metadata?: any): Promise<void> {
    await db.insert(userActivity).values({
      userId,
      activityType,
      metadata: metadata || {}
    });
  }
  
  // Neighborhood insights operations
  async getNeighborhoodInsight(propertyId: number): Promise<NeighborhoodInsight | undefined> {
    const [insight] = await db
      .select()
      .from(neighborhoodInsights)
      .where(eq(neighborhoodInsights.propertyId, propertyId));
    return insight;
  }

  async createNeighborhoodInsight(insight: Omit<NeighborhoodInsight, "id" | "createdAt" | "updatedAt">): Promise<NeighborhoodInsight> {
    const [newInsight] = await db
      .insert(neighborhoodInsights)
      .values({ 
        ...insight,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newInsight;
  }

  async updateNeighborhoodInsight(id: number, insight: Partial<NeighborhoodInsight>): Promise<NeighborhoodInsight> {
    const [updatedInsight] = await db
      .update(neighborhoodInsights)
      .set({ 
        ...insight,
        updatedAt: new Date() 
      })
      .where(eq(neighborhoodInsights.id, id))
      .returning();
    return updatedInsight;
  }

  async updatePropertyAnalytics(propertyId: number): Promise<void> {
    // Get current view count from properties table
    const [property] = await db
      .select({ viewCount: properties.viewCount })
      .from(properties)
      .where(eq(properties.id, propertyId));
    
    // Get interest count (replaces application count)
    const interestCount = await db
      .select({ count: sql`count(*)` })
      .from(interests)
      .where(eq(interests.propertyId, propertyId));
    
    // Update or create analytics record
    const existingAnalytics = await db
      .select()
      .from(propertyAnalytics)
      .where(eq(propertyAnalytics.propertyId, propertyId));
    
    if (existingAnalytics.length > 0) {
      await db
        .update(propertyAnalytics)
        .set({
          viewCount: property?.viewCount || 0,
          applicationCount: Number(interestCount[0]?.count) || 0,
          lastUpdated: new Date()
        })
        .where(eq(propertyAnalytics.propertyId, propertyId));
    } else {
      await db.insert(propertyAnalytics).values({
        propertyId,
        viewCount: property?.viewCount || 0,
        applicationCount: Number(interestCount[0]?.count) || 0
      });
    }
  }

  // Enhanced Analytics operations implementation

  // RentCard View Tracking
  async createRentcardView(view: Omit<RentcardView, "id" | "timestamp">): Promise<RentcardView> {
    const [newView] = await db
      .insert(rentcardViews)
      .values({
        ...view,
        timestamp: new Date()
      })
      .returning();
    return newView;
  }

  async getRentcardViews(shareTokenId?: number, tenantId?: number, timeframe?: string): Promise<RentcardView[]> {
    let query = db.select().from(rentcardViews);
    
    const conditions = [];
    if (shareTokenId) conditions.push(eq(rentcardViews.shareTokenId, shareTokenId));
    if (tenantId) conditions.push(eq(rentcardViews.tenantId, tenantId));
    
    // Add timeframe filtering
    if (timeframe) {
      const now = new Date();
      let startDate: Date;
      switch (timeframe) {
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0); // All time
      }
      conditions.push(sql`${rentcardViews.timestamp} >= ${startDate}`);
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(sql`${rentcardViews.timestamp} DESC`);
  }

  async getRentcardViewStats(tenantId: number, timeframe?: string): Promise<{
    totalViews: number;
    uniqueViews: number;
    avgViewDuration: number;
    topSources: { source: string; count: number }[];
    deviceBreakdown: { type: string; count: number }[];
  }> {
    const views = await this.getRentcardViews(undefined, tenantId, timeframe);
    
    const totalViews = views.length;
    const uniqueViews = new Set(views.map(v => v.viewerFingerprint)).size;
    const avgViewDuration = views.reduce((sum, v) => sum + (v.viewDuration || 0), 0) / Math.max(totalViews, 1);
    
    // Calculate top sources
    const sourceMap = new Map<string, number>();
    views.forEach(v => {
      const source = v.source || 'unknown';
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    });
    const topSources = Array.from(sourceMap.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Calculate device breakdown
    const deviceMap = new Map<string, number>();
    views.forEach(v => {
      const deviceType = v.deviceInfo?.type || 'unknown';
      deviceMap.set(deviceType, (deviceMap.get(deviceType) || 0) + 1);
    });
    const deviceBreakdown = Array.from(deviceMap.entries())
      .map(([type, count]) => ({ type, count }));
    
    return {
      totalViews,
      uniqueViews,
      avgViewDuration: Math.round(avgViewDuration),
      topSources,
      deviceBreakdown
    };
  }

  // View Sessions
  async createViewSession(session: Omit<ViewSession, "id" | "startTime">): Promise<ViewSession> {
    const [newSession] = await db
      .insert(viewSessions)
      .values({
        ...session,
        startTime: new Date()
      })
      .returning();
    return newSession;
  }

  async updateViewSession(id: number, updates: Partial<ViewSession>): Promise<ViewSession> {
    const [updatedSession] = await db
      .update(viewSessions)
      .set(updates)
      .where(eq(viewSessions.id, id))
      .returning();
    return updatedSession;
  }

  async getViewSession(sessionFingerprint: string): Promise<ViewSession | undefined> {
    const [session] = await db
      .select()
      .from(viewSessions)
      .where(eq(viewSessions.sessionFingerprint, sessionFingerprint));
    return session;
  }

  async getViewSessions(shareTokenId?: number, tenantId?: number): Promise<ViewSession[]> {
    let query = db.select().from(viewSessions);
    
    const conditions = [];
    if (shareTokenId) conditions.push(eq(viewSessions.shareTokenId, shareTokenId));
    if (tenantId) conditions.push(eq(viewSessions.tenantId, tenantId));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(sql`${viewSessions.startTime} DESC`);
  }

  // Interest Analytics
  async createInterestAnalytics(analytics: Omit<InterestAnalytics, "id" | "createdAt" | "updatedAt">): Promise<InterestAnalytics> {
    const [newAnalytics] = await db
      .insert(interestAnalytics)
      .values({
        ...analytics,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newAnalytics;
  }

  async updateInterestAnalytics(id: number, updates: Partial<InterestAnalytics>): Promise<InterestAnalytics> {
    const [updatedAnalytics] = await db
      .update(interestAnalytics)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(interestAnalytics.id, id))
      .returning();
    return updatedAnalytics;
  }

  async getInterestAnalytics(landlordId?: number, tenantId?: number, propertyId?: number): Promise<InterestAnalytics[]> {
    let query = db.select().from(interestAnalytics);
    
    const conditions = [];
    if (landlordId) conditions.push(eq(interestAnalytics.landlordId, landlordId));
    if (tenantId) conditions.push(eq(interestAnalytics.tenantId, tenantId));
    if (propertyId) conditions.push(eq(interestAnalytics.propertyId, propertyId));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(sql`${interestAnalytics.createdAt} DESC`);
  }

  async getInterestConversionStats(landlordId: number, timeframe?: string): Promise<{
    conversionRate: number;
    avgTimeToInterest: number;
    totalInterests: number;
    topSources: { source: string; count: number }[];
  }> {
    let analytics = await this.getInterestAnalytics(landlordId);
    
    // Apply timeframe filtering
    if (timeframe) {
      const now = new Date();
      let startDate: Date;
      switch (timeframe) {
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
      analytics = analytics.filter(a => a.createdAt && a.createdAt >= startDate);
    }
    
    const totalInterests = analytics.length;
    const validTimeToInterest = analytics.filter(a => a.timeToInterest != null).map(a => a.timeToInterest!);
    const avgTimeToInterest = validTimeToInterest.length > 0 
      ? validTimeToInterest.reduce((sum, time) => sum + time, 0) / validTimeToInterest.length 
      : 0;
    
    // Get total views for conversion rate calculation (simplified)
    const totalViews = analytics.reduce((sum, a) => sum + (a.viewsBeforeInterest || 0), 0);
    const conversionRate = totalViews > 0 ? (totalInterests / totalViews) * 100 : 0;
    
    // Calculate top sources
    const sourceMap = new Map<string, number>();
    analytics.forEach(a => {
      const source = a.sourceView || 'unknown';
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    });
    const topSources = Array.from(sourceMap.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      conversionRate: Math.round(conversionRate * 100) / 100,
      avgTimeToInterest: Math.round(avgTimeToInterest),
      totalInterests,
      topSources
    };
  }

  // Analytics Aggregations
  async createAnalyticsAggregation(aggregation: Omit<AnalyticsAggregation, "id" | "createdAt">): Promise<AnalyticsAggregation> {
    const [newAggregation] = await db
      .insert(analyticsAggregations)
      .values({
        ...aggregation,
        createdAt: new Date()
      })
      .returning();
    return newAggregation;
  }

  async getAnalyticsAggregations(
    entityType: string, 
    entityId: number, 
    aggregationType: string, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<AnalyticsAggregation[]> {
    let query = db.select().from(analyticsAggregations)
      .where(and(
        eq(analyticsAggregations.entityType, entityType),
        eq(analyticsAggregations.entityId, entityId),
        eq(analyticsAggregations.aggregationType, aggregationType)
      ));
    
    const conditions = [];
    if (startDate) conditions.push(sql`${analyticsAggregations.date} >= ${startDate}`);
    if (endDate) conditions.push(sql`${analyticsAggregations.date} <= ${endDate}`);
    
    if (conditions.length > 0) {
      query = query.where(and(
        eq(analyticsAggregations.entityType, entityType),
        eq(analyticsAggregations.entityId, entityId),
        eq(analyticsAggregations.aggregationType, aggregationType),
        ...conditions
      ));
    }
    
    return await query.orderBy(sql`${analyticsAggregations.date} DESC`);
  }

  async updateDailyAggregations(): Promise<void> {
    // This would be called by a background job to compute daily aggregations
    // Implementation would aggregate data from the detail tables into summary records
    console.log('Daily aggregations update - implementation needed for production');
  }

  // Sharing Analytics
  async createSharingAnalytics(analytics: Omit<SharingAnalytics, "id" | "shareDate">): Promise<SharingAnalytics> {
    const [newAnalytics] = await db
      .insert(sharingAnalytics)
      .values({
        ...analytics,
        shareDate: new Date()
      })
      .returning();
    return newAnalytics;
  }

  async updateSharingAnalytics(id: number, updates: Partial<SharingAnalytics>): Promise<SharingAnalytics> {
    const [updatedAnalytics] = await db
      .update(sharingAnalytics)
      .set(updates)
      .where(eq(sharingAnalytics.id, id))
      .returning();
    return updatedAnalytics;
  }

  async getSharingAnalytics(shareTokenId?: number, tenantId?: number): Promise<SharingAnalytics[]> {
    let query = db.select().from(sharingAnalytics);
    
    const conditions = [];
    if (shareTokenId) conditions.push(eq(sharingAnalytics.shareTokenId, shareTokenId));
    if (tenantId) conditions.push(eq(sharingAnalytics.tenantId, tenantId));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(sql`${sharingAnalytics.shareDate} DESC`);
  }

  async getSharingPerformanceStats(tenantId: number): Promise<{
    bestPerformingMethod: string;
    totalShares: number;
    avgPerformanceScore: number;
    conversionsByMethod: { method: string; conversions: number }[];
  }> {
    const analytics = await this.getSharingAnalytics(undefined, tenantId);
    
    const totalShares = analytics.length;
    const avgPerformanceScore = analytics.reduce((sum, a) => sum + (a.performanceScore || 0), 0) / Math.max(totalShares, 1);
    
    // Find best performing method
    const methodPerformance = new Map<string, { score: number; count: number; conversions: number }>();
    analytics.forEach(a => {
      const method = a.sharingMethod;
      const current = methodPerformance.get(method) || { score: 0, count: 0, conversions: 0 };
      methodPerformance.set(method, {
        score: current.score + (a.performanceScore || 0),
        count: current.count + 1,
        conversions: current.conversions + (a.conversionToInterest ? 1 : 0)
      });
    });
    
    let bestPerformingMethod = 'none';
    let bestScore = 0;
    const conversionsByMethod: { method: string; conversions: number }[] = [];
    
    methodPerformance.forEach((stats, method) => {
      const avgScore = stats.score / stats.count;
      if (avgScore > bestScore) {
        bestScore = avgScore;
        bestPerformingMethod = method;
      }
      conversionsByMethod.push({ method, conversions: stats.conversions });
    });
    
    return {
      bestPerformingMethod,
      totalShares,
      avgPerformanceScore: Math.round(avgPerformanceScore * 100) / 100,
      conversionsByMethod
    };
  }

  // QR Code Analytics
  async createQRCodeAnalytics(analytics: Omit<QRCodeAnalytics, "id" | "scanDate">): Promise<QRCodeAnalytics> {
    const [newAnalytics] = await db
      .insert(qrCodeAnalytics)
      .values({
        ...analytics,
        scanDate: new Date()
      })
      .returning();
    return newAnalytics;
  }

  async getQRCodeAnalytics(qrCodeId?: number, propertyId?: number): Promise<QRCodeAnalytics[]> {
    let query = db.select().from(qrCodeAnalytics);
    
    const conditions = [];
    if (qrCodeId) conditions.push(eq(qrCodeAnalytics.qrCodeId, qrCodeId));
    if (propertyId) conditions.push(eq(qrCodeAnalytics.propertyId, propertyId));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(sql`${qrCodeAnalytics.scanDate} DESC`);
  }

  async getQRCodeStats(propertyId: number): Promise<{
    totalScans: number;
    uniqueScans: number;
    conversionRate: number;
    topActions: { action: string; count: number }[];
  }> {
    const analytics = await this.getQRCodeAnalytics(undefined, propertyId);
    
    const totalScans = analytics.length;
    const uniqueScans = new Set(analytics.map(a => `${a.scannerInfo?.deviceType}-${a.scanLocation?.lat}-${a.scanLocation?.lng}`)).size;
    
    const conversions = analytics.filter(a => a.subsequentAction && a.subsequentAction !== 'none').length;
    const conversionRate = totalScans > 0 ? (conversions / totalScans) * 100 : 0;
    
    // Calculate top actions
    const actionMap = new Map<string, number>();
    analytics.forEach(a => {
      const action = a.subsequentAction || 'none';
      actionMap.set(action, (actionMap.get(action) || 0) + 1);
    });
    const topActions = Array.from(actionMap.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalScans,
      uniqueScans,
      conversionRate: Math.round(conversionRate * 100) / 100,
      topActions
    };
  }

  // Property QR Code operations
  async getPropertyQRCodes(propertyId: number): Promise<PropertyQRCode[]> {
    const qrCodes = await db
      .select()
      .from(propertyQRCodes)
      .where(eq(propertyQRCodes.propertyId, propertyId));
    return qrCodes;
  }

  async getPropertyQRCodeById(id: number): Promise<PropertyQRCode | undefined> {
    const [qrCode] = await db
      .select()
      .from(propertyQRCodes)
      .where(eq(propertyQRCodes.id, id));
    return qrCode;
  }

  async createPropertyQRCode(qrCode: Omit<PropertyQRCode, "id" | "scanCount" | "lastScannedAt" | "createdAt" | "updatedAt">): Promise<PropertyQRCode> {
    const [newQRCode] = await db
      .insert(propertyQRCodes)
      .values({
        ...qrCode,
        scanCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newQRCode;
  }

  async updatePropertyQRCode(id: number, qrCode: Partial<PropertyQRCode>): Promise<PropertyQRCode> {
    const [updatedQRCode] = await db
      .update(propertyQRCodes)
      .set({
        ...qrCode,
        updatedAt: new Date()
      })
      .where(eq(propertyQRCodes.id, id))
      .returning();
    return updatedQRCode;
  }

  async trackQRCodeScan(id: number): Promise<void> {
    await db
      .update(propertyQRCodes)
      .set({
        scanCount: sql`${propertyQRCodes.scanCount} + 1`,
        lastScannedAt: new Date()
      })
      .where(eq(propertyQRCodes.id, id));
  }

  async deletePropertyQRCode(id: number): Promise<void> {
    await db
      .delete(propertyQRCodes)
      .where(eq(propertyQRCodes.id, id));
  }

  // Contact preference operations
  async getTenantContactPreferences(tenantId: number): Promise<TenantContactPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(tenantContactPreferences)
      .where(eq(tenantContactPreferences.tenantId, tenantId));
    return preferences;
  }

  async createTenantContactPreferences(preferences: Omit<TenantContactPreferences, "id" | "createdAt" | "updatedAt">): Promise<TenantContactPreferences> {
    const [newPreferences] = await db
      .insert(tenantContactPreferences)
      .values({
        ...preferences,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newPreferences;
  }

  async updateTenantContactPreferences(tenantId: number, preferences: Partial<TenantContactPreferences>): Promise<TenantContactPreferences> {
    const [updatedPreferences] = await db
      .update(tenantContactPreferences)
      .set({
        ...preferences,
        updatedAt: new Date()
      })
      .where(eq(tenantContactPreferences.tenantId, tenantId))
      .returning();
    return updatedPreferences;
  }

  // Communication log operations
  async getCommunicationLogs(landlordId?: number, tenantId?: number, propertyId?: number): Promise<CommunicationLog[]> {
    let query = db.select().from(communicationLogs);
    
    const conditions = [];
    if (landlordId) conditions.push(eq(communicationLogs.landlordId, landlordId));
    if (tenantId) conditions.push(eq(communicationLogs.tenantId, tenantId));
    if (propertyId) conditions.push(eq(communicationLogs.propertyId, propertyId));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const logs = await query.orderBy(sql`${communicationLogs.createdAt} DESC`);
    return logs;
  }

  async createCommunicationLog(log: Omit<CommunicationLog, "id" | "createdAt">): Promise<CommunicationLog> {
    const [newLog] = await db
      .insert(communicationLogs)
      .values({
        ...log,
        createdAt: new Date()
      })
      .returning();
    return newLog;
  }

  async updateCommunicationLogStatus(id: number, status: string, metadata?: any): Promise<CommunicationLog> {
    const [updatedLog] = await db
      .update(communicationLogs)
      .set({
        status,
        metadata: metadata || undefined
      })
      .where(eq(communicationLogs.id, id))
      .returning();
    return updatedLog;
  }

  async getCommunicationThread(threadId: string): Promise<CommunicationLog[]> {
    const logs = await db
      .select()
      .from(communicationLogs)
      .where(eq(communicationLogs.threadId, threadId))
      .orderBy(sql`${communicationLogs.createdAt} ASC`);
    return logs;
  }

  // Blocked contacts operations
  async getTenantBlockedContacts(tenantId: number): Promise<TenantBlockedContact[]> {
    const blockedContacts = await db
      .select()
      .from(tenantBlockedContacts)
      .where(eq(tenantBlockedContacts.tenantId, tenantId));
    return blockedContacts;
  }

  async createTenantBlockedContact(blockedContact: Omit<TenantBlockedContact, "id" | "createdAt">): Promise<TenantBlockedContact> {
    const [newBlockedContact] = await db
      .insert(tenantBlockedContacts)
      .values({
        ...blockedContact,
        createdAt: new Date()
      })
      .returning();
    return newBlockedContact;
  }

  async removeTenantBlockedContact(id: number): Promise<void> {
    await db
      .delete(tenantBlockedContacts)
      .where(eq(tenantBlockedContacts.id, id));
  }

  async isContactBlocked(tenantId: number, landlordId?: number, email?: string, phone?: string): Promise<boolean> {
    const conditions = [eq(tenantBlockedContacts.tenantId, tenantId)];
    
    if (landlordId) {
      conditions.push(eq(tenantBlockedContacts.landlordId, landlordId));
    }
    if (email) {
      conditions.push(eq(tenantBlockedContacts.blockedEmail, email));
    }
    if (phone) {
      conditions.push(eq(tenantBlockedContacts.blockedPhone, phone));
    }

    const [blockedContact] = await db
      .select()
      .from(tenantBlockedContacts)
      .where(and(...conditions))
      .limit(1);

    if (!blockedContact) return false;

    // Check if temporary block has expired
    if (blockedContact.blockType === 'temporary' && blockedContact.blockedUntil) {
      const now = new Date();
      if (now > blockedContact.blockedUntil) {
        // Remove expired temporary block
        await this.removeTenantBlockedContact(blockedContact.id);
        return false;
      }
    }

    return true;
  }

  // Communication template operations
  async getCommunicationTemplates(landlordId: number, category?: string): Promise<CommunicationTemplate[]> {
    let query = db
      .select()
      .from(communicationTemplates)
      .where(and(
        eq(communicationTemplates.landlordId, landlordId),
        eq(communicationTemplates.isActive, true)
      ));
    
    if (category) {
      query = query.where(and(
        eq(communicationTemplates.landlordId, landlordId),
        eq(communicationTemplates.category, category),
        eq(communicationTemplates.isActive, true)
      ));
    }
    
    const templates = await query.orderBy(sql`${communicationTemplates.title} ASC`);
    return templates;
  }

  async getCommunicationTemplateById(id: number): Promise<CommunicationTemplate | undefined> {
    const [template] = await db
      .select()
      .from(communicationTemplates)
      .where(eq(communicationTemplates.id, id));
    return template;
  }

  async createCommunicationTemplate(template: Omit<CommunicationTemplate, "id" | "usageCount" | "createdAt" | "updatedAt">): Promise<CommunicationTemplate> {
    const [newTemplate] = await db
      .insert(communicationTemplates)
      .values({
        ...template,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newTemplate;
  }

  async updateCommunicationTemplate(id: number, template: Partial<CommunicationTemplate>): Promise<CommunicationTemplate> {
    const [updatedTemplate] = await db
      .update(communicationTemplates)
      .set({
        ...template,
        updatedAt: new Date()
      })
      .where(eq(communicationTemplates.id, id))
      .returning();
    return updatedTemplate;
  }

  async deleteCommunicationTemplate(id: number): Promise<void> {
    await db
      .delete(communicationTemplates)
      .where(eq(communicationTemplates.id, id));
  }

  async incrementTemplateUsage(id: number): Promise<void> {
    await db
      .update(communicationTemplates)
      .set({
        usageCount: sql`${communicationTemplates.usageCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(communicationTemplates.id, id));
  }
}

export const storage = new DatabaseStorage();