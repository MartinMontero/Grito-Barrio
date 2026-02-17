/**
 * DrawerMenu Component
 * Protocolo CDMX
 * 
 * Side navigation drawer with user profile, navigation links,
 * quick actions, and app information. Supports both drawer and sidebar variants.
 */

import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  AlertTriangle,
  BookOpen,
  Scale,
  Map,
  GraduationCap,
  FileText,
  Settings,
  Phone,
  Shield,
  Users,
  X,
  User,
  Award,
  Clock,
  Info,
  AlertOctagon,
  ChevronRight,
  LogOut
} from 'lucide-react'
import {
  Button,
  Badge,
  Separator,
  Avatar,
  AvatarFallback,
  AvatarImage,
  ScrollArea
} from '@/components/ui'
import { cn } from '@/lib/utils'
import { useProtocoloStore } from '@/store'
import type { UserRole } from '@/types'

interface DrawerMenuProps {
  isOpen: boolean
  onClose: () => void
  variant?: 'drawer' | 'sidebar'
}

interface NavLink {
  id: string
  label: string
  path: string
  icon: React.ElementType
  badge?: number
  requiresRole?: UserRole[]
  requiresCertification?: number
}

interface QuickAction {
  id: string
  label: string
  icon: React.ElementType
  variant: 'default' | 'destructive' | 'outline'
  onClick: () => void
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  variant = 'drawer'
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = useProtocoloStore((state) => state.currentUser)
  const activeIncident = useProtocoloStore((state) => state.getActiveIncident?.())
  const isDuressMode = useProtocoloStore((state) => state.isDuressMode)
  const appVersion = '1.0.0'
  const lastUpdate = null as string | null
  
  const isSidebar = variant === 'sidebar'
  
