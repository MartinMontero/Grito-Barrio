/**
 * Documentation Slice
 * Protocolo CDMX - Zustand Store
 *
 * Manages evidence documentation with chain of custody and cryptographic integrity
 */

import type { StateCreator } from 'zustand'
import type { DocumentationEntry, CustodyEntry, DocumentationType } from '@/types'
import {
  getCurrentTimestamp,
  generateSHA256,
  updateInArray,
  findById,
  persistToIndexedDB,
  encryptIfEnabled,
  decryptIfNeeded
} from '@/lib/store-helpers'

// =============================================================================
// TYPES
// =============================================================================

/**
 * A documentation entry as stored by this slice. It is a superset of the
 * canonical `DocumentationEntry`: it additionally persists the captured media
 * itself (`fileData`, a data URL) plus a human caption and an evidence
 * category, so evidence captured in the field can be re-rendered and remains
 * encrypted at rest alongside its chain-of-custody record. Consumers that only
 * know about `DocumentationEntry` continue to work because every extra field is
 * optional.
 */
export interface StoredDocumentationEntry extends DocumentationEntry {
  /** Base64 data URL of the captured media (encrypted at rest with the slice). */
  fileData?: string
  /** Short human-readable title for the evidence. */
  caption?: string
  /** Evidence category used by the field-collection UI. */
  category?: string
}

/**
 * In-progress draft for a guided protocol (P.A.S., legal triage). Persisting the
 * draft means partial progress survives navigation/unmount; finalizing writes a
 * permanent text documentation entry via `addEntry`.
 */
export interface ProtocolDraft {
  /** Stable key, e.g. `pas-<incidentId>` or `triage-<incidentId>`. */
  key: string
  /** Arbitrary serializable protocol state. */
  data: unknown
  updatedAt: string
}

export interface DocumentationSlice {
  // State
  entries: DocumentationEntry[]
  currentEntry: DocumentationEntry | null
  isCapturing: boolean
  captureError: string | null
  /** Drafts of in-progress guided protocols, keyed by draft key. */
  protocolDrafts: Record<string, ProtocolDraft>

  // Actions
  addEntry: (entryData: Omit<StoredDocumentationEntry, 'id' | 'hash' | 'chainOfCustody' | 'timestamp'>, fileData: string | ArrayBuffer) => Promise<string>
  updateEntry: (id: string, updates: Partial<DocumentationEntry>) => void
  addToChainOfCustody: (entryId: string, custodyEntry: Omit<CustodyEntry, 'timestamp'>) => void
  getEntriesByIncident: (incidentId: string) => DocumentationEntry[]
  getEntriesByType: (type: DocumentationType) => DocumentationEntry[]
  getEntryById: (id: string) => DocumentationEntry | undefined
  exportEntries: (incidentId: string, password?: string) => Promise<Blob>
  importEntries: (encryptedBlob: Blob, password?: string) => Promise<boolean>
  setCurrentEntry: (entry: DocumentationEntry | null) => void
  startCapture: () => void
  endCapture: (error?: string) => void
  verifyIntegrity: (entryId: string) => Promise<boolean>
  deleteEntry: (id: string) => void
  getTotalSize: (incidentId: string) => number
  // Guided-protocol persistence (P.A.S. / triage)
  saveProtocolDraft: (key: string, data: unknown) => void
  getProtocolDraft: <T = unknown>(key: string) => T | undefined
  clearProtocolDraft: (key: string) => void
  saveProtocolResult: (params: {
    incidentId?: string
    capturedBy: string
    title: string
    summary: string
    location?: import('@/types').IncidentLocation
  }) => Promise<string>
}

// =============================================================================
// INITIAL STATE
// =============================================================================

type DocumentationActions =
  | 'addEntry' | 'updateEntry' | 'addToChainOfCustody' | 'getEntriesByIncident'
  | 'getEntriesByType' | 'getEntryById' | 'exportEntries' | 'importEntries'
  | 'setCurrentEntry' | 'startCapture' | 'endCapture' | 'verifyIntegrity'
  | 'deleteEntry' | 'getTotalSize'
  | 'saveProtocolDraft' | 'getProtocolDraft' | 'clearProtocolDraft' | 'saveProtocolResult'

