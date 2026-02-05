import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // dist/public vì vite build ra dist/public
  const distPath = path.resolve(process.cwd(), "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve static assets
  app.use(express.static(distPath));

  // Catch-all: phục vụ index.html cho React Router
  // ⚠️ EXPRESS 5 PHẢI DÙNG REGEX
  app.use(/.*/, (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
