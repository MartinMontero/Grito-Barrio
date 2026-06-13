/**
 * Cryptographic Utilities
 * Protocolo CDMX
 * 
 * Military-grade encryption using Web Crypto API
 * AES-256-GCM for symmetric encryption
 * PBKDF2 for key derivation
 * SHA-256 for hashing
 */

// =============================================================================
// CONSTANTS
// =============================================================================

export const CRYPTO_CONSTANTS = {
  ALGORITHM: 'AES-GCM' as const,
  KEY_LENGTH: 256 as const,
  // OWASP 2023+ guidance for PBKDF2-HMAC-SHA256.
  ITERATIONS: 600000,
  SALT_LENGTH: 32,
  IV_LENGTH: 12,
  TAG_LENGTH: 128,
  HASH_ALGORITHM: 'SHA-256' as const,
  KEY_DERIVATION_ALGORITHM: 'PBKDF2' as const
}

// =============================================================================
// TYPES
// =============================================================================

export interface EncryptedData {
  ciphertext: ArrayBuffer
  iv: Uint8Array
  salt: Uint8Array
  tagLength: number
  algorithm: string
  version: number
}

export interface EncryptedBlob {
  data: Blob
  metadata: {
    algorithm: string
    salt: string  // base64
    iv: string    // base64
    timestamp: string
    version: number
  }
}

export interface KeyPair {
  key: CryptoKey
  salt: Uint8Array
}

export interface HashResult {
  hash: string
  salt: string
  iterations: number
  algorithm: string
}

// =============================================================================
// KEY GENERATION AND DERIVATION
// =============================================================================

/**
 * Generate a cryptographically secure random salt
 */
export function generateSalt(length: number = CRYPTO_CONSTANTS.SALT_LENGTH): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length))
}

/**
 * Generate a random initialization vector (IV)
 */
export function generateIV(length: number = CRYPTO_CONSTANTS.IV_LENGTH): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length))
}

/**
 * Derive an AES key from a password using PBKDF2
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array = generateSalt()
): Promise<KeyPair> {
  // Encode password
  const encoder = new TextEncoder()
  const passwordData = encoder.encode(password)

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    { name: CRYPTO_CONSTANTS.KEY_DERIVATION_ALGORITHM },
    false,
    ['deriveBits', 'deriveKey']
  )

  // Derive AES key using PBKDF2
  const key = await crypto.subtle.deriveKey(
    {
      name: CRYPTO_CONSTANTS.KEY_DERIVATION_ALGORITHM,
      salt: salt as any,
      iterations: CRYPTO_CONSTANTS.ITERATIONS,
      hash: CRYPTO_CONSTANTS.HASH_ALGORITHM
    },
    keyMaterial,
    {
      name: CRYPTO_CONSTANTS.ALGORITHM,
      length: CRYPTO_CONSTANTS.KEY_LENGTH
    },
    false,
    ['encrypt', 'decrypt']
  )

  return { key, salt }
}

/**
 * Derive key from password with existing salt
 */
export async function deriveKeyWithSalt(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordData = encoder.encode(password)

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    { name: CRYPTO_CONSTANTS.KEY_DERIVATION_ALGORITHM },
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: CRYPTO_CONSTANTS.KEY_DERIVATION_ALGORITHM,
      salt: salt as any,
      iterations: CRYPTO_CONSTANTS.ITERATIONS,
      hash: CRYPTO_CONSTANTS.HASH_ALGORITHM
    },
    keyMaterial,
    {
      name: CRYPTO_CONSTANTS.ALGORITHM,
      length: CRYPTO_CONSTANTS.KEY_LENGTH
    },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Generate a secure random encryption key
 */
export async function generateSecureKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: CRYPTO_CONSTANTS.ALGORITHM,
      length: CRYPTO_CONSTANTS.KEY_LENGTH
    },
    true,
    ['encrypt', 'decrypt']
  )
}

/**
 * Export key to raw bytes (for secure storage)
 */
export async function exportKey(key: CryptoKey): Promise<ArrayBuffer> {
  return crypto.subtle.exportKey('raw', key)
}

/**
 * Import key from raw bytes
 */
export async function importKey(keyData: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: CRYPTO_CONSTANTS.ALGORITHM,
      length: CRYPTO_CONSTANTS.KEY_LENGTH
    },
    false,
    ['encrypt', 'decrypt']
  )
}

// =============================================================================
// ENCRYPTION AND DECRYPTION
// =============================================================================

