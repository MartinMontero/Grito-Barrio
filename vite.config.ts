import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Protocolo CDMX',
        short_name: 'Protocolo CDMX',
        description: 'Herramienta de respuesta comunitaria para apoyo en desalojos ilegales en la Ciudad de México',
        theme_color: '#dc2626',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/protocolo-cdmx/',
        start_url: '/protocolo-cdmx/',
        orientation: 'portrait',
        icons: [
          {
            src: '/protocolo-cdmx/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/protocolo-cdmx/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/protocolo-cdmx/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/protocolo-cdmx/',
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
