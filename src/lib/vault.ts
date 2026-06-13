/**
 * Vault — Key Management & Session Unlock
 * Grito & Barrio
 *
 * Implements a passphrase-protected key vault with the following properties:
 *
 *  - A random 256-bit Data Encryption Key (DEK) encrypts all sensitive data.
 *  - The DEK is wrapped (encrypted) with a Key Encryption Key (KEK) that is
 *    derived from the user's passphrase via PBKDF2 (600k iterations, SHA-256).
 *  - Only the *wrapped* DEK, the salt and the KDF parameters are persisted to
 *    localStorage. The passphrase and the unwrapped DEK are NEVER persisted —
 *    the DEK lives only in memory for the duration of an unlocked session.
 *  - Changing the passphrase only re-wraps the DEK; data never needs to be
 *    re-encrypted.
 *  - Multiple key "slots" are supported. Slot 0 is the real vault; any
 *    additional slot is a duress vault that unlocks a *decoy* DEK. The on-disk
 *    format carries no "duress" label, so the mere presence of the vault does
 *    not reveal that a duress passphrase exists (plausible deniability).
 *
 * If no vault has been created the app runs in an "uninitialized" state where
 * data is stored unencrypted. The UI is responsible for clearly disclosing
 * this and for encouraging the user to set a passphrase.
 */

import {
  generateSalt,
  generateIV,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  isCryptoSupported,
  CRYPTO_CONSTANTS
} from './crypto'

const VAULT_STORAGE_KEY = 'gb_vault_v1'

export type VaultState = 'uninitialized' | 'locked' | 'unlocked'

interface VaultSlot {
  salt: string // base64
  iv: string // base64
  wrapped: string // base64 (DEK wrapped under the KEK)
}

interface VaultRecord {
  version: number
  kdf: { name: 'PBKDF2'; hash: 'SHA-256'; iterations: number }
  slots: VaultSlot[]
}

export interface UnlockResult {
  success: boolean
  /** True when the unlock used a duress slot (decoy vault). */
  duress: boolean
}

// =============================================================================
// IN-MEMORY SESSION STATE (never persisted)
// =============================================================================

let memoryDek: CryptoKey | null = null
let duressActive = false
const unlockListeners = new Set<(unlocked: boolean) => void>()

// =============================================================================
// PERSISTED VAULT RECORD
// =============================================================================

function readVault(): VaultRecord | null {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as VaultRecord
    if (!parsed || !Array.isArray(parsed.slots) || parsed.slots.length === 0) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeVault(record: VaultRecord): void {
  localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(record))
}

// =============================================================================
// KEY DERIVATION / WRAPPING
// =============================================================================

async function deriveKek(passphrase: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as ArrayBuffer,
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['wrapKey', 'unwrapKey']
  )
}

async function generateDek(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
}

async function wrapDek(dek: CryptoKey, kek: CryptoKey): Promise<{ iv: Uint8Array; wrapped: ArrayBuffer }> {
  const iv = generateIV()
  const wrapped = await crypto.subtle.wrapKey('raw', dek, kek, {
    name: 'AES-GCM',
    iv: iv as unknown as ArrayBuffer
  })
  return { iv, wrapped }
}

async function unwrapDek(slot: VaultSlot, kek: CryptoKey): Promise<CryptoKey> {
  return crypto.subtle.unwrapKey(
    'raw',
    base64ToArrayBuffer(slot.wrapped),
    kek,
    { name: 'AES-GCM', iv: new Uint8Array(base64ToArrayBuffer(slot.iv)) },
    { name: 'AES-GCM', length: 256 },
    // Extractable so the DEK can be re-wrapped when the passphrase changes.
    true,
    ['encrypt', 'decrypt']
  )
}

async function buildSlot(passphrase: string, dek: CryptoKey, iterations: number): Promise<VaultSlot> {
  const salt = generateSalt()
  const kek = await deriveKek(passphrase, salt, iterations)
  const { iv, wrapped } = await wrapDek(dek, kek)
  return {
    salt: arrayBufferToBase64(salt as unknown as ArrayBuffer),
    iv: arrayBufferToBase64(iv as unknown as ArrayBuffer),
    wrapped: arrayBufferToBase64(wrapped)
  }
}

// =============================================================================
// PUBLIC API
// =============================================================================

export function isVaultInitialized(): boolean {
  return readVault() !== null
}

export function isUnlocked(): boolean {
  return memoryDek !== null
}

export function isDuressActive(): boolean {
  return duressActive
}

export function getVaultState(): VaultState {
  if (!isVaultInitialized()) return 'uninitialized'
  return isUnlocked() ? 'unlocked' : 'locked'
}

/** Returns the in-memory Data Encryption Key, or null when locked/uninitialized. */
export function getDataKey(): CryptoKey | null {
  return memoryDek
}

