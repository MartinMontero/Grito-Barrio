/**
 * Contact Types
 * Protocolo CDMX
 * 
 * TypeScript definitions for contact management system
 */

export type ContactCategory = 
  | 'brigada'      // Brigade members
  | 'emergencias'  // Emergency services (C5, ERUM, Cruz Roja)
  | 'ddhh'         // Derechos Humanos (CDHCM, CNDH)
  | 'legal'        // Legal support
  | 'coalicion'    // Coalition partners
  | 'prensa'       // Media contacts
  | 'albergues'    // Safe houses/shelters
  | 'medicos'      // Medical professionals
  | 'transporte'   // Transportation
  | 'otros'        // Others

export type ContactPriority = 1 | 2 | 3 | 4 | 5  // 1 = highest

export type AvailabilityStatus = 
  | 'available' 
  | 'busy' 
  | 'unavailable' 
  | 'on_call'
  | 'scheduled'

export interface Contact {
  id: string
  name: string
  pseudonym?: string  // For brigade members
  category: ContactCategory
  role: string
  organization?: string
  phones: {
    number: string
    type: 'mobile' | 'landline' | 'whatsapp' | 'signal'
    primary: boolean
  }[]
  emails: {
    address: string
    primary: boolean
  }[]
  priority: ContactPriority
  availability: {
    status: AvailabilityStatus
    hours?: string
    notes?: string
  }
  notes?: string
  isFavorite: boolean
  lastContacted?: string
  createdAt: string
  updatedAt: string
}

export interface ContactTreeNode {
  id: string
  contactId: string
  level: number
  parentId: string | null
  role: string
  status: 'online' | 'offline' | 'dispatched' | 'on_scene' | 'standby'
  responseTime?: number  // minutes
  children: ContactTreeNode[]
}

export interface ContactTree {
  id: string
  name: string
  incidentId?: string
  root: ContactTreeNode
  createdAt: string
  updatedAt: string
}

export interface CommunicationLog {
  id: string
  timestamp: string
  contactId: string
  type: 'call' | 'sms' | 'whatsapp' | 'email' | 'signal'
  direction: 'outgoing' | 'incoming'
  content?: string
  duration?: number  // seconds for calls
  outcome: 'completed' | 'failed' | 'no_answer' | 'voicemail' | 'busy'
  notes?: string
}

export interface MessageTemplate {
  id: string
  name: string
  category: 'alert' | 'request' | 'response' | 'documentation' | 'custom'
  content: string
  variables: string[]
  isDefault: boolean
  usageCount: number
  createdAt: string
}

export interface QuickDialConfig {
  id: string
  name: string
  number: string
  icon: string
  color: string
  category: ContactCategory
  requiresConfirmation: boolean
}

export const CONTACT_CATEGORIES: Record<ContactCategory, { label: string; color: string; icon: string }> = {
  brigada: { label: 'Brigada', color: 'bg-blue-500', icon: 'Users' },
  emergencias: { label: 'Emergencias', color: 'bg-red-500', icon: 'Phone' },
  ddhh: { label: 'Derechos Humanos', color: 'bg-purple-500', icon: 'Shield' },
  legal: { label: 'Legal', color: 'bg-indigo-500', icon: 'Scale' },
  coalicion: { label: 'Coalición', color: 'bg-green-500', icon: 'HandHeart' },
  prensa: { label: 'Prensa', color: 'bg-yellow-500', icon: 'Newspaper' },
  albergues: { label: 'Albergues', color: 'bg-orange-500', icon: 'Home' },
  medicos: { label: 'Médicos', color: 'bg-pink-500', icon: 'Heart' },
  transporte: { label: 'Transporte', color: 'bg-gray-500', icon: 'Truck' },
  otros: { label: 'Otros', color: 'bg-gray-400', icon: 'User' }
}

export const PRIORITY_LABELS: Record<ContactPriority, string> = {
  1: 'Crítica',
  2: 'Alta',
  3: 'Media',
  4: 'Baja',
  5: 'Referencia'
}
