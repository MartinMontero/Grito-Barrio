/**
 * Storage Utilities
 * Protocolo CDMX
 * 
 * Wrapper for localStorage, sessionStorage, and File System API
 * with error handling, quota checking, and serialization
 */

import { compress, decompress } from './compression'

// =============================================================================
// TYPES
// =============================================================================

export interface StorageOptions {
  compress?: boolean
  encrypt?: boolean
  ttl?: number // Time to live in milliseconds
  priority?: 'low' | 'normal' | 'high'
}

export interface StorageItem<T> {
  data: T
  timestamp: number
  ttl?: number
  compressed?: boolean
  encrypted?: boolean
  version: number
}

export interface StorageQuota {
  used: number
  available: number
  total: number
  percentage: number
}

export interface StorageStats {
  localStorage: StorageQuota
  sessionStorage: StorageQuota
  indexedDB?: StorageQuota
}

export type StorageType = 'localStorage' | 'sessionStorage'

// =============================================================================
// CONSTANTS
// =============================================================================

const STORAGE_VERSION = 1
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days
const MAX_LOCAL_STORAGE_SIZE = 5 * 1024 * 1024 // 5MB typical limit
const WARNING_THRESHOLD = 0.8 // 80% capacity

// =============================================================================
// LOCALSTORAGE WRAPPER
// =============================================================================

class LocalStorageWrapper {
  private prefix = 'protocolo_cdmx_'
  private version = STORAGE_VERSION

  /**
   * Get an item from localStorage
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const fullKey = this.prefix + key
      const item = localStorage.getItem(fullKey)
      
      if (!item) {
        return defaultValue
      }

      const parsed: StorageItem<T> = JSON.parse(item)

      // Check version
      if (parsed.version !== this.version) {
        console.warn(`[Storage] Version mismatch for key "${key}"`)
        this.remove(key)
        return defaultValue
      }

      // Check TTL
      if (parsed.ttl && Date.now() - parsed.timestamp > parsed.ttl) {
        this.remove(key)
        return defaultValue
      }

      // Decompress if needed
      let data = parsed.data
      if (parsed.compressed && typeof data === 'string') {
        data = decompress(data) as unknown as T
      }

      return data
    } catch (error) {
      console.error(`[Storage] Failed to get item "${key}":`, error)
      return defaultValue
    }
  }

  /**
   * Set an item in localStorage
   */
  set<T>(key: string, value: T, options: StorageOptions = {}): boolean {
    try {
      const fullKey = this.prefix + key

      // Check quota before saving
      if (!this.hasSpaceFor(key, value)) {
        // Try to free space by removing expired items
        this.removeExpired()
        
        if (!this.hasSpaceFor(key, value)) {
          throw new Error('Storage quota exceeded')
        }
      }

      let data: unknown = value
      let compressed = false

      // Compress if enabled and data is large
      if (options.compress) {
        const serialized = JSON.stringify(value)
        if (serialized.length > 1024) { // Only compress if > 1KB
          data = compress(serialized)
          compressed = true
        }
      }

      const item: StorageItem<unknown> = {
        data,
        timestamp: Date.now(),
        ttl: options.ttl || DEFAULT_TTL,
        compressed,
        version: this.version
      }

      localStorage.setItem(fullKey, JSON.stringify(item))
      return true
    } catch (error) {
      console.error(`[Storage] Failed to set item "${key}":`, error)
      return false
    }
  }

  /**
   * Remove an item from localStorage
   */
  remove(key: string): boolean {
    try {
      const fullKey = this.prefix + key
      localStorage.removeItem(fullKey)
      return true
    } catch (error) {
      console.error(`[Storage] Failed to remove item "${key}":`, error)
      return false
    }
  }

  /**
   * Check if an item exists
   */
  has(key: string): boolean {
    return this.getKeys().includes(key)
  }

