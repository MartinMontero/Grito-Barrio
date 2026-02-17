/**
 * Store Usage Examples
 * Protocolo CDMX
 * 
 * Practical examples of how to use the Zustand store in your components
 */

import { useProtocoloStore } from './index'
import type { TeamMember } from '@/types'
import type { AlertData } from '@/store/incidentSlice'

// =============================================================================
// EXAMPLE 1: Creating a New Incident
// =============================================================================

export async function exampleCreateIncident() {
  const store = useProtocoloStore.getState()
  
  // Prepare alert data
  const alertData: AlertData = {
    location: {
      address: 'Av. Insurgentes Sur 1234, Col. Del Valle',
      colonia: 'Del Valle',
      alcaldia: 'Benito Juárez',
      postalCode: '03100',
      reference: 'Edificio azul, segundo piso'
    },
    alertSource: 'hotline',
    description: 'Desalojo ilegal en proceso. Fuerza pública presente sin orden judicial.',
    threatLevel: 'high',
    occupantsAtRisk: 8,
    minorsPresent: true,
    vulnerablePersons: true,
    authoritiesPresent: true,
    authorityTypes: ['police', 'private_security']
  }
  
  // Create incident
  const incidentId = store.createIncident(alertData)
  console.log(`Incident created: ${incidentId}`)
  // Output: CDMX-2024-01-15-1430-001
  
  // Initialize checklist
  store.initializeChecklist(incidentId)
  
  return incidentId
}

// =============================================================================
// EXAMPLE 2: Managing Team Members
// =============================================================================

export function exampleManageTeam(incidentId: string) {
  const store = useProtocoloStore.getState()
  
  // Add team members
  const legalObserver: TeamMember = {
    pseudonym: 'defensor1',
    role: 'legal',
    certificationLevel: 2,
    status: 'en_route',
    eta: '15 minutos'
  }
  
  const medicalSupport: TeamMember = {
    pseudonym: 'medico1',
    role: 'medical',
    certificationLevel: 2,
    status: 'on_scene'
  }
  
  const security: TeamMember = {
    pseudonym: 'seguridad1',
    role: 'security',
    certificationLevel: 1,
    status: 'en_route',
    eta: '10 minutos'
  }
  
  store.assignTeamMember(incidentId, legalObserver)
  store.assignTeamMember(incidentId, medicalSupport)
  store.assignTeamMember(incidentId, security)
  
  // Update status when they arrive
  store.updateTeamMemberStatus(incidentId, 'defensor1', 'on_scene')
  
  // Get active team
  const incident = store.getIncidentById(incidentId)
  console.log('Active team:', incident?.team)
}

// =============================================================================
// EXAMPLE 3: Using Checklist
// =============================================================================

export function exampleChecklist(incidentId: string) {
  const store = useProtocoloStore.getState()
  
  // Check current phase
  console.log('Current phase:', store.currentPhase)
  // Output: '0-5min'
  
  // Get all items for phase
  const phaseItems = store.getItemsByPhase(incidentId, '0-5min')
  console.log(`Items in 0-5min phase: ${phaseItems.length}`)
  
  // Complete an item
  const itemId = `${incidentId}-item-0`
  store.toggleItem(incidentId, itemId, 'defensor1')
  
  // Check progress
  const progress = store.getProgress(incidentId)
  console.log(`Overall progress: ${progress}%`)
  
  // Check phase-specific progress
  const phaseProgress = store.getPhaseProgress(incidentId, '0-5min')
  console.log(`Phase 0-5min progress: ${phaseProgress}%`)
  
  // Get mandatory pending items
  const mandatoryPending = store.getMandatoryPending(incidentId)
  console.log(`Mandatory items pending: ${mandatoryPending.length}`)
  
  // Move to next phase
  store.setCurrentPhase('5-20min')
}

// =============================================================================
// EXAMPLE 4: Adding Documentation
// =============================================================================

export async function exampleDocumentation(incidentId: string) {
  const store = useProtocoloStore.getState()
  
  // Simulate file data (in real app, this comes from camera/file input)
  const mockFileData = 'base64encodedimagedata...'
  
  // Add photo documentation
  const entryId = await store.addEntry(
    {
      incidentId,
      type: 'photo',
      capturedBy: 'defensor1',
      location: {
        address: 'Av. Insurgentes Sur 1234',
        colonia: 'Del Valle',
        alcaldia: 'Benito Juárez',
        postalCode: '03100'
      },
      encrypted: true,
      metadata: {
        deviceInfo: 'iPhone 13 Pro',
        gpsCoordinates: { latitude: 19.4326, longitude: -99.1332 },
        resolution: '4032x3024',
        fileSize: 2048000,
        mimeType: 'image/jpeg'
      },
      description: 'Fotografía de oficiales presentes en el lugar'
    },
    mockFileData
  )
  
  console.log(`Documentation entry created: ${entryId}`)
  
  // Verify integrity
  const isValid = await store.verifyIntegrity(entryId)
  console.log(`Integrity verified: ${isValid}`)
  
  // Add to chain of custody
  store.addToChainOfCustody(entryId, {
    action: 'transferred',
    actor: 'coordinador1',
    location: 'Centro de Operaciones CDMX',
    method: 'Signal encrypted message',
    recipient: 'abogado1'
  })
  
  // Get all documentation for incident
  const entries = store.getEntriesByIncident(incidentId)
  console.log(`Total documentation entries: ${entries.length}`)
}

