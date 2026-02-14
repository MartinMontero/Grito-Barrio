/**
 * Legal Triage Wizard
 * Protocolo CDMX
 * 
 * Guides legal observers through decision tree for appropriate legal response
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import {
  Scale,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertTriangle,
  FileText,
  Phone,
  Users,
  Shield,
  Printer,
  Download,
  RotateCcw,
  ExternalLink,
  MapPin,
  Clock,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Save,
  Share2
} from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Input, Checkbox } from '@/components/ui'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

type WizardStep = 1 | 2 | 3 | 4
type JudicialOrderStatus = 'present' | 'absent' | null
type OccupantCategory = 'formal_tenant' | 'informal' | 'indigenous' | 'subtenant' | null
type ViolenceType = 'physical_with_medical' | 'ongoing_threats' | 'theft_damage' | 'none' | null
type PriorityLevel = 'maxima' | 'alta' | 'media' | 'baja'
type LegalPath = 'verification_required' | 'despojo_395' | 'penal_fiscalia' | 'dh_cdhcm' | 'dh_cndh'

interface JudicialOrderDetails {
  tribunalName: string
  date: string
  caseNumber: string
  judgeSigned: boolean
}

interface TriageState {
  step: WizardStep
  judicialOrder: {
    present: JudicialOrderStatus
    details?: JudicialOrderDetails
  }
  occupantCategory: OccupantCategory
  violenceType: ViolenceType
}

interface LegalRecommendation {
  path: LegalPath
  title: string
  description: string
  priority: PriorityLevel
  actions: string[]
  contacts: LegalContact[]
  article?: string
}

interface LegalContact {
  id: string
  name: string
  role: string
  phone: string
  hours: string
  priority: number
}

// =============================================================================
// DATA
// =============================================================================

const INITIAL_STATE: TriageState = {
  step: 1,
  judicialOrder: { present: null },
  occupantCategory: null,
  violenceType: null
}

const LEGAL_CONTACTS: LegalContact[] = [
  {
    id: 'cdhcm',
    name: 'CDHCM - Comisión de Derechos Humanos CDMX',
    role: 'Quejas y Orientación',
    phone: '55-5029-9300',
    hours: '24 horas',
    priority: 1
  },
  {
    id: 'cndh',
    name: 'CNDH - Comisión Nacional de Derechos Humanos',
    role: 'Quejas',
    phone: '55-5481-8740',
    hours: 'L-V 9:00-18:00',
    priority: 2
  },
  {
    id: 'fiscalia',
    name: 'Fiscalía Especializada en Delitos Patrimoniales',
    role: 'Denuncias',
    phone: '55-5200-4000',
    hours: '24 horas',
    priority: 1
  },
  {
    id: 'defensoria',
    name: 'Instituto de Defensoría Pública',
    role: 'Asesoría Legal Gratuita',
    phone: '55-5009-2600',
    hours: 'L-V 9:00-18:00',
    priority: 1
  }
]

const OCCUPANT_PROTECTIOS: Record<Exclude<OccupantCategory, null>, {
  title: string
  protections: string[]
  documentation: string[]
  priorityActions: string[]
}> = {
  formal_tenant: {
    title: 'Inquilino Formal',
    protections: [
      'Contrato de arrendamiento vigente',
      'Protección bajo Ley de Vivienda CDMX',
      'Debido proceso judicial obligatorio',
      'Contrademanda por arrendamiento'
    ],
    documentation: [
      'Contrato de arrendamiento',
      'Recibos de pago de renta',
      'Comprobantes de servicios',
      'Historial de pagos'
    ],
    priorityActions: [
      'Verificar vigencia del contrato',
      'Documentar cumplimiento de obligaciones',
      'Preparar contrademanda'
    ]
  },
  informal: {
    title: 'Ocupante Informal',
    protections: [
      'Derecho a vivienda digna (Art. 1° Ley de Vivienda)',
      'Prohibición de desalojo forzoso',
      'Proceso legal obligatorio',
      'Asesoría jurídica gratuita'
    ],
    documentation: [
      'Prueba de residencia (recibos, testimonios)',
      'Mejoras realizadas al inmueble',
      'Documentación de ocupación prolongada',
      'Testimonios de vecinos'
    ],
    priorityActions: [
      'Documentar tiempo de residencia',
      'Reunir testimonios de vecinos',
      'Verificar servicios a nombre del ocupante'
    ]
  },
  indigenous: {
    title: 'Colectivo Indígena',
    protections: [
      'Derechos colectivos de pueblos indígenas',
      'Consulta previa obligatoria',
      'Protección especial bajo DH',
      'Acceso a defensoría especializada'
    ],
    documentation: [
      'Documentación de pertenencia étnica',
      'Resoluciones de territorio',
      'Testimonios de autoridades comunitarias',
      'Documentación histórica de ocupación'
    ],
    priorityActions: [
      'Contactar defensoría especializada',
      'Activar alerta de pueblos indígenas',
      'Documentar afectación colectiva'
    ]
  },
  subtenant: {
    title: 'Subarrendatario',
    protections: [
      'Derechos derivados del arrendamiento principal',
      'Notificación al arrendador principal',
      'Posibilidad de negociación',
      'Asesoría sobre obligaciones del inquilino principal'
    ],
    documentation: [
      'Contrato de subarrendamiento',
      'Pagos al inquilino principal',
      'Comunicaciones con inquilino principal',
      'Contrato principal (si disponible)'
    ],
    priorityActions: [
      'Contactar inquilino principal',
      'Verificar vigencia de contrato principal',
      'Documentar pagos realizados'
    ]
  }
}

const VIOLENCE_PATHS: Record<Exclude<ViolenceType, null>, {
  penalPath: string
  dhPath: string
  priority: PriorityLevel
  immediateActions: string[]
}> = {
  physical_with_medical: {
    penalPath: 'Fiscalía General de Justicia - Denuncia por lesiones',
    dhPath: 'CDHCM - Queja por violencia',
    priority: 'maxima',
    immediateActions: [
      'Asegurar constancia médica',
      'Fotografiar lesiones',
      'Levantar acta en Ministerio Público',
      'Activar protocolo de seguridad'
    ]
  },
  ongoing_threats: {
    penalPath: 'Fiscalía - Denuncia por amenazas',
    dhPath: 'CDHCM - Queja por intimidación',
    priority: 'alta',
    immediateActions: [
      'Documentar amenazas (audio, video)',
      'Testimonios de amenazas',
      'Medidas de protección',
      'Alerta a redes de apoyo'
    ]
  },
  theft_damage: {
    penalPath: 'Fiscalía - Denuncia por robo/daño',
    dhPath: 'CDHCM - Queja por afectación patrimonial',
    priority: 'alta',
    immediateActions: [
      'Inventariar bienes faltantes/dañados',
      'Fotografiar daños',
      'Levantar acta MP',
      'Asegurar evidencia'
    ]
  },
  none: {
    penalPath: 'No aplica',
    dhPath: 'CDHCM - Prevención',
    priority: 'media',
    immediateActions: [
      'Documentar situación',
      'Asesoría preventiva',
      'Preparar defensas legales'
    ]
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function getPriorityColor(priority: PriorityLevel): { bg: string; text: string; border: string } {
  const colors = {
    maxima: { bg: 'bg-red-600', text: 'text-red-700', border: 'border-red-200' },
    alta: { bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-200' },
    media: { bg: 'bg-yellow-500', text: 'text-yellow-700', border: 'border-yellow-200' },
    baja: { bg: 'bg-green-500', text: 'text-green-700', border: 'border-green-200' }
  }
  return colors[priority]
}

function getPriorityLabel(priority: PriorityLevel): string {
  const labels = {
    maxima: 'Máxima',
    alta: 'Alta',
    media: 'Media',
    baja: 'Baja'
  }
  return labels[priority]
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const LegalTriageWizard: React.FC<{ incidentId?: string }> = ({ incidentId }) => {
  const [state, setState] = useState<TriageState>(INITIAL_STATE)
  const [isComplete, setIsComplete] = useState(false)
  const [saved, setSaved] = useState(false)

  // Calculate recommendations based on state
  const recommendations = useMemo((): LegalRecommendation[] => {
    const recs: LegalRecommendation[] = []

    // Based on judicial order
    if (state.judicialOrder.present === 'present') {
      recs.push({
        path: 'verification_required',
        title: 'Verificación de Orden Judicial',
        description: 'Evaluar proporcionalidad, cumplimiento de debido proceso y derechos humanos',
        priority: 'alta',
        actions: [
          'Verificar autenticidad de la orden',
          'Revisar cumplimiento de plazos legales',
          'Evaluar proporcionalidad de la medida',
          'Documentar posibles irregularidades'
        ],
        contacts: LEGAL_CONTACTS.filter(c => c.id === 'defensoria'),
        article: 'Artículo 12 Ley de Vivienda CDMX'
      })
    } else if (state.judicialOrder.present === 'absent') {
      recs.push({
        path: 'despojo_395',
        title: 'Despojo (Artículo 395 Código Penal)',
        description: 'Denuncia por despojo ante Fiscalía',
        priority: 'maxima',
        actions: [
          'Documentar violencia, amenazas o engaño',
          'Presión política inmediata',
          'Activar alerta de DDHH',
          'Solicitar medidas cautelares'
        ],
        contacts: LEGAL_CONTACTS.filter(c => ['fiscalia', 'cdhcm'].includes(c.id)),
        article: 'Artículo 395 Código Penal Federal'
      })
    }

    // Based on occupant category
    if (state.occupantCategory) {
      const protection = OCCUPANT_PROTECTIOS[state.occupantCategory]
      recs.push({
        path: 'dh_cdhcm',
        title: `Protección para ${protection.title}`,
        description: 'Queja ante CDHCM por vulneración de derechos',
        priority: state.occupantCategory === 'indigenous' ? 'maxima' : 'alta',
        actions: protection.priorityActions,
        contacts: LEGAL_CONTACTS.filter(c => ['cdhcm', 'defensoria'].includes(c.id))
      })
    }

    // Based on violence
    if (state.violenceType) {
      const violence = VIOLENCE_PATHS[state.violenceType]
      if (state.violenceType !== 'none') {
        recs.push({
          path: 'penal_fiscalia',
          title: 'Vía Penal',
          description: violence.penalPath,
          priority: violence.priority,
          actions: violence.immediateActions,
          contacts: LEGAL_CONTACTS.filter(c => c.id === 'fiscalia')
        })
      }
      
      recs.push({
        path: 'dh_cdhcm',
        title: 'Vía Derechos Humanos',
        description: violence.dhPath,
        priority: violence.priority,
        actions: ['Levantar queja formal', 'Solicitar medidas cautelares'],
        contacts: LEGAL_CONTACTS.filter(c => ['cdhcm', 'cndh'].includes(c.id))
      })
    }

    return recs
  }, [state])

  const highestPriority = useMemo((): PriorityLevel => {
    const priorities = recommendations.map(r => r.priority)
    if (priorities.includes('maxima')) return 'maxima'
    if (priorities.includes('alta')) return 'alta'
    if (priorities.includes('media')) return 'media'
    return 'baja'
  }, [recommendations])

  const handleNext = () => {
    if (state.step < 4) {
      setState(prev => ({ ...prev, step: (prev.step + 1) as WizardStep }))
    } else {
      setIsComplete(true)
    }
  }

  const handleBack = () => {
    if (state.step > 1) {
      setState(prev => ({ ...prev, step: (prev.step - 1) as WizardStep }))
    }
  }

  const handleReset = () => {
    setState(INITIAL_STATE)
    setIsComplete(false)
    setSaved(false)
  }

  const handleSave = () => {
    // Save to localStorage
    const triageData = {
      incidentId,
      timestamp: new Date().toISOString(),
      state,
      recommendations
    }
    localStorage.setItem(`triage-${incidentId || Date.now()}`, JSON.stringify(triageData))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExport = () => {
    const content = `
TRIAGE LEGAL - PROTOCOLO CDMX
==============================

Incidente: ${incidentId || 'N/A'}
Fecha: ${new Date().toLocaleString('es-MX')}

RESULTADOS DEL TRIAGE
---------------------

1. Orden Judicial: ${state.judicialOrder.present === 'present' ? 'SÍ' : 'NO'}
${state.judicialOrder.details ? `
   Tribunal: ${state.judicialOrder.details.tribunalName}
   Fecha: ${state.judicialOrder.details.date}
   Expediente: ${state.judicialOrder.details.caseNumber}
   Firmada: ${state.judicialOrder.details.judgeSigned ? 'SÍ' : 'NO'}
` : ''}

2. Categoría de Ocupante: ${state.occupantCategory ? OCCUPANT_PROTECTIOS[state.occupantCategory].title : 'N/A'}

3. Violencia/Amenazas: ${state.violenceType ? VIOLENCE_PATHS[state.violenceType].dhPath : 'N/A'}

RECOMENDACIONES
---------------

Prioridad: ${getPriorityLabel(highestPriority).toUpperCase()}

${recommendations.map((rec, i) => `
${i + 1}. ${rec.title}
   ${rec.description}
   Artículo: ${rec.article || 'N/A'}
   
   Acciones:
   ${rec.actions.map(a => `   - ${a}`).join('\n')}
   
   Contactos:
   ${rec.contacts.map(c => `   - ${c.name}: ${c.phone}`).join('\n')}
`).join('\n')}

==============================
Generado por Protocolo CDMX
    `
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `triage-legal-${incidentId || Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Render Step 1: Judicial Order
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          ¿Orden Judicial Presente?
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Determina el camino legal inicial
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => setState(prev => ({ 
            ...prev, 
            judicialOrder: { present: 'present', details: prev.judicialOrder.details }
          }))}
          className={cn(
            "p-6 rounded-xl border-2 text-left transition-all",
            state.judicialOrder.present === 'present'
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white">SÍ</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Hay orden judicial emitida
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setState(prev => ({ 
            ...prev, 
            judicialOrder: { present: 'absent' }
          }))}
          className={cn(
            "p-6 rounded-xl border-2 text-left transition-all",
            state.judicialOrder.present === 'absent'
              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
              : "border-gray-200 dark:border-gray-700 hover:border-red-300"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white">NO</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Presunción de Ilegalidad (Despojo)
              </div>
            </div>
          </div>
        </button>
      </div>

      {state.judicialOrder.present === 'present' && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
            <CardTitle className="text-blue-800 dark:text-blue-200 text-base">
              Verificación de Orden Judicial
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre del tribunal
              </label>
              <Input
                value={state.judicialOrder.details?.tribunalName || ''}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  judicialOrder: {
                    ...prev.judicialOrder,
                    details: {
                      ...prev.judicialOrder.details,
                      tribunalName: e.target.value,
                      date: prev.judicialOrder.details?.date || '',
                      caseNumber: prev.judicialOrder.details?.caseNumber || '',
                      judgeSigned: prev.judicialOrder.details?.judgeSigned || false
                    }
                  }
                }))}
                placeholder="Ej: Juzgado 15 Civil"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de emisión
              </label>
              <Input
                type="date"
                value={state.judicialOrder.details?.date || ''}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  judicialOrder: {
                    ...prev.judicialOrder,
                    details: {
                      ...prev.judicialOrder.details,
                      tribunalName: prev.judicialOrder.details?.tribunalName || '',
                      date: e.target.value,
                      caseNumber: prev.judicialOrder.details?.caseNumber || '',
                      judgeSigned: prev.judicialOrder.details?.judgeSigned || false
                    }
                  }
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número de expediente
              </label>
              <Input
                value={state.judicialOrder.details?.caseNumber || ''}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  judicialOrder: {
                    ...prev.judicialOrder,
                    details: {
                      ...prev.judicialOrder.details,
                      tribunalName: prev.judicialOrder.details?.tribunalName || '',
                      date: prev.judicialOrder.details?.date || '',
                      caseNumber: e.target.value,
                      judgeSigned: prev.judicialOrder.details?.judgeSigned || false
                    }
                  }
                }))}
                placeholder="Ej: 1234/2024"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={state.judicialOrder.details?.judgeSigned || false}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  judicialOrder: {
                    ...prev.judicialOrder,
                    details: {
                      tribunalName: prev.judicialOrder.details?.tribunalName || '',
                      date: prev.judicialOrder.details?.date || '',
                      caseNumber: prev.judicialOrder.details?.caseNumber || '',
                      judgeSigned: e.target.checked
                    }
                  }
                }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Orden firmada por juez
              </span>
            </label>
          </CardContent>
        </Card>
      )}

      {state.judicialOrder.present === 'absent' && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-900 dark:text-red-200 mb-2">
                  Camino de Despojo (Artículo 395)
                </h3>
                <ul className="space-y-2 text-sm text-red-800 dark:text-red-300">
                  <li>• Prioridad de documentación de violencia, amenazas, engaño</li>
                  <li>• Énfasis en presión política inmediata</li>
                  <li>• Activar alerta de Derechos Humanos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  // Render Step 2: Occupant Category
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          ¿Categoría de Ocupante?
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Determina protecciones legales disponibles
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {(Object.keys(OCCUPANT_PROTECTIOS) as Exclude<OccupantCategory, null>[]).map((category) => {
          const protection = OCCUPANT_PROTECTIOS[category]
          const isSelected = state.occupantCategory === category
          
          return (
            <button
              key={category}
              onClick={() => setState(prev => ({ ...prev, occupantCategory: category }))}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                isSelected
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
              )}
            >
              <div className="font-bold text-gray-900 dark:text-white mb-2">
                {protection.title}
              </div>
              
              {isSelected && (
                <div className="space-y-3 mt-3">
                  <div>
                    <div className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase mb-1">
                      Protecciones Legales
                    </div>
                    <ul className="text-sm space-y-1">
                      {protection.protections.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <Shield className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <div className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase mb-1">
                      Documentación Prioritaria
                    </div>
                    <ul className="text-sm space-y-1">
                      {protection.documentation.map((d, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <FileText className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )

  // Render Step 3: Violence/Threats
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          ¿Violencia/Amenazas/Robo?
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Determina vías penal y de derechos humanos
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {(Object.keys(VIOLENCE_PATHS) as Exclude<ViolenceType, null>[]).map((type) => {
          const violence = VIOLENCE_PATHS[type]
          const isSelected = state.violenceType === type
          const colors = getPriorityColor(violence.priority)
          
          return (
            <button
              key={type}
              onClick={() => setState(prev => ({ ...prev, violenceType: type }))}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                isSelected
                  ? cn("border-2", colors.border, colors.light.replace('bg-', 'bg-opacity-50'))
                  : "border-gray-200 dark:border-gray-700"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn("font-bold", colors.text)}>
                  {type === 'physical_with_medical' && 'Violencia Física con Documentación Médica'}
                  {type === 'ongoing_threats' && 'Amenazas Continuas'}
                  {type === 'theft_damage' && 'Robo/Daño a Propiedad'}
                  {type === 'none' && 'Sin Violencia Documentada'}
                </span>
                <Badge className={cn(colors.bg, "text-white")}>
                  {getPriorityLabel(violence.priority)}
                </Badge>
              </div>
              
              {isSelected && (
                <div className="space-y-3 mt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Vía Penal
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {violence.penalPath}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Vía Derechos Humanos
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {violence.dhPath}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Acciones Inmediatas
                    </div>
                    <ul className="text-sm space-y-1">
                      {violence.immediateActions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )

  // Render Results
  const renderResults = () => {
    const priorityColors = getPriorityColor(highestPriority)
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Resultados del Triage Legal
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Resumen y recomendaciones
          </p>
        </div>

        {/* Priority Badge */}
        <div className={cn(
          "p-6 rounded-xl text-center",
          priorityColors.light
        )}>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Nivel de Prioridad
          </div>
          <div className={cn("text-4xl font-bold", priorityColors.text)}>
            {getPriorityLabel(highestPriority).toUpperCase()}
          </div>
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumen de Respuestas</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400">Orden Judicial</span>
              <span className="font-medium">
                {state.judicialOrder.present === 'present' ? 'Sí' : 'No'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400">Categoría</span>
              <span className="font-medium">
                {state.occupantCategory ? OCCUPANT_PROTECTIOS[state.occupantCategory].title : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-400">Violencia</span>
              <span className="font-medium">
                {state.violenceType ? VIOLENCE_PATHS[state.violenceType].dhPath : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Recomendaciones Legales
          </h3>
          
          {recommendations.map((rec, index) => {
            const colors = getPriorityColor(rec.priority)
            return (
              <Card key={index} className={cn("overflow-hidden", colors.border)}>
                <CardHeader className={cn(colors.light, "py-3")}>
                  <div className="flex items-center justify-between">
                    <CardTitle className={cn("text-base", colors.text)}>
                      {rec.title}
                    </CardTitle>
                    <Badge className={cn(colors.bg, "text-white text-xs")}>
                      {getPriorityLabel(rec.priority)}
                    </Badge>
                  </div>
                  {rec.article && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {rec.article}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {rec.description}
                  </p>
                  
                  <div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                      Acciones Recomendadas
                    </div>
                    <ul className="space-y-1">
                      {rec.actions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                      Contactos
                    </div>
                    <div className="space-y-2">
                      {rec.contacts.map((contact) => (
                        <a
                          key={contact.id}
                          href={`tel:${contact.phone.replace(/-/g, '')}`}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white text-sm">
                              {contact.name}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {contact.role} • {contact.hours}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white">
                              {contact.phone}
                            </span>
                            <Phone className="w-4 h-4 text-green-600" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Nuevo Triage
          </Button>
          <Button
            variant="outline"
            onClick={handleSave}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saved ? 'Guardado!' : 'Guardar'}
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button
            onClick={() => window.print()}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Scale className="w-6 h-6 text-purple-600" />
                Triage Legal
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Wizard de decisiones legales
              </p>
            </div>
            {incidentId && (
              <Badge variant="secondary">
                {incidentId}
              </Badge>
            )}
          </div>

          {/* Progress */}
          {!isComplete && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Paso {state.step} de 3</span>
                <span className="font-medium">{Math.round((state.step / 3) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 transition-all duration-300"
                  style={{ width: `${(state.step / 3) * 100}%` }}
                />
              </div>
              
              {/* Step indicators */}
              <div className="flex justify-between mt-3">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                      step <= state.step
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                    )}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {isComplete ? renderResults() : (
          <>
            {state.step === 1 && renderStep1()}
            {state.step === 2 && renderStep2()}
            {state.step === 3 && renderStep3()}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleBack}
                disabled={state.step === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={handleNext}
                disabled={
                  (state.step === 1 && !state.judicialOrder.present) ||
                  (state.step === 2 && !state.occupantCategory) ||
                  (state.step === 3 && !state.violenceType)
                }
              >
                {state.step === 3 ? 'Ver Resultados' : 'Siguiente'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default LegalTriageWizard