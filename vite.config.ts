import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// Configuración de Vite: React + alias "@/" + PWA instalable.
// El plugin VitePWA genera manifest.webmanifest y un Service Worker
// con Workbox que cachea los assets para que la app funcione offline.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['escudo.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Stats SB · M15 TLTC',
        short_name: 'Stats SB',
        description: 'Stats personales de rugby de Santiago Benito · Medio · M15 · Tucumán Lawn Tennis Club',
        lang: 'es-AR',
        theme_color: '#1B3A6B',
        background_color: '#1B3A6B',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        categories: ['sports', 'health', 'fitness'],
      },
      workbox: {
        // Cachear todos los assets del bundle
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Cuando una request va a navigation y no está cacheada, devolver el index.html
        // (necesario para que las rutas client-side funcionen offline)
        navigateFallback: '/index.html',
        // Limitar tamaño de cache (ahora la base es ~830kb por Recharts)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      devOptions: {
        // En modo dev no registramos el SW para no interferir con HMR
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});
