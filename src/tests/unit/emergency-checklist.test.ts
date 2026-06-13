/**
 * Emergency Checklist Slice Tests
 * Protocolo CDMX
 *
 * Drives the REAL checklistSlice through the combined Zustand store:
 *  - initialize a checklist for an incident
 *  - toggle items
 *  - assert getProgress reflects the toggles
 *  - assert the same data is visible via the store (single source of truth)
 *
 * The test env provides real WebCrypto + fake-indexeddb (see src/tests/setup.ts).
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useProtocoloStore } from '@/store'

const INCIDENT_A = 'CDMX-2026-06-13-1200-001'
const INCIDENT_B = 'CDMX-2026-06-13-1200-002'

function resetChecklists() {
  // Reset only the checklist slice state to keep tests independent.
  useProtocoloStore.setState({ checklists: {}, currentPhase: '0-5min' })
}

describe('checklistSlice (single source of truth)', () => {
  beforeEach(() => {
    resetChecklists()
  })

  it('initializes a checklist with canonical `${incidentId}-item-${index}` ids', () => {
    const store = useProtocoloStore.getState()
    store.initializeChecklist(INCIDENT_A)

    const items = useProtocoloStore.getState().checklists[INCIDENT_A]
    expect(items).toBeDefined()
    expect(items.length).toBeGreaterThan(0)

    // Every id follows the canonical scheme.
    items.forEach((item, index) => {
      expect(item.id).toBe(`${INCIDENT_A}-item-${index}`)
    })

    // A fresh checklist has 0% progress.
    expect(useProtocoloStore.getState().getProgress(INCIDENT_A)).toBe(0)
  })

  it('does not overwrite an existing checklist on re-initialize', () => {
    const store = useProtocoloStore.getState()
    store.initializeChecklist(INCIDENT_A)
    const firstId = useProtocoloStore.getState().checklists[INCIDENT_A][0].id

    // Toggle one, then re-init: state must be preserved.
    store.toggleItem(INCIDENT_A, firstId, 'tester')
    store.initializeChecklist(INCIDENT_A)

    const item = useProtocoloStore.getState().checklists[INCIDENT_A][0]
    expect(item.completed).toBe(true)
  })

  it('toggling items updates getProgress and persists via the store', () => {
    const store = useProtocoloStore.getState()
    store.initializeChecklist(INCIDENT_A)

    const items = useProtocoloStore.getState().checklists[INCIDENT_A]
    const total = items.length

    // Complete the first two items.
    store.toggleItem(INCIDENT_A, items[0].id, 'medico1')
    store.toggleItem(INCIDENT_A, items[1].id, 'medico1')

    const expected = Math.round((2 / total) * 100)
    expect(useProtocoloStore.getState().getProgress(INCIDENT_A)).toBe(expected)

    // The SAME data is visible directly via the store map (round-trips).
    const stored = useProtocoloStore.getState().checklists[INCIDENT_A]
    expect(stored[0].completed).toBe(true)
    expect(stored[0].completedBy).toBe('medico1')
    expect(stored[0].timestamp).toBeTruthy()
    expect(stored[1].completed).toBe(true)
    expect(stored[2].completed).toBe(false)
  })

  it('toggling an item off reverts completion and clears metadata', () => {
    const store = useProtocoloStore.getState()
    store.initializeChecklist(INCIDENT_A)
    const id = useProtocoloStore.getState().checklists[INCIDENT_A][0].id

    store.toggleItem(INCIDENT_A, id, 'tester')
    expect(useProtocoloStore.getState().checklists[INCIDENT_A][0].completed).toBe(true)

    store.toggleItem(INCIDENT_A, id, 'tester')
    const item = useProtocoloStore.getState().checklists[INCIDENT_A][0]
    expect(item.completed).toBe(false)
    expect(item.completedBy).toBeUndefined()
    expect(item.timestamp).toBeUndefined()
    expect(useProtocoloStore.getState().getProgress(INCIDENT_A)).toBe(0)
  })

  it('keeps incident checklists isolated from each other', () => {
    const store = useProtocoloStore.getState()
    store.initializeChecklist(INCIDENT_A)
    store.initializeChecklist(INCIDENT_B)

    const aId = useProtocoloStore.getState().checklists[INCIDENT_A][0].id
    store.toggleItem(INCIDENT_A, aId, 'tester')

    expect(useProtocoloStore.getState().getProgress(INCIDENT_A)).toBeGreaterThan(0)
    expect(useProtocoloStore.getState().getProgress(INCIDENT_B)).toBe(0)
  })

  it('phase progress reflects completions within a single phase', () => {
    const store = useProtocoloStore.getState()
    store.initializeChecklist(INCIDENT_A)

    const phaseItems = useProtocoloStore.getState().getItemsByPhase(INCIDENT_A, '0-5min')
    expect(phaseItems.length).toBeGreaterThan(0)

    // Complete every item in the first phase.
    phaseItems.forEach(item => store.toggleItem(INCIDENT_A, item.id, 'tester'))

    expect(useProtocoloStore.getState().getPhaseProgress(INCIDENT_A, '0-5min')).toBe(100)
  })
})
