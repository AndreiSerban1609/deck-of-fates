import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// For GitHub Pages: set to "/<repo-name>/" (e.g., "/deck-of-fates/")
// For local dev or custom domain: leave as "/"
const base = process.env.BASE_PATH || "/deck-of-fates/";

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: "dist",
  },
});