/**
 * Encrypt data with password
 */
export async function encrypt(
  data: string | ArrayBuffer | object,
  password: string
): Promise<EncryptedData> {
  // Convert data to ArrayBuffer
  let dataBuffer: ArrayBuffer
  
  if (typeof data === 'string') {
    dataBuffer = new TextEncoder().encode(data) as any
  } else if (data instanceof ArrayBuffer) {
    dataBuffer = data
  } else {
    dataBuffer = new TextEncoder().encode(JSON.stringify(data)) as any
  }

  // Derive key
  const { key, salt } = await deriveKeyFromPassword(password)
  
  // Generate IV
  const iv = generateIV()

  // Encrypt
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: CRYPTO_CONSTANTS.ALGORITHM,
      iv: iv as any,
      tagLength: CRYPTO_CONSTANTS.TAG_LENGTH
    },
    key,
    dataBuffer
  )

  return {
    ciphertext,
    iv,
    salt,
    tagLength: CRYPTO_CONSTANTS.TAG_LENGTH,
    algorithm: CRYPTO_CONSTANTS.ALGORITHM,
    version: 1
  }
}

/**
 * Decrypt data with password
 */
export async function decrypt(
  encryptedData: EncryptedData,
  password: string
): Promise<ArrayBuffer> {
  // Derive key with stored salt
  const key = await deriveKeyWithSalt(password, encryptedData.salt)

  // Decrypt
  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: encryptedData.algorithm || CRYPTO_CONSTANTS.ALGORITHM,
        iv: encryptedData.iv as any,
        tagLength: encryptedData.tagLength || CRYPTO_CONSTANTS.TAG_LENGTH
      },
      key,
      encryptedData.ciphertext
    )

    return decrypted
  } catch (error) {
    throw new Error('Decryption failed: Invalid password or corrupted data')
  }
}

/**
 * Encrypt to string (for storage)
 */
export async function encryptToString(
  data: string | object,
  password: string
): Promise<string> {
  const encrypted = await encrypt(data, password)
  
  // Combine into compact format
  const combined = new Uint8Array(
    encrypted.salt.length + 
    encrypted.iv.length + 
    encrypted.ciphertext.byteLength
  )
  
  combined.set(encrypted.salt, 0)
  combined.set(encrypted.iv, encrypted.salt.length)
  combined.set(new Uint8Array(encrypted.ciphertext), encrypted.salt.length + encrypted.iv.length)
  
  return arrayBufferToBase64(combined as any)
}

/**
 * Decrypt from string
 */
export async function decryptFromString(
  encryptedString: string,
  password: string
): Promise<string> {
  const combined = base64ToArrayBuffer(encryptedString)
  
  const saltLength = CRYPTO_CONSTANTS.SALT_LENGTH
  const ivLength = CRYPTO_CONSTANTS.IV_LENGTH
  
  const salt = combined.slice(0, saltLength)
  const iv = combined.slice(saltLength, saltLength + ivLength)
  const ciphertext = combined.slice(saltLength + ivLength)
  
  const encryptedData: EncryptedData = {
    ciphertext,
    iv: new Uint8Array(iv),
    salt: new Uint8Array(salt),
    tagLength: CRYPTO_CONSTANTS.TAG_LENGTH,
    algorithm: CRYPTO_CONSTANTS.ALGORITHM,
    version: 1
  }
  
  const decrypted = await decrypt(encryptedData, password)
  return new TextDecoder().decode(decrypted)
}

// =============================================================================
// SYMMETRIC ENCRYPTION WITH A CryptoKey (no per-call KDF)
// =============================================================================
//
// These are used for at-rest data protected by the in-memory vault key (DEK).
// The DEK is already a strong 256-bit random key, so no PBKDF2 is needed per
// message — only a fresh random IV. Output format is base64(iv || ciphertext).

/**
 * Encrypt a string with an existing AES-GCM CryptoKey.
 */
export async function encryptStringWithKey(plaintext: string, key: CryptoKey): Promise<string> {
  const iv = generateIV()
  const ciphertext = await crypto.subtle.encrypt(
    { name: CRYPTO_CONSTANTS.ALGORITHM, iv: iv as any, tagLength: CRYPTO_CONSTANTS.TAG_LENGTH },
    key,
    new TextEncoder().encode(plaintext) as any
  )
  const combined = new Uint8Array(iv.length + ciphertext.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ciphertext), iv.length)
  return arrayBufferToBase64(combined.buffer)
}

