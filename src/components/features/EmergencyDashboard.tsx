import React, { useState, useEffect, useCallback, useRef } from 'react'
import { 
  AlertTriangle, 
  Shield, 
  Users, 
  Phone, 
  Camera, 
  ChevronDown, 
  ChevronUp,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  LogOut,
  FileText,
  Activity,
  UserCheck,
  AlertOctagon,
  MoreVertical,
  Share2,
  Navigation
} from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useProtocoloStore } from '@/store'
import type { 
  Incident, 
  EmergencyPhase, 
  TeamRole, 
  TeamMember,
  ChecklistItem,
  ThreatLevel 
} from '@/types'

// =============================================================================
// TYPES
// =============================================================================

interface EmergencyDashboardProps {
  onWithdrawalTrigger?: (reason: string) => void
  onDocumentPress?: () => void
  onContactPress?: () => void
}

interface TimerState {
  minutes: number
  seconds: number
  totalSeconds: number
  phase: EmergencyPhase
  phaseProgress: number
}

interface WithdrawalTrigger {
  id: string
  label: string
  severity: 'high' | 'critical'
  icon: React.ReactNode
}

// =============================================================================
// MOCK DATA
// =============================================================================

const WITHDRAWAL_TRIGGERS: WithdrawalTrigger[] = [
  { 
    id: 'firearms', 
    label: 'Armas de fuego presentes', 
    severity: 'critical',
    icon: <AlertOctagon className="w-5 h-5" />
  },
  { 
    id: 'armed_groups', 
    label: 'Grupos armados', 
    severity: 'critical',
    icon: <Shield className="w-5 h-5" />
  },
  { 
    id: 'kidnap_threat', 
    label: 'Amenazas de secuestro', 
    severity: 'critical',
    icon: <AlertTriangle className="w-5 h-5" />
  },
  { 
    id: 'minors_escalation', 
    label: 'Escalación hacia menores', 
    severity: 'high',
    icon: <Users className="w-5 h-5" />
  },
  { 
    id: 'medical_emergency', 
    label: 'Emergencia médica grave', 
    severity: 'high',
    icon: <Activity className="w-5 h-5" />
  },
  { 
    id: 'authority_violence', 
    label: 'Violencia por autoridades', 
    severity: 'critical',
    icon: <Shield className="w-5 h-5" />
  }
]

