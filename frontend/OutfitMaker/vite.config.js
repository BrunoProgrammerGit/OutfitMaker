import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      registerType: 'autoUpdate',
      // El manifest se sirve como archivo estático desde public/manifest.json.
      // No dejamos que el plugin lo genere ni lo inyecte al precache, para
      // poder invalidar versiones sin depender del ciclo de vida del SW.
      manifest: false,
      workbox: {
        // Precache de los assets estáticos generados en el build.
        // No incluye "json", así que public/manifest.json queda fuera del precache.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            // Llamadas al backend: prioriza red, cae a caché si no hay conexión.
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 1 día
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // sw.js y manifest.json: siempre desde red para permitir invalidar versiones.
            urlPattern: ({ url }) =>
              url.pathname.endsWith('/sw.js') ||
              url.pathname.endsWith('/manifest.json'),
            handler: 'NetworkOnly',
          },
          {
            // Assets estáticos: sirve desde caché, actualiza en segundo plano.
            urlPattern: ({ request }) =>
              ['style', 'script', 'worker', 'font', 'image'].includes(
                request.destination,
              ),
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
