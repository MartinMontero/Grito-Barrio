/**
 * Store unit tests — exercise the REAL Zustand store (src/store) incident
 * lifecycle. (The previous version asserted on locally-defined mock objects.)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useProtocoloStore } from '@/store'
import type { AlertData } from '@/store'

function sampleAlert(overrides: Partial<AlertData> = {}): AlertData {
  return {
    location: {
      address: 'Calle Falsa 123',
      colonia: 'Centro',
      alcaldia: 'Cuauhtémoc',
      postalCode: '06000',
      coordinates: { latitude: 19.4326, longitude: -99.1332 },
    } as AlertData['location'],
    alertSource: 'hotline',
    description: 'Desalojo en curso',
    threatLevel: 'high',
    ...overrides,
  }
}

beforeEach(() => {
  // Reset the incident portion of the store between tests.
  useProtocoloStore.setState({ incidents: [], activeIncidentId: null, incidentHistory: [] })
})

describe('store: incident lifecycle', () => {
  it('creates an incident, sets it active, and exposes it via selectors', () => {
    const s = useProtocoloStore.getState()
    const id = s.createIncident(sampleAlert())
    expect(id).toMatch(/^CDMX-\d{4}-\d{2}-\d{2}-\d{4}-\d{3}$/)

    const active = useProtocoloStore.getState().getActiveIncident()
    expect(active?.id).toBe(id)
    expect(active?.threatLevel).toBe('high')
    expect(useProtocoloStore.getState().getOpenIncidents().length).toBe(1)
  })

  it('assigns and updates team members', () => {
    const s = useProtocoloStore.getState()
    const id = s.createIncident(sampleAlert())
    s.assignTeamMember(id, { pseudonym: 'Águila', role: 'security', certificationLevel: 2, status: 'en_route' } as never)
    let inc = useProtocoloStore.getState().getIncidentById(id)
    expect(inc?.team.length).toBe(1)

    s.updateTeamMemberStatus(id, 'Águila', 'on_scene' as never)
    inc = useProtocoloStore.getState().getIncidentById(id)
    expect(inc?.team[0].status).toBe('on_scene')
  })

  it('triggers withdrawal', () => {
    const s = useProtocoloStore.getState()
    const id = s.createIncident(sampleAlert())
    s.triggerWithdrawal(id, 'fuerza pública excesiva')
    const inc = useProtocoloStore.getState().getIncidentById(id)
    expect(inc?.withdrawalTriggered).toBe(true)
    expect(inc?.status).toBe('withdrawal')
  })

  it('closes an incident and moves it to history', () => {
    const s = useProtocoloStore.getState()
    const id = s.createIncident(sampleAlert())
    s.closeIncident(id, 'resuelto', 'successful')
    const after = useProtocoloStore.getState()
    expect(after.getIncidentById(id)).toBeUndefined()
    expect(after.activeIncidentId).toBeNull()
    expect(after.incidentHistory.some((h) => h.incidentId === id && h.outcome === 'successful')).toBe(true)
  })
})
