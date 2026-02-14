import React from 'react'
import { AlertTriangle, Shield } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useProtocoloStore } from '@/store'

interface HeaderProps {
  onEmergencyPress?: () => void
}

export function Header({ onEmergencyPress }: HeaderProps) {
  const activeIncident = useProtocoloStore((state) => state.getActiveIncident())
  const isEmergencyMode = activeIncident && ['high', 'critical', 'extreme'].includes(activeIncident.threatLevel)
  
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-top border-b",
      isEmergencyMode && "bg-destructive text-destructive-foreground border-destructive"
    )}>
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        {/* Logo and Title */}
        <div className="flex items-center space-x-2">
          <Shield className={cn(
            "w-7 h-7",
            isEmergencyMode ? "text-destructive-foreground" : "text-primary"
          )} />
          <div className="flex flex-col">
            <span className={cn(
              "font-bold text-lg leading-tight",
              isEmergencyMode && "text-destructive-foreground"
            )}>
              Protocolo CDMX
            </span>
            <span className={cn(
              "text-xs text-muted-foreground",
              isEmergencyMode && "text-destructive-foreground/80"
            )}>
              Apoyo Comunitario
            </span>
          </div>
        </div>
        
        {/* Emergency Button */}
        <Button
          variant={isEmergencyMode ? "secondary" : "destructive"}
          size="sm"
          onClick={onEmergencyPress}
          className={cn(
            "flex items-center space-x-1 px-3",
            !isEmergencyMode && "emergency-pulse"
          )}
        >
          <AlertTriangle className="w-4 h-4" />
          <span className="hidden sm:inline">Emergencia</span>
        </Button>
      </div>
    </header>
  )
}
