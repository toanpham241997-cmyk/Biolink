import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Không import cartographer/dev-banner ở top-level để tránh lỗi build production

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";
  const isReplit = process.env.REPL_ID !== undefined;

  const plugins: any[] = [react()];

  // Chỉ bật runtime overlay khi dev
  if (!isProd) {
    plugins.push(runtimeErrorOverlay());
  }

  // Chỉ bật plugin Replit khi dev + đang chạy trên Replit
  if (!isProd && isReplit) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { cartographer } = require("@replit/vite-plugin-cartographer");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { devBanner } = require("@replit/vite-plugin-dev-banner");
      plugins.push(cartographer());
      plugins.push(devBanner());
    } catch {
      // Không có plugin thì bỏ qua, không làm crash build
    }
  }

  return {
    plugins,

    // ✅ QUAN TRỌNG: React nằm trong /client
    root: path.resolve(__dirname, "client"),

    // ✅ QUAN TRỌNG: luôn dùng "/" để Vercel không lỗi assets path
    base: "/",

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },

    // ✅ FIX VERCEL 404: build ra đúng dist (không /public)
    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
      sourcemap: !isProd,
    },

    // Tránh một số lỗi libs dùng process/env trên trình duyệt
    define: {
      "process.env.NODE_ENV": JSON.stringify(isProd ? "production" : "development"),
    },

    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
      port: 5173,
      host: true,
    },

    preview: {
      port: 4173,
      host: true,
    },
  };
});