// =============================================================================
// EXAMPLE 5: User Authentication and Profile
// =============================================================================

export async function exampleUserAuth() {
  const store = useProtocoloStore.getState()
  
  // Login
  const success = await store.login('comandante', '1234')
  
  if (success) {
    console.log('Login successful')
    console.log('Current user:', store.currentUser?.pseudonym)
    console.log('Role:', store.currentUser?.role)
    console.log('Certification:', store.currentUser?.certificationLevel)
    
    // Complete training
    store.completeTraining('pas-advanced', 'Protocolo PAS Avanzado')
    
    // Check if training completed
    const hasTraining = store.hasCompletedTraining('pas-advanced')
    console.log(`Has PAS training: ${hasTraining}`)
    
    // Set operational status
    store.setOperationalStatus('active')
  } else {
    console.log('Login failed')
    console.log('Attempts:', store.loginAttempts)
  }
  
  // Logout
  store.logout()
}

// =============================================================================
// EXAMPLE 6: Settings and Security
// =============================================================================

export function exampleSettings() {
  const store = useProtocoloStore.getState()
  
  // Toggle encryption
  store.toggleEncryption()
  console.log('Encryption enabled:', store.settings.encryptionEnabled)
  
  // Set language
  store.setLanguage('nah') // Nahuatl
  console.log('Language:', store.settings.language)
  
  // Set duress password
  store.setDuressPassword('9999')
  
  // Check duress password
  const isDuress = store.checkDuressPassword('9999')
  if (isDuress) {
    store.activateDuressMode()
    console.log('Duress mode activated')
  }
  
  // Set theme
  store.setTheme('dark')
  
  // Configure auto-lock
  store.setAutoLockTimeout(10) // 10 minutes
  
  // Configure data wipe
  store.setWipeDataThreshold(10) // After 10 failed attempts
}

// =============================================================================
// EXAMPLE 7: Managing Resources
// =============================================================================

export function exampleResources() {
  const store = useProtocoloStore.getState()
  
  // Add safe point
  const safePointId = store.addSafePoint({
    name: 'Centro Cultural La Villa',
    type: 'community_center',
    address: 'Calle Allende 456, Col. Centro',
    coordinates: { latitude: 19.434, longitude: -99.141 },
    capacity: 100,
    accessibility: {
      wheelchairAccessible: true,
      groundFloor: true,
      hasRestroom: true,
      publicTransportNearby: true
    },
    contact: {
      pseudonym: 'coordinador2',
      secureContact: 'signal:centro.villa'
    },
    accessAgreement: true,
    available: true
  })
  
  // Find nearby safe points
  const nearby = store.getNearbySafePoints(
    { latitude: 19.4326, longitude: -99.1332 },
    3 // 3km radius
  )
  console.log(`Found ${nearby.length} safe points within 3km`)
  
  // Add contact
  store.addContact({
    name: 'Coordinadora de Medios',
    role: 'community_liaison',
    phone: 'signal:medios.cdmx',
    availability: 'L-V 9:00-18:00',
    priority: 3,
    responseTime: '30 minutos'
  })
  
  // Get emergency contacts
  const emergency = store.getEmergencyContacts()
  console.log(`Emergency contacts: ${emergency.length}`)
  
  // Manage supplies
  store.addSupply({
    name: 'Mascarillas N95',
    category: 'medical',
    quantity: 100,
    unit: 'unidades',
    priority: 'high'
  })
  
  // Consume supplies
  store.consumeSupply('Mascarillas N95', 10)
  
  // Check for low stock
  const lowStock = store.getLowStockSupplies(20)
  console.log(`Low stock items: ${lowStock.length}`)
  
  // Get resource statistics
  const stats = store.getResourceStats()
  console.log('Resource stats:', stats)
}

// =============================================================================
// EXAMPLE 8: Complete Incident Response Workflow
// =============================================================================

