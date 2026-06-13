/**
 * Role Selector Component
 * Protocolo CDMX
 * 
 * First-time role selection with certification requirements
 */

import React, { useState } from 'react'
import {
  Check,
  ChevronRight,
  AlertCircle,
  Award,
  Info,
  Lock,
  ArrowRight,
  UserCheck,
  GraduationCap
} from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { TeamRole, CertificationLevel } from '@/types'
import { 
  AVAILABLE_ROLES,
  ROLE_CERTIFICATION_LABELS,
  checkCertificationLevel,
  getRoleDefinition,
  type CertificationLevel as RoleCertLevel
} from '@/lib/roles'

// =============================================================================
// TYPES
// =============================================================================

interface RoleSelectorProps {
  userCertificationLevel: CertificationLevel
  currentRoles?: TeamRole[]
  onRoleSelect: (roles: TeamRole[]) => void
  onComplete?: () => void
  allowMultiple?: boolean
  isInitialSetup?: boolean
}

interface RoleCardProps {
  role: TeamRole
  isSelected: boolean
  isDisabled: boolean
  userCertLevel: CertificationLevel
  onSelect: () => void
}

// =============================================================================
// SUB-COMPONENT: Role Card
// =============================================================================

const RoleCard: React.FC<RoleCardProps> = ({ 
  role, 
  isSelected, 
  isDisabled, 
  userCertLevel,
  onSelect 
}) => {
  const definition = getRoleDefinition(role)
  const RoleIcon = definition.icon
  const meetsCertification = checkCertificationLevel(userCertLevel, definition.certificationRequired)
  
  return (
    <button
      onClick={onSelect}
      disabled={isDisabled || !meetsCertification}
      className={cn(
        "relative w-full text-left rounded-xl border-2 transition-all duration-200",
        "p-4 sm:p-5",
        isSelected
          ? cn(definition.borderColor, definition.bgColor.replace('bg-', 'bg-opacity-10'))
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
        isDisabled && "opacity-50 cursor-not-allowed",
        !meetsCertification && "opacity-60"
      )}
    >
      {/* Selection Indicator */}
      <div className={cn(
        "absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
        isSelected
          ? cn(definition.bgColor, "border-transparent text-white")
          : "border-gray-300 dark:border-gray-600"
      )}>
        {isSelected && <Check className="w-4 h-4" />}
      </div>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
          definition.bgColor.replace('600', '100'),
          definition.textColor
        )}>
          <RoleIcon className="w-7 h-7" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-8">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              {definition.name}
            </h3>
            {!meetsCertification && (
              <Lock className="w-4 h-4 text-orange-500" />
            )}
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {definition.description}
          </p>

          {/* Certification Badge */}
          <div className="flex items-center gap-2">
            <Badge 
              variant={meetsCertification ? "default" : "secondary"}
              className={cn(
                "text-xs",
                meetsCertification 
                  ? definition.bgColor + " text-white"
                  : "bg-gray-200 text-gray-600"
              )}
            >
              <GraduationCap className="w-3 h-3 mr-1" />
              Nivel {definition.certificationRequired} Requerido
            </Badge>
            
            {isSelected && (
              <Badge 
                variant="outline" 
                className={cn("text-xs", definition.textColor, definition.borderColor)}
              >
                Seleccionado
              </Badge>
            )}
          </div>

          {/* Features Preview */}
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-500 mb-2">
              Funciones principales:
            </p>
            <div className="flex flex-wrap gap-1">
              {definition.features.slice(0, 3).map((feature, i) => (
                <span 
                  key={i}
                  className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded"
                >
                  {feature}
                </span>
              ))}
              {definition.features.length > 3 && (
                <span className="text-xs text-gray-400 px-1">
                  +{definition.features.length - 3} más
                </span>
              )}
            </div>
          </div>

          {/* Lock Message */}
          {!meetsCertification && (
            <div className="mt-3 flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
              <Info className="w-4 h-4" />
              <span>
                Requieres certificación nivel {definition.certificationRequired}. 
                Tu nivel actual: {userCertLevel}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  userCertificationLevel,
  currentRoles = [],
  onRoleSelect,
  onComplete,
  allowMultiple = true,
  isInitialSetup = true
}) => {
  const [selectedRoles, setSelectedRoles] = useState<TeamRole[]>(currentRoles)
  const [step, setStep] = useState<'selection' | 'confirmation'>('selection')
  const [showHelp, setShowHelp] = useState(false)

  const toggleRole = (role: TeamRole) => {
    const definition = getRoleDefinition(role)
    const meetsCert = checkCertificationLevel(userCertificationLevel, definition.certificationRequired)
    
    if (!meetsCert) return

    setSelectedRoles(prev => {
      if (allowMultiple) {
        // Multiple selection mode
        if (prev.includes(role)) {
          return prev.filter(r => r !== role)
        }
        return [...prev, role]
      } else {
        // Single selection mode
        return prev.includes(role) ? [] : [role]
      }
    })
  }

  const handleContinue = () => {
    if (selectedRoles.length > 0) {
      setStep('confirmation')
    }
  }

  const handleConfirm = () => {
    onRoleSelect(selectedRoles)
    onComplete?.()
  }

  const handleBack = () => {
    setStep('selection')
  }

  const availableCount = AVAILABLE_ROLES.filter(role => {
    const def = getRoleDefinition(role)
    return checkCertificationLevel(userCertificationLevel, def.certificationRequired)
  }).length

  // Selection Step
  if (step === 'selection') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-6">
            <div className="text-center">
              {isInitialSetup ? (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                    <UserCheck className="w-8 h-8 text-purple-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Selecciona tu Rol
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Elige el rol o roles que desempeñarás durante la respuesta
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Cambiar Roles
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Modifica los roles asignados a tu perfil
                  </p>
                </>
              )}
            </div>

            {/* User Level Indicator */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <Badge 
                variant="outline" 
                className="px-3 py-1"
              >
                <Award className="w-4 h-4 mr-1 text-yellow-500" />
                Tu nivel: {ROLE_CERTIFICATION_LABELS[userCertificationLevel as RoleCertLevel]}
              </Badge>
              <Badge 
                variant="secondary" 
                className="px-3 py-1"
              >
                {availableCount} roles disponibles
              </Badge>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-lg mx-auto px-4 py-6">
          {/* Help Toggle */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="w-full mb-4 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <Info className="w-4 h-4" />
            {showHelp ? 'Ocultar ayuda' : '¿Cómo elegir un rol?'}
          </button>

          {showHelp && (
            <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Guía de Selección
                </h3>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                  <li>• Puedes seleccionar {allowMultiple ? 'varios roles' : 'un solo rol'}</li>
                  <li>• Algunos roles requieren certificación avanzada</li>
                  <li>• Elige según tu capacitación y experiencia</li>
                  <li>• Los roles bloqueados 🔒 requieren nivel superior</li>
                  <li>• Podrás cambiar de rol durante la respuesta si es necesario</li>
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Selection Counter */}
          {allowMultiple && selectedRoles.length > 0 && (
            <div className="mb-4 flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <span className="text-sm font-medium text-purple-900 dark:text-purple-200">
                {selectedRoles.length} rol{selectedRoles.length !== 1 ? 'es' : ''} seleccionado{selectedRoles.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setSelectedRoles([])}
                className="text-xs text-purple-700 dark:text-purple-400 hover:underline"
              >
                Limpiar selección
              </button>
            </div>
          )}

          {/* Role Cards */}
          <div className="space-y-4">
            {AVAILABLE_ROLES.map(role => (
              <RoleCard
                key={role}
                role={role}
                isSelected={selectedRoles.includes(role)}
                isDisabled={false}
                userCertLevel={userCertificationLevel as RoleCertLevel}
                onSelect={() => toggleRole(role)}
              />
            ))}
          </div>

          {/* Selected Roles Summary */}
          {selectedRoles.length > 0 && (
            <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Roles Seleccionados:
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedRoles.map(role => {
                  const def = getRoleDefinition(role)
                  const Icon = def.icon
                  return (
                    <Badge
                      key={role}
                      className={cn(
                        "px-3 py-1 flex items-center gap-1",
                        def.bgColor + " text-white"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {def.name}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}
        </main>

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="max-w-lg mx-auto">
            <Button
              className="w-full"
              size="lg"
              onClick={handleContinue}
              disabled={selectedRoles.length === 0}
            >
              Continuar
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            {selectedRoles.length === 0 && (
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                Selecciona al menos un rol para continuar
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Confirmation Step
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Volver
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Confirmar Selección
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Revisa los roles seleccionados antes de continuar
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="space-y-4">
          {selectedRoles.map(role => {
            const definition = getRoleDefinition(role)
            const Icon = definition.icon
            
            return (
              <Card 
                key={role}
                className={cn("overflow-hidden", definition.borderColor)}
              >
                <CardHeader className={cn(definition.bgColor.replace('bg-', 'bg-opacity-10'))}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      definition.bgColor,
                      "text-white"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className={definition.textColor}>
                        {definition.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Nivel {definition.certificationRequired} • {ROLE_CERTIFICATION_LABELS[definition.certificationRequired as RoleCertLevel]}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    {definition.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase mb-2">
                        Funciones principales
                      </p>
                      <ul className="space-y-1">
                        {definition.features.map((feature, i) => (
                          <li 
                            key={i}
                            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                          >
                            <Check className="w-4 h-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Warning */}
        <Card className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900 dark:text-yellow-200">
                  Importante
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                  Solo asume roles para los que estás capacitado. La seguridad del equipo 
                  y de los sobrevivientes depende de que cada persona cumpla su función 
                  correctamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="max-w-lg mx-auto space-y-3">
          <Button
            className="w-full"
            size="lg"
            onClick={handleConfirm}
          >
            <Check className="w-5 h-5 mr-2" />
            Confirmar y Continuar
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={handleBack}
          >
            Modificar Selección
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RoleSelector
