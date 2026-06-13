/**
 * Vault + at-rest storage tests — real key management, unlock, duress, and the
 * fail-closed persistence guarantees.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as vault from '@/lib/vault'
import { storeData, getData } from '@/lib/storage'
import { encryptData, decryptData } from '@/lib/encryption'

beforeEach(() => {
  vault.lock()
  localStorage.clear()
})

describe('vault: lifecycle', () => {
  it('starts uninitialized, then create unlocks with a key in memory', async () => {
    expect(vault.getVaultState()).toBe('uninitialized')
    await vault.createVault('master-pass-123')
    expect(vault.getVaultState()).toBe('unlocked')
    expect(vault.getDataKey()).not.toBeNull()
  })

  it('rejects passphrases shorter than 8 chars', async () => {
    await expect(vault.createVault('short')).rejects.toBeTruthy()
  })

  it('lock drops the key; unlock with right pass restores it; wrong pass fails', async () => {
    await vault.createVault('master-pass-123')
    vault.lock()
    expect(vault.getVaultState()).toBe('locked')
    expect(vault.getDataKey()).toBeNull()
    expect((await vault.unlock('nope-nope')).success).toBe(false)
    expect(await vault.unlock('master-pass-123')).toEqual({ success: true, duress: false })
  })

  it('changePassphrase keeps the same data key (no re-encryption needed)', async () => {
    await vault.createVault('old-pass-123')
    const enc = await encryptData('secret') // uses current DEK
    await vault.changePassphrase('old-pass-123', 'new-pass-456')
    expect(await decryptData(enc)).toBe('secret') // same DEK still decrypts
    vault.lock()
    expect((await vault.unlock('old-pass-123')).success).toBe(false)
    expect((await vault.unlock('new-pass-456')).success).toBe(true)
    expect(await decryptData(enc)).toBe('secret')
  })
})

describe('vault: duress', () => {
  it('duress passphrase unlocks an isolated decoy key flagged as duress', async () => {
    await vault.createVault('real-pass-123')
    const realData = await encryptData('REAL incident data')
    await vault.setDuressPassphrase('duress-pass-123')
    expect(vault.hasDuressSlot()).toBe(true)

    vault.lock()
    const du = await vault.unlock('duress-pass-123')
    expect(du).toEqual({ success: true, duress: true })
    // The decoy key must NOT decrypt real data.
    await expect(decryptData(realData)).rejects.toBeTruthy()

    vault.lock()
    const real = await vault.unlock('real-pass-123')
    expect(real.duress).toBe(false)
    expect(await decryptData(realData)).toBe('REAL incident data')
  })

  it('on-disk vault record carries no "duress" label (deniability)', async () => {
    await vault.createVault('real-pass-123')
    await vault.setDuressPassphrase('duress-pass-123')
    const raw = localStorage.getItem('gb_vault_v1') || ''
    expect(raw.toLowerCase()).not.toContain('duress')
  })

  it('destroyVault removes the record and locks', async () => {
    await vault.createVault('real-pass-123')
    vault.destroyVault()
    expect(vault.getVaultState()).toBe('uninitialized')
    expect(localStorage.getItem('gb_vault_v1')).toBeNull()
  })
})

describe('storage: fail-closed at-rest persistence', () => {
  it('encrypts at rest when unlocked and decrypts back', async () => {
    await vault.createVault('master-pass-123')
    await storeData('incidents-x', { secret: 'eviction notes', n: 42 }, true)
    // Raw IndexedDB record must not contain the plaintext.
    const { db } = await import('@/lib/db')
    const raw = await db.get<{ data: string; encrypted: boolean }>('settings' as never, 'incidents-x')
    expect(raw.data?.encrypted).toBe(true)
    expect(raw.data?.data).not.toContain('eviction notes')
    // Round-trips through getData.
    expect(await getData<{ secret: string }>('incidents-x')).toEqual({ secret: 'eviction notes', n: 42 })
  })

  it('REFUSES to persist sensitive data while locked (no plaintext leak)', async () => {
    await vault.createVault('master-pass-123')
    vault.lock()
    await expect(storeData('incidents-y', { secret: 'do not leak' }, true)).rejects.toBeTruthy()
  })

  it('returns null for encrypted data while locked, decrypts after unlock', async () => {
    await vault.createVault('master-pass-123')
    await storeData('incidents-z', { secret: 'later' }, true)
    vault.lock()
    expect(await getData('incidents-z')).toBeNull()
    await vault.unlock('master-pass-123')
    expect(await getData<{ secret: string }>('incidents-z')).toEqual({ secret: 'later' })
  })

  it('stores plaintext (disclosed) when no vault is configured', async () => {
    await storeData('prefs', { theme: 'dark' }, true) // encrypt requested, but no vault
    expect(await getData<{ theme: string }>('prefs')).toEqual({ theme: 'dark' })
  })
})
