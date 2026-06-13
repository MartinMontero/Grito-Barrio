/**
 * Application root — Grito & Barrio
 *
 * Boot sequence:
 *  1. Re-arm any panic wipe scheduled before the last reload (durable).
 *  2. Ensure a local operator profile exists (incident/checklist features need it).
 *  3. Gate the app behind the vault lock screen when a vault exists and is locked.
 *     After unlock the encrypted slices are re-hydrated (the data key is in-memory
 *     only and unavailable before unlock).
 *
 * Navigation uses react-router with the AppShell layout (header, drawer, bottom
 * nav, panic overlay). Detail screens resolve their data from the route param.
 */

import React, { useEffect, useState } from 'react'
import { useRoutes, useNavigate, useParams, Navigate } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { LockScreen } from '@/components/auth/LockScreen'

import { HomePage } from '@/components/features/HomePage'
import { ProtocolsPage } from '@/components/features/ProtocolsPage'
import { ProtocolDetailPage } from '@/components/features/ProtocolDetailPage'
import { LegalPage } from '@/components/features/LegalPage'
import { LegalResourceDetailPage } from '@/components/features/LegalResourceDetailPage'
import { LegalTriageWizard } from '@/components/features/LegalTriageWizard'
import { ResourcesPage } from '@/components/features/ResourcesPage'
import { SettingsPage } from '@/components/features/SettingsPage'
import { EmergencyModal } from '@/components/features/EmergencyModal'
import { EmergencyDashboard } from '@/components/features/EmergencyDashboard'
import { EmergencyChecklist } from '@/components/features/EmergencyChecklist'
import { PASProtocolGuide } from '@/components/features/PASProtocolGuide'
import { EvidenceCollection } from '@/components/features/EvidenceCollection'
import { RoleSelector } from '@/components/features/RoleSelector'
import { RoleDashboard } from '@/components/features/RoleDashboard'

import { useProtocoloStore } from '@/store'
import { hydratePersistedState } from '@/lib/store-helpers'
import { getVaultState, onUnlockChange } from '@/lib/vault'
import { securityManager } from '@/lib/security'
import { protocols, legalResources } from '@/data/protocols'
import type { TeamRole } from '@/types'
import { featureRoutes } from '@/routes/featureRoutes'

// =============================================================================
// Route wrappers — adapt router params/navigation to component prop APIs
// =============================================================================

function HomeRoute() {
  const navigate = useNavigate()
  return (
    <HomePage
      onEmergencyPress={() => navigate('/emergency')}
      onNavigate={(tab) => navigate(tab === 'home' ? '/' : `/${tab}`)}
    />
  )
}

function ProtocolsRoute() {
  const navigate = useNavigate()
  return <ProtocolsPage onProtocolSelect={(p) => navigate(`/protocols/${p.id}`)} />
}

function ProtocolDetailRoute() {
  const navigate = useNavigate()
  const { id } = useParams()
  const protocol = protocols.find((p) => p.id === id)
  if (!protocol) return <Navigate to="/protocols" replace />
  return <ProtocolDetailPage protocol={protocol} onBack={() => navigate('/protocols')} />
}

function LegalRoute() {
  const navigate = useNavigate()
  return <LegalPage onResourceSelect={(r) => navigate(`/legal/${r.id}`)} />
}

function LegalDetailRoute() {
  const navigate = useNavigate()
  const { id } = useParams()
  const resource = legalResources.find((r) => r.id === id)
  if (!resource) return <Navigate to="/legal" replace />
  return <LegalResourceDetailPage resource={resource} onBack={() => navigate('/legal')} />
}

function SettingsRoute() {
  const navigate = useNavigate()
  return <SettingsPage onNavigate={(tab) => navigate(tab === 'home' ? '/' : `/${tab}`)} />
}

function EmergencyEntryRoute() {
  const navigate = useNavigate()
  const activeIncident = useProtocoloStore((s) => s.getActiveIncident())
  if (activeIncident) {
    return (
      <EmergencyDashboard
        onWithdrawalTrigger={() => navigate('/')}
        onDocumentPress={() => navigate('/emergency/evidence')}
        onContactPress={() => navigate('/resources/contacts')}
      />
    )
  }
  return (
    <EmergencyModal
      isOpen
      onClose={() => navigate('/')}
      onIncidentCreate={() => navigate('/emergency')}
    />
  )
}

function EmergencyChecklistRoute() {
  const activeIncident = useProtocoloStore((s) => s.getActiveIncident())
  return <EmergencyChecklist incidentId={activeIncident?.id || ''} />
}

