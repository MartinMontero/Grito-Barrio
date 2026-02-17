/**
 * TypeScript Type Definitions
 * Protocolo CDMX
 */

// User Profile Types
export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: Address;
  emergencyContacts: EmergencyContact[];
  legalRepresentative?: LegalRepresentative;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  number: string;
  interior?: string;
  neighborhood: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface LegalRepresentative {
  name: string;
  organization: string;
  phone: string;
  email?: string;
}

// Eviction Case Types
export interface EvictionCase {
  id: string;
  userId: string;
  status: EvictionStatus;
  incidentDate: Date;
  location: Address;
  description: string;
  evidence: Evidence[];
  legalDocuments: LegalDocument[];
  timeline: TimelineEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export type EvictionStatus = 
  | 'prevention'
  | 'active'
  | 'legal_process'
  | 'resolved'
  | 'appeal';

export interface Evidence {
  id: string;
  type: EvidenceType;
  url: string;
  description: string;
  capturedAt: Date;
  isEncrypted: boolean;
}

export type EvidenceType = 
  | 'photo'
  | 'video'
  | 'audio'
  | 'document'
  | 'screenshot';

export interface LegalDocument {
  id: string;
  type: DocumentType;
  title: string;
  url: string;
  uploadedAt: Date;
  isEncrypted: boolean;
}

export type DocumentType = 
  | 'contract'
  | 'notice'
  | 'court_order'
  | 'identification'
  | 'proof_payment'
  | 'other';

export interface TimelineEvent {
  id: string;
  date: Date;
  type: TimelineEventType;
  title: string;
  description: string;
  evidenceIds?: string[];
}

export type TimelineEventType = 
  | 'notice_received'
  | 'contact_attempt'
  | 'legal_action'
  | 'court_date'
  | 'mediation'
  | 'resolution'
  | 'other';

// Protocol Types
export interface Protocol {
  id: string;
  category: ProtocolCategory;
  title: string;
  description: string;
  steps: ProtocolStep[];
  resources: Resource[];
  isEmergency: boolean;
}

export type ProtocolCategory = 
  | 'prevention'
  | 'immediate_response'
  | 'legal_process'
  | 'documentation'
  | 'support';

export interface ProtocolStep {
  id: string;
  order: number;
  title: string;
  description: string;
  actions: string[];
  warnings?: string[];
  estimatedTime?: string;
}

export interface Resource {
  id: string;
  type: ResourceType;
  name: string;
  description: string;
  contact?: ContactInfo;
  url?: string;
  address?: string;
  hours?: string;
}

export type ResourceType = 
  | 'organization'
  | 'legal_aid'
  | 'government'
  | 'emergency_service'
  | 'community';

export interface ContactInfo {
  phone?: string;
  email?: string;
  whatsapp?: string;
}

// Legal Resource Types
export interface LegalResource {
  id: string;
  category: LegalCategory;
  title: string;
  content: string;
  lawReference?: string;
  articleReference?: string;
  lastUpdated: Date;
}

export type LegalCategory = 
  | 'rights'
  | 'laws'
  | 'procedures'
  | 'defenses'
  | 'resources';

// App State Types
export interface AppState {
  isLoading: boolean;
  isOnline: boolean;
  lastSync: Date | null;
  theme: 'light' | 'dark' | 'system';
  language: 'es';
  notificationsEnabled: boolean;
  emergencyMode: boolean;
}

// Settings Types
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'es';
  notifications: boolean;
  biometricLock: boolean;
  autoBackup: boolean;
  encryptionEnabled: boolean;
  emergencyShortcut: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiMeta {
  timestamp: string;
  requestId: string;
  version: string;
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  isActive?: boolean;
  badge?: number;
}

// ============================================================================
// COMPREHENSIVE TYPES - PROTOCOLO CDMX INCIDENT RESPONSE SYSTEM
// ============================================================================

// =============================================================================
// 1. INCIDENT REPORT TYPES
// =============================================================================

/**
 * Union type representing all possible incident statuses in the system.
 * Tracks the lifecycle of an eviction incident from detection to resolution.
 */
export type IncidentStatus =
  | 'detected'           // Initial alert received, not yet verified
  | 'verifying'          // Team dispatched, assessing situation
  | 'confirmed'          // Eviction confirmed, response protocols activated
  | 'responding'         // Active response in progress
  | 'withdrawal'         // Controlled withdrawal protocol initiated
  | 'resolved'           // Incident concluded successfully
  | 'escalated'          // Requires additional resources/support
  | 'closed';            // Incident closed, documentation complete

/**
 * Union type representing all possible team member roles.
 * Each role has specific responsibilities during incident response.
 */
export type TeamRole =
  | 'leader'             // Incident commander, coordinates overall response
  | 'security'           // Handles physical security and de-escalation
  | 'medical'            // Provides first aid and medical assessment
  | 'legal'              // Legal observer and rights defender
  | 'dispatch'           // Coordinates communications and resources
  | 'logistics';         // Manages supplies, transport, and safe points

/**
 * Certification level for team members (1-3).
 * Level 1: Basic training
 * Level 2: Intermediate (can lead teams)
 * Level 3: Advanced (can coordinate multiple incidents)
 */
export type CertificationLevel = 1 | 2 | 3;

/**
 * Represents a member of the rapid response team assigned to an incident.
 * Uses pseudonyms for security and privacy protection.
 */
export interface TeamMember {
  /** Unique pseudonym for the team member (no real names for security) */
  pseudonym: string;
  
