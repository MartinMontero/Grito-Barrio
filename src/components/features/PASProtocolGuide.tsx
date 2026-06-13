import React, { useState, useEffect, useMemo } from 'react'
import {
  Shield,
  Phone,
  Heart,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertTriangle,
  Activity,
  Droplets,
  ExternalLink,
  CheckCircle2,
  Plus,
  Minus,
  AlertOctagon
} from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useProtocoloStore } from '@/store'

type PASStep = 'proteger' | 'avisar' | 'socorrer'
type EmergencyContact = 'c5' | 'erum' | 'cruz-roja'

interface PASProtocolGuideProps {
  onComplete?: () => void
  onEmergencyCall?: (contact: EmergencyContact) => void
  /** Optional incident to associate the persisted P.A.S. summary/draft with. */
  incidentId?: string
}

type PASChecklist = typeof INITIAL_CHECKLIST

const EMERGENCY_CONTACTS = [
  { id: 'c5' as EmergencyContact, name: 'C5', number: '55-5533-5533', alt: '911', color: 'bg-red-600' },
  { id: 'erum' as EmergencyContact, name: 'ERUM', number: '55-5683-2222', color: 'bg-orange-600' },
  { id: 'cruz-roja' as EmergencyContact, name: 'Cruz Roja', number: '55-5557-5757', color: 'bg-blue-600' }
]

const INITIAL_CHECKLIST = {
  proteger: [
    { id: 'p1', text: 'Escena segura evaluada', checked: false },
    { id: 'p2', text: 'Peligros ambientales identificados', checked: false },
    { id: 'p3', text: 'Peligros humanos evaluados', checked: false },
    { id: 'p4', text: 'Medidas de protección establecidas', checked: false }
  ],
  avisar: [
    { id: 'a1', text: 'Emergencias activadas', checked: false },
    { id: 'a2', text: 'Ubicación comunicada claramente', checked: false },
    { id: 'a3', text: 'Naturaleza de emergencia explicada', checked: false },
    { id: 'a4', text: 'Número de personas reportado', checked: false }
  ],
  socorrer: [
    { id: 's1', text: 'Soporte vital básico iniciado', checked: false },
    { id: 's2', text: 'Control de sangrado aplicado', checked: false },
    { id: 's3', text: 'Manejo de shock iniciado', checked: false },
    { id: 's4', text: 'Reevaluación continua establecida', checked: false }
  ]
}

const STEP_CONTENT = {
  proteger: {
    title: 'Proteger',
    color: 'blue',
    description: 'Evaluación de seguridad de la escena: yo, transeúntes, sobreviviente',
    items: [
      'Peligros ambientales: tráfico, estructural, incendio',
      'Peligros humanos: violencia continua, individuos inestables',
      'Medidas de protección: posicionamiento, barreras'
    ],
    warning: '⚠️ Sin asistencia si la escena no está segura. Tu seguridad es primero.'
  },
  avisar: {
    title: 'Avisar',
    color: 'yellow',
    description: 'Activación de servicios de emergencia',
    items: [
      'C5: 55-5533-5533 o 911',
      'ERUM (local)',
      'Cruz Roja: 55-5557-5757'
    ],
    info: 'Información a comunicar: ubicación clara, naturaleza de la emergencia, número y condición de personas'
  },
  socorrer: {
    title: 'Socorrer',
    color: 'green',
    description: 'Soporte de vida básico dentro de los límites de capacitación',
    items: [
      'Control de sangrado, posicionamiento de vía aérea',
      'Manejo de shock',
      'Reevaluación continua'
    ],
    warnings: ['⚠️ Sin procedimientos invasivos', '⚠️ Sin administración de medicamentos']
  }
}

const REFERENCE_CARDS = {
  bleeding: {
    title: 'Sangrado que Amenaza la Vida',
    icon: <Droplets className="w-5 h-5 text-red-600" />,
    color: 'red',
    content: [
      'Reconocimiento: arterial que brota, venoso que se acumula',
      'Acción: presión directa con tela limpia, mínimo 10 minutos',
      'Elevación de la extremidad por encima del corazón',
      'Torniquete si está capacitado y disponible'
    ]
  },
  shock: {
    title: 'Shock',
    icon: <Activity className="w-5 h-5 text-blue-600" />,
    color: 'blue',
    content: [
      'Reconocimiento: piel pálida, fría, húmeda; pulso rápido y débil',
      'Posición supina con extremidades elevadas 30cm',
      'Calor (manta, calor corporal)',
      'Transporte urgente prioritario'
    ]
  }
}