export async function exampleCompleteWorkflow() {
  const store = useProtocoloStore.getState()
  
  console.log('=== INICIANDO RESPUESTA A INCIDENTE ===\n')
  
  // 1. Login
  console.log('1. Autenticando usuario...')
  const loginSuccess = await store.login('comandante', '1234')
  if (!loginSuccess) {
    console.error('Login fallido')
    return
  }
  console.log('✓ Usuario autenticado\n')
  
  // 2. Create incident
  console.log('2. Creando incidente...')
  const incidentId = store.createIncident({
    location: {
      address: 'Calle Independencia 789, Col. Centro Histórico',
      colonia: 'Centro',
      alcaldia: 'Cuauhtémoc',
      postalCode: '06000'
    },
    alertSource: 'community_network',
    description: 'Desalojo de familias en edificio habitacional. Sin orden judicial.',
    threatLevel: 'critical',
    occupantsAtRisk: 15,
    minorsPresent: true,
    vulnerablePersons: true,
    authoritiesPresent: true,
    authorityTypes: ['police', 'court_officer']
  })
  console.log(`✓ Incidente creado: ${incidentId}\n`)
  
  // 3. Initialize checklist
  console.log('3. Inicializando checklist...')
  store.initializeChecklist(incidentId)
  console.log('✓ Checklist inicializado\n')
  
  // 4. Assign team
  console.log('4. Asignando equipo...')
  store.assignTeamMember(incidentId, {
    pseudonym: 'defensor1',
    role: 'legal',
    certificationLevel: 2,
    status: 'en_route',
    eta: '10 minutos'
  })
  store.assignTeamMember(incidentId, {
    pseudonym: 'medico1',
    role: 'medical',
    certificationLevel: 2,
    status: 'en_route',
    eta: '15 minutos'
  })
  console.log('✓ Equipo asignado\n')
  
  // 5. Complete checklist items
  console.log('5. Completando items del checklist...')
  const items = store.getItemsByPhase(incidentId, '0-5min')
  items.slice(0, 2).forEach(item => {
    store.toggleItem(incidentId, item.id, 'comandante')
    console.log(`  ✓ ${item.text.substring(0, 50)}...`)
  })
  console.log(`  Progreso: ${store.getProgress(incidentId)}%\n`)
  
  // 6. Add documentation
  console.log('6. Agregando documentación...')
  const mockPhoto = 'base64:photodata123...'
  const entryId = await store.addEntry(
    {
      incidentId,
      type: 'photo',
      capturedBy: 'defensor1',
      location: {
        address: 'Calle Independencia 789',
        colonia: 'Centro',
        alcaldia: 'Cuauhtémoc',
        postalCode: '06000'
      },
      encrypted: true,
      metadata: {
        deviceInfo: 'iPhone 13',
        gpsCoordinates: { latitude: 19.4326, longitude: -99.1332 },
        fileSize: 1500000,
        mimeType: 'image/jpeg'
      },
      description: 'Documentación de oficiales en escena'
    },
    mockPhoto
  )
  console.log(`✓ Evidencia agregada: ${entryId}\n`)
  
  // 7. Get emergency contacts
  console.log('7. Contactos de emergencia disponibles:')
  const emergencyContacts = store.getEmergencyContacts()
  emergencyContacts.forEach(contact => {
    console.log(`  - ${contact.name} (${contact.role}) - ${contact.phone}`)
  })
  console.log('')
  
  // 8. Check resources
  console.log('8. Recursos disponibles:')
  const availableSafePoints = store.getAvailableSafePoints()
  console.log(`  - Puntos seguros: ${availableSafePoints.length}`)
  const lowStock = store.getLowStockSupplies(15)
  console.log(`  - Suministros con stock bajo: ${lowStock.length}\n`)
  
  // 9. Close incident
  console.log('9. Cerrando incidente...')
  store.closeIncident(incidentId, 'Resuelto mediante mediación exitosa', 'successful')
  console.log('✓ Incidente cerrado\n')
  
  console.log('=== FLUJO COMPLETADO ===')
}

// =============================================================================
// EXAMPLE 9: Using in React Components
// =============================================================================

/*
import { useProtocoloStore } from '@/store'
import { useActiveIncident, useChecklistProgress } from '@/store'

// Component using full store
function IncidentDashboard() {
  const store = useProtocoloStore()
  const activeIncident = store.getActiveIncident()
  
  const handleCreateIncident = () => {
    const id = store.createIncident({...})
    store.initializeChecklist(id)
  }
  
  return <div>...</div>
}

// Component using optimized selectors
function ProgressBar() {
  const activeIncident = useActiveIncident()
  const progress = useChecklistProgress(activeIncident?.id || '')
  
  return <div>{progress}% completado</div>
}
*/

// =============================================================================
// EXAMPLE 10: Error Handling
// =============================================================================

export async function exampleErrorHandling() {
  const store = useProtocoloStore.getState()
  
  try {
    // Attempt to login with wrong credentials multiple times
    for (let i = 0; i < 6; i++) {
      const success = await store.login('comandante', 'wrongpassword')
      if (!success) {
        console.log(`Attempt ${i + 1} failed`)
      }
    }
    
    // Account should be locked now
    console.log('Account locked until:', store.lockedUntil)
    
    // Try to login while locked
    const lockedAttempt = await store.login('comandante', '1234')
    console.log('Login while locked:', lockedAttempt) // false
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// Run examples (uncomment to test)
// exampleCreateIncident()
// exampleCompleteWorkflow()
