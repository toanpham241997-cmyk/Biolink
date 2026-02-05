import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
// Không import cartographer/dev-banner ở đây để tránh lỗi khi build production

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === "production";
const isReplit = process.env.REPL_ID !== undefined;

export default defineConfig(() => {
  const plugins: any[] = [react()];

  // Chỉ bật runtime overlay khi dev (production không cần)
  if (!isProd) {
    plugins.push(runtimeErrorOverlay());
  }

  // Chỉ bật plugin Replit khi đang chạy trên Replit và không phải production
  if (!isProd && isReplit) {
    try {
      // require kiểu CJS để né top-level await
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { cartographer } = require("@replit/vite-plugin-cartographer");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { devBanner } = require("@replit/vite-plugin-dev-banner");
      plugins.push(cartographer());
      plugins.push(devBanner());
    } catch {
      // Nếu không có 2 plugin này ở môi trường khác thì bỏ qua, không crash build
    }
  }

  return {
    plugins,

    // App React nằm trong /client
    root: path.resolve(__dirname, "client"),

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },

    // Build ra /dist/public để server serve static
    build: {
      outDir: path.resolve(__dirname, "dist", "public"),
      emptyOutDir: true,
    },

    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
