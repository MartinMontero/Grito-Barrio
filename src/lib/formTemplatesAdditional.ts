/**
 * Additional Form Templates
 * Protocolo CDMX
 * 
 * Chain of Custody, P.A.S. Evaluation, Legal Triage, and Checklist templates
 */

import type { FormTemplate } from '@/types/forms'

// =============================================================================
// FORM 3: CHAIN OF CUSTODY
// =============================================================================

export const CHAIN_OF_CUSTODY_TEMPLATE: FormTemplate = {
  id: 'chain-of-custody-v1',
  type: 'chain_of_custody',
  title: 'Cadena de Custodia',
  description: 'Registro de custodia de evidencia recolectada',
  version: '1.0',
  lastUpdated: '2025-01-15',
  sections: [
    {
      id: 'evidence-info',
      title: 'Información de la Evidencia',
      fields: [
        {
          id: 'evidenceId',
          type: 'text',
          label: 'ID de evidencia',
          required: true
        },
        {
          id: 'evidenceType',
          type: 'select',
          label: 'Tipo de evidencia',
          required: true,
          options: [
            { value: 'photo', label: 'Fotografía' },
            { value: 'video', label: 'Video' },
            { value: 'audio', label: 'Audio' },
            { value: 'document', label: 'Documento' },
            { value: 'physical', label: 'Evidencia Física' }
          ]
        },
        {
          id: 'evidenceDescription',
          type: 'textarea',
          label: 'Descripción detallada',
          required: true
        }
      ]
    },
    {
      id: 'collection',
      title: 'Recolección',
      fields: [
        {
          id: 'collectedBy',
          type: 'text',
          label: 'Recolectado por',
          required: true
        },
        {
          id: 'collectedAt',
          type: 'datetime',
          label: 'Fecha y hora de recolección',
          required: true
        },
        {
          id: 'collectionLocation',
          type: 'text',
          label: 'Lugar de recolección',
          required: true
        },
        {
          id: 'collectionMethod',
          type: 'textarea',
          label: 'Método de recolección',
          required: true
        },
        {
          id: 'collectionWitnesses',
          type: 'list',
          label: 'Testigos de la recolección'
        }
      ]
    },
    {
      id: 'storage',
      title: 'Almacenamiento',
      fields: [
        {
          id: 'storageDevice',
          type: 'text',
          label: 'Dispositivo de almacenamiento',
          placeholder: 'Ej: USB encriptado, disco duro externo...',
          required: true
        },
        {
          id: 'storageSecurity',
          type: 'text',
          label: 'Medidas de seguridad',
          placeholder: 'Encriptación, contraseña, ubicación física...',
          required: true
        },
        {
          id: 'storageLocation',
          type: 'text',
          label: 'Ubicación física',
          required: true
        }
      ]
    },
    {
      id: 'access-log',
      title: 'Registro de Acceso',
      fields: [
        {
          id: 'accessLog',
          type: 'textarea',
          label: 'Historial de acceso',
          placeholder: 'Fecha | Hora | Persona | Acción | Razón | Ubicación | Método',
          helpText: 'Documentar cada acceso: quién, cuándo, por qué, desde dónde',
          required: true
        }
      ]
    },
    {
      id: 'transfers',
      title: 'Transferencias',
      fields: [
        {
          id: 'transfersLog',
          type: 'textarea',
          label: 'Registro de transferencias',
          placeholder: 'Fecha | De | Para | Método | Verificación',
          helpText: 'Documentar cada transferencia de custodia'
        }
      ]
    },
    {
      id: 'verification',
      title: 'Verificación',
      fields: [
        {
          id: 'integrityVerified',
          type: 'checkbox',
          label: 'Integridad verificada',
          required: true
        },
        {
          id: 'verificationMethod',
          type: 'text',
          label: 'Método de verificación',
          placeholder: 'Hash SHA-256, checksum, etc.'
        },
        {
          id: 'verificationDate',
          type: 'datetime',
          label: 'Fecha de verificación'
        },
        {
          id: 'hashValue',
          type: 'text',
          label: 'Hash de integridad',
          helpText: 'Hash criptográfico para verificación'
        }
      ]
    },
    {
      id: 'current-status',
      title: 'Estado Actual',
      fields: [
        {
          id: 'currentLocation',
          type: 'text',
          label: 'Ubicación actual',
          required: true
        },
        {
          id: 'currentCustodian',
          type: 'text',
          label: 'Custodio actual',
          required: true
        },
        {
          id: 'currentStatus',
          type: 'select',
          label: 'Estado',
          required: true,
          options: [
            { value: 'active', label: 'Activa' },
            { value: 'archived', label: 'Archivada' },
            { value: 'transferred', label: 'Transferida' },
            { value: 'destroyed', label: 'Destruida' }
          ]
        }
      ]
    }
  ],
  footer: 'Esta cadena de custodia garantiza la integridad y autenticidad de la evidencia documentada.',
  legalNotice: 'DOCUMENTO LEGAL: Esta cadena de custodia es un registro legal que documenta la integridad de la evidencia. Cualquier ruptura en la cadena puede afectar la validez legal de la evidencia.'
}

