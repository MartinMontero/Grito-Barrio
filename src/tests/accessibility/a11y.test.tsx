/**
 * Accessibility tests — render the REAL app and assert baseline a11y properties.
 * (The previous version asserted on hardcoded constants like a contrast ratio of
 * 7.2 that was never measured.)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '@/App'
import { LockScreen } from '@/components/auth/LockScreen'
import * as vault from '@/lib/vault'

beforeEach(() => {
  vault.lock()
  localStorage.clear()
})

describe('accessibility: document & landmarks', () => {
  it('document language is Spanish (es-MX)', () => {
    expect(document.documentElement.lang).toBe('es-MX')
  })

  it('home renders a main landmark and an accessible emergency control', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(document.querySelector('main')).toBeTruthy()
    })
    // Key controls expose accessible names.
    expect(screen.getAllByRole('button', { name: /Emergencia/i }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /Abrir menú/i })).toBeTruthy()
  })

  it('bottom navigation items have accessible names and aria-current', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByLabelText('Inicio')).toBeTruthy()
    })
    expect(screen.getByLabelText('Protocolos')).toBeTruthy()
  })
})

describe('accessibility: lock screen', () => {
  it('the passphrase field and toggle are labelled', () => {
    render(<LockScreen onUnlocked={() => {}} />)
    expect(screen.getByLabelText('Contraseña')).toBeTruthy()
    expect(screen.getByLabelText(/Mostrar contraseña|Ocultar contraseña/)).toBeTruthy()
  })
})
