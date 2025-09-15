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

// Add relations for shareTokens
export const shareTokenRelations = relations(shareTokens, ({ one }) => ({
  tenant: one(tenantProfiles, { fields: [shareTokens.tenantId], references: [tenantProfiles.id] }),
}));

export const tenantProfileRelations = relations(tenantProfiles, ({ many }) => ({
  shareTokens: many(shareTokens),
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