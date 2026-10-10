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
      // New deploys take over at once; UpdateNotice registers the worker and asks open
      // tabs to reload, and lazyPage() recovers if an old code file is already gone.
      registerType: "autoUpdate",
      injectRegister: false,
      // App-shell precache + image runtime cache (low-bandwidth friendly).
      // API responses are never cached — learning and payment data stays live.
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) => request.destination === "image" && !url.pathname.startsWith("/api/"),
            handler: "CacheFirst",
            options: {
              cacheName: "sparch-images",
              expiration: { maxEntries: 120, maxAgeSeconds: 7 * 24 * 3600 },
            },
          },
        ],
      },
      manifest: {
        name: "Deutsch Sprache RW",
        short_name: "Sprache RW",
        description: "German language e-learning for A1 to B2 levels.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#b60e1c",
        icons: [
          { src: "logo.png", sizes: "any", type: "image/png", purpose: "any" },
        ],
      },
    }),
  ],
});
