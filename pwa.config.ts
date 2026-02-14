// ============================================================================
// Vite PWA Configuration
// Protocolo CDMX
// 
// This configuration generates a Progressive Web App with:
// - Service Worker for offline functionality
// - Web App Manifest for installability
// - Automatic icon generation
// - Caching strategies for optimal performance
// ============================================================================

import { VitePWA } from 'vite-plugin-pwa'

export const pwaConfig = {
  registerType: 'autoUpdate',
  
  // Inject the service worker registration script
  injectRegister: 'auto',
  
  // Workbox configuration
  workbox: {
    // Cache strategies
    globPatterns: [
      '**/*.{js,css,html,ico,png,svg,json,woff,woff2}',
    ],
    
    // Maximum file size to cache (5MB)
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    
    // Runtime caching strategies
    runtimeCaching: [
      // Cache Google Fonts
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      // Cache font files
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'gstatic-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      // Cache API calls
      {
        urlPattern: /\/api\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24, // 24 hours
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
          networkTimeoutSeconds: 10,
        },
      },
      // Cache images
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'images-cache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
    ],
    
    // Skip waiting for service worker activation
    skipWaiting: true,
    
    // Claim clients immediately
    clientsClaim: true,
    
    // Cleanup outdated caches
    cleanupOutdatedCaches: true,
    
    // Don't precache source maps
    sourcemap: false,
    
    // Navigation fallback for SPA
    navigateFallback: 'index.html',
    
    // Don't use navigate fallback for API routes
    navigateFallbackDenylist: [/^\/api/, /^\/__/, /\/[^/?]+\.[^/]+$/],
  },
  
  // Manifest configuration
  manifest: {
    name: 'Protocolo CDMX',
    short_name: 'Protocolo',
    description: 'Aplicación de respuesta a emergencias comunitarias en CDMX',
    
    theme_color: '#dc2626',
    background_color: '#ffffff',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
    
    orientation: 'portrait-primary',
    scope: '/',
    start_url: '/',
    id: '/',
    
    lang: 'es-MX',
    dir: 'ltr',
    
    // Icons configuration
    icons: [
      {
        src: 'icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      // Maskable icons for adaptive shapes
      {
        src: 'icons/maskable-icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: 'icons/maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    
    // Screenshots for install prompt
    screenshots: [
      {
        src: 'screenshots/mobile-home.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Pantalla principal de Protocolo CDMX',
      },
      {
        src: 'screenshots/mobile-emergency.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Respuesta de emergencia',
      },
      {
        src: 'screenshots/desktop-home.png',
        sizes: '1280x800',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Vista de escritorio de Protocolo CDMX',
      },
    ],
    
    // App shortcuts
    shortcuts: [
      {
        name: 'Nueva Emergencia',
        short_name: 'Emergencia',
        description: 'Reportar una emergencia rápidamente',
        url: '/emergency',
        icons: [{ src: 'icons/shortcut-emergency-96x96.png', sizes: '96x96' }],
      },
      {
        name: 'Protocolos',
        short_name: 'Protocolos',
        description: 'Ver protocolos de respuesta',
        url: '/protocols',
        icons: [{ src: 'icons/shortcut-protocols-96x96.png', sizes: '96x96' }],
      },
      {
        name: 'Recursos',
        short_name: 'Recursos',
        description: 'Acceder a recursos y contactos',
        url: '/resources',
        icons: [{ src: 'icons/shortcut-resources-96x96.png', sizes: '96x96' }],
      },
    ],
    
    // Related applications
    related_applications: [],
    prefer_related_applications: false,
    
    // Categories for app stores
    categories: ['utilities', 'social', 'productivity'],
    
    // Edge-side panel support
    edge_side_panel: {
      preferred_width: 400,
    },
    
    // Handle links
    handle_links: 'preferred',
    
    // Launch handler
    launch_handler: {
      client_mode: ['navigate-existing', 'auto'],
    },
    
    // Share target
    share_target: {
      action: '/share-target',
      method: 'POST',
      enctype: 'multipart/form-data',
      params: {
        title: 'title',
        text: 'text',
        url: 'url',
        files: [
          {
            name: 'media',
            accept: ['image/*', 'video/*'],
          },
        ],
      },
    },
    
    // Protocol handlers
    protocol_handlers: [
      {
        protocol: 'web+protocolocdmx',
        url: '/handle-protocol?data=%s',
      },
    ],
  },
  
  // Dev options
  devOptions: {
    enabled: true,
    type: 'module',
    navigateFallback: 'index.html',
  },
  
  // Include assets (for icon generation)
  includeAssets: [
    'favicon.ico',
    'apple-touch-icon.png',
    'masked-icon.svg',
    'robots.txt',
    'sitemap.xml',
  ],
}

// Export the PWA plugin
export const pwaPlugin = () => VitePWA(pwaConfig)

export default pwaPlugin
