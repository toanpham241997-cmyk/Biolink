import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";

import { storage } from "./storage";
import { api } from "@shared/routes";

import { momoCreate, momoIPN } from "./routes/topupMomo";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ================= HEALTH CHECK =================
  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // ================= MOMO TOPUP ===================
  app.post("/api/topup/momo/create", momoCreate);
  app.post("/api/topup/momo/ipn", (req, res, next) => {
    // đảm bảo parse JSON cho IPN
    // (nếu app đã app.use(express.json()) global thì đoạn này không cần)
    return (require("express").json())(req, res, next);
  }, momoIPN);

  // ================= BIO API ======================
  app.get(
    api.bio.get.path,
    async (_req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await storage.getBioData();
        res.json(data);
      } catch (err) {
        next(err);
      }
    }
  );

  return httpServer;
}
