import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './globals.css'

// Service worker is registered automatically by vite-plugin-pwa (registerType: 'autoUpdate')

// Prevent zoom on double tap (mobile)
let lastTouchEnd = 0
document.addEventListener('touchend', (event) => {
  const now = Date.now()
  if (now - lastTouchEnd <= 300) {
    event.preventDefault()
  }
  lastTouchEnd = now
}, false)

// Prevent pull-to-refresh on mobile
let touchStartY = 0
document.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY
}, { passive: true })

document.addEventListener('touchmove', (e) => {
  const touchY = e.touches[0].clientY
  const scrollTop = document.documentElement.scrollTop
  
  // Prevent pull-to-refresh when at top of page
  if (scrollTop === 0 && touchY > touchStartY) {
    e.preventDefault()
  }
}, { passive: false })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