  // Navigation links
  const navLinks: NavLink[] = [
    { id: 'home', label: 'Inicio', path: '/', icon: Home },
    { 
      id: 'emergency', 
      label: 'Respuesta de Emergencia', 
      path: '/emergency', 
      icon: AlertTriangle,
      badge: activeIncident ? 1 : undefined,
      requiresRole: ['leader', 'security', 'medical', 'legal', 'dispatch', 'logistics', 'admin']
    },
    { id: 'protocols', label: 'Protocolos', path: '/protocols', icon: BookOpen },
    { 
      id: 'legal', 
      label: 'Legal', 
      path: '/legal', 
      icon: Scale,
      requiresRole: ['legal', 'leader', 'admin']
    },
    { id: 'resources', label: 'Recursos', path: '/resources', icon: Map },
    { 
      id: 'training', 
      label: 'Capacitación', 
      path: '/training', 
      icon: GraduationCap 
    },
    { 
      id: 'documentation', 
      label: 'Documentación', 
      path: '/documentation', 
      icon: FileText,
      requiresCertification: 1
    },
    { id: 'settings', label: 'Configuración', path: '/settings', icon: Settings }
  ]
  
  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'alert',
      label: 'Activar Alerta',
      icon: AlertTriangle,
      variant: 'destructive',
      onClick: () => {
        navigate('/emergency')
        onClose()
      }
    },
    {
      id: 'coalition',
      label: 'Contactar Coalición',
      icon: Users,
      variant: 'outline',
      onClick: () => {
        navigate('/resources/contacts')
        onClose()
      }
    },
    {
      id: 'duress',
      label: isDuressMode ? 'Desactivar Modo Dureza' : 'Modo Dureza',
      icon: Shield,
      variant: isDuressMode ? 'default' : 'outline',
      onClick: () => {
        // Toggle duress mode
        onClose()
      }
    }
  ]
  
  // Filter links based on user role and certification
  const filteredLinks = navLinks.filter(link => {
    if (link.requiresRole && currentUser) {
      return link.requiresRole.includes(currentUser.role)
    }
    if (link.requiresCertification && currentUser) {
      return currentUser.certificationLevel >= link.requiresCertification
    }
    return true
  })
  
  // Handle navigation
  const handleNavigate = (path: string) => {
    navigate(path)
    if (!isSidebar) {
      onClose()
    }
  }
  
  // Get certification level label
  const getCertLabel = (level: number) => {
    switch (level) {
      case 1: return 'Nivel 1 - Básico'
      case 2: return 'Nivel 2 - Intermedio'
      case 3: return 'Nivel 3 - Avanzado'
      default: return 'Sin certificación'
    }
  }
  
  // Get role label
  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      leader: 'Coordinador',
      security: 'Seguridad',
      medical: 'Médico',
      legal: 'Legal',
      dispatch: 'Dispatch',
      logistics: 'Logística',
      observer: 'Observador',
      admin: 'Administrador'
    }
    return labels[role] || role
  }
  
  // Determine if a link is active
  const isLinkActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/home'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Overlay for drawer variant */}
      {!isSidebar && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Drawer/Sidebar Content */}
      <div
        className={cn(
          "bg-background border-r border-border",
          isSidebar
            ? "h-full w-full"
            : cn(
                "fixed top-0 left-0 bottom-0 w-[280px] z-50 lg:hidden",
                "transform transition-transform duration-300 ease-in-out",
                isOpen ? "translate-x-0" : "-translate-x-full"
              )
        )}
      >
        <ScrollArea className="h-full">
          {/* Header with close button for drawer */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">Protocolo CDMX</span>
            </div>
            {!isSidebar && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
          
          {/* User Profile Section */}
          {currentUser && (
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {currentUser.pseudonym?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{currentUser.pseudonym || 'Usuario'}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{getRoleLabel(currentUser.role)}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {currentUser.certificationLevel || 1}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {getCertLabel(currentUser.certificationLevel || 1)}
              </div>
            </div>
          )}
          
          {/* Active Incident Warning */}
          {activeIncident && (
            <div className="p-3 m-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium text-sm">Incidente Activo</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Nivel: {activeIncident.threatLevel}
              </p>
              <Button 
                size="sm" 
                variant="destructive" 
                className="w-full mt-2"
                onClick={() => handleNavigate(`/incident/${activeIncident.id}`)}
              >
                Ver Incidente
              </Button>
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="p-4 space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Acciones Rápidas
            </h3>
            {quickActions.map(action => (
              <Button
                key={action.id}
                variant={action.variant}
                size="sm"
                className="w-full justify-start gap-2"
                onClick={action.onClick}
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </Button>
            ))}
          </div>
          
          <Separator />
          
          {/* Navigation Links */}
          <nav className="p-2">
            {filteredLinks.map(link => {
              const Icon = link.icon
              const isActive = isLinkActive(link.path)
              
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavigate(link.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                    "transition-colors duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1 text-left">{link.label}</span>
                  {link.badge && (
                    <Badge variant={isActive ? "secondary" : "destructive"} className="text-xs">
                      {link.badge}
                    </Badge>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                </button>
              )
            })}
          </nav>
          
          <Separator />
          
          {/* Contact Section */}
          <div className="p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Contacto de Emergencia
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>Línea de Emergencia</span>
            </div>
            <p className="text-lg font-bold text-primary mt-1">55-5555-5555</p>
            <p className="text-xs text-muted-foreground mt-1">
              Disponible 24/7
            </p>
          </div>
          
          <Separator />
          
          {/* App Info */}
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="w-3 h-3" />
              <span>Versión {appVersion}</span>
            </div>
            {lastUpdate && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>
                  Última actualización: {new Date(lastUpdate).toLocaleDateString('es-MX')}
                </span>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Protocolo CDMX © 2025
            </div>
          </div>
          
          {/* Logout Button */}
          <div className="p-4 pt-0">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start gap-2 text-muted-foreground"
              onClick={() => {/* Handle logout */}}
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        </ScrollArea>
      </div>
    </>
  )
}

export default DrawerMenu
