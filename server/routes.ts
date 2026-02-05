import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import OpenAI from "openai";

import { storage } from "./storage";
import { api } from "@shared/routes";

// Khởi tạo OpenAI client (chỉ cần 1 lần)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // set trên Render
});

// Helper: trả lỗi gọn gàng
function sendError(res: Response, status: number, message: string) {
  return res.status(status).json({ ok: false, error: message });
}

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

  // ===================== CHATBOT API =====================
  // Client sẽ POST JSON: { message: "..." }
  app.post(
    "/api/chat",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Check API key
        if (!process.env.OPENAI_API_KEY) {
          return sendError(res, 500, "Thiếu OPENAI_API_KEY trên server (Render Environment).");
        }

        const message = (req.body?.message ?? "").toString().trim();

        if (!message) {
          return sendError(res, 400, "Missing message");
        }

        // ✅ Cách ổn định, dễ dùng: Chat Completions
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Bạn là Bot AI thân thiện. Trả lời ngắn gọn, rõ ràng, tiếng Việt là chính.",
            },
            { role: "user", content: message },
          ],
          temperature: 0.7,
        });

        const reply = completion.choices?.[0]?.message?.content?.trim() ?? "";

        return res.json({
          ok: true,
          reply: reply || "Mình chưa nhận được nội dung trả lời, bạn thử lại nhé.",
        });
      } catch (err) {
        // Nếu muốn log chi tiết:
        console.error("❌ /api/chat error:", err);
        next(err);
      }
    },
  );

  return httpServer;
}
