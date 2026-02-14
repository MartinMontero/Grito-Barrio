/**
 * Duress Mode Component
 * Protocolo CDMX
 * 
 * UI for duress mode - displays fake data and provides hidden access
 */

import React, { useState, useEffect, useCallback } from 'react'
import { 
  AlertTriangle, 
  Shield, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Clock,
  Trash2,
  AlertOctagon,
  ChevronRight,
  X
} from 'lucide-react'
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Alert,
  AlertTitle,
  AlertDescription,
  Badge,
  Progress,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui'
import { cn } from '@/lib/utils'
import { securityManager } from '@/lib/security'
import type { Incident } from '@/types'

// =============================================================================
// TYPES
// =============================================================================

interface DuressModeProps {
  onExit: () => void
  className?: string
}

interface FakeIncident {
  id: string
  title: string
  location: string
  status: string
  timestamp: string
}

// =============================================================================
// FAKE DATA
// =============================================================================

const FAKE_INCIDENTS: FakeIncident[] = [
  {
    id: 'CDMX-2024-01-15-1430-001',
    title: 'Desalojo en Colonia Roma',
    location: 'Calle Durango 123, Roma Norte',
    status: 'resolved',
    timestamp: '2024-01-15T14:30:00Z'
  },
  {
    id: 'CDMX-2024-01-14-0900-002',
    title: 'Amenaza de desalojo - Condesa',
    location: 'Avenida Ámsterdam 456, Condesa',
    status: 'resolved',
    timestamp: '2024-01-14T09:00:00Z'
  },
  {
    id: 'CDMX-2024-01-10-1600-003',
    title: 'Consulta legal - Centro',
    location: 'Calle Francisco I. Madero 100, Centro',
    status: 'resolved',
    timestamp: '2024-01-10T16:00:00Z'
  }
]

const FAKE_CONTACTS = [
  { name: 'Protección Civil', phone: '55-5683-2222', priority: 3 },
  { name: 'Policía Ciudadana', phone: '55-5207-4155', priority: 3 },
  { name: 'Centro de Atención', phone: '55-5128-0000', priority: 2 }
]

const FAKE_PROTOCOLS = [
  { title: 'Prevención de Desalojos', description: 'Conozca sus derechos básicos' },
  { title: 'Documentación Requerida', description: 'Documentos necesarios para defensa' },
  { title: 'Líneas de Emergencia', description: 'Números de contacto importantes' }
]

// =============================================================================
// COMPONENT
// =============================================================================