  /** Role assigned to this team member during the incident */
  role: TeamRole;
  
  /** Certification level indicating training and authorization level */
  certificationLevel: CertificationLevel;
  
  /** Current status of the team member */
  status: 'en_route' | 'on_scene' | 'active' | 'standby' | 'off_duty';
  
  /** Estimated time of arrival to incident location (ISO 8601 format) */
  eta?: string;
}

/**
 * Represents a geographic coordinate point.
 */
export interface Coordinates {
  /** Latitude in decimal degrees */
  latitude: number;
  
  /** Longitude in decimal degrees */
  longitude: number;
  
  /** Accuracy of the coordinates in meters */
  accuracy?: number;
}

/**
 * Represents a location within Mexico City with full address details.
 */
export interface IncidentLocation {
  /** Street address including number */
  address: string;
  
  /** Geographic coordinates */
  coordinates?: Coordinates;
  
  /** Colonia (neighborhood) in CDMX */
  colonia: string;
  
  /** Alcaldía (borough) in CDMX */
  alcaldia: CDMXAlcaldia;
  
  /** Postal code (5 digits) */
  postalCode: string;
  
  /** Additional location details (building, floor, etc.) */
  reference?: string;
}

/**
 * Union type for all 16 alcaldías of Mexico City.
 */
export type CDMXAlcaldia =
  | 'Álvaro Obregón'
  | 'Azcapotzalco'
  | 'Benito Juárez'
  | 'Coyoacán'
  | 'Cuajimalpa'
  | 'Cuauhtémoc'
  | 'Gustavo A. Madero'
  | 'Iztacalco'
  | 'Iztapalapa'
  | 'Magdalena Contreras'
  | 'Miguel Hidalgo'
  | 'Milpa Alta'
  | 'Tláhuac'
  | 'Tlalpan'
  | 'Venustiano Carranza'
  | 'Xochimilco';

/**
 * Threat level classification for incident prioritization.
 */
export type ThreatLevel = 'low' | 'moderate' | 'high' | 'critical' | 'extreme';

/**
 * Source of the initial incident alert.
 */
export type AlertSource =
  | 'hotline'            // Emergency hotline call
  | 'social_media'       // Reported via social media
  | 'community_network'  // Community organization report
  | 'direct_observation' // Team member witnessed incident
  | 'legal_aid'          // Legal aid organization report
  | 'government_notice'; // Official government notification

/**
 * Verification status of the incident report.
 */
export type VerificationStatus =
  | 'unverified'         // Initial report, not yet confirmed
  | 'pending'            // Verification in progress
  | 'verified'           // Confirmed by team member
  | 'false_alarm'        // Report determined to be incorrect
  | 'duplicate';         // Duplicate of existing incident

/**
 * Main incident report interface.
 * Represents an active or past eviction incident with full details.
 */
export interface Incident {
  /** Unique incident ID: CDMX-YYYY-MM-DD-HHMM-### format */
  id: string;
  
