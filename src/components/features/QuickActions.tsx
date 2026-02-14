/**
 * Quick Actions Component
 * Protocolo CDMX
 * 
 * Floating action buttons for rapid access to critical features
 */

import React, { useState } from 'react'
import { 
  Plus, 
  Phone, 
  Camera, 
  X,
  AlertTriangle,
  FileText,
  MapPin,
  Mic
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TeamRole } from '@/types'
import { getRoleDefinition } from '@/lib/roles'

// =============================================================================
// TYPES
// =============================================================================

interface QuickActionsProps {
  role: TeamRole
  onEmergencyPress?: () => void
  onCameraPress?: () => void
  onReportPress?: () => void
  onLocationPress?: () => void
  onAudioPress?: () => void
  className?: string
}

interface ActionButton {
  id: string
  icon: typeof Plus
  label: string
  color: string
  onClick: () => void
  priority?: boolean
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const QuickActions: React.FC<QuickActionsProps> = ({
  role,
  onEmergencyPress,
  onCameraPress,
  onReportPress,
  onLocationPress,
  onAudioPress,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const definition = getRoleDefinition(role)

  const actions: ActionButton[] = [
    {
      id: 'emergency',
      icon: AlertTriangle,
      label: 'Emergencia',
      color: 'bg-red-600 hover:bg-red-700',
      onClick: () => {
        onEmergencyPress?.()
        setIsExpanded(false)
      },
      priority: true
    },
    {
      id: 'camera',
      icon: Camera,
      label: 'Evidencia',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => {
        onCameraPress?.()
        setIsExpanded(false)
      }
    },
    {
      id: 'audio',
      icon: Mic,
      label: 'Audio',
      color: 'bg-purple-600 hover:bg-purple-700',
      onClick: () => {
        onAudioPress?.()
        setIsExpanded(false)
      }
    },
    {
      id: 'report',
      icon: FileText,
      label: 'Reporte',
      color: 'bg-green-600 hover:bg-green-700',
      onClick: () => {
        onReportPress?.()
        setIsExpanded(false)
      }
    },
    {
      id: 'location',
      icon: MapPin,
      label: 'Ubicación',
      color: 'bg-orange-600 hover:bg-orange-700',
      onClick: () => {
        onLocationPress?.()
        setIsExpanded(false)
      }
    }
  ]

  // Sort priority actions first
  const sortedActions = [...actions].sort((a, b) => 
    (a.priority ? -1 : 0) - (b.priority ? -1 : 0)
  )

  return (
    <div className={cn("fixed bottom-20 right-4 z-40", className)}>
      {/* Expanded Actions */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 flex flex-col-reverse gap-3 mb-2">
          {sortedActions.map((action, index) => {
            const ActionIcon = action.icon
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-full shadow-lg",
                  "transform transition-all duration-200",
                  action.color,
                  "text-white",
                  isExpanded && "translate-y-0 opacity-100",
                  !isExpanded && "translate-y-4 opacity-0"
                )}
                style={{
                  transitionDelay: `${index * 50}ms`
                }}
              >
                <ActionIcon className="w-5 h-5" />
                <span className="text-sm font-medium pr-2 whitespace-nowrap">
                  {action.label}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg flex items-center justify-center",
          "transform transition-all duration-200",
          isExpanded 
            ? "bg-gray-800 rotate-45" 
            : definition.bgColor
        )}
        aria-label={isExpanded ? "Cerrar menú" : "Abrir menú de acciones"}
      >
        {isExpanded ? (
          <Plus className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Overlay */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  )
}

export default QuickActions
