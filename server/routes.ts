import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

/**
 * Register API routes for the app.
 * - KHÔNG được gọi lại registerRoutes() bên trong chính nó (sẽ recursion vô hạn).
 * - Seed data 1 lần khi start để web không bị thiếu categories/links.
 */
export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Seed data on startup
  try {
    await storage.seedData();
    console.log("✅ storage.seedData() ok");
  } catch (err) {
    console.error("❌ storage.seedData() failed:", err);
    // Nếu muốn server vẫn chạy dù seed fail thì comment dòng throw này
    throw err;
  }

  // Health check (tuỳ chọn)
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  // GET /api/bio  (path lấy từ @shared/routes)
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
