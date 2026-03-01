import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Ensure consistent chunk naming
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    // Generate source maps for better debugging
    sourcemap: false,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
}));
