/**
 * Feature routes (secondary clusters)
 * Grito & Barrio
 *
 * Routes for the broader feature set (training, certifications, contacts,
 * safe-points, supplies, forms, scenarios, messaging, security settings,
 * duress). These render inside the AppShell layout (see App.tsx), so paths are
 * RELATIVE (no leading slash) to match how App.tsx nests its children.
 *
 * Many feature components expose a prop API (ids, onBack, onSelect, a role,
 * data arrays) rather than reading the router/store directly. The small wrapper
 * components below adapt react-router params/navigation and the Zustand store to
 * those prop APIs, and supply realistic seed data where the app does not yet
 * have a dedicated data source. Detail screens resolve their subject from the
 * route param.
 */

import { useState, lazy } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'

import { useProtocoloStore } from '@/store'
import type { TeamRole, UserRole } from '@/types'
import { isTeamRole } from '@/types'

// Secondary feature screens are code-split (lazy) so they stay out of the
// initial bundle — important for users on slow mobile connections. The
// AppShell provides the <Suspense> boundary with a loading fallback.
const TrainingDashboard = lazy(() => import('@/components/features/TrainingDashboard').then((m) => ({ default: m.TrainingDashboard })))
const TrainingModuleViewer = lazy(() => import('@/components/features/TrainingModule').then((m) => ({ default: m.TrainingModuleViewer })))
const CertificationTracker = lazy(() => import('@/components/features/CertificationTracker').then((m) => ({ default: m.CertificationTracker })))
const ScenarioSimulator = lazy(() => import('@/components/features/ScenarioSimulator').then((m) => ({ default: m.ScenarioSimulator })))
const ContactDirectory = lazy(() => import('@/components/features/ContactDirectory').then((m) => ({ default: m.ContactDirectory })))
const ContactTree = lazy(() => import('@/components/features/ContactTree').then((m) => ({ default: m.ContactTree })))
const SafePointsMap = lazy(() => import('@/components/features/SafePointsMap').then((m) => ({ default: m.SafePointsMap })))
const SafePointDetail = lazy(() => import('@/components/features/SafePointDetail').then((m) => ({ default: m.SafePointDetail })))
const SupplyChecklist = lazy(() => import('@/components/features/SupplyChecklist').then((m) => ({ default: m.SupplyChecklist })))
const FormFiller = lazy(() => import('@/components/features/FormFiller').then((m) => ({ default: m.FormFiller })))
const FormViewer = lazy(() => import('@/components/features/FormViewer').then((m) => ({ default: m.FormViewer })))
const MessageTemplates = lazy(() => import('@/components/features/MessageTemplates').then((m) => ({ default: m.MessageTemplates })))
const QuickDial = lazy(() => import('@/components/features/QuickDial').then((m) => ({ default: m.QuickDial })))
const RoleSwitcher = lazy(() => import('@/components/features/RoleSwitcher').then((m) => ({ default: m.RoleSwitcher })))
const SecuritySettings = lazy(() => import('@/components/features/SecuritySettings').then((m) => ({ default: m.SecuritySettings })))
const DuressMode = lazy(() => import('@/components/features/DuressMode').then((m) => ({ default: m.DuressMode })))

import type { Contact } from '@/types/contacts'
import type { SafePoint } from '@/types/resources'
import type {
  TrainingModule as TrainingModuleData,
  TrainingProgress,
  Certification,
} from '@/types/training'
import type { FormTemplate, FormData } from '@/types/forms'
import { FORM_TEMPLATES } from '@/types/forms'

// =============================================================================
// Seed data
//
// These components were authored against type modules (e.g. '@/types/resources'
// and '@/types/contacts') whose shapes differ from the resources stored in the
// Zustand store. Rather than lossy-convert, we provide small realistic catalogs
// here so the screens are fully populated and interactive. They are module-level
// (stable across renders) and double as the source detail screens resolve from.
// =============================================================================