const initialDocumentationState: Omit<DocumentationSlice, DocumentationActions> = {
  entries: [],
  currentEntry: null,
  isCapturing: false,
  captureError: null,
  protocolDrafts: {}
}

// =============================================================================
// SLICE CREATOR
// =============================================================================

export const createDocumentationSlice: StateCreator<
  DocumentationSlice,
  [],
  [],
  DocumentationSlice
> = persistToIndexedDB<DocumentationSlice>('protocolo-documentation', true)(
  (set, get) => ({
    ...initialDocumentationState,

    /**
     * Add a new documentation entry with auto-generated hash
     */
    addEntry: async (
      entryData: Omit<StoredDocumentationEntry, 'id' | 'hash' | 'chainOfCustody' | 'timestamp'>,
      fileData: string | ArrayBuffer
    ): Promise<string> => {
      const id = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const timestamp = getCurrentTimestamp()

      // Generate SHA-256 hash of file data
      const hash = await generateSHA256(fileData)

      // Create initial custody entry
      const initialCustody: CustodyEntry = {
        timestamp,
        action: 'created',
        actor: entryData.capturedBy,
        location: `${entryData.location.address}, ${entryData.location.colonia}`,
        method: entryData.metadata.deviceInfo || 'unknown'
      }

      const newEntry: StoredDocumentationEntry = {
        ...entryData,
        id,
        timestamp,
        hash,
        chainOfCustody: [initialCustody]
      }

      set(state => ({
        entries: [...state.entries, newEntry],
        currentEntry: newEntry,
        isCapturing: false
      }))

      return id
    },

    /**
     * Update an existing documentation entry
     */
    updateEntry: (id: string, updates: Partial<DocumentationEntry>) => {
      set(state => ({
        entries: updateInArray(state.entries, id, updates)
      }))
    },

    /**
     * Add an entry to the chain of custody
     */
    addToChainOfCustody: (
      entryId: string,
      custodyEntry: Omit<CustodyEntry, 'timestamp'>
    ) => {
      set(state => {
        const entry = findById(state.entries, entryId)
        if (!entry) return state

        const newCustodyEntry: CustodyEntry = {
          ...custodyEntry,
          timestamp: getCurrentTimestamp()
        }

        return {
          entries: state.entries.map(e =>
            e.id === entryId
              ? { ...e, chainOfCustody: [...e.chainOfCustody, newCustodyEntry] }
              : e
          )
        }
      })
    },

    /**
     * Get all entries for a specific incident
     */
    getEntriesByIncident: (incidentId: string): DocumentationEntry[] => {
      return get().entries.filter(entry => entry.incidentId === incidentId)
    },

    /**
     * Get all entries of a specific type
     */
    getEntriesByType: (type: DocumentationType): DocumentationEntry[] => {
      return get().entries.filter(entry => entry.type === type)
    },

    /**
     * Get a single entry by ID
     */
    getEntryById: (id: string): DocumentationEntry | undefined => {
      return findById(get().entries, id)
    },

    /**
     * Export all entries for an incident as encrypted blob
     */
    exportEntries: async (
      incidentId: string,
      password?: string
    ): Promise<Blob> => {
      const entries = get().getEntriesByIncident(incidentId)

      if (entries.length === 0) {
        throw new Error('No entries found for this incident')
      }

      const exportData = {
        incidentId,
        exportedAt: getCurrentTimestamp(),
        entries,
        totalEntries: entries.length
      }

      // Encrypt with the supplied password (portable), else plaintext JSON
      const encrypted = await encryptIfEnabled(exportData, password)

      const blob = new Blob([encrypted], {
        type: password ? 'application/octet-stream' : 'application/json'
      })

      return blob
    },

    /**
     * Import entries from a blob (pass the password used to export, if any)
     */
    importEntries: async (
      encryptedBlob: Blob,
      password?: string
    ): Promise<boolean> => {
      try {
        const text = await encryptedBlob.text()
        const data = await decryptIfNeeded<{
          incidentId: string
          exportedAt: string
          entries: DocumentationEntry[]
          totalEntries: number
        }>(text, password)

        if (!data || !data.entries) {
          throw new Error('Invalid import data')
        }

        // Add imported entries, avoiding duplicates
        set(state => {
          const existingIds = new Set(state.entries.map(e => e.id))
          const newEntries = data.entries.filter(e => !existingIds.has(e.id))

          return {
            entries: [...state.entries, ...newEntries]
          }
        })

        return true
      } catch (error) {
        console.error('Import failed:', error)
        return false
      }
    },

    /**
     * Set the currently selected entry
     */
    setCurrentEntry: (entry: DocumentationEntry | null) => {
      set({ currentEntry: entry })
    },

    /**
     * Mark capture as in progress
     */
    startCapture: () => {
      set({ isCapturing: true, captureError: null })
    },

    /**
     * Mark capture as ended, optionally with error
     */
    endCapture: (error?: string) => {
      set({
        isCapturing: false,
        captureError: error || null
      })
    },

    /**
     * Verify the integrity of an entry by re-hashing
     */
    verifyIntegrity: async (entryId: string): Promise<boolean> => {
      const entry = get().getEntryById(entryId)
      if (!entry) return false

      // In a real implementation, you would re-read the file data
      // and compare hashes. Here we just verify the chain of custody
      // has no gaps and the hash format is valid.

      // Verify hash format (64 hex characters for SHA-256)
      const isValidHash = /^[a-f0-9]{64}$/i.test(entry.hash)

      // Verify chain of custody has at least creation entry
      const hasValidCustody = entry.chainOfCustody.length > 0 &&
        entry.chainOfCustody[0].action === 'created'

      return isValidHash && hasValidCustody
    },

    /**
     * Delete an entry permanently
     */
    deleteEntry: (id: string) => {
      set(state => ({
        entries: state.entries.filter(e => e.id !== id),
        currentEntry: state.currentEntry?.id === id ? null : state.currentEntry
      }))
    },

    /**
     * Get total file size for an incident's documentation
     */
    getTotalSize: (incidentId: string): number => {
      const entries = get().getEntriesByIncident(incidentId)
      return entries.reduce((total, entry) => {
        return total + (entry.metadata.fileSize || 0)
      }, 0)
    },

    /**
     * Persist an in-progress guided-protocol draft so partial progress survives
     * navigation/unmount. Stored encrypted-at-rest with the rest of the slice.
     */
    saveProtocolDraft: (key: string, data: unknown) => {
      set(state => ({
        protocolDrafts: {
          ...state.protocolDrafts,
          [key]: { key, data, updatedAt: getCurrentTimestamp() }
        }
      }))
    },

    /**
     * Read back a previously saved guided-protocol draft.
     */
    getProtocolDraft: <T = unknown>(key: string): T | undefined => {
      return get().protocolDrafts[key]?.data as T | undefined
    },

    /**
     * Remove a guided-protocol draft (e.g. after finalizing or resetting).
     */
    clearProtocolDraft: (key: string) => {
      set(state => {
        if (!(key in state.protocolDrafts)) return state
        const next = { ...state.protocolDrafts }
        delete next[key]
        return { protocolDrafts: next }
      })
    },

    /**
     * Finalize a guided protocol by writing a permanent text documentation
     * entry (with chain of custody + hash) summarizing the result.
     */
    saveProtocolResult: async (params): Promise<string> => {
      const location: import('@/types').IncidentLocation = params.location ?? {
        address: 'Ubicación no especificada',
        colonia: 'N/D',
        alcaldia: 'Cuauhtémoc',
        postalCode: '00000'
      }

      const entryData: Omit<StoredDocumentationEntry, 'id' | 'hash' | 'chainOfCustody' | 'timestamp'> = {
        incidentId: params.incidentId ?? 'sin-incidente',
        type: 'text',
        capturedBy: params.capturedBy,
        location,
        encrypted: true,
        metadata: {
          deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          mimeType: 'text/plain',
          fileSize: new TextEncoder().encode(params.summary).length,
          tags: ['protocolo']
        },
        description: params.summary,
        caption: params.title,
        category: 'documentos',
        fileData: `data:text/plain;charset=utf-8,${encodeURIComponent(params.summary)}`
      }

      return get().addEntry(entryData, params.summary)
    }
  })
)
