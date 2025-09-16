import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Import all schema enhancements
import * as schemaEnhancements from "./schema-enhancements";

// Base user table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  userType: text("user_type").notNull(), // 'tenant' or 'landlord'
  phone: text("phone").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tenantProfiles = pgTable("tenant_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  moveInDate: timestamp("move_in_date"),
  maxRent: integer("max_rent"),
  employmentInfo: json("employment_info").$type<{
    employer: string;
    position: string;
    monthlyIncome: number;
    startDate: string;
  }>(),
  creditScore: integer("credit_score"),
  rentalHistory: json("rental_history").$type<{
    previousAddresses: {
      address: string;
      startDate: string;
      endDate: string;
      landlordContact: string;
    }[];
  }>(),
});

export const landlordProfiles = pgTable("landlord_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  companyName: text("company_name"),
  screeningCriteria: json("screening_criteria").$type<{
    minCreditScore: number;
    minIncome: number;
    backgroundCheck: boolean;
  }>(),
});

// Update the properties table definition to include applications relation
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  landlordId: integer("landlord_id").references(() => landlordProfiles.id),
  address: text("address").notNull(),
  rent: integer("rent").notNull(),
  description: text("description"),
  available: boolean("available").default(true),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  parking: text("parking"),
  availableFrom: timestamp("available_from"),
  screeningPageSlug: text("screening_page_slug"),
  requirements: json("requirements").$type<{
    icon: string;
    description: string;
  }[]>(),
  viewCount: integer("view_count").default(0),
  isArchived: boolean("is_archived").default(false),
});

export const interests = pgTable("interests", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenantProfiles.id), // optional - for authenticated users
  propertyId: integer("property_id").references(() => properties.id), // optional - null for general interests
  landlordId: integer("landlord_id").references(() => landlordProfiles.id).notNull(), // required
  contactInfo: json("contact_info").notNull().$type<{
    name: string;
    email: string;
    phone: string;
    preferredContact: 'email' | 'phone' | 'text';
  }>(),
  message: text("message"), // optional text from interested party
  status: text("status").notNull().default('new'), // 'new', 'contacted', 'archived'
  createdAt: timestamp("created_at").defaultNow(),
  viewedAt: timestamp("viewed_at"), // when landlord first viewed
});

// Add explicit relation between properties and interests
export const propertyRelations = relations(properties, ({ many }) => ({
  interests: many(interests)
}));