const DIRECTORY_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Comandante de Brigada',
    pseudonym: 'Comandante',
    category: 'brigada',
    role: 'Coordinador',
    phones: [{ number: '55-1234-5678', type: 'signal', primary: true }],
    emails: [],
    priority: 1,
    availability: { status: 'available', hours: '24/7' },
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'C5 CDMX',
    category: 'emergencias',
    role: 'Centro de Comando',
    organization: 'Gobierno CDMX',
    phones: [{ number: '55-5533-5533', type: 'landline', primary: true }],
    emails: [],
    priority: 1,
    availability: { status: 'available', hours: '24/7' },
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'CDHCM',
    category: 'ddhh',
    role: 'Defensoría',
    organization: 'Comisión de Derechos Humanos CDMX',
    phones: [{ number: '55-5229-5600', type: 'landline', primary: true }],
    emails: [{ address: 'atencion@cdhcm.org.mx', primary: true }],
    priority: 1,
    availability: { status: 'available', hours: 'L-V 9:00-18:00' },
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Cruz Roja',
    category: 'emergencias',
    role: 'Emergencias Médicas',
    phones: [{ number: '55-5557-5757', type: 'landline', primary: true }],
    emails: [],
    priority: 1,
    availability: { status: 'available', hours: '24/7' },
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Brigadista Seguridad',
    pseudonym: 'Águila',
    category: 'brigada',
    role: 'Seguridad',
    phones: [{ number: '55-2222-3333', type: 'signal', primary: true }],
    emails: [],
    priority: 2,
    availability: { status: 'on_call', hours: '24/7' },
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Abogado de Guardia',
    pseudonym: 'Defensor',
    category: 'legal',
    role: 'Asesoría Legal',
    phones: [{ number: '55-4444-5555', type: 'signal', primary: true }],
    emails: [{ address: 'legal@brigada.mx', primary: true }],
    priority: 2,
    availability: { status: 'available', hours: 'L-V 8:00-20:00' },
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const SAFE_POINTS: SafePoint[] = [
  {
    id: 'sp-1',
    name: 'Parroquia San Judas Tadeo',
    type: 'church',
    address: 'Calle Zaragoza 123, Colonia Centro',
    coordinates: { lat: 19.4326, lng: -99.1332 },
    alcaldia: 'Cuauhtémoc',
    colonia: 'Centro',
    totalCapacity: 50,
    currentOccupancy: 0,
    availableSpots: 50,
    contactName: 'Padre Miguel Hernández',
    contactPhone: '55-1234-5678',
    accessAgreement: true,
    accessAgreementDate: '2023-06-15',
    hours: '24 horas',
    requiresAdvanceNotice: false,
    accessibility: ['wheelchair_accessible', 'pet_friendly', 'family_friendly'],
    amenities: { water: true, food: true, medical: false, wash: true, wifi: false, kitchen: true, showers: true, parking: true },
    status: 'active',
    isActive: true,
    lastUpdated: '2024-01-15T10:00:00Z',
    activationHistory: [],
    notes: 'Acceso por entrada lateral. Llave con el sacristán.',
  },
  {
    id: 'sp-2',
    name: 'Centro Cultural Casa del Pueblo',
    type: 'community_center',
    address: 'Avenida Revolución 456, Colonia San Ángel',
    coordinates: { lat: 19.3456, lng: -99.189 },
    alcaldia: 'Álvaro Obregón',
    colonia: 'San Ángel',
    totalCapacity: 100,
    currentOccupancy: 25,
    availableSpots: 75,
    contactName: 'María González',
    contactPhone: '55-9876-5432',
    contactEmail: 'contacto@casapueblo.org',
    accessAgreement: true,
    accessAgreementDate: '2023-08-20',
    hours: '8:00 - 22:00',
    requiresAdvanceNotice: true,
    advanceNoticeHours: 2,
    accessibility: ['wheelchair_accessible', 'gender_separated', 'quiet_space'],
    amenities: { water: true, food: false, medical: true, wash: true, wifi: true, kitchen: false, showers: true, parking: false },
    status: 'active',
    isActive: true,
    lastUpdated: '2024-01-15T12:00:00Z',
    activationHistory: [],
  },
  {
    id: 'sp-3',
    name: 'Escuela Primaria Miguel Hidalgo',
    type: 'school',
    address: 'Calle Allende 789, Colonia Roma',
    coordinates: { lat: 19.4156, lng: -99.159 },
    alcaldia: 'Cuauhtémoc',
    colonia: 'Roma Norte',
    totalCapacity: 200,
    currentOccupancy: 0,
    availableSpots: 200,
    contactName: 'Director Carlos Ruiz',
    contactPhone: '55-2468-1357',
    accessAgreement: false,
    hours: 'Lunes a Viernes 7:00 - 20:00',
    requiresAdvanceNotice: true,
    advanceNoticeHours: 24,
    accessibility: ['wheelchair_accessible', 'family_friendly'],
    amenities: { water: true, food: false, medical: false, wash: true, wifi: false, kitchen: false, showers: false, parking: true },
    status: 'pending',
    isActive: false,
    lastUpdated: '2024-01-14T15:00:00Z',
    activationHistory: [],
    notes: 'Pendiente de firma de convenio. Contactar a dirección escolar.',
  },
]

