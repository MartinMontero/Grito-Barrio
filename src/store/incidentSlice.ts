/**
 * Incident Slice
 * Protocolo CDMX - Zustand Store
 * 
 * Manages incident reports, team assignments, and response workflows
 */

import type { StateCreator } from 'zustand'
import type { 
  Incident, 
  TeamMember, 
  IncidentStatus, 
  AlertSource,
  IncidentLocation 
} from '@/types'
import { 
  generateIncidentId, 
  getCurrentTimestamp,
  updateInArray,
  removeFromArray,
  findById,
  persistToIndexedDB
} from '@/lib/store-helpers'

// =============================================================================
// TYPES
// =============================================================================

export interface AlertData {
  location: IncidentLocation
  alertSource: AlertSource
  description: string
  threatLevel: 'low' | 'moderate' | 'high' | 'critical' | 'extreme'
  occupantsAtRisk?: number
  minorsPresent?: boolean
  vulnerablePersons?: boolean
  authoritiesPresent?: boolean
  authorityTypes?: ('police' | 'court_officer' | 'private_security' | 'other')[]
}

export interface IncidentHistoryEntry {
  incidentId: string
  closedAt: string
  closedBy: string
  reason: string
  outcome: 'successful' | 'partial' | 'escalated' | 'withdrawal'
}

export interface IncidentSlice {
  // State
  incidents: Incident[]
  activeIncidentId: string | null
  incidentHistory: IncidentHistoryEntry[]
  
