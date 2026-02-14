/**
 * Store Helper Utilities
 * Protocolo CDMX
 * 
 * Middleware for persistence, encryption, and shared store functionality
 */

import { generateSecureId, encryptObject, decryptObject } from '@/lib/encryption'
import { storeData, getData } from '@/lib/storage'
import type { StateCreator, StoreApi } from 'zustand'

/**
 * Middleware for persisting store state to IndexedDB
 */
export function persistToIndexedDB<T extends object>(
  storeName: string,
  encrypt: boolean = true
) {
  return (config: StateCreator<T>) => {
    return (
      set: StoreApi<T>['setState'],
      get: StoreApi<T>['getState'],
      api: StoreApi<T>
    ) => {
      // Load persisted state on initialization
      const loadPersistedState = async () => {
        try {
          const persisted = await getData<Partial<T>>(storeName, encrypt)
          if (persisted) {
            set(persisted as T, false)
          }
        } catch (error) {
          console.error(`Error loading ${storeName} from storage:`, error)
        }
      }

      // Load persisted state
      loadPersistedState()

      // Wrap set to persist changes
      const originalSet = set
      const persistSet: typeof set = (partial, replace) => {
        originalSet(partial, replace)
        
        // Persist to IndexedDB
        const state = get()
        storeData(storeName, state, encrypt).catch(error => {
          console.error(`Error persisting ${storeName}:`, error)
        })
      }

      return config(persistSet, get, api)
    }
  }
}

/**
 * Middleware for persisting to localStorage (non-sensitive data)
 */
export function persistToLocalStorage<T extends object>(storeName: string) {
  return (config: StateCreator<T>) => {
    return (
      set: StoreApi<T>['setState'],
      get: StoreApi<T>['getState'],
      api: StoreApi<T>
    ) => {
      // Load persisted state on initialization
      const loadPersistedState = () => {
        try {
          const persisted = localStorage.getItem(storeName)
          if (persisted) {
            const parsed = JSON.parse(persisted)
            set(parsed as T, false)
          }
        } catch (error) {
          console.error(`Error loading ${storeName} from localStorage:`, error)
        }
      }

      // Load persisted state
      loadPersistedState()

      // Wrap set to persist changes
      const originalSet = set
      const persistSet: typeof set = (partial, replace) => {
        originalSet(partial, replace)
        
        // Persist to localStorage
        const state = get()
        try {
          localStorage.setItem(storeName, JSON.stringify(state))
        } catch (error) {
          console.error(`Error persisting ${storeName} to localStorage:`, error)
        }
      }

      return config(persistSet, get, api)
    }
  }
}

/**
 * Generate incident ID with format: CDMX-YYYY-MM-DD-HHMM-###
 */
export function generateIncidentId(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  
  return `CDMX-${year}-${month}-${day}-${hours}${minutes}-${random}`
}

/**
 * Generate SHA-256 hash for documentation
 */
export async function generateSHA256(data: string | ArrayBuffer): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = typeof data === 'string' ? encoder.encode(data) : data
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Get current ISO timestamp
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString()
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Type-safe partial update helper
 */
export function updateInArray<T extends { id: string }>(
  array: T[],
  id: string,
  updates: Partial<T>
): T[] {
  return array.map(item =>
    item.id === id ? { ...item, ...updates } : item
  )
}

/**
 * Remove item from array by ID
 */
export function removeFromArray<T extends { id: string }>(
  array: T[],
  id: string
): T[] {
  return array.filter(item => item.id !== id)
}

/**
 * Find item in array by ID
 */
export function findById<T extends { id: string }>(
  array: T[],
  id: string
): T | undefined {
  return array.find(item => item.id === id)
}

/**
 * Validate incident ID format
 */
export function isValidIncidentId(id: string): boolean {
  const pattern = /^CDMX-\d{4}-\d{2}-\d{2}-\d{4}-\d{3}$/
  return pattern.test(id)
}

/**
 * Encrypt sensitive data if encryption is enabled
 */
export function encryptIfEnabled<T>(data: T, encryptionEnabled: boolean): string {
  if (encryptionEnabled) {
    return encryptObject(data as object)
  }
  return JSON.stringify(data)
}

/**
 * Decrypt data if it was encrypted
 */
export function decryptIfNeeded<T>(data: string, encryptionEnabled: boolean): T | null {
  if (encryptionEnabled) {
    return decryptObject<T>(data)
  }
  try {
    return JSON.parse(data) as T
  } catch {
    return null
  }
}

/**
 * Calculate checklist progress percentage
 */
export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

/**
 * Debounce function for store updates
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
