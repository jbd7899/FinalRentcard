import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

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
    const landlordId = req.query.landlordId ? parseInt(req.query.landlordId as string) : undefined;
    const properties = await storage.getProperties(landlordId);
    res.json(properties);
  });

  app.post("/api/properties", requireAuth, async (req, res) => {
    const property = await storage.createProperty(req.body);
    res.status(201).json(property);
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