  /** ISO 8601 timestamp of when the incident was first reported */
  timestamp: string;
  
  /** Location details of the incident */
  location: IncidentLocation;
  
  /** Source that reported the incident */
  alertSource: AlertSource;
  
  /** Current verification status of the incident */
  verificationStatus: VerificationStatus;
  
  /** Pseudonym of the designated incident leader */
  incidentLeader: string;
  
  /** Array of team members assigned to this incident */
  team: TeamMember[];
  
  /** Current threat level assessment */
  threatLevel: ThreatLevel;
  
  /** Whether controlled withdrawal has been triggered */
  withdrawalTriggered: boolean;
  
  /** Current status of the incident */
  status: IncidentStatus;
  
  /** Brief description of the situation */
  description: string;
  
  /** Number of occupants at risk */
  occupantsAtRisk?: number;
  
  /** Whether minors are present */
  minorsPresent?: boolean;
  
  /** Whether elderly or disabled persons are present */
  vulnerablePersons?: boolean;
  
  /** Whether authorities are on scene */
  authoritiesPresent?: boolean;
  
  /** Types of authorities present if any */
  authorityTypes?: ('police' | 'court_officer' | 'private_security' | 'other')[];
}

// =============================================================================
// 2. DOCUMENTATION TYPES
// =============================================================================

/**
 * Type of documentation entry captured during an incident.
 */
export type DocumentationType =
  | 'photo'
  | 'video'
  | 'audio'
  | 'text'
  | 'witness_statement';

/**
 * Represents a single custody transfer event in the chain of custody.
 * Ensures documentation integrity for legal proceedings.
 */
export interface CustodyEntry {
  /** ISO 8601 timestamp of the custody action */
  timestamp: string;
  
  /** Type of action performed */
  action: 'created' | 'accessed' | 'copied' | 'transferred' | 'verified' | 'archived';
  
  /** Pseudonym of the person performing the action */
  actor: string;
  
  /** Location where the action took place */
  location: string;
  
  /** Method used (device, software, etc.) */
  method: string;
  
  /** Recipient if this was a transfer action */
  recipient?: string;
}

/**
 * Metadata associated with documentation entries.
 */
export interface DocumentationMetadata {
  /** Device used to capture (e.g., 'Samsung Galaxy S21', 'iPhone 13') */
  deviceInfo?: string;
  
  /** GPS coordinates where captured */
  gpsCoordinates?: Coordinates;
  
  /** Resolution for photos/videos */
  resolution?: string;
  
  /** Duration in seconds for audio/video */
  duration?: number;
  
  /** File size in bytes */
  fileSize?: number;
  
  /** MIME type of the file */
  mimeType?: string;
  
  /** Tags for categorization */
  tags?: string[];
}

/**
 * Documentation entry for evidence captured during an incident.
 * Includes cryptographic verification for legal validity.
 */
export interface DocumentationEntry {
  /** Unique identifier for the documentation entry */
  id: string;
  
  /** Reference to the parent incident */
  incidentId: string;
  
  /** ISO 8601 timestamp of capture */
  timestamp: string;
  
  /** Type of documentation */
  type: DocumentationType;
  
  /** Pseudonym of the person who captured this */
  capturedBy: string;
  
  /** Location where captured */
  location: IncidentLocation;
  
  /** SHA-256 hash of the file for integrity verification */
  hash: string;
  
  /** Complete chain of custody history */
  chainOfCustody: CustodyEntry[];
  
  /** Whether the file is encrypted at rest */
  encrypted: boolean;
  
  /** Additional metadata */
  metadata: DocumentationMetadata;
  
  /** Brief description of content */
  description?: string;
  
  /** Witness pseudonym if this is a witness statement */
  witnessPseudonym?: string;
}

// =============================================================================
// 3. LEGAL TYPES
// =============================================================================

/**
 * Category of occupant for legal assessment.
 */
export type OccupantCategory =
  | 'formal_tenant'          // Has formal lease agreement
  | 'informal'               // No formal agreement, customary occupancy
  | 'indigenous_collective'  // Part of indigenous community with collective rights
  | 'subtenant';             // Subleasing from primary tenant

/**
 * Legal priority level for case handling.
 */
export type LegalPriority = 'routine' | 'urgent' | 'emergency' | 'critical';

/**
 * Legal contact for incident support.
 */
export interface LegalContact {
  /** Organization or individual name */
  name: string;
  
