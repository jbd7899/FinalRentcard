import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPropertySchema } from "@shared/schema";
import { properties, applications } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Protected route middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Profile routes
  app.get("/api/profile/tenant/:userId", requireAuth, async (req, res) => {
    const profile = await storage.getTenantProfile(parseInt(req.params.userId));
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  });

  app.post("/api/profile/tenant", requireAuth, async (req, res) => {
    const profile = await storage.createTenantProfile(req.body);
    res.status(201).json(profile);
  });

  app.get("/api/profile/landlord/:userId", requireAuth, async (req, res) => {
    const profile = await storage.getLandlordProfile(parseInt(req.params.userId));
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  });

  app.post("/api/profile/landlord", requireAuth, async (req, res) => {
    const profile = await storage.createLandlordProfile(req.body);
    res.status(201).json(profile);
  });

  // Property routes
  app.get("/api/properties", async (req, res) => {
    try {
      const landlordId = req.query.landlordId ? parseInt(req.query.landlordId as string) : undefined;
      const propertiesData = await storage.getProperties(landlordId);

      // Get application counts for each property
      const applicationCounts = await Promise.all(
        propertiesData.map(async (property) => {
          const propertyApplications = await storage.getApplications(undefined, property.id);
          return {
            propertyId: property.id,
            count: propertyApplications.length
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
      const property = await storage.getPropertyBySlug(req.params.slug);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Error fetching property details", error });
    }
  });

  app.post("/api/landlord/properties", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(validatedData);
      res.status(201).json(property);
    } catch (error) {
      res.status(400).json({ message: "Invalid property data", error });
    }
  });

  // Application routes
  app.get("/api/applications", requireAuth, async (req, res) => {
    const { tenantId, propertyId } = req.query;
    const applications = await storage.getApplications(
      tenantId ? parseInt(tenantId as string) : undefined,
      propertyId ? parseInt(propertyId as string) : undefined
    );
    res.json(applications);
  });

  app.post("/api/applications", requireAuth, async (req, res) => {
    const application = await storage.createApplication(req.body);
    res.status(201).json(application);
  });

  app.patch("/api/applications/:id/status", requireAuth, async (req, res) => {
    const application = await storage.updateApplicationStatus(
      parseInt(req.params.id),
      req.body.status
    );
    res.json(application);
  });

  const httpServer = createServer(app);
  return httpServer;
}