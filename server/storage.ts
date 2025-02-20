import { User, TenantProfile, LandlordProfile, Property, Application } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tenantProfiles: Map<number, TenantProfile>;
  private landlordProfiles: Map<number, LandlordProfile>;
  private properties: Map<number, Property>;
  private applications: Map<number, Application>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.tenantProfiles = new Map();
    this.landlordProfiles = new Map();
    this.properties = new Map();
    this.applications = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: Omit<User, "id" | "createdAt">): Promise<User> {
    const id = this.currentId++;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async getTenantProfile(userId: number): Promise<TenantProfile | undefined> {
    return Array.from(this.tenantProfiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }

  async createTenantProfile(profile: Omit<TenantProfile, "id">): Promise<TenantProfile> {
    const id = this.currentId++;
    const newProfile: TenantProfile = { ...profile, id };
    this.tenantProfiles.set(id, newProfile);
    return newProfile;
  }

  async updateTenantProfile(id: number, profile: Partial<TenantProfile>): Promise<TenantProfile> {
    const existing = this.tenantProfiles.get(id);
    if (!existing) throw new Error("Profile not found");
    const updated = { ...existing, ...profile };
    this.tenantProfiles.set(id, updated);
    return updated;
  }

  async getLandlordProfile(userId: number): Promise<LandlordProfile | undefined> {
    return Array.from(this.landlordProfiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }

  async createLandlordProfile(profile: Omit<LandlordProfile, "id">): Promise<LandlordProfile> {
    const id = this.currentId++;
    const newProfile: LandlordProfile = { ...profile, id };
    this.landlordProfiles.set(id, newProfile);
    return newProfile;
  }

  async updateLandlordProfile(id: number, profile: Partial<LandlordProfile>): Promise<LandlordProfile> {
    const existing = this.landlordProfiles.get(id);
    if (!existing) throw new Error("Profile not found");
    const updated = { ...existing, ...profile };
    this.landlordProfiles.set(id, updated);
    return updated;
  }

  async getProperties(landlordId?: number): Promise<Property[]> {
    const properties = Array.from(this.properties.values());
    return landlordId 
      ? properties.filter(p => p.landlordId === landlordId)
      : properties;
  }

  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async createProperty(property: Omit<Property, "id">): Promise<Property> {
    const id = this.currentId++;
    const newProperty: Property = { ...property, id };
    this.properties.set(id, newProperty);
    return newProperty;
  }

  async updateProperty(id: number, property: Partial<Property>): Promise<Property> {
    const existing = this.properties.get(id);
    if (!existing) throw new Error("Property not found");
    const updated = { ...existing, ...property };
    this.properties.set(id, updated);
    return updated;
  }

  async getApplications(tenantId?: number, propertyId?: number): Promise<Application[]> {
    const applications = Array.from(this.applications.values());
    return applications.filter(app => 
      (!tenantId || app.tenantId === tenantId) && 
      (!propertyId || app.propertyId === propertyId)
    );
  }

  async createApplication(application: Omit<Application, "id" | "submittedAt">): Promise<Application> {
    const id = this.currentId++;
    const newApplication: Application = { 
      ...application, 
      id,
      submittedAt: new Date()
    };
    this.applications.set(id, newApplication);
    return newApplication;
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application> {
    const existing = this.applications.get(id);
    if (!existing) throw new Error("Application not found");
    const updated = { ...existing, status };
    this.applications.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();