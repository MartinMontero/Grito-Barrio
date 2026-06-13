/**
 * Form Types
 * Protocolo CDMX
 *
 * TypeScript definitions for printable forms and PDF export
 */

export type FormType =
  | "incident_report"
  | "witness_statement"
  | "chain_of_custody"
  | "pas_evaluation"
  | "legal_triage"
  | "checklist_60min"
  | "supply_checklist"
  | "emergency_contacts";

export type FormStatus = "draft" | "completed" | "signed" | "archived";

export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "datetime"
  | "number"
  | "select"
  | "checkbox"
  | "radio"
  | "signature"
  | "list";

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
  options?: { value: string; label: string }[];
  defaultValue?: any;
  helpText?: string;
  section?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  conditional?: {
    fieldId: string;
    value: any;
  };
}

export interface FormTemplate {
  id: string;
  type: FormType;
  title: string;
  description: string;
  version: string;
  lastUpdated: string;
  sections: FormSection[];
  footer?: string;
  legalNotice?: string;
}

export interface FormData {
  id: string;
  templateId: string;
  incidentId?: string;
  status: FormStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  signedBy?: string;
  signedAt?: string;
  values: Record<string, any>;
  attachments?: string[];
  hash?: string;
}

// =============================================================================
// INCIDENT REPORT FORM
// =============================================================================

export interface IncidentReportData {
  // Alert Information
  alertDate: string;
  alertTime: string;
  alertSource: string;

  // Arrival Information
  arrivalDate: string;
  arrivalTime: string;

  // Location
  location: {
    street: string;
    number: string;
    interior?: string;
    colonia: string;
    alcaldia: string;
    postalCode?: string;
    coordinates?: { lat: number; lng: number };
    reference?: string;
  };

  // People Present
  peoplePresent: {
    pseudonym: string;
    role: string;
    arrivalTime?: string;
    departureTime?: string;
    notes?: string;
  }[];

  // Event Sequence
  events: {
    timestamp: string;
    description: string;
    witnesses: string[];
    evidenceIds?: string[];
  }[];

  // Decisions Made
  decisions: {
    timestamp: string;
    decision: string;
    madeBy: string;
    informationBasis: string;
    outcome?: string;
  }[];

  // Evidence Collected
  evidenceCollected: {
    type: "photo" | "video" | "audio" | "document" | "physical";
    description: string;
    collectedBy: string;
    collectedAt: string;
    custodian: string;
    hash?: string;
    storageLocation?: string;
  }[];

  // Injuries
  injuries: {
    pseudonym: string;
    nature: string;
    severity: "minor" | "moderate" | "severe";
    firstAidProvided: boolean;
    firstAidDescription?: string;
    referredTo?: string;
    referralTime?: string;
  }[];

  // Authorities Present
  authorities: {
    type: "police" | "court_officer" | "private_security" | "other";
    identification?: string;
    badgeNumber?: string;
    statements: string;
    arrivedAt?: string;
    departedAt?: string;
  }[];

  // Witnesses
  witnesses: {
    pseudonym: string;
    contact: string;
    observation: string;
    distance?: string;
    angle?: string;
    availability: boolean;
    notes?: string;
  }[];

  // Next Steps
  nextSteps: {
    action: string;
    responsible: string;
    deadline: string;
    priority: "low" | "medium" | "high";
    completed?: boolean;
  }[];

  // Additional Notes
  additionalNotes?: string;

  // Signatures
  preparedBy: string;
  reviewedBy?: string;
  preparedAt: string;
}

// =============================================================================
// WITNESS STATEMENT FORM
// =============================================================================

export interface WitnessStatementData {
  // Interview Information
  interviewDate: string;
  interviewTime: string;
  interviewLocation: string;
  interviewer: string;

  // Witness Information
  witnessPseudonym: string;
  secureContact: string;
  relationshipToEvent: string;

  // Observation Details
  observation: {
    location: string;
    timestamp: string;
    duration?: string;
    weather?: string;
    lighting?: string;
    obstacles?: string;
  };

  // People Present
  peoplePresent: string[];

  // Statements Heard
  statements: {
    speaker?: string;
    statement: string;
    timestamp?: string;
    context?: string;
  }[];

  // Availability
  availableForFormalStatement: boolean;
  preferredContactMethod: string;
  availabilityNotes?: string;

  // Support Needs
  supportNeeds: string[];
  emotionalState: string;
  safetyConcerns?: string;

  // Statement Text
  fullStatement: string;

  // Consent
  consentGiven: boolean;
  consentDate: string;

  // Signature
  witnessSignature?: string;
  interviewerSignature?: string;
}

// =============================================================================
// CHAIN OF CUSTODY FORM
// =============================================================================

