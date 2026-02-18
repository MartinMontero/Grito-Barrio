import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  AlertCircle,
  Printer,
  Share2,
  Filter,
  Wifi,
  WifiOff,
  MoreVertical,
  Undo2,
  AlertTriangle,
  FileText,
  Shield,
  Activity,
  Users,
  Phone,
  Camera,
  MapPin,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle
} from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui'
import { cn, formatTime } from '@/lib/utils'
import { useProtocoloStore } from '@/store'
import type { EmergencyPhase, TeamRole, ChecklistItem } from '@/types'

// =============================================================================
// TYPES
// =============================================================================

interface ChecklistItemData extends ChecklistItem {
  isCritical?: boolean
  role?: TeamRole[]
  description?: string
}

interface PhaseData {
  id: EmergencyPhase
  label: string
  timeRange: string
  color: string
  bgColor: string
  borderColor: string
  items: ChecklistItemData[]
}

interface EmergencyChecklistProps {
  incidentId: string
  onItemComplete?: (itemId: string, completed: boolean) => void
  onPhaseChange?: (phase: EmergencyPhase) => void
  onExport?: () => void
}

interface FilterState {
  byRole: TeamRole | null
  showCompleted: boolean
  showCriticalOnly: boolean
}

// =============================================================================
// CHECKLIST DATA - ALL PHASES AND ITEMS
// =============================================================================