function EvidenceRoute() {
  const activeIncident = useProtocoloStore((s) => s.getActiveIncident())
  const currentUser = useProtocoloStore((s) => s.currentUser)
  return (
    <EvidenceCollection
      incidentId={activeIncident?.id || ''}
      collectorPseudonym={currentUser?.pseudonym || 'Anónimo'}
    />
  )
}

function PASProtocolRoute() {
  const navigate = useNavigate()
  return <PASProtocolGuide onComplete={() => navigate(-1)} />
}

function LegalTriageRoute() {
  const activeIncident = useProtocoloStore((s) => s.getActiveIncident())
  return <LegalTriageWizard incidentId={activeIncident?.id} />
}

function RoleSelectorRoute() {
  const navigate = useNavigate()
  const currentUser = useProtocoloStore((s) => s.currentUser)
  return (
    <RoleSelector
      onRoleSelect={(roles: TeamRole[]) => roles[0] && navigate(`/roles/${roles[0]}`)}
      userCertificationLevel={currentUser?.certificationLevel || 1}
    />
  )
}

function RoleDashboardRoute() {
  const navigate = useNavigate()
  const { role } = useParams()
  const currentUser = useProtocoloStore((s) => s.currentUser)
  const activeIncident = useProtocoloStore((s) => s.getActiveIncident())
  const incidents = useProtocoloStore((s) => s.incidents)

  if (!role) return <Navigate to="/roles" replace />

  return (
    <RoleDashboard
      role={role as TeamRole}
      userCertificationLevel={currentUser?.certificationLevel || 1}
      userPseudonym={currentUser?.pseudonym || 'Operador'}
      activeIncident={activeIncident}
      teamMembers={activeIncident?.team || []}
      recentActivity={incidents.slice(0, 5).map((inc) => ({
        id: inc.id,
        type: 'incident',
        description: `${inc.threatLevel === 'critical' ? 'Incidente crítico' : 'Incidente'} en ${inc.location.colonia}`,
        timestamp: inc.timestamp,
        actor: (inc as { reporterPseudonym?: string }).reporterPseudonym || 'Operador',
      }))}
      onActionClick={(actionId: string) => {
        switch (actionId) {
          case 'create_incident':
            navigate('/emergency')
            break
          case 'update_checklist':
            navigate('/emergency/checklist')
            break
          case 'collect_evidence':
            navigate('/emergency/evidence')
            break
          case 'pas_protocol':
            navigate('/emergency/pas')
            break
          case 'legal_triage':
            navigate('/legal/triage')
            break
        }
      }}
      onQuickAccessClick={() => {}}
    />
  )
}

// =============================================================================
// Route table
// =============================================================================

function AppRoutes() {
  return useRoutes([
    {
      element: <AppShell />,
      children: [
        { index: true, element: <HomeRoute /> },
        { path: 'protocols', element: <ProtocolsRoute /> },
        { path: 'protocols/:id', element: <ProtocolDetailRoute /> },
        { path: 'legal', element: <LegalRoute /> },
        { path: 'legal/triage', element: <LegalTriageRoute /> },
        { path: 'legal/:id', element: <LegalDetailRoute /> },
        { path: 'resources', element: <ResourcesPage /> },
        { path: 'settings', element: <SettingsRoute /> },
        { path: 'emergency', element: <EmergencyEntryRoute /> },
        { path: 'emergency/checklist', element: <EmergencyChecklistRoute /> },
        { path: 'emergency/evidence', element: <EvidenceRoute /> },
        { path: 'emergency/pas', element: <PASProtocolRoute /> },
        { path: 'incident/:id', element: <EmergencyEntryRoute /> },
        { path: 'roles', element: <RoleSelectorRoute /> },
        { path: 'roles/:role', element: <RoleDashboardRoute /> },
        ...featureRoutes,
        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
  ])
}

// =============================================================================
// Root
// =============================================================================

function App() {
  const ensureLocalUser = useProtocoloStore((s) => s.ensureLocalUser)
  const [locked, setLocked] = useState<boolean>(() => getVaultState() === 'locked')
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    // Re-arm a wipe scheduled before the last reload/close (durable deadline).
    securityManager.armScheduledWipeOnStartup()
    // Bootstrap the local operator profile.
    ensureLocalUser()
    setBooted(true)
    // Keep the lock gate in sync with vault unlock/lock events.
    const off = onUnlockChange((unlocked) => setLocked(!unlocked && getVaultState() === 'locked'))
    return off
  }, [ensureLocalUser])

  if (!booted) return null

  if (locked) {
    return (
      <LockScreen
        onUnlocked={async () => {
          // The data key is in memory now; load the encrypted slices.
          await hydratePersistedState()
          setLocked(false)
        }}
      />
    )
  }

  return <AppRoutes />
}

export default App
