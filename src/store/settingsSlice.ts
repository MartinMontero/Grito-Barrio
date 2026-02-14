/**
 * Settings Slice
 * Protocolo CDMX - Zustand Store
 *
 * Manages app settings, security features, and data management
 */

import type { StateCreator } from 'zustand'
import type { EmergencyPhase } from '@/types'
import {
  getCurrentTimestamp,
  persistToLocalStorage,
  persistToIndexedDB,
  encryptIfEnabled,
  decryptIfNeeded
} from '@/lib/store-helpers'

// =============================================================================
// TYPES
// =============================================================================

export type AppLanguage = 'es' | 'es-MX' | 'nah'

export interface AppSettings {
  encryptionEnabled: boolean
  offlineMode: boolean
  language: AppLanguage
  panicDelay: number // seconds
  biometricEnabled: boolean
  autoSync: boolean
  theme: 'light' | 'dark' | 'system'
  notificationsEnabled: boolean
  locationTracking: boolean
  audioRecordingEnabled: boolean
  highQualityMedia: boolean
}

export interface SecuritySettings {
  duressPassword: string | null
  duressModeActive: boolean
  pinLength: number
  autoLockTimeout: number // minutes
  wipeDataAfterFailedAttempts: number
}

export interface DataExport {
  version: string
  exportedAt: string
  settings: AppSettings
  security: Omit<SecuritySettings, 'duressPassword'>
  incidents: unknown[]
  checklists: unknown
  documentation: unknown[]
  resources: unknown
}

export interface SettingsSlice {
  // State
  settings: AppSettings
  security: SecuritySettings
  isDuressMode: boolean
  lastBackupAt: string | null
  backupInProgress: boolean
  importInProgress: boolean