export const screeningPages = pgTable("screening_pages", {
  id: serial("id").primaryKey(),
  landlordId: integer("landlord_id").references(() => landlordProfiles.id),
  businessName: text("business_name").notNull(),
  contactName: text("contact_name").notNull(),
  businessEmail: text("business_email").notNull(),
  screeningCriteria: json("screening_criteria").$type<{
    minCreditScore: number;
    minMonthlyIncome: number;
    noEvictions: boolean;
    cleanRentalHistory: boolean;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  slug: text("slug").unique().notNull(),
  isActive: boolean("is_active").default(true),
});

export const rentCards = pgTable("rent_cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  hasPets: boolean("has_pets").notNull(),
  currentEmployer: text("current_employer").notNull(),
  yearsEmployed: text("years_employed").notNull(),
  monthlyIncome: integer("monthly_income").notNull(),
  currentAddress: text("current_address").notNull(),
  currentRent: integer("current_rent").notNull(),
  moveInDate: text("move_in_date").notNull(),
  maxRent: integer("max_rent").notNull(),
  hasRoommates: boolean("has_roommates").notNull(),
  creditScore: integer("credit_score").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shareTokens = pgTable("share_tokens", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  tenantId: integer("tenant_id").references(() => tenantProfiles.id).notNull(),
  scope: text("scope").notNull().default('rentcard'), // 'rentcard' for now, extensible for future use
  expiresAt: timestamp("expires_at"), // optional expiration
  revoked: boolean("revoked").notNull().default(false),
  viewCount: integer("view_count").notNull().default(0),
  lastViewedAt: timestamp("last_viewed_at"), // when last accessed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const propertyQRCodes = pgTable("property_qr_codes", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  qrCodeData: text("qr_code_data").notNull(), // The URL/data encoded in the QR code
  title: text("title").notNull(), // Display name for the QR code
  description: text("description"), // Optional description
  scanCount: integer("scan_count").notNull().default(0),
  lastScannedAt: timestamp("last_scanned_at"), // when last scanned
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Shortlinks table for clean, short URLs with channel attribution
export const shortlinks = pgTable("shortlinks", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(), // Short unique identifier (e.g., "abc123")
  targetUrl: text("target_url").notNull(), // The full URL to redirect to
  shareTokenId: integer("share_token_id").references(() => shareTokens.id), // Link to share token if applicable
  tenantId: integer("tenant_id").references(() => tenantProfiles.id), // Optional tenant owner
  landlordId: integer("landlord_id").references(() => landlordProfiles.id), // Optional landlord owner
  propertyId: integer("property_id").references(() => properties.id), // Optional property association
  resourceType: text("resource_type").notNull(), // 'rentcard', 'property', 'screening_page', etc.
  resourceId: text("resource_id"), // ID of the specific resource
  title: text("title"), // Optional title for analytics
  description: text("description"), // Optional description
  channelAttributed: text("channel_attributed"), // The channel that created this shortlink
  clickCount: integer("click_count").notNull().default(0),
  lastClickedAt: timestamp("last_clicked_at"), // When last accessed
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"), // Optional expiration
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Shortlink click analytics for detailed tracking
export const shortlinkClicks = pgTable("shortlink_clicks", {
  id: serial("id").primaryKey(),
  shortlinkId: integer("shortlink_id").references(() => shortlinks.id).notNull(),
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
  channel: text("channel").notNull(), // 'copy', 'email', 'sms', 'qr', 'pdf', 'direct', etc.
  ipAddress: text("ip_address"), // For analytics
  userAgent: text("user_agent"), // For device/browser analytics
  referrer: text("referrer"), // HTTP referrer if available
  deviceInfo: json("device_info").$type<{
    type: 'desktop' | 'mobile' | 'tablet';
    os?: string;
    browser?: string;
  }>(),
  locationInfo: json("location_info").$type<{
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
  }>(),
  sessionId: text("session_id"), // To group related actions
  userId: integer("user_id").references(() => users.id), // If user is authenticated
});

// Contact preferences for tenants
export const tenantContactPreferences = pgTable("tenant_contact_preferences", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenantProfiles.id).notNull(),
  preferredMethods: json("preferred_methods").$type<('email' | 'phone' | 'text')[]>().notNull().default(['email']),
  timePreferences: json("time_preferences").$type<{
    startTime: string; // e.g. "09:00"
    endTime: string;   // e.g. "17:00"
    timezone: string;  // e.g. "America/New_York"
    daysOfWeek: number[]; // 0-6, where 0 is Sunday
  }>().notNull().default({
    startTime: "09:00",
    endTime: "17:00", 
    timezone: "America/New_York",
    daysOfWeek: [1, 2, 3, 4, 5] // Monday-Friday
  }),
  frequencyPreferences: json("frequency_preferences").$type<{
    propertyInquiries: 'immediate' | 'daily' | 'weekly';
    applicationUpdates: 'immediate' | 'daily' | 'weekly';
    generalNotifications: 'immediate' | 'daily' | 'weekly';
  }>().notNull().default({
    propertyInquiries: "immediate",
    applicationUpdates: "immediate", 
    generalNotifications: "daily"
  }),
  allowUnknownContacts: boolean("allow_unknown_contacts").notNull().default(true),
  allowPhoneCalls: boolean("allow_phone_calls").notNull().default(true),
  allowTextMessages: boolean("allow_text_messages").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Communication log to track all communications
export const communicationLogs = pgTable("communication_logs", {
  id: serial("id").primaryKey(),
  landlordId: integer("landlord_id").references(() => landlordProfiles.id).notNull(),
  tenantId: integer("tenant_id").references(() => tenantProfiles.id), // nullable for guest contacts
  propertyId: integer("property_id").references(() => properties.id), // nullable for general communications
  communicationType: text("communication_type").notNull(), // 'email', 'phone', 'sms', 'system'
  communicationMethod: text("communication_method").notNull(), // 'manual', 'template', 'automated'
  subject: text("subject"),
  message: text("message"),
  recipientInfo: json("recipient_info").$type<{
    name: string;
    email?: string;
    phone?: string;
  }>().notNull(),
  status: text("status").notNull().default('sent'), // 'sent', 'delivered', 'read', 'failed'
  threadId: text("thread_id"), // for grouping related communications
  templateId: integer("template_id").references(() => communicationTemplates.id), // nullable
  metadata: json("metadata").$type<{
    deliveryTimestamp?: string;
    readTimestamp?: string;
    errorMessage?: string;
    retryCount?: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Blocked contacts list for tenants
export const tenantBlockedContacts = pgTable("tenant_blocked_contacts", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenantProfiles.id).notNull(),
  landlordId: integer("landlord_id").references(() => landlordProfiles.id), // nullable for blocking by email/phone
  blockedEmail: text("blocked_email"), // for blocking non-registered landlords
  blockedPhone: text("blocked_phone"), // for blocking by phone number
  reason: text("reason"), // optional reason for blocking
  blockType: text("block_type").notNull().default('permanent'), // 'permanent', 'temporary'
  blockedUntil: timestamp("blocked_until"), // for temporary blocks
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Communication templates for landlords
export const communicationTemplates = pgTable("communication_templates", {
  id: serial("id").primaryKey(),
  landlordId: integer("landlord_id").references(() => landlordProfiles.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // 'property_inquiry', 'application_update', 'general', 'follow_up'
  variables: json("variables").$type<string[]>().notNull().default([]), // Available template variables like {{tenantName}}, {{propertyAddress}}
  isActive: boolean("is_active").notNull().default(true),
  usageCount: integer("usage_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Recipient contacts for tenants to store frequently contacted landlords/agents
export const recipientContacts = pgTable("recipient_contacts", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenantProfiles.id).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  contactType: text("contact_type").notNull(), // 'landlord', 'property_manager', 'real_estate_agent', 'other'
  propertyAddress: text("property_address"), // Associated property if any
  notes: text("notes"), // Additional notes about this contact
  isFavorite: boolean("is_favorite").notNull().default(false),
  lastContactedAt: timestamp("last_contacted_at"), // When tenant last shared with this contact
  contactCount: integer("contact_count").notNull().default(0), // How many times tenant has shared with this contact
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Message templates for tenants to use when sharing RentCards
export const tenantMessageTemplates = pgTable("tenant_message_templates", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenantProfiles.id).notNull(),
  templateName: text("template_name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  category: text("category").notNull(), // 'initial_inquiry', 'follow_up', 'application_submission', 'custom'
  variables: json("variables").$type<string[]>().notNull().default([]), // Available variables like {{contact_name}}, {{property_address}}, {{my_name}}
  isDefault: boolean("is_default").notNull().default(false), // Whether this is a default template for the category
  usageCount: integer("usage_count").notNull().default(0), // How many times this template has been used
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Contact sharing history to track when tenants share with specific contacts
export const contactSharingHistory = pgTable("contact_sharing_history", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenantProfiles.id).notNull(),
  contactId: integer("contact_id").references(() => recipientContacts.id).notNull(),
  shareTokenId: integer("share_token_id").references(() => shareTokens.id), // Link to the shared token
  shortlinkId: integer("shortlink_id").references(() => shortlinks.id), // Link to the shortlink used
  templateId: integer("template_id").references(() => tenantMessageTemplates.id), // Template used if any
  messageUsed: text("message_used"), // The actual message sent (for history)
  subjectUsed: text("subject_used"), // The subject line used
  shareMethod: text("share_method").notNull(), // 'email', 'sms', 'copy_link', 'direct_share'
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  responseReceived: boolean("response_received").notNull().default(false),
  responseReceivedAt: timestamp("response_received_at"), // When response was received (manual tracking)
  notes: text("notes"), // Follow-up notes
});

// Add relations for shareTokens
export const shareTokenRelations = relations(shareTokens, ({ one }) => ({
  tenant: one(tenantProfiles, { fields: [shareTokens.tenantId], references: [tenantProfiles.id] }),
}));

export const tenantProfileRelations = relations(tenantProfiles, ({ many, one }) => ({
  shareTokens: many(shareTokens),
  contactPreferences: one(tenantContactPreferences, { fields: [tenantProfiles.id], references: [tenantContactPreferences.tenantId] }),
  blockedContacts: many(tenantBlockedContacts),
  communicationLogs: many(communicationLogs),
  recipientContacts: many(recipientContacts),
  messageTemplates: many(tenantMessageTemplates),
  sharingHistory: many(contactSharingHistory),
}));

// Contact preference relations
export const tenantContactPreferencesRelations = relations(tenantContactPreferences, ({ one }) => ({
  tenant: one(tenantProfiles, { fields: [tenantContactPreferences.tenantId], references: [tenantProfiles.id] }),
}));

// Communication log relations
export const communicationLogRelations = relations(communicationLogs, ({ one }) => ({
  landlord: one(landlordProfiles, { fields: [communicationLogs.landlordId], references: [landlordProfiles.id] }),
  tenant: one(tenantProfiles, { fields: [communicationLogs.tenantId], references: [tenantProfiles.id] }),
  property: one(properties, { fields: [communicationLogs.propertyId], references: [properties.id] }),
  template: one(communicationTemplates, { fields: [communicationLogs.templateId], references: [communicationTemplates.id] }),
}));

// Blocked contacts relations
export const tenantBlockedContactsRelations = relations(tenantBlockedContacts, ({ one }) => ({
  tenant: one(tenantProfiles, { fields: [tenantBlockedContacts.tenantId], references: [tenantProfiles.id] }),
  landlord: one(landlordProfiles, { fields: [tenantBlockedContacts.landlordId], references: [landlordProfiles.id] }),
}));

// Communication templates relations
export const communicationTemplatesRelations = relations(communicationTemplates, ({ one, many }) => ({
  landlord: one(landlordProfiles, { fields: [communicationTemplates.landlordId], references: [landlordProfiles.id] }),
  communicationLogs: many(communicationLogs),
}));

// Recipient contacts relations
export const recipientContactsRelations = relations(recipientContacts, ({ one, many }) => ({
  tenant: one(tenantProfiles, { fields: [recipientContacts.tenantId], references: [tenantProfiles.id] }),
  sharingHistory: many(contactSharingHistory),
}));

// Tenant message templates relations
export const tenantMessageTemplatesRelations = relations(tenantMessageTemplates, ({ one, many }) => ({
  tenant: one(tenantProfiles, { fields: [tenantMessageTemplates.tenantId], references: [tenantProfiles.id] }),
  sharingHistory: many(contactSharingHistory),
}));

// Contact sharing history relations
export const contactSharingHistoryRelations = relations(contactSharingHistory, ({ one }) => ({
  tenant: one(tenantProfiles, { fields: [contactSharingHistory.tenantId], references: [tenantProfiles.id] }),
  contact: one(recipientContacts, { fields: [contactSharingHistory.contactId], references: [recipientContacts.id] }),
  shareToken: one(shareTokens, { fields: [contactSharingHistory.shareTokenId], references: [shareTokens.id] }),
  shortlink: one(shortlinks, { fields: [contactSharingHistory.shortlinkId], references: [shortlinks.id] }),
  template: one(tenantMessageTemplates, { fields: [contactSharingHistory.templateId], references: [tenantMessageTemplates.id] }),
}));

// Update landlord profile relations
export const landlordProfileRelations = relations(landlordProfiles, ({ many }) => ({
  communicationLogs: many(communicationLogs),
  communicationTemplates: many(communicationTemplates),
  blockedByTenants: many(tenantBlockedContacts),
}));

// Add relations for propertyQRCodes
export const propertyQRCodeRelations = relations(propertyQRCodes, ({ one }) => ({
  property: one(properties, { fields: [propertyQRCodes.propertyId], references: [properties.id] }),
}));

// Update property relations to include QR codes
export const updatedPropertyRelations = relations(properties, ({ many }) => ({
  interests: many(interests),
  qrCodes: many(propertyQRCodes),
}));

// Add relations for shortlinks
export const shortlinkRelations = relations(shortlinks, ({ one, many }) => ({
  shareToken: one(shareTokens, { fields: [shortlinks.shareTokenId], references: [shareTokens.id] }),
  tenant: one(tenantProfiles, { fields: [shortlinks.tenantId], references: [tenantProfiles.id] }),
  landlord: one(landlordProfiles, { fields: [shortlinks.landlordId], references: [landlordProfiles.id] }),
  property: one(properties, { fields: [shortlinks.propertyId], references: [properties.id] }),
  clicks: many(shortlinkClicks),
}));

export const shortlinkClickRelations = relations(shortlinkClicks, ({ one }) => ({
  shortlink: one(shortlinks, { fields: [shortlinkClicks.shortlinkId], references: [shortlinks.id] }),
  user: one(users, { fields: [shortlinkClicks.userId], references: [users.id] }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  email: z.string().email("Invalid email address")
});

export const insertTenantProfileSchema = createInsertSchema(tenantProfiles).omit({
  id: true
});

export const insertLandlordProfileSchema = createInsertSchema(landlordProfiles).omit({
  id: true
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true
});

export const insertInterestSchema = createInsertSchema(interests).omit({
  id: true,
  createdAt: true,
  viewedAt: true
}).extend({
  contactInfo: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    preferredContact: z.enum(['email', 'phone', 'text'])
  }),
  status: z.enum(['new', 'contacted', 'archived']).default('new')
});

// Client-safe schema for API requests - omits tenantId to prevent client manipulation
export const clientInterestSchema = insertInterestSchema.omit({
  tenantId: true
});

export const insertScreeningPageSchema = createInsertSchema(screeningPages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  landlordId: true, // This will be set by the server based on authenticated user
}).extend({
  businessName: z.string().min(1, "Business name is required"),
  businessEmail: z.string().email("Invalid email address"),
  contactName: z.string().min(1, "Contact name is required"),
  screeningCriteria: z.object({
    minCreditScore: z.number().min(300).max(850),
    minMonthlyIncome: z.number().min(0),
    noEvictions: z.boolean(),
    cleanRentalHistory: z.boolean()
  })
});

export const insertRentCardSchema = createInsertSchema(rentCards)
  .omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    monthlyIncome: z.string().transform(val => parseInt(val)),
    currentRent: z.string().transform(val => parseInt(val)),
    maxRent: z.string().transform(val => parseInt(val)),
    creditScore: z.string().transform(val => parseInt(val)),
  });

export const insertShareTokenSchema = createInsertSchema(shareTokens)
  .omit({
    id: true,
    token: true, // Generated by server
    tenantId: true, // Set by server based on authenticated user
    viewCount: true,
    lastViewedAt: true,
    createdAt: true,
  })
  .extend({
    scope: z.enum(['rentcard']).default('rentcard'),
    expiresAt: z.preprocess((val) => {
      if (typeof val === 'string') {
        return new Date(val);
      }
      return val;
    }, z.date().optional()),
  });

export const insertPropertyQRCodeSchema = createInsertSchema(propertyQRCodes)
  .omit({
    id: true,
    scanCount: true,
    lastScannedAt: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    title: z.string().min(1, "QR code title is required"),
    description: z.string().optional(),
    qrCodeData: z.string().url("QR code data must be a valid URL"),
  });

export const insertShortlinkSchema = createInsertSchema(shortlinks).omit({
  id: true,
  clickCount: true,
  lastClickedAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  slug: z.string().min(3, "Slug must be at least 3 characters").max(12, "Slug must be at most 12 characters").regex(/^[a-zA-Z0-9-_]+$/, "Slug can only contain letters, numbers, hyphens, and underscores"),
  targetUrl: z.string().url("Target URL must be a valid URL").refine((url) => {
    // Only allow internal routes - prevent open redirect vulnerability
    const urlObj = new URL(url);
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
    
    return isValidProtocol && isValidHostname && isValidPath;
  }, "Target URL must be an internal route only"),
  resourceType: z.enum(['rentcard', 'property', 'screening_page', 'qr_code', 'general']),
  channelAttributed: z.enum(['copy', 'mobile_share', 'email', 'sms', 'qr', 'pdf', 'direct', 'unknown']).optional(),
});

export const insertShortlinkClickSchema = createInsertSchema(shortlinkClicks).omit({
  id: true,
  clickedAt: true,
}).extend({
  channel: z.enum(['copy', 'mobile_share', 'email', 'sms', 'qr', 'pdf', 'direct', 'unknown']),
  deviceInfo: z.object({
    type: z.enum(['desktop', 'mobile', 'tablet']),
    os: z.string().optional(),
    browser: z.string().optional(),
  }).optional(),
  locationInfo: z.object({
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
    timezone: z.string().optional(),
  }).optional(),
});

// Contact preference schemas
export const insertTenantContactPreferencesSchema = createInsertSchema(tenantContactPreferences)
  .omit({
    id: true,
    tenantId: true, // Set by server based on authenticated user
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    preferredMethods: z.array(z.enum(['email', 'phone', 'text'])).min(1, "At least one contact method must be selected"),
    timePreferences: z.object({
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be in HH:MM format"),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be in HH:MM format"),
      timezone: z.string().min(1, "Timezone is required"),
      daysOfWeek: z.array(z.number().min(0).max(6)).min(1, "At least one day must be selected"),
    }),
    frequencyPreferences: z.object({
      propertyInquiries: z.enum(['immediate', 'daily', 'weekly']),
      applicationUpdates: z.enum(['immediate', 'daily', 'weekly']),
      generalNotifications: z.enum(['immediate', 'daily', 'weekly']),
    }),
  });

export const insertCommunicationLogSchema = createInsertSchema(communicationLogs)
  .omit({
    id: true,
    landlordId: true, // Set by server based on authenticated user
    createdAt: true,
  })
  .extend({
    communicationType: z.enum(['email', 'phone', 'sms', 'system']),
    communicationMethod: z.enum(['manual', 'template', 'automated']),
    recipientInfo: z.object({
      name: z.string().min(1, "Recipient name is required"),
      email: z.string().email().optional(),
      phone: z.string().optional(),
    }),
    status: z.enum(['sent', 'delivered', 'read', 'failed']).default('sent'),
  });

export const insertTenantBlockedContactsSchema = createInsertSchema(tenantBlockedContacts)
  .omit({
    id: true,
    tenantId: true, // Set by server based on authenticated user
    createdAt: true,
  })
  .extend({
    blockType: z.enum(['permanent', 'temporary']).default('permanent'),
    blockedUntil: z.preprocess((val) => {
      if (typeof val === 'string') {
        return new Date(val);
      }
      return val;
    }, z.date().optional()),
  });

export const insertCommunicationTemplateSchema = createInsertSchema(communicationTemplates)
  .omit({
    id: true,
    landlordId: true, // Set by server based on authenticated user
    usageCount: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    title: z.string().min(1, "Template title is required"),
    content: z.string().min(1, "Template content is required"),
    category: z.enum(['property_inquiry', 'application_update', 'general', 'follow_up']),
    variables: z.array(z.string()).default([]),
  });

// Recipient contacts insert schema
export const insertRecipientContactSchema = createInsertSchema(recipientContacts)
  .omit({
    id: true,
    tenantId: true, // Set by server based on authenticated user
    contactCount: true,
    lastContactedAt: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    name: z.string().min(1, "Contact name is required").max(100, "Name must be under 100 characters"),
    email: z.string().email("Valid email is required"),
    phone: z.string().optional(),
    company: z.string().optional(),
    contactType: z.enum(['landlord', 'property_manager', 'real_estate_agent', 'other']),
    propertyAddress: z.string().optional(),
    notes: z.string().max(500, "Notes must be under 500 characters").optional(),
    isFavorite: z.boolean().default(false),
  });

// Tenant message templates insert schema
export const insertTenantMessageTemplateSchema = createInsertSchema(tenantMessageTemplates)
  .omit({
    id: true,
    tenantId: true, // Set by server based on authenticated user
    usageCount: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    templateName: z.string().min(1, "Template name is required").max(100, "Name must be under 100 characters"),
    subject: z.string().min(1, "Subject is required").max(200, "Subject must be under 200 characters"),
    body: z.string().min(1, "Message body is required").max(2000, "Message must be under 2000 characters"),
    category: z.enum(['initial_inquiry', 'follow_up', 'application_submission', 'custom']),
    variables: z.array(z.string()).default([]),
    isDefault: z.boolean().default(false),
  });

// Contact sharing history insert schema
export const insertContactSharingHistorySchema = createInsertSchema(contactSharingHistory)
  .omit({
    id: true,
    tenantId: true, // Set by server based on authenticated user
    sentAt: true,
    responseReceived: true,
    responseReceivedAt: true,
  })
  .extend({
    shareMethod: z.enum(['email', 'sms', 'copy_link', 'direct_share']),
    messageUsed: z.string().optional(),
    subjectUsed: z.string().optional(),
    notes: z.string().max(500, "Notes must be under 500 characters").optional(),
  });

// Re-export all schema enhancements
export * from "./schema-enhancements";

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type TenantProfile = typeof tenantProfiles.$inferSelect;
export type LandlordProfile = typeof landlordProfiles.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type Interest = typeof interests.$inferSelect;
export type ScreeningPage = typeof screeningPages.$inferSelect;
export type InsertScreeningPage = z.infer<typeof insertScreeningPageSchema>;
export type RentCard = typeof rentCards.$inferSelect;
export type InsertRentCard = z.infer<typeof insertRentCardSchema>;
export type InsertInterest = z.infer<typeof insertInterestSchema>;
export type ShareToken = typeof shareTokens.$inferSelect;
export type InsertShareToken = z.infer<typeof insertShareTokenSchema>;
export type PropertyQRCode = typeof propertyQRCodes.$inferSelect;
export type InsertPropertyQRCode = z.infer<typeof insertPropertyQRCodeSchema>;
export type Shortlink = typeof shortlinks.$inferSelect;
export type InsertShortlink = z.infer<typeof insertShortlinkSchema>;
export type ShortlinkClick = typeof shortlinkClicks.$inferSelect;
export type InsertShortlinkClick = z.infer<typeof insertShortlinkClickSchema>;
export type TenantContactPreferences = typeof tenantContactPreferences.$inferSelect;
export type InsertTenantContactPreferences = z.infer<typeof insertTenantContactPreferencesSchema>;
export type CommunicationLog = typeof communicationLogs.$inferSelect;
export type InsertCommunicationLog = z.infer<typeof insertCommunicationLogSchema>;
export type TenantBlockedContact = typeof tenantBlockedContacts.$inferSelect;
export type InsertTenantBlockedContact = z.infer<typeof insertTenantBlockedContactsSchema>;
export type CommunicationTemplate = typeof communicationTemplates.$inferSelect;
export type InsertCommunicationTemplate = z.infer<typeof insertCommunicationTemplateSchema>;
export type RecipientContact = typeof recipientContacts.$inferSelect;
export type InsertRecipientContact = z.infer<typeof insertRecipientContactSchema>;
export type TenantMessageTemplate = typeof tenantMessageTemplates.$inferSelect;
export type InsertTenantMessageTemplate = z.infer<typeof insertTenantMessageTemplateSchema>;
export type ContactSharingHistory = typeof contactSharingHistory.$inferSelect;
export type InsertContactSharingHistory = z.infer<typeof insertContactSharingHistorySchema>;

export type StatsTimeframe = 'today' | '7days' | '30days';

export interface StatsDataPoint {
  date: string;
  count: number;
}

export interface StatsResponse {
  data: StatsDataPoint[];
  total: number;
}

export const statsTimeframeSchema = z.enum(['today', '7days', '30days']);