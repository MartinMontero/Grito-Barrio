/**
 * Crypto unit tests — exercise the REAL Web Crypto implementation in src/lib.
 *
 * (The previous version of this file mocked crypto.subtle and asserted on the
 * mocks; it could not catch any regression. These tests run the actual code.)
 */

import { describe, it, expect } from 'vitest'
import {
  encrypt,
  decrypt,
  encryptToString,
  decryptFromString,
  encryptStringWithKey,
  decryptStringWithKey,
  generateSecureKey,
  deriveKeyFromPassword,
  deriveKeyWithSalt,
  hashPassword,
  verifyPassword,
  sha256,
  constantTimeCompare,
  generateSalt,
  generateIV,
  encryptFile,
  decryptFile,
  CRYPTO_CONSTANTS,
} from '@/lib/crypto'
import { compress, decompress } from '@/lib/compression'

describe('crypto: AES-GCM (password-based)', () => {
  it('round-trips strings including multibyte/emoji', async () => {
    const msg = 'Desalojo en la colonia — café ñ 🌮 1234'
    const enc = await encryptToString(msg, 'correct horse battery')
    expect(enc).not.toContain(msg)
    expect(await decryptFromString(enc, 'correct horse battery')).toBe(msg)
  })

  it('fails to decrypt with the wrong password (auth tag)', async () => {
    const enc = await encryptToString('secret incident notes', 'right-password')
    await expect(decryptFromString(enc, 'wrong-password')).rejects.toBeTruthy()
  })

  it('produces different ciphertext each time (random IV + salt)', async () => {
    const a = await encryptToString('same plaintext', 'pw-123456')
    const b = await encryptToString('same plaintext', 'pw-123456')
    expect(a).not.toBe(b)
  })

  it('encrypt() returns distinct salt and 12-byte IV', async () => {
    const out = await encrypt('hello', 'pw-123456')
    expect(out.iv.length).toBe(CRYPTO_CONSTANTS.IV_LENGTH)
    expect(out.salt.length).toBe(CRYPTO_CONSTANTS.SALT_LENGTH)
    const back = await decrypt(out, 'pw-123456')
    expect(new TextDecoder().decode(back)).toBe('hello')
  })
})

describe('crypto: key-based (CryptoKey) encryption', () => {
  it('round-trips with a generated key', async () => {
    const key = await generateSecureKey()
    const enc = await encryptStringWithKey('vault data', key)
    expect(enc).not.toContain('vault data')
    expect(await decryptStringWithKey(enc, key)).toBe('vault data')
  })

  it('a different key cannot decrypt', async () => {
    const k1 = await generateSecureKey()
    const k2 = await generateSecureKey()
    const enc = await encryptStringWithKey('top secret', k1)
    await expect(decryptStringWithKey(enc, k2)).rejects.toBeTruthy()
  })
})

describe('crypto: key derivation', () => {
  it('same password + salt derives interoperable keys', async () => {
    const salt = generateSalt()
    const { key: k1 } = await deriveKeyFromPassword('pw-abcdef', salt)
    const k2 = await deriveKeyWithSalt('pw-abcdef', salt)
    const iv = generateIV()
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k1, new TextEncoder().encode('x'))
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, k2, ct)
    expect(new TextDecoder().decode(pt)).toBe('x')
  })

  it('uses a strong PBKDF2 iteration count (>= OWASP 2023 guidance)', () => {
    expect(CRYPTO_CONSTANTS.ITERATIONS).toBeGreaterThanOrEqual(600000)
  })
})

describe('crypto: hashing & password verification', () => {
  it('sha256 is stable and hex-encoded', async () => {
    const h = await sha256('grito')
    expect(h).toMatch(/^[0-9a-f]{64}$/)
    expect(await sha256('grito')).toBe(h)
  })

  it('hashPassword + verifyPassword accept the right password and reject wrong', async () => {
    const stored = await hashPassword('mi-contraseña-segura')
    expect(await verifyPassword('mi-contraseña-segura', stored)).toBe(true)
    expect(await verifyPassword('otra', stored)).toBe(false)
  })

  it('constantTimeCompare is correct', () => {
    expect(constantTimeCompare('abc', 'abc')).toBe(true)
    expect(constantTimeCompare('abc', 'abd')).toBe(false)
    expect(constantTimeCompare('abc', 'abcd')).toBe(false)
  })
})

describe('crypto: file encryption (regression: nonce reuse / chunk bug)', () => {
  it('encrypts and decrypts a file larger than the old 1MB chunk size', async () => {
    const data = new Uint8Array(1024 * 1024 + 7777).map((_, i) => (i * 7) % 256)
    const file = new File([data], 'evidence.bin', { type: 'application/octet-stream' })
    const enc = await encryptFile(file, 'file-password-123')
    const dec = await decryptFile(enc, 'file-password-123', 'evidence.bin')
    const out = new Uint8Array(await dec.arrayBuffer())
    expect(out.length).toBe(data.length)
    expect(out[0]).toBe(data[0])
    expect(out[out.length - 1]).toBe(data[data.length - 1])
  })

  it('rejects a tampered/wrong-password file', async () => {
    const file = new File([new Uint8Array([1, 2, 3, 4])], 'x.bin')
    const enc = await encryptFile(file, 'pw-123456')
    await expect(decryptFile(enc, 'wrong-pw', 'x.bin')).rejects.toBeTruthy()
  })
})

describe('compression: lossless (regression: corrupting codec)', () => {
  it('round-trips empty, repeated, multibyte and NUL-containing strings', () => {
    const samples = [
      '',
      'a',
      'aaaaaaaaaaaaaaaaaaaa',
      'café ñ 🌮🌮🌮 acción',
      'a\x00b\x00\x00c',
      JSON.stringify({ a: [1, 2, 3], notes: 'éé'.repeat(200), nested: { x: '🌮'.repeat(50) } }),
    ]
    for (const s of samples) {
      expect(decompress(compress(s))).toBe(s)
    }
  })
})