export const PASProtocolGuide: React.FC<PASProtocolGuideProps> = ({
  onComplete,
  onEmergencyCall,
  incidentId
}) => {
  const store = useProtocoloStore()
  const currentUser = store.currentUser
  const draftKey = `pas-${incidentId || 'global'}`

  const [currentStep, setCurrentStep] = useState<PASStep>('proteger')
  const [checklist, setChecklist] = useState<PASChecklist>(() => {
    // Restore an in-progress draft so progress survives navigation/unmount.
    const draft = store.getProtocolDraft<PASChecklist>(draftKey)
    return draft ?? INITIAL_CHECKLIST
  })
  const [expandedRef, setExpandedRef] = useState<string | null>(null)

  // Persist the checklist on every change (debounced) so it is not lost.
  useEffect(() => {
    const t = setTimeout(() => store.saveProtocolDraft(draftKey, checklist), 300)
    return () => clearTimeout(t)
  }, [checklist, draftKey, store])

  const stepConfig = STEP_CONTENT[currentStep]
  const stepNumber = currentStep === 'proteger' ? 1 : currentStep === 'avisar' ? 2 : 3
  
  const colors: Record<string, { bg: string; text: string; border: string; light: string }> = {
    blue: { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
    yellow: { bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-200', light: 'bg-yellow-50' },
    green: { bg: 'bg-green-600', text: 'text-green-600', border: 'border-green-200', light: 'bg-green-50' },
    red: { bg: 'bg-red-600', text: 'text-red-600', border: 'border-red-200', light: 'bg-red-50' }
  }
  
  const c = colors[stepConfig.color]

  const progress = Math.round(
    (Object.values(checklist).flat().filter(i => i.checked).length / 12) * 100
  )

  const toggleItem = (step: PASStep, id: string) => {
    setChecklist(prev => ({
      ...prev,
      [step]: prev[step].map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    }))
    if (navigator.vibrate) navigator.vibrate(50)
  }

  const navigateStep = (dir: 'prev' | 'next') => {
    const steps: PASStep[] = ['proteger', 'avisar', 'socorrer']
    const idx = steps.indexOf(currentStep)
    if (dir === 'next' && idx < 2) setCurrentStep(steps[idx + 1])
    if (dir === 'prev' && idx > 0) setCurrentStep(steps[idx - 1])
  }

  const callEmergency = (contactId: EmergencyContact) => {
    onEmergencyCall?.(contactId)
    const contact = EMERGENCY_CONTACTS.find(c => c.id === contactId)
    if (contact) window.location.href = `tel:${contact.number.replace(/-/g, '')}`
  }

  // Build a human-readable summary of the P.A.S. checklist for the record.
  const buildSummary = useMemo(() => () => {
    const sectionTitle: Record<PASStep, string> = {
      proteger: 'PROTEGER',
      avisar: 'AVISAR',
      socorrer: 'SOCORRER'
    }
    const lines: string[] = [
      'PROTOCOLO P.A.S. - PROTOCOLO CDMX',
      `Incidente: ${incidentId || 'N/A'}`,
      `Fecha: ${new Date().toLocaleString('es-MX')}`,
      `Progreso: ${progress}%`,
      ''
    ];
    (['proteger', 'avisar', 'socorrer'] as PASStep[]).forEach(step => {
      lines.push(`${sectionTitle[step]}`)
      checklist[step].forEach(item => {
        lines.push(`  [${item.checked ? 'X' : ' '}] ${item.text}`)
      })
      lines.push('')
    })
    return lines.join('\n')
  }, [checklist, incidentId, progress])

  // Finalize: persist a permanent summary entry, clear the draft, then notify.
  const handleComplete = async () => {
    await store.saveProtocolResult({
      incidentId,
      capturedBy: currentUser?.pseudonym || 'Operador',
      title: `Resumen P.A.S. ${incidentId ? `- ${incidentId}` : ''}`.trim(),
      summary: buildSummary()
    })
    store.clearProtocolDraft(draftKey)
    onComplete?.()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Protocolo P.A.S.</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Proteger • Avisar • Socorrer</p>
          </div>
          
          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Progreso</span>
              <span className="font-bold">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 via-yellow-500 to-green-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between">
            {(['proteger', 'avisar', 'socorrer'] as PASStep[]).map((step, idx) => (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                  currentStep === step ? "bg-gray-100 dark:bg-gray-800" : "opacity-50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
                  step === 'proteger' ? 'bg-blue-600' : step === 'avisar' ? 'bg-yellow-500' : 'bg-green-600'
                )}>
                  {idx + 1}
                </div>
                <span className="text-xs font-medium capitalize">{step}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Step Card */}
        <Card className={cn("overflow-hidden", c.border)}>
          <CardHeader className={cn(c.light)}>
            <CardTitle className={cn("flex items-center gap-2", c.text)}>
              {currentStep === 'proteger' && <Shield className="w-6 h-6" />}
              {currentStep === 'avisar' && <Phone className="w-6 h-6" />}
              {currentStep === 'socorrer' && <Heart className="w-6 h-6" />}
              Paso {stepNumber}: {stepConfig.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <p className="text-gray-700 dark:text-gray-300">{stepConfig.description}</p>
            
            <ul className="space-y-2">
              {stepConfig.items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className={cn("mt-1", c.text)}>•</span>
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>

            {'warning' in stepConfig && stepConfig.warning && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-200 font-medium">{stepConfig.warning}</p>
              </div>
            )}

            {'warnings' in stepConfig && stepConfig.warnings && (
              <div className="space-y-2">
                {(stepConfig.warnings as string[]).map((w: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertOctagon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800 dark:text-red-200 font-medium">{w}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency Contacts (Avisar step) */}
        {currentStep === 'avisar' && (
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-white">Contactos de Emergencia</h3>
            {EMERGENCY_CONTACTS.map(contact => (
              <button
                key={contact.id}
                onClick={() => callEmergency(contact.id)}
                className={cn(
                  "w-full p-4 rounded-xl text-white font-bold text-left transition-all",
                  "transform active:scale-95 hover:opacity-90 shadow-lg",
                  contact.color
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      {contact.name}
                    </div>
                    <div className="text-2xl mt-1">{contact.number}</div>
                    {contact.alt && <div className="text-sm opacity-90">o {contact.alt}</div>}
                  </div>
                  <ExternalLink className="w-6 h-6 opacity-75" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Checklist */}
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <CheckCircle2 className={cn("w-5 h-5", c.text)} />
            Checklist
          </h3>
          <div className="space-y-2">
            {checklist[currentStep].map(item => (
              <button
                key={item.id}
                onClick={() => toggleItem(currentStep, item.id)}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left",
                  item.checked ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-50 dark:bg-gray-800"
                )}
              >
                <div className={cn(
                  "mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0",
                  item.checked ? "bg-green-500 text-white" : cn("border-2", c.border.replace('border-', 'border-'))
                )}>
                  {item.checked && <Check className="w-4 h-4" />}
                </div>
                <span className={cn("text-sm", item.checked ? "line-through text-gray-500" : "text-gray-900 dark:text-white")}>
                  {item.text}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Reference Cards (Socorrer step) */}
        {currentStep === 'socorrer' && (
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-white">Referencia Rápida</h3>
            {Object.entries(REFERENCE_CARDS).map(([key, card]) => {
              const isOpen = expandedRef === key
              const cc = colors[card.color]
              return (
                <div key={key} className={cn("border rounded-lg overflow-hidden", cc.border)}>
                  <button
                    onClick={() => setExpandedRef(isOpen ? null : key)}
                    className={cn("w-full flex items-center justify-between p-3", cc.light)}
                  >
                    <div className={cn("flex items-center gap-2 font-medium", cc.text)}>
                      {card.icon}
                      {card.title}
                    </div>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 space-y-2 bg-white dark:bg-gray-900">
                      {card.content.map((text, i) => (
                        <p key={i} className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigateStep('prev')}
            disabled={currentStep === 'proteger'}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          <Button
            className={cn("flex-1", c.bg)}
            onClick={() => currentStep === 'socorrer' ? void handleComplete() : navigateStep('next')}
          >
            {currentStep === 'socorrer' ? 'Completar' : 'Siguiente'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  )
}

export default PASProtocolGuide
