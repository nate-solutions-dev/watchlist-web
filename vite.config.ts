import path from "node:path"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const apiTarget = env.VITE_API_URL

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: apiTarget
        ? {
            "/public": { target: apiTarget, changeOrigin: true },
            "/private": { target: apiTarget, changeOrigin: true },
            "/health": { target: apiTarget, changeOrigin: true },
          }
        : undefined,
    },
  }
})
