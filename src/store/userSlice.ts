/**
 * User Slice
 * Protocolo CDMX - Zustand Store
 * 
 * Manages user authentication, profiles, and training records
 */

import type { StateCreator } from 'zustand'
import type { 
  ExtendedUserProfile, 
  UserRole, 
  CertificationLevel,
  TrainingModule 
} from '@/types'
import { 
  getCurrentTimestamp,
  persistToLocalStorage
} from '@/lib/store-helpers'
import { hashData } from '@/lib/encryption'

// =============================================================================
// TYPES
// =============================================================================

export interface UserSlice {
  // State
  currentUser: ExtendedUserProfile | null
  isAuthenticated: boolean
  lastLoginAt: string | null
  loginAttempts: number
  lockedUntil: string | null
  
  // Actions
  login: (pseudonym: string, pin: string) => Promise<boolean>
  logout: () => void
  updateRole: (role: UserRole) => void
  updateCertification: (level: CertificationLevel) => void
  completeTraining: (moduleId: string, moduleName: string) => void
  updateUserProfile: (updates: Partial<ExtendedUserProfile>) => void
  setOperationalStatus: (status: ExtendedUserProfile['operationalStatus']) => void
  incrementLoginAttempts: () => void
  resetLoginAttempts: () => void
  getUserByPseudonym: (pseudonym: string) => ExtendedUserProfile | null
  hasCompletedTraining: (moduleId: string) => boolean
  isTrainingValid: (moduleId: string) => boolean
}

// =============================================================================
// MOCK USER DATABASE (In real app, this would come from a secure backend)
// =============================================================================