export interface ChainOfCustodyData {
  evidenceId: string;
  evidenceType: string;
  description: string;

  // Collection
  collectedBy: string;
  collectedAt: string;
  collectionLocation: string;
  collectionMethod: string;
  witnesses: string[];

  // Initial Storage
  initialStorage: {
    device: string;
    security: string;
    location: string;
    accessedBy: string;
  };

  // Custody Log
  custodyLog: {
    timestamp: string;
    action:
      | "created"
      | "accessed"
      | "copied"
      | "transferred"
      | "verified"
      | "archived";
    actor: string;
    location: string;
    method: string;
    reason?: string;
    recipient?: string;
    signature?: string;
  }[];

  // Current Status
  currentLocation: string;
  currentCustodian: string;
  currentStatus: "active" | "archived" | "transferred" | "destroyed";

  // Verification
  integrityVerified: boolean;
  verificationMethod: string;
  verificationDate: string;

  // Hash
  hash: string;
  hashAlgorithm: string;
}

// =============================================================================
// P.A.S. EVALUATION FORM
// =============================================================================

export interface PASEvaluationData {
  incidentId: string;
  evaluator: string;
  evaluationDate: string;

  // PROTEGER (Protect)
  proteger: {
    sceneSecured: boolean;
    dangersIdentified: string[];
    peopleEvacuated: boolean;
    firstAidProvided: boolean;
    emergencyServicesContacted: boolean;
    notes: string;
  };

  // AVISAR (Alert)
  avisar: {
    teamNotified: boolean;
    coalitionAlerted: boolean;
    authoritiesDocumented: boolean;
    witnessesIdentified: boolean;
    evidenceSecured: boolean;
    notes: string;
  };

  // SOCORRER (Assist)
  socorrer: {
    injuriesAssessed: boolean;
    medicalHelpRequested: boolean;
    psychologicalSupport: boolean;
    basicNeedsMet: boolean;
    legalSupportContacted: boolean;
    notes: string;
  };

  // Results
  resultados: {
    peopleSafe: boolean;
    injuriesTreated: boolean;
    documentationComplete: boolean;
    chainOfCustody: boolean;
    nextStepsDefined: boolean;
    overallOutcome: string;
  };

  // Follow-up
  followUpRequired: boolean;
  followUpActions: string[];
}

// =============================================================================
// LEGAL TRIAGE FORM
// =============================================================================

export interface LegalTriageData {
  incidentId: string;
  assessedBy: string;
  assessmentDate: string;

  // Judicial Order
  judicialOrder: {
    present: boolean;
    type?: string;
    documentNumber?: string;
    issuingAuthority?: string;
    date?: string;
    valid?: boolean;
    notes?: string;
  };

  // Verification
  verification: {
    performed: boolean;
    verifiedBy?: string;
    verificationDate?: string;
    method?: string;
    result?: "valid" | "invalid" | "suspicious" | "unverifiable";
    notes?: string;
  };

  // Occupant Category
  occupantCategory:
    | "formal_tenant"
    | "informal"
    | "indigenous_collective"
    | "subtenant"
    | "unknown";

  // Violence Documentation
  violence: {
    documented: boolean;
    types: ("physical" | "verbal" | "psychological" | "property_damage")[];
    severity: "minor" | "moderate" | "severe";
    description: string;
    witnesses: string[];
    evidence: string[];
  };

  // Legal Routes
  recommendedRoutes: (
    | "negotiate"
    | "legal_challenge"
    | "injunction"
    | "human_rights_complaint"
    | "amparo"
    | "mediation"
    | "document_only"
    | "immediate_evacuation"
  )[];

  // Contacts
  contactsMade: {
    organization: string;
    contactPerson: string;
    timestamp: string;
    method: string;
    response: string;
    priority: number;
  }[];

  // Priority
  priority: "routine" | "urgent" | "emergency" | "critical";

  // Immediate Actions
  immediateActions: string[];

  // Assessment
  identifiedRisks: string[];
  minorsInvolved: boolean;
  vulnerablePersons: boolean;

  // Follow-up
  estimatedResponseTime?: string;
  assignedLegalRep?: string;
  followUpRequired: boolean;
}

// =============================================================================
// 60-MINUTE CHECKLIST
// =============================================================================

export interface Checklist60MinData {
  incidentId: string;
  startedAt: string;
  completedAt?: string;
  completedBy: string;

  // 0-5 Minutes
  phase_0_5: {
    sceneSecured: boolean;
    safetyAssessment: boolean;
    emergencyCall: boolean;
    initialTriage: boolean;
    teamArrival: boolean;
    notes?: string;
  };

