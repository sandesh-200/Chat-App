import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // This exposes the server to the local network
    host: true,
    // Optional: Specify a port if you don't want the default 5173
    port: 5173,
  },
});
