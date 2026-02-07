import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { purchase } from "./routes/purchase";

const app = express();
app.use(express.json());

// ===================
// ✅ API
// ===================
app.post("/api/purchase", purchase);

// ===================
// ✅ FRONTEND SPA
// ===================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 Tự dò đúng thư mục frontend build (tránh sai đường dẫn trên Render)
const candidates = [
  path.resolve(__dirname, "../client/dist"),
  path.resolve(process.cwd(), "client/dist"),
  path.resolve(process.cwd(), "dist/public"),
  path.resolve(process.cwd(), "dist"),
  path.resolve(process.cwd(), "public"),
];

function findClientDist() {
  for (const p of candidates) {
    const indexPath = path.join(p, "index.html");
    if (fs.existsSync(indexPath)) return p;
  }
  return null;
}

const clientDist = findClientDist();

if (clientDist) {
  // Serve static assets (js/css/img)
  app.use(
    express.static(clientDist, {
      index: false, // 🔥 quan trọng: để GET "*" fallback luôn chạy
      maxAge: "1h",
    })
  );

  // SPA fallback (reload route không 404)
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ message: "Not found" });
    }
    return res.sendFile(path.join(clientDist, "index.html"));
  });
} else {
  // Nếu build chưa tồn tại → báo rõ ràng để bạn biết Render build sai
  app.get("*", (_req, res) => {
    res
      .status(500)
      .send(
        "Frontend build not found. Please run Vite build and ensure index.html exists in one of: " +
          candidates.join(", ")
      );
  });
}

export default app;
