import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import OpenAI from "openai"; // 👈 thêm

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 👈 set trên Render
});

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {

  // ================= HEALTH CHECK =================
  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // ================= BIO API =================
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

  // ================= CHATBOT AI API =================
  app.post(
    "/api/chat",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { message } = req.body;

        if (!message) {
          return res.status(400).json({ error: "Missing message" });
        }

        const response = await openai.responses.create({
          model: "gpt-5-mini",
          input: message,
        });

        res.json({
          reply: response.output_text || "",
        });
      } catch (err) {
        next(err);
      }
    }
  );

  return httpServer;
}
