/**
 * Security Features
 * Protocolo CDMX
 * 
 * Duress mode, auto-lock, panic wipe, and advanced security features
 */

import { 
  hashPassword, 
  verifyPassword, 
  sha256,
  generateSalt,
  type HashResult 
} from './crypto'
import { storage } from './storage'
import { db } from './db'
import { syncQueue } from './sync'

// =============================================================================
// TYPES
// =============================================================================

export interface SecurityConfig {
  autoLockTimeout: number  // minutes
  panicWipeDelay: number   // minutes
  duressEnabled: boolean
  encryptionEnabled: boolean
  metadataStrippingEnabled: boolean
  locationFuzzingEnabled: boolean
  locationFuzzingRadius: number  // meters
  maxFailedAttempts: number
  lockoutDuration: number  // minutes
}

export interface DuressState {
  active: boolean
  activatedAt: string | null
  fakeDataVisible: boolean
  hiddenAccessEnabled: boolean
}

export interface SecurityLog {
  id: string
  timestamp: string
  type: 'login' | 'logout' | 'duress' | 'lock' | 'unlock' | 'wipe' | 'failed_attempt'
  details: string
  pseudonym?: string
  ip?: string
}

export interface PanicWipeState {
  scheduled: boolean
  executeAt: string | null
  delayMinutes: number
}

export interface AutoLockState {
  locked: boolean
  lastActivity: number
  timeoutMs: number
}

export interface FailedAttempt {
  timestamp: number
  pseudonym: string
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_CONFIG: SecurityConfig = {
  autoLockTimeout: 5,
  panicWipeDelay: 10,
  duressEnabled: false,
  encryptionEnabled: true,
  metadataStrippingEnabled: true,
  locationFuzzingEnabled: true,
  locationFuzzingRadius: 500,
  maxFailedAttempts: 5,
  lockoutDuration: 30
}

const SECURITY_LOG_KEY = 'security_log'
const SECURITY_CONFIG_KEY = 'security_config'
const DURESS_PASSWORD_KEY = 'duress_password_hash'
const REAL_PASSWORD_HASH_KEY = 'real_password_hash'
const PANIC_WIPE_KEY = 'panic_wipe_state'
const AUTO_LOCK_KEY = 'auto_lock_state'
const FAILED_ATTEMPTS_KEY = 'failed_login_attempts'

// =============================================================================
// SECURITY MANAGER
// =============================================================================

class SecurityManager {
  private config: SecurityConfig = { ...DEFAULT_CONFIG }
  private duressState: DuressState = {
    active: false,
    activatedAt: null,
    fakeDataVisible: true,
    hiddenAccessEnabled: false
  }
  private autoLockTimer: number | null = null
  private panicWipeTimer: number | null = null
  private activityListeners: Set<() => void> = new Set()
  private lockListeners: Set<(locked: boolean) => void> = new Set()
  private duressListeners: Set<(active: boolean) => void> = new Set()
  private failedAttempts: FailedAttempt[] = []

  constructor() {
    this.loadConfig()
    this.loadFailedAttempts()
    this.setupActivityTracking()
  }

  // =============================================================================
  // CONFIGURATION
  // =============================================================================

  /**
   * Load security configuration
   */
  private loadConfig(): void {
    const stored = storage.local.get<SecurityConfig>(SECURITY_CONFIG_KEY)
    if (stored) {
      this.config = { ...DEFAULT_CONFIG, ...stored }
    }
  }

  /**
   * Save security configuration
   */
  private saveConfig(): void {
    storage.local.set(SECURITY_CONFIG_KEY, this.config)
  }

  /**
   * Get current configuration
   */
  getConfig(): SecurityConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...updates }
    this.saveConfig()