  // Actions
  toggleEncryption: () => void
  toggleOfflineMode: () => void
  setLanguage: (language: AppLanguage) => void
  setDuressPassword: (password: string) => void
  clearDuressPassword: () => void
  activateDuressMode: () => void
  deactivateDuressMode: () => void
  checkDuressPassword: (password: string) => boolean
  setPanicDelay: (delay: number) => void
  toggleBiometric: () => void
  toggleAutoSync: () => void
  setTheme: (theme: AppSettings['theme']) => void
  toggleNotifications: () => void
  toggleLocationTracking: () => void
  toggleAudioRecording: () => void
  toggleHighQualityMedia: () => void
  setAutoLockTimeout: (minutes: number) => void
  setWipeDataThreshold: (attempts: number) => void
  exportAllData: (encryptionEnabled: boolean) => Promise<Blob>
  importData: (encryptedBlob: Blob, encryptionEnabled: boolean) => Promise<boolean>
  resetAllSettings: () => void
  createBackup: () => Promise<boolean>
  restoreFromBackup: (backupBlob: Blob) => Promise<boolean>
  getStorageUsage: () => { used: number; available: number }
  clearAllData: () => Promise<boolean>
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const defaultAppSettings: AppSettings = {
  encryptionEnabled: true,
  offlineMode: false,
  language: 'es-MX',
  panicDelay: 3,
  biometricEnabled: false,
  autoSync: true,
  theme: 'system',
  notificationsEnabled: true,
  locationTracking: true,
  audioRecordingEnabled: true,
  highQualityMedia: true
}

const defaultSecuritySettings: SecuritySettings = {
  duressPassword: null,
  duressModeActive: false,
  pinLength: 4,
  autoLockTimeout: 5,
  wipeDataAfterFailedAttempts: 10
}

const initialSettingsState: Omit<SettingsSlice, keyof SettingsSlice> = {
  settings: defaultAppSettings,
  security: defaultSecuritySettings,
  isDuressMode: false,
  lastBackupAt: null,
  backupInProgress: false,
  importInProgress: false
}

// =============================================================================
// SLICE CREATOR
// =============================================================================

export const createSettingsSlice: StateCreator<
  SettingsSlice,
  [['zustand/persist', unknown]],
  [],
  SettingsSlice
> = persistToLocalStorage<SettingsSlice>('protocolo-settings')(
  (set, get) => ({
    ...initialSettingsState,

    /**
     * Toggle encryption on/off
     */
    toggleEncryption: () => {
      set(state => ({
        settings: {
          ...state.settings,
          encryptionEnabled: !state.settings.encryptionEnabled
        }
      }))
    },

    /**
     * Toggle offline mode
     */
    toggleOfflineMode: () => {
      set(state => ({
        settings: {
          ...state.settings,
          offlineMode: !state.settings.offlineMode
        }
      }))
    },

    /**
     * Set app language
     */
    setLanguage: (language: AppLanguage) => {
      set(state => ({
        settings: {
          ...state.settings,
          language
        }
      }))
    },

    /**
     * Set duress password
     */
    setDuressPassword: (password: string) => {
      set(state => ({
        security: {
          ...state.security,
          duressPassword: password
        }
      }))
    },

    /**
     * Clear duress password
     */
    clearDuressPassword: () => {
      set(state => ({
        security: {
          ...state.security,
          duressPassword: null,
          duressModeActive: false
        }
      }))
    },

    /**
     * Activate duress mode (hides sensitive data, appears normal)
     */
    activateDuressMode: () => {
      set({
        isDuressMode: true,
        security: {
          ...get().security,
          duressModeActive: true
        }
      })
    },

    /**
     * Deactivate duress mode
     */
    deactivateDuressMode: () => {
      set({
        isDuressMode: false,
        security: {
          ...get().security,
          duressModeActive: false
        }
      })
    },

    /**
     * Check if entered password is the duress password
     */
    checkDuressPassword: (password: string): boolean => {
      const { security } = get()
      return security.duressPassword === password
    },

    /**
     * Set panic button delay
     */
    setPanicDelay: (delay: number) => {
      set(state => ({
        settings: {
          ...state.settings,
          panicDelay: Math.max(0, Math.min(10, delay))
        }
      }))
    },

    /**
     * Toggle biometric authentication
     */
    toggleBiometric: () => {
      set(state => ({
        settings: {
          ...state.settings,
          biometricEnabled: !state.settings.biometricEnabled
        }
      }))
    },

    /**
     * Toggle auto-sync
     */
    toggleAutoSync: () => {
      set(state => ({
        settings: {
          ...state.settings,
          autoSync: !state.settings.autoSync
        }
      }))
    },

    /**
     * Set app theme
     */
    setTheme: (theme: AppSettings['theme']) => {
      set(state => ({
        settings: {
          ...state.settings,
          theme
        }
      }))
    },

    /**
     * Toggle notifications
     */
    toggleNotifications: () => {
      set(state => ({
        settings: {
          ...state.settings,
          notificationsEnabled: !state.settings.notificationsEnabled
        }
      }))
    },

    /**
     * Toggle location tracking
     */
    toggleLocationTracking: () => {
      set(state => ({
        settings: {
          ...state.settings,
          locationTracking: !state.settings.locationTracking
        }
      }))
    },

    /**
     * Toggle audio recording
     */
    toggleAudioRecording: () => {
      set(state => ({
        settings: {
          ...state.settings,
          audioRecordingEnabled: !state.settings.audioRecordingEnabled
        }
      }))
    },

    /**
     * Toggle high quality media capture
     */
    toggleHighQualityMedia: () => {
      set(state => ({
        settings: {
          ...state.settings,
          highQualityMedia: !state.settings.highQualityMedia
        }
      }))
    },

    /**
     * Set auto-lock timeout
     */
    setAutoLockTimeout: (minutes: number) => {
      set(state => ({
        security: {
          ...state.security,
          autoLockTimeout: Math.max(1, Math.min(60, minutes))
        }
      }))
    },

    /**
     * Set data wipe threshold after failed attempts
     */
    setWipeDataThreshold: (attempts: number) => {
      set(state => ({
        security: {
          ...state.security,
          wipeDataAfterFailedAttempts: Math.max(5, Math.min(20, attempts))
        }
      }))
    },

    /**
     * Export all app data
     */
    exportAllData: async (encryptionEnabled: boolean): Promise<Blob> => {
      set({ backupInProgress: true })

      try {
        // Gather all data from different slices
        // Note: In a real implementation, you'd get this from the other slices
        const exportData: DataExport = {
          version: '1.0.0',
          exportedAt: getCurrentTimestamp(),
          settings: get().settings,
          security: {
            ...get().security,
            duressPassword: undefined // Never export duress password
          },
          incidents: [], // Would come from incident slice
          checklists: {}, // Would come from checklist slice
          documentation: [], // Would come from documentation slice
          resources: {} // Would come from resources slice
        }

        const encrypted = encryptIfEnabled(exportData, encryptionEnabled)

        const blob = new Blob([encrypted], {
          type: encryptionEnabled ? 'application/encrypted' : 'application/json'
        })

        set({
          lastBackupAt: getCurrentTimestamp(),
          backupInProgress: false
        })

        return blob
      } catch (error) {
        set({ backupInProgress: false })
        throw error
      }
    },

    /**
     * Import data from encrypted blob
     */
    importData: async (encryptedBlob: Blob, encryptionEnabled: boolean): Promise<boolean> => {
      set({ importInProgress: true })

      try {
        const text = await encryptedBlob.text()
        const data = decryptIfNeeded<DataExport>(text, encryptionEnabled)

        if (!data || !data.version) {
          throw new Error('Invalid import file')
        }

        // Validate version compatibility
        if (!data.version.startsWith('1.')) {
          throw new Error('Incompatible backup version')
        }

        // Restore settings
        if (data.settings) {
          set(state => ({
            settings: { ...state.settings, ...data.settings }
          }))
        }

        // Note: Other data would be restored to their respective slices

        set({ importInProgress: false })
        return true
      } catch (error) {
        console.error('Import failed:', error)
        set({ importInProgress: false })
        return false
      }
    },

    /**
     * Reset all settings to defaults
     */
    resetAllSettings: () => {
      set({
        settings: defaultAppSettings,
        security: defaultSecuritySettings,
        isDuressMode: false
      })
    },

    /**
     * Create a backup
     */
    createBackup: async (): Promise<boolean> => {
      try {
        const blob = await get().exportAllData(get().settings.encryptionEnabled)

        // In a real app, you'd save this to a file or cloud storage
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `protocolo-backup-${getCurrentTimestamp().split('T')[0]}.backup`
        a.click()
        URL.revokeObjectURL(url)

        return true
      } catch (error) {
        console.error('Backup failed:', error)
        return false
      }
    },

    /**
     * Restore from backup file
     */
    restoreFromBackup: async (backupBlob: Blob): Promise<boolean> => {
      return get().importData(backupBlob, get().settings.encryptionEnabled)
    },

    /**
     * Get storage usage statistics
     */
    getStorageUsage: (): { used: number; available: number } => {
      // This is a simplified implementation
      // In a real app, you'd use navigator.storage.estimate()

      const used = JSON.stringify(localStorage).length +
        JSON.stringify(get()).length

      return {
        used,
        available: 10 * 1024 * 1024 // Assume 10MB for example
      }
    },

    /**
     * Clear all app data
     */
    clearAllData: async (): Promise<boolean> => {
      try {
        localStorage.clear()
        // Note: IndexedDB clearing would happen in a real implementation
        set(initialSettingsState)
        return true
      } catch (error) {
        console.error('Clear data failed:', error)
        return false
      }
    }
  })
)