const PHASE_CONFIG: Record<EmergencyPhase, { label: string; color: string; maxMinutes: number }> = {
  '0-5min': { label: 'Activación Inmediata', color: 'bg-red-500', maxMinutes: 5 },
  '5-20min': { label: 'Evaluación en Escena', color: 'bg-orange-500', maxMinutes: 20 },
  '20-45min': { label: 'Documentación Legal', color: 'bg-yellow-500', maxMinutes: 45 },
  '45-60min': { label: 'Soporte Sostenido', color: 'bg-blue-500', maxMinutes: 60 }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function getThreatLevelColor(level: ThreatLevel): string {
  const colors: Record<ThreatLevel, string> = {
    'low': 'bg-green-500',
    'moderate': 'bg-yellow-500',
    'high': 'bg-orange-500',
    'critical': 'bg-red-600',
    'extreme': 'bg-purple-600'
  }
  return colors[level] || 'bg-gray-500'
}

function getThreatLevelLabel(level: ThreatLevel): string {
  const labels: Record<ThreatLevel, string> = {
    'low': 'Bajo',
    'moderate': 'Moderado',
    'high': 'Alto',
    'critical': 'Crítico',
    'extreme': 'Extremo'
  }
  return labels[level] || 'Desconocido'
}

function calculatePhase(elapsedMinutes: number): EmergencyPhase {
  if (elapsedMinutes < 5) return '0-5min'
  if (elapsedMinutes < 20) return '5-20min'
  if (elapsedMinutes < 45) return '20-45min'
  return '45-60min'
}

function formatTime(minutes: number, seconds: number): string {
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// =============================================================================
// SUB-COMPONENT: Emergency Timer
// =============================================================================

interface EmergencyTimerProps {
  startTime: string
  onPhaseChange?: (phase: EmergencyPhase) => void
}

const EmergencyTimer: React.FC<EmergencyTimerProps> = ({ startTime, onPhaseChange }) => {
  const [timer, setTimer] = useState<TimerState>({
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    phase: '0-5min',
    phaseProgress: 0
  })

  useEffect(() => {
    const start = new Date(startTime).getTime()
    
    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - start) / 1000)
      const minutes = Math.floor(elapsed / 60)
      const seconds = elapsed % 60
      
      const phase = calculatePhase(minutes)
      const phaseConfig = PHASE_CONFIG[phase]
      const phaseStartMinutes = phase === '0-5min' ? 0 : 
                                phase === '5-20min' ? 5 : 
                                phase === '20-45min' ? 20 : 45
      const phaseElapsed = minutes - phaseStartMinutes
      const phaseProgress = Math.min((phaseElapsed / (phaseConfig.maxMinutes - phaseStartMinutes)) * 100, 100)
      
      setTimer({
        minutes,
        seconds,
        totalSeconds: elapsed,
        phase,
        phaseProgress
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  const phaseConfig = PHASE_CONFIG[timer.phase]

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 mb-4">
      {/* Main Timer Display */}
      <div className="text-center mb-4">
        <div className="text-6xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-white">
          {formatTime(timer.minutes, timer.seconds)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Tiempo desde alerta
        </div>
      </div>

      {/* Phase Indicator */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Fase: {phaseConfig.label}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {Math.round(timer.phaseProgress)}%
          </span>
        </div>
        
        {/* Phase Progress Bar */}
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-1000 ease-linear", phaseConfig.color)}
            style={{ width: `${timer.phaseProgress}%` }}
          />
        </div>

        {/* All Phases Visual */}
        <div className="flex mt-2 gap-1">
          {(['0-5min', '5-20min', '20-45min', '45-60min'] as EmergencyPhase[]).map((p) => (
            <div 
              key={p}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-colors",
                p === timer.phase ? PHASE_CONFIG[p].color :
                p < timer.phase ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
              )}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-gray-500 dark:text-gray-400">
          <span>0m</span>
          <span>5m</span>
          <span>20m</span>
          <span>45m</span>
          <span>60m</span>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// SUB-COMPONENT: Team Status
// =============================================================================

interface TeamStatusProps {
  team: TeamMember[]
}

const TeamStatus: React.FC<TeamStatusProps> = ({ team }) => {
  const getStatusColor = (status: TeamMember['status']) => {
    const colors: Record<TeamMember['status'], string> = {
      'en_route': 'bg-yellow-500',
      'on_scene': 'bg-green-500',
      'active': 'bg-blue-500',
      'standby': 'bg-gray-500',
      'off_duty': 'bg-gray-300'
    }
    return colors[status]
  }

  const getStatusLabel = (status: TeamMember['status']) => {
    const labels: Record<TeamMember['status'], string> = {
      'en_route': 'En camino',
      'on_scene': 'En escena',
      'active': 'Activo',
      'standby': 'En espera',
      'off_duty': 'Fuera de servicio'
    }
    return labels[status]
  }

  const getRoleIcon = (role: TeamRole) => {
    const icons: Record<TeamRole, React.ReactNode> = {
      'leader': <Shield className="w-4 h-4" />,
      'security': <Shield className="w-4 h-4" />,
      'medical': <Activity className="w-4 h-4" />,
      'legal': <FileText className="w-4 h-4" />,
      'dispatch': <Phone className="w-4 h-4" />,
      'logistics': <Navigation className="w-4 h-4" />
    }
    return icons[role]
  }

  const getRoleLabel = (role: TeamRole) => {
    const labels: Record<TeamRole, string> = {
      'leader': 'Líder',
      'security': 'Seguridad',
      'medical': 'Médico',
      'legal': 'Legal',
      'dispatch': 'Dispatch',
      'logistics': 'Logística'
    }
    return labels[role]
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Estado del Equipo
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {team.length} miembros
        </span>
      </div>

      <div className="space-y-2">
        {team.map((member, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-300">
                {getRoleIcon(member.role)}
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {member.pseudonym}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {getRoleLabel(member.role)} • Nivel {member.certificationLevel}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                getStatusColor(member.status).replace('bg-', 'bg-opacity-20 text-')
              )}>
                <div className={cn("w-2 h-2 rounded-full", getStatusColor(member.status))} />
                {getStatusLabel(member.status)}
              </div>
              {member.eta && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ETA: {member.eta}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {team.length === 0 && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay equipo asignado</p>
          <Button variant="outline" size="sm" className="mt-2">
            Asignar equipo
          </Button>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// SUB-COMPONENT: Checklist Section
// =============================================================================

interface ChecklistSectionProps {
  incidentId: string
}

const ChecklistSection: React.FC<ChecklistSectionProps> = ({ incidentId }) => {
  const [expandedPhase, setExpandedPhase] = useState<EmergencyPhase | null>('0-5min')
  const store = useProtocoloStore()
  const currentUser = store.currentUser
  
  const checklist = store.checklists[incidentId] || []
  const progress = store.getProgress(incidentId)

  const handleToggleItem = (itemId: string) => {
    if (currentUser) {
      store.toggleItem(incidentId, itemId, currentUser.pseudonym)
      
      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }
  }

  const phases: EmergencyPhase[] = ['0-5min', '5-20min', '20-45min', '45-60min']

  const getCategoryIcon = (category: ChecklistItem['category']) => {
    const icons: Record<ChecklistItem['category'], React.ReactNode> = {
      'safety': <Shield className="w-4 h-4" />,
      'legal': <FileText className="w-4 h-4" />,
      'documentation': <Camera className="w-4 h-4" />,
      'medical': <Activity className="w-4 h-4" />,
      'communication': <Phone className="w-4 h-4" />,
      'logistics': <Navigation className="w-4 h-4" />,
      'follow_up': <CheckCircle2 className="w-4 h-4" />
    }
    return icons[category]
  }

  const getCategoryLabel = (category: ChecklistItem['category']) => {
    const labels: Record<ChecklistItem['category'], string> = {
      'safety': 'Seguridad',
      'legal': 'Legal',
      'documentation': 'Documentación',
      'medical': 'Médico',
      'communication': 'Comunicación',
      'logistics': 'Logística',
      'follow_up': 'Seguimiento'
    }
    return labels[category]
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 mb-4">
      {/* Header with Progress */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Checklist de Respuesta
        </h3>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(progress)}%
          </div>
          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Phase Accordion */}
      <div className="space-y-2">
        {phases.map(phase => {
          const phaseItems = checklist.filter(item => item.timeWindow === phase)
          const completedCount = phaseItems.filter(item => item.completed).length
          const phaseProgress = phaseItems.length > 0 
            ? Math.round((completedCount / phaseItems.length) * 100) 
            : 0
          const isExpanded = expandedPhase === phase
          const phaseConfig = PHASE_CONFIG[phase]

          return (
            <div 
              key={phase}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Phase Header */}
              <button
                onClick={() => setExpandedPhase(isExpanded ? null : phase)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full", phaseConfig.color)} />
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {phaseConfig.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {completedCount}/{phaseItems.length} completados
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {phaseProgress}%
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </button>

              {/* Phase Items */}
              {isExpanded && (
                <div className="p-2 space-y-1">
                  {phaseItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleItem(item.id)}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all",
                        item.completed 
                          ? "bg-green-50 dark:bg-green-900/20" 
                          : "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <div className="mt-0.5">
                        {item.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={cn(
                          "text-sm",
                          item.completed 
                            ? "text-gray-700 dark:text-gray-300 line-through" 
                            : "text-gray-900 dark:text-white"
                        )}>
                          {item.text}
                          {item.mandatory && (
                            <span className="ml-2 text-red-500">*</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            {getCategoryIcon(item.category)}
                            {getCategoryLabel(item.category)}
                          </span>
                          {item.completed && item.timestamp && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {new Date(item.timestamp).toLocaleTimeString('es-MX', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// =============================================================================
// SUB-COMPONENT: Role Specific Panel
// =============================================================================

interface RoleSpecificPanelProps {
  role: TeamRole
  incident: Incident
}

const RoleSpecificPanel: React.FC<RoleSpecificPanelProps> = ({ role, incident }) => {
  const store = useProtocoloStore()

  const renderLeaderActions = () => (
    <div className="space-y-2">
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2"
        onClick={() => store.setActiveIncident(incident.id)}
      >
        <Users className="w-4 h-4" />
        Gestionar Equipo
      </Button>
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2"
        onClick={() => {}}
      >
        <Activity className="w-4 h-4" />
        Evaluar Escalación
      </Button>
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2"
        onClick={() => {}}
      >
        <Phone className="w-4 h-4" />
        Contactar Coalición
      </Button>
    </div>
  )

  const renderSecurityActions = () => (
    <div className="space-y-2">
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2 border-orange-200 dark:border-orange-800"
        onClick={() => {}}
      >
        <Shield className="w-4 h-4 text-orange-600" />
        Evaluar Amenazas
      </Button>
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2"
        onClick={() => {}}
      >
        <MapPin className="w-4 h-4" />
        Identificar Escape
      </Button>
      <Button 
        variant="destructive" 
        className="w-full justify-start gap-2"
        onClick={() => {}}
      >
        <LogOut className="w-4 h-4" />
        Activar Retirada
      </Button>
    </div>
  )

  const renderMedicalActions = () => (
    <div className="space-y-2">
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2"
        onClick={() => {}}
      >
        <Activity className="w-4 h-4 text-red-600" />
        Iniciar P.A.S.
      </Button>
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2"
        onClick={() => {}}
      >
        <Users className="w-4 h-4" />
        Evaluar Heridos
      </Button>
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2"
        onClick={() => {}}
      >
        <Phone className="w-4 h-4" />
        Llamar Ambulancia
      </Button>
    </div>
  )

  const renderLegalActions = () => (
    <div className="space-y-2">
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2"
        onClick={() => {}}
      >
        <FileText className="w-4 h-4" />
        Iniciar Cadena Custodia
      </Button>
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2"
        onClick={() => {}}
      >
        <Camera className="w-4 h-4" />
        Documentar Evidencia
      </Button>
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2"
        onClick={() => {}}
      >
        <UserCheck className="w-4 h-4" />
        Contactar Abogado
      </Button>
    </div>
  )

  const renderDispatchActions = () => (
    <div className="space-y-2">
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2"
        onClick={() => {}}
      >
        <Phone className="w-4 h-4" />
        Árbol de Contactos
      </Button>
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2"
        onClick={() => {}}
      >
        <Navigation className="w-4 h-4" />
        Coordenar Recursos
      </Button>
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2"
        onClick={() => {}}
      >
        <Share2 className="w-4 h-4" />
        Compartir Ubicación
      </Button>
    </div>
  )

  const actions: Record<TeamRole, React.ReactNode> = {
    'leader': renderLeaderActions(),
    'security': renderSecurityActions(),
    'medical': renderMedicalActions(),
    'legal': renderLegalActions(),
    'dispatch': renderDispatchActions(),
    'logistics': renderDispatchActions()
  }

  const roleLabels: Record<TeamRole, string> = {
    'leader': 'Acciones de Liderazgo',
    'security': 'Acciones de Seguridad',
    'medical': 'Acciones Médicas',
    'legal': 'Acciones Legales',
    'dispatch': 'Acciones de Dispatch',
    'logistics': 'Acciones de Logística'
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 mb-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
        {roleLabels[role]}
      </h3>
      {actions[role]}
    </div>
  )
}

// =============================================================================
// SUB-COMPONENT: Withdrawal Triggers
// =============================================================================

interface WithdrawalTriggersProps {
  onTrigger: (reason: string) => void
}

const WithdrawalTriggers: React.FC<WithdrawalTriggersProps> = ({ onTrigger }) => {
  const [showConfirm, setShowConfirm] = useState<string | null>(null)

  const handleTrigger = (trigger: WithdrawalTrigger) => {
    if (showConfirm === trigger.id) {
      onTrigger(trigger.label)
      setShowConfirm(null)
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200])
      }
    } else {
      setShowConfirm(trigger.id)
    }
  }

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertOctagon className="w-6 h-6 text-red-600" />
        <h3 className="text-lg font-bold text-red-900 dark:text-red-100">
          Desencadenantes de Retirada
        </h3>
      </div>
      
      <p className="text-sm text-red-700 dark:text-red-300 mb-3">
        Presiona dos veces para activar retirada controlada
      </p>

      <div className="grid grid-cols-2 gap-2">
        {WITHDRAWAL_TRIGGERS.map(trigger => (
          <button
            key={trigger.id}
            onClick={() => handleTrigger(trigger)}
            className={cn(
              "p-3 rounded-lg text-left transition-all active:scale-95",
              showConfirm === trigger.id
                ? "bg-red-600 text-white ring-2 ring-red-400 ring-offset-2"
                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-red-100 dark:hover:bg-red-900/30"
            )}
          >
            <div className="flex items-start gap-2">
              <div className={cn(
                "mt-0.5",
                showConfirm === trigger.id ? "text-white" : "text-red-600"
              )}>
                {trigger.icon}
              </div>
              <div>
                <div className="text-sm font-medium">
                  {trigger.label}
                </div>
                {showConfirm === trigger.id && (
                  <div className="text-xs mt-1 opacity-90">
                    Presiona nuevamente para confirmar
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {showConfirm && (
        <button
          onClick={() => setShowConfirm(null)}
          className="mt-3 w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          Cancelar
        </button>
      )}
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT: Emergency Dashboard
// =============================================================================

export const EmergencyDashboard: React.FC<EmergencyDashboardProps> = ({
  onWithdrawalTrigger,
  onDocumentPress,
  onContactPress
}) => {
  const store = useProtocoloStore()
  const activeIncident = store.getActiveIncident()
  const currentUser = store.currentUser
  const [showIncidentDetails, setShowIncidentDetails] = useState(true)

  // Get user's role in current incident
  const userRole = activeIncident?.team.find(
    member => member.pseudonym === currentUser?.pseudonym
  )?.role || 'leader'

  const handleWithdrawalTrigger = (reason: string) => {
    if (activeIncident) {
      store.triggerWithdrawal(activeIncident.id, reason)
      onWithdrawalTrigger?.(reason)
    }
  }

  const handleEmergencyAlert = () => {
    // In a real app, this would trigger the emergency alert flow
    console.log('Emergency alert activated!')
    
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 500])
    }
  }

  // If no active incident, show emergency button only
  if (!activeIncident) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Protocolo CDMX
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sin incidentes activos
          </p>
        </div>

        <button
          onClick={handleEmergencyAlert}
          className={cn(
            "w-full max-w-sm py-6 px-8 rounded-2xl font-bold text-xl",
            "bg-red-600 hover:bg-red-700 text-white",
            "shadow-lg shadow-red-600/30",
            "transform active:scale-95 transition-all",
            "flex items-center justify-center gap-3"
          )}
        >
          <AlertTriangle className="w-8 h-8" />
          ACTIVAR ALERTA
        </button>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Usuario: {currentUser?.pseudonym || 'No autenticado'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Rol: {currentUser?.role || 'N/A'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 pb-24">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-3 h-3 rounded-full animate-pulse",
                getThreatLevelColor(activeIncident.threatLevel)
              )} />
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white">
                  Incidente Activo
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activeIncident.id}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowIncidentDetails(!showIncidentDetails)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              {showIncidentDetails ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Emergency Alert Button */}
        <button
          onClick={handleEmergencyAlert}
          className={cn(
            "w-full py-4 px-6 rounded-xl font-bold text-lg",
            "bg-red-600 hover:bg-red-700 text-white",
            "shadow-lg shadow-red-600/30",
            "transform active:scale-95 transition-all",
            "flex items-center justify-center gap-2 mb-4"
          )}
        >
          <AlertTriangle className="w-6 h-6" />
          ACTIVAR ALERTA GENERAL
        </button>

        {/* Incident Details (Collapsible) */}
        {showIncidentDetails && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Detalles del Incidente
              </h2>
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-bold text-white",
                getThreatLevelColor(activeIncident.threatLevel)
              )}>
                {getThreatLevelLabel(activeIncident.threatLevel)}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {activeIncident.location.address}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {activeIncident.location.colonia}, {activeIncident.location.alcaldia}
                  </div>
                  <a 
                    href={`https://maps.google.com/?q=${activeIncident.location.coordinates?.latitude},${activeIncident.location.coordinates?.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                  >
                    Ver en mapa →
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Alerta recibida
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(activeIncident.timestamp).toLocaleString('es-MX')}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {activeIncident.description}
                </div>
              </div>

              {activeIncident.occupantsAtRisk && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-orange-600" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>{activeIncident.occupantsAtRisk}</strong> ocupantes en riesgo
                  </span>
                </div>
              )}

              {(activeIncident.minorsPresent || activeIncident.vulnerablePersons) && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-red-700 dark:text-red-400">
                    {activeIncident.minorsPresent && 'Menores presentes '}
                    {activeIncident.vulnerablePersons && '• Personas vulnerables'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timer */}
        <EmergencyTimer 
          startTime={activeIncident.timestamp}
          onPhaseChange={(phase) => store.setCurrentPhase(phase)}
        />

        {/* Team Status */}
        <TeamStatus team={activeIncident.team} />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            onClick={() => handleWithdrawalTrigger('Manual activation')}
          >
            <LogOut className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium">Activar Retirada</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => {}}
          >
            <Users className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium">Verificar Equipo</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={onContactPress}
          >
            <Phone className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium">Contactar Coalición</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={onDocumentPress}
          >
            <Camera className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium">Documentar</span>
          </Button>
        </div>

        {/* Role-Specific Panel */}
        <RoleSpecificPanel 
          role={userRole} 
          incident={activeIncident}
        />

        {/* Withdrawal Triggers */}
        <WithdrawalTriggers onTrigger={handleWithdrawalTrigger} />

        {/* Checklist */}
        <ChecklistSection incidentId={activeIncident.id} />
      </main>
    </div>
  )
}

export default EmergencyDashboard
