/**
 * TopHeader Component
 * Protocolo CDMX
 * 
 * Fixed header with app branding, role indicator, emergency button,
 * status indicators, and menu button
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Shield, 
  AlertTriangle, 
  Menu, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle,
  AlertCircle,
  User,
  ChevronDown
} from 'lucide-react'
import {
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui'
import { cn } from '@/lib/utils'
import { useProtocoloStore } from '@/store'

interface TopHeaderProps {
  onMenuClick?: () => void
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate()
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false)
  
  // Get store state
  const activeIncident = useProtocoloStore((state) => state.getActiveIncident?.())
  const currentUser = useProtocoloStore((state) => state.currentUser)
  const isOnline = true
  const syncStatus = 'synced' as string
  const lastSync = null as string | null
  
  // Determine emergency mode
  const isEmergencyMode = activeIncident && ['high', 'critical', 'extreme'].includes(activeIncident.threatLevel)
  
  // Handle emergency button press
  const handleEmergencyPress = () => {
    setShowEmergencyDialog(true)
  }
  
  // Confirm emergency activation
  const confirmEmergency = () => {
    setShowEmergencyDialog(false)
    navigate('/emergency')
  }
  
  // Get sync status icon and color
  const getSyncStatus = () => {
    switch (syncStatus) {
      case 'syncing':
        return { icon: <RefreshCw className="w-4 h-4 animate-spin" />, color: 'text-blue-500', label: 'Sincronizando' }
      case 'pending':
        return { icon: <AlertCircle className="w-4 h-4" />, color: 'text-yellow-500', label: 'Pendiente' }
      case 'error':
        return { icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-500', label: 'Error' }
      default:
        return { icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-500', label: 'Sincronizado' }
    }
  }
  
  const syncInfo = getSyncStatus()
  const roleLabels: Record<string, string> = {
    leader: 'Coordinador',
    security: 'Seguridad',
    medical: 'Médico',
    legal: 'Legal',
    dispatch: 'Dispatch',
    logistics: 'Logística',
    observer: 'Observador',
    admin: 'Administrador'
  }

  return (
    <TooltipProvider>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "border-b border-border safe-area-top",
        isEmergencyMode && "bg-destructive text-destructive-foreground border-destructive"
      )}>
        <div className="flex items-center justify-between h-14 px-4 max-w-7xl mx-auto">
          {/* Left Section: Menu Button + Logo */}
          <div className="flex items-center gap-3">
            {/* Menu Button - Hidden on desktop (lg+) when sidebar is visible */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              aria-label="Abrir menú"
              className={cn(
                "lg:hidden",
                isEmergencyMode && "hover:bg-destructive-foreground/10"
              )}
            >
              <Menu className={cn(
                "w-6 h-6",
                isEmergencyMode ? "text-destructive-foreground" : "text-foreground"
              )} />
            </Button>
            
            {/* Logo and App Name */}
            <div className="flex items-center gap-2">
              <Shield className={cn(
                "w-7 h-7",
                isEmergencyMode ? "text-destructive-foreground" : "text-primary"
              )} />
              <div className="flex flex-col">
                <span className={cn(
                  "font-bold text-lg leading-tight hidden sm:block",
                  isEmergencyMode && "text-destructive-foreground"
                )}>
                  Protocolo CDMX
                </span>
                <span className={cn(
                  "text-xs text-muted-foreground hidden sm:block",
                  isEmergencyMode && "text-destructive-foreground/80"
                )}>
                  Apoyo Comunitario
                </span>
              </div>
            </div>
          </div>
          
          {/* Center Section: Status Indicators */}
          <div className="hidden md:flex items-center gap-4">
            {/* Online/Offline Status */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs",
                  isOnline ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  <span>{isOnline ? 'En línea' : 'Sin conexión'}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isOnline ? 'Conexión activa' : 'Trabajando sin conexión'}</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Sync Status */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs",
                  syncInfo.color.replace('text-', 'bg-').replace('500', '100'),
                  syncInfo.color.replace('text-', '')
                )}>
                  {syncInfo.icon}
                  <span className="hidden sm:inline">{syncInfo.label}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Última sincronización: {lastSync ? new Date(lastSync).toLocaleString('es-MX') : 'Nunca'}</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Active Incident Indicator */}
            {activeIncident && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="destructive" 
                    className="animate-pulse cursor-pointer"
                    onClick={() => navigate(`/incident/${activeIncident.id}`)}
                  >
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Incidente Activo
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ver detalles del incidente</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          
          {/* Right Section: Role + Emergency */}
          <div className="flex items-center gap-2">
            {/* Role Dropdown */}
            {currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={cn(
                      "hidden sm:flex items-center gap-2",
                      isEmergencyMode && "hover:bg-destructive-foreground/10"
                    )}
                  >
                    <User className="w-4 h-4" />
                    <span className="max-w-[100px] truncate">
                      {currentUser.pseudonym || 'Usuario'}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="flex flex-col items-start">
                    <span className="font-medium">{currentUser.pseudonym}</span>
                    <span className="text-xs text-muted-foreground">
                      {roleLabels[currentUser.role] || currentUser.role}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Emergency Button */}
            <Button
              variant={isEmergencyMode ? "secondary" : "destructive"}
              size="sm"
              onClick={handleEmergencyPress}
              className={cn(
                "flex items-center gap-2 px-4 font-semibold",
                !isEmergencyMode && "animate-pulse hover:animate-none"
              )}
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Emergencia</span>
            </Button>
          </div>
        </div>
        
        {/* Mobile Status Bar */}
        <div className="md:hidden flex items-center justify-center gap-4 px-4 pb-2 text-xs">
          <span className={cn(
            "flex items-center gap-1",
            isOnline ? "text-green-600" : "text-red-600"
          )}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? 'En línea' : 'Sin conexión'}
          </span>
          {activeIncident && (
            <Badge variant="destructive" className="text-xs animate-pulse">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Incidente Activo
            </Badge>
          )}
        </div>
      </header>
      
      {/* Emergency Confirmation Dialog */}
      <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-6 h-6" />
              Confirmar Alerta de Emergencia
            </DialogTitle>
            <DialogDescription>
              Estás a punto de activar el modo de respuesta de emergencia. Esto:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 py-4">
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>Activará el protocolo de respuesta inmediata</li>
              <li>Notificará a tu equipo y coalición</li>
              <li>Iniciará la documentación automática</li>
              <li>Compartirá tu ubicación con el equipo</li>
            </ul>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEmergencyDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmEmergency}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Activar Emergencia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

export default TopHeader