/**
 * Decrypt a string previously produced by `encryptStringWithKey`.
 * Throws if the key is wrong or the data was tampered with (GCM tag mismatch).
 */
export async function decryptStringWithKey(payload: string, key: CryptoKey): Promise<string> {
  const combined = new Uint8Array(base64ToArrayBuffer(payload))
  const iv = combined.slice(0, CRYPTO_CONSTANTS.IV_LENGTH)
  const ciphertext = combined.slice(CRYPTO_CONSTANTS.IV_LENGTH)
  const decrypted = await crypto.subtle.decrypt(
    { name: CRYPTO_CONSTANTS.ALGORITHM, iv: iv as any, tagLength: CRYPTO_CONSTANTS.TAG_LENGTH },
    key,
    ciphertext as any
  )
  return new TextDecoder().decode(decrypted)
}

// =============================================================================
// HASHING
// =============================================================================

/**
 * Calculate SHA-256 hash
 */
export async function sha256(data: string | ArrayBuffer): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = typeof data === 'string' ? encoder.encode(data) : data
  
  const hashBuffer = await crypto.subtle.digest(CRYPTO_CONSTANTS.HASH_ALGORITHM, dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Calculate HMAC
 */
export async function hmac(
  data: string | ArrayBuffer,
  key: CryptoKey | string
): Promise<string> {
  let cryptoKey: CryptoKey
  
  if (typeof key === 'string') {
    const encoder = new TextEncoder()
    cryptoKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(key),
      { name: 'HMAC', hash: CRYPTO_CONSTANTS.HASH_ALGORITHM },
      false,
      ['sign']
    )
  } else {
    cryptoKey = key
  }

  const encoder = new TextEncoder()
  const dataBuffer = typeof data === 'string' ? encoder.encode(data) : data
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer)
  const signatureArray = Array.from(new Uint8Array(signature))
  
  return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Hash password with salt (for storage)
 */
export async function hashPassword(
  password: string,
  salt?: string
): Promise<HashResult> {
  const usedSalt = salt || arrayBufferToBase64(generateSalt(16) as any)
  const encoder = new TextEncoder()
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: CRYPTO_CONSTANTS.KEY_DERIVATION_ALGORITHM },
    false,
    ['deriveBits']
  )

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: CRYPTO_CONSTANTS.KEY_DERIVATION_ALGORITHM,
      salt: base64ToArrayBuffer(usedSalt),
      iterations: CRYPTO_CONSTANTS.ITERATIONS,
      hash: CRYPTO_CONSTANTS.HASH_ALGORITHM
    },
    keyMaterial,
    CRYPTO_CONSTANTS.KEY_LENGTH
  )

  const hashArray = Array.from(new Uint8Array(hashBuffer))
  
  return {
    hash: hashArray.map(b => b.toString(16).padStart(2, '0')).join(''),
    salt: usedSalt,
    iterations: CRYPTO_CONSTANTS.ITERATIONS,
    algorithm: CRYPTO_CONSTANTS.KEY_DERIVATION_ALGORITHM
  }
}

/**
 * Verify password against stored hash
 */
export async function verifyPassword(
  password: string,
  storedHash: HashResult
): Promise<boolean> {
  const computed = await hashPassword(password, storedHash.salt)
  // Constant-time comparison to avoid leaking how many leading characters
  // matched via response timing.
  return constantTimeCompare(computed.hash, storedHash.hash)
}

// =============================================================================
// FILE ENCRYPTION
// =============================================================================

/**
 * Encrypt a file
 */
export async function encryptFile(
  file: File,
  password: string,
  onProgress?: (progress: number) => void
): Promise<EncryptedBlob> {
  // Read file as array buffer
  const arrayBuffer = await file.arrayBuffer()

  // Report progress
  onProgress?.(0.1)

  // Derive key. A fresh salt + IV is generated for every file, so no
  // (key, nonce) pair is ever reused — a hard requirement for AES-GCM.
  const { key, salt } = await deriveKeyFromPassword(password)
  const iv = generateIV()

  onProgress?.(0.3)

  // Single-shot AES-GCM over the whole file. This produces one ciphertext
  // with a single authentication tag, which `decryptFile` can verify in one
  // operation. (The previous chunked variant reused one IV across chunks —
  // catastrophic nonce reuse — and could not be decrypted as a whole.)
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: CRYPTO_CONSTANTS.ALGORITHM,
      iv: iv as any,
      tagLength: CRYPTO_CONSTANTS.TAG_LENGTH
    },
    key,
    arrayBuffer
  )
  const combined = new Uint8Array(ciphertext)

  onProgress?.(0.9)

  // Create metadata
  const metadata = {
    algorithm: CRYPTO_CONSTANTS.ALGORITHM,
    salt: arrayBufferToBase64(salt as any),
    iv: arrayBufferToBase64(iv as any),
    timestamp: new Date().toISOString(),
    version: 1
  }

  const blob = new Blob([combined], { type: 'application/encrypted' })
  
  onProgress?.(1.0)

  return { data: blob, metadata }
}

