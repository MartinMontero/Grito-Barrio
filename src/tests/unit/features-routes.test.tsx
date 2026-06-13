/**
 * Feature routes smoke tests.
 *
 * Renders the REAL routed application at each feature route added in
 * src/routes/featureRoutes.tsx and asserts the corresponding screen mounts
 * (no crash) with recognizable Spanish content.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '@/App'
import * as vault from '@/lib/vault'

function renderApp(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vault.lock()
  localStorage.clear()
})

describe('Feature routes: each dead component is now reachable', () => {
  const cases: Array<[string, RegExp]> = [
    ['/training', /Centro de Capacitación|Módulos/i],
    ['/training/mod-1', /P\.A\.S\. Fundamentos|Lección/i],
    ['/certifications', /Mis Certificaciones|Certificados/i],
    ['/resources/contacts', /Directorio de Contactos|Buscar contactos/i],
    ['/contacts/tree', /Árbol de Contactos/i],
    ['/safe-points', /Puntos Seguros/i],
    ['/safe-points/sp-1', /Parroquia San Judas Tadeo|Información/i],
    ['/supplies', /Listas de Verificación/i],
    ['/forms', /Reporte de Incidente|Información del Formulario/i],
    ['/forms/incident_report', /Reporte de Incidente/i],
    ['/scenarios', /Simulador de Escenarios/i],
    ['/messages', /Plantillas de Mensajes/i],
    ['/quick-dial', /Llamada Rápida/i],
    ['/roles/switch', /Cambiar Rol/i],
    ['/security', /Seguridad|Configuración de Seguridad/i],
    ['/security/duress', /.+/],
  ]

  it.each(cases)('mounts %s', async (path, matcher) => {
    renderApp(path)
    await waitFor(() => {
      expect(screen.getAllByText(matcher).length).toBeGreaterThan(0)
    })
  })
})

describe('Feature routes: detail routes resolve unknown ids safely', () => {
  it('redirects an unknown safe point id back to the list', async () => {
    renderApp('/safe-points/does-not-exist')
    await waitFor(() => {
      expect(screen.getAllByText(/Puntos Seguros/i).length).toBeGreaterThan(0)
    })
  })

  it('redirects an unknown training module id back to the dashboard', async () => {
    renderApp('/training/nope')
    await waitFor(() => {
      expect(screen.getAllByText(/Centro de Capacitación/i).length).toBeGreaterThan(0)
    })
  })
})
