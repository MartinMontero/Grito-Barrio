import React, { useState } from 'react'
import { AlertTriangle, Phone, Camera, Users, X, FilePlus } from 'lucide-react'
import { Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { cn } from '@/lib/utils'
import { emergencyContacts } from '@/data/protocols'
import { useProtocoloStore } from '@/store'
import type { Incident, ThreatLevel, AlertSource } from '@/types'
import type { AlertData } from '@/store/incidentSlice'

interface EmergencyModalProps {
  isOpen: boolean
  onClose: () => void
  onIncidentCreate?: (incident: Incident) => void
}

type ModalView = 'actions' | 'create-incident'

const emergencyActions = [
  {
    id: 'call',
    icon: Phone,
    label: 'Llamar Emergencias',
    description: '911 - Atención inmediata',
    color: 'bg-destructive text-destructive-foreground',
    action: () => window.location.href = 'tel:911'
  },
  {
    id: 'create-incident',
    icon: FilePlus,
    label: 'Crear Incidente',
    description: 'Reportar situación',
    color: 'bg-purple-500 text-white'
  },
  {
    id: 'document',
    icon: Camera,
    label: 'Documentar',
    description: 'Graba y fotografía',
    color: 'bg-orange-500 text-white'
  },
  {
    id: 'contacts',
    icon: Users,
    label: 'Contactos',
    description: 'Llama a tu red de apoyo',
    color: 'bg-blue-500 text-white'
  }
]

export function EmergencyModal({ isOpen, onClose, onIncidentCreate }: EmergencyModalProps) {
  const [currentView, setCurrentView] = useState<ModalView>('actions')
  const [formData, setFormData] = useState({
    description: '',
    alertSource: 'direct_observation' as AlertSource,
    threatLevel: '' as ThreatLevel | '',
    colonia: '',
    calle: '',
    numero: '',
    occupantsAtRisk: 1,
    minorsPresent: false,
    vulnerablePersons: false,
    authoritiesPresent: false
  })
  
  const createIncident = useProtocoloStore((state) => state.createIncident)
  const currentUser = useProtocoloStore((state) => state.currentUser)
  
  if (!isOpen) return null
  
  const handleActionClick = (actionId: string) => {
    switch (actionId) {
      case 'call':
        window.location.href = 'tel:911'
        break
      case 'create-incident':
        setCurrentView('create-incident')
        break
      case 'document':
        onClose()
        // Navigate to evidence collection would happen here
        break
      case 'contacts':
        // Show contacts view
        break
    }
  }
  
  const handleCreateIncident = () => {
    if (!formData.description || !formData.threatLevel) {
      return
    }
    
    const alertData: AlertData = {
      location: {
        address: `${formData.calle} ${formData.numero}, ${formData.colonia}, Ciudad de México`,
        colonia: formData.colonia,
        alcaldia: '' as any,
        postalCode: '',
        coordinates: undefined // Would use geolocation in real app
      },
      alertSource: formData.alertSource,
      description: formData.description,
      threatLevel: formData.threatLevel as ThreatLevel,
      occupantsAtRisk: formData.occupantsAtRisk,
      minorsPresent: formData.minorsPresent,
      vulnerablePersons: formData.vulnerablePersons,
      authoritiesPresent: formData.authoritiesPresent
    }
    
    const incidentId = createIncident(alertData)
    const store = useProtocoloStore.getState()
    const incident = store.getIncidentById(incidentId)
    
    if (incident) {
      onIncidentCreate?.(incident)
    }
    
    setCurrentView('actions')
    setFormData({
      description: '',
      alertSource: 'direct_observation',
      threatLevel: '',
      colonia: '',
      calle: '',
      numero: '',
      occupantsAtRisk: 1,
      minorsPresent: false,
      vulnerablePersons: false,
      authoritiesPresent: false
    })
  }
  
  const handleClose = () => {
    setCurrentView('actions')
    setFormData({
      description: '',
      alertSource: 'direct_observation',
      threatLevel: '',
      colonia: '',
      calle: '',
      numero: '',
      occupantsAtRisk: 1,
      minorsPresent: false,
      vulnerablePersons: false,
      authoritiesPresent: false
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-destructive text-destructive-foreground p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center emergency-pulse">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {currentView === 'create-incident' ? 'Nuevo Incidente' : '¡EMERGENCIA!'}
          </h2>
          <p className="text-destructive-foreground/90">
            {currentView === 'create-incident' 
              ? 'Reporta la situación actual' 
              : 'Si estás en peligro inmediato, llama al 911'}
          </p>
        </div>
        
        {currentView === 'actions' && (
          <>
            {/* Quick Actions */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {emergencyActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleActionClick(action.id)}
                      className={cn(
                        "p-4 rounded-xl text-left transition-transform active:scale-95",
                        action.color
                      )}
                    >
                      <Icon className="w-6 h-6 mb-2" />
                      <p className="font-bold text-sm">{action.label}</p>
                      <p className="text-xs opacity-90">{action.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* Emergency Numbers */}
            <div className="px-4 pb-2">
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">
                Números de Emergencia
              </h3>
              <div className="space-y-2">
                {emergencyContacts.slice(0, 3).map((contact, index) => (
                  <a
                    key={index}
                    href={`tel:${contact.number.replace(/-/g, '')}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.type}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-destructive">{contact.number}</span>
                      <Phone className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
        
        {currentView === 'create-incident' && (
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Origen del Reporte</label>
              <Select 
                value={formData.alertSource} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, alertSource: value as AlertSource }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el origen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct_observation">Observación Directa</SelectItem>
                  <SelectItem value="hotline">Línea de Emergencia</SelectItem>
                  <SelectItem value="community_network">Red Comunitaria</SelectItem>
                  <SelectItem value="social_media">Redes Sociales</SelectItem>
                  <SelectItem value="legal_aid">Asistencia Legal</SelectItem>
                  <SelectItem value="government_notice">Notificación Gubernamental</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Nivel de Amenaza</label>
              <Select 
                value={formData.threatLevel} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, threatLevel: value as ThreatLevel }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Bajo - Sin peligro inmediato</SelectItem>
                  <SelectItem value="moderate">Moderado - Precaución necesaria</SelectItem>
                  <SelectItem value="high">Alto - Riesgo significativo</SelectItem>
                  <SelectItem value="critical">Crítico - Peligro inmediato</SelectItem>
                  <SelectItem value="extreme">Extremo - Evacuación inmediata</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Colonia</label>
                <Input 
                  placeholder="Ej: Roma Norte"
                  value={formData.colonia}
                  onChange={(e) => setFormData(prev => ({ ...prev, colonia: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Calle</label>
                <Input 
                  placeholder="Ej: Avenida Álvaro Obregón"
                  value={formData.calle}
                  onChange={(e) => setFormData(prev => ({ ...prev, calle: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Número</label>
              <Input 
                placeholder="Ej: 123"
                value={formData.numero}
                onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Ocupantes en Riesgo</label>
              <Input 
                type="number"
                min={1}
                placeholder="Número de personas"
                value={formData.occupantsAtRisk}
                onChange={(e) => setFormData(prev => ({ ...prev, occupantsAtRisk: parseInt(e.target.value) || 1 }))}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300"
                  checked={formData.minorsPresent}
                  onChange={(e) => setFormData(prev => ({ ...prev, minorsPresent: e.target.checked }))}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Menores presentes</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300"
                  checked={formData.vulnerablePersons}
                  onChange={(e) => setFormData(prev => ({ ...prev, vulnerablePersons: e.target.checked }))}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Personas vulnerables (adultos mayores, discapacitados)</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300"
                  checked={formData.authoritiesPresent}
                  onChange={(e) => setFormData(prev => ({ ...prev, authoritiesPresent: e.target.checked }))}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Autoridades presentes</span>
              </label>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Descripción de la Situación</label>
              <Textarea 
                placeholder="Describe la situación detalladamente..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setCurrentView('actions')}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1"
                onClick={handleCreateIncident}
                disabled={!formData.description || !formData.threatLevel || !formData.colonia || !formData.calle}
              >
                Crear Incidente
              </Button>
            </div>
          </div>
        )}
        
        {/* Important Notice */}
        <div className="px-4 py-3">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              <strong>Recuerda:</strong> Tu seguridad es lo primero. No confrontes físicamente. 
              Documenta todo y busca ayuda profesional.
            </p>
          </div>
        </div>
        
        {/* Close Button */}
        <div className="p-4 border-t">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleClose}
          >
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
