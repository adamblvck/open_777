import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// gh-pages serves under /open_777/, Netlify + dev under /.
// Driven by env so one config serves both targets:
//   Netlify / dev → base '/'   ·   `DEPLOY_TARGET=ghpages vite build` → '/open_777/'
const base = process.env.DEPLOY_TARGET === 'ghpages' ? '/open_777/' : '/';

export default defineConfig({
  base,
  server: { port: 3000 },
  build: { outDir: 'dist' },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo192.png', 'logo512.jpg', 'robots.txt'],
      manifest: {
        name: 'Open 777',
        short_name: 'Open 777',
        description:
          "Reference, gematria & scrying workbench for Aleister Crowley's Liber 777 correspondences.",
        theme_color: '#0b0a0f',
        background_color: '#0b0a0f',
        display: 'standalone',
        icons: [
          { src: 'logo192.png', sizes: '192x192', type: 'image/png' },
          { src: 'logo512.jpg', sizes: '512x512', type: 'image/jpeg' },
        ],
      },
      workbox: {
        // Precache the hashed shell; content-hash keys make stale caches impossible.
        globPatterns: ['**/*.{js,css,html,woff2,woff,svg,png,jpg,jpeg,ico}'],
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
});