export const DuressMode: React.FC<DuressModeProps> = ({ onExit, className }) => {
  const [hiddenAccessEnabled, setHiddenAccessEnabled] = useState(false)
  const [showHiddenData, setShowHiddenData] = useState(false)
  const [wipeScheduled, setWipeScheduled] = useState(false)
  const [wipeCountdown, setWipeCountdown] = useState(0)
  const [tapCount, setTapCount] = useState(0)
  const [lastTapTime, setLastTapTime] = useState(0)
  const [confirmExit, setConfirmExit] = useState(false)
  const [secretGestureProgress, setSecretGestureProgress] = useState(0)

  // Check initial state
  useEffect(() => {
    const state = securityManager.getDuressState()
    setHiddenAccessEnabled(state.hiddenAccessEnabled)
    
    const wipeState = securityManager.getWipeState()
    setWipeScheduled(wipeState.scheduled)
    
    if (wipeState.scheduled && wipeState.executeAt) {
      const executeTime = new Date(wipeState.executeAt).getTime()
      const now = Date.now()
      const remaining = Math.max(0, Math.ceil((executeTime - now) / 1000))
      setWipeCountdown(remaining)
    }
  }, [])

  // Wipe countdown timer
  useEffect(() => {
    if (!wipeScheduled || wipeCountdown <= 0) return

    const timer = setInterval(() => {
      setWipeCountdown(prev => {
        if (prev <= 1) {
          // Execute wipe when countdown reaches 0
          securityManager.executeWipe()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [wipeScheduled, wipeCountdown])

  // Secret gesture handler (5 rapid taps to enable hidden access)
  const handleSecretGesture = useCallback(() => {
    const now = Date.now()
    
    if (now - lastTapTime > 500) {
      // Reset if more than 500ms between taps
      setTapCount(1)
      setSecretGestureProgress(20)
    } else {
      const newCount = tapCount + 1
      setTapCount(newCount)
      setSecretGestureProgress(Math.min(100, newCount * 20))
      
      if (newCount >= 5) {
        // Enable hidden access
        securityManager.enableHiddenAccess()
        setHiddenAccessEnabled(true)
        setTapCount(0)
        setSecretGestureProgress(0)
      }
    }
    
    setLastTapTime(now)
  }, [tapCount, lastTapTime])

  // Toggle hidden data view
  const toggleHiddenData = () => {
    if (hiddenAccessEnabled) {
      setShowHiddenData(!showHiddenData)
    }
  }

  // Cancel wipe
  const handleCancelWipe = () => {
    securityManager.cancelWipe()
    setWipeScheduled(false)
    setWipeCountdown(0)
  }

  // Exit duress mode (requires confirmation)
  const handleExit = () => {
    setConfirmExit(true)
  }

  const confirmExitDuress = () => {
    securityManager.deactivateDuressMode()
    onExit()
  }

  // Format countdown
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-950", className)}>
      {/* Header */}
      <header className="bg-amber-500 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            <h1 className="font-bold text-lg">Protocolo CDMX</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExit}
            className="text-white hover:bg-amber-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* Duress Warning */}
        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-900/20">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-200">
            Modo de Emergencia
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            Mostrando información limitada. Datos sensibles ocultos.
          </AlertDescription>
        </Alert>

        {/* Wipe Countdown */}
        {wipeScheduled && wipeCountdown > 0 && (
          <Card className="border-red-500 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-red-600 animate-pulse" />
                <div className="flex-1">
                  <p className="font-medium text-red-800 dark:text-red-200">
                    Eliminación Automática
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCountdown(wipeCountdown)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelWipe}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Cancelar
                </Button>
              </div>
              <Progress 
                value={(wipeCountdown / (10 * 60)) * 100} 
                className="mt-3 h-2"
              />
            </CardContent>
          </Card>
        )}

        {/* Secret Gesture Area */}
        {!hiddenAccessEnabled && (
          <Card 
            className="cursor-pointer select-none"
            onClick={handleSecretGesture}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Acceso Restringido
                    </p>
                    <p className="text-sm text-gray-500">
                      Toque rápido 5 veces para acceso oculto
                    </p>
                  </div>
                </div>
              </div>
              {secretGestureProgress > 0 && (
                <Progress 
                  value={secretGestureProgress} 
                  className="mt-3 h-1"
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Hidden Access Toggle */}
        {hiddenAccessEnabled && (
          <Button
            variant="outline"
            className="w-full"
            onClick={toggleHiddenData}
          >
            {showHiddenData ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Ocultar Datos Reales
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Mostrar Datos Reales
              </>
            )}
          </Button>
        )}

        {/* Fake Incidents */}
        {!showHiddenData && (
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Incidentes Recientes
            </h2>
            
            <div className="space-y-2">
              {FAKE_INCIDENTS.map(incident => (
                <Card key={incident.id} className="opacity-75">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{incident.title}</p>
                        <p className="text-xs text-gray-500">{incident.location}</p>
                      </div>
                      <Badge variant="secondary">Resuelto</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Real Incidents (Hidden) */}
        {showHiddenData && hiddenAccessEnabled && (
          <div className="space-y-4">
            <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-900/20">
              <Eye className="w-5 h-5 text-blue-600" />
              <AlertTitle>Acceso Oculto Activado</AlertTitle>
              <AlertDescription>
                Mostrando datos reales. Esta información es confidencial.
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Incidentes Reales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  [Los incidentes reales se cargarían aquí desde el store]
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fake Contacts */}
        {!showHiddenData && (
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Contactos
            </h2>
            
            <div className="space-y-2">
              {FAKE_CONTACTS.map((contact, i) => (
                <a
                  key={i}
                  href={`tel:${contact.phone.replace(/-/g, '')}`}
                  className="block p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-amber-300 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-gray-500">{contact.phone}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Fake Protocols */}
        {!showHiddenData && (
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5" />
              Protocolos
            </h2>
            
            <div className="space-y-2">
              {FAKE_PROTOCOLS.map((protocol, i) => (
                <Card key={i} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <CardContent className="p-3">
                    <p className="font-medium text-sm">{protocol.title}</p>
                    <p className="text-xs text-gray-500">{protocol.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Wipe Button */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => securityManager.executeWipe()}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Eliminar Datos Inmediatamente
        </Button>
      </main>

      {/* Exit Confirmation Dialog */}
      <Dialog open={confirmExit} onOpenChange={setConfirmExit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Salir del Modo de Emergencia?</DialogTitle>
            <DialogDescription>
              Esto desactivará el modo de emergencia y restaurará el acceso normal a los datos.
              Asegúrese de que está seguro para hacer esto.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setConfirmExit(false)}>
              Cancelar
            </Button>
            <Button variant="default" onClick={confirmExitDuress}>
              Confirmar Salida
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DuressMode