const PHASES_DATA: PhaseData[] = [
  {
    id: '0-5min',
    label: 'Activación Inmediata',
    timeRange: '0-5 minutos',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    items: [
      {
        id: 'f1-1',
        text: 'Alerta recibida (ubicación, hora, naturaleza de la amenaza)',
        completed: false,
        category: 'communication',
        timeWindow: '0-5min',
        mandatory: true,
        isCritical: true,
        role: ['leader', 'dispatch'],
        description: 'Verificar detalles completos de la alerta inicial'
      },
      {
        id: 'f1-2',
        text: 'Verificación de dos claves completada (alerta + confirmación)',
        completed: false,
        category: 'safety',
        timeWindow: '0-5min',
        mandatory: true,
        isCritical: true,
        role: ['leader', 'security'],
        description: 'Confirmar autenticidad de la alerta mediante protocolo de dos claves'
      },
      {
        id: 'f1-3',
        text: 'Líder de incidente designado y notificado',
        completed: false,
        category: 'communication',
        timeWindow: '0-5min',
        mandatory: true,
        isCritical: true,
        role: ['leader'],
        description: 'Designar líder y comunicar al equipo'
      },
      {
        id: 'f1-4',
        text: 'Equipo de seguridad/desescalada enviado (ETA confirmada)',
        completed: false,
        category: 'safety',
        timeWindow: '0-5min',
        mandatory: true,
        isCritical: false,
        role: ['security', 'leader'],
        description: 'Enviar equipo de seguridad y confirmar tiempo de llegada'
      },
      {
        id: 'f1-5',
        text: 'Capacidad médica de primeros auxilios confirmada',
        completed: false,
        category: 'medical',
        timeWindow: '0-5min',
        mandatory: false,
        isCritical: false,
        role: ['medical', 'leader'],
        description: 'Confirmar disponibilidad de personal médico'
      },
      {
        id: 'f1-6',
        text: 'Ubicación del kit de primeros auxilios verificada',
        completed: false,
        category: 'medical',
        timeWindow: '0-5min',
        mandatory: false,
        isCritical: false,
        role: ['medical', 'logistics'],
        description: 'Verificar ubicación y accesibilidad del kit médico'
      }
    ]
  },
  {
    id: '5-20min',
    label: 'Evaluación en Escena',
    timeRange: '5-20 minutos',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    items: [
      {
        id: 'f2-1',
        text: 'Protocolo P.A.S. iniciado (Proteger, Avisar, Socorrer)',
        completed: false,
        category: 'safety',
        timeWindow: '5-20min',
        mandatory: true,
        isCritical: true,
        role: ['medical', 'leader', 'security'],
        description: 'Iniciar Protocolo de Primeros Auxilios de Socorrismo'
      },
      {
        id: 'f2-2',
        text: 'Actores armados evaluados',
        completed: false,
        category: 'safety',
        timeWindow: '5-20min',
        mandatory: true,
        isCritical: true,
        role: ['security', 'leader'],
        description: 'Evaluar presencia y comportamiento de actores armados'
      },
      {
        id: 'f2-3',
        text: 'Desencadenante de retirada evaluado',
        completed: false,
        category: 'safety',
        timeWindow: '5-20min',
        mandatory: true,
        isCritical: true,
        role: ['security', 'leader'],
        description: 'Determinar si se cumplen condiciones para retirada'
      },
      {
        id: 'f2-4',
        text: 'Menores presentes identificados',
        completed: false,
        category: 'safety',
        timeWindow: '5-20min',
        mandatory: true,
        isCritical: false,
        role: ['leader', 'medical', 'security'],
        description: 'Identificar y contar menores en el lugar'
      },
      {
        id: 'f2-5',
        text: 'Seguridad infantil activada',
        completed: false,
        category: 'safety',
        timeWindow: '5-20min',
        mandatory: true,
        isCritical: false,
        role: ['leader', 'medical'],
        description: 'Implementar medidas especiales de protección para menores'
      },
      {
        id: 'f2-6',
        text: 'Presencia de policía/autoridades documentada',
        completed: false,
        category: 'documentation',
        timeWindow: '5-20min',
        mandatory: true,
        isCritical: false,
        role: ['legal', 'leader'],
        description: 'Documentar tipo y número de autoridades presentes'
      },
      {
        id: 'f2-7',
        text: 'Identificación solicitada si es seguro',
        completed: false,
        category: 'legal',
        timeWindow: '5-20min',
        mandatory: false,
        isCritical: false,
        role: ['legal', 'leader'],
        description: 'Solicitar identificación de autoridades si no hay riesgo'
      },
      {
        id: 'f2-8',
        text: 'Testigos localizados (mínimo 2 identificados)',
        completed: false,
        category: 'documentation',
        timeWindow: '5-20min',
        mandatory: true,
        isCritical: false,
        role: ['legal', 'leader'],
        description: 'Identificar y localizar al menos 2 testigos'
      }
    ]
  },
  {
    id: '20-45min',
    label: 'Documentación y Escalación',
    timeRange: '20-45 minutos',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    items: [
      {
        id: 'f3-1',
        text: 'Registro de incidente completo (entradas con marca de tiempo)',
        completed: false,
        category: 'documentation',
        timeWindow: '20-45min',
        mandatory: true,
        isCritical: true,
        role: ['leader', 'legal', 'dispatch'],
        description: 'Completar registro detallado con todas las timestamps'
      },
      {
        id: 'f3-2',
        text: 'Enrutamiento de quejas de DH determinado (CDHCM/CNDH seleccionado)',
        completed: false,
        category: 'legal',
        timeWindow: '20-45min',
        mandatory: true,
        isCritical: false,
        role: ['legal', 'leader'],
        description: 'Determinar a qué instancia de DH se dirigirá la queja'
      },
      {
        id: 'f3-3',
        text: 'Nivel de alerta de coalición evaluado',
        completed: false,
        category: 'communication',
        timeWindow: '20-45min',
        mandatory: true,
        isCritical: false,
        role: ['leader', 'dispatch'],
        description: 'Evaluar si es necesario activar alerta a la coalición'
      },
      {
        id: 'f3-4',
        text: 'Consentimiento del sobreviviente verificado',
        completed: false,
        category: 'legal',
        timeWindow: '20-45min',
        mandatory: true,
        isCritical: true,
        role: ['legal', 'leader'],
        description: 'Obtener y documentar consentimiento informado'
      },
      {
        id: 'f3-5',
        text: 'Activación de albergue/punto seguro (capacidad confirmada)',
        completed: false,
        category: 'logistics',
        timeWindow: '20-45min',
        mandatory: false,
        isCritical: false,
        role: ['logistics', 'leader'],
        description: 'Confirmar punto seguro con capacidad suficiente'
      },
      {
        id: 'f3-6',
        text: 'Riesgo de represalia evaluado',
        completed: false,
        category: 'safety',
        timeWindow: '20-45min',
        mandatory: true,
        isCritical: true,
        role: ['security', 'leader'],
        description: 'Evaluar riesgo de represalias contra sobrevivientes'
      },
      {
        id: 'f3-7',
        text: 'Sistema de acompañamiento asignado',
        completed: false,
        category: 'follow_up',
        timeWindow: '20-45min',
        mandatory: false,
        isCritical: false,
        role: ['leader', 'dispatch'],
        description: 'Asignar persona de acompañamiento a sobrevivientes'
      }
    ]
  },
  {
    id: '45-60min',
    label: 'Estabilización y Seguimiento',
    timeRange: '45-60 minutos',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    items: [
      {
        id: 'f4-1',
        text: 'Documentación fotográfica/video completada',
        completed: false,
        category: 'documentation',
        timeWindow: '45-60min',
        mandatory: true,
        isCritical: false,
        role: ['legal', 'leader'],
        description: 'Completar documentación visual de la evidencia'
      },
      {
        id: 'f4-2',
        text: 'Información de contacto de testigos asegurada',
        completed: false,
        category: 'documentation',
        timeWindow: '45-60min',
        mandatory: true,
        isCritical: false,
        role: ['legal', 'leader'],
        description: 'Obtener y verificar datos de contacto de testigos'
      },
      {
        id: 'f4-3',
        text: 'Declaración del sobreviviente registrada',
        completed: false,
        category: 'documentation',
        timeWindow: '45-60min',
        mandatory: true,
        isCritical: true,
        role: ['legal', 'leader'],
        description: 'Registrar declaración completa del sobreviviente'
      },
      {
        id: 'f4-4',
        text: 'Documentación de lesiones completada',
        completed: false,
        category: 'medical',
        timeWindow: '45-60min',
        mandatory: true,
        isCritical: false,
        role: ['medical', 'leader'],
        description: 'Documentar todas las lesiones observadas'
      },
      {
        id: 'f4-5',
        text: 'Cadena de custodia iniciada',
        completed: false,
        category: 'legal',
        timeWindow: '45-60min',
        mandatory: true,
        isCritical: true,
        role: ['legal', 'leader'],
        description: 'Iniciar cadena de custodia para evidencia'
      },
      {
        id: 'f4-6',
        text: 'Comunicación con coalición establecida',
        completed: false,
        category: 'communication',
        timeWindow: '45-60min',
        mandatory: true,
        isCritical: false,
        role: ['leader', 'dispatch'],
        description: 'Establecer comunicación formal con coalición de apoyo'
      },
      {
        id: 'f4-7',
        text: 'Plan de seguimiento definido',
        completed: false,
        category: 'follow_up',
        timeWindow: '45-60min',
        mandatory: true,
        isCritical: false,
        role: ['leader', 'dispatch'],
        description: 'Definir próximos pasos y plan de seguimiento'
      }
    ]
  }
]

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function generateItemId(phaseId: string, index: number): string {
  return `${phaseId}-item-${index}`
}