// =============================================================================
// FORM 4: P.A.S. EVALUATION
// =============================================================================

export const PAS_EVALUATION_TEMPLATE: FormTemplate = {
  id: 'pas-evaluation-v1',
  type: 'pas_evaluation',
  title: 'Evaluación P.A.S.',
  description: 'Evaluación del protocolo Proteger-Avisar-Socorrer',
  version: '1.0',
  lastUpdated: '2025-01-15',
  sections: [
    {
      id: 'general',
      title: 'Información General',
      fields: [
        {
          id: 'incidentId',
          type: 'text',
          label: 'ID del incidente',
          required: true
        },
        {
          id: 'evaluator',
          type: 'text',
          label: 'Evaluador',
          required: true
        },
        {
          id: 'evaluationDate',
          type: 'date',
          label: 'Fecha de evaluación',
          required: true
        }
      ]
    },
    {
      id: 'proteger',
      title: 'PROTEGER (Protect)',
      description: 'Medidas de protección implementadas',
      fields: [
        {
          id: 'sceneSecured',
          type: 'checkbox',
          label: '¿Escena asegurada?',
          required: true
        },
        {
          id: 'dangersIdentified',
          type: 'list',
          label: 'Peligros identificados',
          helpText: 'Lista de peligros identificados en la escena'
        },
        {
          id: 'peopleEvacuated',
          type: 'checkbox',
          label: '¿Personas evacuadas a zona segura?'
        },
        {
          id: 'firstAidProvided',
          type: 'checkbox',
          label: '¿Primeros auxilios proporcionados?'
        },
        {
          id: 'emergencyServicesContacted',
          type: 'checkbox',
          label: '¿Servicios de emergencia contactados?'
        },
        {
          id: 'protegerNotes',
          type: 'textarea',
          label: 'Notas de PROTEGER',
          helpText: 'Observaciones adicionales sobre la fase de protección'
        }
      ]
    },
    {
      id: 'avisar',
      title: 'AVISAR (Alert)',
      description: 'Notificaciones realizadas',
      fields: [
        {
          id: 'teamNotified',
          type: 'checkbox',
          label: '¿Equipo notificado?',
          required: true
        },
        {
          id: 'coalitionAlerted',
          type: 'checkbox',
          label: '¿Coalición alertada?'
        },
        {
          id: 'authoritiesDocumented',
          type: 'checkbox',
          label: '¿Autoridades documentadas?'
        },
        {
          id: 'witnessesIdentified',
          type: 'checkbox',
          label: '¿Testigos identificados?'
        },
        {
          id: 'evidenceSecured',
          type: 'checkbox',
          label: '¿Evidencia asegurada?'
        },
        {
          id: 'avisarNotes',
          type: 'textarea',
          label: 'Notas de AVISAR'
        }
      ]
    },
    {
      id: 'socorrer',
      title: 'SOCORRER (Assist)',
      description: 'Asistencia proporcionada',
      fields: [
        {
          id: 'injuriesAssessed',
          type: 'checkbox',
          label: '¿Lesiones evaluadas?',
          required: true
        },
        {
          id: 'medicalHelpRequested',
          type: 'checkbox',
          label: '¿Ayuda médica solicitada?'
        },
        {
          id: 'psychologicalSupport',
          type: 'checkbox',
          label: '¿Apoyo psicológico proporcionado?'
        },
        {
          id: 'basicNeedsMet',
          type: 'checkbox',
          label: '¿Necesidades básicas cubiertas?'
        },
        {
          id: 'legalSupportContacted',
          type: 'checkbox',
          label: '¿Apoyo legal contactado?'
        },
        {
          id: 'socorrerNotes',
          type: 'textarea',
          label: 'Notas de SOCORRER'
        }
      ]
    },
    {
      id: 'results',
      title: 'Resultados',
      fields: [
        {
          id: 'peopleSafe',
          type: 'checkbox',
          label: '¿Personas a salvo?',
          required: true
        },
        {
          id: 'injuriesTreated',
          type: 'checkbox',
          label: '¿Lesiones tratadas?'
        },
        {
          id: 'documentationComplete',
          type: 'checkbox',
          label: '¿Documentación completa?'
        },
        {
          id: 'chainOfCustody',
          type: 'checkbox',
          label: '¿Cadena de custodia establecida?'
        },
        {
          id: 'nextStepsDefined',
          type: 'checkbox',
          label: '¿Siguientes pasos definidos?'
        },
        {
          id: 'overallOutcome',
          type: 'textarea',
          label: 'Resultado general',
          required: true
        }
      ]
    },
    {
      id: 'follow-up',
      title: 'Seguimiento',
      fields: [
        {
          id: 'followUpRequired',
          type: 'checkbox',
          label: '¿Requiere seguimiento?'
        },
        {
          id: 'followUpActions',
          type: 'list',
          label: 'Acciones de seguimiento'
        }
      ]
    }
  ],
  footer: 'La evaluación P.A.S. garantiza que se siguieron todos los protocolos de respuesta a emergencias.',
  legalNotice: 'PROTOCOLO ESTÁNDAR: Esta evaluación sigue el protocolo internacional P.A.S. (Proteger-Avisar-Socorrer) para respuesta a emergencias.'
}

