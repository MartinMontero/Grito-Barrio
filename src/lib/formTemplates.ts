/**
 * Form Templates
 * Protocolo CDMX
 * 
 * Pre-defined legal-grade form templates
 */

import type { FormTemplate } from '@/types/forms'
import { 
  ALCALDIAS
} from '@/types/forms'

// =============================================================================
// FORM 1: INCIDENT REPORT
// =============================================================================

export const INCIDENT_REPORT_TEMPLATE: FormTemplate = {
  id: 'incident-report-v1',
  type: 'incident_report',
  title: 'Reporte de Incidente',
  description: 'Documentación completa de un incidente de desalojo o amenaza',
  version: '1.0',
  lastUpdated: '2025-01-15',
  sections: [
    {
      id: 'alert-info',
      title: 'Información de la Alerta',
      description: 'Detalles sobre cómo y cuándo se recibió la alerta inicial',
      fields: [
        {
          id: 'alertDate',
          type: 'date',
          label: 'Fecha de la alerta',
          required: true
        },
        {
          id: 'alertTime',
          type: 'text',
          label: 'Hora de la alerta',
          placeholder: 'HH:MM',
          required: true,
          validation: {
            pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
          }
        },
        {
          id: 'alertSource',
          type: 'select',
          label: 'Fuente de la alerta',
          required: true,
          options: [
            { value: 'hotline', label: 'Línea de emergencia' },
            { value: 'social_media', label: 'Redes sociales' },
            { value: 'community_network', label: 'Red comunitaria' },
            { value: 'direct_observation', label: 'Observación directa' },
            { value: 'legal_aid', label: 'Organización de ayuda legal' },
            { value: 'government_notice', label: 'Notificación oficial' }
          ]
        }
      ]
    },
    {
      id: 'arrival-info',
      title: 'Información de Llegada',
      description: 'Registro de la llegada del equipo al lugar del incidente',
      fields: [
        {
          id: 'arrivalDate',
          type: 'date',
          label: 'Fecha de llegada',
          required: true
        },
        {
          id: 'arrivalTime',
          type: 'text',
          label: 'Hora de llegada',
          placeholder: 'HH:MM',
          required: true,
          validation: {
            pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
          }
        },
        {
          id: 'responseTime',
          type: 'text',
          label: 'Tiempo de respuesta',
          placeholder: 'ej: 15 minutos',
          helpText: 'Tiempo transcurrido desde la alerta hasta la llegada'
        }
      ]
    },
    {
      id: 'location',
      title: 'Ubicación del Incidente',
      description: 'Dirección exacta y coordenadas del lugar',
      fields: [
        {
          id: 'street',
          type: 'text',
          label: 'Calle',
          required: true
        },
        {
          id: 'number',
          type: 'text',
          label: 'Número exterior',
          required: true
        },
        {
          id: 'interior',
          type: 'text',
          label: 'Número interior',
          required: false
        },
        {
          id: 'colonia',
          type: 'text',
          label: 'Colonia',
          required: true
        },
        {
          id: 'alcaldia',
          type: 'select',
          label: 'Alcaldía',
          required: true,
          options: ALCALDIAS.map(a => ({ value: a, label: a }))
        },
        {
          id: 'postalCode',
          type: 'text',
          label: 'Código postal',
          validation: {
            pattern: '^\\d{5}$'
          }
        },
        {
          id: 'reference',
          type: 'textarea',
          label: 'Referencias',
          placeholder: 'Entre qué calles, color de edificio, etc.',
          helpText: 'Indicaciones adicionales para ubicar el lugar'
        }
      ]
    },
    {
      id: 'people-present',
      title: 'Personas Presentes',
      description: 'Equipo y otras personas que estuvieron en el lugar',
      fields: [
        {
          id: 'teamMembers',
          type: 'list',
          label: 'Miembros del equipo',
          helpText: 'Incluir seudónimo, rol, hora de llegada y salida'
        },
        {
          id: 'occupantsCount',
          type: 'number',
          label: 'Número de ocupantes',
          validation: {
            min: 0
          }
        },
        {
          id: 'minorsPresent',
          type: 'checkbox',
          label: '¿Hay menores de edad presentes?'
        },
        {
          id: 'vulnerablePersons',
          type: 'checkbox',
          label: '¿Hay personas vulnerables (adultos mayores, discapacitados)?'
        }
      ]
    },
    {
      id: 'event-sequence',
      title: 'Secuencia de Eventos',
      description: 'Cronología detallada de lo ocurrido',
      fields: [
        {
          id: 'eventDescription',
          type: 'textarea',
          label: 'Descripción de eventos',
          placeholder: 'Describa la secuencia cronológica de los eventos...',
          required: true,
          helpText: 'Incluir horas aproximadas y testigos'
        },
        {
          id: 'initialSituation',
          type: 'textarea',
          label: 'Situación inicial al llegar',
          required: true
        },
        {
          id: 'changesOverTime',
          type: 'textarea',
          label: 'Cambios durante el incidente',
          helpText: '¿Cómo evolucionó la situación?'
        }
      ]
    },
    {
      id: 'decisions',
      title: 'Decisiones Tomadas',
      description: 'Registro de decisiones y quién las tomó',
      fields: [
        {
          id: 'decisionsMade',
          type: 'textarea',
          label: 'Decisiones realizadas',
          placeholder: '1. [Hora] - [Decisión] - Tomada por: [Persona]...',
          required: true,
          helpText: 'Incluir hora, decisión, quién la tomó y base de información'
        },
        {
          id: 'protocolsActivated',
          type: 'list',
          label: 'Protocolos activados',
          helpText: 'Ej: P.A.S., Retirada, etc.'
        }
      ]
    },
    {
      id: 'evidence',
      title: 'Evidencia Recolectada',
      description: 'Documentación de evidencia y cadena de custodia',
      fields: [
        {
          id: 'evidenceItems',
          type: 'textarea',
          label: 'Listado de evidencia',
          placeholder: 'Tipo | Descripción | Recolectado por | Hora | Custodio',
          helpText: 'Documentar cada ítem de evidencia recolectada'
        },
        {
          id: 'photosTaken',
          type: 'number',
          label: 'Fotografías tomadas',
          validation: {
            min: 0
          }
        },
        {
          id: 'videosTaken',
          type: 'number',
          label: 'Videos grabados',
          validation: {
            min: 0
          }
        },
        {
          id: 'chainOfCustodyInitiated',
          type: 'checkbox',
          label: '¿Se inició cadena de custodia?',
          required: true
        }
      ]
    },
    {
      id: 'injuries',
      title: 'Lesiones',
      description: 'Registro de cualquier lesión ocurrida',
      fields: [
        {
          id: 'injuriesOccurred',
          type: 'checkbox',
          label: '¿Ocurrieron lesiones?'
        },
        {
          id: 'injuriesDescription',
          type: 'textarea',
          label: 'Descripción de lesiones',
          placeholder: 'Persona | Naturaleza | Severidad | Atención proporcionada | Referencia',
          helpText: 'Documentar solo si aplica'
        },
        {
          id: 'medicalAttention',
          type: 'checkbox',
          label: '¿Se requirió atención médica?'
        }
      ]
    },
    {
      id: 'authorities',
      title: 'Autoridades Presentes',
      description: 'Información sobre autoridades en el lugar',
      fields: [
        {
          id: 'authoritiesPresent',
          type: 'checkbox',
          label: '¿Había autoridades presentes?'
        },
        {
          id: 'authorityTypes',
          type: 'list',
          label: 'Tipos de autoridades',
          helpText: 'Policía, oficial judicial, seguridad privada, etc.'
        },
        {
          id: 'authorityIdentification',
          type: 'textarea',
          label: 'Identificación de autoridades',
          placeholder: 'Tipo | Nombre/ID | Placa/Número | Declaraciones',
          helpText: 'Documentar identificación y declaraciones'
        },
        {
          id: 'judicialOrderPresent',
          type: 'checkbox',
          label: '¿Se presentó orden judicial?'
        },
        {
          id: 'judicialOrderDetails',
          type: 'textarea',
          label: 'Detalles de la orden judicial',
          helpText: 'Tipo de orden, número, fecha, juzgado, etc.'
        }
      ]
    },
    {
      id: 'witnesses',
      title: 'Testigos',
      description: 'Personas que observaron el incidente',
      fields: [
        {
          id: 'witnessesPresent',
          type: 'checkbox',
          label: '¿Hay testigos disponibles?'
        },
        {
          id: 'witnessesInfo',
          type: 'textarea',
          label: 'Información de testigos',
          placeholder: 'Seudónimo | Contacto seguro | Qué observó | Disponibilidad',
          helpText: 'Incluir relación con el evento y observaciones'
        }
      ]
    },
    {
      id: 'next-steps',
      title: 'Siguientes Pasos',
      description: 'Acciones a seguir después del incidente',
      fields: [
        {
          id: 'nextActions',
          type: 'textarea',
          label: 'Acciones planificadas',
          placeholder: 'Acción | Responsable | Plazo | Prioridad',
          required: true
        },
        {
          id: 'followUpRequired',
          type: 'checkbox',
          label: '¿Se requiere seguimiento?'
        },
        {
          id: 'legalAction',
          type: 'checkbox',
          label: '¿Se requiere acción legal?'
        }
      ]
    },
    {
      id: 'additional',
      title: 'Información Adicional',
      description: 'Cualquier otra información relevante',
      fields: [
        {
          id: 'additionalNotes',
          type: 'textarea',
          label: 'Notas adicionales',
          placeholder: 'Cualquier información adicional relevante...',
          helpText: 'Observaciones, contexto, o información complementaria'
        },
        {
          id: 'emotionalState',
          type: 'textarea',
          label: 'Estado emocional de ocupantes',
          helpText: 'Para evaluar necesidades de apoyo psicológico'
        }
      ]
    },
    {
      id: 'signatures',
      title: 'Firmas',
      description: 'Validación y autorización del reporte',
      fields: [
        {
          id: 'preparedBy',
          type: 'text',
          label: 'Preparado por',
          required: true
        },
        {
          id: 'preparedBySignature',
          type: 'signature',
          label: 'Firma del preparador'
        },
        {
          id: 'reviewedBy',
          type: 'text',
          label: 'Revisado por'
        },
        {
          id: 'reviewedBySignature',
          type: 'signature',
          label: 'Firma del revisor'
        },
        {
          id: 'preparedAt',
          type: 'datetime',
          label: 'Fecha y hora de preparación',
          required: true
        }
      ]
    }
  ],
  footer: 'Este reporte es un documento legal que forma parte de la documentación del incidente. La información proporcionada debe ser veraz y completa.',
  legalNotice: 'AVISO LEGAL: Este documento es confidencial y está protegido por las leyes de protección de datos personales. El uso indebido de esta información puede resultar en sanciones legales.'
}