  // 5-20 Minutes
  phase_5_20: {
    peoplePresentDocumented: boolean;
    initialPhotos: boolean;
    witnessContactInfo: boolean;
    authorityIdentification: boolean;
    legalObserverContacted: boolean;
    notes?: string;
  };

  // 20-45 Minutes
  phase_20_45: {
    detailedDocumentation: boolean;
    videoStatements: boolean;
    evidenceCollected: boolean;
    chainOfCustodyStarted: boolean;
    medicalAssessment: boolean;
    notes?: string;
  };

  // 45-60 Minutes
  phase_45_60: {
    teamDebrief: boolean;
    nextStepsDefined: boolean;
    contactsUpdated: boolean;
    incidentReportStarted: boolean;
    resourcesAllocated: boolean;
    notes?: string;
  };

  // Overall Status
  overallStatus: "on_track" | "delayed" | "critical" | "resolved";
  criticalIssues: string[];
  completedActions: number;
  totalActions: number;
}

// =============================================================================
// FORM CONSTANTS
// =============================================================================

export const FORM_TEMPLATES: Record<
  FormType,
  { title: string; description: string }
> = {
  incident_report: {
    title: "Reporte de Incidente",
    description: "Documentación completa de un incidente de desalojo o amenaza",
  },
  witness_statement: {
    title: "Declaración de Testigo",
    description: "Registro de testimonio de persona que observó el incidente",
  },
  chain_of_custody: {
    title: "Cadena de Custodia",
    description: "Registro de custodia de evidencia recolectada",
  },
  pas_evaluation: {
    title: "Evaluación P.A.S.",
    description: "Evaluación del protocolo Proteger-Avisar-Socorrer",
  },
  legal_triage: {
    title: "Triage Legal",
    description: "Evaluación legal inicial y rutas recomendadas",
  },
  checklist_60min: {
    title: "Checklist 0-60 Minutos",
    description: "Lista de verificación de respuesta en la primera hora",
  },
  supply_checklist: {
    title: "Checklist de Suministros",
    description: "Inventario de suministros disponibles",
  },
  emergency_contacts: {
    title: "Contactos de Emergencia",
    description: "Lista de contactos de emergencia",
  },
};

export const ALCALDIAS = [
  "Álvaro Obregón",
  "Azcapotzalco",
  "Benito Juárez",
  "Coyoacán",
  "Cuajimalpa",
  "Cuauhtémoc",
  "Gustavo A. Madero",
  "Iztacalco",
  "Iztapalapa",
  "Magdalena Contreras",
  "Miguel Hidalgo",
  "Milpa Alta",
  "Tláhuac",
  "Tlalpan",
  "Venustiano Carranza",
  "Xochimilco",
];

export const TEAM_ROLES = [
  { value: "leader", label: "Coordinador" },
  { value: "security", label: "Seguridad" },
  { value: "medical", label: "Médico" },
  { value: "legal", label: "Legal" },
  { value: "dispatch", label: "Dispatch" },
  { value: "logistics", label: "Logística" },
  { value: "observer", label: "Observador" },
];

export const EVIDENCE_TYPES = [
  { value: "photo", label: "Fotografía" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
  { value: "document", label: "Documento" },
  { value: "physical", label: "Evidencia Física" },
];

export const AUTHORITY_TYPES = [
  { value: "police", label: "Policía" },
  { value: "court_officer", label: "Oficial Judicial" },
  { value: "private_security", label: "Seguridad Privada" },
  { value: "other", label: "Otro" },
];

export const VIOLENCE_TYPES = [
  { value: "physical", label: "Física" },
  { value: "verbal", label: "Verbal" },
  { value: "psychological", label: "Psicológica" },
  { value: "property_damage", label: "Daño a Propiedad" },
];

export const LEGAL_ROUTES = [
  { value: "negotiate", label: "Negociar" },
  { value: "legal_challenge", label: "Impugnación Legal" },
  { value: "injunction", label: "Juicio de Amparo" },
  { value: "human_rights_complaint", label: "Denuncia DDHH" },
  { value: "amparo", label: "Amparo" },
  { value: "mediation", label: "Mediación" },
  { value: "document_only", label: "Solo Documentar" },
  { value: "immediate_evacuation", label: "Evacuación Inmediata" },
];

export const PRIORITY_LEVELS = [
  { value: "routine", label: "Rutina" },
  { value: "urgent", label: "Urgente" },
  { value: "emergency", label: "Emergencia" },
  { value: "critical", label: "Crítica" },
];

export const OCCUPANT_CATEGORIES = [
  { value: "formal_tenant", label: "Inquilino Formal" },
  { value: "informal", label: "Ocupante Informal" },
  { value: "indigenous_collective", label: "Comunidad Indígena" },
  { value: "subtenant", label: "Subarrendatario" },
  { value: "unknown", label: "Desconocido" },
];
