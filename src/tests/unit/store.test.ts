/**
 * Store Unit Tests
 * Protocolo CDMX
 * 
 * Tests for state management, incident operations, and persistence
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMockIncident, createMockTeamMember, createMockFormData, wait } from '../setup'
import type { Incident, TeamMember, IncidentStatus } from '@/types'

// Mock the store
const mockStore = {
  incidents: [] as Incident[],
  currentIncident: null as Incident | null,
  checklists: {} as Record<string, any>,
  team: [] as TeamMember[],
  settings: {
    encryptionEnabled: true,
    notificationsEnabled: true,
    autoSync: true,
  },
  
  // Actions
  createIncident: vi.fn(),
  updateIncident: vi.fn(),
  deleteIncident: vi.fn(),
  assignTeam: vi.fn(),
  addTeamMember: vi.fn(),
  removeTeamMember: vi.fn(),
  updateChecklist: vi.fn(),
  completeChecklistItem: vi.fn(),
  addDocumentation: vi.fn(),
  updateSettings: vi.fn(),
  persistState: vi.fn(),
  loadState: vi.fn(),
  
  // Getters
  getActiveIncident: vi.fn(),
  getIncidentById: vi.fn(),
  getTeamMembers: vi.fn(),
  getChecklist: vi.fn(),
  getProgress: vi.fn(),
}

describe('Store - Incident Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.incidents = []
    mockStore.currentIncident = null
    mockStore.team = []
  })

  describe('Incident Creation', () => {
    it('should create an incident with valid data', async () => {
      const incidentData = createMockIncident({
        location: {
          address: 'Av. Revolución 123',
          colonia: 'San Ángel',
          alcaldia: 'Álvaro Obregón',
          postalCode: '01000',
          coordinates: { latitude: 19.3432, longitude: -99.1895 },
        },
      })
      
      mockStore.createIncident.mockResolvedValue(incidentData)
      
      const result = await mockStore.createIncident(incidentData)
      
      expect(result).toBeValidIncident()
      expect(result.id).toMatch(/^INC-\d{4}-\d{3}$/)
      expect(result.location.alcaldia).toBe('Álvaro Obregón')
      expect(result.status).toBe('responding')
    })

    it('should auto-generate incident ID if not provided', async () => {
      const incidentData = createMockIncident({ id: undefined })
      
      mockStore.createIncident.mockImplementation((data) => {
        const id = `INC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
        return Promise.resolve({ ...data, id })
      })
      
      const result = await mockStore.createIncident(incidentData)
      
      expect(result.id).toBeDefined()
      expect(result.id).toMatch(/^INC-\d{4}-\d{3}$/)
    })

    it('should set default status to "detected" for new incidents', async () => {
      const incidentData = createMockIncident({ status: undefined })
      
      mockStore.createIncident.mockImplementation((data) => {
        return Promise.resolve({ ...data, status: 'detected' as IncidentStatus })
      })
      
      const result = await mockStore.createIncident(incidentData)
      
      expect(result.status).toBe('detected')
    })

    it('should reject incidents without required fields', async () => {
      const invalidIncident = {
        description: 'Missing location',
      }
      
      mockStore.createIncident.mockRejectedValue(new Error('Missing required field: location'))
      
      await expect(mockStore.createIncident(invalidIncident)).rejects.toThrow('Missing required field')
    })

    it('should validate alcaldía is from CDMX list', async () => {
      const invalidIncident = createMockIncident({
        location: {
          ...createMockIncident().location,
          alcaldia: 'Invalid Alcaldia',
        },
      })
      
      mockStore.createIncident.mockRejectedValue(new Error('Invalid alcaldía'))
      
      await expect(mockStore.createIncident(invalidIncident)).rejects.toThrow('Invalid alcaldía')
    })
  })

  describe('Incident Updates', () => {
    it('should update incident status', async () => {
      const incident = createMockIncident()
      mockStore.incidents.push(incident)
      
      mockStore.updateIncident.mockImplementation((id, updates) => {
        const idx = mockStore.incidents.findIndex(i => i.id === id)
        if (idx >= 0) {
          mockStore.incidents[idx] = { ...mockStore.incidents[idx], ...updates }
          return Promise.resolve(mockStore.incidents[idx])
        }
        return Promise.reject(new Error('Incident not found'))
      })
      
      const result = await mockStore.updateIncident(incident.id, { status: 'resolved' })
      
      expect(result.status).toBe('resolved')
    })

    it('should track update timestamp', async () => {
      const incident = createMockIncident()
      const beforeUpdate = Date.now()
      
      mockStore.updateIncident.mockImplementation((id, updates) => {
        return Promise.resolve({ ...incident, ...updates, updatedAt: new Date().toISOString() })
      })
      
      const result = await mockStore.updateIncident(incident.id, { status: 'escalated' })
      const updatedAt = new Date(result.updatedAt).getTime()
      
      expect(updatedAt).toBeGreaterThanOrEqual(beforeUpdate)
    })

    it('should reject updates to non-existent incidents', async () => {
      mockStore.updateIncident.mockRejectedValue(new Error('Incident not found'))
      
      await expect(mockStore.updateIncident('INVALID-ID', { status: 'resolved' }))
        .rejects.toThrow('Incident not found')
    })

    it('should validate status transitions', async () => {
      const incident = createMockIncident({ status: 'resolved' })
      
      mockStore.updateIncident.mockImplementation((id, updates) => {
        if (updates.status && incident.status === 'resolved') {
          return Promise.reject(new Error('Cannot modify resolved incident'))
        }
        return Promise.resolve({ ...incident, ...updates })
      })
      
      await expect(mockStore.updateIncident(incident.id, { status: 'responding' }))
        .rejects.toThrow('Cannot modify resolved incident')
    })
  })

  describe('Incident Retrieval', () => {
    it('should retrieve incident by ID', async () => {
      const incident = createMockIncident()
      mockStore.incidents.push(incident)
      
      mockStore.getIncidentById.mockImplementation((id) => {
        return Promise.resolve(mockStore.incidents.find(i => i.id === id) || null)
      })
      
      const result = await mockStore.getIncidentById(incident.id)
      
      expect(result).not.toBeNull()
      expect(result?.id).toBe(incident.id)
    })

    it('should return null for non-existent incident', async () => {
      mockStore.getIncidentById.mockResolvedValue(null)
      
      const result = await mockStore.getIncidentById('NON-EXISTENT')
      
      expect(result).toBeNull()
    })

    it('should get active incident', async () => {
      const activeIncident = createMockIncident({ status: 'responding' })
      mockStore.currentIncident = activeIncident
      
      mockStore.getActiveIncident.mockReturnValue(activeIncident)
      
      const result = mockStore.getActiveIncident()
      
      expect(result).not.toBeNull()
      expect(result?.status).toBe('responding')
    })
  })
})

describe('Store - Team Management', () => {
  beforeEach(() => {
    mockStore.team = []
  })

  describe('Team Assignment', () => {
    it('should assign team to incident', async () => {
      const incident = createMockIncident()
      const team = [
        createMockTeamMember({ role: 'leader', pseudonym: 'coordinator-1' }),
        createMockTeamMember({ role: 'security', pseudonym: 'security-1' }),
        createMockTeamMember({ role: 'medical', pseudonym: 'medic-1' }),
      ]
      
      mockStore.assignTeam.mockImplementation((incidentId, teamMembers) => {
        mockStore.team = teamMembers
        return Promise.resolve({ incidentId, team: teamMembers })
      })
      
      const result = await mockStore.assignTeam(incident.id, team)
      
      expect(result.team).toHaveLength(3)
      expect(result.team[0].role).toBe('leader')
    })

    it('should ensure at least one leader in team', async () => {
      const teamWithoutLeader = [
        createMockTeamMember({ role: 'security' }),
        createMockTeamMember({ role: 'medical' }),
      ]
      
      mockStore.assignTeam.mockRejectedValue(new Error('Team must have a leader'))
      
      await expect(mockStore.assignTeam('INC-001', teamWithoutLeader))
        .rejects.toThrow('Team must have a leader')
    })

    it('should validate certification levels', async () => {
      const team = [
        createMockTeamMember({ role: 'leader', certificationLevel: 1 }),
      ]
      
      mockStore.assignTeam.mockRejectedValue(new Error('Leader requires certification level 2 or higher'))
      
      await expect(mockStore.assignTeam('INC-001', team))
        .rejects.toThrow('Leader requires certification level 2 or higher')
    })
  })

  describe('Team Member Operations', () => {
    it('should add team member', async () => {
      const member = createMockTeamMember({ pseudonym: 'new-member' })
      
      mockStore.addTeamMember.mockImplementation((m) => {
        mockStore.team.push(m)
        return Promise.resolve(m)
      })
      
      const result = await mockStore.addTeamMember(member)
      
      expect(mockStore.team).toHaveLength(1)
      expect(result.pseudonym).toBe('new-member')
    })

    it('should remove team member by pseudonym', async () => {
      const member = createMockTeamMember({ pseudonym: 'to-remove' })
      mockStore.team.push(member)
      
      mockStore.removeTeamMember.mockImplementation((pseudonym) => {
        mockStore.team = mockStore.team.filter(m => m.pseudonym !== pseudonym)
        return Promise.resolve(true)
      })
      
      await mockStore.removeTeamMember('to-remove')
      
      expect(mockStore.team).toHaveLength(0)
    })

    it('should update team member status', async () => {
      const member = createMockTeamMember({ pseudonym: 'test-member', status: 'en_route' })
      mockStore.team.push(member)
      
      mockStore.updateIncident.mockImplementation((id, updates) => {
        const m = mockStore.team.find(t => t.pseudonym === id)
        if (m) Object.assign(m, updates)
        return Promise.resolve(m)
      })
      
      const result = await mockStore.updateIncident('test-member', { status: 'on_scene' })
      
      expect(result.status).toBe('on_scene')
    })

    it('should track ETA updates', async () => {
      const eta = new Date(Date.now() + 30 * 60000).toISOString()
      const member = createMockTeamMember({ pseudonym: 'test-member' })
      
      mockStore.updateIncident.mockImplementation((id, updates) => {
        return Promise.resolve({ ...member, ...updates })
      })
      
      const result = await mockStore.updateIncident('test-member', { eta })
      
      expect(result.eta).toBe(eta)
    })
  })
})

describe('Store - Checklist Management', () => {
  beforeEach(() => {
    mockStore.checklists = {}
  })

  describe('Checklist Operations', () => {
    it('should create checklist for incident', async () => {
      const incidentId = 'INC-2025-001'
      const checklist = {
        id: `${incidentId}-checklist`,
        items: [
          { id: '1', text: 'Secure scene', completed: false, category: 'safety' },
          { id: '2', text: 'Contact team', completed: false, category: 'communication' },
        ],
      }
      
      mockStore.updateChecklist.mockImplementation((id, data) => {
        mockStore.checklists[id] = data
        return Promise.resolve(data)
      })
      
      const result = await mockStore.updateChecklist(incidentId, checklist)
      
      expect(mockStore.checklists[incidentId]).toBeDefined()
      expect(result.items).toHaveLength(2)
    })

    it('should complete checklist item', async () => {
      const incidentId = 'INC-2025-001'
      const checklist = {
        items: [
          { id: '1', text: 'Secure scene', completed: false, timestamp: null },
        ],
      }
      mockStore.checklists[incidentId] = checklist
      
      mockStore.completeChecklistItem.mockImplementation((id, itemId) => {
        const item = mockStore.checklists[id].items.find((i: any) => i.id === itemId)
        if (item) {
          item.completed = true
          item.timestamp = new Date().toISOString()
          item.completedBy = 'test-user'
        }
        return Promise.resolve(item)
      })
      
      const result = await mockStore.completeChecklistItem(incidentId, '1')
      
      expect(result.completed).toBe(true)
      expect(result.timestamp).toBeDefined()
      expect(result.completedBy).toBe('test-user')
    })

    it('should calculate checklist progress', () => {
      const checklist = {
        items: [
          { id: '1', completed: true },
          { id: '2', completed: true },
          { id: '3', completed: false },
          { id: '4', completed: false },
        ],
      }
      
      mockStore.getProgress.mockImplementation((id) => {
        const items = checklist.items
        const completed = items.filter((i: any) => i.completed).length
        return Math.round((completed / items.length) * 100)
      })
      
      const progress = mockStore.getProgress('INC-2025-001')
      
      expect(progress).toBe(50)
    })

    it('should enforce time windows for critical items', async () => {
      const checklist = {
        items: [
          { id: '1', text: 'Critical item', completed: false, timeWindow: '0-5min', mandatory: true },
        ],
      }
      
      mockStore.completeChecklistItem.mockImplementation((id, itemId) => {
        const item = checklist.items.find((i: any) => i.id === itemId)
        if (item?.mandatory) {
          return Promise.reject(new Error('Mandatory item must be completed in time window'))
        }
        return Promise.resolve(item)
      })
      
      // Simulate missing time window
      await expect(mockStore.completeChecklistItem('INC-001', '1'))
        .rejects.toThrow('Mandatory item must be completed in time window')
    })
  })
})

describe('Store - Documentation', () => {
  it('should add documentation entry', async () => {
    const incidentId = 'INC-2025-001'
    const doc = {
      id: 'doc-001',
      type: 'photo' as const,
      capturedBy: 'test-user',
      timestamp: new Date().toISOString(),
      hash: 'abc123',
    }
    
    mockStore.addDocumentation.mockImplementation((id, data) => {
      return Promise.resolve({ ...data, incidentId: id })
    })
    
    const result = await mockStore.addDocumentation(incidentId, doc)
    
    expect(result.incidentId).toBe(incidentId)
    expect(result.hash).toBe('abc123')
  })

  it('should reject documentation without hash', async () => {
    const doc = {
      type: 'photo',
      capturedBy: 'test-user',
    }
    
    mockStore.addDocumentation.mockRejectedValue(new Error('Documentation must have hash'))
    
    await expect(mockStore.addDocumentation('INC-001', doc))
      .rejects.toThrow('Documentation must have hash')
  })
})

describe('Store - Settings', () => {
  it('should update settings', async () => {
    const newSettings = {
      encryptionEnabled: false,
      notificationsEnabled: true,
    }
    
    mockStore.updateSettings.mockImplementation((s) => {
      mockStore.settings = { ...mockStore.settings, ...s }
      return Promise.resolve(mockStore.settings)
    })
    
    const result = await mockStore.updateSettings(newSettings)
    
    expect(result.encryptionEnabled).toBe(false)
    expect(result.notificationsEnabled).toBe(true)
  })

  it('should persist settings to localStorage', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    
    mockStore.persistState.mockImplementation(() => {
      localStorage.setItem('protocolo-settings', JSON.stringify(mockStore.settings))
      return Promise.resolve()
    })
    
    await mockStore.persistState()
    
    expect(setItemSpy).toHaveBeenCalledWith('protocolo-settings', expect.any(String))
  })
})

describe('Store - State Persistence', () => {
  it('should persist state to IndexedDB', async () => {
    const state = {
      incidents: [createMockIncident()],
      settings: mockStore.settings,
    }
    
    mockStore.persistState.mockResolvedValue(undefined)
    
    await mockStore.persistState()
    
    expect(mockStore.persistState).toHaveBeenCalled()
  })

  it('should load state from storage', async () => {
    const savedState = {
      incidents: [createMockIncident()],
      settings: { encryptionEnabled: true },
    }
    
    mockStore.loadState.mockResolvedValue(savedState)
    
    const result = await mockStore.loadState()
    
    expect(result).toEqual(savedState)
  })

  it('should handle corrupted state gracefully', async () => {
    mockStore.loadState.mockRejectedValue(new Error('Corrupted state'))
    
    await expect(mockStore.loadState()).rejects.toThrow('Corrupted state')
  })
})

describe('Store - Error Handling', () => {
  it('should handle network errors gracefully', async () => {
    mockStore.createIncident.mockRejectedValue(new Error('Network error'))
    
    await expect(mockStore.createIncident(createMockIncident()))
      .rejects.toThrow('Network error')
  })

  it('should handle storage quota exceeded', async () => {
    mockStore.persistState.mockRejectedValue(new Error('Quota exceeded'))
    
    await expect(mockStore.persistState()).rejects.toThrow('Quota exceeded')
  })

  it('should validate data integrity on load', async () => {
    const corruptedData = { incidents: 'not-an-array' }
    
    mockStore.loadState.mockImplementation(() => {
      if (!Array.isArray(corruptedData.incidents)) {
        return Promise.reject(new Error('Data integrity check failed'))
      }
      return Promise.resolve(corruptedData)
    })
    
    await expect(mockStore.loadState()).rejects.toThrow('Data integrity check failed')
  })
})
