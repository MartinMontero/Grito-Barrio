/**
 * Protocolo CDMX - Zustand Store
 * Combined Store with All Slices
 * 
 * Main entry point for all state management in the Protocolo CDMX app.
 * Combines incident, user, checklist, documentation, settings, and resources slices.
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { encryptData, decryptData } from '@/lib/encryption'

// Import slice creators
import { createIncidentSlice, type IncidentSlice, type AlertData, type IncidentHistoryEntry } from './incidentSlice'
import { createUserSlice, type UserSlice } from './userSlice'
import { createChecklistSlice, type ChecklistSlice } from './checklistSlice'
import { createDocumentationSlice, type DocumentationSlice } from './documentationSlice'
import { createSettingsSlice, type SettingsSlice, type AppSettings, type SecuritySettings, type AppLanguage, type DataExport } from './settingsSlice'
import { createResourcesSlice, type ResourcesSlice, type ResourcesState } from './resourcesSlice'

// =============================================================================
// COMBINED STORE TYPE
// =============================================================================

export type ProtocoloStore = 
  IncidentSlice & 
  UserSlice & 
  ChecklistSlice & 
  DocumentationSlice & 
  SettingsSlice & 
  ResourcesSlice

// =============================================================================
// STORE CREATION
// =============================================================================

export const useProtocoloStore = create<ProtocoloStore>()(
  devtools(
    (...args) => ({
      ...(createIncidentSlice as any)(...args),
      ...(createUserSlice as any)(...args),
      ...(createChecklistSlice as any)(...args),
      ...(createDocumentationSlice as any)(...args),
      ...(createSettingsSlice as any)(...args),
      ...(createResourcesSlice as any)(...args)
    }),
    { name: 'ProtocoloStore' }
  )
)

// =============================================================================
// SELECTOR HOOKS
// =============================================================================

/**
 * Hook to get the currently active incident
 */
export const useActiveIncident = () => 
  useProtocoloStore(state => state.getActiveIncident())

/**
 * Hook to get all open incidents
 */
export const useOpenIncidents = () => 
  useProtocoloStore(state => state.getOpenIncidents())

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = () => 
  useProtocoloStore(state => state.isAuthenticated)

/**
 * Hook to get current user
 */
export const useCurrentUser = () => 
  useProtocoloStore(state => state.currentUser)

/**
 * Hook to get checklist progress for an incident
 */
export const useChecklistProgress = (incidentId: string) => 
  useProtocoloStore(state => state.getProgress(incidentId))

/**
 * Hook to get documentation entries for an incident
 */
export const useIncidentDocumentation = (incidentId: string) => 
  useProtocoloStore(state => state.getEntriesByIncident(incidentId))

/**
 * Hook to check if encryption is enabled
 */
export const useEncryptionEnabled = () => 
  useProtocoloStore(state => state.settings.encryptionEnabled)

/**
 * Hook to get emergency contacts
 */
export const useEmergencyContacts = () => 
  useProtocoloStore(state => state.getEmergencyContacts())

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Initialize a new incident with all related data
 */
export async function initializeNewIncident(
  alertData: AlertData,
  createdBy: string
): Promise<string> {
  const store = useProtocoloStore.getState()
  
  // Create incident
  const incidentId = store.createIncident(alertData)
  
  // Initialize checklist for the incident
  store.initializeChecklist(incidentId)
  
  // Log the action
  console.log(`[${getCurrentTimestamp()}] Incident ${incidentId} created by ${createdBy}`)
  
  return incidentId
}

/**
 * Close an incident and clean up related data
 */
export function closeIncidentComprehensive(
  incidentId: string,
  reason: string,
  outcome: IncidentHistoryEntry['outcome']
): void {
  const store = useProtocoloStore.getState()
  
  // Export documentation before closing
  store.exportEntries(incidentId)
    .then(blob => {
      // In real app, would save this blob
      console.log(`Documentation exported for ${incidentId}`)
    })
    .catch(error => {
      console.error(`Failed to export documentation:`, error)
    })
  
  // Close the incident
  store.closeIncident(incidentId, reason, outcome)
}

/**
 * Create a comprehensive backup of all data. If `password` is supplied the
 * backup file is encrypted (PBKDF2 + AES-GCM) so it is portable to another
 * device; otherwise it is plaintext JSON (the caller/UI must disclose this).
 */
export async function createComprehensiveBackup(password?: string): Promise<Blob> {
  const store = useProtocoloStore.getState()

  const backup = {
    version: '1.0.0',
    timestamp: getCurrentTimestamp(),
    settings: store.settings,
    security: {
      ...store.security,
      duressPassword: undefined // Never back up the duress password
    },
    incidents: store.incidents,
    incidentHistory: store.incidentHistory,
    checklists: store.checklists,
    documentation: store.entries,
    resources: {
      safePoints: store.safePoints,
      contacts: store.contacts,
      supplies: store.supplies
    }
  }

  const serialized = JSON.stringify(backup)
  const payload = password ? await encryptData(serialized, password) : serialized

  return new Blob([payload], {
    type: password ? 'application/octet-stream' : 'application/json'
  })
}

/**
 * Restore from a comprehensive backup. Pass the same `password` used to create
 * it (omit for a plaintext backup).
 */
export async function restoreFromComprehensiveBackup(blob: Blob, password?: string): Promise<boolean> {
  const store = useProtocoloStore.getState()

  try {
    const text = await blob.text()
    const json = password ? await decryptData(text, password) : text
    const data = JSON.parse(json)

    if (!data || data.version !== '1.0.0') {
      throw new Error('Invalid or incompatible backup file')
    }

    // Restore slices that support structured import
    if (data.settings) await store.importData(blob, password)
    if (data.resources) store.importResources(data.resources)

    return true
  } catch (error) {
    console.error('Restore failed:', error)
    return false
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getCurrentTimestamp(): string {
  return new Date().toISOString()
}

// =============================================================================
// EXPORT ALL TYPES
// =============================================================================

export type {
  // Incident types
  IncidentSlice,
  AlertData,
  IncidentHistoryEntry,
  
  // User types
  UserSlice,
  
  // Checklist types
  ChecklistSlice,
  
  // Documentation types
  DocumentationSlice,
  
  // Settings types
  SettingsSlice,
  AppSettings,
  SecuritySettings,
  AppLanguage,
  DataExport,
  
  // Resources types
  ResourcesSlice,
  ResourcesState
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default useProtocoloStore