function getCategoryIcon(category: ChecklistItem['category']) {
  const icons: Record<ChecklistItem['category'], React.ReactNode> = {
    'safety': <Shield className="w-4 h-4" />,
    'legal': <FileText className="w-4 h-4" />,
    'documentation': <Camera className="w-4 h-4" />,
    'medical': <Activity className="w-4 h-4" />,
    'communication': <Phone className="w-4 h-4" />,
    'logistics': <MapPin className="w-4 h-4" />,
    'follow_up': <CheckCircle2 className="w-4 h-4" />
  }
  return icons[category]
}

function getCategoryLabel(category: ChecklistItem['category']) {
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

function getRoleLabel(role: TeamRole) {
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

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const EmergencyChecklist: React.FC<EmergencyChecklistProps> = ({
  incidentId,
  onItemComplete,
  onPhaseChange,
  onExport
}) => {
  const store = useProtocoloStore()
  const currentUser = store.currentUser
  const [expandedPhases, setExpandedPhases] = useState<Set<EmergencyPhase>>(new Set(['0-5min']))
  const [currentPhase, setCurrentPhase] = useState<EmergencyPhase>('0-5min')
  const [filter, setFilter] = useState<FilterState>({
    byRole: null,
    showCompleted: true,
    showCriticalOnly: false
  })
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [uncheckingItem, setUncheckingItem] = useState<string | null>(null)
  const [uncheckReason, setUncheckReason] = useState('')
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'pending'>('synced')

  // Checklist state from store
  const checklist = store.checklists[incidentId] || []
  const progress = store.getProgress(incidentId)

  // Initialize checklist if needed
  useEffect(() => {
    if (!store.checklists[incidentId]) {
      // Initialize with our data structure
      const initialItems: ChecklistItem[] = PHASES_DATA.flatMap(phase =>
        phase.items.map((item, index) => ({
          ...item,
          id: generateItemId(phase.id, index),
          completed: false,
          category: item.category,
          timeWindow: item.timeWindow,
          mandatory: item.mandatory
        }))
      )
      
      store.checklists[incidentId] = initialItems
    }
  }, [incidentId, store])

  // Online status listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Get items for a specific phase
  const getPhaseItems = useCallback((phaseId: EmergencyPhase): ChecklistItemData[] => {
    const phaseData = PHASES_DATA.find(p => p.id === phaseId)
    if (!phaseData) return []

    const storedItems = checklist.filter(item => item.timeWindow === phaseId)
    
    return phaseData.items.map((templateItem, index) => {
      const storedItem = storedItems.find(si => si.id === generateItemId(phaseId, index))
      return {
        ...templateItem,
        id: generateItemId(phaseId, index),
        completed: storedItem?.completed || false,
        timestamp: storedItem?.timestamp,
        completedBy: storedItem?.completedBy
      }
    })
  }, [checklist])

  // Filter items
  const getFilteredItems = useCallback((items: ChecklistItemData[]) => {
    return items.filter(item => {
      if (!filter.showCompleted && item.completed) return false
      if (filter.showCriticalOnly && !item.isCritical) return false
      if (filter.byRole && item.role && !item.role.includes(filter.byRole)) return false
      return true
    })
  }, [filter])

  // Toggle phase expansion
  const togglePhase = (phaseId: EmergencyPhase) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev)
      if (newSet.has(phaseId)) {
        newSet.delete(phaseId)
      } else {
        newSet.add(phaseId)
      }
      return newSet
    })
    setCurrentPhase(phaseId)
    onPhaseChange?.(phaseId)
  }

  // Handle item check/uncheck
  const handleToggleItem = (itemId: string, currentCompleted: boolean) => {
    if (!currentUser) return

    if (currentCompleted) {
      // Show confirmation dialog for unchecking
      setUncheckingItem(itemId)
    } else {
      // Complete item
      store.toggleItem(incidentId, itemId, currentUser.pseudonym)
      onItemComplete?.(itemId, true)
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }

      // Simulate sync
      setSyncStatus('syncing')
      setTimeout(() => setSyncStatus('synced'), 500)
    }
  }

  // Confirm uncheck
  const confirmUncheck = () => {
    if (uncheckingItem && currentUser) {
      store.toggleItem(incidentId, uncheckingItem, currentUser.pseudonym)
      onItemComplete?.(uncheckingItem, false)
      setUncheckingItem(null)
      setUncheckReason('')
    }
  }

  // Calculate phase progress
  const getPhaseProgress = (phaseId: EmergencyPhase): number => {
    return store.getPhaseProgress(incidentId, phaseId)
  }

  // Calculate total stats
  const stats = useMemo(() => {
    const total = checklist.length
    const completed = checklist.filter(i => i.completed).length
    const critical = checklist.filter(i => {
      const template = PHASES_DATA.flatMap(p => p.items).find(ti => ti.id === i.id)
      return template?.isCritical && !i.completed
    }).length
    const mandatory = checklist.filter(i => i.mandatory && !i.completed).length

    return { total, completed, critical, mandatory, progress: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }, [checklist])

  // Navigate to next/prev phase
  const navigatePhase = (direction: 'next' | 'prev') => {
    const phases: EmergencyPhase[] = ['0-5min', '5-20min', '20-45min', '45-60min']
    const currentIndex = phases.indexOf(currentPhase)
    
    let newIndex: number
    if (direction === 'next') {
      newIndex = Math.min(currentIndex + 1, phases.length - 1)
    } else {
      newIndex = Math.max(currentIndex - 1, 0)
    }
    
    const newPhase = phases[newIndex]
    setCurrentPhase(newPhase)
    setExpandedPhases(prev => new Set([...prev, newPhase]))
    onPhaseChange?.(newPhase)
  }

  // Export to PDF/Print
  const handleExport = () => {
    window.print()
    onExport?.()
  }

  // Share checklist
  const handleShare = async () => {
    const shareData = {
      title: `Checklist - Incidente ${incidentId}`,
      text: `Progreso: ${stats.progress}% completado`,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (_err) {
        // Share dismissed by user
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`)
      alert('Enlace copiado al portapapeles')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-lg mx-auto px-4 py-4">
          {/* Title and Actions */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Checklist de Respuesta
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Incidente: {incidentId}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showFilterPanel 
                    ? "bg-blue-100 text-blue-600" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Filter className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleExport}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <Printer className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progreso General
              </span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.progress}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 to-green-500 transition-all duration-500"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{stats.completed}/{stats.total} items</span>
              {stats.critical > 0 && (
                <span className="text-red-600 font-medium">
                  {stats.critical} críticos pendientes
                </span>
              )}
              {stats.mandatory > 0 && (
                <span className="text-orange-600 font-medium">
                  {stats.mandatory} obligatorios pendientes
                </span>
              )}
            </div>
          </div>

          {/* Sync Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">En línea</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-orange-600" />
                  <span className="text-orange-600">Modo offline</span>
                </>
              )}
              <span className="text-gray-400">•</span>
              <span className={cn(
                syncStatus === 'synced' ? 'text-green-600' :
                syncStatus === 'syncing' ? 'text-blue-600' : 'text-orange-600'
              )}>
                {syncStatus === 'synced' ? 'Sincronizado' :
                 syncStatus === 'syncing' ? 'Sincronizando...' : 'Pendiente'}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Usuario: {currentUser?.pseudonym || 'No autenticado'}
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilterPanel && (
          <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="max-w-lg mx-auto px-4 py-3 space-y-3">
              {/* Role Filter */}
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Filtrar por rol
                </label>
                <select
                  value={filter.byRole || ''}
                  onChange={(e) => setFilter({ ...filter, byRole: e.target.value as TeamRole || null })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="">Todos los roles</option>
                  {(['leader', 'security', 'medical', 'legal', 'dispatch', 'logistics'] as TeamRole[]).map(role => (
                    <option key={role} value={role}>{getRoleLabel(role)}</option>
                  ))}
                </select>
              </div>

              {/* Show/Hide Filters */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filter.showCompleted}
                    onChange={(e) => setFilter({ ...filter, showCompleted: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  Mostrar completados
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filter.showCriticalOnly}
                    onChange={(e) => setFilter({ ...filter, showCriticalOnly: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  Solo críticos
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Phase Navigation */}
        <div className="border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-lg mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigatePhase('prev')}
                disabled={currentPhase === '0-5min'}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {PHASES_DATA.find(p => p.id === currentPhase)?.label}
              </div>
              
              <button
                onClick={() => navigatePhase('next')}
                disabled={currentPhase === '45-60min'}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {PHASES_DATA.map((phase) => {
          const isExpanded = expandedPhases.has(phase.id)
          const phaseItems = getPhaseItems(phase.id)
          const filteredItems = getFilteredItems(phaseItems)
          const phaseProgress = getPhaseProgress(phase.id)
          const completedCount = phaseItems.filter(i => i.completed).length

          return (
            <Card 
              key={phase.id}
              className={cn(
                "overflow-hidden transition-all duration-300",
                phase.borderColor
              )}
            >
              {/* Phase Header */}
              <CardHeader 
                className={cn(
                  "p-4 cursor-pointer transition-colors",
                  phase.bgColor,
                  "hover:opacity-90"
                )}
                onClick={() => togglePhase(phase.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-4 h-4 rounded-full", phase.color.replace('text-', 'bg-'))} />
                    <div>
                      <CardTitle className={cn("text-lg", phase.color)}>
                        {phase.label}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {phase.timeRange}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {phaseProgress}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {completedCount}/{phaseItems.length}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Phase Progress Bar */}
                <div className="mt-3 h-2 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full transition-all duration-500", phase.color.replace('text-', 'bg-'))}
                    style={{ width: `${phaseProgress}%` }}
                  />
                </div>
              </CardHeader>

              {/* Phase Items */}
              {isExpanded && (
                <CardContent className="p-0">
                  {filteredItems.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No hay items que coincidan con los filtros</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredItems.map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            "p-4 transition-all",
                            item.completed 
                              ? "bg-green-50/50 dark:bg-green-900/10" 
                              : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {/* Checkbox */}
                            <button
                              onClick={() => handleToggleItem(item.id, item.completed)}
                              className={cn(
                                "mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                                item.completed
                                  ? "bg-green-500 text-white"
                                  : "border-2 border-gray-300 dark:border-gray-600 hover:border-green-500"
                              )}
                            >
                              {item.completed && <Check className="w-4 h-4" />}
                            </button>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className={cn(
                                "text-sm leading-relaxed",
                                item.completed
                                  ? "text-gray-600 dark:text-gray-400 line-through"
                                  : "text-gray-900 dark:text-white font-medium"
                              )}>
                                {item.text}
                              </div>

                              {/* Meta info */}
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                {/* Category badge */}
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded">
                                  {getCategoryIcon(item.category)}
                                  {getCategoryLabel(item.category)}
                                </span>

                                {/* Critical badge */}
                                {item.isCritical && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded font-medium">
                                    <AlertCircle className="w-3 h-3" />
                                    Crítico
                                  </span>
                                )}

                                {/* Mandatory badge */}
                                {item.mandatory && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs rounded">
                                    <Lock className="w-3 h-3" />
                                    Obligatorio
                                  </span>
                                )}

                                {/* Roles */}
                                {item.role && item.role.length > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">
                                    <User className="w-3 h-3" />
                                    {item.role.map(getRoleLabel).join(', ')}
                                  </span>
                                )}
                              </div>

                              {/* Timestamp */}
                              {item.completed && item.timestamp && (
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    Completado: {new Date(item.timestamp).toLocaleTimeString('es-MX', { 
                                      hour: '2-digit', 
                                      minute: '2-digit',
                                      second: '2-digit'
                                    })}
                                  </span>
                                  {item.completedBy && (
                                    <>
                                      <span>•</span>
                                      <span>Por: {item.completedBy}</span>
                                    </>
                                  )}
                                </div>
                              )}

                              {/* Description (if not completed) */}
                              {item.description && !item.completed && (
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}
      </main>

      {/* Uncheck Confirmation Modal */}
      {uncheckingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                ¿Desmarcar item?
              </h3>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Esto eliminará el registro de completado. Por favor, indica la razón:
            </p>
            
            <textarea
              value={uncheckReason}
              onChange={(e) => setUncheckReason(e.target.value)}
              placeholder="Razón para desmarcar (opcional)"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 mb-4"
              rows={3}
            />
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setUncheckingItem(null)
                  setUncheckReason('')
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={confirmUncheck}
                disabled={!uncheckReason.trim()}
              >
                Desmarcar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          header, .no-print {
            display: none !important;
          }
          
          body {
            background: white !important;
          }
          
          .card {
            break-inside: avoid;
            border: 1px solid #ddd !important;
            margin-bottom: 1rem !important;
          }
          
          .check-completed {
            text-decoration: line-through;
            color: #666;
          }
        }
      `}</style>
    </div>
  )
}

export default EmergencyChecklist