// =============================================================================
// FORM 2: WITNESS STATEMENT
// =============================================================================

export const WITNESS_STATEMENT_TEMPLATE: FormTemplate = {
  id: 'witness-statement-v1',
  type: 'witness_statement',
  title: 'Declaración de Testigo',
  description: 'Registro de testimonio de persona que observó el incidente',
  version: '1.0',
  lastUpdated: '2025-01-15',
  sections: [
    {
      id: 'interview-info',
      title: 'Información de la Entrevista',
      fields: [
        {
          id: 'interviewDate',
          type: 'date',
          label: 'Fecha de la entrevista',
          required: true
        },
        {
          id: 'interviewTime',
          type: 'text',
          label: 'Hora de la entrevista',
          placeholder: 'HH:MM',
          required: true
        },
        {
          id: 'interviewLocation',
          type: 'text',
          label: 'Lugar de la entrevista',
          required: true
        },
        {
          id: 'interviewer',
          type: 'text',
          label: 'Entrevistador',
          required: true
        }
      ]
    },
    {
      id: 'witness-info',
      title: 'Información del Testigo',
      fields: [
        {
          id: 'witnessPseudonym',
          type: 'text',
          label: 'Seudónimo del testigo',
          required: true,
          helpText: 'Nombre o identificador para registro interno'
        },
        {
          id: 'secureContact',
          type: 'text',
          label: 'Contacto seguro',
          required: true,
          helpText: 'Número de Signal, Telegram o método de contacto seguro'
        },
        {
          id: 'relationshipToEvent',
          type: 'select',
          label: 'Relación con el evento',
          required: true,
          options: [
            { value: 'occupant', label: 'Ocupante' },
            { value: 'neighbor', label: 'Vecino' },
            { value: 'passerby', label: 'Transeúnte' },
            { value: 'relative', label: 'Familiar' },
            { value: 'acquaintance', label: 'Conocido' },
            { value: 'worker', label: 'Trabajador' },
            { value: 'other', label: 'Otro' }
          ]
        }
      ]
    },
    {
      id: 'observation',
      title: 'Observación',
      fields: [
        {
          id: 'observationLocation',
          type: 'text',
          label: 'Desde dónde observó',
          placeholder: 'Ej: Desde la calle, desde el edificio de enfrente...',
          required: true
        },
        {
          id: 'observationTimestamp',
          type: 'text',
          label: 'Hora de la observación',
          placeholder: 'HH:MM',
          required: true
        },
        {
          id: 'observationDuration',
          type: 'text',
          label: 'Duración de la observación',
          placeholder: 'Ej: 30 minutos'
        },
        {
          id: 'weatherConditions',
          type: 'text',
          label: 'Condiciones climáticas',
          placeholder: 'Ej: Soleado, lluvia, nublado'
        },
        {
          id: 'lightingConditions',
          type: 'text',
          label: 'Condiciones de iluminación',
          placeholder: 'Ej: Plena luz del día, atardecer, noche con alumbrado público'
        },
        {
          id: 'obstacles',
          type: 'text',
          label: 'Obstáculos visuales',
          placeholder: 'Ej: Árboles, vehículos estacionados, multitud'
        }
      ]
    },
    {
      id: 'people-present',
      title: 'Personas Presentes',
      fields: [
        {
          id: 'peopleObserved',
          type: 'textarea',
          label: 'Personas que observó',
          placeholder: 'Describa las personas presentes: vestimenta, comportamiento, roles...',
          required: true
        },
        {
          id: 'occupantsCount',
          type: 'number',
          label: 'Número aproximado de ocupantes',
          validation: {
            min: 0
          }
        },
        {
          id: 'authoritiesObserved',
          type: 'textarea',
          label: 'Autoridades observadas',
          placeholder: 'Tipo, número aproximado, uniforme, vehículos...'
        }
      ]
    },
    {
      id: 'statements',
      title: 'Declaraciones Escuchadas',
      fields: [
        {
          id: 'statementsHeard',
          type: 'textarea',
          label: 'Declaraciones que escuchó',
          placeholder: 'Quién habló | Qué dijo | Contexto',
          helpText: 'Documentar exactamente lo que escuchó, entre comillas si es posible'
        },
        {
          id: 'authoritiesStatements',
          type: 'textarea',
          label: 'Declaraciones de autoridades',
          helpText: '¿Qué dijeron las autoridades presentes?'
        }
      ]
    },
    {
      id: 'full-statement',
      title: 'Declaración Completa',
      fields: [
        {
          id: 'fullStatement',
          type: 'textarea',
          label: 'Declaración del testigo (texto completo)',
          placeholder: 'Escriba aquí la declaración completa del testigo...',
          required: true,
          helpText: 'Transcripción completa de lo que el testigo declara haber observado'
        },
        {
          id: 'statementClarity',
          type: 'select',
          label: 'Claridad del testimonio',
          options: [
            { value: 'very_clear', label: 'Muy claro' },
            { value: 'clear', label: 'Claro' },
            { value: 'unclear', label: 'Poco claro' },
            { value: 'confused', label: 'Confuso' }
          ]
        }
      ]
    },
    {
      id: 'availability',
      title: 'Disponibilidad',
      fields: [
        {
          id: 'availableForFormalStatement',
          type: 'checkbox',
          label: '¿Disponible para declaración formal?',
          required: true
        },
        {
          id: 'preferredContactMethod',
          type: 'select',
          label: 'Método de contacto preferido',
          options: [
            { value: 'signal', label: 'Signal' },
            { value: 'telegram', label: 'Telegram' },
            { value: 'phone', label: 'Llamada telefónica' },
            { value: 'email', label: 'Correo electrónico' },
            { value: 'in_person', label: 'En persona' }
          ]
        },
        {
          id: 'availabilitySchedule',
          type: 'text',
          label: 'Horario de disponibilidad',
          placeholder: 'Ej: Lunes a viernes después de 6pm'
        }
      ]
    },
    {
      id: 'support',
      title: 'Necesidades de Apoyo',
      fields: [
        {
          id: 'supportNeeds',
          type: 'list',
          label: 'Necesidades de apoyo identificadas',
          helpText: 'Apoyo legal, psicológico, de seguridad, etc.'
        },
        {
          id: 'emotionalState',
          type: 'select',
          label: 'Estado emocional del testigo',
          options: [
            { value: 'calm', label: 'Calmado' },
            { value: 'nervous', label: 'Nervioso' },
            { value: 'scared', label: 'Asustado' },
            { value: 'angry', label: 'Enojado' },
            { value: 'confused', label: 'Confundido' },
            { value: 'shocked', label: 'En shock' }
          ]
        },
        {
          id: 'safetyConcerns',
          type: 'textarea',
          label: 'Preocupaciones de seguridad',
          helpText: '¿El testigo expresó preocupación por su seguridad?'
        }
      ]
    },
    {
      id: 'consent',
      title: 'Consentimiento',
      fields: [
        {
          id: 'consentGiven',
          type: 'checkbox',
          label: 'El testigo da su consentimiento para el uso de esta información',
          required: true
        },
        {
          id: 'consentDate',
          type: 'date',
          label: 'Fecha del consentimiento',
          required: true
        },
        {
          id: 'witnessSignature',
          type: 'signature',
          label: 'Firma del testigo'
        }
      ]
    }
  ],
  footer: 'Esta declaración es un testimonio voluntario proporcionado por el testigo. La información debe ser tratada con confidencialidad.',
  legalNotice: 'AVISO: Este documento es un testimonio que puede ser utilizado en procedimientos legales. La falsedad en declaraciones puede constituir un delito.'
}

// Export all templates
export const FORM_TEMPLATES = {
  incident_report: INCIDENT_REPORT_TEMPLATE,
  witness_statement: WITNESS_STATEMENT_TEMPLATE
}

export default FORM_TEMPLATES
