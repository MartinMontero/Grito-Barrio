/**
 * Encryption Utilities
 * Grito & Barrio
 *
 * High-level encryption facade built entirely on the Web Crypto API.
 *
 * Two modes:
 *  1. AT-REST (no password argument): data is encrypted with the in-memory
 *     vault Data Encryption Key (DEK). This is fast (no per-call KDF) and the
 *     key never touches disk. If the vault is locked / uninitialised these
 *     functions THROW — they never silently fall back to plaintext.
 *  2. PORTABLE (password argument): data is encrypted with a key derived from
 *     the supplied password via PBKDF2. Used for exports/backups that must be
 *     decryptable on another device.
 *
 * There are deliberately NO Math.random fallbacks and NO crypto-js fallback:
 * if the Web Crypto API is unavailable we refuse to operate rather than
 * downgrade to insecure cryptography.
 */

import {
  encryptToString,
  decryptFromString,
  encryptStringWithKey,
  decryptStringWithKey,
  hashPassword,
  verifyPassword,
  sha256,
  generateSecureId,
  constantTimeCompare,
  isCryptoSupported,
  type HashResult,
} from "./crypto";
import { getDataKey, isVaultInitialized } from "./vault";

function requireCrypto(): void {
  if (!isCryptoSupported()) {
    throw new Error(
      "Web Crypto API no disponible: el cifrado seguro no es posible en este navegador.",
    );
  }
}

/**
 * Resolve the at-rest key, or throw with a clear, actionable error.
 */
function requireDataKey(): CryptoKey {
  const key = getDataKey();
  if (!key) {
    throw new Error(
      isVaultInitialized()
        ? "La bóveda está bloqueada: desbloquéala con tu contraseña para cifrar/descifrar."
        : "No hay bóveda configurada: define una contraseña para activar el cifrado.",
    );
  }
  return key;
}

// =============================================================================
// CORE ENCRYPT / DECRYPT
// =============================================================================

/**
 * Encrypt a string. With `password` → portable (PBKDF2). Without → at-rest (DEK).
 */
export async function encryptData(
  data: string,
  password?: string,
): Promise<string> {
  requireCrypto();
  if (password) {
    return encryptToString(data, password);
  }
  return encryptStringWithKey(data, requireDataKey());
}

/**
 * Decrypt a string. Throws on wrong key/password or tampering (no fallback).
 */
export async function decryptData(
  encryptedData: string,
  password?: string,
): Promise<string> {
  requireCrypto();
  if (password) {
    return decryptFromString(encryptedData, password);
  }
  return decryptStringWithKey(encryptedData, requireDataKey());
}

export async function encryptObject<T extends object>(
  obj: T,
  password?: string,
): Promise<string> {
  return encryptData(JSON.stringify(obj), password);
}

export async function decryptObject<T extends object>(
  encryptedData: string,
  password?: string,
): Promise<T | null> {
  try {
    return JSON.parse(await decryptData(encryptedData, password)) as T;
  } catch (error) {
    console.error("Error decrypting object:", error);
    return null;
  }
}

// =============================================================================
// HASHING
// =============================================================================

export async function hashData(data: string): Promise<string> {
  requireCrypto();
  return sha256(data);
}

export async function verifyHash(data: string, hash: string): Promise<boolean> {
  const computed = await hashData(data);
  return constantTimeCompare(computed, hash);
}

export async function hashPasswordForStorage(
  password: string,
): Promise<HashResult> {
  return hashPassword(password);
}

export async function verifyPasswordAgainstHash(
  password: string,
  storedHash: HashResult,
): Promise<boolean> {
  return verifyPassword(password, storedHash);
}

// =============================================================================
// IDS
// =============================================================================

export function generateSecureRandomId(): string {
  requireCrypto();
  return generateSecureId(16);
}

// =============================================================================
// EXPORTS
// =============================================================================

export type { HashResult } from "./crypto";

export default {
  encryptData,
  decryptData,
  encryptObject,
  decryptObject,
  hashData,
  verifyHash,
  hashPasswordForStorage,
  verifyPasswordAgainstHash,
  generateSecureRandomId,
};
