import { db } from "./db";
import * as schema from "@shared/schema";
import crypto from "crypto";

// Development-only test account seeding
async function seedTestAccounts() {
  console.log("🌱 Starting test account seeding...");
  
  try {
    // Hash function using Node's crypto module
    const hashPassword = async (password: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        crypto.scrypt(password, 'salt', 64, (err, derivedKey) => {
          if (err) reject(err);
          resolve(derivedKey.toString('hex'));
        });
      });
    };
    
    // Create test tenant user
    const hashedPasswordTenant = await hashPassword("test123");
    const [tenantUser] = await db.insert(schema.users).values({
      email: "test-tenant@myrentcard.com",
      password: hashedPasswordTenant,
      userType: "tenant",
      fullName: "Test Tenant User",
      phoneNumber: "555-0001"
    }).returning();
    
    console.log("✅ Created test tenant user:", tenantUser.email);
    
    // Create tenant profile
    const [tenantProfile] = await db.insert(schema.tenantProfiles).values({
      userId: tenantUser.id,
      fullName: "Test Tenant User",
      email: "test-tenant@myrentcard.com",
      phoneNumber: "555-0001",
      currentEmployer: "Test Company Inc",
      annualIncome: "75000",
      creditScore: 750,
      rentalHistory: JSON.stringify([{
        address: "123 Previous St",
        landlordName: "Previous Landlord",
        landlordContact: "555-9999",
        rentAmount: 1500,
        startDate: "2022-01-01",
        endDate: "2024-01-01"
      }]),
      employmentInfo: JSON.stringify({
        employer: "Test Company Inc",
        position: "Software Engineer",
        duration: "2 years",
        income: "75000"
      }),
      emergencyContact: JSON.stringify({
        name: "Emergency Contact",
        relationship: "Friend",
        phone: "555-0002"
      }),
      pets: JSON.stringify([]),
      references: JSON.stringify([]),
      additionalInfo: "Test tenant account for development"
    }).returning();
    
    console.log("✅ Created test tenant profile for user ID:", tenantProfile.userId);
    
    // Create test landlord user
    const hashedPasswordLandlord = await hashPassword("test123");
    const [landlordUser] = await db.insert(schema.users).values({
      email: "test-landlord@myrentcard.com",
      password: hashedPasswordLandlord,
      userType: "landlord",
      fullName: "Test Landlord User",
      phoneNumber: "555-0003"
    }).returning();
    
    console.log("✅ Created test landlord user:", landlordUser.email);
    
    // Create landlord profile
    const [landlordProfile] = await db.insert(schema.landlordProfiles).values({
      userId: landlordUser.id,
      fullName: "Test Landlord User",
      email: "test-landlord@myrentcard.com",
      phoneNumber: "555-0003",
      companyName: "Test Properties LLC",
      bio: "Test landlord account for development purposes",
      website: "https://testproperties.com",
      socialMedia: JSON.stringify({
        linkedin: "https://linkedin.com/in/testlandlord"
      }),
      screeningCriteria: JSON.stringify({
        minCreditScore: 650,
        minIncome: 3000,
        requiresReferences: true,
        petsAllowed: true,
        smokingAllowed: false
      }),
      managedProperties: 5,
      yearStarted: 2020
    }).returning();
    
    console.log("✅ Created test landlord profile for user ID:", landlordProfile.userId);
    
    // Create a sample property for the landlord  
    const [property] = await db.insert(schema.properties).values({
      landlordId: landlordProfile.id,
      address: "456 Test Property Ave",
      rent: 1800,
      description: "Beautiful test apartment for development testing",
      available: true,
      bedrooms: 2,
      bathrooms: 1,
      parking: "Covered parking available",
      availableFrom: new Date(),
      requirements: [
        { icon: "credit-card", description: "Minimum credit score 650" },
        { icon: "dollar-sign", description: "3x rent income requirement" },
        { icon: "file-text", description: "References required" }
      ]
    }).returning();
    
    console.log("✅ Created test property for landlord:", property.address);
    
    console.log("\n🎉 Test account seeding completed successfully!");
    console.log("\n📋 Test Accounts Created:");
    console.log("Tenant: test-tenant@myrentcard.com / password: test123");
    console.log("Landlord: test-landlord@myrentcard.com / password: test123");
    
    return {
      tenant: { user: tenantUser, profile: tenantProfile },
      landlord: { user: landlordUser, profile: landlordProfile, property }
    };
    
  } catch (error) {
    console.error("❌ Error seeding test accounts:", error);
    throw error;
  }
}

// Run if called directly from command line
seedTestAccounts()
  .then(() => {
    console.log("\n✨ Seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding failed:", error);
    process.exit(1);
  });

export { seedTestAccounts };