  /** Role or title */
  role: string;
  
  /** Phone number */
  phone: string;
  
  /** Email address */
  email?: string;
  
  /** Availability hours */
  availability: string;
  
  /** Priority order (1 = highest) */
  priority: number;
  
  /** Specializations */
  specializations?: string[];
}

/**
 * Legal triage assessment for an incident.
 * Determines appropriate legal response based on circumstances.
 */
export interface LegalTriage {
  /** Reference to the incident being assessed */
  incidentId: string;
  
  /** Whether a judicial order was presented at the scene */
  judicialOrderPresent: boolean;
  
  /** Whether the order has been verified as authentic and valid */
  orderVerified: boolean;
  
  /** Category of the occupant(s) */
  occupantCategory: OccupantCategory;
  
  /** Whether violence or threats have been documented */
  violenceDocumented: boolean;
  
  /** Types of violence documented */
  violenceTypes?: ('physical' | 'verbal' | 'psychological' | 'property_damage')[];
  
  /** Recommended legal paths to pursue */
  recommendedPath: (
    | 'negotiate'
    | 'legal_challenge'
    | 'injunction'
    | 'human_rights_complaint'
    | 'amparo'
    | 'mediation'
    | 'document_only'
    | 'immediate_evacuation'
  )[];
  
  /** Priority level for legal response */
  priority: LegalPriority;
  
  /** Recommended legal contacts to engage */
  contacts: LegalContact[];
  
  /** Legal representative assigned */
  assignedLegalRep?: string;
  
  /** Estimated time to legal response */
  estimatedResponseTime?: string;
  
  /** Whether minors are involved (affects legal approach) */
  minorsInvolved: boolean;
  
  /** Specific legal risks identified */
  identifiedRisks?: string[];
  
  /** Recommended immediate actions */
  immediateActions: string[];
}

// =============================================================================
// 4. USER/ROLE TYPES
// =============================================================================

/**
 * Extended union type including all possible user roles in the system.
 */
export type UserRole =
  | 'admin'
  | 'coordinator'
  | TeamRole
  | 'observer'
  | 'legal_aid'
  | 'medical_volunteer'
  | 'community_liaison';

/**
 * Extended user profile with certification and training tracking.
 */
export interface ExtendedUserProfile {
  /** Unique pseudonym for security */
  pseudonym: string;
  
  /** User's role in the organization */
  role: UserRole;
  
  /** Current certification level */
  certificationLevel: CertificationLevel;
  
  /** Training modules completed */
  trainingCompleted: TrainingModule[];
  
  /** Contact information (encrypted) */
  contactInfo: {
    /** Signal/secure messaging identifier */
    secureContact: string;
    
    /** Emergency contact (pseudonym only) */
    emergencyContact?: string;
    
    /** Preferred communication method */
    preferredMethod: 'signal' | 'telegram' | 'phone' | 'email';
  };
  
  /** Current operational status */
  operationalStatus: 'active' | 'standby' | 'unavailable' | 'suspended';
  
  /** Last active timestamp */
  lastActive?: string;
  
  /** Special skills or qualifications */
  specializations?: string[];
  
  /** Languages spoken */
  languages: string[];
  
  /** Accessibility accommodations needed */
  accessibilityNeeds?: string[];
}

/**
 * Training module completion record.
 */
export interface TrainingModule {
  /** Module identifier */
  moduleId: string;
  
  /** Module name */
  moduleName: string;
  
  /** Completion date */
  completedAt: string;
  
  /** Expiration date if applicable */
  expiresAt?: string;
  
  /** Certification valid */
  valid: boolean;
}

// =============================================================================
// 5. RESOURCE TYPES
// =============================================================================

/**
 * Type of safe point for emergency refuge.
 */
export type SafePointType =
  | 'community_center'
  | 'religious_space'
  | 'legal_aid_office'
  | 'medical_facility'
  | 'private_residence'
  | 'public_space'
  | 'other';

/**
 * Safe point location for emergency refuge during incidents.
 */
export interface SafePoint {
  /** Unique identifier */
  id: string;
  