// =============================================================================
// FORM 5: LEGAL TRIAGE
// =============================================================================

export const LEGAL_TRIAGE_TEMPLATE: FormTemplate = {
  id: 'legal-triage-v1',
  type: 'legal_triage',
  title: 'Triage Legal',
  description: 'Evaluación legal inicial y rutas recomendadas',
  version: '1.0',
  lastUpdated: '2025-01-15',
  sections: [
    {
      id: 'general',
      title: 'Información General',
      fields: [
        {
          id: 'incidentId',
          type: 'text',
          label: 'ID del incidente',
          required: true
        },
        {
          id: 'assessedBy',
          type: 'text',
          label: 'Evaluado por',
          required: true
        },
        {
          id: 'assessmentDate',
          type: 'datetime',
          label: 'Fecha y hora de evaluación',
          required: true
        }
      ]
    },
    {
      id: 'judicial-order',
      title: 'Orden Judicial',
      fields: [
        {
          id: 'judicialOrderPresent',
          type: 'checkbox',
          label: '¿Orden judicial presente?',
          required: true
        },
        {
          id: 'orderType',
          type: 'select',
          label: 'Tipo de orden',
          options: [
            { value: 'desahucio', label: 'Desahucio' },
            { value: 'restitucion', label: 'Restitución' },
            { value: 'amparo', label: 'Amparo' },
            { value: 'suspension', label: 'Suspensión' },
            { value: 'other', label: 'Otro' }
          ]
        },
        {
          id: 'orderNumber',
          type: 'text',
          label: 'Número de orden/expediente'
        },
        {
          id: 'issuingAuthority',
          type: 'text',
          label: 'Autoridad que la emitió'
        },
        {
          id: 'orderDate',
          type: 'date',
          label: 'Fecha de la orden'
        },
        {
          id: 'orderValid',
          type: 'radio',
          label: '¿La orden es válida?',
          options: [
            { value: 'valid', label: 'Válida' },
            { value: 'invalid', label: 'Inválida' },
            { value: 'suspicious', label: 'Sospechosa' },
            { value: 'unverifiable', label: 'No verificable' }
          ]
        },
        {
          id: 'orderNotes',
          type: 'textarea',
          label: 'Notas sobre la orden'
        }
      ]
    },
    {
      id: 'verification',
      title: 'Verificación',
      fields: [
        {
          id: 'verificationPerformed',
          type: 'checkbox',
          label: '¿Verificación realizada?',
          required: true
        },
        {
          id: 'verifiedBy',
          type: 'text',
          label: 'Verificado por'
        },
        {
          id: 'verificationDate',
          type: 'datetime',
          label: 'Fecha de verificación'
        },
        {
          id: 'verificationMethod',
          type: 'text',
          label: 'Método de verificación',
          placeholder: 'Consulta CEJ, llamada a juzgado, etc.'
        }
      ]
    },
    {
      id: 'occupant-category',
      title: 'Categoría de Ocupante',
      fields: [
        {
          id: 'occupantCategory',
          type: 'select',
          label: 'Categoría del ocupante',
          required: true,
          options: [
            { value: 'formal_tenant', label: 'Inquilino Formal' },
            { value: 'informal', label: 'Ocupante Informal' },
            { value: 'indigenous_collective', label: 'Comunidad Indígena' },
            { value: 'subtenant', label: 'Subarrendatario' },
            { value: 'unknown', label: 'Desconocido' }
          ]
        }
      ]
    },
    {
      id: 'violence',
      title: 'Violencia Documentada',
      fields: [
        {
          id: 'violenceDocumented',
          type: 'checkbox',
          label: '¿Violencia documentada?',
          required: true
        },
        {
          id: 'violenceTypes',
          type: 'list',
          label: 'Tipos de violencia',
          helpText: 'Física, verbal, psicológica, daño a propiedad'
        },
        {
          id: 'violenceSeverity',
          type: 'select',
          label: 'Severidad',
          options: [
            { value: 'minor', label: 'Menor' },
            { value: 'moderate', label: 'Moderada' },
            { value: 'severe', label: 'Severa' }
          ]
        },
        {
          id: 'violenceDescription',
          type: 'textarea',
          label: 'Descripción de la violencia'
        },
        {
          id: 'violenceWitnesses',
          type: 'list',
          label: 'Testigos'
        },
        {
          id: 'violenceEvidence',
          type: 'list',
          label: 'Evidencia'
        }
      ]
    },
    {
      id: 'legal-routes',
      title: 'Rutas Legales Recomendadas',
      fields: [
        {
          id: 'recommendedRoutes',
          type: 'list',
          label: 'Rutas recomendadas',
          helpText: 'Negociar, impugnación legal, amparo, denuncia DDHH, etc.',
          required: true
        },
        {
          id: 'priority',
          type: 'select',
          label: 'Prioridad',
          required: true,
          options: [
            { value: 'routine', label: 'Rutina' },
            { value: 'urgent', label: 'Urgente' },
            { value: 'emergency', label: 'Emergencia' },
            { value: 'critical', label: 'Crítica' }
          ]
        }
      ]
    },
    {
      id: 'contacts',
      title: 'Contactos Realizados',
      fields: [
        {
          id: 'contactsMade',
          type: 'textarea',
          label: 'Contactos',
          placeholder: 'Organización | Persona | Hora | Método | Respuesta | Prioridad'
        }
      ]
    },
    {
      id: 'immediate-actions',
      title: 'Acciones Inmediatas',
      fields: [
        {
          id: 'immediateActions',
          type: 'list',
          label: 'Acciones a tomar inmediatamente',
          required: true
        },
        {
          id: 'identifiedRisks',
          type: 'list',
          label: 'Riesgos identificados'
        },
        {
          id: 'minorsInvolved',
          type: 'checkbox',
          label: '¿Hay menores involucrados?'
        },
        {
          id: 'vulnerablePersons',
          type: 'checkbox',
          label: '¿Hay personas vulnerables?'
        }
      ]
    },
    {
      id: 'follow-up',
      title: 'Seguimiento',
      fields: [
        {
          id: 'estimatedResponseTime',
          type: 'text',
          label: 'Tiempo estimado de respuesta'
        },
        {
          id: 'assignedLegalRep',
          type: 'text',
          label: 'Representante legal asignado'
        },
        {
          id: 'followUpRequired',
          type: 'checkbox',
          label: '¿Requiere seguimiento?'
        }
      ]
    }
  ],
  footer: 'Este triage legal proporciona una evaluación inicial para determinar la mejor ruta legal.',
  legalNotice: 'NOTA: Este triage es una evaluación preliminar y no constituye asesoría legal completa. Se recomienda consultar con un abogado especializado.'
}