  // Actions
  createIncident: (alertData: AlertData) => string
  setActiveIncident: (id: string | null) => void
  updateIncident: (id: string, updates: Partial<Incident>) => void
  closeIncident: (id: string, reason: string, outcome: IncidentHistoryEntry['outcome']) => void
  assignTeamMember: (incidentId: string, member: TeamMember) => void
  removeTeamMember: (incidentId: string, pseudonym: string) => void
  updateTeamMemberStatus: (incidentId: string, pseudonym: string, status: TeamMember['status']) => void
  triggerWithdrawal: (incidentId: string, reason: string) => void
  getActiveIncident: () => Incident | null
  getIncidentById: (id: string) => Incident | undefined
  getOpenIncidents: () => Incident[]
  getIncidentsByStatus: (status: IncidentStatus) => Incident[]
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialIncidentState: Omit<IncidentSlice, keyof IncidentSlice> = {
  incidents: [],
  activeIncidentId: null,
  incidentHistory: []
}

// =============================================================================
// SLICE CREATOR
// =============================================================================

export const createIncidentSlice: StateCreator<
  IncidentSlice,
  [['zustand/persist', unknown]],
  [],
  IncidentSlice
> = persistToIndexedDB<IncidentSlice>('protocolo-incidents', true)(
  (set, get) => ({
    ...initialIncidentState,

    /**
     * Create a new incident from alert data
     * Returns the generated incident ID
     */
    createIncident: (alertData: AlertData): string => {
      const id = generateIncidentId()
      const timestamp = getCurrentTimestamp()
      
      const newIncident: Incident = {
        id,
        timestamp,
        location: alertData.location,
        alertSource: alertData.alertSource,
        verificationStatus: 'unverified',
        incidentLeader: '',
        team: [],
        threatLevel: alertData.threatLevel,
        withdrawalTriggered: false,
        status: 'detected',
        description: alertData.description,
        occupantsAtRisk: alertData.occupantsAtRisk,
        minorsPresent: alertData.minorsPresent,
        vulnerablePersons: alertData.vulnerablePersons,
        authoritiesPresent: alertData.authoritiesPresent,
        authorityTypes: alertData.authorityTypes
      }

      set(state => ({
        incidents: [...state.incidents, newIncident],
        activeIncidentId: id
      }))

      return id
    },

    /**
     * Set the currently active incident
     */
    setActiveIncident: (id: string | null) => {
      set({ activeIncidentId: id })
    },

    /**
     * Update an incident's properties
     */
    updateIncident: (id: string, updates: Partial<Incident>) => {
      set(state => ({
        incidents: updateInArray(state.incidents, id, {
          ...updates
        })
      }))
    },

    /**
     * Close an incident and move it to history
     */
    closeIncident: (
      id: string, 
      reason: string, 
      outcome: IncidentHistoryEntry['outcome']
    ) => {
      const state = get()
      const incident = findById(state.incidents, id)
      
      if (!incident) {
        console.error(`Incident ${id} not found`)
        return
      }

      const historyEntry: IncidentHistoryEntry = {
        incidentId: id,
        closedAt: getCurrentTimestamp(),
        closedBy: state.activeIncidentId === id ? 'system' : 'user',
        reason,
        outcome
      }

      set({
        incidents: removeFromArray(state.incidents, id),
        incidentHistory: [...state.incidentHistory, historyEntry],
        activeIncidentId: state.activeIncidentId === id ? null : state.activeIncidentId
      })
    },

    /**
     * Assign a team member to an incident
     */
    assignTeamMember: (incidentId: string, member: TeamMember) => {
      set(state => {
        const incident = findById(state.incidents, incidentId)
        if (!incident) return state

        // Check if member already exists
        const exists = incident.team.some(m => m.pseudonym === member.pseudonym)
        if (exists) {
          // Update existing member
          return {
            incidents: state.incidents.map(inc =>
              inc.id === incidentId
                ? {
                    ...inc,
                    team: inc.team.map(m =>
                      m.pseudonym === member.pseudonym ? member : m
                    )
                  }
                : inc
            )
          }
        }

        // Add new member
        return {
          incidents: state.incidents.map(inc =>
            inc.id === incidentId
              ? { ...inc, team: [...inc.team, member] }
              : inc
          )
        }
      })
    },

    /**
     * Remove a team member from an incident
     */
    removeTeamMember: (incidentId: string, pseudonym: string) => {
      set(state => ({
        incidents: state.incidents.map(inc =>
          inc.id === incidentId
            ? { ...inc, team: inc.team.filter(m => m.pseudonym !== pseudonym) }
            : inc
        )
      }))
    },

    /**
     * Update a team member's status
     */
    updateTeamMemberStatus: (
      incidentId: string, 
      pseudonym: string, 
      status: TeamMember['status']
    ) => {
      set(state => ({
        incidents: state.incidents.map(inc =>
          inc.id === incidentId
            ? {
                ...inc,
                team: inc.team.map(m =>
                  m.pseudonym === pseudonym ? { ...m, status } : m
                )
              }
            : inc
        )
      }))
    },

    /**
     * Trigger withdrawal protocol for an incident
     */
    triggerWithdrawal: (incidentId: string, reason: string) => {
      set(state => ({
        incidents: state.incidents.map(inc =>
          inc.id === incidentId
            ? { 
                ...inc, 
                withdrawalTriggered: true, 
                status: 'withdrawal',
                description: `${inc.description}\n[WITHDRAWAL TRIGGERED: ${reason}]`
              }
            : inc
        )
      }))
    },

    /**
     * Get the currently active incident
     */
    getActiveIncident: () => {
      const state = get()
      if (!state.activeIncidentId) return null
      return findById(state.incidents, state.activeIncidentId) || null
    },

    /**
     * Get an incident by ID
     */
    getIncidentById: (id: string) => {
      return findById(get().incidents, id)
    },

    /**
     * Get all open (non-closed) incidents
     */
    getOpenIncidents: () => {
      const closedStatuses: IncidentStatus[] = ['resolved', 'closed']
      return get().incidents.filter(
        inc => !closedStatuses.includes(inc.status)
      )
    },

    /**
     * Get incidents filtered by status
     */
    getIncidentsByStatus: (status: IncidentStatus) => {
      return get().incidents.filter(inc => inc.status === status)
    }
  })
)