// Training modules with real lessons so the module viewer is interactive.
const TRAINING_MODULES: TrainingModuleData[] = [
  {
    id: 'mod-1',
    title: 'P.A.S. Fundamentos',
    description: 'Proteger - Avisar - Socorrer: principios básicos de respuesta',
    category: 'fundamentos',
    certificationLevel: 1,
    duration: 2,
    status: 'in_progress',
    progress: 50,
    prerequisites: [],
    isDownloaded: true,
    order: 1,
    startedAt: '2024-01-15T09:00:00Z',
    lessons: [
      {
        id: 'mod-1-l1',
        title: 'Introducción al protocolo P.A.S.',
        type: 'text',
        content:
          '<p>El protocolo <strong>P.A.S.</strong> (Proteger, Avisar, Socorrer) ordena la respuesta ante un desalojo: primero la seguridad de las personas, luego la coordinación y el aviso a la red, y por último la asistencia.</p>',
        duration: 8,
        isCompleted: false,
        checkpoint: {
          id: 'mod-1-l1-cp',
          description: 'Recuerda: la seguridad de las personas siempre es la prioridad número uno.',
          isCompleted: false,
        },
      },
      {
        id: 'mod-1-l2',
        title: 'Lista de verificación inicial',
        type: 'checklist',
        content:
          '- Evaluar riesgos en la escena\n- Identificar rutas de salida\n- Confirmar punto seguro más cercano\n- Avisar al coordinador de la brigada',
        duration: 5,
        isCompleted: false,
      },
      {
        id: 'mod-1-l3',
        title: 'Evaluación de conocimientos',
        type: 'quiz',
        content: '',
        duration: 5,
        isCompleted: false,
        quiz: {
          id: 'mod-1-quiz',
          passingScore: 60,
          maxAttempts: 3,
          attempts: 0,
          bestScore: 0,
          questions: [
            {
              id: 'q1',
              text: '¿Cuál es la primera prioridad al llegar a la escena de un desalojo?',
              type: 'multiple_choice',
              options: [
                { id: 'a', text: 'Documentar con fotos' },
                { id: 'b', text: 'La seguridad de las personas' },
                { id: 'c', text: 'Contactar a la prensa' },
              ],
              correctAnswer: 'b',
              explanation: 'Proteger a las personas es siempre lo primero.',
              points: 1,
            },
            {
              id: 'q2',
              text: 'P.A.S. significa Proteger, Avisar y Socorrer.',
              type: 'true_false',
              options: [
                { id: 'true', text: 'Verdadero' },
                { id: 'false', text: 'Falso' },
              ],
              correctAnswer: 'true',
              explanation: 'Correcto: Proteger, Avisar, Socorrer.',
              points: 1,
            },
          ],
        },
      },
    ],
  },
  {
    id: 'mod-2',
    title: 'Cultura de Seguridad',
    description: 'Protocolos de seguridad operativa para brigadistas',
    category: 'fundamentos',
    certificationLevel: 1,
    duration: 1.5,
    status: 'available',
    progress: 0,
    prerequisites: [],
    isDownloaded: false,
    order: 2,
    lessons: [
      {
        id: 'mod-2-l1',
        title: 'Seguridad personal y del equipo',
        type: 'text',
        content:
          '<p>Antes de cualquier acción, evalúa la seguridad del entorno y mantén comunicación constante con tu equipo. Nunca actúes en solitario en situaciones de riesgo.</p>',
        duration: 6,
        isCompleted: false,
      },
      {
        id: 'mod-2-l2',
        title: 'Verificación de seguridad',
        type: 'checklist',
        content:
          '- Mantener distancia segura de agresores\n- Confirmar señales acordadas con la comunidad\n- Tener identificado un punto de retiro',
        duration: 4,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'mod-3',
    title: 'Coordinación Multifuncional',
    description: 'Gestión de equipos en incidentes complejos',
    category: 'liderazgo',
    certificationLevel: 3,
    duration: 6,
    status: 'locked',
    progress: 0,
    prerequisites: ['mod-1', 'mod-2'],
    isDownloaded: false,
    order: 3,
    lessons: [
      {
        id: 'mod-3-l1',
        title: 'Roles del equipo de respuesta',
        type: 'text',
        content:
          '<p>Un incidente complejo requiere coordinar liderazgo, seguridad, legal, médico, dispatch y logística. Cada rol tiene responsabilidades claras.</p>',
        duration: 10,
        isCompleted: false,
      },
    ],
  },
]

const buildTrainingProgress = (
  modules: TrainingModuleData[],
  certificationLevel: 1 | 2 | 3,
): TrainingProgress => {
  const completed = modules.filter((m) => m.status === 'completed')
  return {
    userId: 'local',
    certificationLevel,
    totalHoursCompleted: completed.reduce((sum, m) => sum + m.duration, 0),
    modulesCompleted: completed.length,
    scenariosCompleted: 0,
    averageScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityAt: new Date().toISOString(),
    modules: Object.fromEntries(
      modules.map((m) => [
        m.id,
        {
          moduleId: m.id,
          status: m.status,
          progress: m.progress,
          lessonsCompleted: m.lessons.filter((l) => l.isCompleted).length,
          totalLessons: m.lessons.length,
          completedAt: m.completedAt,
          startedAt: m.startedAt,
        },
      ]),
    ),
    scenarios: {},
  }
}

const CERTIFICATIONS: Certification[] = [
  {
    level: 1,
    title: 'Nivel 1: Fundamentos',
    description: 'Certificación en fundamentos de respuesta a desalojos',
    requirements: { totalHours: 8, modulesRequired: 4, scenariosRequired: 2, minimumScore: 70 },
    modules: ['mod-1', 'mod-2'],
    earnedAt: undefined,
    expiresAt: undefined,
    isValid: false,
  },
]

// Form templates. The app does not ship full FormTemplate definitions, so we
// derive a couple of usable ones from the FORM_TEMPLATES catalog for the
// fill -> view -> print flow.
const FORM_TEMPLATE_LIST: FormTemplate[] = [
  {
    id: 'incident_report',
    type: 'incident_report',
    title: FORM_TEMPLATES.incident_report.title,
    description: FORM_TEMPLATES.incident_report.description,
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    legalNotice: 'Este documento es confidencial y puede usarse como evidencia. Verifique la exactitud de los datos antes de firmar.',
    sections: [
      {
        id: 'alerta',
        title: 'Información de la Alerta',
        description: 'Datos del aviso inicial',
        fields: [
          { id: 'alertDate', type: 'date', label: 'Fecha de la alerta', required: true },
          { id: 'alertTime', type: 'text', label: 'Hora de la alerta', placeholder: 'HH:MM', required: true },
          { id: 'alertSource', type: 'text', label: 'Fuente de la alerta', placeholder: 'Hotline, red comunitaria...' },
        ],
      },
      {
        id: 'ubicacion',
        title: 'Ubicación',
        fields: [
          { id: 'street', type: 'text', label: 'Calle y número', required: true },
          { id: 'colonia', type: 'text', label: 'Colonia', required: true },
          { id: 'alcaldia', type: 'text', label: 'Alcaldía', required: true },
          { id: 'reference', type: 'textarea', label: 'Referencias', placeholder: 'Edificio, piso, señas...' },
        ],
      },
      {
        id: 'situacion',
        title: 'Situación',
        fields: [
          { id: 'occupantsAtRisk', type: 'number', label: 'Personas en riesgo', validation: { min: 0 } },
          { id: 'minorsPresent', type: 'checkbox', label: '¿Hay menores presentes?' },
          { id: 'description', type: 'textarea', label: 'Descripción de los hechos', required: true },
        ],
      },
    ],
  },
  {
    id: 'witness_statement',
    type: 'witness_statement',
    title: FORM_TEMPLATES.witness_statement.title,
    description: FORM_TEMPLATES.witness_statement.description,
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    legalNotice: 'El testimonio se recoge con el consentimiento de la persona y se mantiene bajo confidencialidad.',
    sections: [
      {
        id: 'entrevista',
        title: 'Datos de la Entrevista',
        fields: [
          { id: 'interviewDate', type: 'date', label: 'Fecha', required: true },
          { id: 'witnessPseudonym', type: 'text', label: 'Seudónimo del testigo', required: true },
          { id: 'relationshipToEvent', type: 'text', label: 'Relación con los hechos' },
        ],
      },
      {
        id: 'declaracion',
        title: 'Declaración',
        fields: [
          { id: 'fullStatement', type: 'textarea', label: 'Declaración completa', required: true },
          { id: 'consentGiven', type: 'checkbox', label: 'Consentimiento otorgado', required: true },
        ],
      },
    ],
  },
]

// In-memory store of filled forms, keyed by template id, so the FormFiller ->
// FormViewer flow shows the data that was just entered (and can be printed).
const filledForms = new Map<string, FormData>()

// =============================================================================
// Wrappers
// =============================================================================

function TrainingDashboardRoute() {
  const navigate = useNavigate()
  const certificationLevel = useProtocoloStore(
    (s) => s.currentUser?.certificationLevel ?? 1,
  )
  return (
    <TrainingDashboard
      modules={TRAINING_MODULES}
      progress={buildTrainingProgress(TRAINING_MODULES, certificationLevel)}
      onModuleClick={(moduleId) => navigate(`/training/${moduleId}`)}
      onScenarioClick={() => navigate('/scenarios')}
    />
  )
}

function TrainingModuleRoute() {
  const navigate = useNavigate()
  const { moduleId } = useParams()
  const completeTraining = useProtocoloStore((s) => s.completeTraining)

  const module = TRAINING_MODULES.find((m) => m.id === moduleId)
  if (!module) return <Navigate to="/training" replace />

  const currentIndex = TRAINING_MODULES.findIndex((m) => m.id === module.id)
  const nextModule = TRAINING_MODULES[currentIndex + 1]

  return (
    <TrainingModuleViewer
      module={module}
      onBack={() => navigate('/training')}
      onComplete={(id) => completeTraining(id, module.title)}
      onNextModule={() =>
        navigate(nextModule ? `/training/${nextModule.id}` : '/training')
      }
    />
  )
}

function CertificationTrackerRoute() {
  const navigate = useNavigate()
  const certificationLevel = useProtocoloStore(
    (s) => s.currentUser?.certificationLevel ?? 1,
  )
  return (
    <CertificationTracker
      certifications={CERTIFICATIONS}
      progress={buildTrainingProgress(TRAINING_MODULES, certificationLevel)}
      modules={TRAINING_MODULES}
      onRequestEvaluation={() => navigate('/training')}
    />
  )
}

function ScenarioSimulatorRoute() {
  return <ScenarioSimulator />
}

function ContactDirectoryRoute() {
  return <ContactDirectory contacts={DIRECTORY_CONTACTS} />
}

function ContactTreeRoute() {
  const dial = (contactId: string) => {
    const contact = DIRECTORY_CONTACTS.find((c) => c.id === contactId)
    const phone = contact?.phones.find((p) => p.primary)?.number || contact?.phones[0]?.number
    if (phone) window.location.href = `tel:${phone.replace(/[^0-9+]/g, '')}`
  }
  return (
    <ContactTree
      contacts={DIRECTORY_CONTACTS}
      onCall={dial}
      onMessage={dial}
    />
  )
}

function SafePointsMapRoute() {
  const navigate = useNavigate()
  return (
    <SafePointsMap
      safePoints={SAFE_POINTS}
      onSafePointClick={(sp) => navigate(`/safe-points/${sp.id}`)}
      onGetDirections={(sp) =>
        window.open(
          `https://www.google.com/maps/search/?api=1&query=${sp.coordinates.lat},${sp.coordinates.lng}`,
          '_blank',
        )
      }
    />
  )
}

function SafePointDetailRoute() {
  const { id } = useParams()
  const safePoint = SAFE_POINTS.find((sp) => sp.id === id)
  if (!safePoint) return <Navigate to="/safe-points" replace />
  return (
    <SafePointDetail
      safePoint={safePoint}
      canEdit
      onGetDirections={(sp) =>
        window.open(
          `https://www.google.com/maps/search/?api=1&query=${sp.coordinates.lat},${sp.coordinates.lng}`,
          '_blank',
        )
      }
      onEdit={(updated) => {
        // Persist edits into the in-memory catalog so the change survives
        // re-navigation within the session.
        const index = SAFE_POINTS.findIndex((sp) => sp.id === updated.id)
        if (index >= 0) SAFE_POINTS[index] = updated
      }}
    />
  )
}

function SupplyChecklistRoute() {
  return <SupplyChecklist checklists={[]} />
}

function FormFillerRoute() {
  const navigate = useNavigate()
  const [templateId, setTemplateId] = useState<string>(FORM_TEMPLATE_LIST[0].id)
  const template = FORM_TEMPLATE_LIST.find((t) => t.id === templateId) || FORM_TEMPLATE_LIST[0]

  return (
    <div className="p-4 space-y-4">
      {/* Template picker so this entry screen exposes all available forms. */}
      <div className="flex flex-wrap gap-2">
        {FORM_TEMPLATE_LIST.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTemplateId(t.id)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              t.id === templateId
                ? 'bg-primary text-primary-foreground'
                : 'bg-background hover:bg-accent'
            }`}
          >
            {t.title}
          </button>
        ))}
      </div>

      <FormFiller
        key={template.id}
        template={template}
        initialData={filledForms.get(template.id)}
        onCancel={() => navigate('/')}
        onSave={(data) => filledForms.set(template.id, data)}
        onSubmit={(data) => {
          filledForms.set(template.id, data)
          navigate(`/forms/${template.id}`)
        }}
      />
    </div>
  )
}

function FormViewerRoute() {
  const navigate = useNavigate()
  const { id } = useParams()
  const template = FORM_TEMPLATE_LIST.find((t) => t.id === id)
  if (!template) return <Navigate to="/forms" replace />

  const formData: FormData =
    filledForms.get(template.id) || {
      id: `form-${template.id}`,
      templateId: template.id,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Operador',
      values: {},
    }

  return (
    <div className="p-4">
      <FormViewer
        formData={formData}
        template={template}
        onPrint={() => window.print()}
        onExportPDF={() => window.print()}
      />
      <button
        type="button"
        className="mt-4 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
        onClick={() => navigate('/forms')}
      >
        Volver a formularios
      </button>
    </div>
  )
}

function MessageTemplatesRoute() {
  return <MessageTemplates />
}

function QuickDialRoute() {
  return <QuickDial contacts={DIRECTORY_CONTACTS} />
}

function RoleSwitcherRoute() {
  const navigate = useNavigate()
  const currentUser = useProtocoloStore((s) => s.currentUser)
  const updateRole = useProtocoloStore((s) => s.updateRole)

  // RoleSwitcher operates on TeamRole; map the (broader) UserRole down to a
  // sensible team role for display.
  const role: TeamRole = isTeamRole(currentUser?.role) ? currentUser!.role : 'leader'

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Cambiar Rol</h1>
      <p className="text-sm text-muted-foreground">
        Selecciona el rol con el que operarás en el equipo.
      </p>
      <RoleSwitcher
        currentRole={role}
        userCertificationLevel={currentUser?.certificationLevel ?? 1}
        userPseudonym={currentUser?.pseudonym ?? 'Operador'}
        onRoleChange={(newRole: TeamRole) => {
          updateRole(newRole as UserRole)
          navigate(`/roles/${newRole}`)
        }}
      />
    </div>
  )
}

function SecuritySettingsRoute() {
  return <SecuritySettings />
}

function DuressModeRoute() {
  const navigate = useNavigate()
  return <DuressMode onExit={() => navigate('/security')} />
}

// =============================================================================
// Route table
// =============================================================================

export const featureRoutes: RouteObject[] = [
  { path: 'training', element: <TrainingDashboardRoute /> },
  { path: 'training/:moduleId', element: <TrainingModuleRoute /> },
  { path: 'certifications', element: <CertificationTrackerRoute /> },
  { path: 'resources/contacts', element: <ContactDirectoryRoute /> },
  { path: 'contacts/tree', element: <ContactTreeRoute /> },
  { path: 'safe-points', element: <SafePointsMapRoute /> },
  { path: 'safe-points/:id', element: <SafePointDetailRoute /> },
  { path: 'supplies', element: <SupplyChecklistRoute /> },
  { path: 'forms', element: <FormFillerRoute /> },
  { path: 'forms/:id', element: <FormViewerRoute /> },
  { path: 'scenarios', element: <ScenarioSimulatorRoute /> },
  { path: 'messages', element: <MessageTemplatesRoute /> },
  { path: 'quick-dial', element: <QuickDialRoute /> },
  { path: 'roles/switch', element: <RoleSwitcherRoute /> },
  { path: 'security', element: <SecuritySettingsRoute /> },
  { path: 'security/duress', element: <DuressModeRoute /> },
]

export default featureRoutes