  /** Name of the safe point */
  name: string;
  
  /** Type of safe point */
  type: SafePointType;
  
  /** Address */
  address: string;
  
  /** Geographic coordinates */
  coordinates: Coordinates;
  
  /** Maximum capacity */
  capacity: number;
  
  /** Accessibility features */
  accessibility: {
    wheelchairAccessible: boolean;
    groundFloor: boolean;
    hasRestroom: boolean;
    publicTransportNearby: boolean;
  };
  
  /** Contact information (encrypted) */
  contact: {
    pseudonym: string;
    secureContact: string;
  };
  
  /** Whether formal access agreement exists */
  accessAgreement: boolean;
  
  /** Operating hours */
  hours?: string;
  
  /** Additional notes */
  notes?: string;
  
  /** Last verified date */
  lastVerified: string;
  
  /** Whether currently available */
  available: boolean;
}

/**
 * Category of supply item.
 */
export type SupplyCategory =
  | 'medical'
  | 'legal_materials'
  | 'food'
  | 'water'
  | 'shelter'
  | 'hygiene'
  | 'communication'
  | 'safety';

/**
 * Supply item for incident response logistics.
 */
export interface SupplyItem {
  /** Item name */
  name: string;
  
  /** Category */
  category: SupplyCategory;
  
  /** Current quantity available */
  quantity: number;
  
  /** Unit of measurement */
  unit: string;
  
  /** Priority level for restocking */
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  /** Storage location */
  storageLocation?: string;
  
  /** Expiration date if applicable */
  expiresAt?: string;
  
  /** Notes */
  notes?: string;
}

/**
 * Contact tree entry for organized communication.
 */
export interface ContactTree {
  /** Contact name (pseudonym) */
  name: string;
  
  /** Role in the organization */
  role: UserRole;
  
  /** Phone number (Signal/secure) */
  phone: string;
  
  /** Email address */
  email?: string;
  
  /** Priority level (1 = highest) */
  priority: 1 | 2 | 3 | 4 | 5;
  
  /** Availability schedule */
  availability: string;
  
  /** Response time commitment */
  responseTime?: string;
  
  /** Backup contact if unavailable */
  backupContact?: string;
}

// =============================================================================
// 6. CHECKLIST TYPES
// =============================================================================

/**
 * Emergency response phase for checklist organization.
 * Based on critical time windows for effective response.
 */
export type EmergencyPhase =
  | '0-5min'    // Immediate response, safety first
  | '5-20min'   // Initial stabilization
  | '20-45min'  // Legal and documentation
  | '45-60min'; // Sustained support and follow-up

/**
 * Category of checklist item.
 */
export type ChecklistCategory =
  | 'safety'
  | 'legal'
  | 'documentation'
  | 'medical'
  | 'communication'
  | 'logistics'
  | 'follow_up';

/**
 * Individual checklist item for incident response.
 */
export interface ChecklistItem {
  /** Unique identifier */
  id: string;
  
  /** Description of the action to complete */
  text: string;
  
  /** Whether the item is completed */
  completed: boolean;
  
  /** ISO 8601 timestamp when completed */
  timestamp?: string;
  
  /** Pseudonym of who completed the item */
  completedBy?: string;
  
  /** Category of the checklist item */
  category: ChecklistCategory;
  
  /** Time window during which this should be completed */
  timeWindow: EmergencyPhase;
  
  /** Whether completion is mandatory */
  mandatory: boolean;
  
  /** Prerequisites that must be completed first */
  prerequisites?: string[];
  
  /** Related documentation entry IDs */
  relatedDocumentation?: string[];
}

// =============================================================================
// 7. PROTOCOL TYPES
// =============================================================================

/**
 * Section within a response protocol.
 */
export interface ProtocolSection {
  /** Unique identifier */
  id: string;
  
  /** Section title */
  title: string;
  
  /** Content/description */
  content: string;
  
  /** Role responsible for this section */
  role: TeamRole | 'all';
  
  /** Emergency phase this belongs to */
  phase: EmergencyPhase;
  
  /** Order within the protocol */
  order: number;
  
