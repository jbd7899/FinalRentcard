import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users, tenantProfiles, landlordProfiles, properties } from "./schema";

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

// 5. Notifications System
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // 'application_update', 'new_message', 'document_verified', etc.
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  relatedEntityType: text("related_entity_type"), // 'property', 'application', 'message', etc.
  relatedEntityId: integer("related_entity_id"),
  createdAt: timestamp("created_at").defaultNow(),
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
export type Notification = typeof notifications.$inferSelect;

export type TenantReference = typeof tenantReferences.$inferSelect;
export type InsertTenantReference = z.infer<typeof insertTenantReferenceSchema>;

export type RoommateGroup = typeof roommateGroups.$inferSelect;
export type InsertRoommateGroup = z.infer<typeof insertRoommateGroupSchema>;

export type GroupApplication = typeof groupApplications.$inferSelect;
export type InsertGroupApplication = z.infer<typeof insertGroupApplicationSchema>; 