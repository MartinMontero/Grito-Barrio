/**
 * Main Application Component
 * Protocolo CDMX
 */

import React, { useState, useCallback } from 'react'
import { Header } from '@/components/features/Header'
import { BottomNavigation } from '@/components/features/BottomNavigation'
import { HomePage } from '@/components/features/HomePage'
import { ProtocolsPage } from '@/components/features/ProtocolsPage'
import { ProtocolDetailPage } from '@/components/features/ProtocolDetailPage'
import { LegalPage } from '@/components/features/LegalPage'
import { LegalResourceDetailPage } from '@/components/features/LegalResourceDetailPage'
import { ResourcesPage } from '@/components/features/ResourcesPage'
import { SettingsPage } from '@/components/features/SettingsPage'
import { EmergencyModal } from '@/components/features/EmergencyModal'
import { EmergencyDashboard } from '@/components/features/EmergencyDashboard'
import { EmergencyChecklist } from '@/components/features/EmergencyChecklist'
import { PASProtocolGuide } from '@/components/features/PASProtocolGuide'
import { LegalTriageWizard } from '@/components/features/LegalTriageWizard'
import { EvidenceCollection } from '@/components/features/EvidenceCollection'
import { RoleSelector } from '@/components/features/RoleSelector'
import { RoleDashboard } from '@/components/features/RoleDashboard'
import { QuickActions } from '@/components/features/QuickActions'
import { useProtocoloStore } from '@/store'
import type { Protocol, LegalResource, TeamRole, Incident } from '@/types'

type ViewState = 
  | { type: 'home' }
  | { type: 'protocols' }
  | { type: 'protocol-detail', protocol: Protocol }
  | { type: 'legal' }
  | { type: 'legal-detail', resource: LegalResource }
  | { type: 'legal-triage', occupantCategory?: 'primary' | 'family' | 'worker' | 'unauthorized' }
  | { type: 'resources' }
  | { type: 'settings' }
  | { type: 'emergency-dashboard' }
  | { type: 'emergency-checklist', incidentId?: string }
  | { type: 'pas-protocol' }
  | { type: 'evidence-collection', incidentId?: string }
  | { type: 'role-selection' }
  | { type: 'role-dashboard' }

function App() {
  const [currentView, setCurrentView] = useState<ViewState>({ type: 'home' })
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false)
  
  // Store selectors
  const currentUser = useProtocoloStore((state) => state.currentUser)
  const activeIncident = useProtocoloStore((state) => state.getActiveIncident())
  const incidents = useProtocoloStore((state) => state.incidents)
  const checklists = useProtocoloStore((state) => state.checklists)
  const getProgress = useProtocoloStore((state) => state.getProgress)
  const [userRole, setUserRole] = useState<TeamRole | null>(null)
  
  // Derived state
  const activeChecklist = activeIncident ? checklists[activeIncident.id] : null
  const checklistProgress = activeIncident ? getProgress(activeIncident.id) : 0
  
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
  
  const handleEmergencyIncidentCreate = useCallback((incident: Incident) => {
    setCurrentView({ type: 'emergency-dashboard' })
    setIsEmergencyModalOpen(false)
  }, [])
  
  // Determine active tab based on current view
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
  
  // Render current view
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
            occupantCategory={currentView.occupantCategory}
            onComplete={() => setCurrentView({ type: 'legal' })}
            onCancel={handleBack}
          />
        )
      
      case 'resources':
        return (
          <ResourcesPage />
        )
      
      case 'settings':
        return (
          <SettingsPage 
            onNavigate={handleTabChange}
          />
        )
      
      case 'emergency-dashboard':
        return (
          <EmergencyDashboard 
            incident={activeIncident}
            checklist={activeChecklist}
            onOpenChecklist={(incidentId) => setCurrentView({ type: 'emergency-checklist', incidentId })}
            onOpenEvidence={() => setCurrentView({ type: 'evidence-collection', incidentId: activeIncident?.id })}
            onOpenLegalTriage={(category) => setCurrentView({ type: 'legal-triage', occupantCategory: category })}
            onOpenPAS={() => setCurrentView({ type: 'pas-protocol' })}
            onCloseIncident={() => setCurrentView({ type: 'home' })}
            className="min-h-screen"
          />
        )
      
      case 'emergency-checklist':
        return (
          <EmergencyChecklist 
            incidentId={currentView.incidentId || activeIncident?.id}
            checklist={activeChecklist}
            checklistProgress={checklistProgress}
            onUpdateItem={() => {}}
            onComplete={handleBack}
            onCancel={handleBack}
          />
        )
      
      case 'pas-protocol':
        return (
          <PASProtocolGuide 
            emergencyType={activeIncident?.emergencyType}
            onBack={handleBack}
          />
        )
      
      case 'evidence-collection':
        return (
          <EvidenceCollection 
            incidentId={currentView.incidentId || activeIncident?.id || ''}
            currentUser={currentUser}
            onClose={handleBack}
          />
        )
      
      case 'role-selection':
        return (
          <RoleSelector 
            onSelect={handleRoleSelect}
            currentRole={userRole}
            userCertificationLevel={currentUser?.certificationLevel || 1}
          />
        )
      
      case 'role-dashboard':
        if (!userRole) {
          return (
            <RoleSelector 
              onSelect={handleRoleSelect}
              currentRole={null}
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
              actor: inc.reporterPseudonym
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
            onQuickAccessClick={(itemId) => {
              // Handle quick access items
            }}
          />
        )
      
      default:
        return null
    }
  }
  
  // Check if we should show bottom navigation
  const showBottomNav = ![
    'protocol-detail', 
    'legal-detail', 
    'emergency-dashboard',
    'emergency-checklist',
    'evidence-collection',
    'pas-protocol',
    'legal-triage'
  ].includes(currentView.type)
  
  // Check if we should show quick actions
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
        {renderView()}
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
      <EmergencyModal 
        isOpen={isEmergencyModalOpen}
        onClose={handleCloseEmergency}
        onIncidentCreate={handleEmergencyIncidentCreate}
      />
    </div>
  )
}

export default App