  /** Whether this is a critical step */
  critical: boolean;
  
  /** Warning notes */
  warnings?: string[];
  
  /** Related resources */
  resources?: string[];
}

/**
 * PAS (Proteger-Avisar-Socorrer) protocol step.
 * Standard emergency response protocol.
 */
export interface PASStep {
  /** Step identifier */
  id: string;
  
  /** PAS phase */
  phase: 'proteger' | 'avisar' | 'socorrer';
  
  /** Order within phase */
  order: number;
  
  /** Action description */
  action: string;
  
  /** Detailed instructions */
  instructions: string[];
  
  /** Responsible role */
  responsible: TeamRole[];
  
  /** Estimated time to complete */
  estimatedTime: string;
  
  /** Safety warnings */
  safetyWarnings?: string[];
  
  /** Success criteria */
  successCriteria: string[];
}

/**
 * PAP (Primeros Auxilios Psicológicos) step.
 * Psychological First Aid protocol.
 */
export interface PAPStep {
  /** Step identifier */
  id: string;
  
  /** PAP phase (preparedness, response, recovery) */
  phase: 'preparedness' | 'response' | 'recovery';
  
  /** Order within protocol */
  order: number;
  
  /** Step name */
  name: string;
  
  /** Description of the intervention */
  description: string;
  
  /** Specific actions to take */
  actions: string[];
  
  /** Techniques to employ */
  techniques: string[];
  
  /** Things to avoid */
  avoid: string[];
  
  /** Indicators of success */
  indicators: string[];
  
  /** When to refer to professional help */
  referralCriteria?: string[];
}

// =============================================================================
// 8. UI STATE TYPES
// =============================================================================

/**
 * Extended app state interface with comprehensive UI state management.
 */
export interface ExtendedAppState {
  /** Currently logged in user */
  currentUser: ExtendedUserProfile | null;
  
  /** Currently active incident being viewed/managed */
  activeIncident: Incident | null;
  
  /** Whether the app is in offline mode */
  offlineMode: boolean;
  
  /** Whether encryption is enabled for sensitive data */
  encryptionEnabled: boolean;
  
  /** Current language/locale */
  language: 'es' | 'es-MX' | 'nah';  // Spanish, Mexican Spanish, Nahuatl
  
  /** Whether emergency mode is active */
  emergencyMode: boolean;
  
  /** Network connectivity status */
  networkStatus: 'online' | 'offline' | 'limited';
  
  /** Current sync status with server */
  syncStatus: 'synced' | 'syncing' | 'pending' | 'error';
  
  /** Last successful sync timestamp */
  lastSync?: string;
  
  /** Unread notifications count */
  unreadNotifications: number;
  
  /** Whether biometric authentication is required */
  biometricRequired: boolean;
  
  /** Current theme */
  theme: 'light' | 'dark' | 'system';
  
  /** Whether onboarding has been completed */
  onboardingCompleted: boolean;
  
  /** App version */
  version: string;
}

/**
 * Navigation state for tracking user location in the app.
 */
export interface NavigationState {
  /** Current main route */
  currentRoute: string;
  
  /** Current tab/page */
  currentTab: string;
  
  /** Navigation history for back button */
  history: string[];
  
  /** Whether back navigation is available */
  canGoBack: boolean;
  
  /** Current view parameters */
  params?: Record<string, string>;
  
  /** Scroll position for each route */
  scrollPositions: Record<string, number>;
}

/**
 * Modal state management.
 */
export interface ModalState {
  /** Whether any modal is open */
  isOpen: boolean;
  
  /** Type of modal currently open */
  modalType: 
    | 'emergency'
    | 'documentation'
    | 'legal_triage'
    | 'confirm'
    | 'alert'
    | 'form'
    | 'info'
    | null;
  
  /** Modal title */
  title?: string;
  
  /** Modal content/data */
  data?: unknown;
  
  /** Callback for confirmation */
  onConfirm?: () => void;
  
  /** Callback for cancellation */
  onCancel?: () => void;
  
  /** Whether modal can be dismissed */
  dismissible: boolean;
}

/**
 * Complete state interface combining all state types.
 */
export interface CompleteAppState extends ExtendedAppState {
  /** Navigation state */
  navigation: NavigationState;
  
