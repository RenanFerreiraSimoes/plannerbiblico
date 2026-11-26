import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '365 Dias com Deus — Meu Planner Bíblico',
        short_name: '365 Dias',
        description: 'Uma jornada diária pela Palavra.',
        theme_color: '#f4d5cf',
        background_color: '#fbf7f2',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /\/biblia\/.*\.json$/,
            handler: 'CacheFirst',
            options: { cacheName: 'biblia', expiration: { maxEntries: 5 } },
          },
        ],
      },
    }),
  ],
})