  /**
   * Get all keys
   */
  getKeys(): string[] {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.prefix)) {
        keys.push(key.slice(this.prefix.length))
      }
    }
    return keys
  }

  /**
   * Get all items
   */
  getAll<T>(): Record<string, T> {
    const items: Record<string, T> = {}
    for (const key of this.getKeys()) {
      const value = this.get<T>(key)
      if (value !== undefined) {
        items[key] = value
      }
    }
    return items
  }

  /**
   * Clear all items with prefix
   */
  clear(): boolean {
    try {
      for (const key of this.getKeys()) {
        this.remove(key)
      }
      return true
    } catch (error) {
      console.error('[Storage] Failed to clear:', error)
      return false
    }
  }

  /**
   * Get storage size
   */
  getSize(): number {
    let size = 0
    for (const key of this.getKeys()) {
      const fullKey = this.prefix + key
      const item = localStorage.getItem(fullKey)
      if (item) {
        size += item.length * 2 // UTF-16 encoding
      }
    }
    return size
  }

  /**
   * Get storage quota info
   */
  getQuota(): StorageQuota {
    const used = this.getSize()
    const total = MAX_LOCAL_STORAGE_SIZE
    return {
      used,
      available: total - used,
      total,
      percentage: used / total
    }
  }

  /**
   * Check if there's space for an item
   */
  private hasSpaceFor<T>(key: string, value: T): boolean {
    const testItem: StorageItem<T> = {
      data: value,
      timestamp: Date.now(),
      version: this.version
    }
    const size = JSON.stringify(testItem).length * 2
    const quota = this.getQuota()
    return quota.available > size
  }

  /**
   * Remove expired items
   */
  private removeExpired(): number {
    let removed = 0
    for (const key of this.getKeys()) {
      const fullKey = this.prefix + key
      const item = localStorage.getItem(fullKey)
      if (item) {
        try {
          const parsed: StorageItem<unknown> = JSON.parse(item)
          if (parsed.ttl && Date.now() - parsed.timestamp > parsed.ttl) {
            this.remove(key)
            removed++
          }
        } catch {
          // Invalid item, remove it
          this.remove(key)
          removed++
        }
      }
    }
    return removed
  }

  /**
   * Watch for changes
   */
  watch<T>(key: string, callback: (newValue: T | undefined, oldValue: T | undefined) => void): () => void {
    const fullKey = this.prefix + key
    let lastValue = this.get<T>(key)

    const handleStorage = (event: StorageEvent) => {
      if (event.key === fullKey) {
        const newValue = this.get<T>(key)
        callback(newValue, lastValue)
        lastValue = newValue
      }
    }

    window.addEventListener('storage', handleStorage)
    
    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }
}

// =============================================================================
// SESSIONSTORAGE WRAPPER
// =============================================================================

class SessionStorageWrapper {
  private prefix = 'protocolo_session_'

  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const fullKey = this.prefix + key
      const item = sessionStorage.getItem(fullKey)
      
      if (!item) {
        return defaultValue
      }

      return JSON.parse(item)
    } catch (error) {
      console.error(`[SessionStorage] Failed to get "${key}":`, error)
      return defaultValue
    }
  }

  set<T>(key: string, value: T): boolean {
    try {
      const fullKey = this.prefix + key
      sessionStorage.setItem(fullKey, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`[SessionStorage] Failed to set "${key}":`, error)
      return false
    }
  }

  remove(key: string): boolean {
    try {
      const fullKey = this.prefix + key
      sessionStorage.removeItem(fullKey)
      return true
    } catch (error) {
      console.error(`[SessionStorage] Failed to remove "${key}":`, error)
      return false
    }
  }

  clear(): boolean {
    try {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i)
        if (key?.startsWith(this.prefix)) {
          sessionStorage.removeItem(key)
        }
      }
      return true
    } catch (error) {
      console.error('[SessionStorage] Failed to clear:', error)
      return false
    }
  }
}

// =============================================================================
// FILE SYSTEM API WRAPPER
// =============================================================================

class FileSystemWrapper {
  private directoryHandle: FileSystemDirectoryHandle | null = null

