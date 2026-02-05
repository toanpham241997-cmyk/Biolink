import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import fs from "fs";

import { registerRoutes } from "./routes";
import { storage } from "./storage";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Body parsing
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// API logger (chỉ log /api)
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json.bind(res);
  res.json = function (bodyJson: any, ...args: any[]) {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson, ...args);
  };

  res.on("finish", () => {
    if (!reqPath.startsWith("/api")) return;
    const duration = Date.now() - start;

    let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
    if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
    log(logLine);
  });

  next();
});

function serveStaticProd(app: express.Express) {
  // Vite build output theo config của bạn: dist/public
  const distPublic = path.join(process.cwd(), "dist", "public");
  const indexHtml = path.join(distPublic, "index.html");

  if (!fs.existsSync(indexHtml)) {
    console.error(
      `❌ Missing ${indexHtml}. Did you run "vite build" (render-build) successfully?`,
    );
  }

  // Serve static assets
  app.use(express.static(distPublic));

  // SPA fallback: không đụng /api
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    return res.sendFile(indexHtml);
  });
}

(async () => {
  // ✅ Seed DB trước khi đăng ký routes (để /api/bio có data)
  try {
    await storage.seedData();
    log("✅ Database seeded", "db");
  } catch (err) {
    console.error("❌ Seed failed:", err);
  }

  // Routes
  await registerRoutes(httpServer, app);

  // Error handler (để sau routes)
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) return next(err);
    return res.status(status).json({ message });
  });

  // Dev = Vite HMR, Prod = serve dist/public
  if (process.env.NODE_ENV === "production") {
    serveStaticProd(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // Listen
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
