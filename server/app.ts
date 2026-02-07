import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { purchase } from "./routes/purchase";

const app = express();
app.use(express.json());

// ✅ API
app.post("/api/purchase", purchase);

// ==============================
// ✅ SERVE FRONTEND (VITE BUILD)
// ==============================

// Với ESM (import), cần __dirname theo cách này
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ ĐƯỜNG DẪN QUAN TRỌNG:
// Repo bạn đang là: Biolink/server/app.ts
// Frontend thường build ra: Biolink/client/dist
// => đi lên 1 cấp từ /server -> /client/dist
const clientDist = path.resolve(__dirname, "../client/dist");

// Serve static assets
app.use(express.static(clientDist));

// ✅ SPA fallback: reload /shop/p/xxx không bị 404 nữa
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.sendFile(path.join(clientDist, "index.html"));
});

export default app;