/**
 * Decrypt a file
 */
export async function decryptFile(
  encryptedBlob: EncryptedBlob,
  password: string,
  originalFilename?: string,
  onProgress?: (progress: number) => void
): Promise<File> {
  onProgress?.(0.1)

  // Read encrypted data
  const arrayBuffer = await encryptedBlob.data.arrayBuffer()
  
  // Derive key
  const salt = base64ToArrayBuffer(encryptedBlob.metadata.salt)
  const key = await deriveKeyWithSalt(password, salt as any)
  const iv = base64ToArrayBuffer(encryptedBlob.metadata.iv)
  
  onProgress?.(0.3)

  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    {
      name: encryptedBlob.metadata.algorithm,
      iv: new Uint8Array(iv),
      tagLength: CRYPTO_CONSTANTS.TAG_LENGTH
    },
    key,
    arrayBuffer
  )

  onProgress?.(0.9)

  // Create file
  const blob = new Blob([decrypted])
  const filename = originalFilename || `decrypted_${Date.now()}`
  
  onProgress?.(1.0)

  return new File([blob], filename, { type: 'application/octet-stream' })
}

// =============================================================================
// SECURE STORAGE
// =============================================================================

let storedKey: CryptoKey | null = null
let keyExpiry: number | null = null
const KEY_LIFETIME = 30 * 60 * 1000 // 30 minutes

/**
 * Store encryption key in memory (secure session storage)
 */
export async function storeKeySecurely(key: CryptoKey): Promise<void> {
  storedKey = key
  keyExpiry = Date.now() + KEY_LIFETIME
}

/**
 * Retrieve stored key if valid
 */
export function retrieveKey(): CryptoKey | null {
  if (!storedKey || !keyExpiry || Date.now() > keyExpiry) {
    storedKey = null
    keyExpiry = null
    return null
  }
  
  // Extend key lifetime on access
  keyExpiry = Date.now() + KEY_LIFETIME
  return storedKey
}

/**
 * Clear stored key
 */
export function clearStoredKey(): void {
  storedKey = null
  keyExpiry = null
}

/**
 * Check if key is stored and valid
 */
export function hasValidKey(): boolean {
  return retrieveKey() !== null
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Convert ArrayBuffer to Base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Convert Base64 string to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * Generate a secure random ID
 */
export function generateSecureId(length: number = 32): string {
  const array = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Constant-time string comparison (to prevent timing attacks)
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}

/**
 * Check if Web Crypto API is available
 */
export function isCryptoSupported(): boolean {
  return typeof crypto !== 'undefined' && 
         typeof crypto.subtle !== 'undefined' &&
         typeof crypto.getRandomValues !== 'undefined'
}

/**
 * Generate encryption key from components
 */
export async function generateKey(password: string, salt?: Uint8Array): Promise<KeyPair> {
  return deriveKeyFromPassword(password, salt)
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  // Key generation
  generateSalt,
  generateIV,
  deriveKeyFromPassword,
  deriveKeyWithSalt,
  generateSecureKey,
  exportKey,
  importKey,
  generateKey,
  
  // Encryption
  encrypt,
  decrypt,
  encryptToString,
  decryptFromString,
  encryptStringWithKey,
  decryptStringWithKey,
  
  // Hashing
  sha256,
  hmac,
  hashPassword,
  verifyPassword,
  
  // Files
  encryptFile,
  decryptFile,
  
  // Storage
  storeKeySecurely,
  retrieveKey,
  clearStoredKey,
  hasValidKey,
  
  // Utilities
  arrayBufferToBase64,
  base64ToArrayBuffer,
  generateSecureId,
  constantTimeCompare,
  isCryptoSupported,
  
  // Constants
  CRYPTO_CONSTANTS
}
