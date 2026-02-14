/**
 * Encryption Utilities
 * Protocolo CDMX
 * 
 * High-level encryption API using Web Crypto API
 * Provides backward compatibility with legacy crypto-js functions
 */

import {
  encryptToString,
  decryptFromString,
  hashPassword,
  verifyPassword,
  sha256,
  generateSecureId,
  isCryptoSupported,
  type HashResult
} from './crypto'

const STORAGE_KEY = 'protocolo_cdmx_encryption_key'
const DURESS_KEY = 'protocolo_cdmx_duress_key'

// =============================================================================
// LEGACY COMPATIBILITY (Crypto-JS based)
// Maintained for backward compatibility
// =============================================================================

let legacyCryptoJS: typeof import('crypto-js') | null = null

async function getCryptoJS() {
  if (!legacyCryptoJS) {
    legacyCryptoJS = await import('crypto-js')
  }
  return legacyCryptoJS
}

/**
 * Generate or retrieve encryption key (legacy)
 * @deprecated Use Web Crypto API functions instead
 */
export function getEncryptionKey(): string {
  let key = localStorage.getItem(STORAGE_KEY)
  if (!key) {
    // Generate using Web Crypto if available
    if (isCryptoSupported()) {
      const array = crypto.getRandomValues(new Uint8Array(32))
      key = Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
    } else {
      // Fallback to Math.random (less secure, only for unsupported browsers)
      key = Array.from({ length: 32 }, () => 
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
      ).join('')
    }
    localStorage.setItem(STORAGE_KEY, key)
  }
  return key
}

/**
 * Encrypt data using Web Crypto API (preferred)
 */
export async function encryptData(data: string, password?: string): Promise<string> {
  if (!isCryptoSupported()) {
    // Fallback to legacy crypto-js
    const CryptoJS = await getCryptoJS()
    const key = password || getEncryptionKey()
    return CryptoJS.AES.encrypt(data, key).toString()
  }
  
  return encryptToString(data, password || getEncryptionKey())
}

/**
 * Decrypt data using Web Crypto API (preferred)
 */
export async function decryptData(encryptedData: string, password?: string): Promise<string> {
  if (!isCryptoSupported()) {
    // Fallback to legacy crypto-js
    const CryptoJS = await getCryptoJS()
    const key = password || getEncryptionKey()
    const bytes = CryptoJS.AES.decrypt(encryptedData, key)
    return bytes.toString(CryptoJS.enc.Utf8)
  }
  
  try {
    return await decryptFromString(encryptedData, password || getEncryptionKey())
  } catch (error) {
    // Try legacy decryption if Web Crypto fails
    try {
      const CryptoJS = await getCryptoJS()
      const key = password || getEncryptionKey()
      const bytes = CryptoJS.AES.decrypt(encryptedData, key)
      return bytes.toString(CryptoJS.enc.Utf8)
    } catch {
      throw error
    }
  }
}

/**
 * Encrypt object using Web Crypto API
 */
export async function encryptObject<T extends object>(
  obj: T, 
  password?: string
): Promise<string> {
  return encryptData(JSON.stringify(obj), password)
}

/**
 * Decrypt object using Web Crypto API
 */
export async function decryptObject<T extends object>(
  encryptedData: string,
  password?: string
): Promise<T | null> {
  try {
    const decrypted = await decryptData(encryptedData, password)
    return JSON.parse(decrypted) as T
  } catch (error) {
    console.error('Error decrypting object:', error)
    return null
  }
}

/**
 * Hash data using SHA-256
 */
export async function hashData(data: string): Promise<string> {
  if (!isCryptoSupported()) {
    const CryptoJS = await getCryptoJS()
    return CryptoJS.SHA256(data).toString()
  }
  
  return sha256(data)
}

/**
 * Verify hash using SHA-256
 */
export async function verifyHash(data: string, hash: string): Promise<boolean> {
  const computed = await hashData(data)
  return computed === hash
}

/**
 * Hash password with salt for storage
 */
export async function hashPasswordForStorage(password: string): Promise<HashResult> {
  return hashPassword(password)
}

/**
 * Verify password against stored hash
 */
export async function verifyPasswordAgainstHash(
  password: string, 
  storedHash: HashResult
): Promise<boolean> {
  return verifyPassword(password, storedHash)
}

/**
 * Generate secure random ID
 */
export function generateSecureRandomId(): string {
  if (isCryptoSupported()) {
    return generateSecureId(16)
  }
  
  // Fallback
  return Array.from({ length: 16 }, () => 
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('')
}

/**
 * Check if data is encrypted (best-effort detection)
 */
export async function isEncrypted(data: string): Promise<boolean> {
  try {
    await decryptData(data)
    return true
  } catch {
    return false
  }
}

/**
 * Clear encryption key (for logout/reset)
 */
export function clearEncryptionKey(): void {
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(STORAGE_KEY)
}

/**
 * Set duress password
 */
export function setDuressPassword(duressPassword: string): void {
  localStorage.setItem(DURESS_KEY, duressPassword)
}

/**
 * Get duress password
 */
export function getDuressPassword(): string | null {
  return localStorage.getItem(DURESS_KEY)
}

/**
 * Clear duress password
 */
export function clearDuressPassword(): void {
  localStorage.removeItem(DURESS_KEY)
}

/**
 * Re-encrypt with new key (key rotation)
 * @deprecated Key rotation should be done through SecurityManager
 */
export async function rotateEncryptionKey(): Promise<boolean> {
  try {
    const oldKey = getEncryptionKey()
    
    // Generate new key
    localStorage.removeItem(STORAGE_KEY)
    const newKey = getEncryptionKey()
    
    // Note: In production, you'd need to re-encrypt all stored data here
    // This is a simplified version
    console.log('Encryption key rotated')
    console.log('Old key prefix:', oldKey.substring(0, 8))
    console.log('New key prefix:', newKey.substring(0, 8))
    
    return true
  } catch (error) {
    console.error('Error rotating encryption key:', error)
    return false
  }
}

/**
 * Generate salt for password hashing
 */
export function generateSalt(length: number = 16): string {
  if (isCryptoSupported()) {
    const array = crypto.getRandomValues(new Uint8Array(length))
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
  }
  
  // Fallback
  return Array.from({ length }, () => 
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('')
}

// =============================================================================
// EXPORTS
// =============================================================================

export type { HashResult } from './crypto'

export default {
  getEncryptionKey,
  encryptData,
  decryptData,
  encryptObject,
  decryptObject,
  hashData,
  verifyHash,
  hashPasswordForStorage,
  verifyPasswordAgainstHash,
  generateSecureRandomId,
  isEncrypted,
  clearEncryptionKey,
  setDuressPassword,
  getDuressPassword,
  clearDuressPassword,
  rotateEncryptionKey,
  generateSalt
}
