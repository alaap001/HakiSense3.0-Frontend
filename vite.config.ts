import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // The frontend calls `/agentos/*`; the dev proxy strips the prefix and
      // forwards to the AgentOS backend, so CORS isn't hit in development.
      //   /agentos/api/research -> http://localhost:7777/api/research
      //   /agentos/config       -> http://localhost:7777/config
      "/agentos": {
        target: "http://localhost:7777",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/agentos/, ""),
      },
    },
  },
})