  /**
   * Check if File System Access API is supported
   */
  isSupported(): boolean {
    return 'showDirectoryPicker' in window
  }

  /**
   * Request directory access
   */
  async requestAccess(): Promise<boolean> {
    if (!this.isSupported()) {
      return false
    }

    try {
      this.directoryHandle = await (window as unknown as {
        showDirectoryPicker(): Promise<FileSystemDirectoryHandle>
      }).showDirectoryPicker()
      return true
    } catch (error) {
      console.error('[FileSystem] Access denied:', error)
      return false
    }
  }

  /**
   * Save a file
   */
  async saveFile(filename: string, content: Blob | string): Promise<boolean> {
    if (!this.directoryHandle) {
      console.error('[FileSystem] No directory access')
      return false
    }

    try {
      const fileHandle = await this.directoryHandle.getFileHandle(filename, { create: true })
      const writable = await fileHandle.createWritable()
      
      if (typeof content === 'string') {
        await writable.write(content)
      } else {
        await writable.write(content)
      }
      
      await writable.close()
      return true
    } catch (error) {
      console.error(`[FileSystem] Failed to save "${filename}":`, error)
      return false
    }
  }

  /**
   * Read a file
   */
  async readFile(filename: string): Promise<string | null> {
    if (!this.directoryHandle) {
      return null
    }

    try {
      const fileHandle = await this.directoryHandle.getFileHandle(filename)
      const file = await fileHandle.getFile()
      return await file.text()
    } catch (error) {
      console.error(`[FileSystem] Failed to read "${filename}":`, error)
      return null
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(filename: string): Promise<boolean> {
    if (!this.directoryHandle) {
      return false
    }

    try {
      await this.directoryHandle.removeEntry(filename)
      return true
    } catch (error) {
      console.error(`[FileSystem] Failed to delete "${filename}":`, error)
      return false
    }
  }

  /**
   * List all files
   */
  async listFiles(): Promise<string[]> {
    if (!this.directoryHandle) {
      return []
    }

    const files: string[] = []
    
    try {
      for await (const entry of (this.directoryHandle as any).values()) {
        if (entry.kind === 'file') {
          files.push(entry.name)
        }
      }
    } catch (error) {
      console.error('[FileSystem] Failed to list files:', error)
    }

    return files
  }
}

// =============================================================================
// MEMORY STORAGE (Fallback)
// =============================================================================

class MemoryStorage {
  private storage = new Map<string, unknown>()

  get<T>(key: string, defaultValue?: T): T | undefined {
    return (this.storage.get(key) as T) ?? defaultValue
  }

  set<T>(key: string, value: T): boolean {
    this.storage.set(key, value)
    return true
  }

  remove(key: string): boolean {
    this.storage.delete(key)
    return true
  }

  clear(): boolean {
    this.storage.clear()
    return true
  }

  getKeys(): string[] {
    return Array.from(this.storage.keys())
  }
}

// =============================================================================
// STORAGE MANAGER
// =============================================================================

class StorageManager {
  local: LocalStorageWrapper
  session: SessionStorageWrapper
  fileSystem: FileSystemWrapper
  memory: MemoryStorage

  private encryptionKey: string | null = null

  constructor() {
    this.local = new LocalStorageWrapper()
    this.session = new SessionStorageWrapper()
    this.fileSystem = new FileSystemWrapper()
    this.memory = new MemoryStorage()
  }

  /**
   * Set encryption key
   */
  setEncryptionKey(key: string): void {
    this.encryptionKey = key
  }

  /**
   * Get storage stats
   */
  getStats(): StorageStats {
    return {
      localStorage: this.local.getQuota(),
      sessionStorage: {
        used: 0,
        available: MAX_LOCAL_STORAGE_SIZE,
        total: MAX_LOCAL_STORAGE_SIZE,
        percentage: 0
      }
    }
  }

  /**
   * Check if storage is available
   */
  isAvailable(type: StorageType = 'localStorage'): boolean {
    try {
      const storage = type === 'localStorage' ? localStorage : sessionStorage
      const test = '__storage_test__'
      storage.setItem(test, test)
      storage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  /**
   * Clear all storage
   */
  async clearAll(): Promise<void> {
    this.local.clear()
    this.session.clear()
    this.memory.clear()
  }

  /**
   * Export all data
   */
  async exportAll(): Promise<{
    localStorage: Record<string, unknown>
    sessionStorage: Record<string, unknown>
    timestamp: string
  }> {
    return {
      localStorage: this.local.getAll(),
      sessionStorage: {}, // Session storage is temporary
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Import data
   */
  async importAll(data: {
    localStorage: Record<string, unknown>
    sessionStorage?: Record<string, unknown>
  }): Promise<boolean> {
    try {
      // Clear existing data
      this.clearAll()

      // Import localStorage
      for (const [key, value] of Object.entries(data.localStorage)) {
        this.local.set(key, value)
      }

      return true
    } catch (error) {
      console.error('[Storage] Import failed:', error)
      return false
    }
  }
}

// =============================================================================
// LEGACY COMPATIBILITY FUNCTIONS (for store-helpers.ts)
// =============================================================================

const storeDataCache = new Map<string, unknown>()

/**
 * Store data (legacy API for store-helpers.ts)
 * Uses IndexedDB if available, falls back to localStorage
 */
export async function storeData<T>(
  key: string,
  data: T,
  encrypt: boolean = false
): Promise<boolean> {
  try {
    // Try IndexedDB first
    const { db } = await import('./db')
    await db.init()
    
    const result = await db.put('settings' as any, {
      key,
      data: encrypt ? JSON.stringify(data) : data,
      encrypted: encrypt,
      timestamp: Date.now()
    })
    
    if (result.success) {
      return true
    }
  } catch (error) {
    console.warn('[storeData] IndexedDB failed, falling back to localStorage:', error)
  }
  
  // Fallback to localStorage
  try {
    storage.local.set(key, data)
    storeDataCache.set(key, data)
    return true
  } catch (error) {
    console.error('[storeData] Failed to store data:', error)
    return false
  }
}

/**
 * Get data (legacy API for store-helpers.ts)
 */
export async function getData<T>(
  key: string,
  decrypt: boolean = false
): Promise<T | null> {
  // Check cache first
  const cached = storeDataCache.get(key)
  if (cached !== undefined) {
    return cached as T
  }
  
  try {
    // Try IndexedDB first
    const { db } = await import('./db')
    await db.init()
    
    const result = await db.get<{
      key: string
      data: T | string
      encrypted: boolean
      timestamp: number
    }>('settings' as any, key)
    
    if (result.success && result.data) {
      const { data } = result.data
      
      if (decrypt && typeof data === 'string') {
        try {
          return JSON.parse(data) as T
        } catch {
          return data as unknown as T
        }
      }
      
      return data as T
    }
  } catch (error) {
    console.warn('[getData] IndexedDB failed, falling back to localStorage:', error)
  }
  
  // Fallback to localStorage
  try {
    const data = storage.local.get<T>(key)
    if (data !== undefined) {
      storeDataCache.set(key, data)
      return data
    }
  } catch (error) {
    console.error('[getData] Failed to get data:', error)
  }
  
  return null
}

// =============================================================================
// EXPORTS
// =============================================================================

export const storage = new StorageManager()

// Individual wrappers for direct access
export { LocalStorageWrapper, SessionStorageWrapper, FileSystemWrapper, MemoryStorage }

// Utility functions
export function getStorageType(): 'localStorage' | 'sessionStorage' | 'memory' {
  if (storage.isAvailable('localStorage')) {
    return 'localStorage'
  }
  if (storage.isAvailable('sessionStorage')) {
    return 'sessionStorage'
  }
  return 'memory'
}

export function estimateSize(data: unknown): number {
  return JSON.stringify(data).length * 2
}

export default storage
