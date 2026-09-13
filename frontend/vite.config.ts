import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      // App-shell precache + image runtime cache (low-bandwidth friendly).
      // API responses are never cached — learning and payment data stays live.
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "sparch-images",
              expiration: { maxEntries: 120, maxAgeSeconds: 7 * 24 * 3600 },
            },
          },
        ],
      },
      manifest: {
        name: "Sparch Deutsch Rwanda",
        short_name: "Sparch",
        description: "German language e-learning for A1 to B2 levels.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#4cbc9a",
        icons: [
          { src: "logo.png", sizes: "any", type: "image/png", purpose: "any" },
        ],
      },
    }),
  ],
});