    // Apply changes
    if (updates.autoLockTimeout !== undefined) {
      this.resetAutoLockTimer()
    }
  }

  // =============================================================================
  // PASSWORD MANAGEMENT
  // =============================================================================

  /**
   * Set real password
   */
  async setRealPassword(password: string): Promise<void> {
    const hash = await hashPassword(password)
    storage.local.set(REAL_PASSWORD_HASH_KEY, hash)
  }

  /**
   * Set duress password
   */
  async setDuressPassword(password: string): Promise<void> {
    const hash = await hashPassword(password)
    storage.local.set(DURESS_PASSWORD_KEY, hash)
    this.config.duressEnabled = true
    this.saveConfig()
  }

  /**
   * Clear duress password
   */
  clearDuressPassword(): void {
    storage.local.remove(DURESS_PASSWORD_KEY)
    this.config.duressEnabled = false
    this.saveConfig()
  }

  /**
   * Verify password and check if it's duress
   */
  async verifyPassword(input: string): Promise<{ valid: boolean; isDuress: boolean }> {
    // Check if account is locked out
    if (this.isLockedOut()) {
      this.log('failed_attempt', 'Account locked due to too many failed attempts')
      throw new Error('Account locked. Try again later.')
    }

    // Check against real password
    const realHash = storage.local.get<HashResult>(REAL_PASSWORD_HASH_KEY)
    if (realHash) {
      const isRealValid = await verifyPassword(input, realHash)
      if (isRealValid) {
        this.recordSuccessfulLogin()
        return { valid: true, isDuress: false }
      }
    }

    // Check against duress password
    if (this.config.duressEnabled) {
      const duressHash = storage.local.get<HashResult>(DURESS_PASSWORD_KEY)
      if (duressHash) {
        const isDuressValid = await verifyPassword(input, duressHash)
        if (isDuressValid) {
          this.recordSuccessfulLogin()
          this.activateDuressMode()
          return { valid: true, isDuress: true }
        }
      }
    }

    // Failed attempt
    await this.recordFailedAttempt(input)
    return { valid: false, isDuress: false }
  }

  /**
   * Check if password is set
   */
  hasPassword(): boolean {
    return storage.local.has(REAL_PASSWORD_HASH_KEY)
  }

  /**
   * Check if duress password is set
   */
  hasDuressPassword(): boolean {
    return this.config.duressEnabled && storage.local.has(DURESS_PASSWORD_KEY)
  }

  // =============================================================================
  // DURESS MODE
  // =============================================================================

  /**
   * Activate duress mode
   */
  activateDuressMode(): void {
    this.duressState = {
      active: true,
      activatedAt: new Date().toISOString(),
      fakeDataVisible: true,
      hiddenAccessEnabled: false
    }

    // Hide real data
    this.hideRealData()

    // Log activation
    this.log('duress', 'Duress mode activated')

    // Notify listeners
    this.duressListeners.forEach(cb => cb(true))

    // Schedule automatic wipe after delay
    this.scheduleWipe(this.config.panicWipeDelay)
  }

  /**
   * Deactivate duress mode
   */
  deactivateDuressMode(): void {
    this.duressState = {
      active: false,
      activatedAt: null,
      fakeDataVisible: false,
      hiddenAccessEnabled: false
    }

    // Cancel any pending wipe
    this.cancelWipe()

    // Log deactivation
    this.log('duress', 'Duress mode deactivated')

    // Notify listeners
    this.duressListeners.forEach(cb => cb(false))
  }

  /**
   * Get duress state
   */
  getDuressState(): DuressState {
    return { ...this.duressState }
  }

  /**
   * Check if in duress mode
   */
  isDuressActive(): boolean {
    return this.duressState.active
  }

  /**
   * Enable hidden data access (special gesture)
   */
  enableHiddenAccess(): void {
    if (this.duressState.active) {
      this.duressState.hiddenAccessEnabled = true
      this.duressState.fakeDataVisible = false
      this.log('duress', 'Hidden data access enabled')
    }
  }

  /**
   * Disable hidden data access
   */
  disableHiddenAccess(): void {
    if (this.duressState.active) {
      this.duressState.hiddenAccessEnabled = false
      this.duressState.fakeDataVisible = true
      this.log('duress', 'Hidden data access disabled')
    }
  }

  /**
   * Hide real data (replace with fake data)
   */
  private hideRealData(): void {
    // Mark real data as hidden in session storage
    storage.session.set('duress_real_data_hidden', true)
    
    // Note: Actual data hiding is handled by the store and components
    // checking isDuressActive()
  }

  // =============================================================================
  // AUTO-LOCK
  // =============================================================================

  /**
   * Lock the application
   */
  lockApp(): void {
    const state = storage.session.get<AutoLockState>(AUTO_LOCK_KEY) || {
      locked: false,
      lastActivity: Date.now(),
      timeoutMs: this.config.autoLockTimeout * 60 * 1000
    }

    state.locked = true
    storage.session.set(AUTO_LOCK_KEY, state)

    this.log('lock', 'Application locked')
    this.lockListeners.forEach(cb => cb(true))
    
    // Clear activity timer
    if (this.autoLockTimer) {
      clearTimeout(this.autoLockTimer)
      this.autoLockTimer = null
    }
  }

  /**
   * Unlock the application
   */
  unlockApp(): void {
    const state = storage.session.get<AutoLockState>(AUTO_LOCK_KEY) || {
      locked: false,
      lastActivity: Date.now(),
      timeoutMs: this.config.autoLockTimeout * 60 * 1000
    }

    state.locked = false
    state.lastActivity = Date.now()
    storage.session.set(AUTO_LOCK_KEY, state)

    this.log('unlock', 'Application unlocked')
    this.lockListeners.forEach(cb => cb(false))
    
    // Reset timer
    this.resetAutoLockTimer()
  }

  /**
   * Check if app is locked
   */
  isLocked(): boolean {
    const state = storage.session.get<AutoLockState>(AUTO_LOCK_KEY)
    return state?.locked ?? false
  }

  /**
   * Set auto-lock timeout
   */
  setAutoLockTimeout(minutes: number): void {
    this.config.autoLockTimeout = minutes
    this.saveConfig()
    this.resetAutoLockTimer()
  }

  /**
   * Record activity to prevent auto-lock
   */
  recordActivity(): void {
    const state = storage.session.get<AutoLockState>(AUTO_LOCK_KEY) || {
      locked: false,
      lastActivity: Date.now(),
      timeoutMs: this.config.autoLockTimeout * 60 * 1000
    }

    state.lastActivity = Date.now()
    storage.session.set(AUTO_LOCK_KEY, state)
    
    this.activityListeners.forEach(cb => cb())
    
    if (!state.locked) {
      this.resetAutoLockTimer()
    }
  }

  /**
   * Reset auto-lock timer
   */
  private resetAutoLockTimer(): void {
    if (this.autoLockTimer) {
      clearTimeout(this.autoLockTimer)
    }

    const timeoutMs = this.config.autoLockTimeout * 60 * 1000
    
    if (timeoutMs > 0) {
      this.autoLockTimer = window.setTimeout(() => {
        if (!this.isLocked()) {
          this.lockApp()
        }
      }, timeoutMs)
    }
  }

  /**
   * Setup activity tracking
   */
  private setupActivityTracking(): void {
    // Track user activity
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll']
    
    events.forEach(event => {
      document.addEventListener(event, () => this.recordActivity(), true)
    })

    // Initial timer
    this.resetAutoLockTimer()
  }

  // =============================================================================
  // PANIC WIPE
  // =============================================================================

  /**
   * Schedule panic wipe
   */
  scheduleWipe(delayMinutes: number): void {
    // Clear existing timer
    this.cancelWipe()

    const state: PanicWipeState = {
      scheduled: true,
      executeAt: new Date(Date.now() + delayMinutes * 60 * 1000).toISOString(),
      delayMinutes
    }

    storage.session.set(PANIC_WIPE_KEY, state)

    // Set timer
    this.panicWipeTimer = window.setTimeout(() => {
      this.executeWipe()
    }, delayMinutes * 60 * 1000)

    this.log('wipe', `Panic wipe scheduled in ${delayMinutes} minutes`)
  }

  /**
   * Cancel scheduled wipe
   */
  cancelWipe(): boolean {
    if (this.panicWipeTimer) {
      clearTimeout(this.panicWipeTimer)
      this.panicWipeTimer = null

      const state: PanicWipeState = {
        scheduled: false,
        executeAt: null,
        delayMinutes: 0
      }
      storage.session.set(PANIC_WIPE_KEY, state)

      this.log('wipe', 'Panic wipe cancelled')
      return true
    }
    return false
  }

  /**
   * Check if wipe is scheduled
   */
  isWipeScheduled(): boolean {
    const state = storage.session.get<PanicWipeState>(PANIC_WIPE_KEY)
    return state?.scheduled ?? false
  }

  /**
   * Get wipe state
   */
  getWipeState(): PanicWipeState {
    return storage.session.get<PanicWipeState>(PANIC_WIPE_KEY) || {
      scheduled: false,
      executeAt: null,
      delayMinutes: 0
    }
  }

  /**
   * Execute panic wipe
   */
  async executeWipe(): Promise<void> {
    this.log('wipe', 'EXECUTING PANIC WIPE')

    try {
      // 1. Clear all sync queue
      syncQueue.clear()

      // 2. Clear sensitive stores from IndexedDB
      await Promise.all([
        db.clear('incidents'),
        db.clear('documentation'),
        db.clear('users'),
        db.clear('checklists')
      ])

      // 3. Clear storage
      storage.clearAll()

      // 4. Clear session
      storage.session.clear()

      // 5. Clear passwords
      storage.local.remove(REAL_PASSWORD_HASH_KEY)
      storage.local.remove(DURESS_PASSWORD_KEY)

      // 6. Clear security log
      storage.local.remove(SECURITY_LOG_KEY)

      // 7. Reset state
      this.duressState = {
        active: false,
        activatedAt: null,
        fakeDataVisible: false,
        hiddenAccessEnabled: false
      }

      this.log('wipe', 'Panic wipe completed successfully')

      // Force reload
      window.location.reload()
    } catch (error) {
      this.log('wipe', `Panic wipe failed: ${error}`)
      throw error
    }
  }

  // =============================================================================
  // METADATA STRIPPING
  // =============================================================================

  /**
   * Strip EXIF metadata from file
   */
  async stripExif(file: File): Promise<File> {
    if (!this.config.metadataStrippingEnabled) {
      return file
    }

    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Check if it's a JPEG
    const isJpeg = uint8Array[0] === 0xFF && uint8Array[1] === 0xD8
    
    if (!isJpeg) {
      // For non-JPEG files, just return as-is (metadata stripping
      // for other formats is more complex)
      return file
    }

    // Find EXIF segment (APP1 marker 0xFFE1)
    let offset = 2
    while (offset < uint8Array.length) {
      if (uint8Array[offset] !== 0xFF) break

      const marker = uint8Array[offset + 1]
      
      // Skip padding
      if (marker === 0xFF) {
        offset++
        continue
      }

      // Check for APP1 (EXIF)
      if (marker === 0xE1) {
        const length = (uint8Array[offset + 2] << 8) | uint8Array[offset + 3]
        // Remove EXIF segment by creating new array without it
        const before = uint8Array.slice(0, offset)
        const after = uint8Array.slice(offset + 2 + length)
        const cleaned = new Uint8Array(before.length + after.length)
        cleaned.set(before)
        cleaned.set(after, before.length)
        
        return new File([cleaned], file.name, { type: file.type })
      }

      // Skip other segments
      if (marker >= 0xE0 && marker <= 0xFE) {
        const length = (uint8Array[offset + 2] << 8) | uint8Array[offset + 3]
        offset += 2 + length
      } else if (marker === 0xD9) {
        // End of image
        break
      } else {
        offset += 2
      }
    }

    return file
  }

  /**
   * Fuzz location coordinates
   */
  fuzzLocation(lat: number, lng: number): { lat: number; lng: number } {
    if (!this.config.locationFuzzingEnabled) {
      return { lat, lng }
    }

    const radius = this.config.locationFuzzingRadius
    
    // Random offset within radius (approximate for lat/lng)
    // 111,320 meters per degree latitude at equator
    // 111,320 * cos(lat) meters per degree longitude
    const latOffset = (Math.random() - 0.5) * 2 * (radius / 111320)
    const lngOffset = (Math.random() - 0.5) * 2 * (radius / (111320 * Math.cos(lat * Math.PI / 180)))

    return {
      lat: lat + latOffset,
      lng: lng + lngOffset
    }
  }

  // =============================================================================
  // FAILED ATTEMPTS & LOCKOUT
  // =============================================================================

  /**
   * Record failed login attempt
   */
  private async recordFailedAttempt(pseudonym: string): Promise<void> {
    this.failedAttempts.push({
      timestamp: Date.now(),
      pseudonym: await sha256(pseudonym) // Hash pseudonym for privacy
    })

    // Keep only last hour of attempts
    const oneHourAgo = Date.now() - 60 * 60 * 1000
    this.failedAttempts = this.failedAttempts.filter(a => a.timestamp > oneHourAgo)

    this.saveFailedAttempts()

    // Log
    this.log('failed_attempt', `Failed login attempt for ${pseudonym}`)
  }

  /**
   * Record successful login
   */
  private recordSuccessfulLogin(): void {
    // Clear failed attempts
    this.failedAttempts = []
    this.saveFailedAttempts()
  }

  /**
   * Check if account is locked out
   */
  private isLockedOut(): boolean {
    const recentAttempts = this.failedAttempts.filter(
      a => a.timestamp > Date.now() - this.config.lockoutDuration * 60 * 1000
    )
    
    return recentAttempts.length >= this.config.maxFailedAttempts
  }

  /**
   * Load failed attempts
   */
  private loadFailedAttempts(): void {
    const stored = storage.session.get<FailedAttempt[]>(FAILED_ATTEMPTS_KEY)
    if (stored) {
      // Filter out old attempts
      const oneHourAgo = Date.now() - 60 * 60 * 1000
      this.failedAttempts = stored.filter(a => a.timestamp > oneHourAgo)
    }
  }

  /**
   * Save failed attempts
   */
  private saveFailedAttempts(): void {
    storage.session.set(FAILED_ATTEMPTS_KEY, this.failedAttempts)
  }

  // =============================================================================
  // SECURITY LOG
  // =============================================================================

  /**
   * Log security event
   */
  log(type: SecurityLog['type'], details: string, pseudonym?: string): void {
    const logs = this.getLogs()
    
    const log: SecurityLog = {
      id: generateSalt(8),
      timestamp: new Date().toISOString(),
      type,
      details,
      pseudonym,
      ip: undefined // IP logging would require server
    }

    logs.push(log)

    // Keep only last 1000 logs
    if (logs.length > 1000) {
      logs.shift()
    }

    storage.local.set(SECURITY_LOG_KEY, logs)
  }

  /**
   * Get security logs
   */
  getLogs(): SecurityLog[] {
    return storage.local.get<SecurityLog[]>(SECURITY_LOG_KEY) || []
  }

  /**
   * Clear security logs
   */
  clearLogs(): void {
    storage.local.remove(SECURITY_LOG_KEY)
  }

  /**
   * Export logs
   */
  exportLogs(): string {
    const logs = this.getLogs()
    return JSON.stringify(logs, null, 2)
  }

  // =============================================================================
  // SUBSCRIPTIONS
  // =============================================================================

  /**
   * Subscribe to lock events
   */
  onLock(callback: (locked: boolean) => void): () => void {
    this.lockListeners.add(callback)
    return () => this.lockListeners.delete(callback)
  }

  /**
   * Subscribe to duress events
   */
  onDuress(callback: (active: boolean) => void): () => void {
    this.duressListeners.add(callback)
    return () => this.duressListeners.delete(callback)
  }

  /**
   * Subscribe to activity events
   */
  onActivity(callback: () => void): () => void {
    this.activityListeners.add(callback)
    return () => this.activityListeners.delete(callback)
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const securityManager = new SecurityManager()

// Convenience exports
export const {
  getConfig,
  updateConfig,
  setRealPassword,
  setDuressPassword,
  clearDuressPassword,
  verifyPassword,
  hasPassword,
  hasDuressPassword,
  activateDuressMode,
  deactivateDuressMode,
  getDuressState,
  isDuressActive,
  enableHiddenAccess,
  disableHiddenAccess,
  lockApp,
  unlockApp,
  isLocked,
  setAutoLockTimeout,
  recordActivity,
  scheduleWipe,
  cancelWipe,
  isWipeScheduled,
  getWipeState,
  executeWipe,
  stripExif,
  fuzzLocation,
  log,
  getLogs,
  clearLogs,
  exportLogs,
  onLock,
  onDuress,
  onActivity
} = securityManager

export default securityManager
