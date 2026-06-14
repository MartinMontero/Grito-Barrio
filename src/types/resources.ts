/**
 * Resources Types
 * Protocolo CDMX
 *
 * TypeScript definitions for safe points and resources management
 */

export type SafePointType =
  | "church"
  | "community_center"
  | "school"
  | "private"
  | "public"
  | "other";

export type SafePointStatus =
  | "active"
  | "inactive"
  | "pending"
  | "full"
  | "maintenance";

export type ResourceCategory =
  | "agua_alimentos" // Water and food
  | "primeros_auxilios" // First aid
  | "seguridad" // Security equipment
  | "documentacion" // Documentation supplies
  | "comunicaciones" // Communications
  | "wash" // Water, Sanitation, Hygiene
  | "transporte" // Transportation
  | "logistica"; // Logistics

export type ResourceLevel = "basico" | "medio" | "robusto"; // Basic, Medium, Robust

export type AccessibilityFeature =
  | "wheelchair_accessible"
  | "pet_friendly"
  | "family_friendly"
  | "gender_separated"
  | "quiet_space"
  | "medical_facilities"
  | "kitchen"
  | "showers"
  | "wifi"
  | "parking";

export interface SafePoint {
  id: string;
  name: string;
  type: SafePointType;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  alcaldia: string;
  colonia: string;

  // Capacity
  totalCapacity: number;
  currentOccupancy: number;
  availableSpots: number;

  // Contact
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  alternativeContact?: string;

  // Access
  accessAgreement: boolean;
  accessAgreementDate?: string;
  accessNotes?: string;
  hours: string;
  requiresAdvanceNotice: boolean;
  advanceNoticeHours?: number;

  // Amenities
  accessibility: AccessibilityFeature[];
  amenities: {
    water: boolean;
    food: boolean;
    medical: boolean;
    wash: boolean;
    wifi: boolean;
    kitchen: boolean;
    showers: boolean;
    parking: boolean;
  };

  // Status
  status: SafePointStatus;
  isActive: boolean;
  lastUpdated: string;
  activatedAt?: string;
  activationHistory: ActivationRecord[];

  // Notes
  notes?: string;
  restrictions?: string;
  history?: SafePointHistoryEntry[];
}

export interface ActivationRecord {
  id: string;
  timestamp: string;
  incidentId?: string;
  peopleCount: number;
  eta: string;
  needs: string[];
  status: "pending" | "confirmed" | "rejected" | "completed";
  confirmedBy?: string;
  confirmedAt?: string;
  notes?: string;
}

export interface SafePointHistoryEntry {
  id: string;
  timestamp: string;
  type: "activation" | "visit" | "inspection" | "update" | "note";
  description: string;
  userId?: string;
  userName?: string;
}

export interface SupplyItem {
  id: string;
  name: string;
  category: ResourceCategory;
  description?: string;

  // Inventory
  quantity: number;
  unit: string;
  minQuantity: number;
  idealQuantity: number;

  // Tracking
  location: string;
  storageLocation?: string;
  responsiblePerson?: string;

  // Dates
  expirationDate?: string;
  purchaseDate?: string;
  lastRestocked?: string;

  // Status
  status: "adequate" | "low" | "critical" | "expired";
  needsRestock: boolean;

  // Cost
  estimatedCost?: number;
  currency?: string;
}

export interface SupplyChecklist {
  id: string;
  name: string;
  description?: string;
  level: ResourceLevel;
  category?: ResourceCategory;
  items: ChecklistItem[];
  isDefault: boolean;
  isCustom: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  supplyItemId?: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  isOptional: boolean;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

export interface ResourceKit {
  id: string;
  name: string;
  level: ResourceLevel;
  description: string;
  category: ResourceCategory;
  contents: KitContent[];
  totalCost?: number;
  weight?: number; // kg
  volume?: string; // liters/dimensions
}

export interface KitContent {
  supplyItemId: string;
  quantity: number;
  notes?: string;
}

export interface LogisticsRequest {
  id: string;
  timestamp: string;
  requestType: "supply_request" | "donation" | "distribution";
  status: "pending" | "approved" | "fulfilled" | "rejected";