/**
 * Create a brand-new vault protected by `passphrase`. Generates a fresh DEK,
 * unlocks the session, and persists the wrapped key. Throws if a vault already
 * exists (use `changePassphrase` instead).
 */
export async function createVault(passphrase: string): Promise<void> {
  if (!isCryptoSupported()) {
    throw new Error('Web Crypto API no disponible; no se puede crear la bóveda segura.')
  }
  if (isVaultInitialized()) {
    throw new Error('La bóveda ya existe.')
  }
  if (!passphrase || passphrase.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres.')
  }

  const iterations = CRYPTO_CONSTANTS.ITERATIONS
  const dek = await generateDek()
  const slot = await buildSlot(passphrase, dek, iterations)

  writeVault({
    version: 1,
    kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations },
    slots: [slot]
  })

  memoryDek = dek
  duressActive = false
  notifyUnlock(true)
}

/**
 * Add (or replace) a duress passphrase. The duress slot unlocks a *separate*
 * decoy DEK, so duress-mode data is genuinely isolated from the real vault.
 */
export async function setDuressPassphrase(duressPassphrase: string): Promise<void> {
  const record = readVault()
  if (!record) throw new Error('Crea primero la bóveda principal.')
  if (!duressPassphrase || duressPassphrase.length < 8) {
    throw new Error('La contraseña de coerción debe tener al menos 8 caracteres.')
  }

  // The decoy vault gets its own independent DEK.
  const decoyDek = await generateDek()
  const slot = await buildSlot(duressPassphrase, decoyDek, record.kdf.iterations)

  // Slot 0 stays the real vault; the duress slot is appended.
  record.slots = [record.slots[0], slot]
  writeVault(record)
}

export function hasDuressSlot(): boolean {
  const record = readVault()
  return !!record && record.slots.length > 1
}

export function removeDuressSlot(): void {
  const record = readVault()
  if (!record || record.slots.length <= 1) return
  record.slots = [record.slots[0]]
  writeVault(record)
}

/**
 * Attempt to unlock the vault with `passphrase`. Tries every slot; slot 0 is
 * the real vault, any later slot is a duress vault. The unwrapped DEK is held
 * in memory for the session.
 */
export async function unlock(passphrase: string): Promise<UnlockResult> {
  const record = readVault()
  if (!record) return { success: false, duress: false }

  for (let i = 0; i < record.slots.length; i++) {
    const slot = record.slots[i]
    try {
      const kek = await deriveKek(passphrase, new Uint8Array(base64ToArrayBuffer(slot.salt)), record.kdf.iterations)
      const dek = await unwrapDek(slot, kek)
      memoryDek = dek
      duressActive = i > 0
      notifyUnlock(true)
      return { success: true, duress: duressActive }
    } catch {
      // GCM tag mismatch => wrong passphrase for this slot; try the next.
    }
  }
  return { success: false, duress: false }
}

/** Lock the session: drop the in-memory key. Persisted (wrapped) data is untouched. */
export function lock(): void {
  memoryDek = null
  duressActive = false
  notifyUnlock(false)
}

/**
 * Change the real passphrase. Requires the current passphrase to unwrap the
 * existing DEK so the same key is preserved (no data re-encryption needed).
 */
export async function changePassphrase(currentPassphrase: string, newPassphrase: string): Promise<void> {
  const record = readVault()
  if (!record) throw new Error('No existe ninguna bóveda.')
  if (!newPassphrase || newPassphrase.length < 8) {
    throw new Error('La nueva contraseña debe tener al menos 8 caracteres.')
  }

  const kek = await deriveKek(
    currentPassphrase,
    new Uint8Array(base64ToArrayBuffer(record.slots[0].salt)),
    record.kdf.iterations
  )
  let dek: CryptoKey
  try {
    dek = await unwrapDek(record.slots[0], kek)
  } catch {
    throw new Error('Contraseña actual incorrecta.')
  }

  const newSlot = await buildSlot(newPassphrase, dek, record.kdf.iterations)
  record.slots[0] = newSlot
  writeVault(record)
  memoryDek = dek
}

/** Permanently destroy the vault record (used by panic wipe). */
export function destroyVault(): void {
  localStorage.removeItem(VAULT_STORAGE_KEY)
  lock()
}

// =============================================================================
// SUBSCRIPTIONS
// =============================================================================

export function onUnlockChange(cb: (unlocked: boolean) => void): () => void {
  unlockListeners.add(cb)
  return () => unlockListeners.delete(cb)
}

function notifyUnlock(unlocked: boolean): void {
  unlockListeners.forEach((cb) => {
    try {
      cb(unlocked)
    } catch {
      /* listener errors must not break unlock */
    }
  })
}

export default {
  getVaultState,
  isVaultInitialized,
  isUnlocked,
  isDuressActive,
  getDataKey,
  createVault,
  setDuressPassphrase,
  hasDuressSlot,
  removeDuressSlot,
  unlock,
  lock,
  changePassphrase,
  destroyVault,
  onUnlockChange
}