  /** Modal state */
  modal: ModalState;
  
  /** Loading states for various operations */
  loadingStates: {
    incidents: boolean;
    documentation: boolean;
    user: boolean;
    resources: boolean;
    sync: boolean;
  };
  
  /** Error states */
  errors: {
    incidents?: string;
    documentation?: string;
    user?: string;
    resources?: string;
    sync?: string;
  };
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if a value is a valid TeamRole.
 */
export function isTeamRole(value: unknown): value is TeamRole {
  const validRoles: TeamRole[] = ['leader', 'security', 'medical', 'legal', 'dispatch', 'logistics'];
  return typeof value === 'string' && validRoles.includes(value as TeamRole);
}

/**
 * Type guard to check if a value is a valid EmergencyPhase.
 */
export function isEmergencyPhase(value: unknown): value is EmergencyPhase {
  const validPhases: EmergencyPhase[] = ['0-5min', '5-20min', '20-45min', '45-60min'];
  return typeof value === 'string' && validPhases.includes(value as EmergencyPhase);
}

/**
 * Type guard to check if a value is a valid ThreatLevel.
 */
export function isThreatLevel(value: unknown): value is ThreatLevel {
  const validLevels: ThreatLevel[] = ['low', 'moderate', 'high', 'critical', 'extreme'];
  return typeof value === 'string' && validLevels.includes(value as ThreatLevel);
}

/**
 * Type guard to check if a value is a valid CertificationLevel.
 */
export function isCertificationLevel(value: unknown): value is CertificationLevel {
  return typeof value === 'number' && [1, 2, 3].includes(value);
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Helper type for making certain fields optional.
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Helper type for making certain fields required.
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Helper type for API responses with pagination.
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Helper type for form field validation.
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Helper type for async operation states.
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// =============================================================================
// SUB-MODULE RE-EXPORTS
// Note: Types already defined locally (CertificationLevel, TrainingModule,
// SafePointType, SafePoint, SupplyItem, ChecklistItem, ContactTree)
// are NOT re-exported to avoid declaration conflicts.
// =============================================================================

export type {
  ContactCategory,
  ContactPriority,
  AvailabilityStatus,
  Contact,
  ContactTreeNode,
  CommunicationLog,
  MessageTemplate,
  QuickDialConfig
} from './contacts';

export {
  CONTACT_CATEGORIES,
  PRIORITY_LABELS
} from './contacts';

export type {
  TrainingModuleStatus,
  ContentType,
  ScenarioDifficulty,
  Lesson,
  Quiz,
  Question,
  Option,
  Checkpoint,
  Scenario,
  ScenarioStage,
  ScenarioOption,
  Certification,
  TrainingProgress,
  ModuleProgress,
  ScenarioProgress,
  Achievement
} from './training';

export {
  CERTIFICATION_LEVELS,
  MODULE_CATEGORIES,
  ACHIEVEMENTS
} from './training';

export type {
  SafePointStatus,
  ResourceCategory,
  ResourceLevel,
  AccessibilityFeature,
  ActivationRecord,
  SafePointHistoryEntry,
  SupplyChecklist,
  ResourceKit,
  KitContent,
  LogisticsRequest,
  RequestedItem,
  DonorInfo,
  DistributionLog,
  DistributionRecipient,
  DistributedItem
} from './resources';

export {
  SAFE_POINT_TYPES,
  RESOURCE_CATEGORIES,
  RESOURCE_LEVELS,
  ACCESSIBILITY_LABELS
} from './resources';

export type {
  FormType,
  FormStatus,
  FieldType,
  FormField,
  FormSection,
  FormTemplate,
  FormData,
  IncidentReportData,
  WitnessStatementData,
  ChainOfCustodyData,
  PASEvaluationData,
  LegalTriageData,
  Checklist60MinData
} from './forms';

export {
  FORM_TEMPLATES,
  ALCALDIAS,
  TEAM_ROLES,
  EVIDENCE_TYPES,
  AUTHORITY_TYPES,
  VIOLENCE_TYPES,
  LEGAL_ROUTES,
  PRIORITY_LEVELS,
  OCCUPANT_CATEGORIES
} from './forms';
