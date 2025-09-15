import { pgTable, text, serial, integer, boolean, timestamp, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users, tenantProfiles, landlordProfiles, properties, shareTokens, interests, propertyQRCodes } from "./schema";

// 1. Document Storage and Verification
export const tenantDocuments = pgTable("tenant_documents", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenantProfiles.id),
  documentType: text("document_type").notNull(), // 'id', 'payslip', 'reference', etc.
  documentUrl: text("document_url").notNull(),
  isVerified: boolean("is_verified").default(false),
  verifiedBy: integer("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// 2. Messaging and Communication
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversationParticipants = pgTable("conversation_participants", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id),
  userId: integer("user_id").references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id),
  senderId: integer("sender_id").references(() => users.id),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  readAt: timestamp("read_at"),
});

// 3. Property Management Enhancements
export const propertyImages = pgTable("property_images", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  imageUrl: text("image_url").notNull(),
  isPrimary: boolean("is_primary").default(false),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const propertyAmenities = pgTable("property_amenities", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  amenityType: text("amenity_type").notNull(), // 'laundry', 'gym', 'pool', etc.
  description: text("description"),
});

// 4. Analytics and Reporting
export const propertyAnalytics = pgTable("property_analytics", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  viewCount: integer("view_count").default(0),
  applicationCount: integer("application_count").default(0),
  averageApplicationScore: integer("average_application_score"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const userActivity = pgTable("user_activity", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  activityType: text("activity_type").notNull(), // 'login', 'view_property', 'submit_application', etc.
  metadata: json("metadata"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// 5. Enhanced Notifications System
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'rentcard_view', 'interest_submission', 'weekly_summary', 'document_verified', etc.
  title: text("title").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  priority: text("priority").notNull().default('normal'), // 'low', 'normal', 'high', 'urgent'
  
  // Entity relationships
  relatedEntityType: text("related_entity_type"), // 'rentcard', 'property', 'interest', 'shareToken', etc.
  relatedEntityId: integer("related_entity_id"),
  
  // Engagement data
  viewData: json("view_data").$type<{
    shareTokenId?: number;
    viewerInfo?: {
      deviceType?: 'desktop' | 'mobile' | 'tablet';
      location?: string;
      source?: string;
    };
    viewDuration?: number;
    isUnique?: boolean;
  }>(),
  
  interestData: json("interest_data").$type<{
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
  }>(),
  
  // Notification delivery tracking
  deliveryMethods: json("delivery_methods").$type<string[]>(), // ['in_app', 'email', 'sms']
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  clickedAt: timestamp("clicked_at"), // When user clicked/viewed the notification
  
  // Metadata
  metadata: json("metadata").$type<{
    aggregationKey?: string; // For grouping similar notifications
    suppressEmail?: boolean; // Override email sending
    expiresAt?: string; // When notification becomes irrelevant
    actionUrl?: string; // Deep link to relevant page
  }>(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notification Preferences System
export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  
  // RentCard View Notifications
  rentcardViewsEnabled: boolean("rentcard_views_enabled").default(true),
  rentcardViewsEmail: boolean("rentcard_views_email").default(false),
  rentcardViewsFrequency: text("rentcard_views_frequency").default('instant'), // 'instant', 'hourly', 'daily', 'off'
  
  // Interest Submission Notifications
  interestSubmissionsEnabled: boolean("interest_submissions_enabled").default(true),
  interestSubmissionsEmail: boolean("interest_submissions_email").default(true),
  interestSubmissionsFrequency: text("interest_submissions_frequency").default('instant'),
  
  // Weekly Summary
  weeklySummaryEnabled: boolean("weekly_summary_enabled").default(true),
  weeklySummaryEmail: boolean("weekly_summary_email").default(true),
  weeklySummaryDay: text("weekly_summary_day").default('monday'), // Day of week
  
  // System Notifications (document verification, etc.)
  systemNotificationsEnabled: boolean("system_notifications_enabled").default(true),
  systemNotificationsEmail: boolean("system_notifications_email").default(false),
  
  // General Settings
  quietHoursStart: text("quiet_hours_start"), // "22:00"
  quietHoursEnd: text("quiet_hours_end"), // "08:00"
  timezone: text("timezone").default('America/New_York'),
  emailDigestEnabled: boolean("email_digest_enabled").default(false),
  emailDigestFrequency: text("email_digest_frequency").default('daily'), // 'daily', 'weekly'
  
  // Advanced Settings
  maxNotificationsPerHour: integer("max_notifications_per_hour").default(10),
  groupSimilarNotifications: boolean("group_similar_notifications").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notification Delivery Log for tracking and debugging
export const notificationDeliveryLog = pgTable("notification_delivery_log", {
  id: serial("id").primaryKey(),
  notificationId: integer("notification_id").references(() => notifications.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  deliveryMethod: text("delivery_method").notNull(), // 'in_app', 'email', 'sms', 'push'
  status: text("status").notNull(), // 'queued', 'sent', 'delivered', 'failed', 'bounced'
  
  // Delivery details
  recipientEmail: text("recipient_email"),
  recipientPhone: text("recipient_phone"),
  
  // Tracking data
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  clickedAt: timestamp("clicked_at"),
  
  // Error handling
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  
  // Email-specific tracking
  emailSubject: text("email_subject"),
  emailProvider: text("email_provider"), // 'nodemailer', 'sendgrid', etc.
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 7. Tenant References
export const tenantReferences = pgTable("tenant_references", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenantProfiles.id),
  name: text("name").notNull(),
  relationship: text("relationship").notNull(), // 'previous_landlord', 'employer', 'personal', etc.
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  isVerified: boolean("is_verified").default(false),
  verificationDate: timestamp("verification_date"),
  notes: text("notes"),
});

// 8. Roommates/Co-applicants
export const roommateGroups = pgTable("roommate_groups", {
  id: serial("id").primaryKey(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const roommateGroupMembers = pgTable("roommate_group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => roommateGroups.id),
  tenantId: integer("tenant_id").references(() => tenantProfiles.id),
  isPrimary: boolean("is_primary").default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const groupApplications = pgTable("group_applications", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => roommateGroups.id),
  propertyId: integer("property_id").references(() => properties.id),
  status: text("status").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

// 9. Neighborhood Insights
export const neighborhoodInsights = pgTable("neighborhood_insights", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  safetyRating: real("safety_rating"), // 1.0 to 5.0 scale
  walkabilityScore: integer("walkability_score"), // 1-100 scale
  transitScore: integer("transit_score"), // 1-100 scale
  nearbyAmenities: json("nearby_amenities").$type<{
    name: string;
    type: string; // 'grocery', 'restaurant', 'school', 'park', 'healthcare', etc.
    distance: number; // in miles or kilometers
    rating?: number; // optional rating on a 1-5 scale
  }[]>(),
  publicTransport: json("public_transport").$type<{
    type: string; // 'bus', 'subway', 'train', etc.
    line: string;
    station: string;
    distance: number; // in miles or kilometers
  }[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for the new tables
export const insertTenantDocumentSchema = createInsertSchema(tenantDocuments).omit({
  id: true,
  isVerified: true,
  verifiedBy: true,
  verifiedAt: true,
  uploadedAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  sentAt: true,
  readAt: true,
});

export const insertPropertyImageSchema = createInsertSchema(propertyImages).omit({
  id: true,
  uploadedAt: true,
});

export const insertPropertyAmenitySchema = createInsertSchema(propertyAmenities).omit({
  id: true,
});

export const insertTenantReferenceSchema = createInsertSchema(tenantReferences).omit({
  id: true,
  isVerified: true,
  verificationDate: true,
});

export const insertRoommateGroupSchema = createInsertSchema(roommateGroups).omit({
  id: true,
  createdAt: true,
});

export const insertGroupApplicationSchema = createInsertSchema(groupApplications).omit({
  id: true,
  submittedAt: true,
});

export const insertNeighborhoodInsightSchema = createInsertSchema(neighborhoodInsights).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Enhanced Notification System Insert Schemas
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationDeliveryLogSchema = createInsertSchema(notificationDeliveryLog).omit({
  id: true,
  createdAt: true,
});

// Type definitions
export type TenantDocument = typeof tenantDocuments.$inferSelect;
export type InsertTenantDocument = z.infer<typeof insertTenantDocumentSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type PropertyImage = typeof propertyImages.$inferSelect;
export type InsertPropertyImage = z.infer<typeof insertPropertyImageSchema>;

export type PropertyAmenity = typeof propertyAmenities.$inferSelect;
export type InsertPropertyAmenity = z.infer<typeof insertPropertyAmenitySchema>;

export type PropertyAnalytic = typeof propertyAnalytics.$inferSelect;
export type UserActivity = typeof userActivity.$inferSelect;

// Enhanced Notification Types
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;

export type NotificationDeliveryLog = typeof notificationDeliveryLog.$inferSelect;
export type InsertNotificationDeliveryLog = z.infer<typeof insertNotificationDeliveryLogSchema>;

export type TenantReference = typeof tenantReferences.$inferSelect;
export type InsertTenantReference = z.infer<typeof insertTenantReferenceSchema>;

export type RoommateGroup = typeof roommateGroups.$inferSelect;
export type InsertRoommateGroup = z.infer<typeof insertRoommateGroupSchema>;

export type GroupApplication = typeof groupApplications.$inferSelect;
export type InsertGroupApplication = z.infer<typeof insertGroupApplicationSchema>; 

export type NeighborhoodInsight = typeof neighborhoodInsights.$inferSelect;
export type InsertNeighborhoodInsight = z.infer<typeof insertNeighborhoodInsightSchema>;

// Enhanced Analytics and View Tracking System

// 1. Comprehensive RentCard View Tracking
export const rentcardViews = pgTable("rentcard_views", {
  id: serial("id").primaryKey(),
  shareTokenId: integer("share_token_id").references(() => shareTokens.id),
  tenantId: integer("tenant_id").references(() => tenantProfiles.id),
  viewerFingerprint: text("viewer_fingerprint"), // Unique browser/device identifier
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"), // Where the view came from
  source: text("source").notNull(), // 'qr_code', 'share_link', 'direct', 'email', 'sms'
  sourceId: text("source_id"), // QR code ID, email campaign ID, etc.
  location: json("location").$type<{
    city?: string;
    region?: string;
    country?: string;
    coordinates?: { lat: number; lng: number };
  }>(),
  deviceInfo: json("device_info").$type<{
    type: 'desktop' | 'mobile' | 'tablet';
    os?: string;
    browser?: string;
    screenSize?: { width: number; height: number };
  }>(),
  viewDuration: integer("view_duration"), // Time spent viewing in seconds
  actionsPerformed: json("actions_performed").$type<string[]>(), // ['scrolled', 'clicked_contact', 'downloaded_info']
  isUnique: boolean("is_unique").default(true), // First time viewing this RentCard
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// 2. View Sessions - Group related views together
export const viewSessions = pgTable("view_sessions", {
  id: serial("id").primaryKey(),
  sessionFingerprint: text("session_fingerprint").notNull().unique(),
  shareTokenId: integer("share_token_id").references(() => shareTokens.id),
  tenantId: integer("tenant_id").references(() => tenantProfiles.id),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  totalViews: integer("total_views").default(1),
  totalDuration: integer("total_duration").default(0), // Total time in seconds
  convertedToInterest: boolean("converted_to_interest").default(false),
  interestId: integer("interest_id").references(() => interests.id),
  conversionTime: timestamp("conversion_time"), // When interest was submitted
});

// 3. Interest Analytics - Track conversion and engagement
export const interestAnalytics = pgTable("interest_analytics", {
  id: serial("id").primaryKey(),
  interestId: integer("interest_id").references(() => interests.id),
  tenantId: integer("tenant_id").references(() => tenantProfiles.id),
  landlordId: integer("landlord_id").references(() => landlordProfiles.id),
  propertyId: integer("property_id").references(() => properties.id),
  sourceView: text("source_view"), // 'rentcard_share', 'property_listing', 'search_result'
  viewsBeforeInterest: integer("views_before_interest").default(0),
  timeToInterest: integer("time_to_interest"), // Minutes from first view to interest
  engagementScore: real("engagement_score"), // Calculated based on various factors
  responseTime: integer("response_time"), // Landlord response time in minutes
  finalStatus: text("final_status"), // 'contacted', 'rejected', 'accepted', 'withdrawn'
  metadata: json("metadata").$type<{
    viewSources: string[];
    deviceTypes: string[];
    totalViewDuration: number;
    documentsViewed?: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 4. Analytics Aggregations - Pre-computed metrics for performance
export const analyticsAggregations = pgTable("analytics_aggregations", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // 'tenant', 'landlord', 'property', 'shareToken'
  entityId: integer("entity_id").notNull(),
  aggregationType: text("aggregation_type").notNull(), // 'daily', 'weekly', 'monthly'
  date: timestamp("date").notNull(),
  metrics: json("metrics").$type<{
    views?: number;
    uniqueViews?: number;
    interests?: number;
    conversionRate?: number;
    avgViewDuration?: number;
    topSources?: { source: string; count: number }[];
    deviceBreakdown?: { type: string; count: number }[];
    locationBreakdown?: { country: string; count: number }[];
  }>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Sharing Performance Analytics
export const sharingAnalytics = pgTable("sharing_analytics", {
  id: serial("id").primaryKey(),
  shareTokenId: integer("share_token_id").references(() => shareTokens.id),
  tenantId: integer("tenant_id").references(() => tenantProfiles.id),
  sharingMethod: text("sharing_method").notNull(), // 'qr_code', 'email', 'sms', 'social', 'copy_link'
  recipientInfo: json("recipient_info").$type<{
    email?: string;
    phone?: string;
    platform?: string; // For social sharing
    recipientType?: 'landlord' | 'agent' | 'friend' | 'unknown';
  }>(),
  shareDate: timestamp("share_date").defaultNow().notNull(),
  firstViewDate: timestamp("first_view_date"),
  totalViews: integer("total_views").default(0),
  uniqueViewers: integer("unique_viewers").default(0),
  conversionToInterest: boolean("conversion_to_interest").default(false),
  conversionDate: timestamp("conversion_date"),
  performanceScore: real("performance_score"), // Calculated based on engagement
});

// 6. Enhanced QR Code Analytics
export const qrCodeAnalytics = pgTable("qr_code_analytics", {
  id: serial("id").primaryKey(),
  qrCodeId: integer("qr_code_id").references(() => propertyQRCodes.id),
  propertyId: integer("property_id").references(() => properties.id),
  scanDate: timestamp("scan_date").defaultNow().notNull(),
  scanLocation: json("scan_location").$type<{
    lat?: number;
    lng?: number;
    accuracy?: number;
    address?: string;
  }>(),
  scannerInfo: json("scanner_info").$type<{
    deviceType: 'mobile' | 'tablet' | 'desktop';
    os?: string;
    browser?: string;
    appName?: string; // If scanned from QR scanner app
  }>(),
  subsequentAction: text("subsequent_action"), // 'viewed_rentcard', 'submitted_interest', 'bookmarked', 'shared'
  sessionDuration: integer("session_duration"), // Time from scan to last action
  conversionValue: text("conversion_value"), // Type of conversion achieved
});

// Insert schemas for new analytics tables
export const insertRentcardViewSchema = createInsertSchema(rentcardViews).omit({
  id: true,
  timestamp: true,
});

export const insertViewSessionSchema = createInsertSchema(viewSessions).omit({
  id: true,
  startTime: true,
});

export const insertInterestAnalyticsSchema = createInsertSchema(interestAnalytics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnalyticsAggregationSchema = createInsertSchema(analyticsAggregations).omit({
  id: true,
  createdAt: true,
});

export const insertSharingAnalyticsSchema = createInsertSchema(sharingAnalytics).omit({
  id: true,
  shareDate: true,
});

export const insertQRCodeAnalyticsSchema = createInsertSchema(qrCodeAnalytics).omit({
  id: true,
  scanDate: true,
});

// Type definitions for new analytics tables
export type RentcardView = typeof rentcardViews.$inferSelect;
export type InsertRentcardView = z.infer<typeof insertRentcardViewSchema>;

export type ViewSession = typeof viewSessions.$inferSelect;
export type InsertViewSession = z.infer<typeof insertViewSessionSchema>;

export type InterestAnalytics = typeof interestAnalytics.$inferSelect;
export type InsertInterestAnalytics = z.infer<typeof insertInterestAnalyticsSchema>;

export type AnalyticsAggregation = typeof analyticsAggregations.$inferSelect;
export type InsertAnalyticsAggregation = z.infer<typeof insertAnalyticsAggregationSchema>;

export type SharingAnalytics = typeof sharingAnalytics.$inferSelect;
export type InsertSharingAnalytics = z.infer<typeof insertSharingAnalyticsSchema>;

export type QRCodeAnalytics = typeof qrCodeAnalytics.$inferSelect;
export type InsertQRCodeAnalytics = z.infer<typeof insertQRCodeAnalyticsSchema>;