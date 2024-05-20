import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/foo": "https://superb-kataifi-8ae845.netlify.app",
      "/steam": {
        target: "https://store.steampowered.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/steam/, ""),
      },
    },
  },
});
