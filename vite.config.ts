import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },

    server: {
      port: 5173,
      hmr: process.env.DISABLE_HMR !== "true",
      // Proxy /api/* to Express server in dev mode
      proxy: {
        "/api": {
          target: `http://localhost:${process.env.PORT || 3000}`,
          changeOrigin: true,
        },
      },
    },

    // Only expose env vars that are explicitly needed on the frontend
    // Do NOT expose SUPABASE_KEY here — that stays server-side only
    define: {
      ...(env.GEMINI_API_KEY
        ? { "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY) }
        : {}),
    },
  };
});
