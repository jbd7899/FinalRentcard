import { User, TenantProfile, LandlordProfile, Property, Application } from "@shared/schema";
import { users, tenantProfiles, landlordProfiles, properties, applications } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id" | "createdAt">): Promise<User>;

  // Tenant profile operations
  getTenantProfile(userId: number): Promise<TenantProfile | undefined>;
  createTenantProfile(profile: Omit<TenantProfile, "id">): Promise<TenantProfile>;
  updateTenantProfile(id: number, profile: Partial<TenantProfile>): Promise<TenantProfile>;

  // Landlord profile operations
  getLandlordProfile(userId: number): Promise<LandlordProfile | undefined>;
  createLandlordProfile(profile: Omit<LandlordProfile, "id">): Promise<LandlordProfile>;
  updateLandlordProfile(id: number, profile: Partial<LandlordProfile>): Promise<LandlordProfile>;

  // Property operations
  getProperties(landlordId?: number): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: Omit<Property, "id">): Promise<Property>;
  updateProperty(id: number, property: Partial<Property>): Promise<Property>;

  // Application operations
  getApplications(tenantId?: number, propertyId?: number): Promise<Application[]>;
  createApplication(application: Omit<Application, "id" | "submittedAt">): Promise<Application>;
  updateApplicationStatus(id: number, status: string): Promise<Application>;

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

  async getApplications(tenantId?: number, propertyId?: number): Promise<Application[]> {
    let query = db.select().from(applications);
    if (tenantId) {
      query = query.where(eq(applications.tenantId, tenantId));
    }
    if (propertyId) {
      query = query.where(eq(applications.propertyId, propertyId));
    }
    return query;
  }

  async createApplication(application: Omit<Application, "id" | "submittedAt">): Promise<Application> {
    const [newApplication] = await db
      .insert(applications)
      .values({ ...application, submittedAt: new Date() })
      .returning();
    return newApplication;
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application> {
    const [updatedApplication] = await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    return updatedApplication;
  }
}

export const storage = new DatabaseStorage();