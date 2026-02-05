import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";

import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // ===================== HEALTH CHECK =====================
  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // ===================== BIO API =====================
  app.get(
    api.bio.get.path,
    async (_req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await storage.getBioData();
        res.json(data);
      } catch (err) {
        next(err);
      }
    },
  );

  return httpServer;
}
