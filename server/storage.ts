import { User, TenantProfile, LandlordProfile, Property, Interest, RentCard, ShareToken, PropertyQRCode } from "@shared/schema";
import { users, tenantProfiles, landlordProfiles, properties, interests, rentCards, shareTokens, propertyQRCodes } from "@shared/schema";
import { db, sql } from "./db";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Import new schema types
import {
  TenantDocument, PropertyImage, PropertyAmenity, TenantReference,
  Conversation, Message, Notification, RoommateGroup, GroupApplication,
  NeighborhoodInsight,
  tenantDocuments, propertyImages, propertyAmenities, tenantReferences,
  conversations, messages, notifications, roommateGroups, groupApplications,
  conversationParticipants, roommateGroupMembers, propertyAnalytics, userActivity,
  neighborhoodInsights
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
}

export const storage = new DatabaseStorage();