// Pre-registered users (in production, this comes from encrypted storage)
const MOCK_USERS: Record<string, { pinHash: string; user: ExtendedUserProfile }> = {
  'comandante': {
    pinHash: hashData('1234'),
    user: {
      pseudonym: 'comandante',
      role: 'coordinator',
      certificationLevel: 3,
      trainingCompleted: [],
      contactInfo: {
        secureContact: 'signal:comandante.cdmx',
        preferredMethod: 'signal'
      },
      operationalStatus: 'active',
      languages: ['es', 'en'],
      specializations: ['crisis_management', 'legal_coordination']
    }
  },
  'defensor1': {
    pinHash: hashData('5678'),
    user: {
      pseudonym: 'defensor1',
      role: 'legal',
      certificationLevel: 2,
      trainingCompleted: [],
      contactInfo: {
        secureContact: 'signal:defensor1.cdmx',
        preferredMethod: 'signal'
      },
      operationalStatus: 'active',
      languages: ['es'],
      specializations: ['human_rights', 'housing_law']
    }
  },
  'medico1': {
    pinHash: hashData('9012'),
    user: {
      pseudonym: 'medico1',
      role: 'medical',
      certificationLevel: 2,
      trainingCompleted: [],
      contactInfo: {
        secureContact: 'signal:medico1.cdmx',
        preferredMethod: 'signal'
      },
      operationalStatus: 'active',
      languages: ['es', 'nah'],
      specializations: ['first_aid', 'psychological_first_aid']
    }
  }
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialUserState: Omit<UserSlice, keyof UserSlice> = {
  currentUser: null,
  isAuthenticated: false,
  lastLoginAt: null,
  loginAttempts: 0,
  lockedUntil: null
}

// =============================================================================
// SLICE CREATOR
// =============================================================================

export const createUserSlice: StateCreator<
  UserSlice,
  [['zustand/persist', unknown]],
  [],
  UserSlice
> = persistToLocalStorage<UserSlice>('protocolo-user')(
  (set, get) => ({
    ...initialUserState,

    /**
     * Authenticate user with pseudonym and PIN
     * Returns true if successful, false otherwise
     */
    login: async (pseudonym: string, pin: string): Promise<boolean> => {
      const state = get()
      
      // Check if account is locked
      if (state.lockedUntil && new Date() < new Date(state.lockedUntil)) {
        console.error('Account locked until:', state.lockedUntil)
        return false
      }

      // Hash the provided PIN
      const pinHash = hashData(pin)
      
      // Look up user
      const userRecord = MOCK_USERS[pseudonym.toLowerCase()]
      
      if (!userRecord || userRecord.pinHash !== pinHash) {
        // Increment login attempts
        const newAttempts = state.loginAttempts + 1
        
        // Lock account after 5 failed attempts
        if (newAttempts >= 5) {
          const lockDuration = 15 * 60 * 1000 // 15 minutes
          set({
            loginAttempts: newAttempts,
            lockedUntil: new Date(Date.now() + lockDuration).toISOString()
          })
        } else {
          set({ loginAttempts: newAttempts })
        }
        
        return false
      }

      // Successful login
      set({
        currentUser: userRecord.user,
        isAuthenticated: true,
        lastLoginAt: getCurrentTimestamp(),
        loginAttempts: 0,
        lockedUntil: null
      })

      return true
    },

    /**
     * Log out current user
     */
    logout: () => {
      set({
        currentUser: null,
        isAuthenticated: false,
        lastLoginAt: null
      })
    },

    /**
     * Update the current user's role
     */
    updateRole: (role: UserRole) => {
      set(state => {
        if (!state.currentUser) return state
        
        return {
          currentUser: {
            ...state.currentUser,
            role
          }
        }
      })
    },

    /**
     * Update the current user's certification level
     */
    updateCertification: (level: CertificationLevel) => {
      set(state => {
        if (!state.currentUser) return state
        
        return {
          currentUser: {
            ...state.currentUser,
            certificationLevel: level
          }
        }
      })
    },

    /**
     * Mark a training module as completed
     */
    completeTraining: (moduleId: string, moduleName: string) => {
      set(state => {
        if (!state.currentUser) return state

        const existingModule = state.currentUser.trainingCompleted.find(
          m => m.moduleId === moduleId
        )

        let updatedTraining: TrainingModule[]

        if (existingModule) {
          // Update existing module
          updatedTraining = state.currentUser.trainingCompleted.map(m =>
            m.moduleId === moduleId
              ? {
                  ...m,
                  completedAt: getCurrentTimestamp(),
                  valid: true
                }
              : m
          )
        } else {
          // Add new module
          const newModule: TrainingModule = {
            moduleId,
            moduleName,
            completedAt: getCurrentTimestamp(),
            valid: true
          }
          updatedTraining = [...state.currentUser.trainingCompleted, newModule]
        }

        return {
          currentUser: {
            ...state.currentUser,
            trainingCompleted: updatedTraining,
            lastActive: getCurrentTimestamp()
          }
        }
      })
    },

    /**
     * Update user profile information
     */
    updateUserProfile: (updates: Partial<ExtendedUserProfile>) => {
      set(state => {
        if (!state.currentUser) return state

        return {
          currentUser: {
            ...state.currentUser,
            ...updates,
            lastActive: getCurrentTimestamp()
          }
        }
      })
    },

    /**
     * Set operational status
     */
    setOperationalStatus: (status: ExtendedUserProfile['operationalStatus']) => {
      set(state => {
        if (!state.currentUser) return state

        return {
          currentUser: {
            ...state.currentUser,
            operationalStatus: status,
            lastActive: getCurrentTimestamp()
          }
        }
      })
    },

    /**
     * Increment login attempt counter
     */
    incrementLoginAttempts: () => {
      set(state => ({
        loginAttempts: state.loginAttempts + 1
      }))
    },

    /**
     * Reset login attempt counter
     */
    resetLoginAttempts: () => {
      set({ loginAttempts: 0, lockedUntil: null })
    },

    /**
     * Get a user by pseudonym (from mock database)
     */
    getUserByPseudonym: (pseudonym: string): ExtendedUserProfile | null => {
      const userRecord = MOCK_USERS[pseudonym.toLowerCase()]
      return userRecord ? userRecord.user : null
    },

    /**
     * Check if current user has completed a specific training module
     */
    hasCompletedTraining: (moduleId: string): boolean => {
      const state = get()
      if (!state.currentUser) return false

      return state.currentUser.trainingCompleted.some(
        m => m.moduleId === moduleId && m.valid
      )
    },

    /**
     * Check if training is still valid (not expired)
     * (In real app, would check expiration dates)
     */
    isTrainingValid: (moduleId: string): boolean => {
      const state = get()
      if (!state.currentUser) return false

      const module = state.currentUser.trainingCompleted.find(
        m => m.moduleId === moduleId
      )

      if (!module) return false
      if (!module.valid) return false

      // Check if expired (example: expires after 1 year)
      if (module.expiresAt) {
        return new Date() < new Date(module.expiresAt)
      }

      return true
    }
  })
)
