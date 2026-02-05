import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {

  // Health check (Render rất thích endpoint này)
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  // API chính cho frontend
  app.get(api.bio.get.path, async (_req, res, next) => {
    try {
      const data = await storage.getBioData();
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  return httpServer;
}
