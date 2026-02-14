/**
 * Quick Dial Component
 * Protocolo CDMX
 * 
 * Large emergency buttons for one-tap calling
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  Phone,
  PhoneCall,
  Clock,
  History,
  AlertTriangle,
  Shield,
  Heart,
  Scale,
  Users,
  AlertCircle,
  X,
  CheckCircle2,
  ChevronRight,
  Building2,
  Siren,
  Stethoscope
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Badge,
  ScrollArea,
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Contact, ContactCategory } from '@/types/contacts'

// =============================================================================
// TYPES
// =============================================================================

interface QuickDialProps {
  contacts?: Contact[]
  onCall?: (number: string, contactName: string) => void
  className?: string
}

interface CallLog {
  id: string
  timestamp: string
  number: string
  contactName: string
  category: ContactCategory
  duration?: number
  status: 'completed' | 'failed' | 'no_answer'
}

interface EmergencyButton {
  id: string
  name: string
  number: string
  icon: React.ReactNode
  color: string
  category: ContactCategory
  description: string
  requiresConfirmation: boolean
}

// =============================================================================
// EMERGENCY BUTTONS CONFIG
// =============================================================================

const EMERGENCY_BUTTONS: EmergencyButton[] = [
  {
    id: 'c5',
    name: 'C5 CDMX',
    number: '55-5533-5533',
    icon: <Siren className="w-8 h-8" />,
    color: 'bg-red-600 hover:bg-red-700',
    category: 'emergencias',
    description: 'Centro de Comando y Control CDMX',
    requiresConfirmation: true
  },
  {
    id: 'erum',
    name: 'ERUM',
    number: '55-5271-3000',
    icon: <Stethoscope className="w-8 h-8" />,
    color: 'bg-orange-600 hover:bg-orange-700',
    category: 'emergencias',
    description: 'Escuadrón de Rescate y Urgencias Médicas',
    requiresConfirmation: true
  },
  {
    id: 'cruz-roja',
    name: 'Cruz Roja',
    number: '55-5557-5757',
    icon: <Heart className="w-8 h-8" />,
    color: 'bg-red-500 hover:bg-red-600',
    category: 'emergencias',
    description: 'Emergencias médicas 24/7',
    requiresConfirmation: true
  },
  {
    id: 'cdhcm',
    name: 'CDHCM',
    number: '55-5029-9300',
    icon: <Shield className="w-8 h-8" />,
    color: 'bg-purple-600 hover:bg-purple-700',
    category: 'ddhh',
    description: 'Comisión de Derechos Humanos CDMX',
    requiresConfirmation: false
  },
  {
    id: 'coalition',
    name: 'Coalición',
    number: '',  // Will be set dynamically
    icon: <Users className="w-8 h-8" />,
    color: 'bg-green-600 hover:bg-green-700',
    category: 'coalicion',
    description: 'Alerta masiva a coalición',
    requiresConfirmation: true
  },
  {
    id: 'legal',
    name: 'Legal Urgente',
    number: '',  // Will be set dynamically
    icon: <Scale className="w-8 h-8" />,
    color: 'bg-indigo-600 hover:bg-indigo-700',
    category: 'legal',
    description: 'Abogado de guardia',
    requiresConfirmation: false
  }
]

// =============================================================================
// COMPONENT
// =============================================================================

export const QuickDial: React.FC<QuickDialProps> = ({
  contacts = [],
  onCall,
  className
}) => {
  const [callLog, setCallLog] = useState<CallLog[]>([])
  const [showLog, setShowLog] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<EmergencyButton | null>(null)
  const [recentCalls, setRecentCalls] = useState<CallLog[]>([])
  const [isCalling, setIsCalling] = useState(false)

  // Load recent calls from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('protocolo_call_log')
    if (stored) {
      const parsed = JSON.parse(stored)
      setCallLog(parsed)
      setRecentCalls(parsed.slice(-5).reverse())
    }
  }, [])

  // Save call to log
  const saveCall = useCallback((log: CallLog) => {
    setCallLog(prev => {
      const updated = [...prev, log]
      localStorage.setItem('protocolo_call_log', JSON.stringify(updated))
      return updated
    })
    setRecentCalls(prev => [log, ...prev].slice(0, 5))
  }, [])

  // Handle call button press
  const handleCall = useCallback((button: EmergencyButton) => {
    if (button.requiresConfirmation) {
      setConfirmDialog(button)
    } else {
      executeCall(button)
    }
  }, [])

  // Execute the actual call
  const executeCall = useCallback((button: EmergencyButton) => {
    setIsCalling(true)
    setConfirmDialog(null)

    // Find contact if available
    const contact = contacts.find(c => 
      c.phones.some(p => p.number.replace(/-/g, '') === button.number.replace(/-/g, ''))
    )

    // Log the call
    const callLog: CallLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      number: button.number,
      contactName: contact?.name || button.name,
      category: button.category,
      status: 'completed'
    }
    saveCall(callLog)

    // Trigger the call
    onCall?.(button.number, button.name)
    window.location.href = `tel:${button.number.replace(/-/g, '')}`

    setTimeout(() => setIsCalling(false), 1000)
  }, [contacts, onCall, saveCall])

  // Format time ago
  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date()
    const then = new Date(timestamp)
    const diff = now.getTime() - then.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Ahora'
    if (minutes < 60) return `Hace ${minutes} min`
    if (hours < 24) return `Hace ${hours} h`
    return `Hace ${days} d`
  }

  // Get category icon
  const getCategoryIcon = (category: ContactCategory) => {
    switch (category) {
      case 'emergencias': return <Siren className="w-4 h-4" />
      case 'ddhh': return <Shield className="w-4 h-4" />
      case 'legal': return <Scale className="w-4 h-4" />
      case 'coalicion': return <Users className="w-4 h-4" />
      default: return <Phone className="w-4 h-4" />
    }
  }

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <PhoneCall className="w-6 h-6 text-red-600" />
              Llamada Rápida
            </h1>
            <p className="text-sm text-muted-foreground">
              Toque para llamar emergencias
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLog(true)}
          >
            <History className="w-4 h-4 mr-2" />
            Historial
          </Button>
        </div>
      </div>

      {/* Emergency Warning */}
      <Alert className="m-4 border-red-500 bg-red-50 dark:bg-red-900/20">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <AlertTitle className="text-red-800 dark:text-red-200">
          Sólo para emergencias
        </AlertTitle>
        <AlertDescription className="text-red-700 dark:text-red-300">
          Use estos botones únicamente en situaciones de emergencia.
        </AlertDescription>
      </Alert>

      {/* Emergency Buttons Grid */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-4">
          {EMERGENCY_BUTTONS.map(button => (
            <button
              key={button.id}
              onClick={() => handleCall(button)}
              disabled={isCalling}
              className={cn(
                "relative p-6 rounded-2xl text-white font-bold transition-all",
                "flex flex-col items-center justify-center gap-3",
                "active:scale-95 active:shadow-inner",
                "min-h-[140px]",
                button.color,
                isCalling && "opacity-50 cursor-not-allowed"
              )}
            >
              {button.icon}
              <div className="text-center">
                <div className="text-lg">{button.name}</div>
                <div className="text-sm opacity-90">{button.number}</div>
              </div>
              
              {button.requiresConfirmation && (
                <div className="absolute top-2 right-2">
                  <AlertCircle className="w-5 h-5 opacity-70" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Recent Calls */}
        {recentCalls.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Llamadas Recientes
            </h2>
            <div className="space-y-2">
              {recentCalls.map(call => (
                <Card key={call.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          {getCategoryIcon(call.category)}
                        </div>
                        <div>
                          <p className="font-medium">{call.contactName}</p>
                          <p className="text-sm text-muted-foreground">{call.number}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {formatTimeAgo(call.timestamp)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.location.href = `tel:${call.number.replace(/-/g, '')}`}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Confirmar llamada de emergencia
            </DialogTitle>
            <DialogDescription>
              Está a punto de llamar a <strong>{confirmDialog?.name}</strong>.
              {confirmDialog?.description && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {confirmDialog.description}
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{confirmDialog?.number}</p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>
              Cancelar
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => confirmDialog && executeCall(confirmDialog)}
            >
              <PhoneCall className="w-4 h-4 mr-2" />
              Llamar Ahora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Call Log Dialog */}
      <Dialog open={showLog} onOpenChange={setShowLog}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Historial de Llamadas</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {callLog.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay llamadas registradas</p>
                </div>
              ) : (
                [...callLog].reverse().map(call => (
                  <Card key={call.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            {getCategoryIcon(call.category)}
                          </div>
                          <div>
                            <p className="font-medium">{call.contactName}</p>
                            <p className="text-sm text-muted-foreground">{call.number}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {new Date(call.timestamp).toLocaleString('es-MX')}
                          </p>
                          <Badge variant={call.status === 'completed' ? 'default' : 'secondary'}>
                            {call.status === 'completed' ? 'Completada' : call.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              if (confirm('¿Borrar todo el historial?')) {
                localStorage.removeItem('protocolo_call_log')
                setCallLog([])
                setRecentCalls([])
              }
            }}>
              <Trash2 className="w-4 h-4 mr-2" />
              Borrar Historial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default QuickDial
