/**
 * Security tests — exercise the REAL SecurityManager + vault.
 *
 * (The previous version of this file treated base64 as "encryption" and
 * asserted that tampering was NOT detected. These tests run the actual
 * security-critical code paths.)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { securityManager } from '@/lib/security'
import * as vault from '@/lib/vault'
import { db } from '@/lib/db'

beforeEach(async () => {
  vault.lock()
  localStorage.clear()
  sessionStorage.clear()
  await db.deleteDatabase().catch(() => undefined)
})

describe('security: vault-backed authentication', () => {
  it('hasPassword reflects vault existence; verifyPassword detects real vs duress vs wrong', async () => {
    expect(securityManager.hasPassword()).toBe(false)
    await securityManager.setRealPassword('real-pass-123')
    expect(securityManager.hasPassword()).toBe(true)

    await securityManager.setDuressPassword('duress-pass-123')
    expect(securityManager.hasDuressPassword()).toBe(true)

    vault.lock()
    expect(await securityManager.verifyPassword('wrong')).toEqual({ valid: false, isDuress: false })
    vault.lock()
    expect(await securityManager.verifyPassword('real-pass-123')).toEqual({ valid: true, isDuress: false })
    vault.lock()
    expect(await securityManager.verifyPassword('duress-pass-123')).toEqual({ valid: true, isDuress: true })
  })

  it('unlocking with the duress password schedules a durable panic wipe', async () => {
    securityManager.cancelWipe()
    await securityManager.setRealPassword('real-pass-123')
    await securityManager.setDuressPassword('duress-pass-123')
    vault.lock()
    await securityManager.verifyPassword('duress-pass-123')
    expect(securityManager.isWipeScheduled()).toBe(true)
    // The deadline is persisted in localStorage (survives reload), not just memory.
    expect(localStorage.getItem('protocolo_cdmx_panic_wipe_state')).toBeTruthy()
    securityManager.cancelWipe()
  })
})

describe('security: lockout after repeated failures', () => {
  it('throws once the configured max failed attempts is reached', async () => {
    await securityManager.setRealPassword('real-pass-123')
    securityManager.updateConfig({ maxFailedAttempts: 3, lockoutDuration: 30 })
    vault.lock()
    for (let i = 0; i < 3; i++) {
      await securityManager.verifyPassword('nope-' + i)
    }
    await expect(securityManager.verifyPassword('nope-again')).rejects.toBeTruthy()
  })
})

describe('security: panic wipe destroys all local data', () => {
  it('clears IndexedDB, the vault, and Web Storage', async () => {
    await securityManager.setRealPassword('real-pass-123')
    // Write data into an encrypted store and a couple of Web Storage keys.
    await db.put('incidents', { id: 'INC-1', notes: 'sensible' })
    localStorage.setItem('gb_test_key', 'x')
    sessionStorage.setItem('gb_test_session', 'y')

    await securityManager.executeWipe() // window.reload is caught in jsdom

    // Vault gone, Web Storage cleared.
    expect(vault.getVaultState()).toBe('uninitialized')
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)

    // IndexedDB store no longer has the record (database was deleted/recreated empty).
    const res = await db.get('incidents', 'INC-1')
    expect(res.data).toBeUndefined()
  })
})
