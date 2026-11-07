import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// Relative base so the production build works at the site root.
export default defineConfig({
  base: "./",
  plugins: [react()],
  // The logo archive is one lazy ~590 kB chunk (~116 kB gzipped) by design.
  build: { chunkSizeWarningLimit: 700 },
})