  // Requester
  requestedBy: string;
  requesterRole: string;
  incidentId?: string;

  // Items
  items: RequestedItem[];

  // Details
  priority: "low" | "medium" | "high" | "critical";
  justification: string;
  neededBy?: string;
  deliveryLocation?: string;

  // Fulfillment
  fulfilledBy?: string;
  fulfilledAt?: string;
  actualDeliveryLocation?: string;
  deliveryNotes?: string;

  // Transparency
  estimatedCost?: number;
  actualCost?: number;
  donorInfo?: DonorInfo;
}

export interface RequestedItem {
  supplyItemId: string;
  name: string;
  quantity: number;
  unit: string;
  fulfilledQuantity?: number;
  notes?: string;
}

export interface DonorInfo {
  name: string;
  type: "individual" | "organization" | "anonymous";
  contact?: string;
  taxId?: string;
  receiptRequired: boolean;
}

export interface DistributionLog {
  id: string;
  timestamp: string;
  distributionType: "incident_support" | "community_aid" | "coalition_share";
  distributedBy: string;
  incidentId?: string;

  // Recipients
  recipients: DistributionRecipient[];

  // Items
  items: DistributedItem[];

  // Location
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };

  // Documentation
  photos?: string[];
  signatures?: string[];
  notes?: string;
}

export interface DistributionRecipient {
  id: string;
  name: string;
  type: "individual" | "family" | "organization";
  contact?: string;
  peopleCount?: number;
  vulnerability?: string;
}

export interface DistributedItem {
  supplyItemId: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedValue?: number;
}

export const SAFE_POINT_TYPES: Record<
  SafePointType,
  { label: string; icon: string; color: string }
> = {
  church: { label: "Iglesia", icon: "Church", color: "bg-purple-500" },
  community_center: {
    label: "Centro Comunitario",
    icon: "Users",
    color: "bg-blue-500",
  },
  school: { label: "Escuela", icon: "School", color: "bg-green-500" },
  private: { label: "Privado", icon: "Home", color: "bg-orange-500" },
  public: { label: "Espacio Público", icon: "Building", color: "bg-gray-500" },
  other: { label: "Otro", icon: "MapPin", color: "bg-gray-400" },
};

export const RESOURCE_CATEGORIES: Record<
  ResourceCategory,
  { label: string; icon: string; color: string }
> = {
  agua_alimentos: {
    label: "Agua y Alimentos",
    icon: "Droplets",
    color: "bg-blue-500",
  },
  primeros_auxilios: {
    label: "Primeros Auxilios",
    icon: "Heart",
    color: "bg-red-500",
  },
  seguridad: {
    label: "Equipo de Seguridad",
    icon: "Shield",
    color: "bg-gray-700",
  },
  documentacion: {
    label: "Documentación",
    icon: "FileText",
    color: "bg-yellow-500",
  },
  comunicaciones: {
    label: "Comunicaciones",
    icon: "Radio",
    color: "bg-green-500",
  },
  wash: { label: "WASH", icon: "Droplets", color: "bg-cyan-500" },
  transporte: { label: "Transporte", icon: "Truck", color: "bg-orange-500" },
  logistica: { label: "Logística", icon: "Boxes", color: "bg-indigo-500" },
};

export const RESOURCE_LEVELS: Record<
  ResourceLevel,
  { label: string; description: string; capacity: string }
> = {
  basico: {
    label: "Básico",
    description: "2-5 personas",
    capacity: "2-5 personas",
  },
  medio: {
    label: "Medio",
    description: "10-30 personas",
    capacity: "10-30 personas",
  },
  robusto: {
    label: "Robusto",
    description: "Coalición completa",
    capacity: "30+ personas",
  },
};

export const ACCESSIBILITY_LABELS: Record<AccessibilityFeature, string> = {
  wheelchair_accessible: "Accesible para sillas de ruedas",
  pet_friendly: "Admite mascotas",
  family_friendly: "Amigable para familias",
  gender_separated: "Espacios separados por género",
  quiet_space: "Espacio tranquilo",
  medical_facilities: "Instalaciones médicas",
  kitchen: "Cocina disponible",
  showers: "Regaderas",
  wifi: "WiFi",
  parking: "Estacionamiento",
};
