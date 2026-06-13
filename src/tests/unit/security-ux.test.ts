/**
 * Security UX onboarding tests
 * Grito & Barrio
 *
 * Exercises the master-password onboarding flow wired into the settings/security
 * screens, driving the REAL securityManager (which creates and unlocks the
 * encryption vault). Uses the real WebCrypto + fake-indexeddb + localStorage
 * provided by the test setup — nothing is mocked.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { securityManager } from '@/lib/security'
import * as vault from '@/lib/vault'

beforeEach(() => {
  // Start every test from a clean, locked, vault-less state.
  vault.lock()
  localStorage.clear()
  sessionStorage.clear()
})

describe('security-ux: vault onboarding via securityManager', () => {
  it('reports no password before onboarding', () => {
    expect(securityManager.hasPassword()).toBe(false)
  })

  it('setRealPassword creates the vault and enables protection', async () => {
    expect(securityManager.hasPassword()).toBe(false)

    await securityManager.setRealPassword('a-good-pass')

    expect(securityManager.hasPassword()).toBe(true)
    expect(securityManager.getConfig().encryptionEnabled).toBe(true)
  })

  it('lock + verifyPassword unlocks with the right password (not duress)', async () => {
    await securityManager.setRealPassword('a-good-pass')

    vault.lock()
    expect(vault.getVaultState()).toBe('locked')

    const result = await securityManager.verifyPassword('a-good-pass')
    expect(result).toEqual({ valid: true, isDuress: false })
    expect(vault.getVaultState()).toBe('unlocked')
  })

  it('verifyPassword rejects a wrong password', async () => {
    await securityManager.setRealPassword('a-good-pass')
    vault.lock()

    const result = await securityManager.verifyPassword('wrong-password')
    expect(result.valid).toBe(false)
    expect(result.isDuress).toBe(false)
  })
})
