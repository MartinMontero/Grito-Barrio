// ============================================================================
// Service Worker Registration
// Protocolo CDMX
// 
// This file registers the service worker and handles:
// - PWA installation prompts
// - Service worker updates
// - Offline/online state detection
// - Push notifications (future)
// ============================================================================

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Wait for window load to ensure registration doesn't impact initial page load
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration)

          // Handle service worker updates
          handleServiceWorkerUpdate(registration)

          // Handle installation prompt
          handleInstallPrompt()

          // Monitor online/offline status
          monitorNetworkStatus()
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error)
        })
    })
  } else {
    console.log('⚠️ Service Workers not supported in this browser')
  }
}

// Handle service worker updates
function handleServiceWorkerUpdate(registration: ServiceWorkerRegistration) {
  // Check for updates every 1 hour
  setInterval(() => {
    registration.update()
  }, 60 * 60 * 1000)

  // Listen for updates
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing

    if (newWorker) {
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          showUpdateNotification()
        }
      })
    }
  })

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      window.location.reload()
    }
  })
}

// Show update notification
function showUpdateNotification() {
  // Create custom notification or use toast
  if (confirm('🔄 Nueva versión disponible. ¿Actualizar ahora?')) {
    // Send message to service worker to skip waiting
    navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' })
  }
}

// Handle PWA install prompt
function handleInstallPrompt() {
  let deferredPrompt: any

  // Store the install prompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault()
    // Store the event so it can be triggered later
    deferredPrompt = e

    // Show custom install button or notification
    showInstallPromotion()
  })

  // Handle successful installation
  window.addEventListener('appinstalled', () => {
    console.log('🎉 PWA installed successfully')
    deferredPrompt = null
    hideInstallPromotion()
  })
}

// Show install promotion
function showInstallPromotion() {
  // Create or show install button
  const installButton = document.createElement('button')
  installButton.id = 'pwa-install-button'
  installButton.textContent = '📱 Instalar App'
  installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 24px;
    background: #dc2626;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    z-index: 9999;
    font-weight: bold;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `

  installButton.addEventListener('click', async () => {
    const deferredPrompt = (window as any).deferredPrompt
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`)
    }
  })

  document.body.appendChild(installButton)
}

// Hide install promotion
function hideInstallPromotion() {
  const installButton = document.getElementById('pwa-install-button')
  if (installButton) {
    installButton.remove()
  }
}

// Monitor network status
function monitorNetworkStatus() {
  const updateOnlineStatus = () => {
    const isOnline = navigator.onLine
    console.log(`Network status: ${isOnline ? 'online' : 'offline'}`)

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent('networkStatusChange', {
        detail: { isOnline },
      })
    )

    // Show offline indicator
    if (!isOnline) {
      showOfflineIndicator()
    } else {
      hideOfflineIndicator()
    }
  }

  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)

  // Initial check
  updateOnlineStatus()
}

// Show offline indicator
function showOfflineIndicator() {
  let indicator = document.getElementById('offline-indicator')

  if (!indicator) {
    indicator = document.createElement('div')
    indicator.id = 'offline-indicator'
    indicator.innerHTML = '⚠️ Sin conexión - Trabajando offline'
    indicator.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #f59e0b;
      color: white;
      text-align: center;
      padding: 8px;
      z-index: 10000;
      font-weight: bold;
    `
    document.body.appendChild(indicator)
  }
}

// Hide offline indicator
function hideOfflineIndicator() {
  const indicator = document.getElementById('offline-indicator')
  if (indicator) {
    indicator.remove()
  }
}

// Check if app is installed
export function isAppInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true
}

// Get installation status
export function getInstallStatus(): 'installed' | 'not-installed' | 'unsupported' {
  if (!('serviceWorker' in navigator)) {
    return 'unsupported'
  }
  return isAppInstalled() ? 'installed' : 'not-installed'
}

// Request persistent storage
export async function requestPersistentStorage(): Promise<boolean> {
  if (navigator.storage && navigator.storage.persist) {
    const isPersistent = await navigator.storage.persist()
    console.log(`Persistent storage: ${isPersistent ? 'granted' : 'denied'}`)
    return isPersistent
  }
  return false
}

// Get storage usage
export async function getStorageUsage(): Promise<{ usage: number; quota: number }> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
    }
  }
  return { usage: 0, quota: 0 }
}

// Background sync registration (for future use)
export async function registerBackgroundSync(tag: string): Promise<boolean> {
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register(tag)
      console.log(`✅ Background sync registered: ${tag}`)
      return true
    } catch (error) {
      console.error('❌ Background sync registration failed:', error)
      return false
    }
  }
  return false
}

// Register periodic sync (for future use)
export async function registerPeriodicSync(tag: string, minInterval: number): Promise<boolean> {
  if ('serviceWorker' in navigator && 'periodicSync' in ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready
      const periodicSync = (registration as any).periodicSync

      // Check permission
      const status = await navigator.permissions.query({
        name: 'periodic-background-sync' as PermissionName,
      })

      if (status.state === 'granted') {
        await periodicSync.register(tag, { minInterval })
        console.log(`✅ Periodic sync registered: ${tag}`)
        return true
      }
    } catch (error) {
      console.error('❌ Periodic sync registration failed:', error)
    }
  }
  return false
}

// Initialize PWA features
export function initializePWA() {
  // Register service worker
  registerServiceWorker()

  // Request persistent storage for critical data
  requestPersistentStorage()

  // Log PWA status
  console.log('📱 PWA Status:', getInstallStatus())
}

export default {
  registerServiceWorker,
  isAppInstalled,
  getInstallStatus,
  requestPersistentStorage,
  getStorageUsage,
  registerBackgroundSync,
  registerPeriodicSync,
  initializePWA,
}
