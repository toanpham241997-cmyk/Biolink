import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Seed data on startup
  await storage.seedData();
await registerRoutes(httpServer, app);
  
  app.get(api.bio.get.path, async (req, res) => {
    const data = await storage.getBioData();
    res.json(data);
  });

  return httpServer;
}
