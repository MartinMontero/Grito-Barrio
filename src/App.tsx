/**
 * Main Application Component
 * Protocolo CDMX
 */

import React, { useState, useCallback, Suspense } from 'react'
import { Header } from '@/components/features/Header'
import { BottomNavigation } from '@/components/features/BottomNavigation'
import { HomePage } from '@/components/features/HomePage'
import { QuickActions } from '@/components/features/QuickActions'
import { useProtocoloStore } from '@/store'
import type { Protocol, LegalResource, TeamRole } from '@/types'

// Lazy-loaded view components (not needed on first paint)
const ProtocolsPage = React.lazy(() =>
  import('@/components/features/ProtocolsPage').then(m => ({ default: m.ProtocolsPage }))
)
const ProtocolDetailPage = React.lazy(() =>
  import('@/components/features/ProtocolDetailPage').then(m => ({ default: m.ProtocolDetailPage }))
)
const LegalPage = React.lazy(() =>
  import('@/components/features/LegalPage').then(m => ({ default: m.LegalPage }))
)
const LegalResourceDetailPage = React.lazy(() =>
  import('@/components/features/LegalResourceDetailPage').then(m => ({ default: m.LegalResourceDetailPage }))
)
const LegalTriageWizard = React.lazy(() =>
  import('@/components/features/LegalTriageWizard').then(m => ({ default: m.LegalTriageWizard }))
)
const ResourcesPage = React.lazy(() =>
  import('@/components/features/ResourcesPage').then(m => ({ default: m.ResourcesPage }))
)
const SettingsPage = React.lazy(() =>
  import('@/components/features/SettingsPage').then(m => ({ default: m.SettingsPage }))
)
const EmergencyModal = React.lazy(() =>
  import('@/components/features/EmergencyModal').then(m => ({ default: m.EmergencyModal }))
)
const EmergencyDashboard = React.lazy(() =>
  import('@/components/features/EmergencyDashboard').then(m => ({ default: m.EmergencyDashboard }))
)
const EmergencyChecklist = React.lazy(() =>
  import('@/components/features/EmergencyChecklist').then(m => ({ default: m.EmergencyChecklist }))
)
const PASProtocolGuide = React.lazy(() =>
  import('@/components/features/PASProtocolGuide').then(m => ({ default: m.PASProtocolGuide }))
)
const EvidenceCollection = React.lazy(() =>
  import('@/components/features/EvidenceCollection').then(m => ({ default: m.EvidenceCollection }))
)
const RoleSelector = React.lazy(() =>
  import('@/components/features/RoleSelector').then(m => ({ default: m.RoleSelector }))
)
const RoleDashboard = React.lazy(() =>
  import('@/components/features/RoleDashboard').then(m => ({ default: m.RoleDashboard }))
)

type ViewState =
  | { type: 'home' }
  | { type: 'protocols' }
  | { type: 'protocol-detail'; protocol: Protocol }
  | { type: 'legal' }
  | { type: 'legal-detail'; resource: LegalResource }
  | { type: 'legal-triage'; occupantCategory?: 'primary' | 'family' | 'worker' | 'unauthorized' }
  | { type: 'resources' }
  | { type: 'settings' }
  | { type: 'emergency-dashboard' }
  | { type: 'emergency-checklist'; incidentId?: string }
  | { type: 'pas-protocol' }
  | { type: 'evidence-collection'; incidentId?: string }
  | { type: 'role-selection' }
  | { type: 'role-dashboard' }

function ViewFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function App() {
  const [currentView, setCurrentView] = useState<ViewState>({ type: 'home' })
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false)

  // Store selectors
  const currentUser = useProtocoloStore((state) => state.currentUser)
  const activeIncident = useProtocoloStore((state) => state.getActiveIncident())
  const incidents = useProtocoloStore((state) => state.incidents)
  const [userRole, setUserRole] = useState<TeamRole | null>(null)

  const handleTabChange = useCallback((tab: string) => {
    switch (tab) {
      case 'home':
        setCurrentView({ type: 'home' })
        break
      case 'protocols':
        setCurrentView({ type: 'protocols' })
        break
      case 'legal':
        setCurrentView({ type: 'legal' })
        break
      case 'resources':
        setCurrentView({ type: 'resources' })
        break
      case 'settings':
        setCurrentView({ type: 'settings' })
        break
    }
  }, [])

  const handleEmergencyPress = useCallback(() => {
    setIsEmergencyModalOpen(true)
  }, [])

  const handleCloseEmergency = useCallback(() => {
    setIsEmergencyModalOpen(false)
  }, [])

  const handleProtocolSelect = useCallback((protocol: Protocol) => {
    setCurrentView({ type: 'protocol-detail', protocol })
  }, [])

  const handleLegalResourceSelect = useCallback((resource: LegalResource) => {
    setCurrentView({ type: 'legal-detail', resource })
  }, [])

  const handleBack = useCallback(() => {
    switch (currentView.type) {
      case 'protocol-detail':
        setCurrentView({ type: 'protocols' })
        break
      case 'legal-detail':
      case 'legal-triage':
        setCurrentView({ type: 'legal' })
        break
      case 'emergency-checklist':
      case 'evidence-collection':
        setCurrentView({ type: 'emergency-dashboard' })
        break
      case 'pas-protocol':
        setCurrentView(activeIncident ? { type: 'emergency-dashboard' } : { type: 'home' })
        break
      case 'role-dashboard':
        setCurrentView({ type: 'home' })
        break
      default:
        setCurrentView({ type: 'home' })
    }
  }, [currentView.type, activeIncident])

  const handleRoleSelect = useCallback((role: TeamRole) => {
    setUserRole(role)
    setCurrentView({ type: 'role-dashboard' })
  }, [setUserRole])

  const handleEmergencyIncidentCreate = useCallback(() => {
    setCurrentView({ type: 'emergency-dashboard' })
    setIsEmergencyModalOpen(false)
  }, [])

  const getActiveTab = () => {
    switch (currentView.type) {
      case 'home':
      case 'role-selection':
      case 'role-dashboard':
        return 'home'
      case 'protocols':
      case 'protocol-detail':
        return 'protocols'
      case 'legal':
      case 'legal-detail':
      case 'legal-triage':
        return 'legal'
      case 'resources':
        return 'resources'
      case 'settings':
        return 'settings'
      default:
        return 'home'
    }
  }

  const renderView = () => {
    switch (currentView.type) {
      case 'home':
        return (
          <HomePage
            onEmergencyPress={handleEmergencyPress}
            onNavigate={handleTabChange}
          />
        )

      case 'protocols':
        return (
          <ProtocolsPage
            onProtocolSelect={handleProtocolSelect}
          />
        )

      case 'protocol-detail':
        return (
          <ProtocolDetailPage
            protocol={currentView.protocol}
            onBack={handleBack}
          />
        )

      case 'legal':
        return (
          <LegalPage
            onResourceSelect={handleLegalResourceSelect}
          />
        )

      case 'legal-detail':
        return (
          <LegalResourceDetailPage
            resource={currentView.resource}
            onBack={handleBack}
          />
        )

      case 'legal-triage':
        return (
          <LegalTriageWizard
            incidentId={activeIncident?.id}
          />
        )

      case 'resources':
        return <ResourcesPage />

      case 'settings':
        return (
          <SettingsPage
            onNavigate={handleTabChange}
          />
        )

      case 'emergency-dashboard':
        return (
          <EmergencyDashboard
            onWithdrawalTrigger={() => setCurrentView({ type: 'home' })}
            onDocumentPress={() => setCurrentView({ type: 'evidence-collection', incidentId: activeIncident?.id })}
            onContactPress={() => {}}
          />
        )

      case 'emergency-checklist':
        return (
          <EmergencyChecklist
            incidentId={currentView.incidentId || activeIncident?.id || ''}
          />
        )

      case 'pas-protocol':
        return (
          <PASProtocolGuide
            onComplete={handleBack}
          />
        )

      case 'evidence-collection':
        return (
          <EvidenceCollection
            incidentId={currentView.incidentId || activeIncident?.id || ''}
            collectorPseudonym={currentUser?.pseudonym || 'Anónimo'}
          />
        )

      case 'role-selection':
        return (
          <RoleSelector
            onRoleSelect={(roles: TeamRole[]) => { if (roles[0]) handleRoleSelect(roles[0]) }}
            userCertificationLevel={currentUser?.certificationLevel || 1}
          />
        )

      case 'role-dashboard':
        if (!userRole) {
          return (
            <RoleSelector
              onRoleSelect={(roles: TeamRole[]) => { if (roles[0]) handleRoleSelect(roles[0]) }}
              userCertificationLevel={currentUser?.certificationLevel || 1}
            />
          )
        }
        return (
          <RoleDashboard
            role={userRole}
            userCertificationLevel={currentUser?.certificationLevel || 1}
            userPseudonym={currentUser?.pseudonym || 'Usuario'}
            activeIncident={activeIncident}
            teamMembers={[]}
            recentActivity={incidents.slice(0, 5).map(inc => ({
              id: inc.id,
              type: 'incident',
              description: `${inc.threatLevel === 'critical' ? 'Incidente crítico' : 'Incidente'} en ${inc.location.colonia}`,
              timestamp: inc.timestamp,
              actor: (inc as unknown as Record<string, unknown>).reporterPseudonym as string || 'Desconocido'
            }))}
            onActionClick={(actionId) => {
              switch (actionId) {
                case 'create_incident':
                  handleEmergencyPress()
                  break
                case 'update_checklist':
                  setCurrentView({ type: 'emergency-checklist', incidentId: activeIncident?.id })
                  break
                case 'collect_evidence':
                  setCurrentView({ type: 'evidence-collection', incidentId: activeIncident?.id })
                  break
                case 'pas_protocol':
                  setCurrentView({ type: 'pas-protocol' })
                  break
                case 'legal_triage':
                  setCurrentView({ type: 'legal-triage' })
                  break
              }
            }}
            onQuickAccessClick={(_itemId) => {
              // Handle quick access items
            }}
          />
        )

      default:
        return null
    }
  }

  const showBottomNav = ![
    'protocol-detail',
    'legal-detail',
    'emergency-dashboard',
    'emergency-checklist',
    'evidence-collection',
    'pas-protocol',
    'legal-triage'
  ].includes(currentView.type)

  const showQuickActions = ['home', 'role-dashboard'].includes(currentView.type)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header onEmergencyPress={handleEmergencyPress} />

      {/* Main Content */}
      <main className={`
        pt-14
        ${showBottomNav ? 'pb-20' : 'pb-4'}
        min-h-screen
        max-w-lg
        mx-auto
      `}>
        <Suspense fallback={<ViewFallback />}>
          {renderView()}
        </Suspense>
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <BottomNavigation
          activeTab={getActiveTab()}
          onTabChange={handleTabChange}
        />
      )}

      {/* Quick Actions FAB */}
      {showQuickActions && (
        <QuickActions
          role={userRole || 'leader'}
          onEmergencyPress={handleEmergencyPress}
          onCameraPress={() => setCurrentView({ type: 'evidence-collection' })}
          onReportPress={() => setCurrentView({ type: 'role-selection' })}
        />
      )}

      {/* Emergency Modal */}
      <Suspense fallback={null}>
        <EmergencyModal
          isOpen={isEmergencyModalOpen}
          onClose={handleCloseEmergency}
          onIncidentCreate={handleEmergencyIncidentCreate}
        />
      </Suspense>
    </div>
  )
}

export default App
