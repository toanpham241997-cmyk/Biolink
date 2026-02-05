import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {

  // ⚠️ Seed nhưng KHÔNG được làm sập server
  storage.seedData().catch((err) => {
    console.error("⚠️ Seed skipped / failed:", err.message);
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

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
