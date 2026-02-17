/**
 * Role Switcher Component
 * Protocolo CDMX
 * 
 * Allows users to switch between roles and access different dashboards
 */

import React, { useState } from 'react'
import { 
  ChevronDown, 
  UserCheck,
  Shield,
  Heart,
  Scale,
  Phone,
  Package,
  Users
} from 'lucide-react'
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { TeamRole } from '@/types'
import { getRoleDefinition, type CertificationLevel } from '@/lib/roles'

// =============================================================================
// TYPES
// =============================================================================

interface RoleSwitcherProps {
  currentRole: TeamRole
  userCertificationLevel: CertificationLevel
  userPseudonym: string
  onRoleChange: (role: TeamRole) => void
  className?: string
}

// Role icons mapping
const roleIcons: Record<TeamRole, typeof Users> = {
  leader: Users,
  security: Shield,
  medical: Heart,
  legal: Scale,
  dispatch: Phone,
  logistics: Package
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentRole,
  userCertificationLevel,
  userPseudonym,
  onRoleChange,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const currentDefinition = getRoleDefinition(currentRole)
  const CurrentIcon = roleIcons[currentRole]

  const allRoles: TeamRole[] = ['leader', 'security', 'medical', 'legal', 'dispatch', 'logistics']

  return (
    <>
      {/* Current Role Button */}
      <Button
        variant="ghost"
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl",
          currentDefinition.bgColor.replace('600', '50'),
          currentDefinition.textColor,
          className
        )}
      >
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          currentDefinition.bgColor
        )}>
          <CurrentIcon className="w-4 h-4 text-white" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium">
            {currentDefinition.name}
          </p>
          <p className="text-xs opacity-80">
            {userPseudonym}
          </p>
        </div>
        <ChevronDown className="w-4 h-4 opacity-60" />
      </Button>

      {/* Role Selection Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Cambiar Rol
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Selecciona tu rol actual en el equipo:
            </p>
            
            {allRoles.map((role) => {
              const definition = getRoleDefinition(role)
              const RoleIcon = roleIcons[role]
              const isActive = role === currentRole
              const isAvailable = definition.certificationRequired <= userCertificationLevel
              
              return (
                <button
                  key={role}
                  onClick={() => {
                    if (isAvailable) {
                      onRoleChange(role)
                      setIsOpen(false)
                    }
                  }}
                  disabled={!isAvailable}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all",
                    isActive 
                      ? [definition.borderColor, definition.bgColor.replace('600', '50')]
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900",
                    isAvailable && !isActive && "hover:border-gray-300 dark:hover:border-gray-600",
                    !isAvailable && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      isActive ? definition.bgColor : "bg-gray-100 dark:bg-gray-800"
                    )}>
                      <RoleIcon className={cn(
                        "w-6 h-6",
                        isActive ? "text-white" : "text-gray-500"
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {definition.name}
                        </h3>
                        {isActive && (
                          <Badge 
                            variant="secondary" 
                            className={cn("text-[10px]", definition.bgColor, "text-white")}
                          >
                            Activo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {definition.features[0]}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Cert. mínima: Nivel {definition.certificationRequired}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default RoleSwitcher