// =============================================================================
// CHECKLIST: 60-MINUTE RESPONSE
// =============================================================================

export const CHECKLIST_60MIN_TEMPLATE: FormTemplate = {
  id: 'checklist-60min-v1',
  type: 'checklist_60min',
  title: 'Checklist 0-60 Minutos',
  description: 'Lista de verificación de respuesta en la primera hora',
  version: '1.0',
  lastUpdated: '2025-01-15',
  sections: [
    {
      id: 'phase-0-5',
      title: '0-5 Minutos: Respuesta Inmediata',
      description: 'Acciones críticas en los primeros 5 minutos',
      fields: [
        {
          id: 'sceneSecured',
          type: 'checkbox',
          label: '✓ Escena asegurada',
          required: true
        },
        {
          id: 'safetyAssessment',
          type: 'checkbox',
          label: '✓ Evaluación de seguridad realizada',
          required: true
        },
        {
          id: 'emergencyCall',
          type: 'checkbox',
          label: '✓ Llamada de emergencia realizada',
          required: true
        },
        {
          id: 'initialTriage',
          type: 'checkbox',
          label: '✓ Triage inicial de personas',
          required: true
        },
        {
          id: 'teamArrival',
          type: 'checkbox',
          label: '✓ Equipo de respuesta en camino/llegado',
          required: true
        },
        {
          id: 'notes_0_5',
          type: 'textarea',
          label: 'Notas (0-5 min)'
        }
      ]
    },
    {
      id: 'phase-5-20',
      title: '5-20 Minutos: Estabilización Inicial',
      description: 'Documentación y contactos iniciales',
      fields: [
        {
          id: 'peoplePresentDocumented',
          type: 'checkbox',
          label: '✓ Personas presentes documentadas'
        },
        {
          id: 'initialPhotos',
          type: 'checkbox',
          label: '✓ Fotografías iniciales tomadas'
        },
        {
          id: 'witnessContactInfo',
          type: 'checkbox',
          label: '✓ Información de contacto de testigos'
        },
        {
          id: 'authorityIdentification',
          type: 'checkbox',
          label: '✓ Identificación de autoridades'
        },
        {
          id: 'legalObserverContacted',
          type: 'checkbox',
          label: '✓ Observador legal contactado'
        },
        {
          id: 'notes_5_20',
          type: 'textarea',
          label: 'Notas (5-20 min)'
        }
      ]
    },
    {
      id: 'phase-20-45',
      title: '20-45 Minutos: Documentación Legal',
      description: 'Recolección de evidencia y documentación',
      fields: [
        {
          id: 'detailedDocumentation',
          type: 'checkbox',
          label: '✓ Documentación detallada iniciada'
        },
        {
          id: 'videoStatements',
          type: 'checkbox',
          label: '✓ Declaraciones en video'
        },
        {
          id: 'evidenceCollected',
          type: 'checkbox',
          label: '✓ Evidencia recolectada'
        },
        {
          id: 'chainOfCustodyStarted',
          type: 'checkbox',
          label: '✓ Cadena de custodia iniciada'
        },
        {
          id: 'medicalAssessment',
          type: 'checkbox',
          label: '✓ Evaluación médica completada'
        },
        {
          id: 'notes_20_45',
          type: 'textarea',
          label: 'Notas (20-45 min)'
        }
      ]
    },
    {
      id: 'phase-45-60',
      title: '45-60 Minutos: Consolidación',
      description: 'Evaluación y planificación de siguiente fase',
      fields: [
        {
          id: 'teamDebrief',
          type: 'checkbox',
          label: '✓ Debriefing del equipo'
        },
        {
          id: 'nextStepsDefined',
          type: 'checkbox',
          label: '✓ Siguientes pasos definidos'
        },
        {
          id: 'contactsUpdated',
          type: 'checkbox',
          label: '✓ Contactos actualizados'
        },
        {
          id: 'incidentReportStarted',
          type: 'checkbox',
          label: '✓ Reporte de incidente iniciado'
        },
        {
          id: 'resourcesAllocated',
          type: 'checkbox',
          label: '✓ Recursos asignados'
        },
        {
          id: 'notes_45_60',
          type: 'textarea',
          label: 'Notas (45-60 min)'
        }
      ]
    },
    {
      id: 'summary',
      title: 'Resumen',
      fields: [
        {
          id: 'overallStatus',
          type: 'select',
          label: 'Estado general',
          options: [
            { value: 'on_track', label: 'En curso normal' },
            { value: 'delayed', label: 'Retrasado' },
            { value: 'critical', label: 'Crítico' },
            { value: 'resolved', label: 'Resuelto' }
          ]
        },
        {
          id: 'criticalIssues',
          type: 'list',
          label: 'Problemas críticos'
        },
        {
          id: 'completedActions',
          type: 'number',
          label: 'Acciones completadas'
        },
        {
          id: 'totalActions',
          type: 'number',
          label: 'Total de acciones'
        }
      ]
    }
  ],
  footer: 'Este checklist garantiza que todas las acciones críticas se realicen dentro de la primera hora de respuesta.',
  legalNotice: 'PROTOCOLO DE TIEMPO CRÍTICO: La primera hora es crucial para la documentación legal efectiva y la seguridad de los ocupantes.'
}

// Export all additional templates
export const ADDITIONAL_FORM_TEMPLATES = {
  chain_of_custody: CHAIN_OF_CUSTODY_TEMPLATE,
  pas_evaluation: PAS_EVALUATION_TEMPLATE,
  legal_triage: LEGAL_TRIAGE_TEMPLATE,
  checklist_60min: CHECKLIST_60MIN_TEMPLATE
}

export default ADDITIONAL_FORM_TEMPLATES
